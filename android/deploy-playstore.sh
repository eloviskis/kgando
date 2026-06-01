#!/bin/bash
set -e

echo "🚀 Deploy automático Kgando → Google Play Store"
echo ""

# Verifica se existe o JSON da Service Account
if [ ! -f "fastlane/play_store_key.json" ]; then
  echo "❌ ERRO: fastlane/play_store_key.json não encontrado!"
  echo ""
  echo "Siga as instruções em FASTLANE_SETUP.md para configurar."
  echo ""
  exit 1
fi

# Lê o versionCode atual
GRADLE_FILE="app/build.gradle"
CURRENT_VERSION=$(grep "versionCode" "$GRADLE_FILE" | head -1 | sed 's/[^0-9]*//g')
NEW_VERSION=$((CURRENT_VERSION + 1))

echo "📦 Versão atual: $CURRENT_VERSION"
echo "📦 Nova versão: $NEW_VERSION"
echo ""

# Confirma com usuário
read -p "Deseja continuar com o deploy? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Deploy cancelado."
  exit 0
fi

# Incrementa versionCode
echo "📝 Atualizando versionCode no build.gradle..."
sed -i.bak "s/versionCode $CURRENT_VERSION/versionCode $NEW_VERSION/" "$GRADLE_FILE"
rm -f "${GRADLE_FILE}.bak"

# Commita a mudança de versionCode
echo "💾 Commitando nova versão..."
git add "$GRADLE_FILE"
git commit -m "build: incrementar versionCode para $NEW_VERSION (deploy Play Store)" || true

# Executa Fastlane deploy
echo ""
echo "🚀 Executando fastlane deploy..."
echo ""
fastlane deploy

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║              ✅ DEPLOY CONCLUÍDO!                    ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║  📱 Versão: $NEW_VERSION                                     ║"
echo "║  🎯 Track: Teste interno (draft)                     ║"
echo "║                                                      ║"
echo "║  Próximos passos:                                    ║"
echo "║  1. Acesse play.google.com/console                   ║"
echo "║  2. Revise a versão em Teste interno                 ║"
echo "║  3. Publique ou promova para alpha/produção          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Push do commit
read -p "Fazer git push? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push
  echo "✅ Git push concluído!"
fi
