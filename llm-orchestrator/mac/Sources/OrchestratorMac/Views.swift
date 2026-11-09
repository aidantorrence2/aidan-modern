import SwiftUI

enum Theme {
    static let bg = Color(red: 0.07, green: 0.07, blue: 0.08)
    static let card = Color(red: 0.12, green: 0.12, blue: 0.13)
    static let field = Color(red: 0.17, green: 0.17, blue: 0.18)
    static let line = Color.white.opacity(0.10)
    static let text = Color.white.opacity(0.92)
    static let muted = Color.white.opacity(0.50)
    static let accent = Color(red: 0.93, green: 0.76, blue: 0.40)
    static let good = Color(red: 0.45, green: 0.80, blue: 0.50)

    static func source(_ s: String) -> Color {
        switch s {
        case "chatgpt", "codex": return Color(red: 0.36, green: 0.75, blue: 0.60)
        case "claude-app", "claude-web", "claude": return Color(red: 0.85, green: 0.47, blue: 0.34)
        default: return Color(red: 0.85, green: 0.55, blue: 0.40)
        }
    }
}

struct PanelView: View {
    @ObservedObject var model: RelayModel

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                if !model.items.isEmpty {
                    Text("\(model.items.count)")
                        .font(.system(size: 10, weight: .bold))
                        .padding(.horizontal, 6).padding(.vertical, 1)
                        .background(Capsule().stroke(Theme.accent))
                        .foregroundStyle(Theme.accent)
                }
                Spacer()
                Circle().fill(model.connected ? Theme.good : Color.red.opacity(0.7)).frame(width: 7, height: 7)
                    .help(model.status + (model.bridges.isEmpty ? "" : "\n" + model.bridges))
            }
            if !model.connected || model.status.hasPrefix("Reply") || model.status.hasPrefix("Send") {
                Text(model.status).font(.system(size: 10)).foregroundStyle(Theme.muted).lineLimit(2)
            }
            if model.items.isEmpty {
                Spacer()
                Text("All caught up").font(.system(size: 12)).foregroundStyle(Theme.muted).frame(maxWidth: .infinity)
                Spacer()
            } else {
                ScrollView(.vertical, showsIndicators: false) {
                    LazyVStack(spacing: 6) {
                        ForEach(model.items) { c in
                            CardView(model: model, c: c)
                        }
                    }
                }
            }
        }
        .padding(8)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(RoundedRectangle(cornerRadius: 12).fill(Theme.bg))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Theme.line))
    }
}

struct CardView: View {
    @ObservedObject var model: RelayModel
    let c: Completion
    @State private var expanded = false

    // The box holds only what YOU type; the drafted reply is the placeholder and is what Send sends
    // when the box is empty.
    private var typed: Binding<String> {
        Binding(get: { model.drafts[c.id] ?? "" }, set: { model.drafts[c.id] = $0 })
    }
    private var hasTyped: Bool { !(model.drafts[c.id] ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Text(c.sourceLabel).font(.system(size: 9, weight: .bold)).foregroundStyle(Theme.source(c.source))
                Text(c.displayTitle)
                    .font(.system(size: 11, weight: .semibold)).foregroundStyle(Theme.text).fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 2)
                Text(ago(c.ts)).font(.system(size: 9)).foregroundStyle(Theme.muted)
            }
            // One line: what it did. One line: what it needs. Click either for the full answer.
            Group {
                Text(c.didLine).font(.system(size: 10.5)).foregroundStyle(Theme.text).fixedSize(horizontal: false, vertical: true)
                if !c.needs.isEmpty {
                    Text("→ " + c.needs).font(.system(size: 10.5)).foregroundStyle(Theme.accent).fixedSize(horizontal: false, vertical: true)
                }
                if expanded {
                    Text(c.text).font(.system(size: 10)).foregroundStyle(Theme.muted)
                        .frame(maxWidth: .infinity, alignment: .leading).textSelection(.enabled)
                }
            }
            .contentShape(Rectangle())
            .onTapGesture { expanded.toggle() }
            if !c.note.isEmpty {
                Text(c.note).font(.system(size: 9)).foregroundStyle(Color.orange.opacity(0.85)).lineLimit(2)
            }
            TextField(c.suggesting ? "Drafting a reply…" : (c.suggestion.isEmpty ? "Type a reply…" : c.suggestion), text: typed, axis: .vertical)
                .textFieldStyle(.plain)
                .font(.system(size: 10.5))
                .foregroundStyle(Theme.text)
                .lineLimit(1...5)
                .padding(6)
                .background(RoundedRectangle(cornerRadius: 7).fill(Theme.field))
                .onSubmit { model.send(c) }
            HStack(spacing: 4) {
                Button(action: { model.send(c) }) {
                    Text(c.replyMode == "none" ? "Copy & open" : (hasTyped || c.suggestion.isEmpty ? "Send" : "Send draft")).font(.system(size: 10, weight: .semibold))
                        .padding(.horizontal, 10).padding(.vertical, 3)
                        .background(Capsule().fill(Theme.accent)).foregroundStyle(Color.black)
                }.buttonStyle(.plain).keyboardShortcut(.return, modifiers: .command)
                pill(hasTyped ? "✨ Redraft" : "✨ Draft") { model.regenerate(c) }
                    .help("New draft; what you typed steers it")
                if !c.url.isEmpty { pill("Open") { model.open(c) } }
                Spacer()
                pill("✕") { model.dismiss(c) }
            }
        }
        .padding(7)
        .background(RoundedRectangle(cornerRadius: 9).fill(Theme.card))
        .background(GeometryReader { g in
            Color.clear
                .onAppear { model.cardFrames[c.id] = g.frame(in: .global) }
                .onChange(of: g.frame(in: .global)) { _, f in model.cardFrames[c.id] = f }
                .onDisappear { model.cardFrames[c.id] = nil }
        })
        .overlay(RoundedRectangle(cornerRadius: 9).stroke(model.flashId == c.id ? Theme.accent : Theme.line, lineWidth: model.flashId == c.id ? 1.5 : 1))
        .animation(.easeOut(duration: 0.3), value: model.flashId)
        .offset(x: model.swipe[c.id] ?? 0)
        .opacity(1 - min(0.7, Double(-(model.swipe[c.id] ?? 0)) / 280))
        .animation(.easeOut(duration: 0.15), value: model.swipe[c.id])
        .simultaneousGesture(
            DragGesture(minimumDistance: 14)
                .onChanged { v in
                    guard abs(v.translation.width) > abs(v.translation.height) * 1.5 else { return }
                    model.swipe[c.id] = min(0, v.translation.width)
                }
                .onEnded { _ in model.swipeEnded(c.id) }
        )
    }

    private func pill(_ label: String, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(label).font(.system(size: 10)).foregroundStyle(Theme.text)
                .padding(.horizontal, 8).padding(.vertical, 3)
                .background(Capsule().fill(Theme.field))
        }.buttonStyle(.plain)
    }

    private func ago(_ ts: Double) -> String {
        let s = Int(Date().timeIntervalSince1970 - ts / 1000)
        if s < 60 { return "now" }
        if s < 3600 { return "\(s / 60)m" }
        if s < 86400 { return "\(s / 3600)h" }
        return "\(s / 86400)d"
    }
}
