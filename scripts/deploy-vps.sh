#!/usr/bin/env bash
# ==============================================================================
# scripts/deploy-vps.sh — PhuketTatili Ubuntu 24.04 / 22.04 LTS Kurulum & Dağıtım
# ==============================================================================
# Kullanım (Sunucuda root veya sudo yetkisiyle):
#   chmod +x scripts/deploy-vps.sh
#   ./scripts/deploy-vps.sh
# ==============================================================================

set -euo pipefail

APP_DIR="/var/www/phukettatili"
BRANCH="main"

echo "=========================================================="
echo "🌴 Phuket Tatili — VPS Dağıtım & Güncelleme Başlatılıyor"
echo "=========================================================="

# 1. 2GB Swap Kontrolü (2GB RAM sunucularda build sırasında çöküşü önler)
if [ ! -f /swapfile ]; then
    echo "⚙️ [1/6] 2GB Swap alanı oluşturuluyor..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✅ Swap başarıyla aktif edildi."
else
    echo "✅ [1/6] Swap alanı zaten mevcut."
fi

# 2. Dizin Kontrolü
cd "$APP_DIR"

# 3. Git Güncellemesi
echo "📥 [2/6] En güncel kodlar çekiliyor ($BRANCH)..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

# 4. Bağımlılıkların Kurulması & Standalone Node Adapter
echo "📦 [3/6] npm bağımlılıkları kuruluyor..."
npm install --no-audit --prefer-offline
npm install @astrojs/node --no-audit --prefer-offline || true

# 5. Astro Standalone Node Derlemesi (Atomic Build)
# Build sırasında hata olursa mevcut dist klasörü bozulmaz: yeni çıktı
# dist-next içine üretilir, yalnızca build başarılıysa dist ile değiştirilir.
echo "🏗️ [4/6] Astro standalone sunucu derlemesi başlatılıyor (DEPLOY_TARGET=node npm run build)..."
rm -rf dist-next
if ! ASTRO_OUTPUT_DIR=dist-next DEPLOY_TARGET=node npm run build; then
    rm -rf dist-next
    echo "❌ Build başarısız; mevcut production dist klasörü korundu."
    exit 1
fi

echo "🔁 Yeni dist atomik olarak aktarılıyor..."
rm -rf dist-prev
if [ -d dist ]; then
    mv dist dist-prev
fi
mv dist-next dist
rm -rf dist-prev

# 6. PM2 Servis Başlatma / Sıfır Kesintiyle Yenileme (Reload)
echo "🚀 [5/6] PM2 servisleri yenileniyor..."
if pm2 describe phukettatili > /dev/null 2>&1; then
    pm2 reload ecosystem.config.cjs --update-env
else
    pm2 start ecosystem.config.cjs
    pm2 save
    pm2 startup || true
fi

# 7. Sağlık Kontrolü & Warm-up
# PM2 reload sonrası ilk istek soğuk başlangıç yiyebilir; kritik sayfaları
# proaktif olarak ısıtıp sağlık kontrolü de yapılır.
echo "🔍 [6/6] Sağlık kontrolü ve warm-up yapılıyor..."
sleep 2
health_ok=true
for path in "/" "/turlar" "/transferler" "/iletisim" "/site.webmanifest" "/sitemap-index.xml"; do
    if ! curl -s -f -o /dev/null "http://127.0.0.1:4321${path}"; then
        health_ok=false
        echo "⚠️ Uyarı: ${path} yanıt vermedi."
    fi
done
if ! curl -s -f -o /dev/null http://127.0.0.1:4321/api/health; then
    echo "ℹ️ /api/health bulunmuyor; ana sayfa kontrolüne göre devam ediliyor."
fi

if [ "$health_ok" = true ]; then
    echo "=========================================================="
    echo "🎉 DAĞITIM BAŞARIYLA TAMAMLANDI! (PM2 Çalışıyor)"
    echo "=========================================================="
    pm2 status phukettatili
else
    echo "❌ Dağıtım doğrulaması başarısız. PM2 loglarını inceleyin:"
    echo "   pm2 logs phukettatili"
    exit 1
fi
