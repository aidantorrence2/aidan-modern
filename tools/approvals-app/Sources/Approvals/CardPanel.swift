import SwiftUI
import AppKit
import Combine

/// The app's own notification surface: a borderless, non-activating panel pinned to the top-right
/// corner on every Space (including over full-screen apps). Cards stay until you act on them.
@MainActor
final class CardPanelController {
    static let shared = CardPanelController()

    private var panel: NSPanel?
    private var hosting: NSHostingView<AnyView>?
    private var cancellables: Set<AnyCancellable> = []
    private let width: CGFloat = 384
    private let margin: CGFloat = 12

    func start(store: ApprovalsStore) {
        let panel = KeyablePanel(contentRect: NSRect(x: 0, y: 0, width: width, height: 10),
                                 styleMask: [.borderless, .nonactivatingPanel],
                                 backing: .buffered, defer: false)
        panel.isFloatingPanel = true
        panel.level = .statusBar
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary, .ignoresCycle]
        panel.backgroundColor = .clear
        panel.isOpaque = false
        panel.hasShadow = false
        panel.hidesOnDeactivate = false
        panel.isMovableByWindowBackground = false
        panel.becomesKeyOnlyIfNeeded = true
        panel.isReleasedWhenClosed = false

        let root = CardStackView(onSize: { [weak self] size in self?.resize(to: size) })
            .environmentObject(store)
        let hosting = NSHostingView(rootView: AnyView(root))
        hosting.frame = NSRect(x: 0, y: 0, width: width, height: 10)
        panel.contentView = hosting
        self.panel = panel
        self.hosting = hosting

        // Show/hide with content; re-anchor when screens change.
        store.objectWillChange
            .receive(on: RunLoop.main)
            .sink { [weak self] _ in DispatchQueue.main.async { self?.updateVisibility(store) } }
            .store(in: &cancellables)
        NotificationCenter.default.publisher(for: NSApplication.didChangeScreenParametersNotification)
            .sink { [weak self] _ in self?.reposition() }
            .store(in: &cancellables)
        updateVisibility(store)
    }

    private func updateVisibility(_ store: ApprovalsStore) {
        guard let panel else { return }
        let hasContent = !store.cardItems.isEmpty || store.toast != nil
        if hasContent, !panel.isVisible {
            reposition()
            panel.orderFrontRegardless()
        } else if !hasContent, panel.isVisible {
            panel.orderOut(nil)
        }
    }

    private func resize(to size: CGSize) {
        guard let panel, size.height > 0 else { return }
        var frame = panel.frame
        frame.size = NSSize(width: width, height: ceil(size.height))
        panel.setFrame(frame, display: true)
        reposition()
    }

    private func reposition() {
        guard let panel else { return }
        let screen = NSScreen.main ?? NSScreen.screens.first
        guard let visible = screen?.visibleFrame else { return }
        let h = panel.frame.height
        panel.setFrameOrigin(NSPoint(x: visible.maxX - width - margin, y: visible.maxY - h - margin))
    }
}

/// Lets buttons inside the panel take the first click without activating the app.
final class KeyablePanel: NSPanel {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }
}

// MARK: - SwiftUI

private struct SizeKey: PreferenceKey {
    static var defaultValue: CGSize = .zero
    static func reduce(value: inout CGSize, nextValue: () -> CGSize) { value = nextValue() }
}

struct CardStackView: View {
    @EnvironmentObject var store: ApprovalsStore
    let onSize: (CGSize) -> Void
    private let maxCards = 3

    var body: some View {
        let cards = store.cardItems
        VStack(alignment: .trailing, spacing: 8) {
            if let toast = store.toast {
                ToastView(toast: toast).transition(.move(edge: .top).combined(with: .opacity))
            }
            ForEach(cards.prefix(maxCards)) { item in
                ApprovalCard(item: item)
                    .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                            removal: .opacity.combined(with: .scale(scale: 0.95))))
            }
            if cards.count > maxCards {
                MoreCard(remaining: Array(cards.dropFirst(maxCards)))
            }
        }
        .padding(10)            // room for shadows inside the borderless panel
        .frame(width: 384, alignment: .topTrailing)
        .fixedSize(horizontal: false, vertical: true)
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: cards.map(\.id))
        .animation(.easeInOut(duration: 0.2), value: store.toast)
        .background(GeometryReader { g in Color.clear.preference(key: SizeKey.self, value: g.size) })
        .onPreferenceChange(SizeKey.self) { onSize($0) }
    }
}

enum KindStyle {
    static func color(_ kind: String) -> Color {
        switch kind {
        case "post": return Color(red: 0.62, green: 0.45, blue: 1.0)
        case "email": return Color(red: 0.30, green: 0.62, blue: 1.0)
        case "spend": return Color(red: 1.0, green: 0.62, blue: 0.20)
        case "build": return Color(red: 0.25, green: 0.80, blue: 0.70)
        default: return Color(white: 0.65)
        }
    }

    static func icon(_ kind: String) -> String {
        switch kind {
        case "post": return "photo.on.rectangle"
        case "email": return "envelope.fill"
        case "spend": return "creditcard.fill"
        case "build": return "hammer.fill"
        default: return "questionmark.circle.fill"
        }
    }
}

struct CardChrome: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(Color(red: 0.09, green: 0.09, blue: 0.10).opacity(0.96))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .strokeBorder(Color.white.opacity(0.09), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.35), radius: 10, y: 4)
    }
}

