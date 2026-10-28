# Phuket Tatili — Astro + React + Supabase

Phuket'te Türkçe rehberli turlar, VIP transferler ve özel yat kiralama hizmetleri sunan premium turizm platformu.

## Teknoloji Yığını

- **Framework:** Astro 7 (SSR + Prerender)
- **UI:** React 19 + Tailwind CSS 4
- **Veritabanı:** Supabase (PostgreSQL + Storage + Realtime)
- **Dağıtım:** VPS (Node.js Standalone) veya Vercel
- **Test:** Vitest + Playwright
- **Kalite:** Biome lint + 500 satır kuralı

## Hızlı Başlangıç

```sh
# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat (arka planda)
npm run dev

# Durum kontrolü
npm run astro dev status

# Logları görüntüle
npm run astro dev logs

# Sunucuyu durdur
npm run astro dev stop
```

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (localhost:4321) |
| `npm run build` | Üretim build'i (`dist/`) |
| `npm run preview` | Build önizleme (yalnızca Node adapter'da) |
| `npm run check` | Astro check + Biome lint + 500 satır kuralı |
| `npm test` | Vitest unit testleri (498 test) |
| `npm run e2e` | Playwright e2e testleri (7 kritik yol) |

## Ortam Değişkenleri

`.env.example` dosyasını `.env` olarak kopyalayın:

```sh
cp .env.example .env
```

Gerekli değişkenler:

| Değişken | Açıklama |
|----------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | Servis rolü anahtarı (RLS bypass) |
| `ADMIN_PASSCODE` | Admin panel giriş şifresi |
| `PUBLIC_SUPABASE_ANON_KEY` | Client-side realtime anahtarı |
| `WHATSAPP_CLOUD_TOKEN` | WhatsApp Business API token |
| `CRON_SECRET` | Cron job doğrulama anahtarı |

## VPS Dağıtımı (Ubuntu 24.04 / 22.04)

### 1. Sunucu Hazırlığı

```sh
# Güncelleme
sudo apt update && sudo apt upgrade -y

# Node.js 22 LTS kurulumu
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 kurulumu
sudo npm install -g pm2

# Nginx kurulumu
sudo apt install -y nginx

# Projeyi klonla
git clone https://github.com/y2m5tr/phukettatili.git /var/www/phukettatili
cd /var/www/phukettatili
```

### 2. Nginx Konfigürasyonu

```sh
sudo cp scripts/nginx-phukettatili.conf /etc/nginx/sites-available/phukettatili
sudo ln -s /etc/nginx/sites-available/phukettatili /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. SSL Sertifikası

```sh
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d phukettatili.com -d www.phukettatili.com
```

### 4. Uygulama Dağıtımı

```sh
cd /var/www/phukettatili
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

Script otomatik olarak:
- 2GB swap oluşturur (yoksa)
- Kodları günceller
- Bağımlılıkları kurar
- Atomic build yapar (`dist-next` → `dist`)
- PM2 ile sunucuyu başlatır/yeniler
- Kritik sayfaları warm-up yapar
- Sağlık kontrolü gerçekleştirir

### 5. Cron Job Kurulumu

```sh
crontab -e
```

`scripts/crontab.example` içeriğini ekleyin.

### 6. Logrotate

```sh
sudo cp scripts/logrotate-phukettatili /etc/logrotate.d/phukettatili
sudo chmod 644 /etc/logrotate.d/phukettatili
```

## Güvenlik

- `/admin` rotaları middleware ile fail-closed korumalı
- Service role anahtarı yalnızca server-side
- Nginx auth rate limit (10 req/dk, burst 5)
- Admin paneller oturum gerektirir
- Service worker admin sayfalarını cache'lemez

## Performans

- Hero görselleri AVIF/WebP responsive srcset
- `prefers-reduced-motion` desteği
- Service worker offline cache
- PM2 cluster mode (2 instance)
- Nginx immutable cache (`/_astro/*`)
- 640px mobil görsel varyantları

## Proje Yapısı

```
/
├── src/
│   ├── components/     # React + Astro bileşenleri
│   ├── pages/          # Rotalar
│   ├── lib/            # Yardımcı fonksiyonlar
│   ├── content/        # CMS içerikleri
│   └── styles/         # Global CSS
├── scripts/            # Deploy + bakım araçları
├── public/             # Statik dosyalar
├── tests/              # Unit testler
└── e2e/                # Playwright testleri
```

## Sorun Giderme

### Build başarısız
```sh
rm -rf dist node_modules
npm install
DEPLOY_TARGET=node npm run build
```

### PM2 durdu
```sh
pm2 logs phukettatili
pm2 restart phukettatili
```

### Nginx 502
```sh
sudo nginx -t
pm2 status
curl -f http://127.0.0.1:4321/
```

## Lisans

Proprietary — Phuket Tatili
