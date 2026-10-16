import type { Booking } from '../data/adminInitialData';

export interface ReviewBoosterOptions {
  googleReviewUrl?: string;
  tripAdvisorUrl?: string;
  managerPhone?: string;
}

export const DEFAULT_GOOGLE_REVIEW_URL = 'https://g.page/r/phukettatili/review';
export const DEFAULT_TRIPADVISOR_URL = 'https://www.tripadvisor.com/UserReviewEdit-g293920-Phuket';

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
 * 5 Yıldızlı Google & TripAdvisor değerlendirme WhatsApp mesajı oluşturur.
 */
export function generatePostTourReviewMessage(
  booking: Booking,
  options?: ReviewBoosterOptions
): string {
  const googleLink = options?.googleReviewUrl || DEFAULT_GOOGLE_REVIEW_URL;
  const managerPhone = options?.managerPhone || '66828950665';
  const displayPhone = managerPhone.startsWith('+') ? managerPhone : `+${managerPhone}`;

  return `✨ *PHUKET TATİLİ — GÜNÜNÜZ NASIL GEÇTİ?* ✨

Sayın *${booking.customerName}*, merhaba!

Bugün katıldığınız *${booking.tourTitle}* turumuzun keyifli geçtiğini umuyoruz. Phuket'teki tatil anılarınıza güzel bir gün ekleyebildiysek ne mutlu bize! 🌴🌊📸

Ekibimizi ve hizmetimizi 1 dakikanızı ayırarak Google Haritalar profilimizde 5 yıldızla değerlendirmek ister misiniz? Değerli yorumunuz hem rehber ve kaptanlarımıza moral olacak, hem de Phuket'e gelecek diğer Türk gezginlere ışık tutacaktır:

⭐ *Google 5-Yıldızlı Yorum Bağlantısı:*
${googleLink}

Phuket'teki sonraki günleriniz için her türlü restoran tavsiyesi, VIP transfer veya yeni ada rotası için dilediğiniz zaman bize yazabilirsiniz:
📞 *WhatsApp:* ${displayPhone}

Harika bir tatil dileriz! 🇹🇭✨`;
}

/**
 * Misafirin WhatsApp'ına doğrudan yorum isteme bağlantısı üretir.
 */
export function getGoogleReviewWhatsAppUrl(
  booking: Booking,
  options?: ReviewBoosterOptions
): string {
  const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
  const message = generatePostTourReviewMessage(booking, options);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
