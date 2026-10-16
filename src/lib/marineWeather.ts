import type { Booking } from '../data/adminInitialData';

export type MarineSafetyLevel = 'calm' | 'moderate' | 'severe';

export interface MarineSafetyReport {
  level: MarineSafetyLevel;
  waveHeightMeters: number;
  windSpeedKnots: number;
  windDirectionText: string;
  summary: string;
  warningNote: string;
  lastUpdated: string;
  source: 'live' | 'fallback';
  regionStatus: {
    phang_nga: { status: 'safe' | 'caution' | 'closed'; note: string };
    phi_phi: { status: 'safe' | 'caution' | 'closed'; note: string };
    similan: { status: 'safe' | 'caution' | 'closed'; note: string };
    racha: { status: 'safe' | 'caution' | 'closed'; note: string };
  };
}

let cachedMarineReport: MarineSafetyReport | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 dakika önbellek

/**
 * Andaman Denizi (Phuket kıyıları & Adalar) için deniz ve dalga güvenliği durumunu getirir.
 */
export async function getMarineSafetyStatus(forceRefresh = false): Promise<MarineSafetyReport> {
  const now = Date.now();
  if (!forceRefresh && cachedMarineReport && now < cacheExpiry) {
    return cachedMarineReport;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    // Open-Meteo marine/weather API: Phuket (Lat: 7.8804, Lon: 98.3923)
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=7.8804&longitude=98.3923&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn&timezone=Asia%2FBangkok',
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const windKnots = Math.round(data?.current?.wind_speed_10m || 10);
      const windDir = data?.current?.wind_direction_10m || 240;

      // Rüzgar hızına göre Andaman Denizi dalga boyu modellemesi
      const waveHeight = Number((windKnots * 0.08 + 0.4).toFixed(1));

      let level: MarineSafetyLevel = 'calm';
      let summary = 'Andaman Denizi sakin ve seyir için mükemmel koşullarda.';
      let warningNote = 'Tüm ada turları ve sürat tekneleri için koşullar elverişlidir.';

      if (waveHeight >= 1.9 || windKnots >= 24) {
        level = 'severe';
        summary = 'Fırtına / Yüksek Dalga Uyarısı (Tayland Deniz Liman Başkanlığı Alarmı)';
        warningNote = 'Açık deniz sürat teknesi turları (Similan, Phi Phi) için kısıtlama veya iptal önerilir. Korunaklı Phang Nga körfezi tercih edilebilir.';
      } else if (waveHeight >= 1.2 || windKnots >= 15) {
        level = 'moderate';
        summary = 'Orta Dalgalı Deniz — Seyir Dikkatli Yapılmalıdır';
        warningNote = 'Hamile, küçük bebekli ve bel rahatsızlığı olan misafirlerin teknenin arka tarafında oturması tavsiye edilir.';
      }

      cachedMarineReport = {
        level,
        waveHeightMeters: waveHeight,
        windSpeedKnots: windKnots,
        windDirectionText: getWindDirectionName(windDir),
        summary,
        warningNote,
        lastUpdated: new Date().toISOString(),
        source: 'live',
        regionStatus: calculateRegionSafety(level),
      };
      cacheExpiry = now + CACHE_DURATION_MS;
      return cachedMarineReport;
    }
  } catch {
    // API ulaşılamazsa akıllı fallback
  }

  // Fallback (Phuket Ekim/Kasım tipik deniz durumu)
  const fallbackReport: MarineSafetyReport = {
    level: 'calm',
    waveHeightMeters: 0.8,
    windSpeedKnots: 9,
    windDirectionText: 'Güneybatı (SW)',
    summary: 'Andaman Denizi sakin ve ada geçişleri güvenlidir.',
    warningNote: 'Tüm sürat teknesi ve katamaran turları planlandığı gibi güvenle icra edilebilir.',
    lastUpdated: new Date().toISOString(),
    source: 'fallback',
    regionStatus: calculateRegionSafety('calm'),
  };

  cachedMarineReport = fallbackReport;
  cacheExpiry = now + CACHE_DURATION_MS;
  return fallbackReport;
}

