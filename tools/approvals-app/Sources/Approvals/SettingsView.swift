import SwiftUI
import ServiceManagement

struct SettingsView: View {
    @EnvironmentObject var store: ApprovalsStore
    @ObservedObject private var settings = AppSettings.shared
    @State private var token = ""
    @State private var tokenStatus = ""
    @State private var testResult = ""
    @State private var testing = false
    @State private var launchAtLogin = SMAppService.mainApp.status == .enabled
    @State private var loginError = ""

    var body: some View {
        Form {
            Section("GitHub") {
                SecureField("Personal access token", text: $token)
                    .textFieldStyle(.roundedBorder)
                HStack {
                    Button("Save token") { saveToken() }.disabled(token.isEmpty)
                    Button("Use gh CLI token") { importFromGH() }
                        .help("Runs `gh auth token` and stores the result in the Keychain")
                    if store.hasToken { Button("Forget token", role: .destructive) { forgetToken() } }
                    Spacer()
                    Text(tokenStatus.isEmpty ? (store.hasToken ? "Token stored in Keychain" : "No token") : tokenStatus)
                        .font(.caption).foregroundStyle(.secondary)
                }
                TextField("Repository (owner/name)", text: $settings.repo)
                TextField("Branch", text: $settings.branch)
                TextField("File path", text: $settings.path)
                HStack {
                    Text("Poll every")
                    TextField("", value: $settings.pollInterval, format: .number).frame(width: 60)
                    Stepper("", value: $settings.pollInterval, in: 10...3600, step: 10).labelsHidden()
                    Text("seconds")
                }
                HStack {
                    Button(testing ? "Testing…" : "Test connection") {
                        testing = true
                        Task { testResult = await store.testConnection(); testing = false }
                    }
                    .disabled(testing)
                    Text(testResult).font(.caption).foregroundStyle(testResult.hasPrefix("OK") ? .green : .secondary)
                        .lineLimit(2)
                }
            }
            Section("Quiet hours") {
                Toggle("Hold notifications during quiet hours", isOn: $settings.quietEnabled)
                HStack {
                    DatePicker("From", selection: minutesBinding($settings.quietStart), displayedComponents: .hourAndMinute)
                    DatePicker("to", selection: minutesBinding($settings.quietEnd), displayedComponents: .hourAndMinute)
                }
                .disabled(!settings.quietEnabled)
                Text("Items that arrive during quiet hours are notified when they end. Approving in the menu still works.")
                    .font(.caption).foregroundStyle(.secondary)
            }
            Section("General") {
                Toggle("Launch at login", isOn: $launchAtLogin)
                    .onChange(of: launchAtLogin) { on in toggleLogin(on) }
                if !loginError.isEmpty { Text(loginError).font(.caption).foregroundStyle(.orange) }
                Text("Only `status`, `decided` and `note` are ever written. Agents add items; see flywheel/APPROVALS.md.")
                    .font(.caption).foregroundStyle(.secondary)
            }
        }
        .formStyle(.grouped)
        .frame(minWidth: 480, minHeight: 520)
    }

    private func saveToken() {
        do {
            try Keychain.save(token.trimmingCharacters(in: .whitespacesAndNewlines))
            token = ""
            tokenStatus = "Saved"
            store.tokenChanged()
        } catch { tokenStatus = error.localizedDescription }
    }

    private func forgetToken() {
        Keychain.delete()
        tokenStatus = "Removed"
        store.tokenChanged()
    }

    private func importFromGH() {
        let p = Process()
        p.executableURL = URL(fileURLWithPath: "/bin/zsh")
        p.arguments = ["-lc", "gh auth token"]
        let out = Pipe(), err = Pipe()
        p.standardOutput = out
        p.standardError = err
        do {
            try p.run()
            p.waitUntilExit()
            let text = String(decoding: out.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
                .trimmingCharacters(in: .whitespacesAndNewlines)
            guard p.terminationStatus == 0, !text.isEmpty else {
                let e = String(decoding: err.fileHandleForReading.readDataToEndOfFile(), as: UTF8.self)
                tokenStatus = "gh failed: \(e.trimmingCharacters(in: .whitespacesAndNewlines))"
                return
            }
            try Keychain.save(text)
            tokenStatus = "Imported from gh"
            store.tokenChanged()
        } catch { tokenStatus = error.localizedDescription }
    }

    private func toggleLogin(_ on: Bool) {
        do {
            if on { try SMAppService.mainApp.register() } else { try SMAppService.mainApp.unregister() }
            loginError = ""
        } catch {
            loginError = error.localizedDescription
            launchAtLogin = SMAppService.mainApp.status == .enabled
        }
    }

    private func minutesBinding(_ b: Binding<Int>) -> Binding<Date> {
        Binding<Date>(
            get: {
                let start = Calendar.current.startOfDay(for: Date())
                return start.addingTimeInterval(TimeInterval(b.wrappedValue * 60))
            },
            set: { date in
                let c = Calendar.current.dateComponents([.hour, .minute], from: date)
                b.wrappedValue = (c.hour ?? 0) * 60 + (c.minute ?? 0)
            }
        )
    }
}
