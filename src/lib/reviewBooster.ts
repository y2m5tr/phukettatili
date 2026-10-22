import type { Booking } from '../data/adminInitialData';
import { formatWhatsAppPhone, buildWhatsAppDeepLink, formatDayMonthYear } from './whatsappEngine';

export interface ReviewBoosterOptions {
  googleReviewUrl?: string;
  tripAdvisorUrl?: string;
  managerPhone?: string;
  siteUrl?: string;
}

export const DEFAULT_GOOGLE_REVIEW_URL = 'https://g.page/r/phukettatili/review';
export const DEFAULT_TRIPADVISOR_URL = 'https://www.tripadvisor.com/UserReviewEdit-g293920-Phuket';
const DEFAULT_MANAGER_PHONE = '66828950665';
const DEFAULT_SITE_URL = 'https://phukettatili.com';

export type SentimentAction = 'direct_google_review' | 'intercept_manager_private';

export interface SentimentEvaluation {
  rating: number;
  sentiment: 'positive' | 'negative_or_neutral';
  action: SentimentAction;
  intercepted: boolean;
  headline: string;
  description: string;
  targetUrl: string;
}

/**
 * Turun tamamlanıp tamamlanmadığını ve yorum istenebilir olup olmadığını belirler.
 * Tur tarihi bugün veya geçmişte ise ve rezervasyon iptal edilmemişse uygundur.
 */
export function isTourEligibleForReview(booking: Booking): boolean {
  if (booking.status === 'cancelled') return false;

  const todayStr = new Date().toISOString().split('T')[0];
  const tourDate = booking.tourDate || '';

  // Tur tarihi bugün veya geçmişteyse ya da pickupStatus completed ise
  const isPastOrToday = tourDate <= todayStr;
  const isCompletedPickup = booking.pickupStatus === 'completed';

  return isPastOrToday || isCompletedPickup;
}

/**
 * Akıllı Filtreleme (Smart Sentiment Gate):
 * 4 veya 5 Yıldız: Doğrudan Google Haritalar yorum profiline yönlendirilir.
 * 1, 2 veya 3 Yıldız: İtibar koruma mekanizması devreye girer; Google yerine
 * doğrudan Ofis / Operasyon Yöneticisine özel WhatsApp hattına yönlendirilir.
 */
export function evaluateReviewSentiment(
  rating: number,
  booking?: Booking,
  feedbackText: string = '',
  options?: ReviewBoosterOptions
): SentimentEvaluation {
  const googleReviewUrl = options?.googleReviewUrl || DEFAULT_GOOGLE_REVIEW_URL;
  const managerPhone = options?.managerPhone || DEFAULT_MANAGER_PHONE;

  if (rating >= 4) {
    return {
      rating,
      sentiment: 'positive',
      action: 'direct_google_review',
      intercepted: false,
      headline: '🎉 Harika Bir Deneyim Yaşamanıza Çok Sevindik!',
      description:
        'Ekibimiz ve rehberlerimiz adına teşekkür ederiz. Deneyiminizi Google Haritalar profilimizde 1 dakikada 5 yıldızla taçlandırmak ister misiniz?',
      targetUrl: googleReviewUrl,
    };
  }

  // 1, 2 veya 3 Yıldız: Filtrele & Ofis Yöneticisine Yönlendir
  const escalationUrl = booking
    ? generateManagerEscalationWhatsAppUrl(booking, rating, feedbackText, options)
    : `https://wa.me/${managerPhone}`;

  return {
    rating,
    sentiment: 'negative_or_neutral',
    action: 'intercept_manager_private',
    intercepted: true,
    headline: '😔 Yaşadığınız Aksaklık İçin Çok Üzgünüz',
    description:
      'Memnuniyetiniz bizim için her şeyden önemli. Durumu derhal telafi edebilmemiz ve sorunu çözebilmemiz için Genel Koordinatörümüz bizzat sizinle ilgilenmek istiyor.',
    targetUrl: escalationUrl,
  };
}

/**
 * Tur bitiş saati olan 18:30'da misafire gönderilen akıllı davet mesajı.
 * Dijital biletteki interaktif #degerlendir portalını ve doğrudan Google linkini sunar.
 */
