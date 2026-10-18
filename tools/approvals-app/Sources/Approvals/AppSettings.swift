import Foundation
import Combine

@MainActor
final class AppSettings: ObservableObject {
    static let shared = AppSettings()
    private let d = UserDefaults.standard

    @Published var repo: String { didSet { d.set(repo, forKey: "repo") } }
    @Published var branch: String { didSet { d.set(branch, forKey: "branch") } }
    @Published var path: String { didSet { d.set(path, forKey: "path") } }
    @Published var pollInterval: Double { didSet { d.set(pollInterval, forKey: "pollInterval") } }
    @Published var quietEnabled: Bool { didSet { d.set(quietEnabled, forKey: "quietEnabled") } }
    /// minutes after midnight, local time
    @Published var quietStart: Int { didSet { d.set(quietStart, forKey: "quietStart") } }
    @Published var quietEnd: Int { didSet { d.set(quietEnd, forKey: "quietEnd") } }
    @Published var playSound: Bool { didSet { d.set(playSound, forKey: "playSound") } }

    private init() {
        repo = d.string(forKey: "repo") ?? "aidantorrence2/aidan-modern"
        branch = d.string(forKey: "branch") ?? "ccr-d1938557-3pv196"
        path = d.string(forKey: "path") ?? "data/approvals.json"
        let interval = d.double(forKey: "pollInterval")
        pollInterval = interval >= 10 ? interval : 60
        quietEnabled = d.bool(forKey: "quietEnabled")
        quietStart = d.object(forKey: "quietStart") as? Int ?? 23 * 60
        quietEnd = d.object(forKey: "quietEnd") as? Int ?? 8 * 60
        playSound = d.object(forKey: "playSound") as? Bool ?? true
    }

    var isQuietNow: Bool {
        guard quietEnabled else { return false }
        let c = Calendar.current.dateComponents([.hour, .minute], from: Date())
        let now = (c.hour ?? 0) * 60 + (c.minute ?? 0)
        if quietStart == quietEnd { return false }
        if quietStart < quietEnd { return now >= quietStart && now < quietEnd }
        return now >= quietStart || now < quietEnd   // wraps midnight
    }
}
