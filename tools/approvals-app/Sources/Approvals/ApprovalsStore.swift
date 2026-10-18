import Foundation
import Combine
import AppKit
import SwiftUI

/// Single source of truth: polls the queue file, decides which cards to show, writes decisions back.
@MainActor
final class ApprovalsStore: ObservableObject {
    static let shared = ApprovalsStore()

    @Published private(set) var items: [ApprovalItem] = []
    @Published private(set) var lastSync: Date?
    @Published private(set) var lastError: String?
    @Published private(set) var statusMessage: String?
    @Published private(set) var snoozedUntil: [String: Date] = [:]
    @Published private(set) var dismissed: Set<String> = []
    @Published private(set) var pendingDecisions: [String: LocalDecision] = [:]
    @Published private(set) var hasToken = false
    @Published private(set) var isSyncing = false
    @Published private(set) var toast: Toast?
    /// Bumped every poll so time-based state (snooze end, expiry, quiet hours) re-evaluates.
    @Published private(set) var tick = 0

    struct Toast: Equatable, Identifiable {
        let id = UUID()
        let text: String
        let ok: Bool
    }

    let settings = AppSettings.shared

    private let defaults = UserDefaults.standard
    private var fileRoot: JSONValue?
    private var fileSHA: String?
    private var fileETag: String?
    private var chimedIDs: Set<String> = []        // items we already played the arrival sound for
    private var pollTask: Task<Void, Never>?
    private var toastTask: Task<Void, Never>?
    private var isFlushing = false
    private var holdFlush = false
    private var triedGHRefresh = false
    private var cancellables: Set<AnyCancellable> = []

    private init() {
        if let data = defaults.data(forKey: "pendingDecisions"),
           let d = try? JSONDecoder().decode([String: LocalDecision].self, from: data) { pendingDecisions = d }
        if let data = defaults.data(forKey: "snoozedUntil"),
           let d = try? JSONDecoder().decode([String: Date].self, from: data) { snoozedUntil = d }
        dismissed = Set(defaults.stringArray(forKey: "dismissedCards") ?? [])
        chimedIDs = Set(defaults.stringArray(forKey: "chimedIDs") ?? [])
        hasToken = Keychain.load() != nil
    }

    // MARK: lifecycle

    func bootstrap() {
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

    /// Uses the Keychain token; if there is none, takes the GitHub CLI's token (no setup needed).
    private func makeClient() -> GitHubClient? {
        if Keychain.load() == nil, let t = GHCLI.token() { try? Keychain.save(t) }
        guard let token = Keychain.load() else { hasToken = false; return nil }
        hasToken = true
        return GitHubClient(token: token, repo: settings.repo, branch: settings.branch, path: settings.path)
    }

    // MARK: derived

    var visibleItems: [ApprovalItem] {
        _ = tick
        let now = Date()
        return items.filter { item in
            item.status == .pending && !item.isExpired && pendingDecisions[item.id] == nil
                && (snoozedUntil[item.id].map { $0 < now } ?? true)
        }
    }

    /// Items that get a floating card: visible, not dismissed, not during quiet hours. Oldest first.
    var cardItems: [ApprovalItem] {
        guard !settings.isQuietNow else { return [] }
        return visibleItems.filter { !dismissed.contains($0.id) }
            .sorted { ($0.created ?? .distantPast) < ($1.created ?? .distantPast) }
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
            triedGHRefresh = false
        } catch GitHubError.http(401, _) where !triedGHRefresh {
            // Stored token was revoked or expired: take a fresh one from the GitHub CLI and retry next poll.
            triedGHRefresh = true
            if let t = GHCLI.token() { try? Keychain.save(t); resetFileState() }
            lastError = "GitHub token rejected; refreshed from gh CLI."
        } catch {
            lastError = error.localizedDescription
        }
        tick += 1
        chimeForNewItems()
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
        let all = Set(items.map(\.id))
        if !dismissed.isSubset(of: all) { dismissed.formIntersection(all); persistDismissed() }
    }

    /// Plays one soft sound when cards for never-seen items appear.
    private func chimeForNewItems() {
        let fresh = cardItems.filter { !chimedIDs.contains($0.id) }
        guard !fresh.isEmpty else { return }
        chimedIDs.formUnion(fresh.map(\.id))
        chimedIDs.formIntersection(Set(items.map(\.id)))
        defaults.set(Array(chimedIDs), forKey: "chimedIDs")
        if settings.playSound { NSSound(named: "Glass")?.play() }
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
        statusMessage = "Saving \(ids.count == 1 ? ids[0] : "\(ids.count) decisions")…"
        if !holdFlush { Task { await flush() } }
    }

    func snooze(_ id: String, hours: Double = 4) {
        snoozedUntil[id] = Date().addingTimeInterval(hours * 3600)
        if let data = try? JSONEncoder().encode(snoozedUntil) { defaults.set(data, forKey: "snoozedUntil") }
        showToast("Snoozed for \(Int(hours)) hours", ok: true)
    }