function calculateRegionSafety(level: MarineSafetyLevel): MarineSafetyReport['regionStatus'] {
  if (level === 'severe') {
    return {
      phang_nga: { status: 'caution', note: 'Körfez içi korunaklı; kano turları güvenle yapılabilir.' },
      phi_phi: { status: 'closed', note: 'Açık deniz geçişi dalgalı; Liman Başkanlığı uyarısı.' },
      similan: { status: 'closed', note: 'Açık okyanus; milli park tekne girişleri kısıtlanabilir.' },
      racha: { status: 'caution', note: 'Güney açık deniz; sadece büyük katamaranlar çıkabilir.' },
    };
  }
  if (level === 'moderate') {
    return {
      phang_nga: { status: 'safe', note: 'Körfez sakin ve korunaklı.' },
      phi_phi: { status: 'caution', note: 'Orta dalgalı seyir; arka koltuklar önerilir.' },
      similan: { status: 'caution', note: 'Hafif sallantılı açık deniz seyri.' },
      racha: { status: 'safe', note: 'Normal seyir koşulları.' },
    };
  }
  return {
    phang_nga: { status: 'safe', note: 'Çarşaf gibi sakin körfez suları.' },
    phi_phi: { status: 'safe', note: 'Mükemmel berrak deniz ve seyir koşulları.' },
    similan: { status: 'safe', note: 'Cam gibi turkuaz deniz ve açık hava.' },
    racha: { status: 'safe', note: 'Şnorkel ve yüzme için ideal sakinlik.' },
  };
}

function getWindDirectionName(degree: number): string {
  if (degree >= 337.5 || degree < 22.5) return 'Kuzey (N)';
  if (degree >= 22.5 && degree < 67.5) return 'Kuzeydoğu (NE)';
  if (degree >= 67.5 && degree < 112.5) return 'Doğu (E)';
  if (degree >= 112.5 && degree < 157.5) return 'Güneydoğu (SE)';
  if (degree >= 157.5 && degree < 202.5) return 'Güney (S)';
  if (degree >= 202.5 && degree < 247.5) return 'Güneybatı (SW)';
  if (degree >= 247.5 && degree < 292.5) return 'Batı (W)';
  return 'Kuzeybatı (NW)';
}

/**
 * Fırtına / Yüksek Dalga nedeniyle tur erteleme veya alternatif rota WhatsApp mesajı üretir.
 */
export function generateWeatherPostponeMessage(
  booking: Booking,
  alternativeTourTitle = 'James Bond Adası & Phang Nga Körfezi Kano Turu',
  managerPhone = '66828950665'
): string {
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;

  return `🌊 *PHUKET TATİLİ — ANDAMAN DENİZİ HAVA & GÜVENLİK BİLGİLENDİRMESİ* 🌊

Sayın *${booking.customerName}*, merhaba!

Bugün katılacağınız *${booking.tourTitle}* turumuz, Andaman Denizi'ndeki olumsuz dalga ve fırtına koşulları sebebiyle Tayland Kraliyeti Deniz Liman Başkanlığı (Marine Department) güvenlik talimatı doğrultusunda misafirlerimizin emniyeti için *ertelenecektir*.

Güvenliğiniz bizim için her şeyden önce gelmektedir. Sizi mağdur etmemek adına 3 esnek seçenek sunuyoruz:

1️⃣ *Tarih Erteleme:* Turunuzu havanın açtığı sonraki günlerden birine ücretsiz kaydırabiliriz.
2️⃣ *Güvenli Rota Değişimi:* Açık deniz yerine kapalı körfezde dalgasız ve sakin olan *${alternativeTourTitle}* veya *Fil Koruma Alanı* turumuza geçiş yapabilirsiniz.
3️⃣ *Kesintisiz İade:* Planınıza uymuyorsa ödemeniz anında kesintisiz iade edilir.

🎫 *Biletiniz:* https://phukettatili.com/bilet/${booking.id}
Lütfen tercih ettiğiniz seçeneği bize WhatsApp üzerinden iletiniz:
📞 *Operasyon İletişim:* ${displayPhone}

Anlayışınız için teşekkür eder, güvenli ve keyifli bir Phuket tatili dileriz! 🙏🇹🇭`;
}

/**
 * WhatsApp doğrudan hava durumu mesajı linki üretir.
 */
export function getWeatherPostponeWhatsAppUrl(
  booking: Booking,
  alternativeTourTitle?: string,
  managerPhone?: string
): string {
  const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
  const message = generateWeatherPostponeMessage(booking, alternativeTourTitle, managerPhone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
