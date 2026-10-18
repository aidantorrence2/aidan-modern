import Foundation
import Combine
import AppKit

/// Single source of truth: polls the queue file, diffs it, notifies, and writes decisions back.
@MainActor
final class ApprovalsStore: ObservableObject {
    static let shared = ApprovalsStore()

    @Published private(set) var items: [ApprovalItem] = []
    @Published private(set) var lastSync: Date?
    @Published private(set) var lastError: String?
    @Published private(set) var statusMessage: String?
    @Published private(set) var snoozedUntil: [String: Date] = [:]
    @Published private(set) var pendingDecisions: [String: LocalDecision] = [:]
    @Published private(set) var hasToken = false
    @Published private(set) var isSyncing = false

    let settings = AppSettings.shared
    let notifier = NotificationManager()

    private let defaults = UserDefaults.standard
    private var fileRoot: JSONValue?
    private var fileSHA: String?
    private var fileETag: String?
    private var seenIDs: Set<String> = []
    private var deferredNotify: Set<String> = []   // first seen during quiet hours
    private var pollTask: Task<Void, Never>?
    private var isFlushing = false
    private var holdFlush = false
    private var cancellables: Set<AnyCancellable> = []

    private init() {
        if let data = defaults.data(forKey: "pendingDecisions"),
           let d = try? JSONDecoder().decode([String: LocalDecision].self, from: data) { pendingDecisions = d }
        if let data = defaults.data(forKey: "snoozedUntil"),
           let d = try? JSONDecoder().decode([String: Date].self, from: data) { snoozedUntil = d }
        seenIDs = Set(defaults.stringArray(forKey: "seenIDs") ?? [])
        deferredNotify = Set(defaults.stringArray(forKey: "deferredNotify") ?? [])
        hasToken = Keychain.load() != nil
    }

    // MARK: lifecycle

    func bootstrap() {
        notifier.configure()
        notifier.onDecision = { [weak self] id, status in self?.decide(ids: [id], status: status, note: "") }
        notifier.onOpen = { [weak self] id in self?.openDetail(id) }
        settings.$pollInterval.dropFirst().removeDuplicates()
            .sink { [weak self] _ in self?.startPolling() }
            .store(in: &cancellables)
        settings.$repo.combineLatest(settings.$branch, settings.$path).dropFirst()
            .sink { [weak self] _, _, _ in self?.resetFileState() }
            .store(in: &cancellables)
    }

    func startPolling() {
        pollTask?.cancel()
        let interval = max(10, settings.pollInterval)
        pollTask = Task { [weak self] in
            while !Task.isCancelled {
                await self?.refresh()
                try? await Task.sleep(nanoseconds: UInt64(interval * 1_000_000_000))
            }
        }
    }

    func tokenChanged() {
        hasToken = Keychain.load() != nil
        resetFileState()
        startPolling()
    }

    private func resetFileState() {
        fileRoot = nil; fileSHA = nil; fileETag = nil
    }

    private func makeClient() -> GitHubClient? {
        guard let token = Keychain.load() else { hasToken = false; return nil }
        hasToken = true
        return GitHubClient(token: token, repo: settings.repo, branch: settings.branch, path: settings.path)
    }

    // MARK: derived

    var visibleItems: [ApprovalItem] {
        let now = Date()
        return items.filter { item in
            item.status == .pending && !item.isExpired && pendingDecisions[item.id] == nil
                && (snoozedUntil[item.id].map { $0 < now } ?? true)
        }
    }

    var pendingCount: Int { visibleItems.count }

    var snoozedCount: Int {
        let now = Date()
        return items.filter { $0.status == .pending && !$0.isExpired && (snoozedUntil[$0.id].map { $0 > now } ?? false) }.count
    }

    struct Group: Identifiable {
        let kind: String
        let items: [ApprovalItem]
        var id: String { kind }
    }

    var groups: [Group] {
        Dictionary(grouping: visibleItems, by: \.kind)
            .map { Group(kind: $0.key, items: $0.value) }
            .sorted { $0.kind < $1.kind }
    }

    func item(_ id: String) -> ApprovalItem? { items.first { $0.id == id } }

    // MARK: sync

