import SwiftUI
import AppKit

/// The review window: plain-language consequence, the real image and text that will go out,
/// links you can open, and Approve / Deny. Raw JSON only under "Technical details".
struct ItemDetailView: View {
    @EnvironmentObject var store: ApprovalsStore
    let itemID: String
    var flatForRender = false   // debug renders: ImageRenderer cannot draw ScrollView contents
    @State private var note = ""
    @State private var imageIndex = 0
    @State private var showRaw = false

    var body: some View {
        if let item = store.item(itemID) {
            let pres = Presentation(item)
            VStack(spacing: 0) {
                header(item, pres)
                Divider()
                HStack(alignment: .top, spacing: 0) {
                    if !pres.images.isEmpty {
                        imageColumn(pres)
                            .frame(width: 380)
                            .padding(20)
                        Divider()
                    }
                    Group {
                        if flatForRender {
                            contentColumn(item, pres).padding(20)
                        } else {
                            ScrollView { contentColumn(item, pres).padding(20) }
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
                .frame(maxHeight: .infinity)
                Divider()
                footer(item)
            }
            .frame(minWidth: pres.images.isEmpty ? 560 : 880, minHeight: 640)
        } else {
            Text("This request is no longer in the queue.")
                .font(.title3).foregroundStyle(.secondary)
                .frame(minWidth: 560, minHeight: 300)
        }
    }

    // MARK: sections

    private func header(_ item: ApprovalItem, _ pres: Presentation) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(pres.headline.uppercased(), systemImage: pres.icon)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(KindStyle.color(item.kind))
            Text(pres.displayTitle)
                .font(.system(size: 24, weight: .semibold))
            Text(pres.consequence)
                .font(.system(size: 14))
                .foregroundStyle(.secondary)
            HStack(spacing: 12) {
                if let c = item.created { Text("Asked \(ApprovalCard.age(c))") }
                if let e = item.expires { Text("Expires \(e.formatted(.relative(presentation: .named)))") }
                if item.status != .pending {
                    Text(item.status == .approved ? "APPROVED" : "DENIED")
                        .fontWeight(.bold)
                        .foregroundStyle(item.status == .approved ? .green : .red)
                }
            }
            .font(.system(size: 12))
            .foregroundStyle(.tertiary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 20).padding(.vertical, 16)
    }

    private func imageColumn(_ pres: Presentation) -> some View {
        VStack(spacing: 10) {
            if pres.images.count > 1 {
                Picker("", selection: $imageIndex) {
                    ForEach(pres.images.indices, id: \.self) { i in Text(pres.images[i].label).tag(i) }
                }
                .pickerStyle(.segmented)
                .labelsHidden()
            }
            let img = pres.images[min(imageIndex, pres.images.count - 1)]
            RemoteImage(url: img.url)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 10, style: .continuous).strokeBorder(.quaternary))
                .frame(maxHeight: .infinity, alignment: .top)
                .onTapGesture { NSWorkspace.shared.open(img.url) }
                .help("Open full size")
        }
    }

    private func contentColumn(_ item: ApprovalItem, _ pres: Presentation) -> some View {
        VStack(alignment: .leading, spacing: 18) {
            if let main = pres.mainText {
                section(main.label) {
                    Text(main.text)
                        .font(.system(size: 15))
                        .lineSpacing(3)
                        .textSelection(.enabled)
                        .fixedSize(horizontal: false, vertical: true)
                }
            } else if !item.summary.isEmpty {
                section("Summary") {
                    Text(item.summary).font(.system(size: 15)).lineSpacing(3).textSelection(.enabled)
                }
            }
            ForEach(pres.links.indices, id: \.self) { i in
                let link = pres.links[i]
                section(link.label) {
                    Button { NSWorkspace.shared.open(link.url) } label: {
                        HStack(spacing: 6) {
                            Text(Self.shortURL(link.url)).lineLimit(1).truncationMode(.middle)
                            Image(systemName: "arrow.up.right.square")
                        }
                        .font(.system(size: 14))
                    }
                    .buttonStyle(.link)
                    .help(link.url.absoluteString)
                }
            }
            if !pres.fields.isEmpty {
                section("Details") {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(pres.fields.indices, id: \.self) { i in
                            HStack(alignment: .firstTextBaseline, spacing: 12) {
                                Text(pres.fields[i].label).foregroundStyle(.secondary).frame(width: 110, alignment: .leading)
                                Text(pres.fields[i].value).textSelection(.enabled).fixedSize(horizontal: false, vertical: true)
                            }
                            .font(.system(size: 13))
                        }
                    }
                }
            }
            HStack(spacing: 6) {
                Text("Requested by").foregroundStyle(.secondary)
                SourceTag(source: item.source)
                Text(item.id).font(.caption.monospaced()).foregroundStyle(.tertiary)
            }
            .font(.system(size: 12))
            DisclosureGroup("Technical details", isExpanded: $showRaw) {
                Text(item.payloadPretty)
                    .font(.system(size: 11, design: .monospaced))
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(8)
                    .background(RoundedRectangle(cornerRadius: 6).fill(Color(nsColor: .textBackgroundColor)))
            }
            .font(.system(size: 12))
            .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func footer(_ item: ApprovalItem) -> some View {
        HStack(spacing: 10) {
            TextField("Add a note for the agent (optional), e.g. post it Tuesday", text: $note)
                .textFieldStyle(.roundedBorder)
                .font(.system(size: 13))
            Button(role: .destructive) { decide(.denied) } label: {
                Label("Deny", systemImage: "xmark").frame(minWidth: 70)
            }
            .controlSize(.large)
            Button { decide(.approved) } label: {
                Label("Approve", systemImage: "checkmark").frame(minWidth: 90)
            }
            .controlSize(.large)
            .buttonStyle(.borderedProminent)
            .tint(.green)
            .keyboardShortcut(.defaultAction)
        }
        .disabled(item.status != .pending)
        .padding(16)
    }

    @ViewBuilder
    private func section<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.secondary)
            content()
        }
    }

    static func shortURL(_ url: URL) -> String {
        var s = url.absoluteString
        for p in ["https://", "http://", "www."] where s.hasPrefix(p) { s.removeFirst(p.count) }
        if let q = s.firstIndex(of: "?") { s = String(s[..<q]) }
        return s.hasSuffix("/") ? String(s.dropLast()) : s
    }

    private func decide(_ status: ApprovalStatus) {
        store.decide(ids: [itemID], status: status, note: note.trimmingCharacters(in: .whitespaces))
        WindowHost.close(id: "detail")
    }
}
