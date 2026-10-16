/**
 * Misafir Tayca Hızlı İletişim & Sesli Çevirmen (Pocket Thai Assistant)
 * Türk gezginlerin Tayland'da restoranlarda, taksilerde, acil durumlarda ve teknede
 * en çok ihtiyaç duyduğu ifadelerin sesli ve görsel kart kütüphanesi.
 */

export interface PocketThaiPhrase {
  id: string;
  turkish: string;
  thai: string;
  phonetic: string;
  category: 'food_dining' | 'emergency_health' | 'transport_taxi' | 'boat_tour' | 'shopping_market';
  urgency?: 'high' | 'normal';
  icon: string;
}

export interface PocketThaiCategory {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
}

export const POCKET_THAI_CATEGORIES: PocketThaiCategory[] = [
  { id: 'all', name: 'Tümü', icon: '🇹🇭', colorClass: 'bg-slate-800 text-white' },
  { id: 'food_dining', name: 'Yemek & Restoran', icon: '🍲', colorClass: 'bg-amber-500/20 text-amber-300' },
  { id: 'emergency_health', name: 'Acil Durum & Sağlık', icon: '🚑', colorClass: 'bg-rose-500/20 text-rose-300' },
  { id: 'transport_taxi', name: 'Taksi & Şoför', icon: '🚕', colorClass: 'bg-sky-500/20 text-sky-300' },
  { id: 'boat_tour', name: 'Tekne & Ada', icon: '🚤', colorClass: 'bg-cyan-500/20 text-cyan-300' },
  { id: 'shopping_market', name: 'Pazar & Pazarlık', icon: '🛍️', colorClass: 'bg-emerald-500/20 text-emerald-300' },
];

