import Foundation

struct GitHubFile {
    let text: String
    let sha: String
    let etag: String?
}

enum GitHubError: LocalizedError {
    case noToken
    case badRepo
    case http(Int, String)
    case conflict(String)
    case decode(String)

    var errorDescription: String? {
        switch self {
        case .noToken: return "No GitHub token set (Settings)."
        case .badRepo: return "Repository must look like owner/name."
        case .http(let code, let msg): return "GitHub \(code): \(msg)"
        case .conflict(let msg): return "Conflict: \(msg)"
        case .decode(let msg): return "Bad response: \(msg)"
        }
    }
}

/// Minimal GitHub Contents API client: GET one file (with ETag), PUT it back with its sha.
struct GitHubClient {
    let token: String
    let repo: String
    let branch: String
    let path: String

    private var contentsURL: URL? {
        let parts = repo.split(separator: "/")
        guard parts.count == 2 else { return nil }
        let encodedPath = path.split(separator: "/")
            .map { $0.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? String($0) }
            .joined(separator: "/")
        return URL(string: "https://api.github.com/repos/\(parts[0])/\(parts[1])/contents/\(encodedPath)")
    }

    private func request(_ method: String, query: [URLQueryItem] = []) throws -> URLRequest {
        guard var components = contentsURL.flatMap({ URLComponents(url: $0, resolvingAgainstBaseURL: false) }) else {
            throw GitHubError.badRepo
        }
        if !query.isEmpty { components.queryItems = query }
        var r = URLRequest(url: components.url!)
        r.httpMethod = method
        r.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        r.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")
        r.setValue("2022-11-28", forHTTPHeaderField: "X-GitHub-Api-Version")
        r.setValue("approvals-menubar-app", forHTTPHeaderField: "User-Agent")
        r.cachePolicy = .reloadIgnoringLocalCacheData
        r.timeoutInterval = 30
        return r
    }

    private static func message(from data: Data, fallback: String) -> String {
        if let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let m = obj["message"] as? String { return m }
        return fallback
    }

    /// Returns nil when the file is unchanged (304 against `etag`).
    func fetch(etag: String?) async throws -> GitHubFile? {
        var r = try request("GET", query: [URLQueryItem(name: "ref", value: branch)])
        if let etag { r.setValue(etag, forHTTPHeaderField: "If-None-Match") }
        let (data, resp) = try await URLSession.shared.data(for: r)
        let http = resp as! HTTPURLResponse
        if http.statusCode == 304 { return nil }
        guard http.statusCode == 200 else {
            throw GitHubError.http(http.statusCode, Self.message(from: data, fallback: HTTPURLResponse.localizedString(forStatusCode: http.statusCode)))
        }
        guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let sha = obj["sha"] as? String,
              let b64 = obj["content"] as? String else {
            throw GitHubError.decode("missing sha/content")
        }
        let cleaned = b64.filter { !$0.isWhitespace }
        guard let raw = Data(base64Encoded: cleaned), let text = String(data: raw, encoding: .utf8) else {
            throw GitHubError.decode("content is not base64 UTF-8")
        }
        return GitHubFile(text: text, sha: sha, etag: http.value(forHTTPHeaderField: "ETag"))
    }

    /// Writes the file; returns the new blob sha. Throws `.conflict` when `sha` is stale.
    func put(text: String, sha: String, message: String) async throws -> String {
        var r = try request("PUT")
        r.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let body: [String: Any] = [
            "message": message,
            "content": Data(text.utf8).base64EncodedString(),
            "sha": sha,
            "branch": branch,
        ]
        r.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, resp) = try await URLSession.shared.data(for: r)
        let http = resp as! HTTPURLResponse
        if http.statusCode == 409 || http.statusCode == 422 {
            throw GitHubError.conflict(Self.message(from: data, fallback: "sha mismatch"))
        }
        guard (200...201).contains(http.statusCode) else {
            throw GitHubError.http(http.statusCode, Self.message(from: data, fallback: HTTPURLResponse.localizedString(forStatusCode: http.statusCode)))
        }
        guard let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let content = obj["content"] as? [String: Any],
              let newSha = content["sha"] as? String else {
            throw GitHubError.decode("missing content.sha in PUT response")
        }
        return newSha
    }
}
