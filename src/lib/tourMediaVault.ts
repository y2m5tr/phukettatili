/**
 * Misafir Tur Fotoğraf & Video Teslim Kasası (Tour Media Vault)
 * Misafirlere tur sonrası profesyonel fotoğraf & drone videolarını tek tıkla teslim eder.
 * Sosyal medya etiketleme ve Google Review 5-yıldız teşviki içerir.
 */

export interface TourPhotoItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  category: 'drone' | 'underwater' | 'action' | 'group' | 'scenic';
  highResDownloadUrl?: string;
}

export interface TourMediaVaultRecord {
  bookingId: string;
  ticketCode?: string;
  guestName: string;
  phone?: string;
  tourTitle: string;
  tourDate: string;
  cloudAlbumUrl?: string; // Google Drive / Dropbox / iCloud klasörü
  photos: TourPhotoItem[];
  guideName?: string;
  instagramHandle: string;
  googleReviewUrl: string;
  isReady: boolean;
  notifiedAt?: string;
}

export const DEFAULT_INSTAGRAM_HANDLE = '@phukettatilicom';
export const DEFAULT_GOOGLE_REVIEW_URL = 'https://g.page/r/phuket-tatili/review';

/**
 * Örnek / fallback fotoğraf albümü oluşturur.
 */
export function generateDefaultTourPhotos(tourTitle: string): TourPhotoItem[] {
  return [
    {
      id: 'p1',
      title: `${tourTitle || 'Maya Bay'} & Turkuaz Lagün Manzarası`,
      url: '/images/tours/phi-phi-maya.jpg',
      category: 'scenic',
      highResDownloadUrl: '/images/tours/phi-phi-maya.jpg',
    },
    {
      id: 'p2',
      title: 'Pileh Lagoon Sürat Teknesi & Yüzme Molası',
      url: '/images/tours/speedboat-sea.jpg',
      category: 'action',
      highResDownloadUrl: '/images/tours/speedboat-sea.jpg',
    },
    {
      id: 'p3',
      title: 'Viking Mağarası Drone Çekimi',
      url: '/images/tours/drone-view.jpg',
      category: 'drone',
      highResDownloadUrl: '/images/tours/drone-view.jpg',
    },
    {
      id: 'p4',
      title: 'Bamboo Island Beyaz Kumlar & Ekip Hatırası',
      url: '/images/tours/bamboo-island.jpg',
      category: 'group',
      highResDownloadUrl: '/images/tours/bamboo-island.jpg',
    },
  ];
}

/**
 * Misafir fotoğraf portalı linkini üretir.
 */
export function generateMediaVaultUrl(codeOrId: string): string {
  return `/foto/${encodeURIComponent(codeOrId)}`;
}

/**
 * Fotoğrafların hazır olduğunu misafire bildiren WhatsApp mesaj metni.
 */
export function generateMediaVaultWhatsApp(
  guestName: string,
  tourTitle: string,
  vaultUrl: string,
  cloudAlbumUrl?: string
): string {
  return (
    `📸 *FOTOĞRAFLARINIZ HAZIR! - PHUKET TATİLİ*\n\n` +
    `Merhaba Sayın *${guestName || 'Misafirimiz'}*,\n\n` +
    `Katıldığınız *${tourTitle || 'Phuket Turu'}* gezimizden rehber ve fotoğrafçılarımızın çektiği yüksek çözünürlüklü hatıra fotoğrafları dijital kasanıza yüklendi! 🌴✨\n\n` +
    `📲 *Fotoğraf Kasanız ve Tek Tıkla İndirme Linki:*\n` +
    `https://phukettatili.com${vaultUrl}\n` +
    (cloudAlbumUrl ? `\n📂 *Tüm Orijinal Albüm (Google Drive):*\n${cloudAlbumUrl}\n` : '') +
    `\n📸 Fotoğrafları Instagram'da paylaşırken bizi etiketlemeyi unutmayın:\n` +
    `👉 *@phukettatilicom* · #PhuketTatili\n\n` +
    `Tatilinizin harika geçmesi dileğiyle! 🇹🇭🌊`
  );
}

/**
 * Misafir WhatsApp linkini üretir.
 */
export function getMediaVaultWhatsAppUrl(
  phone: string,
  guestName: string,
  tourTitle: string,
  vaultUrl: string,
  cloudAlbumUrl?: string
): string {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const text = encodeURIComponent(generateMediaVaultWhatsApp(guestName, tourTitle, vaultUrl, cloudAlbumUrl));
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
}
