import { fmtMoney } from './moneyFormat';
export type PackageDuration = 3 | 5 | 7;
export type TravelStyle = 'honeymoon' | 'family' | 'adventure' | 'vip_luxury';

export interface DayItineraryItem {
  dayNumber: number;
  dayTitle: string;
  tourTitle: string;
  timeSlot: string;
  category: 'island' | 'bay' | 'nature' | 'show' | 'transfer' | 'leisure';
  highlight: string;
  individualPriceThb: number;
}

export interface HolidayPackagePlan {
  duration: PackageDuration;
  style: TravelStyle;
  styleTitle: string;
  hotelZone: string;
  packageName: string;
  packageDescription: string;
  itinerary: DayItineraryItem[];
  totalIndividualPriceThb: number;
  discountPercentage: number;
  discountAmountThb: number;
  finalPackagePriceThb: number;
  perPersonThb: number;
}

const STYLE_NAMES: Record<TravelStyle, string> = {
  honeymoon: '💑 Çift & Balayı (Romantik & Konforlu)',
  family: '👨‍👩‍👧‍👦 Aile & Çocuk (Güvenli & Eğlenceli)',
  adventure: '⚡ Macera & Adrenalin (Heyecan Dolu)',
  vip_luxury: '👑 VIP & Lüks (Özel Yat & Premium)',
};

/**
 * Seçilen süre, tarz ve otele göre kişiselleştirilmiş Phuket tatil paketi üretir.
 */
