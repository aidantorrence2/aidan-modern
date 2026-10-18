import SwiftUI
import AppKit

/// Turns an item's kind + payload into plain language: what happens if you approve, and the
/// exact content that goes out. Works for any payload; known field names just render nicer.
struct Presentation {
    let headline: String          // "Post to Instagram"
    let icon: String
    let consequence: String       // "If you approve, Claude (flywheel-code) publishes this ..."
    let displayTitle: String      // agent title without a redundant "Post:" prefix
    let images: [(label: String, url: URL)]
    let mainText: (label: String, text: String)?
    let links: [(label: String, url: URL)]
    let fields: [(label: String, value: String)]

    static let textKeys = ["caption", "body", "message", "text", "content", "description", "draft"]
    static let skipKeys: Set<String> = ["channel"]

    init(_ item: ApprovalItem) {
        let p = item.payload
        let agent = Self.agentName(item.source)
        let channel = p["channel"]?.stringValue.map(Self.pretty) ?? ""

        var images: [(String, URL)] = []
        var links: [(String, URL)] = []
        var fields: [(String, String)] = []
        var mainText: (String, String)?
        var seenURLs = Set<String>()

        if case .object(let members) = p {
            var mainKey: String?
            for key in Self.textKeys {
                if let m = members.first(where: { $0.key == key }), let s = m.value.stringValue, !s.isEmpty {
                    mainKey = key
                    mainText = (Self.label(key), s)
                    break
                }
            }
            for m in members where !Self.skipKeys.contains(m.key) && m.key != mainKey {
                switch m.value {
                case .string(let s):
                    if let url = URL(string: s), url.scheme?.hasPrefix("http") == true {
                        guard seenURLs.insert(s).inserted else { continue }
                        if Self.isImage(url) { images.append((Self.label(m.key), url)) } else { links.append((Self.label(m.key), url)) }
                    } else if !s.isEmpty {
                        fields.append((Self.label(m.key), s))
                    }
                case .null: continue
                case .object, .array: fields.append((Self.label(m.key), m.value.serialized()))
                case .number(let n): fields.append((Self.label(m.key), n))
                case .bool(let b): fields.append((Self.label(m.key), b ? "yes" : "no"))
                }
            }
        }
        if images.isEmpty, let u = item.previewURL { images.append(("Preview", u)) }

        let to = p["to"]?.stringValue
        let amount = p["amount"].flatMap { v -> String? in
            if case .number(let n) = v { return n }; return v.stringValue
        }
        switch item.kind {
        case "post":
            headline = channel.isEmpty ? "Publish a post" : "Post to \(channel)"
            icon = "photo.on.rectangle.angled"
            let where_ = channel.isEmpty ? "" : " on \(channel)"
            let story = p["story_image"] != nil ? " (feed and story)" : ""
            consequence = "If you approve, \(agent) publishes this image and caption\(where_)\(story)."
        case "email":
            headline = to.map { "Send email to \($0)" } ?? "Send an email"
            icon = "envelope.fill"
            consequence = "If you approve, \(agent) sends this email exactly as written."
        case "spend":
            headline = amount.map { "Spend \(p["currency"]?.stringValue ?? "$")\($0)" } ?? "Spend money"
            icon = "creditcard.fill"
            consequence = "If you approve, \(agent) makes this payment."
        case "build":
            headline = "Build / deploy"
            icon = "hammer.fill"
            consequence = "If you approve, \(agent) runs this build or deploy."
        default:
            headline = item.title
            icon = "questionmark.circle.fill"
            consequence = "If you approve, \(agent) goes ahead with what is described below."
        }

        displayTitle = Self.stripKindPrefix(item.title, kind: item.kind)
        self.images = images
        self.mainText = mainText
        self.links = links
        self.fields = fields.filter { f in
            // the headline already says who an email goes to / how much is spent
            !(item.kind == "email" && f.0 == "To") && !(item.kind == "spend" && (f.0 == "Amount" || f.0 == "Currency"))
        }
    }

    /// The text a card shows: the real outgoing text when there is one, else the agent's summary.
    /// URLs and "(link in bio)" are dropped here because the card shows the link on its own line;
    /// the review window shows the text verbatim.
    static func cardText(_ item: ApprovalItem, _ pres: Presentation) -> String {
        var t = pres.mainText?.text ?? item.summary
        t = t.replacingOccurrences(of: #"\(link in bio\)"#, with: "", options: [.regularExpression, .caseInsensitive])
        t = t.replacingOccurrences(of: #"(https?://)?[A-Za-z0-9.-]+\.(io|com|org|net|app|dev|co)(/\S*)?"#, with: "", options: .regularExpression)
        t = t.replacingOccurrences(of: #"\s{2,}"#, with: " ", options: .regularExpression)
        return t.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func agentName(_ source: String) -> String {
        let parts = source.split(separator: ":", maxSplits: 1).map(String.init)
        let base = pretty(parts.first ?? source)
        return parts.count > 1 ? "\(base) (\(parts[1]))" : base
    }

    static func pretty(_ s: String) -> String {
        switch s.lowercased() {
        case "instagram": return "Instagram"
        case "tiktok": return "TikTok"
        case "linkedin": return "LinkedIn"
        case "x", "twitter": return "X"
        case "claude": return "Claude"
        case "codex": return "Codex"
        default: return s.prefix(1).uppercased() + s.dropFirst()
        }
    }

    static func label(_ key: String) -> String {
        switch key {
        case "image": return "Feed image"
        case "story_image": return "Story image"
        case "link", "url": return "Link"
        default:
            let words = key.replacingOccurrences(of: "_", with: " ").replacingOccurrences(of: "-", with: " ")
            return words.prefix(1).uppercased() + words.dropFirst()
        }
    }

    static func isImage(_ url: URL) -> Bool {
        ["png", "jpg", "jpeg", "gif", "webp", "heic"].contains(url.pathExtension.lowercased())
    }

    static func stripKindPrefix(_ title: String, kind: String) -> String {
        let prefix = kind.lowercased() + ":"
        if title.lowercased().hasPrefix(prefix) {
            return String(title.dropFirst(prefix.count)).trimmingCharacters(in: .whitespaces)
        }
        return title
    }
}

// MARK: - Image cache (cards and detail share it; debug renders prefetch through it)

@MainActor
final class ImageCache: ObservableObject {
    static let shared = ImageCache()
    @Published private(set) var images: [URL: NSImage] = [:]
    private var loading: Set<URL> = []

    func load(_ url: URL) {
        guard images[url] == nil, !loading.contains(url) else { return }
        loading.insert(url)
        Task {
            defer { loading.remove(url) }
            guard let (data, resp) = try? await URLSession.shared.data(from: url),
                  (resp as? HTTPURLResponse)?.statusCode == 200, let img = NSImage(data: data) else { return }
            images[url] = img
        }
    }

    func prefetch(_ urls: [URL]) async {
        for url in urls where images[url] == nil {
            if let (data, _) = try? await URLSession.shared.data(from: url), let img = NSImage(data: data) { images[url] = img }
        }
    }
}

struct RemoteImage: View {
    let url: URL
    var contentMode: ContentMode = .fit
    @ObservedObject private var cache = ImageCache.shared

    var body: some View {
        Group {
            if let img = cache.images[url] {
                Image(nsImage: img).resizable().aspectRatio(contentMode: contentMode)
            } else {
                ZStack {
                    Color.gray.opacity(0.15)
                    ProgressView().controlSize(.small)
                }
            }
        }
        .onAppear { cache.load(url) }
    }
}
