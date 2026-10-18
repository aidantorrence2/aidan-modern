import Foundation

enum ApprovalStatus: String {
    case pending, approved, denied
}

struct ApprovalItem: Identifiable, Equatable {
    let id: String
    let kind: String
    let source: String
    let title: String
    let summary: String
    let previewURL: URL?
    let payload: JSONValue
    let created: Date?
    let expires: Date?
    var status: ApprovalStatus
    var decided: Date?
    var note: String

    init?(json: JSONValue) {
        guard let id = json["id"]?.stringValue, !id.isEmpty else { return nil }
        self.id = id
        kind = json["kind"]?.stringValue ?? "other"
        source = json["source"]?.stringValue ?? "unknown"
        title = json["title"]?.stringValue ?? id
        summary = json["summary"]?.stringValue ?? ""
        previewURL = json["preview_url"]?.stringValue.flatMap { URL(string: $0) }
        payload = json["payload"] ?? .null
        created = json["created"]?.stringValue.flatMap(ISODate.parse)
        expires = json["expires"]?.stringValue.flatMap(ISODate.parse)
        status = ApprovalStatus(rawValue: json["status"]?.stringValue ?? "") ?? .pending
        decided = json["decided"]?.stringValue.flatMap(ISODate.parse)
        note = json["note"]?.stringValue ?? ""
    }

    var isExpired: Bool {
        guard let expires else { return false }
        return expires < Date()
    }

    var payloadPretty: String { payload.serialized() }
}

/// A decision made in the app that has not been written back to GitHub yet.
struct LocalDecision: Codable, Equatable {
    var status: String
    var decided: String
    var note: String
}

enum ISODate {
    private static let full: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime]
        return f
    }()
    private static let fractional: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()
    private static let minutes: DateFormatter = {
        // agents write "2026-10-18T19:49Z" (no seconds)
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = TimeZone(identifier: "UTC")
        f.dateFormat = "yyyy-MM-dd'T'HH:mmXXXXX"
        return f
    }()

    static func parse(_ s: String) -> Date? {
        full.date(from: s) ?? fractional.date(from: s) ?? minutes.date(from: s)
    }

    static func format(_ d: Date) -> String { full.string(from: d) }
}
