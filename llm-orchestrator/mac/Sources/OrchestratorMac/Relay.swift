import Foundation
import AppKit

/// One finished turn from the relay (same JSON the phone app reads).
struct Completion: Identifiable, Equatable {
    let id: String
    var ts: Double
    var source: String
    var sessionId: String
    var title: String
    var prompt: String
    var text: String
    var url: String
    var status: String
    var replyMode: String
    var delivery: String
    var suggestion: String
    var alternatives: [String]
    var suggesting: Bool
    var note: String

    init(_ o: [String: Any]) {
        id = o["id"] as? String ?? UUID().uuidString
        ts = o["ts"] as? Double ?? Date().timeIntervalSince1970 * 1000
        source = o["source"] as? String ?? ""
        sessionId = o["sessionId"] as? String ?? ""
        title = o["title"] as? String ?? ""
        prompt = o["prompt"] as? String ?? ""
        text = o["text"] as? String ?? ""
        url = o["url"] as? String ?? ""
        status = o["status"] as? String ?? "new"
        replyMode = o["replyMode"] as? String ?? ""
        delivery = o["delivery"] as? String ?? ""
        let s = o["suggestion"] as? [String: Any]
        suggestion = s?["primary"] as? String ?? ""
        alternatives = (s?["alternatives"] as? [String]) ?? []
        suggesting = o["suggesting"] as? Bool ?? false
        if (o["delivery"] as? String) == "failed" {
            note = "Couldn't send automatically: \((o["deliveryError"] as? String ?? "").prefix(120))"
        } else { note = "" }
    }

    var sourceLabel: String {
        switch source {
        case "claude-code-cloud": return "Claude Code ☁︎"
        case "claude-code-rc": return "Claude Code 💻"
        case "claude-code-local", "claude-code": return "Claude Code (local)"
        case "codex": return "Codex"
        case "chatgpt": return "ChatGPT"
        case "claude-app", "claude-web", "claude": return "Claude"
        default: return source
        }
    }
}

/// ~/.config/llm-orchestrator/config.json, shared with the Mac bridge.
struct RelayConfig {
    var url: String
    var token: String

    static func load() -> RelayConfig? {
        let path = (NSHomeDirectory() as NSString).appendingPathComponent(".config/llm-orchestrator/config.json")
        guard let data = FileManager.default.contents(atPath: path),
              let o = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let url = o["relayUrl"] as? String, let token = o["token"] as? String else { return nil }
        return RelayConfig(url: url.trimmingCharacters(in: CharacterSet(charactersIn: "/")), token: token)
    }
}

@MainActor
final class RelayModel: ObservableObject {
    @Published var items: [Completion] = []      // unanswered, newest first
    @Published var status = "Connecting…"
    @Published var connected = false
    @Published var bridges = ""
    @Published var drafts: [String: String] = [:] // what the user typed, by item id
    @Published var flashId: String?

    private var all: [String: Completion] = [:]
    private var seq: Double = 0
    private var config: RelayConfig?
    private var loop: Task<Void, Never>?

    func start() {
        loop?.cancel()
        loop = Task { await syncLoop() }
    }

