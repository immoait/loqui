#!/bin/zsh
# Legt einmalig das selbst signierte Code-Signing-Zertifikat "Dealcoach Dev" im
# Anmelde-Schlüsselbund an. Danach behält macOS die Freigaben über Neubauten hinweg.
# macOS fragt dabei nach deinem Mac-Passwort.
set -euo pipefail
NAME="Dealcoach Dev"
KEYCHAIN=~/Library/Keychains/login.keychain-db

if security find-identity -v -p codesigning | grep -q "\"$NAME\""; then
  echo "Zertifikat \"$NAME\" ist schon eingerichtet."
  exit 0
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
PASS=$(uuidgen)

/usr/bin/openssl req -x509 -newkey rsa:2048 -nodes -days 3650 \
  -keyout "$TMP/key.pem" -out "$TMP/cert.pem" -subj "/CN=$NAME" \
  -addext "extendedKeyUsage=critical,codeSigning" \
  -addext "keyUsage=critical,digitalSignature" \
  -addext "basicConstraints=critical,CA:false" 2>/dev/null
/usr/bin/openssl pkcs12 -export -out "$TMP/dev.p12" -inkey "$TMP/key.pem" -in "$TMP/cert.pem" -passout "pass:$PASS"

security import "$TMP/dev.p12" -k "$KEYCHAIN" -P "$PASS" -T /usr/bin/codesign
security add-trusted-cert -r trustRoot -p codeSign -k "$KEYCHAIN" "$TMP/cert.pem"

security find-identity -v -p codesigning | grep "\"$NAME\"" && echo "Fertig. Jetzt ./scripts/build-app.sh ausführen."
