import SwiftUI

struct MenuView: View {
    @EnvironmentObject var store: ApprovalsStore

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            header
            Divider()
            if store.visibleItems.isEmpty {
                VStack(spacing: 6) {
                    Image(systemName: "checkmark.circle").font(.largeTitle).foregroundStyle(.secondary)
                    Text(store.hasToken ? "Nothing waiting for you." : "Set a GitHub token in Settings to start.")
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity).padding(24)
            } else {
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 10) {
                        ForEach(store.groups) { group in
                            GroupHeader(group: group)
                            ForEach(group.items) { item in ItemRow(item: item) }
                        }
                    }
                    .padding(12)
                }
                .frame(maxHeight: 540)
            }
            Divider()
            footer
        }
        .frame(width: 420)
    }

    private var header: some View {
        HStack {
            Text("Approvals").font(.headline)
            Spacer()
            Text(store.pendingCount == 0 ? "" : "\(store.pendingCount) pending").foregroundStyle(.secondary)
            Button { Task { await store.refresh() } } label: {
                if store.isSyncing { ProgressView().controlSize(.small) } else { Image(systemName: "arrow.clockwise") }
            }
            .buttonStyle(.borderless).help("Refresh now")
        }
        .padding(.horizontal, 12).padding(.vertical, 10)
    }

    private var footer: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let err = store.lastError {
                Label(err, systemImage: "exclamationmark.triangle").font(.caption).foregroundStyle(.orange).lineLimit(2)
            } else if let msg = store.statusMessage {
                Text(msg).font(.caption).foregroundStyle(.secondary).lineLimit(2)
            } else if let t = store.lastSync {
                Text("Synced \(t.formatted(date: .omitted, time: .shortened))").font(.caption).foregroundStyle(.secondary)
            }
            HStack {
                if store.snoozedCount > 0 {
                    Button("Unsnooze \(store.snoozedCount)") { store.clearSnoozes() }.buttonStyle(.link).font(.caption)
                }
                Spacer()
                Button("Settings…") { store.openSettings() }
                Button("Quit") { NSApp.terminate(nil) }
            }
            .controlSize(.small)
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
    }
}

struct GroupHeader: View {
    @EnvironmentObject var store: ApprovalsStore
    let group: ApprovalsStore.Group

    var body: some View {
        HStack {
            Text("\(group.kind.uppercased()) · \(group.items.count)")
                .font(.caption.weight(.semibold)).foregroundStyle(.secondary)
            Spacer()
            if group.items.count > 1 {
                Button("Approve all \(group.kind)") {
                    store.decide(ids: group.items.map(\.id), status: .approved, note: "")
                }
                .controlSize(.mini)
            }
        }
        .padding(.top, 4)
    }
}

struct ItemRow: View {
    @EnvironmentObject var store: ApprovalsStore
    let item: ApprovalItem

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack(alignment: .top) {
                Button { store.openDetail(item.id) } label: {
                    Text(item.title).font(.body.weight(.semibold)).multilineTextAlignment(.leading)
                }
                .buttonStyle(.plain).help("Open details")
                Spacer(minLength: 8)
                SourceTag(source: item.source)
            }
            if !item.summary.isEmpty {
                Text(item.summary).font(.callout).foregroundStyle(.secondary).lineLimit(3)
            }
            HStack(spacing: 6) {
                Button("Approve") { store.decide(ids: [item.id], status: .approved, note: "") }
                    .tint(.green).buttonStyle(.borderedProminent)
                Button("Deny") { store.decide(ids: [item.id], status: .denied, note: "") }
                    .tint(.red).buttonStyle(.bordered)
                Button("Snooze 4h") { store.snooze(item.id) }.buttonStyle(.bordered)
                Spacer()
                if let exp = item.expires {
                    Text("expires \(exp.formatted(.relative(presentation: .named)))")
                        .font(.caption2).foregroundStyle(.tertiary)
                }
            }
            .controlSize(.small)
        }
        .padding(10)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color(nsColor: .controlBackgroundColor)))
    }
}

struct SourceTag: View {
    let source: String
    var body: some View {
        Text(source)
            .font(.caption2.monospaced())
            .padding(.horizontal, 6).padding(.vertical, 2)
            .background(Capsule().fill(Color.accentColor.opacity(0.15)))
            .foregroundStyle(Color.accentColor)
    }
}
