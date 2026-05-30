#!/bin/bash
# Deploy Kgando → /var/www/kgando (preserva .env do servidor)
set -e

SERVER="root@77.37.41.105"
SSH_KEY="$HOME/.ssh/id_ed25519"
SSH_OPTS="-p 22 -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i $SSH_KEY"
REMOTE_DIR="/var/www/kgando"

echo "🚽 Deploy Kgando..."

rsync -az \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'api/kgando.db' \
  --exclude 'api/data/' \
  --exclude 'api/.env' \
  -e "ssh $SSH_OPTS" \
  . $SERVER:$REMOTE_DIR/

echo "📦 Instalando dependências..."
ssh $SSH_OPTS $SERVER "cd $REMOTE_DIR/api && npm install --omit=dev --silent"

echo "🗄️  Rodando migrações..."
ssh $SSH_OPTS $SERVER "cd $REMOTE_DIR/api && node migrate.js"

echo "🔄 Reiniciando app..."
ssh $SSH_OPTS $SERVER "pm2 restart kgando --update-env"

echo "✅ Deploy concluído! kgando.com no ar."
