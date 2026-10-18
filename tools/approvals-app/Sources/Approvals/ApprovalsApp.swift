import SwiftUI
import AppKit
import ServiceManagement

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
        if let i = CommandLine.arguments.firstIndex(of: "--render-cards"), CommandLine.arguments.count > i + 1 {
            let out = CommandLine.arguments[i + 1]
            Task { @MainActor in exit(await ApprovalsStore.shared.renderCards(to: out)) }
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
        CardPanelController.shared.start(store: store)
        store.startPolling()
        // Zero setup: start at login by default (once; turning it off in Settings sticks).
        let d = UserDefaults.standard
        if !d.bool(forKey: "didAutoRegisterLogin") {
            d.set(true, forKey: "didAutoRegisterLogin")
            try? SMAppService.mainApp.register()
        }
    }
}
