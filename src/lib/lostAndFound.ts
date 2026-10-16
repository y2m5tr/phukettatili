/**
 * Phuket Tatili - Kayıp Eşya Masası & Saha Bagaj Güvenlik Protokolü (Lost & Found Hub)
 * Araçta veya teknede unutulan eşyaların takibi, şoför/otel koordinasyonu ve WhatsApp bildirimleri.
 */

export type LostFoundItemType =
  | 'phone'
  | 'passport_wallet'
  | 'camera_gopro'
  | 'sunglasses'
  | 'bag_backpack'
  | 'clothing_hat'
  | 'jewelry'
  | 'other';

export type LostFoundStatus =
  | 'found_with_driver'
  | 'at_central_office'
  | 'in_transit_to_hotel'
  | 'returned_to_guest';

export interface LostFoundItem {
  id: string;
  reportedAt: string; // ISO date
  itemType: LostFoundItemType;
  title: string;
  description: string;
  vehicleOrTour: string;
  driverOrGuideName: string;
  driverPhone?: string;
  guestName?: string;
  guestPhone?: string;
  hotelName?: string;
  roomNumber?: string;
  status: LostFoundStatus;
  storageLocation: string;
  notes?: string;
}

export const ITEM_TYPE_LABELS: Record<LostFoundItemType, { label: string; icon: string }> = {
  phone: { label: 'Telefon / Tablet', icon: '📱' },
  passport_wallet: { label: 'Pasaport / Cüzdan', icon: '🛂' },
  camera_gopro: { label: 'Kamera / GoPro', icon: '📷' },
  sunglasses: { label: 'Gözlük / Güneş Gözlüğü', icon: '🕶️' },
  bag_backpack: { label: 'Çanta / Sırt Çantası', icon: '🎒' },
  clothing_hat: { label: 'Kıyafet / Şapka / Havlu', icon: '🧢' },
  jewelry: { label: 'Takı / Saat / Değerli Eşya', icon: '⌚' },
  other: { label: 'Diğer Eşya', icon: '📦' },
};

export const STATUS_LABELS: Record<LostFoundStatus, { label: string; color: string; badgeClass: string }> = {
  found_with_driver: {
    label: 'Araçta / Şoförde Muhafaza',
    color: 'amber',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  },
  at_central_office: {
    label: 'Merkez Ofis Kasasında',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
  },
  in_transit_to_hotel: {
    label: 'Otele Kuryede / Yolda',
    color: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
  },
  returned_to_guest: {
    label: 'Misafire Teslim Edildi',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  },
};

export const INITIAL_LOST_FOUND_ITEMS: LostFoundItem[] = [
  {
    id: 'LF-2401',
    reportedAt: '2026-10-16T10:30:00Z',
    itemType: 'sunglasses',
    title: 'Siyah Ray-Ban Polarize Güneş Gözlüğü',
    description: 'Deri kılıfı içinde, VIP Van arka koltuk cebinde unutulmuş.',
    vehicleOrTour: 'VIP Van 35-1249 (Toyota Commuter)',
    driverOrGuideName: 'Somchai Prasert',
    driverPhone: '+66812345678',
    guestName: 'Ahmet Yılmaz',
    guestPhone: '+905321112233',
    hotelName: 'Amari Phuket Patong',
    roomNumber: '412',
    status: 'found_with_driver',
    storageLocation: 'Araç Torpido Gözü (Somchai)',
    notes: 'Şoför havaalanı dönüşü fark edip bildirdi.',
  },
  {
    id: 'LF-2402',
    reportedAt: '2026-10-15T18:45:00Z',
    itemType: 'camera_gopro',
    title: 'GoPro Hero 12 Black + Su Altı Monopod',
    description: 'Mavi askı aparatlı, teknenin orta oturma grubu altında bulundu.',
    vehicleOrTour: 'Phi Phi Islands Speedboat (Andaman Star 3)',
    driverOrGuideName: 'Rehber Caner & Kaptan Noi',
    driverPhone: '+66897654321',
    guestName: 'Burak Demir',
    guestPhone: '+905334445566',
    hotelName: 'The Shore at Katathani',
    roomNumber: 'Villa 18',
    status: 'at_central_office',
    storageLocation: 'Patong Merkez Ofis Çelik Kasa (No: B-4)',
    notes: 'İçinde ada fotoğrafları mevcut, kilitli kasaya alındı.',
  },
  {
    id: 'LF-2403',
    reportedAt: '2026-10-15T14:10:00Z',
    itemType: 'bag_backpack',
    title: 'Kırmızı Su Geçirmez Plaj Çantası',
    description: 'İçinde havlu ve çocuk şapkası var.',
    vehicleOrTour: 'VIP Van 30-8841',
    driverOrGuideName: 'Anan Sukhumvit',
    driverPhone: '+66841122334',
    guestName: 'Elif Kaya',
    guestPhone: '+905423332211',
    hotelName: 'Banyan Tree Phuket (Bang Tao)',
    roomNumber: '204',
    status: 'returned_to_guest',
    storageLocation: 'Otel Resepsiyonuna Teslim Edildi',
    notes: 'Otel resepsiyonu teslim tutanağı imzalandı.',
  },
];