    private func request(_ method: String, _ path: String, body: [String: Any]? = nil, timeout: TimeInterval = 20) async throws -> [String: Any] {
        guard let cfg = config ?? RelayConfig.load() else { throw NSError(domain: "orch", code: 1, userInfo: [NSLocalizedDescriptionKey: "No ~/.config/llm-orchestrator/config.json"]) }
        config = cfg
        var req = URLRequest(url: URL(string: cfg.url + path)!, timeoutInterval: timeout)
        req.httpMethod = method
        req.setValue("Bearer \(cfg.token)", forHTTPHeaderField: "Authorization")
        if let body {
            req.setValue("application/json", forHTTPHeaderField: "content-type")
            req.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        let (data, resp) = try await URLSession.shared.data(for: req)
        let code = (resp as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(code) else {
            throw NSError(domain: "orch", code: code, userInfo: [NSLocalizedDescriptionKey: "Relay \(code)"])
        }
        return (try? JSONSerialization.jsonObject(with: data) as? [String: Any]) ?? [:]
    }

    private func syncLoop() async {
        var backoff: UInt64 = 2
        var first = true
        while !Task.isCancelled {
            do {
                let wait = first ? 0 : 25
                let r = try await request("GET", "/api/events?since=\(Int(seq))&wait=\(wait)", timeout: 40)
                let newSeq = r["seq"] as? Double ?? seq
                if newSeq < seq { seq = 0; all = [:]; continue } // relay restarted with fresh state
                apply(r, alert: !first)
                seq = newSeq
                first = false
                connected = true
                status = "Connected"
                backoff = 2
            } catch {
                connected = false
                status = "Relay offline: \(error.localizedDescription.prefix(50))"
                try? await Task.sleep(nanoseconds: backoff * 1_000_000_000)
                backoff = min(backoff * 2, 30)
            }
        }
    }

    private func apply(_ r: [String: Any], alert: Bool) {
        for o in (r["events"] as? [[String: Any]]) ?? [] {
            let c = Completion(o)
            let isNew = all[c.id] == nil && c.status == "new"
            all[c.id] = c
            if isNew && alert { flash(c.id) }
        }
        if let b = r["bridges"] as? [String: Any] {
            bridges = b.keys.sorted().map { host in
                let srcs = ((b[host] as? [String: Any])?["sources"] as? [String: Any]) ?? [:]
                let parts = srcs.keys.sorted().filter { $0 != "relay" }.map { k -> String in
                    let ok = ((srcs[k] as? [String: Any])?["ok"] as? Bool) ?? false
                    let name = k.replacingOccurrences(of: "-web", with: "").replacingOccurrences(of: "-files", with: "").replacingOccurrences(of: "-sessions", with: "")
                    return name + (ok ? " ✓" : " ✗")
                }
                return host + ": " + parts.joined(separator: " ")
            }.joined(separator: "  ")
        }
        // Keep the newest 40 unanswered; older ones stay on the relay.
        items = all.values.filter { $0.status == "new" }.sorted { $0.ts > $1.ts }.prefix(40).map { $0 }
        for id in drafts.keys where all[id]?.status != "new" { drafts[id] = nil }
    }

    private func flash(_ id: String) {
        flashId = id
        NSSound(named: "Tink")?.play()
        Task { try? await Task.sleep(nanoseconds: 2_500_000_000); if flashId == id { flashId = nil } }
    }

    func draft(for c: Completion) -> String { drafts[c.id] ?? c.suggestion }

    func send(_ c: Completion) {
        let text = draft(for: c).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        markLocally(c.id, status: "replied")
        Task {
            do {
                let r = try await request("POST", "/api/reply", body: ["eventId": c.id, "text": text])
                if (r["deliveredVia"] as? String) == "manual" || c.replyMode == "none" {
                    // Nothing on the Mac can post into this chat (ChatGPT's browser check, claude.ai):
                    // copy the reply and open the conversation so it's one paste away.
                    copyAndOpen(c, text)
                }
            } catch {
                markLocally(c.id, status: "new")
                status = "Send failed: \(error.localizedDescription.prefix(50))"
            }
        }
    }

    func dismiss(_ c: Completion) {
        markLocally(c.id, status: "dismissed")
        Task { _ = try? await request("POST", "/api/events/\(c.id)/dismiss", body: [:]) }
    }

    func regenerate(_ c: Completion) {
        let hint = (drafts[c.id].map { $0 == c.suggestion ? "" : $0 }) ?? ""
        drafts[c.id] = nil
        if var x = all[c.id] { x.suggesting = true; all[c.id] = x; refreshItems() }
        Task { _ = try? await request("POST", "/api/events/\(c.id)/suggest", body: ["hint": hint], timeout: 120) }
    }

    func open(_ c: Completion) {
        if let u = URL(string: c.url), !c.url.isEmpty { NSWorkspace.shared.open(u) }
    }

    private func copyAndOpen(_ c: Completion, _ text: String) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
        open(c)
        status = "Reply copied — paste it into the chat"
    }

    private func markLocally(_ id: String, status s: String) {
        guard var x = all[id] else { return }
        x.status = s
        all[id] = x
        refreshItems()
    }

    private func refreshItems() {
        items = all.values.filter { $0.status == "new" }.sorted { $0.ts > $1.ts }.prefix(40).map { $0 }
    }
}
