export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  hotel: string;
  roomNumber?: string;
  tourId: string;
  tourTitle: string;
  tourDate: string;
  pickupTime?: string;
  adultCount: number;
  childCount: number;
  totalPriceThb: number;
  paidAmountThb: number;
  remainingAmountThb: number;
  status: 'inquiry' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  specialNotes?: string;
  createdAt: string;
}

export interface TourItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  priceThb: number;
  duration: string;
  featured: boolean;
  active: boolean;
  image: string;
  excerpt?: string;
  gallery?: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  type: string;
  tour: string;
  stars: number;
  text: string;
}

export interface ServiceItem {
  slug: string;
  title: string;
  eyebrow?: string;
  heading?: string;
  intro?: string;
  media?: string;
}

export interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  cover_image: string;
  date: string;
  author: string;
  featured: boolean;
}

export const initialBookings: Booking[] = [
  {
    id: 'BK-1001',
    customerName: 'Ahmet & Zeynep Yılmaz',
    phone: '+90 532 456 78 90',
    email: 'ahmet.yilmaz@gmail.com',
    hotel: 'Amari Phuket (Patong)',
    roomNumber: '304',
    tourId: 'phi-phi-maya-ve-bamboo-adasi',
    tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
    tourDate: '2026-11-15',
    pickupTime: '07:30',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6400,
    paidAmountThb: 2400,
    remainingAmountThb: 4000,
    status: 'confirmed',
    paymentStatus: 'partial',
    specialNotes: 'Balayı çifti. Tekne ön tarafında oturmak istiyorlar. Vejetaryen öğle yemeği.',
    createdAt: '2026-10-10',
  },
  {
    id: 'BK-1002',
    customerName: 'Burak Demir',
    phone: '+90 544 123 45 67',
    email: 'burak.demir@outlook.com',
    hotel: 'The Shore at Katathani (Kata Noi)',
    roomNumber: 'Villa 12',
    tourId: 'james-bond-adasi-ve-kano-turu',
    tourTitle: 'James Bond Adası ve Kano Turu',
    tourDate: '2026-11-16',
    pickupTime: '08:15',
    adultCount: 3,
    childCount: 1,
    totalPriceThb: 11200,
    paidAmountThb: 11200,
    remainingAmountThb: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
    specialNotes: 'Ödemenin tamamı havale ile peşin alındı. Çocuk için can yeleği hazır edilecek.',
    createdAt: '2026-10-11',
  },
  {
    id: 'BK-1003',
    customerName: 'Selin & Mert Kaya',
    phone: '+90 533 987 65 43',
    hotel: 'Banyan Tree Phuket (Bang Tao)',
    roomNumber: '210',
    tourId: 'moonlight-luks-yat-turu',
    tourTitle: 'Moonlight Lüks Özel Yat Kiralama',
    tourDate: '2026-11-18',
    pickupTime: '13:00',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 45000,
    paidAmountThb: 15000,
    remainingAmountThb: 30000,
    status: 'confirmed',
    paymentStatus: 'partial',
    specialNotes: 'Gün batımı özel şampanya ve meyve ikramı talep edildi.',
    createdAt: '2026-10-11',
  },
  {
    id: 'BK-1004',
    customerName: 'Canan Özdemir (Aile)',
    phone: '+90 505 333 22 11',
    hotel: 'Novotel Phuket Resort (Patong)',
    tourId: 'fil-besleme-ve-bakim-deneyimi',
    tourTitle: 'Fil Besleme ve Doğal Bakım Deneyimi',
    tourDate: '2026-11-19',
    pickupTime: '09:00',
    adultCount: 2,
    childCount: 2,
    totalPriceThb: 9600,
    paidAmountThb: 0,
    remainingAmountThb: 9600,
    status: 'inquiry',
    paymentStatus: 'unpaid',
    specialNotes: 'WhatsApp üzerinden bilgi verildi, dönüş bekleniyor.',
    createdAt: '2026-10-12',
  },
];
