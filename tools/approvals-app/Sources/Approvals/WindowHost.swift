import SwiftUI
import AppKit

/// Plain NSWindows hosting SwiftUI views, so the app can open them from a notification click
/// or the menu-bar panel without a WindowGroup / openWindow environment.
@MainActor
enum WindowHost {
    private static var windows: [String: NSWindow] = [:]

    static func show<V: View>(id: String, title: String, size: NSSize, content: V) {
        let window: NSWindow
        if let existing = windows[id] {
            window = existing
            window.setContentSize(size)
        } else {
            window = NSWindow(contentRect: NSRect(origin: .zero, size: size),
                              styleMask: [.titled, .closable, .miniaturizable, .resizable],
                              backing: .buffered, defer: false)
            window.isReleasedWhenClosed = false
            window.center()
            windows[id] = window
        }
        window.title = title
        window.contentView = NSHostingView(rootView: content)
        NSApp.activate(ignoringOtherApps: true)
        window.makeKeyAndOrderFront(nil)
    }

    static func close(id: String) {
        windows[id]?.orderOut(nil)
    }
}