export function generateHolidayPackage(
  duration: PackageDuration = 5,
  style: TravelStyle = 'honeymoon',
  hotelZone: string = 'Patong & Kalim'
): HolidayPackagePlan {
  let itinerary: DayItineraryItem[] = [];
  let packageName = '';
  let packageDescription = '';

  if (style === 'honeymoon') {
    if (duration === 3) {
      packageName = '3 Günlük Romantik Phuket Kaçamağı';
      packageDescription = 'Phuket\'e kısa ama unutulmaz bir aşk tatili. Durgun koylarda kano ve günbatımı şovu.';
      itinerary = [
        {
          dayNumber: 1,
          dayTitle: 'Havalimanı Karşılama & Akşam Simon Cabaret',
          tourTitle: 'Simon Cabaret VIP Phuket Gösterisi',
          timeSlot: '18:30 - 21:00',
          category: 'show',
          highlight: 'VIP ön sıra koltuklar ve ışıltılı sahne performansı.',
          individualPriceThb: 2300,
        },
        {
          dayNumber: 2,
          dayTitle: 'James Bond & Romantik Körfez Kano Deneyimi',
          tourTitle: 'James Bond Adası ve Phang Nga Kano Turu',
          timeSlot: '08:00 - 17:00',
          category: 'bay',
          highlight: 'Kireçtaşı mağaraları arasında çift kişilik özel kano gezisi.',
          individualPriceThb: 2800,
        },
        {
          dayNumber: 3,
          dayTitle: 'Etik Fil Barınağı & Havalimanı Uğurlama',
          tourTitle: 'Fil Besleme ve Çamur Banyosu Deneyimi',
          timeSlot: '09:00 - 13:00',
          category: 'nature',
          highlight: 'Kurtarılmış fillerle doğada özel anlar ve fotoğraf çekimi.',
          individualPriceThb: 2500,
        },
      ];
    } else if (duration === 5) {
      packageName = '5 Günlük Klasik Balayı & Ada Rüyası';
      packageDescription = 'Phi Phi Adaları\'nın turkuaz sularından günbatımı plankton kanosuna kadar en popüler balayı paketi.';
      itinerary = [
        {
          dayNumber: 1,
          dayTitle: 'VIP Havalimanı Transferi & Otele Yerleşme',
          tourTitle: 'Özel Havalimanı VIP Karşılama ve Transfer',
          timeSlot: 'Uçuş saatine göre',
          category: 'transfer',
          highlight: 'Klimalı lüks araç ve soğuk içecek ikramı ile otele konforlu geçiş.',
          individualPriceThb: 1800,
        },
        {
          dayNumber: 2,
          dayTitle: 'Turkuaz Cennet: Phi Phi & Maya Bay',
          tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası Sürat Teknesi',
          timeSlot: '07:30 - 16:30',
          category: 'island',
          highlight: 'The Beach filminin çekildiği efsanevi koyda şnorkel ve yüzme.',
          individualPriceThb: 3200,
        },
        {
          dayNumber: 3,
          dayTitle: 'Doğa & Dinlenme Günü',
          tourTitle: 'Fil Besleme ve Spa Bakım Deneyimi',
          timeSlot: '09:30 - 13:30',
          category: 'nature',
          highlight: 'Orman içinde fil terapisi ve öğleden sonra otel plajında dinlenme.',
          individualPriceThb: 2500,
        },
        {
          dayNumber: 4,
          dayTitle: 'Büyüleyici Gece Kano & Plankton Işıltısı',
          tourTitle: 'Hong by Starlight Gece Kano ve Plankton Deneyimi',
          timeSlot: '12:00 - 20:30',
          category: 'bay',
          highlight: 'Karanlıkta parlayan biyolüminesans planktonlar ve lagün sessizliği.',
          individualPriceThb: 3900,
        },
        {
          dayNumber: 5,
          dayTitle: 'Phuket Şehir Turu & Havalimanı Uğurlama',
          tourTitle: 'Phuket Şehir, Büyük Buda ve Manzara Tepeleri',
          timeSlot: '10:00 - 14:00',
          category: 'leisure',
          highlight: 'Old Town tarihi sokakları, Büyük Buda tapınağı ve hediyelik alışverişi.',
          individualPriceThb: 1500,
        },
      ];
    } else {
      // 7 Günlük
      packageName = '7 Günlük Kusursuz Romantik Phuket Deneyimi';
      packageDescription = 'Adalar, lüks yat günbatımı, milli parklar ve kültür gösterileriyle dolu tam kapsamlı rüya tatil.';
      itinerary = [
        {
          dayNumber: 1,
          dayTitle: 'VIP Havalimanı Karşılama & Dinlenme',
          tourTitle: 'Özel Havalimanı VIP Transferi',
          timeSlot: 'İniş saatine göre',
          category: 'transfer',
          highlight: 'Özel şoförlü VIP karşılama.',
          individualPriceThb: 1800,
        },
        {
          dayNumber: 2,
          dayTitle: 'Phi Phi & Bamboo Adası Keşfi',
          tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası Sürat Teknesi',
          timeSlot: '07:30 - 16:30',
          category: 'island',
          highlight: 'Maya Bay ve Pileh lagününde yüzme.',
          individualPriceThb: 3200,
        },
        {
          dayNumber: 3,
          dayTitle: 'Etik Fil Barınağı',
          tourTitle: 'Fil Besleme ve Çamur Banyosu',
          timeSlot: '09:00 - 13:00',
          category: 'nature',
          highlight: 'Fillerle doğal orman yürüyüşü.',
          individualPriceThb: 2500,
        },
        {
          dayNumber: 4,
          dayTitle: 'James Bond & Deniz Mağaraları',
          tourTitle: 'James Bond Adası ve Deniz Kanosu',
          timeSlot: '08:00 - 17:00',
          category: 'bay',
          highlight: 'Phang Nga Körfezi kano macerası.',
          individualPriceThb: 2800,
        },
        {
          dayNumber: 5,
          dayTitle: 'Lüks Günbatımı Katamaranı',
          tourTitle: 'Moonlight Lüks Yat & Günbatımı Turu',
          timeSlot: '14:00 - 19:30',
          category: 'island',
          highlight: 'Müzik, içecekler ve nefes kesici günbatımı seyri.',
          individualPriceThb: 3600,
        },
        {
          dayNumber: 6,
          dayTitle: 'Carnival Magic Işık Parkı',
          tourTitle: 'Carnival Magic Tema Parkı ve Açık Büfe',
          timeSlot: '17:30 - 22:30',
          category: 'show',
          highlight: 'Dünyanın en büyük LED ışık ve festival parkı.',
          individualPriceThb: 2800,
        },
        {
          dayNumber: 7,
          dayTitle: 'Phuket Şehir Turu & Havalimanı Ulaşımı',
          tourTitle: 'Phuket Şehir ve Kültür Turu',
          timeSlot: '10:00 - 15:00',
          category: 'leisure',
          highlight: 'Tarihi sokaklar ve havalimanına rahat transfer.',
          individualPriceThb: 2300,
        },
      ];
    }
  } else if (style === 'family') {
    // Aile
    packageName = `${duration} Günlük Eğlenceli Aile & Çocuk Paketi`;
    packageDescription = 'Çocukları yormayan, güvenli sığ koylarda yüzme, fil besleme ve muhteşem tema parkları.';
    itinerary = [
      {
        dayNumber: 1,
        dayTitle: 'Havalimanı Karşılama & Otele Yerleşme',
        tourTitle: 'Geniş Aile Minivanı ile Otel Transferi',
        timeSlot: 'İniş saatine göre',
        category: 'transfer',
        highlight: 'Bavullarınız ve çocuklarınızla konforlu transfer.',
        individualPriceThb: 1800,
      },
      {
        dayNumber: 2,
        dayTitle: 'Çocukların En Sevdiği: Fil Barınağı',
        tourTitle: 'Fil Besleme, Meyve Hazırlama ve Yıkama',
        timeSlot: '09:00 - 13:00',
        category: 'nature',
        highlight: 'Çocukların hayvan sevgisini pekiştiren güvenli etik barınak.',
        individualPriceThb: 2500,
      },
      {
        dayNumber: 3,
        dayTitle: 'Sakin Sular: Khai Adaları & Sığ Koylarda Şnorkel',
        tourTitle: 'Khai Adaları Yarım Gün Turu (Sığ & Güvenli Plaj)',
        timeSlot: '08:30 - 14:00',
        category: 'island',
        highlight: 'Kıyıdan sadece 1 metre mesafede renkli balıkları elle besleme.',
        individualPriceThb: 2300,
      },
    ];

    if (duration >= 5) {
      itinerary.push(
        {
          dayNumber: 4,
          dayTitle: 'Rüya Gibi Bir Akşam: Carnival Magic Işık Parkı',
          tourTitle: 'Carnival Magic Işık ve Tema Parkı (Akşam Yemeği Dahil)',
          timeSlot: '17:30 - 22:30',
          category: 'show',
          highlight: 'Guinness rekorlu ışık şovları ve çocuk oyun alanları.',
          individualPriceThb: 2800,
        },
        {
          dayNumber: 5,
          dayTitle: 'James Bond & Mağara Kanosu (Kaptanlı)',
          tourTitle: 'James Bond Adası Aile Kano Turu',
          timeSlot: '08:30 - 16:30',
          category: 'bay',
          highlight: 'Dalgasız sakin iç körfezde rehber eşliğinde kano.',
          individualPriceThb: 2800,
        }
      );
    }
    if (duration === 7) {
      itinerary.push(
        {
          dayNumber: 6,
          dayTitle: 'Phuket Fantasea Kültür Şovu',
          tourTitle: 'Phuket Fantasea Sahne ve Akşam Şovu',
          timeSlot: '18:00 - 22:00',
          category: 'show',
          highlight: 'Tayland mitolojisi, akrobasi ve dev açık büfe.',
          individualPriceThb: 2500,
        },
        {
          dayNumber: 7,
          dayTitle: 'Şehir Turu & Havalimanı Uğurlama',
          tourTitle: 'Büyük Buda & Şehir Turu Uğurlaması',
          timeSlot: '10:00 - 14:00',
          category: 'leisure',
          highlight: 'Panoramik manzara noktaları ve havalimanına geçiş.',
          individualPriceThb: 2300,
        }
      );
    }
  } else if (style === 'adventure') {
    // Macera
    packageName = `${duration} Günlük Adrenalin & Doğa Keşfi`;
    packageDescription = 'Zipline, ATV orman safarisi, sürat tekneleri ve tropik adalarla dolu macera temposu.';
    itinerary = [
      {
        dayNumber: 1,
        dayTitle: 'Havalimanı Transferi & Akşam Dinlenme',
        tourTitle: 'Özel Havalimanı Transferi',
        timeSlot: 'İniş saatine göre',
        category: 'transfer',
        highlight: 'Otele hızlı ve konforlu varış.',
        individualPriceThb: 1800,
      },
      {
        dayNumber: 2,
        dayTitle: 'Phi Phi & Bamboo Hızlı Sürat Teknesi',
        tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası Sürat Teknesi',
        timeSlot: '07:30 - 16:30',
        category: 'island',
        highlight: 'Adrenalin dolu deniz seyri ve derin su şnorkeli.',
        individualPriceThb: 3200,
      },
      {
        dayNumber: 3,
        dayTitle: 'Ormanın Tepesinde: Zipline & ATV Safari',
        tourTitle: 'Hanuman World Zipline & ATV Quad Combo Macerası',
        timeSlot: '08:30 - 14:30',
        category: 'nature',
        highlight: 'Yağmur ormanı gölgeliklerinde uçuş ve çamurlu patikalarda sürüş.',
        individualPriceThb: 3400,
      },
    ];

    if (duration >= 5) {
      itinerary.push(
        {
          dayNumber: 4,
          dayTitle: 'Efsanevi Similan Adaları (Berrak Turkuaz)',
          tourTitle: 'Similan Adaları Tam Gün Hızlı Tekne Turu',
          timeSlot: '06:00 - 18:00',
          category: 'island',
          highlight: 'Dünyanın en iyi 10 dalış/şnorkel noktasından biri.',
          individualPriceThb: 3600,
        },
        {
          dayNumber: 5,
          dayTitle: 'James Bond & Hızlı Kano',
          tourTitle: 'James Bond Adası ve Phang Nga Körfezi',
          timeSlot: '08:00 - 16:30',
          category: 'bay',
          highlight: 'Gizli deniz mağaralarında kano macerası.',
          individualPriceThb: 2800,
        }
      );
    }
    if (duration === 7) {
      itinerary.push(
        {
          dayNumber: 6,
          dayTitle: 'Beyaz Su Raftingi & Fil Safari',
          tourTitle: 'Phang Nga White Water Rafting ve Orman Turu',
          timeSlot: '07:30 - 16:00',
          category: 'nature',
          highlight: 'Nehirde akıntılara karşı rafting heyecanı.',
          individualPriceThb: 2900,
        },
        {
          dayNumber: 7,
          dayTitle: 'Şehir Turu & Havalimanı Transferi',
          tourTitle: 'Phuket Panoramik Şehir ve Havalimanı Turu',
          timeSlot: '10:00 - 14:00',
          category: 'leisure',
          highlight: 'Son gün manzaraları ve havalimanı transferi.',
          individualPriceThb: 2300,
        }
      );
    }
  } else {
    // VIP & Luxury
    packageName = `${duration} Günlük VIP & Özel Katamaran Deneyimi`;
    packageDescription = 'Özel yat, lüks günbatımları, VIP localar ve birinci sınıf konfor odaklı tatil.';
    itinerary = [
      {
        dayNumber: 1,
        dayTitle: 'VIP Karşılama & Otele Yerleşme',
        tourTitle: 'Özel VIP Havalimanı Transferi (Alphard / Lüks Van)',
        timeSlot: 'İniş saatine göre',
        category: 'transfer',
        highlight: 'Havalimanında isimli karşılama ve premium araç.',
        individualPriceThb: 1800,
      },
      {
        dayNumber: 2,
        dayTitle: 'Lüks Katamaran ile Phi Phi Günbatımı',
        tourTitle: 'Phi Phi & Maiton Lüks Yelkenli Katamaran Turu',
        timeSlot: '08:30 - 18:30',
        category: 'island',
        highlight: 'Geniş fileli güvertede güneşlenme, gurme öğle yemeği ve yunus arayışı.',
        individualPriceThb: 4200,
      },
      {
        dayNumber: 3,
        dayTitle: 'Moonlight Lüks Yat & Günbatımı',
        tourTitle: 'Moonlight Lüks Yat Deneyimi',
        timeSlot: '14:00 - 19:30',
        category: 'island',
        highlight: 'Akşam üzeri şampanya ikramı eşliğinde günbatımı.',
        individualPriceThb: 4200,
      },
    ];

    if (duration >= 5) {
      itinerary.push(
        {
          dayNumber: 4,
          dayTitle: 'Hong by Starlight Gece Kano & Plankton',
          tourTitle: 'Hong by Starlight Özel Kano ve Plankton Deneyimi',
          timeSlot: '12:00 - 20:30',
          category: 'bay',
          highlight: 'Kişiye özel rehber eşliğinde gece bioluminescent plankton keşfi.',
          individualPriceThb: 3900,
        },
        {
          dayNumber: 5,
          dayTitle: 'Siam Niramit VIP Gösteri & Açık Büfe',
          tourTitle: 'Siam Niramit Platin Koltuk ve Kraliyet Büfesi',
          timeSlot: '17:30 - 21:30',
          category: 'show',
          highlight: 'Dünyanın en yüksek sahnesinde kraliyet sahne sanatı.',
          individualPriceThb: 2600,
        }
      );
    }
    if (duration === 7) {
      itinerary.push(
        {
          dayNumber: 6,
          dayTitle: 'Özel Şoförlü Phuket Şehir & Gurme Turu',
          tourTitle: 'Kişiye Özel Tahsisli Şehir ve Gurme Keşfi',
          timeSlot: '10:00 - 16:00',
          category: 'leisure',
          highlight: 'Michelin rehberli lezzet durakları ve özel tapınak ziyaretleri.',
          individualPriceThb: 3500,
        },
        {
          dayNumber: 7,
          dayTitle: 'VIP Havalimanı Uğurlama',
          tourTitle: 'Özel VIP Havalimanı Transferi',
          timeSlot: 'Uçuş saatine göre',
          category: 'transfer',
          highlight: 'Kusursuz ve stressiz eve dönüş.',
          individualPriceThb: 1800,
        }
      );
    }
  }

  const totalIndividualPriceThb = itinerary.reduce((sum, item) => sum + item.individualPriceThb, 0);
  const discountPercentage = duration === 3 ? 10 : duration === 5 ? 12 : 15;
  const discountAmountThb = Math.round((totalIndividualPriceThb * discountPercentage) / 100);
  const finalPackagePriceThb = totalIndividualPriceThb - discountAmountThb;

  return {
    duration,
    style,
    styleTitle: STYLE_NAMES[style],
    hotelZone,
    packageName,
    packageDescription,
    itinerary,
    totalIndividualPriceThb,
    discountPercentage,
    discountAmountThb,
    finalPackagePriceThb,
    perPersonThb: finalPackagePriceThb,
  };
}

