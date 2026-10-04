# Phuket Tatili 2 — Modern Astro + Content Collections Altyapısı

WordPress bağımlılığını ortadan kaldıran, statik olarak derlenen, sıfır sunucu bakımı gerektiren ve tip güvenli **Phuket Tatili** web platformu.

## 🚀 Proje Özellikleri

- **Framework:** [Astro v4](https://astro.build/) (Static Site Generation / Island Architecture)
- **Veri Modeli:** Tip güvenli **Content Collections** (Zod doğrulama şemaları)
  - `src/content/tours/` (Markdown formatında tur detayları, meta alanlar, SSS, program)
  - `src/content/categories/` (JSON formatında 2 seviyeli hiyerarşik kategori ağacı)
  - `src/content/services/` (Paketler, Oteller, Transferler, VIP & Özel)
- **Tasarım:** Saf CSS Design Tokens, DM Sans & Playfair Display editoryal tipografi, mobil odaklı duyarlı düzen.
- **Dönüşüm:** Doğrudan WhatsApp (`+66 82 895 0665`) planlama ve rezervasyon entegrasyonu.
- **SEO & Şema:** Tam uyumlu meta etiketleri, OpenGraph, Twitter Cards ve `Schema.org TouristTour` JSON-LD yapılandırılmış verisi.
- **Medya:** Responsive WebP görselleri, lazy loading ve modern asset yönetimi (`public/assets/`).

## 🛠️ Yerel Geliştirme

```bash
# Bağımlılıkları yükle (gerekirse)
npm install

# Geliştirme sunucusunu başlat (http://localhost:4321)
npm run dev

# Üretim için statik derleme (dist/ klasörü)
npm run build

# Derlenen çıktıyı önizle
npm run preview
```

## 📂 Dizin Yapısı

```text
PhuketTatili2/
├── public/assets/          # WebP görseller, marka ikonları ve SVG'ler
├── src/
│   ├── components/         # Header, Footer, TourCard, CategoryNav, IntentPlanner, FloatingWhatsApp
│   ├── content/
│   │   ├── config.ts       # Zod koleksiyon şemaları (Turlar, Kategoriler, Hizmetler)
│   │   ├── tours/          # Tekil tur markdown dosyaları (.md)
│   │   ├── categories/     # Hiyerarşik kategori JSON dosyaları (.json)
│   │   └── services/       # 4 temel hizmet sayfası JSON dosyaları (.json)
│   ├── layouts/
│   │   └── Layout.astro    # Global SEO, fontlar ve ana sayfa şablonu
│   ├── pages/
│   │   ├── index.astro     # Ana sayfa (Hero, Intent Planner, Katalog, SSS)
│   │   ├── 404.astro       # Özel 404 sayfası
│   │   ├── gizlilik-ve-kosullar.astro # Yasal bilgilendirme
│   │   ├── [service].astro # Dinamik hizmet sayfaları
│   │   ├── turlar/
│   │   │   ├── index.astro # Tüm turlar arşivi
│   │   │   └── [slug].astro # Tekil tur detay sayfaları
│   │   └── tur-kategorisi/
│   │       └── [category].astro # Kategori & alt kategori sayfaları
│   ├── styles/
│   │   └── global.css      # Tasarım sistemi, değişkenler ve stil tanımları
│   └── utils/
│       └── whatsapp.ts     # WhatsApp URL üretici ve fiyat formatlayıcı
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

## 📝 Yeni Tur Ekleme Rehberi

`src/content/tours/` klasörü altına yeni bir `.md` dosyası ekleyin:

```markdown
---
title: "Tur Başlığı"
category: "island-tours" # veya adventure-tours, entertainment-tours, private-charters
subcategory: "phi-phi-islands"
category_label: "Phi Phi Adaları"
excerpt: "Tur özeti ve öne çıkan detaylar."
image: "pileh.webp"
price_type: "quote" # veya 'fixed', 'starting'
price_thb: null # veya rakam, örn: 2500
duration: "Tam gün"
included:
  - "Otel transferi"
  - "Öğle yemeği"
excluded:
  - "Kişisel harcamalar"
program:
  - "08:00 - Otelden hareket"
  - "16:00 - İskeleye dönüş"
faq:
  - q: "Soru metni?"
    a: "Cevap metni."
restrictions:
  - "Hamileler için uygun değildir"
featured: false
order: 10
---

## Rota Hakkında
Tur detay açıklaması ve önemli notlar...
```
