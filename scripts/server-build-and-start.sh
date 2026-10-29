#!/usr/bin/env bash
set -e

cd /var/www/phukettatili

echo "=== [1/5] NPM BAGIMLILIKLARI KURULUYOR ==="
npm install --prefer-offline --no-audit

echo "=== [2/5] @astrojs/node ADAPTER KURULUYOR ==="
npm install @astrojs/node --no-audit --prefer-offline

echo "=== [3/5] ASTRO STANDALONE NODE BUILD ==="
DEPLOY_TARGET=node npm run build

echo "=== [4/5] PM2 ILE SERVISIN BASLATILMASI ==="
pm2 delete phukettatili 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "=== [5/5] NGINX YAPILANDIRMASI ==="
cat << 'NGINX_EOF' > /etc/nginx/sites-available/phukettatili
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name phukettatili.com www.phukettatili.com 87.192.36.63 wao8426iy8.verunix.com.tr;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    location ~* \.(webp|jpg|jpeg|png|gif|svg|ico|css|js|woff2|woff|ttf)$ {
        root /var/www/phukettatili/dist/client;
        expires 30d;
        add_header Cache-Control "public, no-transform, max-age=2592000";
        try_files $uri @astro_node;
    }

    location ~* ^/_astro/ {
        root /var/www/phukettatili/dist/client;
        etag on;
        add_header Cache-Control "public, immutable, max-age=31536000";
        try_files $uri @astro_node;
    }

    location / {
        try_files $uri @astro_node;
    }

    location @astro_node {
        proxy_pass http://127.0.0.1:4321;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/phukettatili /etc/nginx/sites-enabled/phukettatili
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "=== CRONTAB AKTIFLESTIRILIYOR ==="
crontab scripts/crontab.example

echo "=== KURULUM TAMAMLANDI! ==="
pm2 status
