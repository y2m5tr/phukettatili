/**
 * Akıllı Tur & Rota Sihirbazı Motoru ("Phuket Tatil Asistanı")
 *
 * Misafirin seyahat profili, tercih ettiği tatil ritmi ve gün sayısına göre
 * en uygun 2-3 turu eşleştirir ve hazır rezervasyon paketi oluşturur.
 */

export type TravelerProfile = 'honeymoon' | 'family' | 'friends' | 'solo';
export type VacationVibe = 'luxury_catamaran' | 'speedboat_islands' | 'nature_safari' | 'culture_night';
export type TripDuration = 'short' | 'medium' | 'long';

export interface WizardOption<T> {
  id: T;
  title: string;
  desc: string;
  icon: string;
}

export const TRAVELER_PROFILES: WizardOption<TravelerProfile>[] = [
  {
    id: 'honeymoon',
    title: 'Balayı & Romantik Çift',
    desc: 'Sakin koylar, gün batımı katamaranı ve özel anlar',
    icon: '💑',
  },
  {
    id: 'family',
    title: 'Aile & Çocuklu Tatil',
    desc: 'Güvenli plajlar, etik fil barınağı ve rahat tekneler',
    icon: '👨‍👩‍👧‍👦',
  },
  {
    id: 'friends',
    title: 'Arkadaş Grubu & Macera',
    desc: 'Zipline, ATV safari, Maya Bay ve eğlenceli adalar',
    icon: '🏄',
  },
  {
    id: 'solo',
    title: 'İlk Kez Gelenler & Solo',
    desc: 'Phuket klasikleri, ada turları ve Türkçe rehberlik',
    icon: '🧭',
  },
];

export const VACATION_VIBES: WizardOption<VacationVibe>[] = [
  {
    id: 'luxury_catamaran',
    title: 'Sakin Lüks Katamaran & Yat',
    desc: 'Dalgalardan uzak, geniş güvertede konfor ve gün batımı',
    icon: '⛵',
  },
  {
    id: 'speedboat_islands',
    title: 'Hızlı Bot ile Popüler Adalar',
    desc: 'Maya Bay, James Bond, Pileh Lagünü ve mercan resifleri',
    icon: '🚤',
  },
  {
    id: 'nature_safari',
    title: 'Doğa, Fil Barınağı & Macera',
    desc: 'Etik fil banyosu, yağmur ormanı kano ve zipline',
    icon: '🐘',
  },
  {
    id: 'culture_night',
    title: 'Kültür, Şovlar & Gece Hayatı',
    desc: 'Carnival Magic, Simon Cabaret ve Phuket Old Town',
    icon: '🎭',
  },
];

export const TRIP_DURATIONS: WizardOption<TripDuration>[] = [
  {
    id: 'short',
    title: '1 - 3 Gün',
    desc: 'Hızlı & En İkonik Phuket Deneyimi',
    icon: '⚡',
  },
  {
    id: 'medium',
    title: '4 - 6 Gün',
    desc: 'İdeal Rota: Hem Adalar Hem Doğa & Eğlence',
    icon: '🌴',
  },
  {
    id: 'long',
    title: '7+ Gün',
    desc: 'Eksiksiz Andaman & Phuket Keşfi',
    icon: '✨',
  },
];

export interface TourCandidate {
  id: string;
  title: string;
  priceThb: number;
  duration?: string;
  image?: string;
  category?: string;
}

export interface WizardRecommendation {
  profile: TravelerProfile;
  vibe: VacationVibe;
  duration: TripDuration;
  packageTitle: string;
  packageBadge: string;
  packageSummary: string;
  recommendedTours: TourCandidate[];
  totalPriceThb: number;
  discountedPriceThb: number;
  perks: string[];
}

/**
 * Kullanıcı tercihlerine göre en uygun tur kombinasyonunu oluşturur.
 */
