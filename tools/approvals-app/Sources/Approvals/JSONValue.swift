import Foundation

/// Order-preserving JSON tree. The approvals file is written by other agents (Node, Python);
/// keeping key order and raw number text means our writes only touch the fields we change.
struct JSONMember: Equatable {
    var key: String
    var value: JSONValue
}

indirect enum JSONValue: Equatable {
    case null
    case bool(Bool)
    case number(String)        // raw text, preserved verbatim
    case string(String)
    case array([JSONValue])
    case object([JSONMember])  // ordered

    subscript(key: String) -> JSONValue? {
        get {
            if case .object(let members) = self { return members.first { $0.key == key }?.value }
            return nil
        }
        set {
            guard case .object(var members) = self else { return }
            if let i = members.firstIndex(where: { $0.key == key }) {
                if let newValue { members[i].value = newValue } else { members.remove(at: i) }
            } else if let newValue {
                members.append(JSONMember(key: key, value: newValue))
            }
            self = .object(members)
        }
    }

    var stringValue: String? { if case .string(let s) = self { return s }; return nil }
    var arrayValue: [JSONValue]? { if case .array(let a) = self { return a }; return nil }
    var isNull: Bool { if case .null = self { return true }; return false }
}

// MARK: - Parser

struct JSONParseError: Error, CustomStringConvertible {
    let message: String
    let offset: Int
    var description: String { "JSON parse error at \(offset): \(message)" }
}

enum JSONParser {
    static func parse(_ text: String) throws -> JSONValue {
        var p = Parser(s: Array(text.unicodeScalars))
        p.skipWS()
        let v = try p.parseValue()
        p.skipWS()
        guard p.atEnd else { throw p.err("trailing characters") }
        return v
    }

    private struct Parser {
        let s: [Unicode.Scalar]
        var i = 0
        var atEnd: Bool { i >= s.count }

        func err(_ m: String) -> JSONParseError { JSONParseError(message: m, offset: i) }

        mutating func skipWS() {
            while i < s.count, s[i] == " " || s[i] == "\n" || s[i] == "\r" || s[i] == "\t" { i += 1 }
        }

        mutating func parseValue() throws -> JSONValue {
            guard i < s.count else { throw err("unexpected end of input") }
            switch s[i] {
            case "{": return try parseObject()
            case "[": return try parseArray()
            case "\"": return .string(try parseString())
            case "t": try expect("true"); return .bool(true)
            case "f": try expect("false"); return .bool(false)
            case "n": try expect("null"); return .null
            default: return try parseNumber()
            }
        }

        mutating func expect(_ word: String) throws {
            for c in word.unicodeScalars {
                guard i < s.count, s[i] == c else { throw err("expected \(word)") }
                i += 1
            }
        }

        mutating func parseNumber() throws -> JSONValue {
            let start = i
            let allowed = Set("+-0123456789.eE".unicodeScalars)
            while i < s.count, allowed.contains(s[i]) { i += 1 }
            guard i > start else { throw err("unexpected character") }
            var str = ""
            str.unicodeScalars.append(contentsOf: s[start..<i])
            guard Double(str) != nil else { throw err("bad number \(str)") }
            return .number(str)
        }

        mutating func parseString() throws -> String {
            i += 1 // opening quote
            var out = String.UnicodeScalarView()
            while i < s.count {
                let c = s[i]; i += 1
                if c == "\"" { return String(out) }
                if c != "\\" { out.append(c); continue }
                guard i < s.count else { break }
                let e = s[i]; i += 1
                switch e {
                case "\"": out.append("\"")
                case "\\": out.append("\\")
                case "/": out.append("/")
                case "b": out.append("\u{8}")
                case "f": out.append("\u{C}")
                case "n": out.append("\n")
                case "r": out.append("\r")
                case "t": out.append("\t")
                case "u":
                    var code = try parseHex4()
                    if (0xD800...0xDBFF).contains(code), i + 1 < s.count, s[i] == "\\", s[i + 1] == "u" {
                        i += 2
                        let low = try parseHex4()
                        if (0xDC00...0xDFFF).contains(low) {
                            code = 0x10000 + ((code - 0xD800) << 10) + (low - 0xDC00)
                        }
                    }
                    guard let scalar = Unicode.Scalar(code) else { throw err("bad unicode escape") }
                    out.append(scalar)
                default: throw err("bad escape \\\(e)")
                }
            }
            throw err("unterminated string")
        }

