# Deployment Guide

Phuket Tatili 2 statik bir sitedir ve çeşitli platformlarda deploy edilebilir.

## Vercel

```bash
# Vercel CLI kurulumu
npm i -g vercel

# Deploy
vercel
```

### Vercel Dashboard
1. GitHub/GitLab reposunu bağlayın
2. Framework preset: **Astro**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables ekleyin:
   - `SITE_URL`
   - `WHATSAPP_PHONE`

## Netlify

```bash
# Netlify CLI kurulumu
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Netlify Configuration (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

## Cloudflare Pages

1. GitHub reposunu bağlayın
2. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Environment variables ekleyin

## Manual Static Hosting

```bash
# Build
npm run build

# dist/ klasörünü herhangi bir static hosting'e yükleyin:
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - DigitalOcean Spaces
# - GitHub Pages
```

## Environment Variables

Production deployment için gerekli environment variables:

```env
SITE_URL=https://phukettatili.com
WHATSAPP_PHONE=+66828950665
```

## Performance Checklist

- ✅ Sitemap otomatik oluşturulur
- ✅ robots.txt yapılandırıldı
- ✅ WebP görseller optimize edildi
- ✅ CSS minimize edilir
- ✅ HTML sıkıştırılır
- ✅ Lazy loading aktif
- ✅ Response headers (cache, security)

## Post-Deployment

1. **Google Search Console** ile sitemap gönderin
2. **Core Web Vitals** ölçümlerini kontrol edin
3. **Lighthouse** audit çalıştırın
4. **WhatsApp** linklerini test edin
5. **404 sayfasını** test edin
6. Mobile responsive'liği doğrulayın
