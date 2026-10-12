export interface BookingTourSchedule {
  tourId?: string;
  tourTitle: string;
  tourDate: string;
  pickupTime?: string;
  priceThb?: number;
  costThb?: number;
  supplier?: string;
  nationalParkFeeIncluded?: boolean;
}

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
  tours?: BookingTourSchedule[];
  adultCount: number;
  childCount: number;
  totalPriceThb: number;
  costThb?: number;
  supplier?: string;
  paidAmountThb: number;
  remainingAmountThb: number;
  nationalParkFeeIncluded?: boolean;
  status: 'inquiry' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  specialNotes?: string;
  createdAt: string;
}

export interface TourFaq {
  q: string;
  a: string;
}

export interface TourItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  priceThb: number;
  costThb?: number;
  supplier?: string;
  duration: string;
  featured: boolean;
  active: boolean;
  image: string;
  excerpt?: string;
  gallery?: string[];
  included?: string[];
  excluded?: string[];
  program?: string[];
  faq?: TourFaq[];
  restrictions?: string[];
  body?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: 'system' | 'uploaded' | 'external';
  size?: string;
  createdAt: string;
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
    tours: [
      {
        tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
        tourDate: '2026-11-15',
        pickupTime: '07:30',
        priceThb: 3200,
        costThb: 1900,
        supplier: 'Andaman Wave Master',
        nationalParkFeeIncluded: false,
      },
    ],
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6400,
    costThb: 3800,
    supplier: 'Andaman Wave Master',
    paidAmountThb: 2400,
    remainingAmountThb: 4000,
    nationalParkFeeIncluded: false,
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
    tours: [
      {
        tourTitle: 'James Bond Adası ve Kano Turu',
        tourDate: '2026-11-16',
        pickupTime: '08:15',
        priceThb: 2800,
        costThb: 1700,
        supplier: 'Phang Nga Discovery',
        nationalParkFeeIncluded: true,
      },
    ],
    adultCount: 3,
    childCount: 1,
    totalPriceThb: 11200,
    costThb: 6800,
    supplier: 'Phang Nga Discovery',
    paidAmountThb: 11200,
    remainingAmountThb: 0,
    nationalParkFeeIncluded: true,
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
    tours: [
      {
        tourTitle: 'Moonlight Lüks Özel Yat Kiralama',
        tourDate: '2026-11-18',
        pickupTime: '13:00',
        priceThb: 45000,
        costThb: 30000,
        supplier: 'Blue Voyage Charters',
        nationalParkFeeIncluded: true,
      },
    ],
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 45000,
    costThb: 30000,
    supplier: 'Blue Voyage Charters',
    paidAmountThb: 15000,
    remainingAmountThb: 30000,
    nationalParkFeeIncluded: true,
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
