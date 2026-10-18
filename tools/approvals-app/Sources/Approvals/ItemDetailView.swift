import SwiftUI

struct ItemDetailView: View {
    @EnvironmentObject var store: ApprovalsStore
    let itemID: String
    @State private var note = ""

    var body: some View {
        if let item = store.item(itemID) {
            VStack(alignment: .leading, spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(item.title).font(.title2.weight(.semibold))
                        HStack(spacing: 8) {
                            Text(item.kind.uppercased()).font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                            SourceTag(source: item.source)
                            Text(item.id).font(.caption.monospaced()).foregroundStyle(.tertiary)
                        }
                        HStack(spacing: 16) {
                            if let c = item.created { Text("created \(c.formatted())") }
                            if let e = item.expires { Text("expires \(e.formatted())") }
                            if item.status != .pending {
                                Text(item.status.rawValue.uppercased()).fontWeight(.bold)
                                    .foregroundStyle(item.status == .approved ? .green : .red)
                            }
                        }
                        .font(.caption).foregroundStyle(.secondary)
                        if !item.summary.isEmpty { Text(item.summary).font(.body) }
                        if let url = item.previewURL {
                            AsyncImage(url: url) { phase in
                                switch phase {
                                case .success(let img): img.resizable().scaledToFit().cornerRadius(6)
                                case .failure: Label("Preview failed to load", systemImage: "photo").foregroundStyle(.secondary)
                                default: ProgressView().frame(maxWidth: .infinity).padding()
                                }
                            }
                            .frame(maxHeight: 420)
                        }
                        Text("Payload").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                        Text(item.payloadPretty)
                            .font(.system(.caption, design: .monospaced))
                            .textSelection(.enabled)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(8)
                            .background(RoundedRectangle(cornerRadius: 6).fill(Color(nsColor: .textBackgroundColor)))
                        if !item.note.isEmpty { Text("Note: \(item.note)").font(.callout) }
                    }
                    .padding(16)
                }
                Divider()
                HStack {
                    TextField("Note (optional, e.g. post it Tuesday)", text: $note)
                        .textFieldStyle(.roundedBorder)
                    Button("Deny") { decide(.denied) }.tint(.red)
                    Button("Approve") { decide(.approved) }.tint(.green).buttonStyle(.borderedProminent)
                        .keyboardShortcut(.defaultAction)
                }
                .disabled(item.status != .pending)
                .padding(12)
            }
        } else {
            Text("Item \(itemID) is no longer in the queue.").foregroundStyle(.secondary).padding()
        }
    }

    private func decide(_ status: ApprovalStatus) {
        store.decide(ids: [itemID], status: status, note: note.trimmingCharacters(in: .whitespaces))
        WindowHost.close(id: "detail")
    }
}
