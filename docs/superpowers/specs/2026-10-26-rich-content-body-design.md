# Rich-Text Blog & Tur Gövdesi — Tasarım Dokümanı

## Amaç ve Neden

Bugün yönetim paneli blog ve tur **metadata**'sını (başlık, özet, kapak, tarih…) Supabase
`content_store`'a yazıyor ve SSR sayfalar bu overlay'i `.md` tabanının üstüne uyguluyor.
Ama **gövde** (body) yalnızca repo'daki `.md` dosyalarında yaşar: panelde gövde alanı yok,
`.md`'si olmayan cloud kaydı bilerek listelenmez (kırık detay sayfası linki üretmemek için).
Yeni yazı/tur için hâlâ dosya + commit + deploy gerekiyor.

**Hedef:** paneldeki editörle gövde yazıp kaydedince yazı deploy gerektirmeden canlıya
çıksın; `.md` tabanı bozulmadan, mevcut overlay mimarisinin bir parçası olarak.

## Hedefler

1. Blog yazısının gövdesi panelden WYSIWYG editörle yazılır/düzenlenir, `content_store`'a kaydedilir.
2. Tur detay gövdesi de aynı mekanizmayla düzenlenebilir (`TourItem.body` alanı zaten tipte var).
3. Gövdesi (cloud) olan **yeni** blog yazıları `.md` olmadan listelenir ve detay sayfası render olur.
4. Mevcut `.md` içerik akışı **hiç değişmez** — cloud gövdesi yoksa bugünkü davranış birebir korunur.
5. Sunucuda render edilen HTML **her koşulda sanitize edilir** (XSS: yalnızca yönetici yazsa bile
   savunma derinliği; toast'lı kopyala-yapıştır senaryoları, oturum ele geçirme riski).
6. SEO zinciri korunur: cloud-only blog yazıları dinamik blog sitemap'ine girer; robots.txt güncel.

## Hedef Olmayanlar / Anti-Hedefler

- Medya kütüphanesinden editör İÇİNE görsel ekleme (ilk sürümde metin + mevcut kapak akışı yeterli;
  editör içi upload ayrı iş — gerekirse sonra).
- `.md` dosyalarının panele importu/geri yazımı. Tek yönlü: panel → cloud.
- Tur gövdesinde program/akış (itinerary) verisiyle birleştirme — gövde bağımsız bir alandır.
- Versiyonlama/geçmiş. content_store tek kayıt yazar (bugünkü koleksiyon modeli aynen).

## Kısıtlar

- React 19 + Astro 7 + SSR (Vercel adapter); panel bileşenleri `React.lazy` ile kod-bölünümlü —
  editör bundle'ı da lazy yüklenmeli, dashboard'un ilk yüküne ekleme yapmamalı.
- 500 satır kuralı: yeni dosyalar < 500 satır; BlogModal 203 satır (yeni gövde alanı ayrı
  bileşene çıkmalı, modala değil).
- Çıplak `toLocaleString` yok; `fmtMoney` (tutarak ilgili değil ama proje kuralı).
- Service-role anahtar yalnızca SSR'da; client bundle sızıntı taraması (CI) yeşil kalmalı.
- Node ortamında vitest (jsdom yok): editör bileşeninin testleri render-smoke + saf fonksiyon
  testleriyle olmalı (renderToString effect/toolbar event'leri tetiklemez — bilinçli sınırlama).
- Bağımlılık tercihi: **TipTap v3** (`@tiptap/react`, `@tiptap/starter-kit`) — React 19 desteği,
  lazy import ile ağır olmayan ilk yük, HTML çıktısı standart. Alternatif Quill daha küçük ama
  React 19 sarmalayıcıları ikinci sınıf. Bu benim çağrım; sen onaylarsa TipTap kalır.

## Nasıl — Parçalar

### 1. Veri modeli

- `BlogItem`'a `body?: string` (HTML) ve `slug?: string` (yeni yazı için URL kimliği) eklenir.
  `TourItem.body` zaten var — doldurulmaya başlanır.
- `blogContent.ts` / `tourContent.ts` overlay'i: `body`/`slug` alanlarını da ezer (string + boş
  değilse). Gövdesi olan cloud kaydı artık "listelenebilir" sayılır (yeni yazı akışı).
- Blog detay: cloud body varsa `render(post)` yerine `<div class="prose" set:html={body}>`;
  yoksa mevcut `<Content />`. Prose stilleri `global.css`'te zaten var (cloud gövdesi de
  markdown kaynaklı HTML'le aynı eleman setini ürettiği için aynı stil çalışır).

### 2. Panel editörü

- Yeni bileşen `src/components/admin/shared/RichTextEditor.tsx`: TipTap, lazy import'lu,
  temel araç çubuğu (kalın/italic/başlık/liste/link/blok alıntı) + kaynak HTML görünümü.
  > 500 satır olursa araç çubuğu alt bileşene bölünür.
- `BlogModal`'a "Gövde" alanı (editör) + yeni yazı için "slug" alanı; `TourModal`'a gövde
  alanı (ayrı sekme). Kaydetme bugünkü `saveCmsCollection` akışını kullanır — yeni uç nokta yok.

### 3. Sunucu sanitize + render

- `src/lib/server/sanitizeHtml.ts`: saf HTML temizleyici (izin listesi: p/h1-4/ul/ol/li/
  a[href http(s)]/strong/em/blockquote/br; her şey silinir). Bağımlılık: `sanitize-html`
  (sunucuda DOM gerektirmez, Astro SSR ile testi kolay). Editör çıktısı zaten temiz üretir —
  sanitize savunma derinliği; render'da her seferinde çalışır.
- 60 sn edge cache olan SSR sayfaları cache invalidation gerektirmez (metadata overlay ile
  aynı gecikme kabulü — panelde kaydet → ≤60 sn içinde canlı).

### 4. Yeni yazı akışı + SEO

- `.md`'si olmayan ama `body`'li blog kaydı listeye girer; detay `/blog/[slug veya id]` render eder.
- `sitemap-blog.xml.ts` cloud-only yazıları da listeler (mevcut pattern'in genişletilmesi).
- Liste sayfasında kırık link önleyici: `body`'si olmayan cloud-only kayıt hâlâ gizlenir
  (mevcut davranış).

### 5. Testler

- `sanitizeHtml` birim testleri: script/onclick/img silinir, izinli set kalır.
- overlay birim testleri: `body` ezmeyi, body'li cloud-only kaydın listeye girmesini, body'siz
  cloud-only kaydın gizlenmesini kilitler.
- `RichTextEditor` render-smoke (renderToString; TipTap client-only olduğundan SSR'da
  `useEffect`'siz ilk render dahi takılırsa `client:` island olarak sarılır — test bunu doğrular).

## Builder'a bırakılan kararlar

- TipTap şema/uzantı listesinin tam seti (yukarıdaki minimumun üzerindekiler).
- Editör araç çubuğu görsel düzeni (panel tasarım diline uyum: Tailwind 4, mevcut modal estetiği).
- `slug` çakışması çözümü sırası (mevcut .md id'leriyle çakışırsa panelde uyarı, otomatik
  sonek önerisi).

## Kayıtlar / Ölçüt

- `astro check` 0 hata, `npm test` yeşil, build + sızıntı taraması yeşil, 500 satır guard yeşil.
- Elle doğrulama: panelde yeni blog yazısı oluştur (gövde + başlık) → 60 sn içinde
  `/blog/<slug>/` canlıda 200 + gövde doğru stillenmiş.
- Mevcut bir `.md` yazısının gövdesini panelden değiştir → detay sayfası cloud gövdesini gösterir.
