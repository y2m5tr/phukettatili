/**
 * Akıllı Phuket Otel Bölgesi & Liman Alınış Saati Zeka Motoru
 * (Smart Pickup Matrix & Distance Intelligence)
 *
 * Phuket'in coğrafi yapısına göre otel bölgesi ve gidilecek turun kalkış iskelesi
 * arasındaki sürüş mesafesini analiz ederek ideal lobi bekleme saatini önerir ve
 * olası gecikme / tekne kaçırma risklerine karşı operatörü uyarır.
 */

export interface SmartPickupRecommendation {
  recommendedWindow: string; // Örn: "06:15 - 06:45"
  recommendedStart: string;  // Örn: "06:15"
  recommendedEnd: string;    // Örn: "06:45"
  estimatedDriveMinutes: number; // Örn: 85
  pierName: string;          // Örn: "Chalong Pier & Rassada Marina"
  pierRegion: string;        // Örn: "Güney & Güneydoğu Sahili"
  zoneDistanceCategory: 'near' | 'moderate' | 'far' | 'extreme_far';
  isDistanceWarning: boolean;
  warningMessage?: string;
  adviceNote: string;
}

/**
 * Otel bölgesi ve tur adına göre en uygun lobi alınış saati tavsiyesi ve uyarı durumunu üretir.
 */