    func refresh() async {
        guard !isSyncing else { return }
        isSyncing = true
        defer { isSyncing = false }
        guard let client = makeClient() else { lastError = GitHubError.noToken.localizedDescription; return }
        do {
            try await fetch(with: client)
            lastError = nil
            lastSync = Date()
            await notifyNewItems()
        } catch {
            lastError = error.localizedDescription
        }
        if !pendingDecisions.isEmpty { await flush() }
    }

    /// Reads the file from GitHub into memory. Honors ETag so unchanged polls are free.
    private func fetch(with client: GitHubClient, force: Bool = false) async throws {
        guard let file = try await client.fetch(etag: force ? nil : fileETag) else { return }
        let root = try JSONParser.parse(file.text)
        guard root["items"]?.arrayValue != nil else { throw GitHubError.decode("file has no items array") }
        fileRoot = root
        fileSHA = file.sha
        fileETag = file.etag
        rebuildItems()
    }

    private func rebuildItems() {
        guard let list = fileRoot?["items"]?.arrayValue else { return }
        items = list.compactMap(ApprovalItem.init(json:)).map { item in
            var item = item
            if let d = pendingDecisions[item.id] {
                item.status = ApprovalStatus(rawValue: d.status) ?? item.status
                item.decided = ISODate.parse(d.decided)
                item.note = d.note
            }
            return item
        }
        let gone = items.filter { $0.status != .pending || $0.isExpired }.map(\.id)
        notifier.remove(ids: gone)
    }

    private func notifyNewItems() async {
        let candidates = visibleItems
        let allIDs = Set(items.map(\.id))
        for item in candidates where !seenIDs.contains(item.id) {
            seenIDs.insert(item.id)
            if settings.isQuietNow { deferredNotify.insert(item.id) } else { await notifier.notify(item) }
        }
        if !settings.isQuietNow, !deferredNotify.isEmpty {
            for id in deferredNotify { if let item = candidates.first(where: { $0.id == id }) { await notifier.notify(item) } }
            deferredNotify.removeAll()
        }
        seenIDs.formIntersection(allIDs)
        deferredNotify.formIntersection(allIDs)
        defaults.set(Array(seenIDs), forKey: "seenIDs")
        defaults.set(Array(deferredNotify), forKey: "deferredNotify")
    }

    // MARK: decisions

    func decide(ids: [String], status: ApprovalStatus, note: String) {
        let stamp = ISODate.format(Date())
        for id in ids {
            pendingDecisions[id] = LocalDecision(status: status.rawValue, decided: stamp, note: note)
            if let i = items.firstIndex(where: { $0.id == id }) {
                items[i].status = status
                items[i].decided = Date()
                items[i].note = note
            }
        }
        persistDecisions()
        notifier.remove(ids: ids)
        statusMessage = "Saving \(ids.count == 1 ? ids[0] : "\(ids.count) decisions")…"
        if !holdFlush { Task { await flush() } }
    }

    #if DEBUG
    /// Debug-only end-to-end check of the decide → PUT path that the notification buttons use.
    /// `Approvals --self-test-decide <id> <approved|denied|pending> [note] [--stale-sha <sha>]`
    /// Not compiled into release builds, so nothing on this Mac can approve through the app headlessly.
    func selfTest(args: [String]) async -> Int32 {
        guard let i = args.firstIndex(of: "--self-test-decide"), args.count > i + 2,
              let status = ApprovalStatus(rawValue: args[i + 2]) else {
            print("usage: --self-test-decide <id> <approved|denied|pending> [note] [--stale-sha <sha>]"); return 2
        }
        let id = args[i + 1]
        let note = args.count > i + 3 && !args[i + 3].hasPrefix("--") ? args[i + 3] : ""
        guard let client = makeClient() else { print("no token"); return 1 }
        do { try await fetch(with: client, force: true) } catch { print("fetch failed: \(error.localizedDescription)"); return 1 }
        guard let before = item(id) else { print("no item \(id)"); return 1 }
        print("before: \(id) status=\(before.status.rawValue) sha=\(fileSHA ?? "-")")
        if let s = args.firstIndex(of: "--stale-sha"), args.count > s + 1 {
            fileSHA = args[s + 1]
            print("forcing stale sha \(args[s + 1]) to exercise the 409 retry")
        }
        holdFlush = true
        decide(ids: [id], status: status, note: note)
        holdFlush = false
        await flush()
        if let err = lastError { print("FAILED: \(err)"); return 1 }
        print("ok: \(statusMessage ?? "") new sha=\(fileSHA ?? "-")")
        return 0
    }
    #endif

