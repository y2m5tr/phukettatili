#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "🚀 Phuket Tatili — Canlı Sunucuya Dağıtım Başlatılıyor"
echo "=========================================================="

echo "📥 1. Kodlar sunucuya çekiliyor ve derleniyor..."
ssh -i ~/.ssh/id_verunix -o StrictHostKeyChecking=no root@87.192.36.63 bash << 'EOF'
  set -euo pipefail
  cd /var/www/phukettatili
  echo "📥 [Git] En son kodlar çekiliyor..."
  git fetch origin main
  git reset --hard origin/main
  echo "📦 [NPM] Bağımlılıklar kontrol ediliyor..."
  npm install --prefer-offline --no-audit
  echo "🏗️ [Build] Astro SSR derlemesi..."
  DEPLOY_TARGET=node ASTRO_TELEMETRY_DISABLED=1 npm run build
  echo "🔄 [PM2] Servis kesintisiz yenileniyor..."
  pm2 reload ecosystem.config.cjs
  echo "🩺 [Health Check] Sağlık kontrolü..."
  curl -fsS https://phukettatili.com/api/health || true
EOF

echo ""
echo "=========================================================="
echo "✅ Dağıtım tamamlandı! https://phukettatili.com güncel."
echo "=========================================================="
