import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Calendar,
  Compass,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MessageCircle,
  Building,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  Lock,
  LogOut,
  ChevronRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Download,
  Settings,
  HelpCircle,
  Star,
  Save,
  Check,
  ChevronDown,
  BookOpen,
  Car,
  MessageSquareQuote,
  LayoutTemplate
} from 'lucide-react';
import {
  initialBookings,
  type Booking,
  type TourItem,
  type FaqItem,
  type TestimonialItem,
  type ServiceItem,
  type BlogItem
} from '../../data/adminInitialData';

const STORAGE_KEY_BOOKINGS = 'phuket_tatili_crm_bookings_v2';
const STORAGE_KEY_TOURS = 'phuket_tatili_crm_tours_v2';
const STORAGE_KEY_BLOGS = 'phuket_tatili_crm_blogs_v2';
const STORAGE_KEY_SERVICES = 'phuket_tatili_crm_services_v2';
const STORAGE_KEY_FAQS = 'phuket_tatili_crm_faqs_v2';
const STORAGE_KEY_TESTIMONIALS = 'phuket_tatili_crm_testimonials_v2';
const STORAGE_KEY_SITE = 'phuket_tatili_crm_site_settings_v2';
const STORAGE_KEY_AUTH = 'phuket_tatili_admin_auth_v1';
// Şifre build'de bundle'a gömülmez — sadece sunucuda/CI'da tutulur.
// ADMIN_PASSCODE env değişkeni yoksa varsayılan şifre etkin DEĞİLDİR.
const ADMIN_PASSCODE = import.meta.env.ADMIN_PASSCODE || '';

interface SiteSettingsState {
  whatsappNumber: string;
  email: string;
  siteTitle: string;
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
}

interface AdminDashboardProps {
  initialTours: TourItem[];
  initialBlogs: BlogItem[];
  initialServices: ServiceItem[];
  initialFaqs: FaqItem[];
  initialTestimonials: TestimonialItem[];
  initialSiteSettings: SiteSettingsState;
  availableImages?: string[];
}

// Panelin görsel seçiminde sunacağı varsayılan envanter (prop gelmezse)
const DEFAULT_AVAILABLE_IMAGES = [
  'phuket_hero.webp',
  'phuket_yacht.webp',
  'pileh.webp',
  'beach.webp',
  'beachclub.webp',
  'couple.webp',
  'family.webp',
  'longtail.webp',
  'railay.webp',
  'bay.webp',
  'elephant.webp',
  'underwater.webp',
  'culture.webp',
  'food.webp',
  'phuket_transfer.webp',
  'phuket_tours.webp',
  'phuket_culture.webp',
];

