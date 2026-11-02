#!/bin/zsh
# Baut Dealcoach.app aus dem Swift Package (ohne Xcode) und signiert sie.
# Mit dem Zertifikat "Dealcoach Dev" bleibt die Signatur über Neubauten gleich,
# sodass macOS die Freigaben (Mikrofon, Systemaudio) behält. Ohne: ad hoc.
set -euo pipefail
cd "$(dirname "$0")/.."
# Direkt mit swiftc, weil SwiftPM mit reinen Command Line Tools das Plattform-SDK nicht findet.
# Außerhalb von ~/Documents bauen: iCloud Drive hängt dort Attribute an, die codesign ablehnt.
APP="$HOME/Applications/Dealcoach.app"
mkdir -p "$HOME/Applications"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
swiftc -O -parse-as-library -module-name Dealcoach \
  -sdk "$(xcrun --sdk macosx --show-sdk-path)" \
  -target "$(uname -m)-apple-macos13.0" \
  Sources/Dealcoach/*.swift \
  -o "$APP/Contents/MacOS/Dealcoach"
cp Info.plist "$APP/Contents/Info.plist"
xattr -cr "$APP"
IDENTITY="Dealcoach Dev"
if security find-identity -v -p codesigning | grep -q "\"$IDENTITY\""; then
  codesign --force --sign "$IDENTITY" "$APP"
  echo "Signiert mit \"$IDENTITY\""
else
  codesign --force --sign - "$APP"
  echo "Ad hoc signiert (Zertifikat \"$IDENTITY\" nicht gefunden – macOS fragt nach jedem Build neu nach Freigaben)"
fi
echo "Fertig: $APP"