/**
 * Paket planını doğrudan WhatsApp rezervasyon ve danışmanlık metnine dönüştürür.
 */
export function generatePackageWhatsAppMessage(plan: HolidayPackagePlan): string {
  const lines = [
    `🌴 *PHUKET TATİLİ — AKILLI PAKET REZERVASYON TALEBİ* 🌴`,
    ``,
    `Merhaba! Sitenizdeki tatil sihirbazında kendime özel bir paket oluşturdum:`,
    `📌 *Paket:* ${plan.packageName}`,
    `📅 *Süre:* ${plan.duration} Gün / Program`,
    `✨ *Tatil Tarzı:* ${plan.styleTitle}`,
    `🏨 *Otel Bölgesi:* ${plan.hotelZone}`,
    ``,
    `📋 *GÜNLÜK TUR PROGRAMI:*`,
    ...plan.itinerary.map(
      (item) => `*${item.dayNumber}. Gün:* ${item.tourTitle} (${item.timeSlot})\n   ↳ _${item.highlight}_`
    ),
    ``,
    `💰 *FİYAT VE İNDİRİM BİLGİSİ:*`,
    `• Normal Tekil Toplam: ~${fmtMoney(plan.totalIndividualPriceThb)} THB~`,
    `• Paket İndirimi (%${plan.discountPercentage}): *-${fmtMoney(plan.discountAmountThb)} THB*`,
    `🎉 *Paket Avantajlı Fiyat (Kişi Başı): ${fmtMoney(plan.finalPackagePriceThb)} THB*`,
    ``,
    `Bu paketi 2 kişi için rezerve etmek ve müsaitlik teyidi almak istiyorum. Yardımcı olabilir misiniz? 🙏🇹🇭`,
  ];

  return lines.join('\n');
}
