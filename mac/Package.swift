// swift-tools-version:5.8
import PackageDescription

let package = Package(
    name: "Dealcoach",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(name: "Dealcoach", path: "Sources/Dealcoach")
    ]
)
