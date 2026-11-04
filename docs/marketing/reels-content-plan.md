# Instagram Reels İçerik Sistemi — Atomizasyon Planı

> Vaynerchuk modeli: bir "direk" (tur çekimi) → 15-20 mikro parça.
> Jab oranı 4:1 (değer ver : satış kancası). Türkçe, platform-yerlisi.

## Malzeme Envanteri (mevcut)

| Kaynak | Format | Parça potansiyeli |
|---|---|---|
| tours_video.mp4 (tanıtım filmi) | ~1-2 dk master | 8-10 kısa kesme |
| Misafir anları galerisi (guestMoments) | Fotoğraf + konum | 5-6 carousel/hikâye |
| Blog görselleri (129 varlık) | Fotoğraf | Carousel altyapısı |
| Saha operasyonu (gerçek zamanlı) | Telefon çekimi | sınırsız — doldurulacak |

## Sütunlar (içerik sütunları — her hafta her sütundan en az 1)

1. **💎 CEP Yanıtları** (jab): "Phuket turu kaç para?", "Balayında Phuket mi Maldivler mi?", "Phuket'te Kasım'da hava nasıl?" — Sharp'ın kategori giriş noktaları; blog yazımızın sesli/görsel hali.
2. **⛵ Sahada Bugün** (jab, document-don't-create): tekne kalkışı, karşılama tabelası, kahvaltı servisi — gerçek operasyon, kurgu değil.
3. **🎭 Misafir Anı** (jab): guestMoments kareleri + kısa hikâye.
4. **📍 30 saniyede bir rota** (yumuşak kanca): James Bond / Phi Phi / fil barınağı "ne olur, kaç para, kimin için".
5. **🎯 Teklif kanca** (right hook): paket + fiyat + WhatsApp — haftada 1'den fazla değil.

## Haftalık Ritim (5-7 parça, kapasite düşükse 5)

| Gün | Parça | Sütun |
|---|---|---|
| Pzt | CEP yanıtı (Reels, 30-45 sn) | 1 |
| Sal | Sahada bugün (story + Reels kesmesi) | 2 |
| Çar | Rota tanıtımı (Reels 30 sn) | 4 |
| Per | Misafir anı (carousel) | 3 |
| Cum | CEP yanıtı #2 (Reels) | 1 |
| Cmt | Teklif kanca (Reels, fiyat + WA) | 5 |
| Paz | (opsiyonel) hikâye anketi / quiz | 1 |

## Reels Yapı Şablonu (30-45 sn)

1. **Kanca (0-2 sn):** soru veya ters iddia — "Phuket'te 2.000 THB'ye fil beslenir mi? Evet."
2. **Gövde (2-35 sn):** 3-5 hızlı kesme, her biri metin katmanıyla (ses kapalı izlenir).
3. **Kapanış (35-45 sn):** tek CTA — profil linki veya "yorumlara YAZ".
4. Ses: trend sesi YOK ise orijinal saha sesi (motor, dalga) + altyazı.

## Ölçüm (GA4 zaten kurulu)

- `generate_lead` kaynak etiketi: `instagram_reels` (Tracking.astro'daki katmana ekle)
- Haftalık: erişim, profil bağlantı tıklaması, WA lead
- Aylık: hangi sütun lead üretiyor — 2 ay üst üste sıfır lead veren sütunu kes, yerine yenisini dene.

## Üretim Kuralı

- Bir tur gününde çekilen 20 dk ham görüntü → o akşam 5-6 parça kesilir, haftaya yayılır.
- "Macro sabır, mikro hız": 90 gün herhangi bir virüs beklemeden devam; 3. ayda sütun bazlı değerlendirme.