struct ApprovalCard: View {
    @EnvironmentObject var store: ApprovalsStore
    let item: ApprovalItem
    @State private var hovering = false

    var body: some View {
        let accent = KindStyle.color(item.kind)
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 6) {
                Label(item.kind.uppercased(), systemImage: KindStyle.icon(item.kind))
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(accent)
                Text(item.source)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(.white.opacity(0.55))
                    .lineLimit(1)
                Spacer(minLength: 4)
                if let c = item.created {
                    Text(Self.age(c)).font(.system(size: 10)).foregroundStyle(.white.opacity(0.4))
                }
                Button { store.dismissCard([item.id]) } label: {
                    Image(systemName: "xmark").font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.white.opacity(hovering ? 0.8 : 0.35))
                        .frame(width: 18, height: 18)
                        .background(Circle().fill(Color.white.opacity(hovering ? 0.12 : 0)))
                }
                .buttonStyle(.plain)
                .help("Hide this card (it stays in the menu bar list)")
            }

            HStack(alignment: .top, spacing: 10) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.title)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.white)
                        .lineLimit(2)
                    if !item.summary.isEmpty {
                        Text(item.summary)
                            .font(.system(size: 11.5))
                            .foregroundStyle(.white.opacity(0.7))
                            .lineLimit(3)
                    }
                }
                Spacer(minLength: 0)
                if let url = item.previewURL {
                    AsyncImage(url: url) { phase in
                        if case .success(let img) = phase {
                            img.resizable().scaledToFill()
                        } else {
                            Color.white.opacity(0.06)
                        }
                    }
                    .frame(width: 64, height: 64)
                    .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                }
            }
            .contentShape(Rectangle())
            .onTapGesture { store.openDetail(item.id) }

            HStack(spacing: 6) {
                CardButton(title: "Approve", systemImage: "checkmark", style: .primary) {
                    store.decide(ids: [item.id], status: .approved, note: "")
                }
                CardButton(title: "Deny", systemImage: "xmark", style: .danger) {
                    store.decide(ids: [item.id], status: .denied, note: "")
                }
                Spacer(minLength: 0)
                CardButton(title: "4h", systemImage: "moon.zzz", style: .quiet) { store.snooze(item.id) }
                    .help("Snooze for 4 hours")
                CardButton(title: "Details", systemImage: "arrow.up.right", style: .quiet) { store.openDetail(item.id) }
            }
        }
        .padding(14)
        .padding(.leading, 4)
        .overlay(alignment: .leading) {
            RoundedRectangle(cornerRadius: 2).fill(accent).frame(width: 3).padding(.vertical, 18).padding(.leading, 8)
        }
        .modifier(CardChrome())
        .onHover { hovering = $0 }
    }

    /// "now", "12m ago", "3h ago", "2d ago" — refreshed every poll via the store's tick.
    static func age(_ date: Date) -> String {
        let s = max(0, Date().timeIntervalSince(date))
        switch s {
        case ..<60: return "now"
        case ..<3600: return "\(Int(s / 60))m ago"
        case ..<86400: return "\(Int(s / 3600))h ago"
        default: return "\(Int(s / 86400))d ago"
        }
    }
}

struct CardButton: View {
    enum Style { case primary, danger, quiet }
    let title: String
    let systemImage: String
    let style: Style
    let action: () -> Void
    @State private var hovering = false

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .font(.system(size: 11.5, weight: style == .quiet ? .medium : .semibold))
                .labelStyle(.titleAndIcon)
                .padding(.horizontal, style == .quiet ? 8 : 12)
                .padding(.vertical, 6)
                .foregroundStyle(foreground)
                .background(Capsule().fill(background))
                .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .onHover { hovering = $0 }
    }

    private var foreground: Color {
        switch style {
        case .primary: return .black
        case .danger: return Color(red: 1.0, green: 0.45, blue: 0.42)
        case .quiet: return .white.opacity(0.7)
        }
    }

    private var background: Color {
        switch style {
        case .primary: return Color(red: 0.36, green: 0.89, blue: 0.55).opacity(hovering ? 1 : 0.92)
        case .danger: return Color(red: 1.0, green: 0.35, blue: 0.32).opacity(hovering ? 0.25 : 0.14)
        case .quiet: return Color.white.opacity(hovering ? 0.14 : 0.07)
        }
    }
}

struct MoreCard: View {
    @EnvironmentObject var store: ApprovalsStore
    let remaining: [ApprovalItem]

    var body: some View {
        HStack(spacing: 8) {
            Text("+\(remaining.count) more waiting")
                .font(.system(size: 11.5, weight: .medium))
                .foregroundStyle(.white.opacity(0.75))
            Spacer()
            CardButton(title: "Hide", systemImage: "eye.slash", style: .quiet) {
                store.dismissCard(store.cardItems.map(\.id))
            }
            .help("Hide all cards; items stay in the menu bar list")
        }
        .padding(.horizontal, 14).padding(.vertical, 10)
        .modifier(CardChrome())
    }
}

struct ToastView: View {
    let toast: ApprovalsStore.Toast
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: toast.ok ? "checkmark.circle.fill" : "exclamationmark.triangle.fill")
                .foregroundStyle(toast.ok ? Color(red: 0.36, green: 0.89, blue: 0.55) : .orange)
            Text(toast.text).font(.system(size: 12, weight: .medium)).foregroundStyle(.white).lineLimit(2)
        }
        .padding(.horizontal, 14).padding(.vertical, 10)
        .modifier(CardChrome())
    }
}