export function getSmartPickupRecommendation(
  hotelZone: string = '',
  tourTitle: string = '',
  currentPickupTime: string = ''
): SmartPickupRecommendation {
  const z = (hotelZone || '').toLowerCase();
  const t = (tourTitle || '').toLowerCase();

  // 1. Liman & İskele Tespiti
  let pierName = 'Royal Phuket Marina / Rassada Pier';
  let pierRegion = 'Doğu Kıyısı';
  let isSimilan = false;
  let isAoPo = false;
  let isChalong = false;

  if (t.includes('similan') || t.includes('surin') || t.includes('khao sok') || t.includes('cheow lan')) {
    isSimilan = true;
    pierName = 'Thap Lamu Pier (Phang Nga / Kuzey)';
    pierRegion = 'Phuket Dışı - Phang Nga';
  } else if (t.includes('james bond') || t.includes('hong') || t.includes('starlight') || t.includes('phang nga bay') || t.includes('kano')) {
    isAoPo = true;
    pierName = 'Ao Po Grand Marina / Yamu Pier';
    pierRegion = 'Kuzeydoğu Sahili';
  } else if (t.includes('racha') || t.includes('coral') || t.includes('banana beach') || t.includes('balık') || t.includes('fishing') || t.includes('sunset') || t.includes('katamaran')) {
    isChalong = true;
    pierName = 'Chalong Pier / Panwa';
    pierRegion = 'Güney Sahili';
  }

  // 2. Bölge Mesafesi ve İdeal Saat Belirleme
  let recStart = '07:30';
  let recEnd = '07:45';
  let driveMin = 45;
  let distanceCat: 'near' | 'moderate' | 'far' | 'extreme_far' = 'moderate';
  let advice = 'Standart lobi alınış saati uygundur.';

  const isNorthZone = z.includes('mai khao') || z.includes('nai yang') || z.includes('havaliman') || z.includes('airport') || z.includes('naithon');
  const isMidNorthZone = z.includes('bang tao') || z.includes('laguna') || z.includes('surin') || z.includes('cherngtalay') || z.includes('thalang');
  const isKamala = z.includes('kamala');
  const isPatong = z.includes('patong') || z.includes('kalim') || z.includes('tri trang');
  const isSouthWest = z.includes('karon') || z.includes('kata');
  const isFarSouth = z.includes('rawai') || z.includes('nai harn') || z.includes('yanui');
  const isChalongArea = z.includes('chalong') || z.includes('panwa');
  const isPhuketTown = z.includes('town') || z.includes('şehir') || z.includes('koh kaew');

  if (isSimilan) {
    // Similan turları Phang Nga'da (Kuzeyde) başlar
    if (isNorthZone) {
      recStart = '06:30'; recEnd = '07:00'; driveMin = 55; distanceCat = 'moderate';
      advice = 'Oteliniz Sarasin Köprüsüne yakındır, sürüş süresi yaklaşık 55 dakikadır.';
    } else if (isMidNorthZone) {
      recStart = '06:00'; recEnd = '06:30'; driveMin = 75; distanceCat = 'far';
      advice = 'Similan iskelesi için erken hareket önerilir.';
    } else {
      // Patong, Kata, Karon, Rawai vb.
      recStart = '05:30'; recEnd = '06:00'; driveMin = 110; distanceCat = 'extreme_far';
      advice = 'Phuket güneyinden Thap Lamu iskelesine sürüş yaklaşık 2 saattir. En geç 05:45 - 06:00 lobi alınışı zorunludur.';
    }
  } else if (isAoPo) {
    // James Bond / Hong turları Ao Po Marina'da (Kuzeydoğuda) başlar
    if (isNorthZone || isMidNorthZone) {
      recStart = '08:00'; recEnd = '08:30'; driveMin = 35; distanceCat = 'near';
      advice = 'Oteliniz Ao Po Marina tarafına yakındır, konforlu bir alınış saati seçilebilir.';
    } else if (isPhuketTown) {
      recStart = '07:45'; recEnd = '08:15'; driveMin = 35; distanceCat = 'near';
      advice = 'Şehir merkezinden Ao Po iskelesine yaklaşık 35 dakikadır.';
    } else if (isPatong || isKamala) {
      recStart = '07:15'; recEnd = '07:45'; driveMin = 60; distanceCat = 'moderate';
      advice = 'Batı kıyısından doğu marinasına ulaşım ~1 saat sürer.';
    } else {
      // Kata, Karon, Rawai (Güney)
      recStart = '07:00'; recEnd = '07:30'; driveMin = 75; distanceCat = 'far';
      advice = 'Güney sahillerinden Ao Po Marina ~1 saat 15 dakika mesafededir.';
    }
  } else if (isChalong) {
    // Racha, Coral, Sunset Catamaran (Chalong Pier - Güney)
    if (isChalongArea || isFarSouth) {
      recStart = '08:00'; recEnd = '08:30'; driveMin = 15; distanceCat = 'near';
      advice = 'Oteliniz Chalong İskelesine çok yakındır (10-20 dk).';
    } else if (isSouthWest) {
      recStart = '07:45'; recEnd = '08:15'; driveMin = 25; distanceCat = 'near';
      advice = 'Kata/Karon tepesinden Chalong iskelesi ~25 dakikadır.';
    } else if (isPatong) {
      recStart = '07:15'; recEnd = '07:45'; driveMin = 45; distanceCat = 'moderate';
      advice = 'Patong trafiğine göre 40-50 dakika sürüş payı öngörülmüştür.';
    } else if (isKamala || isMidNorthZone) {
      recStart = '06:45'; recEnd = '07:15'; driveMin = 65; distanceCat = 'far';
      advice = 'Bang Tao/Kamala bölgesinden güney Chalong iskelesine ~1 saat 10 dakika sürer.';
    } else if (isNorthZone) {
      recStart = '06:15'; recEnd = '06:45'; driveMin = 90; distanceCat = 'extreme_far';
      advice = 'Mai Khao / Havaalanı kuzey ucundan Chalong iskelesine ulaşım en az 1.5 saat sürer!';
    }
  } else {
    // Genel Phi Phi / Katamaran / Ada Turları (Royal Phuket Marina / Rassada)
    if (isNorthZone) {
      recStart = '06:30'; recEnd = '07:00'; driveMin = 60; distanceCat = 'far';
      advice = 'Kuzey bölgeden marinaya sürüş yaklaşık 1 saattir. 07:00 öncesi alınış gereklidir.';
    } else if (isMidNorthZone) {
      recStart = '07:00'; recEnd = '07:30'; driveMin = 40; distanceCat = 'moderate';
      advice = 'Bang Tao / Laguna bölgesinden marinaya ~40 dakikadır.';
    } else if (isPatong) {
      recStart = '07:15'; recEnd = '07:45'; driveMin = 45; distanceCat = 'moderate';
      advice = 'Patong - Marina standart transfer koridoru (~45 dk).';
    } else if (isSouthWest) {
      recStart = '07:15'; recEnd = '07:45'; driveMin = 50; distanceCat = 'moderate';
      advice = 'Kata / Karon bölgesinden marinaya ~50 dakika sürüş.';
    } else if (isFarSouth) {
      recStart = '07:00'; recEnd = '07:30'; driveMin = 55; distanceCat = 'far';
      advice = 'Rawai / Nai Harn güney ucundan marinaya ~55 dakika sürüş.';
    } else if (isPhuketTown) {
      recStart = '07:45'; recEnd = '08:15'; driveMin = 20; distanceCat = 'near';
      advice = 'Phuket Town marinaya en yakın merkezdir (~20 dk).';
    }
  }

  // 3. Saat Karşılaştırması & Gecikme Uyarısı (Time Conflict Detection)
  let isDistanceWarning = false;
  let warningMessage: string | undefined;

  if (currentPickupTime && currentPickupTime.trim().length > 0) {
    const parseMinutes = (timeStr: string) => {
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (!match) return null;
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    };

    const currentMin = parseMinutes(currentPickupTime);
    const recEndMin = parseMinutes(recEnd);

    if (currentMin !== null && recEndMin !== null) {
      // Eğer girilen saat, önerilen bitiş saatinden 30 dakikadan daha geç ise tehlike bayrağı kaldır!
      if (currentMin - recEndMin >= 30) {
        isDistanceWarning = true;
        warningMessage = `⚠️ Dikkat: Seçilen alınış saati (${currentPickupTime}), ${hotelZone || 'seçili bölge'} ile ${pierName} arasındaki sürüş mesafesine (~${driveMin} dk) göre çok geç kalabilir! Misafirin tekneyi kaçırma riski vardır. Önerilen lobi saati: ${recStart} - ${recEnd}.`;
      }
    }
  }

  return {
    recommendedWindow: `${recStart} - ${recEnd}`,
    recommendedStart: recStart,
    recommendedEnd: recEnd,
    estimatedDriveMinutes: driveMin,
    pierName,
    pierRegion,
    zoneDistanceCategory: distanceCat,
    isDistanceWarning,
    warningMessage,
    adviceNote: advice,
  };
}
