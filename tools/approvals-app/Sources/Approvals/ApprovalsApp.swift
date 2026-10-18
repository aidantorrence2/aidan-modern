import SwiftUI
import AppKit
import UserNotifications

@main
enum Entry {
    @MainActor static func main() {
        // `Approvals --set-token` reads a token from stdin and stores it in the Keychain (never printed).
        if CommandLine.arguments.contains("--set-token") {
            let token = readLine(strippingNewline: true)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
            guard !token.isEmpty else { FileHandle.standardError.write(Data("no token on stdin\n".utf8)); exit(1) }
            do { try Keychain.save(token); print("Token saved to Keychain.") }
            catch { FileHandle.standardError.write(Data("\(error.localizedDescription)\n".utf8)); exit(1) }
            return
        }
        #if DEBUG
        if CommandLine.arguments.contains("--list-delivered") {
            // Debug-only: list notifications Notification Center currently holds for this bundle id.
            UNUserNotificationCenter.current().getDeliveredNotifications { list in
                print("delivered: \(list.count)")
                for n in list { print("  \(n.request.identifier) | \(n.request.content.title) | actions=\(n.request.content.categoryIdentifier) | attachments=\(n.request.content.attachments.count)") }
                exit(0)
            }
            RunLoop.main.run()
        }
        if CommandLine.arguments.contains("--self-test-decide") {
            Task { @MainActor in exit(await ApprovalsStore.shared.selfTest(args: CommandLine.arguments)) }
            RunLoop.main.run()
        }
        #endif
        ApprovalsApp.main()
    }
}

struct ApprovalsApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate
    @StateObject private var store = ApprovalsStore.shared

    var body: some Scene {
        MenuBarExtra {
            MenuView().environmentObject(store)
        } label: {
            Image(systemName: store.pendingCount > 0 ? "checkmark.seal.fill" : "checkmark.seal")
            if store.pendingCount > 0 { Text("\(store.pendingCount)") }
        }
        .menuBarExtraStyle(.window)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationWillFinishLaunching(_ notification: Notification) {
        ApprovalsStore.shared.bootstrap()
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        let store = ApprovalsStore.shared
        store.startPolling()
        if !store.hasToken { store.openSettings() }
    }
}
