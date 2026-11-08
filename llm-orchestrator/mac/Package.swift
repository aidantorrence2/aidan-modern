// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "OrchestratorMac",
    platforms: [.macOS(.v14)],
    targets: [.executableTarget(name: "OrchestratorMac", path: "Sources/OrchestratorMac")]
)
