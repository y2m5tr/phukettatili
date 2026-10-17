import { getMarineSafetyStatus, type MarineSafetyReport, } from './marineWeather';

export type TourCategoryGroup = 'island_speedboat' | 'protected_bay' | 'inland_adventure' | 'evening_entertainment';

export interface TourSafetyEvaluation {
  tourTitle: string;
  categoryGroup: TourCategoryGroup;
  suitabilityScore: number; // 0 - 100
  status: 'recommended' | 'suitable' | 'caution' | 'not_recommended';
  badgeText: string;
  badgeColor: string;
  reason: string;
  departurePier?: string;
}

export interface LiveRadarReport {
  marineReport: MarineSafetyReport;
  generalVerdict: 'perfect' | 'moderate' | 'action_needed';
  generalTitle: string;
  generalAdvice: string;
  topRecommendedTours: TourSafetyEvaluation[];
  cautionTours: TourSafetyEvaluation[];
  evaluations: TourSafetyEvaluation[];
}

/**
 * Tur başlığına göre güvenlik kategorisini tespit eder.
 */
export function categorizeTourForSafety(tourTitle: string): TourCategoryGroup {
  const t = tourTitle.toLowerCase();
  
  if (
    t.includes('carnival') ||
    t.includes('fantasea') ||
    t.includes('siam niramit') ||
    t.includes('simon') ||
    t.includes('cabaret')
  ) {
    return 'evening_entertainment';
  }

  if (
    t.includes('fil') ||
    t.includes('elephant') ||
    t.includes('zipline') ||
    t.includes('hanuman') ||
    t.includes('atv') ||
    t.includes('safari') ||
    t.includes('sehir') ||
    t.includes('şehir') ||
    t.includes('rafting')
  ) {
    return 'inland_adventure';
  }

  if (
    t.includes('james bond') ||
    t.includes('hong') ||
    t.includes('starlight') ||
    t.includes('kano') ||
    t.includes('phang nga')
  ) {
    return 'protected_bay';
  }

  // Varsayılan: Açık deniz ada turları (Phi Phi, Similan, Racha, Coral, Khai vb.)
  return 'island_speedboat';
}

/**
 * Canlı deniz durumuna göre turun güvenlik ve konfor skorunu hesaplar.
 */
export function evaluateTourSafety(tourTitle: string, marine: MarineSafetyReport): TourSafetyEvaluation {
  const categoryGroup = categorizeTourForSafety(tourTitle);
  const wave = marine.waveHeightMeters;
  const level = marine.level;

  if (categoryGroup === 'evening_entertainment') {
    return {
      tourTitle,
      categoryGroup,
      suitabilityScore: 100,
      status: 'recommended',
      badgeText: '🌟 %100 Hava Bağımsız',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      reason: 'Kapalı ve klimalı gösteri salonu; deniz veya hava koşullarından kesinlikle etkilenmez.',
    };
  }

  if (categoryGroup === 'inland_adventure') {
    if (level === 'severe') {
      return {
        tourTitle,
        categoryGroup,
        suitabilityScore: 85,
        status: 'recommended',
        badgeText: '🛡️ En Güvenli Kaçış Rotası',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        reason: 'Deniz dalgalı olduğu günlerde kara ve doğa aktiviteleri aileniz için en güvenli ve keyifli seçenektir.',
      };
    }
    return {
      tourTitle,
      categoryGroup,
      suitabilityScore: 95,
      status: 'recommended',
      badgeText: '🌿 Mükemmel Doğa Koşulları',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      reason: 'Fil besleme, ATV safari ve zipline için zemin ve hava koşulları elverişlidir.',
    };
  }

  if (categoryGroup === 'protected_bay') {
    if (level === 'severe') {
      return {
        tourTitle,
        categoryGroup,
        suitabilityScore: 78,
        status: 'suitable',
        badgeText: '🛶 Sakin İç Körfez',
        badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        reason: 'Phang Nga Körfezi dev kireçtaşı adalarıyla çevrili olduğundan açık deniz dalgasını içeri almaz; kano güvenle yapılır.',
        departurePier: 'Ao Po Grand Marina',
      };
    }
    return {
      tourTitle,
      categoryGroup,
      suitabilityScore: 98,
      status: 'recommended',
      badgeText: '⭐ Çarşaf Gibi Körfez Suları',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      reason: 'Körfez içi su durgun; deniz tutması riski sıfıra yakındır.',
      departurePier: 'Ao Po Grand Marina',
    };
  }

  // island_speedboat (Açık deniz)
  if (level === 'severe') {
    return {
      tourTitle,
      categoryGroup,
      suitabilityScore: 30,
      status: 'not_recommended',
      badgeText: '⚠️ Yüksek Dalga Uyarısı',
      badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      reason: `Açık denizde dalga boyu ${wave}m seviyesinde. Sürat teknesi yerine korunaklı James Bond Körfezi veya kara turları önerilir.`,
      departurePier: tourTitle.toLowerCase().includes('similan') ? 'Thap Lamu Pier' : 'Rassada Pier',
    };
  }

  if (level === 'moderate') {
    return {
      tourTitle,
      categoryGroup,
      suitabilityScore: 72,
      status: 'caution',
      badgeText: '🌊 Orta Dalgalı Seyir',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      reason: `Dalga boyu yaklaşık ${wave}m. Bebekli ailelerin ve hassas misafirlerin teknenin arka sıralarında oturması tavsiye edilir.`,
      departurePier: tourTitle.toLowerCase().includes('similan') ? 'Thap Lamu Pier' : 'Rassada Pier',
    };
  }

  return {
    tourTitle,
    categoryGroup,
    suitabilityScore: 95,
    status: 'recommended',
    badgeText: '✨ Mükemmel Seyir & Berrak Su',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    reason: `Dalga boyu sadece ${wave}m; turkuaz koylarda yüzme ve şnorkel için harika bir gün.`,
    departurePier: tourTitle.toLowerCase().includes('similan') ? 'Thap Lamu Pier' : 'Rassada Pier',
  };
}