    /// Hides the card; the item stays in the menu-bar list until decided.
    func dismissCard(_ ids: [String]) {
        dismissed.formUnion(ids)
        persistDismissed()
    }

    func showAllCards() {
        dismissed.removeAll()
        persistDismissed()
    }

    func clearSnoozes() {
        snoozedUntil = [:]
        defaults.removeObject(forKey: "snoozedUntil")
    }

    private func persistDecisions() {
        if let data = try? JSONEncoder().encode(pendingDecisions) { defaults.set(data, forKey: "pendingDecisions") }
    }

    private func persistDismissed() {
        defaults.set(Array(dismissed), forKey: "dismissedCards")
    }

    func showToast(_ text: String, ok: Bool) {
        toast = Toast(text: text, ok: ok)
        toastTask?.cancel()
        toastTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: 3_500_000_000)
            if !Task.isCancelled { self?.toast = nil }
        }
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
                    // Items vanished from the file or were already decided elsewhere; nothing to write.
                    pendingDecisions.removeAll(); persistDecisions(); rebuildItems()
                    if let (id, st) = alreadyDecided.first { showToast("\(id) was already \(st) elsewhere; left as is", ok: false) }
                    return
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
                    showToast(message, ok: true)
                    return
                } catch GitHubError.conflict where attempt == 1 {
                    try await fetch(with: client, force: true)
                }
            }
        } catch {
            lastError = error.localizedDescription
            statusMessage = "Decision kept locally; will retry next poll."
            showToast("Saved on this Mac; will retry next poll", ok: false)
        }
    }

    /// Items skipped by the last apply because someone already decided them (id -> their status).
    private var alreadyDecided: [String: String] = [:]

    /// Applies decisions to the JSON tree; returns the (id, decision) pairs that matched an item.
    /// First decision wins: an item another device or person already decided is left untouched.
    private func apply(_ decisions: [String: LocalDecision], to root: inout JSONValue) -> [(String, LocalDecision)] {
        guard var list = root["items"]?.arrayValue else { return [] }
        var applied: [(String, LocalDecision)] = []
        alreadyDecided = [:]
        for (idx, entry) in list.enumerated() {
            guard let id = entry["id"]?.stringValue, let d = decisions[id] else { continue }
            let current = entry["status"]?.stringValue ?? "pending"
            if current != "pending" && d.status != ApprovalStatus.pending.rawValue {
                alreadyDecided[id] = current
                continue
            }
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
        WindowHost.show(id: "detail", title: title, size: NSSize(width: 900, height: 680),
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

    #if DEBUG
    /// Debug-only: fetch the live queue and render the card stack to a PNG (images show as placeholders).
    func renderCards(to path: String) async -> Int32 {
        guard let client = makeClient() else { print("no token"); return 1 }
        do { try await fetch(with: client, force: true) } catch { print("fetch failed: \(error)"); return 1 }
        await ImageCache.shared.prefetch(cardItems.prefix(3).flatMap { Presentation($0).images.map(\.url) })
        if let first = cardItems.first {
            let detail = ItemDetailView(itemID: first.id, flatForRender: true).environmentObject(self).frame(width: 900, height: 680)
                .background(Color(nsColor: .windowBackgroundColor))
            let r = ImageRenderer(content: detail); r.scale = 2
            if let img = r.nsImage, let tiff = img.tiffRepresentation,
               let png = NSBitmapImageRep(data: tiff)?.representation(using: .png, properties: [:]) {
                try? png.write(to: URL(fileURLWithPath: path.replacingOccurrences(of: ".png", with: "-detail.png")))
            }
        }
        showToast("Approve post:travel-fee", ok: true)
        let view = CardStackView(onSize: { _ in }).environmentObject(self)
            .background(Color(red: 0.35, green: 0.42, blue: 0.38))
        let renderer = ImageRenderer(content: view)
        renderer.scale = 2
        guard let img = renderer.nsImage, let tiff = img.tiffRepresentation,
              let png = NSBitmapImageRep(data: tiff)?.representation(using: .png, properties: [:]) else { print("render failed"); return 1 }
        try? png.write(to: URL(fileURLWithPath: path))
        print("rendered \(cardItems.count) cards to \(path)")
        return 0
    }

    /// Debug-only end-to-end check of the decide → PUT path that the card buttons use.
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
}

/// Reads the token the GitHub CLI already has (`gh auth token`), so the app needs no setup.
enum GHCLI {
    static func token() -> String? {
        let candidates = ["/opt/homebrew/bin/gh", "/usr/local/bin/gh", "/usr/bin/gh"]
        guard let gh = candidates.first(where: { FileManager.default.isExecutableFile(atPath: $0) }) else { return nil }
        let p = Process()
        p.executableURL = URL(fileURLWithPath: gh)
        p.arguments = ["auth", "token"]
        let out = Pipe()
        p.standardOutput = out
        p.standardError = Pipe()
        do { try p.run() } catch { return nil }
        p.waitUntilExit()
        let text = String(decoding: out.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
            .trimmingCharacters(in: .whitespacesAndNewlines)
        return p.terminationStatus == 0 && !text.isEmpty ? text : nil
    }
}