export function generate1830ReviewInviteMessage(
  booking: Booking,
  options?: ReviewBoosterOptions
): string {
  const googleLink = options?.googleReviewUrl || DEFAULT_GOOGLE_REVIEW_URL;
  const managerPhone = options?.managerPhone || DEFAULT_MANAGER_PHONE;
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;
  const siteUrl = options?.siteUrl || DEFAULT_SITE_URL;
  const reviewPortalUrl = `${siteUrl}/bilet/${booking.ticketCode || booking.id}#degerlendir`;

  return `✨ *PHUKET TATİLİ — GÜNÜNÜZ NASIL GEÇTİ?* ✨

Sayın *${booking.customerName}*, merhaba!

Bugün katıldığınız *${booking.tourTitle}* turumuzun keyifli geçtiğini umuyoruz. Phuket'teki tatil anılarınıza güzel bir gün ekleyebildiysek ne mutlu bize! 🌴🌊📸

Hizmetimizi ve rehber ekibimizi 30 saniyede değerlendirmek için aşağıdaki linke tıklayabilirsiniz:
👉 *Hızlı Değerlendirme & Yorum:*
${reviewPortalUrl}

(Dilerseniz doğrudan Google Haritalar profilimizde 5 yıldızla da deneyiminizi paylaşabilirsiniz: ${googleLink})

Phuket'teki sonraki günleriniz için her türlü restoran tavsiyesi, VIP araç veya ada rotasında dilediğiniz zaman bize yazabilirsiniz:
📞 *WhatsApp:* ${displayPhone}

Harika bir akşam ve keyifli bir tatil dileriz! 🇹🇭✨`;
}

/**
 * 5 Yıldızlı Google & TripAdvisor değerlendirme WhatsApp mesajı oluşturur (Klasik).
 */
export function generatePostTourReviewMessage(
  booking: Booking,
  options?: ReviewBoosterOptions
): string {
  return generate1830ReviewInviteMessage(booking, options);
}

/**
 * Memnuniyetsizlik durumunda (1-3 yıldız) Ofis Yöneticisine giden acil eskalasyon WhatsApp metni.
 */
export function generateManagerEscalationWhatsAppUrl(
  booking: Booking,
  rating: number,
  feedbackText: string,
  options?: ReviewBoosterOptions
): string {
  const managerPhone = options?.managerPhone || DEFAULT_MANAGER_PHONE;

  const text = `🚨 *ACİL MİSAFİR GERİ BİLDİRİMİ — MEMNUNİYET TELAFİSİ GEREKİYOR* 🚨

👤 *Misafir:* ${booking.customerName}
📞 *Telefon:* ${booking.phone}
🏨 *Otel:* ${booking.hotel}${booking.roomNumber ? ` (Oda: ${booking.roomNumber})` : ''}
🏝️ *Tur:* ${booking.tourTitle}
📅 *Tarih:* ${formatDayMonthYear(booking.tourDate)}
⭐ *Verilen Puan:* ${rating} / 5 Yıldız (${rating <= 2 ? 'Kritik Düzeyde Olumsuz' : 'İyileştirme Gerekiyor'})

📝 *Misafirin Şikayeti / Geri Bildirimi:*
"${feedbackText || 'Misafir detay belirtmedi, acil arama veya telafi mesajı bekleniyor.'}"

⚠️ *Öneri Aksiyon:*
Misafirin Google Haritalar'a 1-3 yıldız yazması engellendi. Lütfen en geç 15 dakika içinde misafirle WhatsApp veya telefon üzerinden iletişime geçip özür / telafi (meyve sepeti, ücretsiz transfer veya hediye tur) sununuz.`;

  return buildWhatsAppDeepLink(managerPhone, text);
}

/**
 * Misafirin WhatsApp'ına doğrudan 18:30 yorum isteme bağlantısı üretir.
 */
export function getGoogleReviewWhatsAppUrl(
  booking: Booking,
  options?: ReviewBoosterOptions
): string {
  const cleanPhone = formatWhatsAppPhone(booking.phone);
  const message = generate1830ReviewInviteMessage(booking, options);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