/**
 * Tüm turlar için canlı güvenlik radarı raporu üretir.
 */
export async function getLiveTourSafetyRadar(tourTitles: string[] = []): Promise<LiveRadarReport> {
  const marineReport = await getMarineSafetyStatus();
  
  const defaultTours = tourTitles.length > 0 ? tourTitles : [
    'Phi Phi, Maya Bay ve Bamboo Adası',
    'James Bond Adası ve Kano Turu',
    'Hong by Starlight Gece Kano ve Plankton',
    'Similan Adaları Sürat Teknesi Turu',
    'Fil Besleme ve Bakım Deneyimi',
    'Hanuman World Zipline Deneyimi',
    'ATV Quad Safari ve Orman Macerası',
    'Carnival Magic Işık ve Tema Parkı',
    'Simon Cabaret Phuket Gösterisi',
    'Moonlight Lüks Yat Turu',
  ];

  const evaluations = defaultTours.map((t) => evaluateTourSafety(t, marineReport));

  let generalVerdict: LiveRadarReport['generalVerdict'] = 'perfect';
  let generalTitle = '🟢 Tüm Phuket Rotalarında Seyir Güvenli & Mükemmel';
  let generalAdvice = 'Andaman Denizi sakin; ada turları, açık deniz katamaranları ve şnorkel için hava şartları fevkalade uygundur.';

  if (marineReport.level === 'severe') {
    generalVerdict = 'action_needed';
    generalTitle = '🔴 Açık Denizde Dalga Uyarısı — Korunaklı Rotalar Önerilir';
    generalAdvice = 'Phi Phi ve Similan açık denizinde dalga yüksektir. Bugün için en konforlu seçenekler James Bond Körfezi kano turu veya Fil Koruma Alanı aktivitesidir.';
  } else if (marineReport.level === 'moderate') {
    generalVerdict = 'moderate';
    generalTitle = '🟡 Orta Dalgalı Deniz — Sakin Rotalar ve Arka Sıralar Tercih Edilmeli';
    generalAdvice = 'Açık deniz geçişlerinde hafif çalkantı olabilir. Konfor arayan misafirlerimiz için iç körfez kano turları ve doğa turları idealdir.';
  }

  const topRecommendedTours = evaluations
    .filter((e) => e.status === 'recommended')
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  const cautionTours = evaluations.filter((e) => e.status === 'caution' || e.status === 'not_recommended');

  return {
    marineReport,
    generalVerdict,
    generalTitle,
    generalAdvice,
    topRecommendedTours,
    cautionTours,
    evaluations,
  };
}