        mutating func parseHex4() throws -> UInt32 {
            guard i + 4 <= s.count else { throw err("bad \\u escape") }
            var str = ""
            str.unicodeScalars.append(contentsOf: s[i..<(i + 4)])
            i += 4
            guard let v = UInt32(str, radix: 16) else { throw err("bad \\u escape") }
            return v
        }

        mutating func parseArray() throws -> JSONValue {
            i += 1
            var items: [JSONValue] = []
            skipWS()
            if i < s.count, s[i] == "]" { i += 1; return .array(items) }
            while true {
                skipWS()
                items.append(try parseValue())
                skipWS()
                guard i < s.count else { throw err("unterminated array") }
                if s[i] == "," { i += 1; continue }
                if s[i] == "]" { i += 1; return .array(items) }
                throw err("expected , or ]")
            }
        }

        mutating func parseObject() throws -> JSONValue {
            i += 1
            var members: [JSONMember] = []
            skipWS()
            if i < s.count, s[i] == "}" { i += 1; return .object(members) }
            while true {
                skipWS()
                guard i < s.count, s[i] == "\"" else { throw err("expected object key") }
                let key = try parseString()
                skipWS()
                guard i < s.count, s[i] == ":" else { throw err("expected :") }
                i += 1
                skipWS()
                let value = try parseValue()
                members.append(JSONMember(key: key, value: value))
                skipWS()
                guard i < s.count else { throw err("unterminated object") }
                if s[i] == "," { i += 1; continue }
                if s[i] == "}" { i += 1; return .object(members) }
                throw err("expected , or }")
            }
        }
    }
}

// MARK: - Serializer (same shape as JSON.stringify(x, null, 2))

extension JSONValue {
    func serialized(indent: Int = 2) -> String {
        var out = ""
        write(to: &out, level: 0, indent: indent)
        return out
    }

    private func write(to out: inout String, level: Int, indent: Int) {
        func pad(_ l: Int) -> String { String(repeating: " ", count: l * indent) }
        switch self {
        case .null: out += "null"
        case .bool(let b): out += b ? "true" : "false"
        case .number(let n): out += n
        case .string(let s): out += JSONValue.quote(s)
        case .array(let a):
            if a.isEmpty { out += "[]"; return }
            out += "[\n"
            for (idx, v) in a.enumerated() {
                out += pad(level + 1)
                v.write(to: &out, level: level + 1, indent: indent)
                if idx < a.count - 1 { out += "," }
                out += "\n"
            }
            out += pad(level) + "]"
        case .object(let m):
            if m.isEmpty { out += "{}"; return }
            out += "{\n"
            for (idx, member) in m.enumerated() {
                out += pad(level + 1) + JSONValue.quote(member.key) + ": "
                member.value.write(to: &out, level: level + 1, indent: indent)
                if idx < m.count - 1 { out += "," }
                out += "\n"
            }
            out += pad(level) + "}"
        }
    }

    static func quote(_ s: String) -> String {
        var r = "\""
        for u in s.unicodeScalars {
            switch u {
            case "\"": r += "\\\""
            case "\\": r += "\\\\"
            case "\n": r += "\\n"
            case "\r": r += "\\r"
            case "\t": r += "\\t"
            case "\u{8}": r += "\\b"
            case "\u{C}": r += "\\f"
            default:
                if u.value < 0x20 { r += String(format: "\\u%04x", u.value) } else { r.unicodeScalars.append(u) }
            }
        }
        return r + "\""
    }
}
