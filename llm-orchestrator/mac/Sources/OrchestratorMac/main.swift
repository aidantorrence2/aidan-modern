import AppKit
import SwiftUI
import ServiceManagement

/// A borderless panel that can still take keyboard focus (so the reply box is typeable)
/// without activating the app or stealing the menu bar.
final class FloatingPanel: NSPanel {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }
}

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate {
    static let width: CGFloat = 280
    private var panel: FloatingPanel!
    private let model = RelayModel()

    func applicationDidFinishLaunching(_ note: Notification) {
        panel = FloatingPanel(contentRect: frame(), styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        panel.level = .floating
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = true
        panel.hidesOnDeactivate = false
        panel.isMovable = false
        panel.becomesKeyOnlyIfNeeded = true
        let host = NSHostingView(rootView: PanelView(model: model))
        host.wantsLayer = true
        panel.contentView = host
        panel.setFrame(frame(), display: true)
        panel.orderFrontRegardless()

        NotificationCenter.default.addObserver(forName: NSApplication.didChangeScreenParametersNotification, object: nil, queue: .main) { [weak self] _ in
            MainActor.assumeIsolated { self?.reposition() }
        }
        if ProcessInfo.processInfo.environment["ORCH_NO_LOGIN_ITEM"] == nil {
            try? SMAppService.mainApp.register() // start at login
        }
        model.start()
    }

    /// Middle of the left edge: 280 pt wide, the middle third of the screen's height.
    private func frame() -> NSRect {
        let screen = NSScreen.screens.first ?? NSScreen.main!
        let full = screen.frame
        let visible = screen.visibleFrame
        let h = (full.height / 3).rounded()
        let y = (full.midY - h / 2).rounded()
        return NSRect(x: visible.minX + 6, y: y, width: Self.width, height: h)
    }

    private func reposition() { panel.setFrame(frame(), display: true) }
}

MainActor.assumeIsolated {
    let app = NSApplication.shared
    let delegate = AppDelegate()
    app.delegate = delegate
    app.setActivationPolicy(.accessory)
    app.run()
}
