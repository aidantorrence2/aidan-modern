import AppKit
import SwiftUI
import ServiceManagement

/// A borderless panel that can still take keyboard focus (so the reply box is typeable)
/// without activating the app or stealing the menu bar.
final class FloatingPanel: NSPanel {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }

    /// A click anywhere on the panel gives it the keyboard, so the reply box is typeable right away
    /// (a background accessory app's panel otherwise never receives key events).
    override func sendEvent(_ event: NSEvent) {
        if event.type == .leftMouseDown && !isKeyWindow {
            NSApp.activate(ignoringOtherApps: true)
            makeKey()
        }
        super.sendEvent(event)
    }
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
        panel.isMovable = true // only via the top bar (DragHandle); the cards keep their swipe
        let host = NSHostingView(rootView: PanelView(model: model))
        host.wantsLayer = true
        panel.contentView = host
        panel.setFrame(frame(), display: true)
        panel.orderFrontRegardless()

        // Remember where Aidan drags it.
        NotificationCenter.default.addObserver(forName: NSWindow.didMoveNotification, object: panel, queue: .main) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let o = self?.panel.frame.origin else { return }
                UserDefaults.standard.set([o.x, o.y], forKey: "panelOrigin")
            }
        }
        NotificationCenter.default.addObserver(forName: NSApplication.didChangeScreenParametersNotification, object: nil, queue: .main) { [weak self] _ in
            MainActor.assumeIsolated { self?.reposition() }
        }
        if ProcessInfo.processInfo.environment["ORCH_NO_LOGIN_ITEM"] == nil {
            try? SMAppService.mainApp.register() // start at login
        }
        installSwipeMonitor()
        model.start()
    }

    /// Trackpad: a mostly-horizontal two-finger swipe over a card slides it; letting go past the
    /// threshold dismisses it. Vertical scrolling is untouched.
    private var swipingId: String?
    private func installSwipeMonitor() {
        NSEvent.addLocalMonitorForEvents(matching: .scrollWheel) { [weak self] e in
            guard let self, e.window === self.panel else { return e }
            if !e.momentumPhase.isEmpty { return self.swipingId == nil ? e : nil } // ignore inertia after a swipe
            if e.phase == .began {
                let p = e.locationInWindow
                let top = CGPoint(x: p.x, y: (self.panel.contentView?.bounds.height ?? 0) - p.y)
                self.swipingId = abs(e.scrollingDeltaX) > abs(e.scrollingDeltaY) ? self.model.card(at: top) : nil
            }
            guard let id = self.swipingId else { return e }
            if e.phase == .changed || e.phase == .began {
                // Finger direction regardless of the natural-scrolling setting: negative = fingers moved left.
                let fingerDx = e.isDirectionInvertedFromDevice ? e.scrollingDeltaX : -e.scrollingDeltaX
                self.model.swipeMoved(id, by: fingerDx)
                return nil
            }
            if e.phase == .ended || e.phase == .cancelled {
                self.model.swipeEnded(id)
                self.swipingId = nil
                return nil
            }
            return e
        }
    }

    /// Middle of the left edge: 280 pt wide, the middle third of the screen's height.
    private func frame() -> NSRect {
        let screen = NSScreen.screens.first ?? NSScreen.main!
        let full = screen.frame
        let visible = screen.visibleFrame
        let h = (full.height / 3).rounded()
        let y = (full.midY - h / 2).rounded()
        // A dragged position wins as long as it's still on a connected screen.
        if let o = UserDefaults.standard.array(forKey: "panelOrigin") as? [Double], o.count == 2 {
            let r = NSRect(x: o[0], y: o[1], width: Self.width, height: h)
            if NSScreen.screens.contains(where: { $0.visibleFrame.intersects(r.insetBy(dx: 40, dy: 40)) }) { return r }
        }
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
