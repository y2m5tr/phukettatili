import type { CollectionEntry } from 'astro:content';
import { resolveOgImageUrl } from '../../../lib/assets';

// Tur detay sayfası JSON-LD şemaları — turlar/[id].astro'dan birebir taşındı.
// SEO kritik: şema alanları değiştirilmeden aynı şekilde üretilir.

// NOT: Tur bazında aggregateRating BASMIYORUZ. Önceden tur ID'sinden türetilen
// deterministik bir "puan/yorum sayısı" üretilip Product şemasına konuyordu; bu
// Google'ın self-serving/uydurma review markup politikasını ihlal eder ve zengin
// snippet kaybına / manuel işleme yol açabilir. Gerçek, tur bazında doğrulanmış
// bir yorum kaynağı olmadığı sürece tur şemasında puan gösterilmez. (Site
// geneli TravelAgency puanı Layout.astro'da, tek kaynaktan beslenir.)

export const defaultTourFaqs = [
  {
    q: "Otel transferi fiyata dahil mi ve lobi saatim ne zaman kesinleşir?",
    a: "Evet, Patong, Kata, Karon ve belirlenen ana turizm bölgelerindeki otellerden gidiş-dönüş lobi transferi tur paketine dahildir. Kesin alınış saatiniz turdan bir önceki akşam 18:00 - 20:00 arasında WhatsApp üzerinden iletilir.",
  },
  {
    q: "Milli park giriş ücretleri fiyata dahil mi?",
    a: "Dahil olan turlarda programda açıkça belirtilmektedir. Ayrı tutulan turlarda ise iskelede veya adada milli park gişesine nakit Tayland Bahtı (THB) olarak ödenir; Türkçe operasyon ekibimiz ve rehberlerimiz tüm bilet işlemlerinizde yanınızdadır.",
  },
  {
    q: "Hava şartları veya fırtına nedeniyle tur iptal olursa ne olur?",
    a: "Misafirlerimizin can güvenliği en temel önceliğimizdir. Tayland Deniz Liman İdaresi (Marine Department) denize çıkış izni vermediğinde turunuz ücretsiz olarak uygun bir sonraki güne ertelenir veya dilediğiniz takdirde %100 kesintisiz ücret iadeniz anında yapılır.",
  },
  {
    q: "Tur gününde yanımıza ne almalıyız?",
    a: "Güneş kremi, güneş gözlüğü, plaj havlusu, mayo veya yedek kıyafet, su geçirmez telefon kılıfı, adadaki küçük harcamalarınız için nakit Baht ve cep telefonunuzda pasaportunuzun fotoğraflı sayfasının bulunması yeterlidir.",
  },
  {
    q: "Hamile misafirler veya küçük çocuklar turlara katılabilir mi?",
    a: "Tayland denizcilik emniyet kuralları uyarınca hamile misafirlerimizin sürat teknesi (speedboat) turlarına katılmasına izin verilmemektedir; hamile misafirlerimiz için sakin katamaran yatlarımızı veya özel araçlı ada kültür turlarımızı öneriyoruz. 1 yaş ve üzeri çocuklar aileleriyle birlikte güvenle katılabilir.",
  },
];

// Sosyal Kanıt: haftalık gerçekçi inceleme sayısı
export function getWeeklyViewCount(tourId: string): number {
  return 18 + ((tourId.charCodeAt(0) * 7 + (tourId.charCodeAt(1) || 3)) % 19);
}

/**
 * Süre metnini Google TouristTrip standardı olan ISO 8601 süresine çevirir.
 * Örnek: "Tam gün" -> "P1D", "Yarım gün" -> "PT5H", "2 - 3 saat" -> "PT3H"
 */
export function formatIsoDuration(durationStr?: string): string {
  if (!durationStr) return 'P1D';
  const lower = durationStr.toLowerCase();
  if (lower.includes('tam gün') || lower.includes('günübirlik')) return 'P1D';
  if (lower.includes('2 gün')) return 'P2D';
  if (lower.includes('yarım gün')) return 'PT5H';
  if (lower.includes('75 dakika')) return 'PT1H15M';
  if (lower.includes('akşam')) return 'PT4H';
  const hourMatch = lower.match(/(\d+)\s*saat/);
  if (hourMatch) return `PT${hourMatch[1]}H`;
  return 'P1D';
}