export default function AdminDashboard({
  initialTours,
  initialBlogs,
  initialServices,
  initialFaqs,
  initialTestimonials,
  initialSiteSettings,
  availableImages = DEFAULT_AVAILABLE_IMAGES,
}: AdminDashboardProps) {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'bookings' | 'tours' | 'blogs' | 'services' | 'faqs' | 'testimonials' | 'whatsapp' | 'settings'
  >('overview');

  // 1. Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  // 2. Tours State
  const [tours, setTours] = useState<TourItem[]>([]);
  const [tourSearchQuery, setTourSearchQuery] = useState<string>('');
  const [tourCategoryFilter, setTourCategoryFilter] = useState<string>('all');
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [editingTour, setEditingTour] = useState<TourItem | null>(null);
  const [tourFormData, setTourFormData] = useState<Partial<TourItem>>({});

  // 3. Blogs State
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogFormData, setBlogFormData] = useState<Partial<BlogItem>>({});

  // 4. Services State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Partial<ServiceItem>>({});

  // 5. FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqFormData, setFaqFormData] = useState<Partial<FaqItem>>({});

  // 6. Testimonials State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isTestiModalOpen, setIsTestiModalOpen] = useState<boolean>(false);
  const [editingTesti, setEditingTesti] = useState<TestimonialItem | null>(null);
  const [testiFormData, setTestiFormData] = useState<Partial<TestimonialItem>>({});

  // 7. Site Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettingsState>(initialSiteSettings);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    try {
      const auth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (auth === 'true') setIsAuthenticated(true);

      // Load Bookings
      const savedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      setBookings(savedBookings ? JSON.parse(savedBookings) : initialBookings);

      // Load Tours
      const savedTours = localStorage.getItem(STORAGE_KEY_TOURS);
      setTours(savedTours ? JSON.parse(savedTours) : initialTours);

      // Load Blogs
      const savedBlogs = localStorage.getItem(STORAGE_KEY_BLOGS);
      setBlogs(savedBlogs ? JSON.parse(savedBlogs) : initialBlogs);

      // Load Services
      const savedServices = localStorage.getItem(STORAGE_KEY_SERVICES);
      setServices(savedServices ? JSON.parse(savedServices) : initialServices);

      // Load FAQs
      const savedFaqs = localStorage.getItem(STORAGE_KEY_FAQS);
      setFaqs(savedFaqs ? JSON.parse(savedFaqs) : initialFaqs);

      // Load Testimonials
      const savedTestis = localStorage.getItem(STORAGE_KEY_TESTIMONIALS);
      setTestimonials(savedTestis ? JSON.parse(savedTestis) : initialTestimonials);

      // Load Settings
      const savedSettings = localStorage.getItem(STORAGE_KEY_SITE);
      if (savedSettings) setSiteSettings(JSON.parse(savedSettings));
    } catch {
      setBookings(initialBookings);
      setTours(initialTours);
    }
  }, []);

  // Save helpers
  const saveBookings = (next: Booking[]) => {
    setBookings(next);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(next));
  };
  const saveTours = (next: TourItem[]) => {
    setTours(next);
    localStorage.setItem(STORAGE_KEY_TOURS, JSON.stringify(next));
  };
  const saveBlogs = (next: BlogItem[]) => {
    setBlogs(next);
    localStorage.setItem(STORAGE_KEY_BLOGS, JSON.stringify(next));
  };
  const saveServices = (next: ServiceItem[]) => {
    setServices(next);
    localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(next));
  };
  const saveFaqs = (next: FaqItem[]) => {
    setFaqs(next);
    localStorage.setItem(STORAGE_KEY_FAQS, JSON.stringify(next));
  };
  const saveTestimonials = (next: TestimonialItem[]) => {
    setTestimonials(next);
    localStorage.setItem(STORAGE_KEY_TESTIMONIALS, JSON.stringify(next));
  };

  // Auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ADMIN_PASSCODE && passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } else {
      setAuthError(ADMIN_PASSCODE ? 'Hatalı yönetici şifresi!' : 'Panel henüz yapılandırılmamış. Sunucu yöneticisi ADMIN_PASSCODE ortam değişkenini tanımlamalı.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  // Metrics
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const pendingCount = bookings.filter((b) => b.status === 'inquiry').length;
    const totalRevenueThb = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.totalPriceThb || 0), 0);
    const collectedRevenueThb = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.paidAmountThb || 0), 0);
    const pendingCollectionThb = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.remainingAmountThb || 0), 0);
    const totalGuests = bookings
      .filter((b) => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.adultCount || 0) + (b.childCount || 0), 0);

    return {
      totalBookings,
      confirmedCount,
      pendingCount,
      totalRevenueThb,
      collectedRevenueThb,
      pendingCollectionThb,
      totalGuests,
    };
  }, [bookings]);

  // Filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tourTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchDate = !dateFilter || b.tourDate === dateFilter;
      return matchSearch && matchStatus && matchDate;
    });
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(tourSearchQuery.toLowerCase());
      const matchCat = tourCategoryFilter === 'all' || t.category === tourCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [tours, tourSearchQuery, tourCategoryFilter]);

  // Booking CRUD
  const handleOpenCreateBooking = () => {
    setEditingBooking(null);
    setFormData({
      customerName: '',
      phone: '',
      hotel: '',
      roomNumber: '',
      tourTitle: tours[0]?.title || 'Phi Phi Adaları',
      tourDate: new Date().toISOString().split('T')[0],
      pickupTime: '07:30',
      adultCount: 2,
      childCount: 0,
      totalPriceThb: 6400,
      paidAmountThb: 2000,
      status: 'confirmed',
      paymentStatus: 'partial',
      specialNotes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditBooking = (b: Booking) => {
    setEditingBooking(b);
    setFormData(b);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = (id: string, name: string) => {
    if (window.confirm(`"${name}" rezervasyonunu silmek istediğinize emin misiniz?`)) {
      saveBookings(bookings.filter((b) => b.id !== id));
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(formData.totalPriceThb) || 0;
    const paid = Number(formData.paidAmountThb) || 0;
    const remaining = Math.max(0, total - paid);

    let paymentStatus: Booking['paymentStatus'] = 'unpaid';
    if (paid >= total && total > 0) paymentStatus = 'paid';
    else if (paid > 0) paymentStatus = 'partial';

    if (editingBooking) {
      const updated = bookings.map((b) =>
        b.id === editingBooking.id
          ? ({
              ...b,
              ...formData,
              totalPriceThb: total,
              paidAmountThb: paid,
              remainingAmountThb: remaining,
              paymentStatus,
            } as Booking)
          : b
      );
      saveBookings(updated);
    } else {
      const newBooking: Booking = {
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: formData.customerName || 'İsimsiz Misafir',
        phone: formData.phone || '',
        hotel: formData.hotel || 'Belirtilmedi',
        roomNumber: formData.roomNumber,
        tourId: formData.tourId || 'genel-tur',
        tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
        tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
        pickupTime: formData.pickupTime || '07:30',
        adultCount: Number(formData.adultCount) || 1,
        childCount: Number(formData.childCount) || 0,
        totalPriceThb: total,
        paidAmountThb: paid,
        remainingAmountThb: remaining,
        status: (formData.status as Booking['status']) || 'confirmed',
        paymentStatus,
        specialNotes: formData.specialNotes,
        createdAt: new Date().toISOString().split('T')[0],
      };
      saveBookings([newBooking, ...bookings]);
    }
    setIsModalOpen(false);
  };

  // Tour CRUD
  const handleOpenCreateTour = () => {
    setEditingTour(null);
    setTourFormData({
      title: '',
      category: 'island-tours',
      categoryLabel: 'Ada Turları',
      priceThb: 3200,
      duration: 'Tam Gün (08:00 - 17:00)',
      featured: false,
      active: true,
      image: 'phuket_hero.webp',
      excerpt: '',
      gallery: [],
    });
    setIsTourModalOpen(true);
  };

  const handleOpenEditTour = (t: TourItem) => {
    setEditingTour(t);
    setTourFormData(t);
    setIsTourModalOpen(true);
  };

  const handleDeleteTour = (id: string, title: string) => {
    if (window.confirm(`"${title}" turunu silmek istediğinize emin misiniz?`)) {
      saveTours(tours.filter((t) => t.id !== id));
    }
  };

  const handleToggleTourFeatured = (id: string) => {
    saveTours(tours.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t)));
  };

  const handleSubmitTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourFormData.title) return;

    if (editingTour) {
      saveTours(
        tours.map((t) =>
          t.id === editingTour.id
            ? ({ ...t, ...tourFormData, priceThb: Number(tourFormData.priceThb) || 0 } as TourItem)
            : t
        )
      );
    } else {
      const slug = tourFormData.title
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newTour: TourItem = {
        id: slug || `tur-${Date.now()}`,
        title: tourFormData.title,
        category: tourFormData.category || 'island-tours',
        categoryLabel:
          tourFormData.category === 'island-tours'
            ? 'Ada Turları'
            : tourFormData.category === 'adventure-tours'
            ? 'Macera & Doğa'
            : tourFormData.category === 'entertainment-tours'
            ? 'Kültür & Şov'
            : 'VIP Yat & Özel',
        priceThb: Number(tourFormData.priceThb) || 0,
        duration: tourFormData.duration || 'Tam Gün',
        featured: Boolean(tourFormData.featured),
        active: true,
        image: tourFormData.image || 'phuket_hero.webp',
        excerpt: tourFormData.excerpt,
        gallery: tourFormData.gallery || [],
      };
      saveTours([newTour, ...tours]);
    }
    setIsTourModalOpen(false);
  };

  // Blog CRUD
  const handleOpenCreateBlog = () => {
    setEditingBlog(null);
    setBlogFormData({
      title: '',
      excerpt: '',
      cover_image: 'pileh.webp',
      date: new Date().toISOString().split('T')[0],
      author: 'Phuket Tatili Ekibi',
      featured: false,
    });
    setIsBlogModalOpen(true);
  };

  const handleOpenEditBlog = (b: BlogItem) => {
    setEditingBlog(b);
    setBlogFormData(b);
    setIsBlogModalOpen(true);
  };

  const handleDeleteBlog = (id: string, title: string) => {
    if (window.confirm(`"${title}" yazısını silmek istediğinize emin misiniz?`)) {
      saveBlogs(blogs.filter((b) => b.id !== id));
    }
  };

  const handleSubmitBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogFormData.title) return;
    if (editingBlog) {
      saveBlogs(blogs.map((b) => (b.id === editingBlog.id ? ({ ...b, ...blogFormData } as BlogItem) : b)));
    } else {
      const slug = blogFormData.title
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-');
      const newBlog: BlogItem = {
        id: slug || `blog-${Date.now()}`,
        title: blogFormData.title,
        excerpt: blogFormData.excerpt || '',
        cover_image: blogFormData.cover_image || 'pileh.webp',
        date: blogFormData.date || new Date().toISOString().split('T')[0],
        author: blogFormData.author || 'Phuket Tatili Ekibi',
        featured: Boolean(blogFormData.featured),
      };
      saveBlogs([newBlog, ...blogs]);
    }
    setIsBlogModalOpen(false);
  };

  // Service CRUD
  const handleOpenEditService = (s: ServiceItem) => {
    setEditingService(s);
    setServiceFormData(s);
    setIsServiceModalOpen(true);
  };

  const handleSubmitService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    saveServices(
      services.map((s) => (s.slug === editingService.slug ? ({ ...s, ...serviceFormData } as ServiceItem) : s))
    );
    setIsServiceModalOpen(false);
  };

  // FAQ CRUD
  const handleOpenCreateFaq = () => {
    setEditingFaq(null);
    setFaqFormData({ question: '', answer: '' });
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (f: FaqItem) => {
    setEditingFaq(f);
    setFaqFormData(f);
    setIsFaqModalOpen(true);
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm('Bu SSS sorusunu silmek istediğinize emin misiniz?')) {
      saveFaqs(faqs.filter((f) => f.id !== id));
    }
  };

  const handleSubmitFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqFormData.question) return;
    if (editingFaq) {
      saveFaqs(faqs.map((f) => (f.id === editingFaq.id ? ({ ...f, ...faqFormData } as FaqItem) : f)));
    } else {
      const newFaq: FaqItem = {
        id: `faq-${Date.now()}`,
        question: faqFormData.question,
        answer: faqFormData.answer || '',
      };
      saveFaqs([...faqs, newFaq]);
    }
    setIsFaqModalOpen(false);
  };

  // Testimonial CRUD
  const handleOpenCreateTesti = () => {
    setEditingTesti(null);
    setTestiFormData({ name: '', type: 'Balayı Çifti', tour: 'Phi Phi & Maya Bay', stars: 5, text: '' });
    setIsTestiModalOpen(true);
  };

  const handleOpenEditTesti = (t: TestimonialItem) => {
    setEditingTesti(t);
    setTestiFormData(t);
    setIsTestiModalOpen(true);
  };

  const handleDeleteTesti = (id: string, name: string) => {
    if (window.confirm(`"${name}" adlı yorumu silmek istediğinize emin misiniz?`)) {
      saveTestimonials(testimonials.filter((t) => t.id !== id));
    }
  };

  const handleSubmitTesti = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testiFormData.name) return;
    if (editingTesti) {
      saveTestimonials(
        testimonials.map((t) => (t.id === editingTesti.id ? ({ ...t, ...testiFormData } as TestimonialItem) : t))
      );
    } else {
      const newTesti: TestimonialItem = {
        id: `testi-${Date.now()}`,
        name: testiFormData.name,
        type: testiFormData.type || 'Misafir',
        tour: testiFormData.tour || 'Phuket Turu',
        stars: Number(testiFormData.stars) || 5,
        text: testiFormData.text || '',
      };
      saveTestimonials([newTesti, ...testimonials]);
    }
    setIsTestiModalOpen(false);
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY_SITE, JSON.stringify(siteSettings));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // WhatsApp Message Link
  const createWhatsAppLink = (b: Booking, type: 'reminder' | 'confirm') => {
    const cleanPhone = b.phone.replace(/[^0-9]/g, '');
    let msg = '';
    if (type === 'reminder') {
      msg =
        `Merhaba ${b.customerName} Bey/Hanım! 🌴 Phuket Tatili ekibinden yazıyoruz.\n\n` +
        `📅 Yarınki turunuz: *${b.tourTitle}*\n` +
        `⏰ Otelden Alınış Saati: *${b.pickupTime || '07:30'}*\n` +
        `📍 Otel: *${b.hotel}* ${b.roomNumber ? `(Oda: ${b.roomNumber})` : ''}\n` +
        `👥 Kişi Sayısı: *${b.adultCount} Yetişkin ${b.childCount ? `, ${b.childCount} Çocuk` : ''}*\n` +
        (b.remainingAmountThb > 0
          ? `💰 Kalan Ödeme: *${b.remainingAmountThb.toLocaleString()} THB* (Rehbere elden teslim edebilirsiniz).\n\n`
          : `\n`) +
        `Lütfen belirtilen saatte otelinizin ana lobisinde hazır bulununuz. Harika bir gün dileriz! 🇹🇭`;
    } else {
      msg =
        `Merhaba ${b.customerName}! 🏝️ Phuket Tatili rezervasyonunuz onaylanmıştır.\n\n` +
        `📋 Rezervasyon No: *${b.id}*\n` +
        `Tur: *${b.tourTitle}*\n` +
        `Tarih: *${b.tourDate}*\n` +
        `Toplam Tutar: *${b.totalPriceThb.toLocaleString()} THB*\n` +
        `Ödenen Kapora: *${b.paidAmountThb.toLocaleString()} THB*\n` +
        `Kalan Tutar: *${b.remainingAmountThb.toLocaleString()} THB*\n\n` +
        `Herhangi bir sorunuzda bu hat üzerinden dilediğiniz zaman bize ulaşabilirsiniz.`;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID,Musteri,Telefon,Otel,Oda,Tur,Tarih,Saat,Yetiskin,Cocuk,ToplamTHB,OdenenTHB,KalanTHB,Durum\n'];
    const rows = bookings.map(
      (b) =>
        `"${b.id}","${b.customerName}","${b.phone}","${b.hotel}","${b.roomNumber || ''}","${b.tourTitle}","${b.tourDate}","${b.pickupTime || ''}",${b.adultCount},${b.childCount},${b.totalPriceThb},${b.paidAmountThb},${b.remainingAmountThb},"${b.status}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `phuket_tatili_rezervasyonlar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-brand-primary to-slate-950 p-4">
        <div className="w-full max-w-md bg-white dark:bg-surface-2 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-accent via-emerald-400 to-teal-500"></div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-accent/20">
              <Compass className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Phuket Tatili Operasyon
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tam Kapsamlı Acente & İçerik Yönetim Platformu
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Yönetici Şifresi
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Şifrenizi giriniz..."
                  className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  autoFocus
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Şifrenizi operasyon yöneticinizden alabilirsiniz.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-xl shadow-brand-primary/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Panele Güvenli Giriş Yap</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <a href="/" className="text-xs text-brand-accent hover:underline font-semibold">
              ← Web Sitesine Geri Dön
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED FULL DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-1/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-primary to-slate-800 text-white flex items-center justify-center font-serif font-bold text-lg shadow-md border border-slate-700">
              PT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-brand-primary dark:text-white leading-none">
                  Phuket Tatili <span className="text-brand-accent italic font-sans text-sm font-semibold">Yönetim & Operasyon</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Tam Yetki
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                Tüm Site İçeriği, Rezervasyonlar, Müşteriler ve Hizmetler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateBooking}
              className="px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-accent/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Rezervasyon</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 9-Tab Comprehensive Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800/60 py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Genel Bakış</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Müşteriler & Rezervasyon ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tours'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Turlar & Fiyatlar ({tours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Hizmetler (Transfer/VIP) ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'blogs'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Blog & Rehber ({blogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>SSS Soruları ({faqs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'testimonials'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Yorumlar ({testimonials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Şablonları</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Site & Hero Ayarları</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Toplam Rezervasyon</span>
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {stats.totalBookings}
                </div>
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="text-emerald-600 font-semibold">{stats.confirmedCount} Kesinleşen</span>
                  <span>·</span>
                  <span className="text-amber-600 font-semibold">{stats.pendingCount} Bekleyen</span>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Tahsil Edilen Kapora</span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stats.collectedRevenueThb.toLocaleString()} <span className="text-base font-medium">THB</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Kasadaki peşinat toplamı</p>
              </div>

              <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Kalan Tahsilat (Sahada)</span>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {stats.pendingCollectionThb.toLocaleString()} <span className="text-base font-medium">THB</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Tur günü otelde/teknede alınacak</p>
              </div>

              <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider">Toplam Misafir</span>
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {stats.totalGuests} <span className="text-base font-medium">Kişi</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Aktif yolcu sayısı</p>
              </div>
            </div>

            {/* Quick Content Navigation Cards */}
            <div>
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-4">
                İçerik & Modül Kısayolları
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
                >
                  <Users className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform mb-2" />
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Müşteriler</div>
                  <div className="text-xs text-slate-400">{bookings.length} Kayıt</div>
                </button>

                <button
                  onClick={() => setActiveTab('tours')}
                  className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
                >
                  <Compass className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform mb-2" />
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Turlar</div>
                  <div className="text-xs text-slate-400">{tours.length} Tur</div>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
                >
                  <Car className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform mb-2" />
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Hizmetler</div>
                  <div className="text-xs text-slate-400">{services.length} Sayfa</div>
                </button>

                <button
                  onClick={() => setActiveTab('blogs')}
                  className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
                >
                  <BookOpen className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform mb-2" />
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Blog & Rehber</div>
                  <div className="text-xs text-slate-400">{blogs.length} Yazı</div>
                </button>

                <button
                  onClick={() => setActiveTab('faqs')}
                  className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
                >
                  <HelpCircle className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform mb-2" />
                  <div className="font-bold text-sm text-slate-900 dark:text-white">SSS Soruları</div>
                  <div className="text-xs text-slate-400">{faqs.length} Soru</div>
                </button>

                <button
                  onClick={() => setActiveTab('testimonials')}
                  className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
                >
                  <MessageSquareQuote className="w-6 h-6 text-pink-500 group-hover:scale-110 transition-transform mb-2" />
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Yorumlar</div>
                  <div className="text-xs text-slate-400">{testimonials.length} Yorum</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: BOOKINGS CRM */}
        {/* ==================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Müşteri adı, otel, telefon veya tur ara..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="confirmed">🟢 Onaylananlar</option>
                  <option value="inquiry">🟡 Teklif / Bekleyen</option>
                  <option value="completed">🔵 Tamamlananlar</option>
                  <option value="cancelled">🔴 İptaller</option>
                </select>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Dışa Aktar (CSV)</span>
                </button>
                <button
                  onClick={handleOpenCreateBooking}
                  className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-md shadow-brand-primary/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Ekle</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-4 px-5">ID / Müşteri</th>
                      <th className="py-4 px-5">Otel & Oda</th>
                      <th className="py-4 px-5">Tur & Tarih</th>
                      <th className="py-4 px-5">Kişi</th>
                      <th className="py-4 px-5">Fiyat / Tahsilat</th>
                      <th className="py-4 px-5">Durum</th>
                      <th className="py-4 px-5 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Eşleşen rezervasyon kaydı bulunamadı.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-5">
                            <span className="font-mono text-[10px] text-slate-400 block">{b.id}</span>
                            <span className="font-bold text-slate-900 dark:text-white block">{b.customerName}</span>
                            <a
                              href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3" /> {b.phone}
                            </a>
                          </td>

                          <td className="py-4 px-5">
                            <span className="font-medium text-slate-800 dark:text-slate-200 block">{b.hotel}</span>
                            {b.roomNumber && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 block">Oda: {b.roomNumber}</span>
                            )}
                          </td>

                          <td className="py-4 px-5">
                            <span className="font-semibold text-slate-900 dark:text-white block">{b.tourTitle}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                              📅 {b.tourDate} {b.pickupTime ? `· ⏰ ${b.pickupTime}` : ''}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            <span className="font-bold">{b.adultCount} Yetişkin</span>
                            {b.childCount > 0 && <span className="text-xs text-slate-500 block">+{b.childCount} Çocuk</span>}
                          </td>

                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {b.totalPriceThb.toLocaleString()} THB
                            </div>
                            <div className="text-xs mt-0.5">
                              {b.remainingAmountThb === 0 ? (
                                <span className="text-emerald-600 font-semibold">✓ Tamamı Ödendi</span>
                              ) : (
                                <span className="text-amber-600 font-semibold">
                                  Kalan: {b.remainingAmountThb.toLocaleString()} THB
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <span
                              className={`text-xs font-bold py-1 px-2.5 rounded-lg border inline-block ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                  : b.status === 'inquiry'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                  : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                              }`}
                            >
                              {b.status === 'confirmed' ? '🟢 Onaylandı' : b.status === 'inquiry' ? '🟡 Teklif' : b.status}
                            </span>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={createWhatsAppLink(b, 'reminder')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                title="Alınış Mesajı At"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleOpenEditBooking(b)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(b.id, b.customerName)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: TOURS & PRICES */}
        {/* ==================================================== */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-2 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  Turlar & Fiyat Yönetimi ({tours.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tur ekleyin, kapak görselini seçin, fiyatları güncelleyin veya silin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={tourSearchQuery}
                  onChange={(e) => setTourSearchQuery(e.target.value)}
                  placeholder="Tur ara..."
                  className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                />
                <button
                  onClick={handleOpenCreateTour}
                  className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Tur Ekle</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTours.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col hover:border-brand-accent/50 transition-colors"
                >
                  <div className="h-44 relative bg-slate-100 dark:bg-slate-900">
                    <img
                      src={`/assets/${t.image}`}
                      alt={t.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {t.categoryLabel || t.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleTourFeatured(t.id)}
                      className={`absolute top-3 right-3 p-1.5 rounded-full text-xs font-bold transition-all ${
                        t.featured ? 'bg-amber-500 text-white shadow-md' : 'bg-black/50 text-slate-300 hover:text-white'
                      }`}
                      title={t.featured ? 'Öne Çıkarılan' : 'Öne Çıkar'}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t.duration || 'Tam Gün'}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Kişi Başı Ücret:</span>
                        <span className="font-extrabold text-base text-brand-primary dark:text-white">
                          {t.priceThb > 0 ? `${t.priceThb.toLocaleString()} THB` : 'Teklif Alın'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditTour(t)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`/turlar/${t.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-accent hover:text-white transition-colors"
                          title="Sitede Gör"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteTour(t.id, t.title)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: SERVICES MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Hizmet Sayfaları Yönetimi ({services.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Transferler, Oteller, Tatil Paketleri ve VIP Hizmetler sayfalarının başlık ve içeriklerini düzenleyin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {services.map((s) => (
                <div
                  key={s.slug}
                  className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                        {s.eyebrow || 'Hizmet'}
                      </span>
                      <span className="font-mono text-xs text-slate-400">/{s.slug}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{s.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {s.intro}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <a
                      href={`/${s.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Sayfayı Canlı Gör</span>
                    </a>
                    <button
                      onClick={() => handleOpenEditService(s)}
                      className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Düzenle</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: BLOG ARTICLES */}
        {/* ==================================================== */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  Blog & Gezi Rehberi Yönetimi ({blogs.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Yeni rehber yazısı ekleyin, kapak görsellerini ve özetlerini düzenleyin.
                </p>
              </div>
              <button
                onClick={handleOpenCreateBlog}
                className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Yazı Ekle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {blogs.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="h-40 relative bg-slate-100 dark:bg-slate-900">
                    <img
                      src={`/assets/${b.cover_image}`}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/pileh.webp';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                        {b.date}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{b.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{b.excerpt}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <a
                        href={`/blog/${b.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-accent hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Oku</span>
                      </a>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditBlog(b)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(b.id, b.title)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: FAQS */}
        {/* ==================================================== */}
        {activeTab === 'faqs' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  Sıkça Sorulan Sorular (FAQ) ({faqs.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ana sayfada yer alan SSS akordiyon sorularını ve cevaplarını yönetin.
                </p>
              </div>
              <button
                onClick={handleOpenCreateFaq}
                className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Soru Ekle</span>
              </button>
            </div>

            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <div
                  key={f.id}
                  className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-brand-accent block mb-1">Soru #{idx + 1}</span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{f.question}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{f.answer}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenEditFaq(f)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(f.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: TESTIMONIALS */}
        {/* ==================================================== */}
        {activeTab === 'testimonials' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  Müşteri Yorumları ({testimonials.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ana sayfadaki gerçek tatilci yorumlarını, puanlarını ve çift isimlerini yönetin.
                </p>
              </div>
              <button
                onClick={handleOpenCreateTesti}
                className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Yorum Ekle</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-amber-400 gap-0.5">
                        {Array.from({ length: t.stars || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed">
                      "{t.text}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{t.name}</div>
                      <div className="text-[11px] text-brand-accent">{t.tour}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditTesti(t)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTesti(t.id, t.name)}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: WHATSAPP TEMPLATES */}
        {/* ==================================================== */}
        {activeTab === 'whatsapp' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-[#25D366]/10 text-[#25D366]">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                    WhatsApp Otomatik Şablon Merkezi
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Misafirlerinize tur öncesi ve sonrası gönderebileceğiniz profesyonel Türkçe mesaj şablonları
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>1. Tur Öncesi Otel Alınış Hatırlatması</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed border border-slate-100 dark:border-slate-800">
                    {`Merhaba [İsim] Bey/Hanım! 🌴 Phuket Tatili ekibinden yazıyoruz.

📅 Yarınki turunuz: [Tur Adı]
⏰ Otelden Alınış Saati: [07:30]
📍 Otel: [Otel Adı] (Oda: [304])
👥 Kişi Sayısı: [2 Yetişkin]
💰 Kalan Ödeme: [4.000 THB]

Lütfen belirtilen saatte otelinizin ana lobisinde hazır bulununuz. Harika bir gün dileriz! 🇹🇭`}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  👉 Müşteriler sekmesindeki her satırın yanındaki yeşil WhatsApp butonuna basınca bu mesaj otomatik dolar.
                </p>
              </div>

              <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>2. Tur Sonrası Yorum & Memnuniyet Talebi</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed border border-slate-100 dark:border-slate-800">
                    {`Merhaba [İsim] Bey/Hanım! Umarız bugünkü turunuz harika geçmiştir. 🏝️✨

Sizlerin memnuniyeti bizim için çok değerli. Deneyiminizi birkaç cümleyle değerlendirmek ister misiniz? 

Görüşlerinizi web sitemizde ve Google haritalarda diğer Türk tatilcilerle paylaşmaktan mutluluk duyarız. İyi tatiller! 🙏`}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">
                  👉 Tur bittikten sonra misafirden Google yorumu almak için idealdir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 9: SITE & HERO SETTINGS */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
                Genel İletişim & Ana Sayfa (Hero) Ayarları
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                WhatsApp hattını, site başlığını ve ana sayfanın en üstündeki karşılama metinlerini düzenleyin.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                      WhatsApp Numarası
                    </label>
                    <input
                      type="text"
                      value={siteSettings.whatsappNumber}
                      onChange={(e) => setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Ülke koduyla, örn: 66828950665</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                      İletişim E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={siteSettings.email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    Instagram Profil Linki
                  </label>
                  <input
                    type="url"
                    value={siteSettings.instagramUrl}
                    onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                    Ana Sayfa Karşılama Alanı (Hero)
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                        Büyük Başlık (Hero Title)
                      </label>
                      <input
                        type="text"
                        value={siteSettings.heroTitle}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                        Alt Açıklama (Hero Subtitle)
                      </label>
                      <textarea
                        rows={2}
                        value={siteSettings.heroSubtitle}
                        onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  {settingsSaved ? (
                    <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Ayarlar kaydedildi!
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Ayarları Kaydet</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ==================================================== */}
      {/* MODAL 1: BOOKING */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                {editingBooking ? 'Rezervasyonu Düzenle' : 'Yeni Rezervasyon Ekle'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Müşteri Adı *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName || ''}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Telefon / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Otel & Bölge *</label>
                  <input
                    type="text"
                    required
                    value={formData.hotel || ''}
                    onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Oda Numarası</label>
                  <input
                    type="text"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Tur Seçimi *</label>
                  <select
                    value={formData.tourTitle || ''}
                    onChange={(e) => setFormData({ ...formData, tourTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  >
                    {tours.map((t) => (
                      <option key={t.id} value={t.title}>{t.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Tur Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={formData.tourDate || ''}
                    onChange={(e) => setFormData({ ...formData, tourDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Otel Alınış Saati</label>
                  <input
                    type="text"
                    value={formData.pickupTime || ''}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Yetişkin</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.adultCount || 1}
                    onChange={(e) => setFormData({ ...formData, adultCount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Çocuk</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.childCount || 0}
                    onChange={(e) => setFormData({ ...formData, childCount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Toplam Tutar (THB)</label>
                  <input
                    type="number"
                    value={formData.totalPriceThb || 0}
                    onChange={(e) => setFormData({ ...formData, totalPriceThb: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Alınan Kapora (THB)</label>
                  <input
                    type="number"
                    value={formData.paidAmountThb || 0}
                    onChange={(e) => setFormData({ ...formData, paidAmountThb: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none text-emerald-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Durum</label>
                  <select
                    value={formData.status || 'confirmed'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Booking['status'] })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-semibold"
                  >
                    <option value="inquiry">🟡 Teklif</option>
                    <option value="confirmed">🟢 Onaylandı</option>
                    <option value="completed">🔵 Tamamlandı</option>
                    <option value="cancelled">🔴 İptal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Özel Notlar</label>
                <textarea
                  rows={2}
                  value={formData.specialNotes || ''}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: TOUR */}
      {/* ==================================================== */}
      {isTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                {editingTour ? 'Turu Düzenle' : 'Yeni Tur Ekle'}
              </h2>
              <button onClick={() => setIsTourModalOpen(false)} className="p-2 text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSubmitTour} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Tur Başlığı *</label>
                <input
                  type="text"
                  required
                  value={tourFormData.title || ''}
                  onChange={(e) => setTourFormData({ ...tourFormData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Kategori *</label>
                  <select
                    value={tourFormData.category || 'island-tours'}
                    onChange={(e) => setTourFormData({ ...tourFormData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  >
                    <option value="island-tours">Ada Turları</option>
                    <option value="adventure-tours">Macera & Doğa</option>
                    <option value="entertainment-tours">Kültür & Şovlar</option>
                    <option value="private-charters">VIP Yat & Özel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Tur Süresi</label>
                  <input
                    type="text"
                    value={tourFormData.duration || ''}
                    onChange={(e) => setTourFormData({ ...tourFormData, duration: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Fiyat (THB)</label>
                  <input
                    type="number"
                    value={tourFormData.priceThb || 0}
                    onChange={(e) => setTourFormData({ ...tourFormData, priceThb: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Kapak Görseli *</label>
                  <select
                    value={tourFormData.image || 'phuket_hero.webp'}
                    onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-medium"
                  >
                    <option value="phuket_hero.webp">Phuket Hero (Plaj & Doğa)</option>
                    <option value="pileh.webp">Pileh Lagoon (Zümrüt Lagün & Kayalar)</option>
                    <option value="beach.webp">Beyaz Kumlu Ada Plajı</option>
                    <option value="longtail.webp">Geleneksel Longtail Tekne</option>
                    <option value="phuket_yacht.webp">Lüks Yat & Katamaran</option>
                    <option value="elephant.webp">Etik Fil Koruma Alanı</option>
                    <option value="culture.webp">Kültür, Gece & Sahne Şovları</option>
                    <option value="phuket_transfer.webp">VIP Transfer & Araç</option>
                  </select>
                </div>
              </div>

              {tourFormData.image && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <img
                    src={`/assets/${tourFormData.image}`}
                    alt="Seçilen Görsel"
                    className="w-16 h-12 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm"
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Görsel Önizleme</span>
                    <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                      /assets/{tourFormData.image}
                    </span>
                  </div>
                </div>
              )}

              {/* Turdan Fotoğraflar (Galeri) Yönetimi */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Turdan Fotoğraflar (Galeri)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tur sayfasının alt kısmında "Galeri" bölümünde görünecek fotoğraflar
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary text-white">
                    {(tourFormData.gallery || []).length} Fotoğraf
                  </span>
                </div>

                {/* Mevcut galeri önizlemeleri */}
                {(tourFormData.gallery || []).length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 mb-4">
                    {(tourFormData.gallery || []).map((img, idx) => (
                      <div key={`${img}-${idx}`} className="relative group">
                        <img
                          src={`/assets/${img}`}
                          alt={`Galeri ${idx + 1}`}
                          className="w-full h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setTourFormData({
                              ...tourFormData,
                              gallery: (tourFormData.gallery || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Fotoğrafı kaldır"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold">
                            İlk
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Fotoğraf ekleme seçimi */}
                <div className="flex items-center gap-2">
                  <select
                    value=""
                    onChange={(e) => {
                      const selected = e.target.value;
                      if (selected && !(tourFormData.gallery || []).includes(selected)) {
                        setTourFormData({
                          ...tourFormData,
                          gallery: [...(tourFormData.gallery || []), selected],
                        });
                      }
                      e.target.value = '';
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  >
                    <option value="">+ Fotoğraf seçin ve ekleyin...</option>
                    {availableImages.map((img) => (
                      <option key={img} value={img}>
                        {img}
                      </option>
                    ))}
                  </select>
                </div>

                {(tourFormData.gallery || []).length === 0 && (
                  <p className="text-[11px] text-slate-400 mt-3">
                    Galeri boş: tur sayfasında fotoğraf bölümü görünmez.
                  </p>
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tourFormData.featured || false}
                    onChange={(e) => setTourFormData({ ...tourFormData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Bu turu Ana Sayfada "Öne Çıkanlar" arasına ekle
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTourModalOpen(false)} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: BLOG */}
      {/* ==================================================== */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold font-serif mb-4">
              {editingBlog ? 'Yazıyı Düzenle' : 'Yeni Blog / Rehber Yazısı'}
            </h2>
            <form onSubmit={handleSubmitBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Yazı Başlığı *</label>
                <input
                  type="text"
                  required
                  value={blogFormData.title || ''}
                  onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Kısa Özet *</label>
                <textarea
                  rows={3}
                  required
                  value={blogFormData.excerpt || ''}
                  onChange={(e) => setBlogFormData({ ...blogFormData, excerpt: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Yazar</label>
                  <input
                    type="text"
                    value={blogFormData.author || ''}
                    onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Tarih</label>
                  <input
                    type="date"
                    value={blogFormData.date || ''}
                    onChange={(e) => setBlogFormData({ ...blogFormData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Kapak Görseli</label>
                <select
                  value={blogFormData.cover_image || 'pileh.webp'}
                  onChange={(e) => setBlogFormData({ ...blogFormData, cover_image: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                >
                  {availableImages.map((img) => (
                    <option key={img} value={img}>{img}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogFormData.featured || false}
                    onChange={(e) => setBlogFormData({ ...blogFormData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-accent"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Öne çıkarılan yazı yap
                  </span>
                </label>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsBlogModalOpen(false)} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: SERVICE */}
      {/* ==================================================== */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold font-serif mb-4">Hizmet Sayfasını Düzenle</h2>
            <form onSubmit={handleSubmitService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Üst Etiket (Eyebrow)</label>
                  <input
                    type="text"
                    value={serviceFormData.eyebrow || ''}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, eyebrow: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Ana Başlık (Heading)</label>
                  <input
                    type="text"
                    value={serviceFormData.heading || ''}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, heading: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Giriş Metni (Intro)</label>
                <textarea
                  rows={3}
                  value={serviceFormData.intro || ''}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, intro: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                />
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: FAQ */}
      {/* ==================================================== */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold font-serif mb-4">
              {editingFaq ? 'Soruyu Düzenle' : 'Yeni SSS Sorusu'}
            </h2>
            <form onSubmit={handleSubmitFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Soru *</label>
                <input
                  type="text"
                  required
                  value={faqFormData.question || ''}
                  onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Cevap *</label>
                <textarea
                  rows={4}
                  required
                  value={faqFormData.answer || ''}
                  onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFaqModalOpen(false)} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: TESTIMONIAL */}
      {/* ==================================================== */}
      {isTestiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold font-serif mb-4">
              {editingTesti ? 'Yorumu Düzenle' : 'Yeni Müşteri Yorumu'}
            </h2>
            <form onSubmit={handleSubmitTesti} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">İsim *</label>
                  <input
                    type="text"
                    required
                    value={testiFormData.name || ''}
                    onChange={(e) => setTestiFormData({ ...testiFormData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Tip (Çift / Aile...)</label>
                  <input
                    type="text"
                    value={testiFormData.type || ''}
                    onChange={(e) => setTestiFormData({ ...testiFormData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Hangi Tur</label>
                  <input
                    type="text"
                    value={testiFormData.tour || ''}
                    onChange={(e) => setTestiFormData({ ...testiFormData, tour: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Puan (1-5)</label>
                  <select
                    value={testiFormData.stars || 5}
                    onChange={(e) => setTestiFormData({ ...testiFormData, stars: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} Yıldız</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Yorum Metni *</label>
                <textarea
                  rows={4}
                  required
                  value={testiFormData.text || ''}
                  onChange={(e) => setTestiFormData({ ...testiFormData, text: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTestiModalOpen(false)} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
