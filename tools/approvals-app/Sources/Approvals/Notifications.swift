import Foundation
import UserNotifications

/// Posts one notification per new pending item with Approve / Deny buttons and the preview image.
final class NotificationManager: NSObject, UNUserNotificationCenterDelegate {
    static let category = "APPROVAL"
    static let approveAction = "APPROVE"
    static let denyAction = "DENY"

    var onDecision: ((String, ApprovalStatus) -> Void)?
    var onOpen: ((String) -> Void)?

    /// UNUserNotificationCenter crashes outside an .app bundle (e.g. a bare debug binary).
    private var enabled: Bool { Bundle.main.bundleIdentifier != nil }
    private var center: UNUserNotificationCenter { UNUserNotificationCenter.current() }

    func configure() {
        guard enabled else { return }
        center.delegate = self
        let approve = UNNotificationAction(identifier: Self.approveAction, title: "Approve", options: [])
        let deny = UNNotificationAction(identifier: Self.denyAction, title: "Deny", options: [.destructive])
        let cat = UNNotificationCategory(identifier: Self.category, actions: [approve, deny],
                                         intentIdentifiers: [], options: [])
        center.setNotificationCategories([cat])
        center.requestAuthorization(options: [.alert, .sound, .badge]) { _, _ in }
    }

    func notify(_ item: ApprovalItem) async {
        guard enabled else { return }
        let content = UNMutableNotificationContent()
        content.title = item.title
        content.subtitle = "\(item.kind) · \(item.source)"
        content.body = item.summary
        content.categoryIdentifier = Self.category
        content.threadIdentifier = item.kind
        content.userInfo = ["id": item.id]
        content.sound = .default
        if let url = item.previewURL, let attachment = await downloadAttachment(url) {
            content.attachments = [attachment]
        }
        let request = UNNotificationRequest(identifier: Self.identifier(for: item.id), content: content, trigger: nil)
        let settings = await center.notificationSettings()
        do {
            try await center.add(request)
            Self.recordDiag("added \(item.id) attachments=\(content.attachments.count) auth=\(settings.authorizationStatus.rawValue) alertStyle=\(settings.alertStyle.rawValue)")
        } catch {
            Self.recordDiag("failed \(item.id): \(error.localizedDescription) auth=\(settings.authorizationStatus.rawValue)")
        }
    }

    /// Last notification outcome, readable with `defaults read com.aidantorrence.approvals diag.lastNotify`.
    static func recordDiag(_ text: String) {
        UserDefaults.standard.set("\(ISODate.format(Date())) \(text)", forKey: "diag.lastNotify")
    }

    func confirm(_ text: String) {
        guard enabled else { return }
        let content = UNMutableNotificationContent()
        content.title = "Approvals"
        content.body = text
        let request = UNNotificationRequest(identifier: "confirm-\(UUID().uuidString)", content: content, trigger: nil)
        center.add(request)
    }

    func remove(ids: [String]) {
        guard enabled else { return }
        let identifiers = ids.map(Self.identifier(for:))
        center.removeDeliveredNotifications(withIdentifiers: identifiers)
        center.removePendingNotificationRequests(withIdentifiers: identifiers)
    }

    private static func identifier(for id: String) -> String { "item-\(id)" }

    private func downloadAttachment(_ url: URL) async -> UNNotificationAttachment? {
        guard let (data, resp) = try? await URLSession.shared.data(from: url),
              (resp as? HTTPURLResponse)?.statusCode == 200, !data.isEmpty else { return nil }
        let ext = url.pathExtension.isEmpty ? "png" : url.pathExtension
        let file = FileManager.default.temporaryDirectory
            .appendingPathComponent("approvals-\(UUID().uuidString).\(ext)")
        guard (try? data.write(to: file)) != nil else { return nil }
        return try? UNNotificationAttachment(identifier: "preview", url: file, options: nil)
    }

    // MARK: UNUserNotificationCenterDelegate

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .list, .sound])
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter,
                                didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        let id = response.notification.request.content.userInfo["id"] as? String
        let action = response.actionIdentifier
        DispatchQueue.main.async { [self] in
            guard let id else { return }
            switch action {
            case Self.approveAction: onDecision?(id, .approved)
            case Self.denyAction: onDecision?(id, .denied)
            case UNNotificationDefaultActionIdentifier: onOpen?(id)
            default: break
            }
        }
        completionHandler()
    }
}