export function buildWizardRecommendation(
  profile: TravelerProfile,
  vibe: VacationVibe,
  duration: TripDuration,
  availableTours: TourCandidate[]
): WizardRecommendation {
  const safeTours = availableTours && availableTours.length > 0 ? availableTours : defaultMockTours();

  let selectedTours: TourCandidate[] = [];
  let packageTitle = 'Size Özel Phuket Tatil Paketi';
  let packageBadge = 'ÖZEL SEÇİM';
  let packageSummary = 'Phuket tatiliniz için özenle bir araya getirilmiş Türkçe rehberli rota.';
  const perks: string[] = ['Otelden çift yönlü transfer dahil', 'Milli Park giriş ücretleri dahil'];

  if (profile === 'honeymoon' || vibe === 'luxury_catamaran') {
    packageTitle = 'Romantik Balayı & Lüks Katamaran Rotası';
    packageBadge = 'ÇİFTLERE ÖZEL VIP';
    packageSummary = 'Kalabalıktan uzak koylar, gün batımı katamaranı ve kristal berraklığında turkuaz lagünler.';
    perks.push('Özel meyve sepeti & soğuk içecek ikramı', 'VIP masa ve şezlong önceliği');

    const yacht = safeTours.find((t) => t.id.includes('moonlight') || t.id.includes('yat') || t.id.includes('charter')) || safeTours[0];
    const phiphi = safeTours.find((t) => t.id.includes('phi-phi') || t.id.includes('maya')) || safeTours[1] || safeTours[0];
    selectedTours = [yacht, phiphi];

    if (duration !== 'short') {
      const sunset = safeTours.find((t) => t.id.includes('james-bond') || t.id.includes('hong')) || safeTours[2] || safeTours[0];
      selectedTours.push(sunset);
    }
  } else if (profile === 'family') {
    packageTitle = 'Keyifli & Konforlu Aile Tatili Paketi';
    packageBadge = 'AİLE DOSTU ROTA';
    packageSummary = 'Çocuklar için güvenli plajlar, etik fil deneyimi ve eğlenceli ışık şovları.';
    perks.push('Çocuklar için özel can yeleği & şnorkel', 'Klimalı konforlu VIP minivan transferi');

    const elephant = safeTours.find((t) => t.id.includes('fil') || t.id.includes('elephant')) || safeTours[0];
    const coral = safeTours.find((t) => t.id.includes('coral') || t.id.includes('banana') || t.id.includes('phi-phi')) || safeTours[1] || safeTours[0];
    selectedTours = [elephant, coral];

    if (duration !== 'short') {
      const show = safeTours.find((t) => t.id.includes('carnival') || t.id.includes('fantasea') || t.id.includes('siam')) || safeTours[2] || safeTours[0];
      selectedTours.push(show);
    }
  } else if (vibe === 'nature_safari' || profile === 'friends') {
    packageTitle = 'Adrenalin & Doğa Kaşifi Paketi';
    packageBadge = 'MACERA & KEŞİF';
    packageSummary = 'Zipline, kano ile deniz mağaraları, sürat teknesiyle Phi Phi ve ATV orman safarisi.';
    perks.push('Tüm macera güvenlik ekipmanları', 'Profesyonel rehber & su geçirmez çanta');

    const phiphi = safeTours.find((t) => t.id.includes('phi-phi') || t.id.includes('maya')) || safeTours[0];
    const safari = safeTours.find((t) => t.id.includes('atv') || t.id.includes('hanuman') || t.id.includes('zipline') || t.id.includes('khao-sok')) || safeTours[1] || safeTours[0];
    selectedTours = [phiphi, safari];

    if (duration !== 'short') {
      const jamesBond = safeTours.find((t) => t.id.includes('james-bond') || t.id.includes('hong')) || safeTours[2] || safeTours[0];
      selectedTours.push(jamesBond);
    }
  } else {
    // Klasik & Solo Kaşif
    packageTitle = 'Phuket İkonları & Ada Rotaları Paketi';
    packageBadge = 'EN POPÜLER KLASİKLER';
    packageSummary = 'Phuket\'e ilk kez gelenlerin mutlaka görmesi gereken dünyaca ünlü adalar ve lagünler.';
    perks.push('Türkçe rehberlik & 7/24 operasyon desteği');

    const phiphi = safeTours.find((t) => t.id.includes('phi-phi')) || safeTours[0];
    const jamesBond = safeTours.find((t) => t.id.includes('james-bond')) || safeTours[1] || safeTours[0];
    selectedTours = [phiphi, jamesBond];

    if (duration !== 'short') {
      const city = safeTours.find((t) => t.id.includes('sehir') || t.id.includes('city') || t.id.includes('similan')) || safeTours[2] || safeTours[0];
      selectedTours.push(city);
    }
  }

  // Benzersiz turlar
  const uniqueTours = Array.from(new Map(selectedTours.map((t) => [t.id, t])).values());

  const totalPriceThb = uniqueTours.reduce((sum, t) => sum + (t.priceThb || 0), 0);
  // Çoklu tur paketi indirimi (%10)
  const discountedPriceThb = Math.round(totalPriceThb * 0.9);

  return {
    profile,
    vibe,
    duration,
    packageTitle,
    packageBadge,
    packageSummary,
    recommendedTours: uniqueTours,
    totalPriceThb,
    discountedPriceThb,
    perks,
  };
}