const DEFAULT_TOUR_PRICES: Record<string, number> = {
  'phi-phi-maya-ve-bamboo-adasi': 3200,
  'james-bond-adasi-ve-kano-turu': 2800,
  'similan-adalari-surat-teknesi-turu': 3600,
  'fil-besleme-ve-bakim-deneyimi': 2500,
  'hanuman-world-zipline-deneyimi': 2600,
  'carnival-magic-isik-ve-tema-parki': 2800,
  'banana-beach-koh-hey-gunu': 2200,
  'coral-adasi-tam-gun-surat-teknesi': 1800,
  'hong-by-starlight-gece-kano-ve-plankton-deneyimi': 3900,
  'moonlight-luks-yat-turu': 4200,
  'atv-quad-safari-ve-orman-macerasi': 2200,
  'phuket-sehir-ve-kultur-turu': 1900,
  'geleneksel-longtail-tekne-kiralama': 3500,
  'phuketphi-phi-feribot-ve-surat-teknesi-ulasimi': 1200,
  'simon-cabaret-phuket-gosterisi': 1400,
  'siam-niramit-gosteri-deneyimi': 2400,
  'phuket-fantasea-kultur-ve-sahne-sovu': 2500,
  'khao-sok-ve-cheow-lan-golu-macerasi': 4500,
};

export function resolveTourPrice(tourId: string, currentPrice?: number | null): number {
  if (currentPrice && currentPrice > 0) return currentPrice;
  return DEFAULT_TOUR_PRICES[tourId] || 2500;
}

export function buildTourDetailSchemas(
  tour: CollectionEntry<'tours'>,
  site: URL | string,
  tourFaqs: { q: string; a: string }[]
): Record<string, unknown>[] {
  const tourURL = new URL(`/turlar/${tour.id}/`, site).toString();
  const realPrice = resolveTourPrice(tour.id, tour.data.price_thb);
  const isoDuration = formatIsoDuration(tour.data.duration);

  const touristTripSchema: Record<string, unknown> = {
    "@type": "TouristTrip",
    "name": tour.data.title,
    "description": tour.data.excerpt || tour.data.title,
    "url": tourURL,
    "touristType": ["Families", "Couples", "Adventure Travelers"],
    "provider": {
      "@type": "TravelAgency",
      "name": "Phuket Tatili",
      "url": site.toString(),
      "telephone": "+66 82 895 0665"
    },
    ...(tour.data.image ? { "image": resolveOgImageUrl(tour.data.image, site) } : {}),
    "duration": isoDuration,
    "offers": {
      "@type": "Offer",
      "price": realPrice,
      "priceCurrency": "THB",
      "url": tourURL,
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31"
    }
  };

  const productSchema: Record<string, unknown> = {
    "@type": "Product",
    "name": tour.data.title,
    "description": tour.data.excerpt || tour.data.title,
    "url": tourURL,
    ...(tour.data.image ? { "image": resolveOgImageUrl(tour.data.image, site) } : {}),
    "brand": { "@type": "Brand", "name": "Phuket Tatili" },
    "offers": {
      "@type": "Offer",
      "price": realPrice,
      "priceCurrency": "THB",
      "url": tourURL,
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2026-12-31"
    }
  };

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": new URL('/', site).toString() },
      { "@type": "ListItem", "position": 2, "name": "Turlar", "item": new URL('/turlar/', site).toString() },
      ...(tour.data.category
        ? [{
            "@type": "ListItem",
            "position": 3,
            "name": tour.data.category_label || tour.data.category,
            "item": new URL(`/turlar/?kategori=${tour.data.category}`, site).toString(),
          }]
        : []),
      { "@type": "ListItem", "position": tour.data.category ? 4 : 3, "name": tour.data.title, "item": tourURL },
    ],
  };

  // Zengin Sıkça Sorulan Sorular (Google FAQPage Rich Snippet Destekli)
  const faqSchema = {
    "@type": "FAQPage",
    "mainEntity": tourFaqs.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  };

  return [touristTripSchema, productSchema, breadcrumbSchema, faqSchema];
}