/**
 * Misafire eşyasının bulunduğunu müjdeleyen Türkçe WhatsApp mesajı
 */
export function generateGuestFoundWhatsApp(item: LostFoundItem): string {
  const itemInfo = ITEM_TYPE_LABELS[item.itemType] || ITEM_TYPE_LABELS.other;
  const guestSalutation = item.guestName ? `Sayın ${item.guestName}` : 'Değerli Misafirimiz';
  const hotelInfo = item.hotelName
    ? `${item.hotelName}${item.roomNumber ? ` (Oda: ${item.roomNumber})` : ''}`
    : 'Kaldığınız Otel';

  return `İyi günler ${guestSalutation},

Müjdemiz var! 🎉 Phuket Tatili transfer/tur aracımızda (${item.vehicleOrTour}) unuttuğunuz eşyanız ekibimiz tarafından bulunmuş ve güvenle muhafaza altına alınmıştır.

📦 Bulunan Eşya: ${itemInfo.icon} ${item.title}
📍 Açıklama: ${item.description}
🛡️ Güncel Konum: ${item.storageLocation}
👨‍✈️ Muhafaza Eden: ${item.driverOrGuideName}

🏨 Teslimat Planı:
Eşyanızı ${hotelInfo} resepsiyonunuza güvenle ulaştırmak üzere ekibimiz kurye yönlendirmesi yapabilir veya Patong merkez ofisimizden dilediğiniz zaman teslim alabilirsiniz.

Lütfen teslimat tercihinizi bu mesaja yanıt vererek bize iletiniz. 
Phuket Tatili ailesi olarak eşyanızı güvende tutmaktan mutluluk duyarız! ✨`;
}

/**
 * Taylandlı şoföre eşyayı soran iki dilli (Tayca + İngilizce) WhatsApp mesajı
 */
export function generateDriverInquiryWhatsApp(params: {
  driverName: string;
  vehicleOrTour: string;
  missingItemDesc: string;
  guestName?: string;
  hotelName?: string;
}): string {
  const driver = params.driverName || 'Khun Driver';
  const guest = params.guestName || 'Our Guest';
  const hotel = params.hotelName || 'Phuket Hotel';

  return `Sawadee khrup Khun ${driver} 🙏 (Phuket Tatili Operations)

🇹🇭 ภาษาไทย:
ลูกค้าคุณ ${guest} แจ้งว่าอาจลืมของไว้ในรถ/เรือ (${params.vehicleOrTour}):
👉 สิ่งของ: "${params.missingItemDesc}"
โรงแรมลูกค้า: ${hotel}

รบกวนช่วยตรวจสอบระหว่างเบาะที่นั่งและใต้เบาะให้หน่อยครับ หากพบแล้วกรุณาถ่ายรูปส่งมาในนี้ได้เลยครับ ขอบคุณมากครับ! 🙏✨

🇬🇧 English:
Guest ${guest} reported a potentially forgotten item in vehicle (${params.vehicleOrTour}):
👉 Item: "${params.missingItemDesc}"
Please kindly check between seats and luggage compartment. If found, please take a quick photo and reply. Thank you!`;
}

/**
 * Otele teslim edildi bildirimi (Misafire)
 */
export function generateHotelDeliveryWhatsApp(item: LostFoundItem): string {
  const guestSalutation = item.guestName ? `Sayın ${item.guestName}` : 'Değerli Misafirimiz';
  const hotel = item.hotelName || 'Oteliniz';

  return `Merhaba ${guestSalutation},

Unutmuş olduğunuz "${item.title}" eşyanız şoförümüz/kuryemiz tarafından ${hotel} ön büro resepsiyonuna güvenle teslim edilmiştir! 🛎️✨

📋 Resepsiyon görevlisine isminizi${item.roomNumber ? ` ve oda numaranızı (${item.roomNumber})` : ''} belirterek eşyanızı teslim alabilirsiniz.

Tatilinizin kalanında keyifli ve unutulmaz anlar dileriz! 🌴🌊
Phuket Tatili Operasyon Ekibi`;
}

/**
 * WhatsApp URL oluşturucu
 */
export function getLostFoundWhatsAppUrl(phone?: string, text?: string): string {
  if (!text) return '#';
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
  const encodedText = encodeURIComponent(text);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}

/**
 * Filtreleme yardımcısı
 */
export function filterLostFoundItems(
  items: LostFoundItem[],
  statusFilter?: string,
  searchQuery?: string
): LostFoundItem[] {
  return items.filter((item) => {
    if (statusFilter && statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchGuest = (item.guestName || '').toLowerCase().includes(q);
      const matchVehicle = item.vehicleOrTour.toLowerCase().includes(q);
      const matchHotel = (item.hotelName || '').toLowerCase().includes(q);
      const matchDriver = item.driverOrGuideName.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchGuest || matchVehicle || matchHotel || matchDriver;
    }
    return true;
  });
}
