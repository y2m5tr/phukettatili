/**
 * Oteller Arası Bagaj Transfer & Emanet Takip Masası (Luggage Express)
 * Otel değiştiren tatilcilerin bavullarını gündüz tur sırasında eski otelden yeni otele güvenle taşır.
 */

export type LuggageStatus =
  | 'pending'
  | 'collected_from_hotel'
  | 'in_transit'
  | 'delivered_to_hotel'
  | 'cancelled';

export interface LuggageTransferRecord {
  id: string;
  bookingId?: string;
  guestName: string;
  phone: string;
  date: string;
  pickupHotel: string;
  pickupRoomNumber?: string;
  deliveryHotel: string;
  largeBagsCount: number;
  cabinBagsCount: number;
  assignedDriverId?: string;
  assignedDriverName?: string;
  status: LuggageStatus;
  tagNumber: string;
  notes?: string;
  collectedAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export const LUGGAGE_STATUS_LABELS: Record<LuggageStatus, { label: string; colorClass: string; icon: string }> = {
  pending: {
    label: 'Alınış Bekliyor',
    colorClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: '⏳',
  },
  collected_from_hotel: {
    label: 'Otelden Alındı',
    colorClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    icon: '🧳',
  },
  in_transit: {
    label: 'Yolda / Minibüste',
    colorClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    icon: '🚐',
  },
  delivered_to_hotel: {
    label: 'Yeni Otele Teslim Edildi',
    colorClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: '✅',
  },
  cancelled: {
    label: 'İptal',
    colorClass: 'bg-slate-800 text-slate-400 border-slate-700',
    icon: '❌',
  },
};

export const INITIAL_LUGGAGE_RECORDS: LuggageTransferRecord[] = [
  {
    id: 'LUG-101',
    bookingId: 'BK-1001',
    guestName: 'Murat Yılmaz',
    phone: '+90 532 123 4567',
    date: new Date().toISOString().split('T')[0],
    pickupHotel: 'Amari Phuket (Patong)',
    pickupRoomNumber: '402',
    deliveryHotel: 'The Shore at Katathani (Kata Noi)',
    largeBagsCount: 2,
    cabinBagsCount: 1,
    assignedDriverId: 'DRV-1',
    assignedDriverName: 'Somchai Prasert',
    status: 'in_transit',
    tagNumber: 'PKT-BAG-842',
    notes: 'Kırılacak eşya yok, resepsiyona bırakılacak',
    collectedAt: '10:15',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'LUG-102',
    bookingId: 'BK-1002',
    guestName: 'Zeynep Kaya',
    phone: '+90 533 987 6543',
    date: new Date().toISOString().split('T')[0],
    pickupHotel: 'Banyan Tree (Bang Tao)',
    pickupRoomNumber: 'Villa 12',
    deliveryHotel: 'Sri Panwa Phuket (Cape Panwa)',
    largeBagsCount: 3,
    cabinBagsCount: 2,
    assignedDriverId: 'DRV-2',
    assignedDriverName: 'Anan Suksan',
    status: 'delivered_to_hotel',
    tagNumber: 'PKT-BAG-913',
    notes: 'Yeni otel resepsiyon şefi Mr. Ton teslim aldı',
    collectedAt: '09:30',
    deliveredAt: '14:20',
    createdAt: new Date().toISOString(),
  },
];

/**
 * Bagaj takip etiket no üretir.
 */
export function generateLuggageTagNumber(seed: string = ''): string {
  const rand = Math.floor(100 + Math.random() * 900);
  return `PKT-LUG-${seed ? seed.slice(-3).toUpperCase() : rand}`;
}

/**
 * Valizlerin eski otelden teslim alındığına dair misafire giden WhatsApp mesajı.
 */
export function generateLuggageCollectedWhatsApp(record: LuggageTransferRecord): string {
  const total = (record.largeBagsCount || 0) + (record.cabinBagsCount || 0);
  return (
    `🧳 *BAGAJINIZ TESLİM ALINDI - PHUKET TATİLİ*\n\n` +
    `Merhaba Sayın *${record.guestName}*,\n\n` +
    `Siz ada turunuzun keyfini çıkarırken, toplam *${total} parça* valiziniz eski oteliniz *${record.pickupHotel}* lobisinden güvenle teslim alınmıştır.\n\n` +
    `🏷️ *Bagaj Etiket No:* ${record.tagNumber}\n` +
    `🚐 *Görevli Şoför:* ${record.assignedDriverName || 'Operasyon Ekibimiz'}\n` +
    `🏨 *Hedef Otel:* ${record.deliveryHotel}\n\n` +
    `Valizleriniz yeni otelinizin resepsiyonuna ulaştığında size tekrar anlık teyit iletilecektir. İyi turlar dileriz! 🌴🌊`
  );
}

/**
 * Valizlerin yeni otele teslim edildiğine dair misafire giden WhatsApp mesajı.
 */
export function generateLuggageDeliveredWhatsApp(record: LuggageTransferRecord): string {
  const total = (record.largeBagsCount || 0) + (record.cabinBagsCount || 0);
  return (
    `✅ *VALİZLERİNİZ YENİ OTELİNİZE TESLİM EDİLDİ!*\n\n` +
    `Merhaba Sayın *${record.guestName}*,\n\n` +
    `Toplam *${total} parça* valiziniz yeni oteliniz *${record.deliveryHotel}* resepsiyonuna güvenle teslim edilmiştir! 🧳✨\n\n` +
    `🏷️ *Bagaj Takip Kodu:* ${record.tagNumber}\n` +
    `⏰ *Teslim Saati:* ${record.deliveredAt || '14:30'}\n` +
    `🏨 *Teslim Yeri:* ${record.deliveryHotel} Bellboy / Resepsiyon\n\n` +
    `Tur dönüşü otelinize giriş (Check-in) yaparken yukarıdaki etiket numarasını resepsiyona iletmeniz yeterlidir.\n\n` +
    `Keyifli konaklamalar dileriz! 🇹🇭🌴\n` +
    `Phuket Tatili Operasyon Merkezi`
  );
}

/**
 * WhatsApp URL'i üretir.
 */
export function getLuggageWhatsAppUrl(
  record: LuggageTransferRecord,
  type: 'collected' | 'delivered'
): string {
  const cleanPhone = (record.phone || '').replace(/[^0-9]/g, '');
  const text =
    type === 'delivered'
      ? generateLuggageDeliveredWhatsApp(record)
      : generateLuggageCollectedWhatsApp(record);
  const encoded = encodeURIComponent(text);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
}
