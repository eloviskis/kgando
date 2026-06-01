#!/bin/bash
# ============================================================
# build-release.sh — Gera o AAB de release do Kgando
# Uso: bash build-release.sh
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KEYSTORE="$SCRIPT_DIR/kgando.keystore"
PASS_FILE="$SCRIPT_DIR/.keystore-password"
ASSETLINKS="$SCRIPT_DIR/../.well-known/assetlinks.json"
AAB_OUT="$SCRIPT_DIR/app/build/outputs/bundle/release/app-release.aab"

# ── Android SDK ──────────────────────────────────────────────
if [ -z "$ANDROID_HOME" ]; then
  if [ -d "$HOME/Library/Android/sdk" ]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$PATH"
  else
    echo "❌ ANDROID_HOME não definido e SDK não encontrado em ~/Library/Android/sdk"
    exit 1
  fi
fi
echo "✅ ANDROID_HOME: $ANDROID_HOME"

# ── Keystore ─────────────────────────────────────────────────
# Se já existe keystore com senha salva, usar ela
if [ -f "$KEYSTORE" ] && [ -f "$PASS_FILE" ]; then
  KSPASS=$(cat "$PASS_FILE")
  if keytool -list -keystore "$KEYSTORE" -alias kgando -storepass "$KSPASS" > /dev/null 2>&1; then
    echo "✅ Keystore existente OK (senha lida de .keystore-password)"
    SKIP_KEYGEN=true
  else
    echo "⚠️  Keystore existe mas senha não bate — recriando..."
    rm -f "$KEYSTORE"
    SKIP_KEYGEN=false
  fi
else
  SKIP_KEYGEN=false
fi

if [ "$SKIP_KEYGEN" != "true" ]; then
  # Gerar senha aleatória forte
  KSPASS=$(openssl rand -base64 18 | tr -dc 'A-Za-z0-9@#$%' | head -c 20)

  echo ""
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║           🔑 SENHA DO KEYSTORE GERADA               ║"
  echo "╠══════════════════════════════════════════════════════╣"
  echo "║  $KSPASS"
  echo "╠══════════════════════════════════════════════════════╣"
  echo "║  ⚠️  GUARDE ESTA SENHA EM LOCAL SEGURO!              ║"
  echo "║  Sem ela não é possível publicar atualizações.       ║"
  echo "║  Salva também em: android/.keystore-password         ║"
  echo "╚══════════════════════════════════════════════════════╝"
  echo ""

  # Salvar em arquivo local (gitignored)
  echo "$KSPASS" > "$PASS_FILE"
  chmod 600 "$PASS_FILE"

  # Remover keystore antigo se existir
  rm -f "$KEYSTORE"

  # Gerar novo keystore
  echo "🔨 Gerando novo keystore..."
  keytool -genkey -v \
    -keystore "$KEYSTORE" \
    -alias kgando \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$KSPASS" \
    -keypass "$KSPASS" \
    -dname "CN=Kgando, OU=Mobile, O=Kgando, L=Brasil, ST=SP, C=BR" \
    -noprompt
  echo "✅ Keystore gerado: $KEYSTORE"
fi

export KEYSTORE_PATH="$KEYSTORE"
export KEYSTORE_PASSWORD="$KSPASS"
export KEY_ALIAS="kgando"
export KEY_PASSWORD="$KSPASS"

# ── Extrair SHA256 e atualizar assetlinks.json ───────────────
echo ""
echo "🔍 Extraindo SHA256 do keystore..."
SHA256=$(keytool -list -v \
  -keystore "$KEYSTORE" \
  -alias kgando \
  -storepass "$KSPASS" \
  | grep "SHA256:" | awk '{print $2}')

echo "📋 SHA256: $SHA256"

mkdir -p "$(dirname "$ASSETLINKS")"
cat > "$ASSETLINKS" << EOJSON
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.kgando.app",
    "sha256_cert_fingerprints": ["${SHA256}"]
  }
}]
EOJSON
echo "✅ assetlinks.json atualizado"

# Publicar assetlinks.json no servidor
echo "🚀 Publicando assetlinks.json no servidor..."
SERVER="root@77.37.41.105"
SSH_KEY="$HOME/.ssh/id_ed25519"
SSH_OPTS="-p 22 -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i $SSH_KEY"
ssh $SSH_OPTS $SERVER "mkdir -p /var/www/kgando/.well-known"
scp -P 22 -o StrictHostKeyChecking=no -i $SSH_KEY "$ASSETLINKS" $SERVER:/var/www/kgando/.well-known/assetlinks.json
echo "✅ assetlinks.json publicado em kgando.com/.well-known/"

# ── Build ────────────────────────────────────────────────────
echo ""
echo "🔨 Gerando AAB de release..."
cd "$SCRIPT_DIR"

./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file="$KEYSTORE_PATH" \
  -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
  -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
  -Pandroid.injected.signing.key.password="$KEY_PASSWORD" \
  -PANDROID_HOME="$ANDROID_HOME" \
  --no-daemon

echo ""
if [ -f "$AAB_OUT" ]; then
  SIZE=$(du -sh "$AAB_OUT" | cut -f1)
  echo "╔══════════════════════════════════════════════════════╗"
  echo "║              ✅ BUILD CONCLUÍDO!                     ║"
  echo "╠══════════════════════════════════════════════════════╣"
  echo "║  📦 AAB: $AAB_OUT"
  echo "║  📏 Tamanho: $SIZE"
  echo "╠══════════════════════════════════════════════════════╣"
  echo "║  Próximos passos:                                    ║"
  echo "║  1. play.google.com/console                          ║"
  echo "║  2. Criar app → package: com.kgando.app              ║"
  echo "║  3. Testes internos → Nova versão → Upload do .aab   ║"
  echo "╚══════════════════════════════════════════════════════╝"
else
  echo "❌ AAB não encontrado — verifique os erros acima."
  exit 1
fi
