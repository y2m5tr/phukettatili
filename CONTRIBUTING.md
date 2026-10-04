# Contributing to Phuket Tatili 2

Phuket Tatili 2 projesine katkıda bulunmak istediğiniz için teşekkürler!

## Geliştirme Süreci

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/PhuketTatili2.git
   cd PhuketTatili2
   npm install
   ```

2. **Branch Oluştur**
   ```bash
   git checkout -b feature/yeni-ozellik
   ```

3. **Geliştirme Yap**
   - Kodu yaz ve test et
   - `npm run check` ile TypeScript hatalarını kontrol et
   - `npm run format` ile kodu formatla

4. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: yeni özellik açıklaması"
   git push origin feature/yeni-ozellik
   ```

5. **Pull Request Aç**

## Commit Mesaj Formatı

Conventional Commits standardını kullanıyoruz:

- `feat:` - Yeni özellik
- `fix:` - Bug düzeltmesi
- `docs:` - Dokümantasyon değişikliği
- `style:` - Kod formatı (işlevsellik değişmez)
- `refactor:` - Kod iyileştirmesi
- `test:` - Test ekleme/düzeltme
- `chore:` - Build/araç değişiklikleri

## Kod Standartları

- TypeScript tip güvenliğini koru
- Zod şemalarına uy
- Responsive tasarım prensiplerini takip et
- Accessibility (a11y) standartlarına dikkat et
- SEO best practices uygula

## Yeni Tur Ekleme

`src/content/tours/` klasöründe yeni `.md` dosyası oluştur:

```markdown
---
title: "Tur Başlığı"
category: "island-tours"
excerpt: "Kısa açıklama"
image: "gorsel.webp"
price_type: "quote"
duration: "Tam gün"
---

## Tur Detayları
...
```

## Test Etme

```bash
npm run dev      # Geliştirme sunucusu
npm run check    # TypeScript kontrolü
npm run build    # Production build
npm test         # Test suite
```

## Sorular?

Herhangi bir sorunuz varsa issue açabilirsiniz.
