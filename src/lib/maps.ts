/**
 * Google Maps Rota & Navigasyon Yardımcıları
 * Şoförler ve transfer operasyonu için çoklu duraklı rota bağlantıları üretir.
 */

/**
 * Otel adını temizler ve Phuket coğrafi konum doğruluğu için ek parametreler ekler.
 */
export function formatHotelLocation(hotel: string): string {
  const clean = (hotel || '').trim();
  if (!clean) return 'Phuket, Thailand';
  // Eğer zaten Phuket içeriyorsa tekrar ekleme
  if (clean.toLowerCase().includes('phuket')) {
    return `${clean}, Thailand`;
  }
  return `${clean}, Phuket, Thailand`;
}

/**
 * Tek bir otel için doğrudan Google Haritalar navigasyon linki üretir.
 */
export function getSingleHotelMapUrl(hotel: string): string {
  const query = encodeURIComponent(formatHotelLocation(hotel));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Şoför için çoklu duraklı (Multi-Stop) Google Haritalar rotası üretir.
 * Sıralama: Şoförün mevcut konumu -> 1. Otel -> 2. Otel -> ... -> Liman / Marina
 */
export function generateMultiStopMapUrl(
  hotels: string[],
  destinationPier: string = 'Royal Phuket Marina, Phuket, Thailand'
): string {
  const validHotels = hotels.filter((h) => h && h.trim().length > 0);
  if (validHotels.length === 0) {
    return getSingleHotelMapUrl(destinationPier);
  }

  if (validHotels.length === 1) {
    const origin = encodeURIComponent(formatHotelLocation(validHotels[0]));
    const dest = encodeURIComponent(destinationPier);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
  }

  // Çok duraklı rota (Waypoints)
  // İlk otel başlangıç noktası veya mevcut konum, son durak marina/liman
  const origin = encodeURIComponent(formatHotelLocation(validHotels[0]));
  const waypoints = validHotels
    .slice(1)
    .map((h) => encodeURIComponent(formatHotelLocation(h)))
    .join('|');
  const dest = encodeURIComponent(destinationPier);

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints}&travelmode=driving`;
}

/**
 * Tura göre kalkış limanını (marina) tahmin eder.
 */
export function detectDeparturePier(tourTitle: string = ''): string {
  const t = tourTitle.toLowerCase();
  if (t.includes('similan') || t.includes('surin')) {
    return 'Thap Lamu Pier, Phang Nga, Thailand';
  }
  if (t.includes('james bond') || t.includes('hong') || t.includes('starlight')) {
    return 'Ao Por Grand Marina, Phuket, Thailand';
  }
  if (t.includes('racha') || t.includes('coral') || t.includes('banana')) {
    return 'Chalong Pier, Phuket, Thailand';
  }
  // Phi Phi, Katamaran ve genel turlar
  return 'Royal Phuket Marina, Phuket, Thailand';
}