/**
 * WhatsApp için hazır sipariş / talep metni oluşturur.
 */
export function generateWizardWhatsAppUrl(
  rec: WizardRecommendation,
  guestCount = 2,
  whatsappNumber = '66828950665'
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const profileObj = TRAVELER_PROFILES.find((p) => p.id === rec.profile);
  const vibeObj = VACATION_VIBES.find((v) => v.id === rec.vibe);

  const lines = [
    `🌴 *Merhaba Phuket Tatili Ekibi, Tatil Asistanından Özel Rota Oluşturdum!*`,
    ``,
    `📌 *Seçtiğim Paket:* ${rec.packageTitle}`,
    `👤 *Profil:* ${profileObj?.icon || '🌴'} ${profileObj?.title || rec.profile}`,
    `⛵ *Tatil Ritmi:* ${vibeObj?.title || rec.vibe}`,
    `👥 *Kişi Sayısı:* ${guestCount} Kişi`,
    ``,
    `🗺️ *Önerilen Turlarımız:*`,
    ...rec.recommendedTours.map((t, i) => `  ${i + 1}. ${t.title} (${t.priceThb.toLocaleString('tr-TR')} THB)`),
    ``,
    `💰 *Paket Fiyatı:* ~${rec.discountedPriceThb.toLocaleString('tr-TR')} THB / Kişi başı (Paket İndirimli)`,
    ``,
    `Müsaitlik durumu, tarihlerimiz ve rezervasyon detayları hakkında bilgi alabilir miyim? Teşekkürler!`,
  ];

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function defaultMockTours(): TourCandidate[] {
  return [
    { id: 'phi-phi-maya-ve-bamboo-adasi', title: 'Phi Phi, Maya Bay & Bamboo Adası', priceThb: 3200 },
    { id: 'james-bond-adasi-ve-kano-turu', title: 'James Bond Adası & Kano Turu', priceThb: 2800 },
    { id: 'moonlight-luks-yat-turu', title: 'Moonlight Lüks VIP Katamaran', priceThb: 4500 },
    { id: 'fil-besleme-ve-bakim-deneyimi', title: 'Etik Fil Barınağı ve Çamur Banyosu', priceThb: 2600 },
    { id: 'carnival-magic-isik-ve-tema-parki', title: 'Carnival Magic Işık ve Tema Parkı', priceThb: 2500 },
  ];
}
