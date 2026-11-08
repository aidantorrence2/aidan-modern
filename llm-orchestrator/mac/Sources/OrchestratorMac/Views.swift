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
                Text("Orchestrator").font(.system(size: 13, weight: .semibold, design: .serif)).foregroundStyle(Theme.text)
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

    private var draft: Binding<String> {
        Binding(get: { model.draft(for: c) }, set: { model.drafts[c.id] = $0 })
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Text(c.sourceLabel).font(.system(size: 9, weight: .bold)).foregroundStyle(Theme.source(c.source))
                Text(c.title.isEmpty ? String(c.sessionId.prefix(12)) : c.title)
                    .font(.system(size: 11, weight: .semibold)).foregroundStyle(Theme.text).lineLimit(1)
                Spacer(minLength: 2)
                Text(ago(c.ts)).font(.system(size: 9)).foregroundStyle(Theme.muted)
            }
            if !c.prompt.isEmpty {
                Text("You: " + c.prompt.replacingOccurrences(of: "\n", with: " "))
                    .font(.system(size: 9)).foregroundStyle(Theme.muted).lineLimit(1)
            }
            Text(c.text.isEmpty ? "(no text in the completion)" : c.text)
                .font(.system(size: 10.5)).foregroundStyle(Theme.text)
                .lineLimit(expanded ? nil : 4)
                .frame(maxWidth: .infinity, alignment: .leading)
                .contentShape(Rectangle())
                .onTapGesture { expanded.toggle() }
            if !c.note.isEmpty {
                Text(c.note).font(.system(size: 9)).foregroundStyle(Color.orange.opacity(0.85)).lineLimit(2)
            }
            TextField(c.suggesting ? "Drafting a reply…" : "Reply…", text: draft, axis: .vertical)
                .textFieldStyle(.plain)
                .font(.system(size: 10.5))
                .foregroundStyle(Theme.text)
                .lineLimit(1...5)
                .padding(6)
                .background(RoundedRectangle(cornerRadius: 7).fill(Theme.field))
                .onSubmit { model.send(c) }
            if !c.alternatives.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 4) {
                        ForEach(c.alternatives, id: \.self) { a in
                            Text(a).font(.system(size: 9)).foregroundStyle(Theme.accent).lineLimit(1)
                                .padding(.horizontal, 7).padding(.vertical, 2)
                                .background(Capsule().stroke(Theme.accent.opacity(0.7)))
                                .onTapGesture { model.drafts[c.id] = a }
                        }
                    }
                }
            }
            HStack(spacing: 4) {
                Button(action: { model.send(c) }) {
                    Text(c.replyMode == "none" ? "Copy & open" : "Send").font(.system(size: 10, weight: .semibold))
                        .padding(.horizontal, 10).padding(.vertical, 3)
                        .background(Capsule().fill(Theme.accent)).foregroundStyle(Color.black)
                }.buttonStyle(.plain).keyboardShortcut(.return, modifiers: .command)
                pill("✨ Draft") { model.regenerate(c) }
                if !c.url.isEmpty { pill("Open") { model.open(c) } }
                Spacer()
                pill("✕") { model.dismiss(c) }
            }
        }
        .padding(7)
        .background(RoundedRectangle(cornerRadius: 9).fill(Theme.card))
        .overlay(RoundedRectangle(cornerRadius: 9).stroke(model.flashId == c.id ? Theme.accent : Theme.line, lineWidth: model.flashId == c.id ? 1.5 : 1))
        .animation(.easeOut(duration: 0.3), value: model.flashId)
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