export const POCKET_THAI_PHRASES: PocketThaiPhrase[] = [
  // 🍲 YEMEK & RESTORAN
  {
    id: 'f1',
    category: 'food_dining',
    turkish: 'Lütfen acısız olsun / Acı baharat koymayın',
    thai: 'ไม่เผ็ดครับ/ค่ะ',
    phonetic: 'Mai Phet',
    urgency: 'high',
    icon: '🌶️',
  },
  {
    id: 'f2',
    category: 'food_dining',
    turkish: 'Vejetaryen / Et yemiyorum',
    thai: 'กินเจ / ไม่กินเนื้อสัตว์',
    phonetic: 'Gin Jay / Mai Gin Nua Sat',
    urgency: 'high',
    icon: '🥦',
  },
  {
    id: 'f3',
    category: 'food_dining',
    turkish: 'Deniz ürünlerine alerjim var!',
    thai: 'แพ้อาหารทะเลครับ/ค่ะ',
    phonetic: 'Phae Ahan Thale',
    urgency: 'high',
    icon: '🦐',
  },
  {
    id: 'f4',
    category: 'food_dining',
    turkish: 'Fıstık / Kuruyemiş alerjim var!',
    thai: 'แพ้ถั่วครับ/ค่ะ',
    phonetic: 'Phae Thua',
    urgency: 'high',
    icon: '🥜',
  },
  {
    id: 'f5',
    category: 'food_dining',
    turkish: 'Hesap lütfen / Ne kadar?',
    thai: 'เช็คบิลด้วยครับ/ค่ะ / เท่าไหร่',
    phonetic: 'Check Bin / Thao Rai?',
    urgency: 'normal',
    icon: '💵',
  },
  {
    id: 'f6',
    category: 'food_dining',
    turkish: 'Çok lezzetli, teşekkürler!',
    thai: 'อร่อยมาก ขอบคุณครับ/ค่ะ',
    phonetic: 'Aroi Mak, Khop Khun Krub/Kha',
    urgency: 'normal',
    icon: '😋',
  },

  // 🚑 ACİL DURUM & SAĞLIK
  {
    id: 'e1',
    category: 'emergency_health',
    turkish: 'Deniz tuttu, bulantı hapı rica ediyorum',
    thai: 'ขอยาแก้เมาเรือหน่อยครับ/ค่ะ',
    phonetic: 'Khor Ya Gae Mao Ruea',
    urgency: 'high',
    icon: '🤢',
  },
  {
    id: 'e2',
    category: 'emergency_health',
    turkish: 'Hastaneye / Doktora gitmem gerek!',
    thai: 'ต้องไปโรงพยาบาล / หาหมอ',
    phonetic: 'Tong Pai Rong-Phayaban',
    urgency: 'high',
    icon: '🏥',
  },
  {
    id: 'e3',
    category: 'emergency_health',
    turkish: 'Lütfen yardım edin / Acil durum!',
    thai: 'ช่วยด้วยครับ/ค่ะ!',
    phonetic: 'Chuai Duai Krub/Kha!',
    urgency: 'high',
    icon: '🆘',
  },
  {
    id: 'e4',
    category: 'emergency_health',
    turkish: 'Eczane nerede?',
    thai: 'ร้านขายยาอยู่ที่ไหน',
    phonetic: 'Ran Khai Ya Yoo Thee Nai?',
    urgency: 'normal',
    icon: '💊',
  },

  // 🚕 TAKSİ & ŞOFÖR & YÖN
  {
    id: 't1',
    category: 'transport_taxi',
    turkish: 'Lütfen beni otelime götürün',
    thai: 'ช่วยไปส่งที่โรงแรมนี้หน่อยครับ/ค่ะ',
    phonetic: 'Chuai Pai Song Thee Rong-Raem',
    urgency: 'normal',
    icon: '🏨',
  },
  {
    id: 't2',
    category: 'transport_taxi',
    turkish: 'Lütfen taksimetreyi açın',
    thai: 'ช่วยเปิดมิเตอร์ด้วยครับ/ค่ะ',
    phonetic: 'Chuai Perd Meter Duai Krub/Kha',
    urgency: 'normal',
    icon: '⏱️',
  },
  {
    id: 't3',
    category: 'transport_taxi',
    turkish: 'Havalimanına gitmek istiyorum',
    thai: 'ไปสนามบินภูเก็ตครับ/ค่ะ',
    phonetic: 'Pai Sanambin Phuket',
    urgency: 'normal',
    icon: '✈️',
  },
  {
    id: 't4',
    category: 'transport_taxi',
    turkish: 'Burada durabilir misiniz?',
    thai: 'จอดที่นี่ได้ไหมครับ/ค่ะ',
    phonetic: 'Jort Thee Nee Dai Mai?',
    urgency: 'normal',
    icon: '🛑',
  },

  // 🚤 TEKNE & ADA
  {
    id: 'b1',
    category: 'boat_tour',
    turkish: 'Tekne saat kaçta hareket ediyor?',
    thai: 'เรือออกกี่โมงครับ/ค่ะ',
    phonetic: 'Ruea Ork Kee Mong?',
    urgency: 'normal',
    icon: '⏰',
  },
  {
    id: 'b2',
    category: 'boat_tour',
    turkish: 'Can yeleği alabilir miyim?',
    thai: 'ขอเสื้อชูชีพหน่อยครับ/ค่ะ',
    phonetic: 'Khor Suea Choo-Cheep',
    urgency: 'high',
    icon: '🦺',
  },
  {
    id: 'b3',
    category: 'boat_tour',
    turkish: 'Dalış / Şnorkel maskesi rica ediyorum',
    thai: 'ขอหน้ากากดำน้ำหน่อยครับ/ค่ะ',
    phonetic: 'Khor Na-Gak Dam Nam',
    urgency: 'normal',
    icon: '🤿',
  },

  // 🛍️ PAZAR & ALIŞVERİŞ
  {
    id: 's1',
    category: 'shopping_market',
    turkish: 'Biraz indirim yapabilir misiniz?',
    thai: 'ลดหน่อยได้ไหมครับ/ค่ะ',
    phonetic: 'Lod Noi Dai Mai Krub/Kha?',
    urgency: 'normal',
    icon: '🏷️',
  },
  {
    id: 's2',
    category: 'shopping_market',
    turkish: 'Kredi kartı geçerli mi?',
    thai: 'รับบัตรเครดิตไหมครับ/ค่ะ',
    phonetic: 'Rub Card Credit Mai?',
    urgency: 'normal',
    icon: '💳',
  },
  {
    id: 's3',
    category: 'shopping_market',
    turkish: 'Teşekkür ederim (Erkek: Krub / Kadın: Kha)',
    thai: 'ขอบคุณครับ/ค่ะ',
    phonetic: 'Khop Khun Krub / Khop Khun Kha',
    urgency: 'normal',
    icon: '🙏',
  },
];

/**
 * Filtrelenmiş veya aranan ifadeleri getirir.
 */
export function filterPocketThaiPhrases(
  query: string = '',
  category: string = 'all'
): PocketThaiPhrase[] {
  const q = (query || '').toLowerCase().trim();
  return POCKET_THAI_PHRASES.filter((p) => {
    const matchCategory = category === 'all' || p.category === category;
    const matchQuery =
      !q ||
      p.turkish.toLowerCase().includes(q) ||
      p.phonetic.toLowerCase().includes(q) ||
      p.thai.includes(q);
    return matchCategory && matchQuery;
  });
}
