import Foundation
import Security

/// GitHub token lives only in the login keychain, never in a file.
enum Keychain {
    static let service = "com.aidantorrence.approvals"
    static let account = "github-token"

    struct KeychainError: LocalizedError {
        let status: OSStatus
        var errorDescription: String? {
            (SecCopyErrorMessageString(status, nil) as String?) ?? "Keychain error \(status)"
        }
    }

    private static var baseQuery: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword,
         kSecAttrService as String: service,
         kSecAttrAccount as String: account]
    }

    static func save(_ token: String) throws {
        // Delete + add (not update) so the item's access list trusts the binary that saved it;
        // a rebuilt, re-signed app then reads it without a Keychain prompt.
        let data = Data(token.utf8)
        SecItemDelete(baseQuery as CFDictionary)
        var add = baseQuery
        add[kSecValueData as String] = data
        add[kSecAttrLabel as String] = "Approvals – GitHub token"
        let status = SecItemAdd(add as CFDictionary, nil)
        guard status == errSecSuccess else { throw KeychainError(status: status) }
    }

    static func load() -> String? {
        #if DEBUG
        if let t = ProcessInfo.processInfo.environment["APPROVALS_TOKEN"], !t.isEmpty { return t }
        #endif
        var q = baseQuery
        q[kSecReturnData as String] = true
        q[kSecMatchLimit as String] = kSecMatchLimitOne
        var out: AnyObject?
        let status = SecItemCopyMatching(q as CFDictionary, &out)
        guard status == errSecSuccess, let data = out as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func delete() {
        SecItemDelete(baseQuery as CFDictionary)
    }
}