    func snooze(_ id: String, hours: Double = 4) {
        snoozedUntil[id] = Date().addingTimeInterval(hours * 3600)
        if let data = try? JSONEncoder().encode(snoozedUntil) { defaults.set(data, forKey: "snoozedUntil") }
        notifier.remove(ids: [id])
    }

    func clearSnoozes() {
        snoozedUntil = [:]
        defaults.removeObject(forKey: "snoozedUntil")
    }

    private func persistDecisions() {
        if let data = try? JSONEncoder().encode(pendingDecisions) { defaults.set(data, forKey: "pendingDecisions") }
    }

    /// Writes every pending local decision back to the file; retries once on a sha conflict.
    private func flush() async {
        guard !pendingDecisions.isEmpty, !isFlushing, let client = makeClient() else { return }
        isFlushing = true
        defer { isFlushing = false }
        do {
            if fileRoot == nil { try await fetch(with: client, force: true) }
            var attempt = 0
            while true {
                attempt += 1
                guard var root = fileRoot, let sha = fileSHA else { throw GitHubError.decode("no file loaded") }
                let applied = apply(pendingDecisions, to: &root)
                guard !applied.isEmpty else {
                    // Items vanished from the file; nothing to write.
                    pendingDecisions.removeAll(); persistDecisions(); rebuildItems(); return
                }
                let message = Self.commitMessage(for: applied)
                do {
                    let newSha = try await client.put(text: root.serialized() + "\n", sha: sha, message: message)
                    fileRoot = root
                    fileSHA = newSha
                    fileETag = nil
                    pendingDecisions.removeAll()
                    persistDecisions()
                    rebuildItems()
                    lastError = nil
                    statusMessage = "\(message) ✓"
                    notifier.confirm(message)
                    return
                } catch GitHubError.conflict where attempt == 1 {
                    try await fetch(with: client, force: true)
                }
            }
        } catch {
            lastError = error.localizedDescription
            statusMessage = "Decision kept locally; will retry next poll."
        }
    }

    /// Applies decisions to the JSON tree; returns the (id, decision) pairs that matched an item.
    private func apply(_ decisions: [String: LocalDecision], to root: inout JSONValue) -> [(String, LocalDecision)] {
        guard var list = root["items"]?.arrayValue else { return [] }
        var applied: [(String, LocalDecision)] = []
        for (idx, entry) in list.enumerated() {
            guard let id = entry["id"]?.stringValue, let d = decisions[id] else { continue }
            var e = entry
            e["status"] = .string(d.status)
            e["decided"] = d.status == ApprovalStatus.pending.rawValue ? .null : .string(d.decided)
            e["note"] = .string(d.note)
            list[idx] = e
            applied.append((id, d))
        }
        root["items"] = .array(list)
        return applied
    }

    static func commitMessage(for applied: [(String, LocalDecision)]) -> String {
        func verb(_ status: String) -> String {
            switch status { case "approved": return "Approve"; case "denied": return "Deny"; default: return "Reset" }
        }
        if applied.count == 1, let (id, d) = applied.first { return "\(verb(d.status)) \(id)" }
        let statuses = Set(applied.map { $0.1.status })
        let verb = statuses.count == 1 ? verb(statuses.first!) : "Decide"
        let ids = applied.map { statuses.count > 1 ? "\($0.1.status) \($0.0)" : $0.0 }
        return "\(verb) \(applied.count) items: \(ids.joined(separator: ", "))"
    }

    // MARK: windows

    func openDetail(_ id: String) {
        let title = item(id)?.title ?? id
        WindowHost.show(id: "detail", title: title, size: NSSize(width: 560, height: 720),
                        content: ItemDetailView(itemID: id).environmentObject(self))
    }

    func openSettings() {
        WindowHost.show(id: "settings", title: "Approvals Settings", size: NSSize(width: 480, height: 560),
                        content: SettingsView().environmentObject(self))
    }

    func testConnection() async -> String {
        guard let client = makeClient() else { return GitHubError.noToken.localizedDescription }
        do {
            guard let file = try await client.fetch(etag: nil) else { return "Unexpected 304" }
            let root = try JSONParser.parse(file.text)
            let n = root["items"]?.arrayValue?.count ?? 0
            return "OK: \(n) items, sha \(file.sha.prefix(7))"
        } catch {
            return error.localizedDescription
        }
    }
}
