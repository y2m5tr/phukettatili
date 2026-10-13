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
  LayoutTemplate,
  Image,
  Upload,
  Copy,
  ExternalLink,
  ListPlus,
  Trash,
  PlusCircle,
  Maximize2,
  X,
  Layers,
  ListChecks,
  Info,
  Printer,
  Ticket,
  Briefcase,
  Share2,
  Wallet,
  Cloud,
  Smartphone,
  Bus,
  Wifi
} from 'lucide-react';
import {
  initialBookings,
  type Booking,
  type BookingTourSchedule,
  type TourItem,
  type TourFaq,
  type FaqItem,
  type TestimonialItem,
  type ServiceItem,
  type BlogItem,
  type MediaItem,
  detectHotelZone
} from '../../data/adminInitialData';
import BoardingPassModal from '../shared/BoardingPassModal';
import {
  supabase,
  isSupabaseConfigured,
  bookingToRow,
  rowToBooking
} from '../../lib/supabase';

const STORAGE_KEY_BOOKINGS = 'phuket_tatili_crm_bookings_v2';
const STORAGE_KEY_TOURS = 'phuket_tatili_crm_tours_v2';
const STORAGE_KEY_BLOGS = 'phuket_tatili_crm_blogs_v2';
const STORAGE_KEY_SERVICES = 'phuket_tatili_crm_services_v2';
const STORAGE_KEY_FAQS = 'phuket_tatili_crm_faqs_v2';
const STORAGE_KEY_TESTIMONIALS = 'phuket_tatili_crm_testimonials_v2';
const STORAGE_KEY_SITE = 'phuket_tatili_crm_site_settings_v2';
const STORAGE_KEY_MEDIA = 'phuket_tatili_crm_media_v2';
const STORAGE_KEY_AUTH = 'phuket_tatili_admin_auth_v1';
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
    'overview' | 'bookings' | 'transfers' | 'tours' | 'media' | 'blogs' | 'services' | 'faqs' | 'testimonials' | 'whatsapp' | 'settings'
  >('overview');

  // Toast Feedback
  const [toastMessage, setToastMessage] = useState<string>('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Cloud Database Sync State
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);

  // 1. Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  // Voucher / Ticket Modal State
  const [voucherBooking, setVoucherBooking] = useState<Booking | null>(null);

  // Driver Manifest & Operations State
  const [manifestDate, setManifestDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // 2. Tours State
  const [tours, setTours] = useState<TourItem[]>([]);
  const [tourSearchQuery, setTourSearchQuery] = useState<string>('');
  const [tourCategoryFilter, setTourCategoryFilter] = useState<string>('all');
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [editingTour, setEditingTour] = useState<TourItem | null>(null);
  const [tourFormData, setTourFormData] = useState<Partial<TourItem>>({});
  const [tourActiveTab, setTourActiveTab] = useState<
    'general' | 'photos' | 'itinerary' | 'inclusions' | 'faqs' | 'notes'
  >('general');
  // Dynamic fields for Tour Modal
  const [tempProgramItem, setTempProgramItem] = useState<string>('');
  const [tempIncludedItem, setTempIncludedItem] = useState<string>('');
  const [tempExcludedItem, setTempExcludedItem] = useState<string>('');
  const [tempFaqQ, setTempFaqQ] = useState<string>('');
  const [tempFaqA, setTempFaqA] = useState<string>('');
  const [tempRestrictionItem, setTempRestrictionItem] = useState<string>('');

  // 3. Media & Photos State
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'system' | 'uploaded' | 'external'>('all');
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState<boolean>(false);
  const [mediaUploadMode, setMediaUploadMode] = useState<'file' | 'url'>('file');
  const [newMediaTitle, setNewMediaTitle] = useState<string>('');
  const [newMediaUrl, setNewMediaUrl] = useState<string>('');
  const [selectedLightboxMedia, setSelectedLightboxMedia] = useState<MediaItem | null>(null);
  const [assignMediaModal, setAssignMediaModal] = useState<MediaItem | null>(null);

  // 4. Blogs State
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogFormData, setBlogFormData] = useState<Partial<BlogItem>>({});

  // 5. Services State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Partial<ServiceItem>>({});

  // 6. FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqFormData, setFaqFormData] = useState<Partial<FaqItem>>({});

  // 7. Testimonials State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isTestiModalOpen, setIsTestiModalOpen] = useState<boolean>(false);
  const [editingTesti, setEditingTesti] = useState<TestimonialItem | null>(null);
  const [testiFormData, setTestiFormData] = useState<Partial<TestimonialItem>>({});

  // 8. Site Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettingsState>(initialSiteSettings);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);

  // Helper for universal image URL resolution
  const getImageUrl = (img?: string): string => {
    if (!img) return '/assets/phuket_hero.webp';
    if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) {
      return img;
    }
    return `/assets/${img}`;
  };

  // Pre-seed default system media
  const getDefaultSystemMedia = (): MediaItem[] => {
    const list = availableImages && availableImages.length > 0 ? availableImages : DEFAULT_AVAILABLE_IMAGES;
    return list.map((filename, idx) => {
      const cleanName = filename.replace(/\.(webp|jpg|jpeg|png)$/i, '').replace(/[-_]/g, ' ');
      const title = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      return {
        id: `sys-${idx + 1}-${filename}`,
        title: title || filename,
        url: filename,
        type: 'system',
        createdAt: 'Sistem',
      };
    });
  };

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

      // Load Media
      const savedMedia = localStorage.getItem(STORAGE_KEY_MEDIA);
      if (savedMedia) {
        setMediaList(JSON.parse(savedMedia));
      } else {
        const defaultMedia = getDefaultSystemMedia();
        setMediaList(defaultMedia);
        localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(defaultMedia));
      }

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

      // ☁️ Supabase Cloud Database Synchronizer
      const db = isSupabaseConfigured ? supabase : null;
      if (db) {
        Promise.resolve(
          db
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false })
        )
          .then(({ data, error }) => {
            if (!error && data) {
              setIsCloudConnected(true);
              if (data.length > 0) {
                const cloudBookings = data.map(rowToBooking);
                setBookings(cloudBookings);
                localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(cloudBookings));
              } else {
                // Table exists but empty: seed initial bookings
                const rows = initialBookings.map(bookingToRow);
                void Promise.resolve(db.from('bookings').insert(rows)).then(() => {
                  console.log('Varsayılan rezervasyonlar Supabase veritabanına aktarıldı.');
                });
              }
            } else if (error) {
              console.warn('Supabase rezervasyon bildirim:', error.message);
            }
          })
          .catch((err: unknown) => {
            console.warn('Supabase bağlantı hatası:', err);
          });

        // Canlı Senkronizasyon (Realtime Websocket)
        const channel = db
          .channel('realtime_bookings_crm')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            (payload) => {
              setIsCloudConnected(true);
              if (payload.eventType === 'INSERT') {
                const newB = rowToBooking(payload.new);
                setBookings((prev) => {
                  const filtered = prev.filter((b) => b.id !== newB.id);
                  const nextList = [newB, ...filtered];
                  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(nextList));
                  return nextList;
                });
                showToast(`🔔 Canlı Rezervasyon: ${newB.customerName} eklendi!`);
              } else if (payload.eventType === 'UPDATE') {
                const updatedB = rowToBooking(payload.new);
                setBookings((prev) => {
                  const nextList = prev.map((b) => (b.id === updatedB.id ? updatedB : b));
                  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(nextList));
                  return nextList;
                });
              } else if (payload.eventType === 'DELETE') {
                const deletedId = (payload.old as any)?.id;
                if (deletedId) {
                  setBookings((prev) => {
                    const nextList = prev.filter((b) => b.id !== deletedId);
                    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(nextList));
                    return nextList;
                  });
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsCloudConnected(true);
            }
          });

        return () => {
          db.removeChannel(channel);
        };
      }
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
  const saveMediaList = (next: MediaItem[]) => {
    setMediaList(next);
    localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(next));
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

  // All available image URLs (system + uploaded) for pickers
  const allImageOptions = useMemo(() => {
    const set = new Set<string>();
    availableImages.forEach((img) => set.add(img));
    mediaList.forEach((m) => set.add(m.url));
    return Array.from(set);
  }, [availableImages, mediaList]);

  // Auth: accept phuket2026, admin123, or ADMIN_PASSCODE
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = passcode.trim();
    if (clean === 'phuket2026' || clean === 'admin123' || (ADMIN_PASSCODE && clean === ADMIN_PASSCODE)) {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } else {
      setAuthError('Hatalı yönetici şifresi! Lütfen geçerli şifreyi giriniz.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY_AUTH);
  };

  // Metrics & Profitability
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    const pendingCount = bookings.filter((b) => b.status === 'inquiry').length;
    const activeBookings = bookings.filter((b) => b.status !== 'cancelled');

    const totalRevenueThb = activeBookings.reduce((acc, b) => acc + (b.totalPriceThb || 0), 0);
    const collectedRevenueThb = activeBookings.reduce((acc, b) => acc + (b.paidAmountThb || 0), 0);
    const pendingCollectionThb = activeBookings.reduce((acc, b) => acc + (b.remainingAmountThb || 0), 0);
    const totalGuests = activeBookings.reduce((acc, b) => acc + (b.adultCount || 0) + (b.childCount || 0), 0);

    // Calculate total cost (Tedarikçi Maliyeti)
    const totalCostThb = activeBookings.reduce((acc, b) => {
      if (b.costThb !== undefined && b.costThb !== null) {
        return acc + b.costThb;
      }
      if (b.tours && b.tours.length > 0) {
        const toursCost = b.tours.reduce((tAcc, t) => tAcc + (t.costThb || 0), 0) * (b.adultCount || 1);
        return acc + toursCost;
      }
      return acc;
    }, 0);

    const netProfitThb = totalRevenueThb - totalCostThb;
    const profitMarginPercent = totalRevenueThb > 0 ? Math.round((netProfitThb / totalRevenueThb) * 100) : 0;

    return {
      totalBookings,
      confirmedCount,
      pendingCount,
      totalRevenueThb,
      collectedRevenueThb,
      pendingCollectionThb,
      totalGuests,
      totalCostThb,
      netProfitThb,
      profitMarginPercent,
    };
  }, [bookings]);

  // Filters
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        b.customerName.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.hotel.toLowerCase().includes(q) ||
        b.tourTitle.toLowerCase().includes(q) ||
        (b.tours || []).some((t) => t.tourTitle.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchDate =
        !dateFilter ||
        b.tourDate === dateFilter ||
        (b.tours || []).some((t) => t.tourDate === dateFilter);

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
    const initialTourItem = tours[0];
    const initialSchedule: BookingTourSchedule[] = [
      {
        tourTitle: initialTourItem?.title || 'Phi Phi, Maya Bay ve Bamboo Adası',
        tourDate: new Date().toISOString().split('T')[0],
        pickupTime: '07:30',
        priceThb: initialTourItem?.priceThb || 3200,
        costThb: initialTourItem?.costThb || 1900,
        supplier: initialTourItem?.supplier || 'Andaman Wave Master',
        nationalParkFeeIncluded: false,
      },
    ];

    setFormData({
      customerName: '',
      phone: '',
      hotel: '',
      roomNumber: '',
      tourTitle: initialTourItem?.title || 'Phi Phi Adaları',
      tourDate: new Date().toISOString().split('T')[0],
      pickupTime: '07:30',
      tours: initialSchedule,
      adultCount: 2,
      childCount: 0,
      totalPriceThb: (initialTourItem?.priceThb || 3200) * 2,
      costThb: (initialTourItem?.costThb || 1900) * 2,
      supplier: initialTourItem?.supplier || 'Andaman Wave Master',
      nationalParkFeeIncluded: false,
      paidAmountThb: 2000,
      status: 'confirmed',
      paymentStatus: 'partial',
      specialNotes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditBooking = (b: Booking) => {
    setEditingBooking(b);
    const schedule: BookingTourSchedule[] =
      b.tours && b.tours.length > 0
        ? b.tours
        : [
            {
              tourTitle: b.tourTitle,
              tourDate: b.tourDate,
              pickupTime: b.pickupTime || '07:30',
              priceThb: Math.round(b.totalPriceThb / (b.adultCount || 1)),
              costThb: b.costThb ? Math.round(b.costThb / (b.adultCount || 1)) : undefined,
              supplier: b.supplier,
              nationalParkFeeIncluded: b.nationalParkFeeIncluded,
            },
          ];

    setFormData({
      ...b,
      tours: schedule,
    });
    setIsModalOpen(true);
  };

  const handleDeleteBooking = (id: string, name: string) => {
    if (window.confirm(`"${name}" rezervasyonunu silmek istediğinize emin misiniz?`)) {
      saveBookings(bookings.filter((b) => b.id !== id));
      showToast('Rezervasyon silindi.');

      // ☁️ Sync delete with Supabase
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('bookings')
          .delete()
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('Supabase delete error:', error.message);
          });
      }
    }
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(formData.totalPriceThb) || 0;
    const paid = Number(formData.paidAmountThb) || 0;
    const remaining = Math.max(0, total - paid);
    const adults = Number(formData.adultCount) || 1;

    let paymentStatus: Booking['paymentStatus'] = 'unpaid';
    if (paid >= total && total > 0) paymentStatus = 'paid';
    else if (paid > 0) paymentStatus = 'partial';

    // Normalize tours schedule
    const schedule: BookingTourSchedule[] =
      formData.tours && formData.tours.length > 0
        ? formData.tours
        : [
            {
              tourTitle: formData.tourTitle || tours[0]?.title || 'Phuket Turu',
              tourDate: formData.tourDate || new Date().toISOString().split('T')[0],
              pickupTime: formData.pickupTime || '07:30',
              priceThb: total,
              costThb: formData.costThb ? Math.round(formData.costThb / adults) : 0,
              supplier: formData.supplier,
              nationalParkFeeIncluded: formData.nationalParkFeeIncluded,
            },
          ];

    // Calculate total cost from schedule if available
    const calculatedCost =
      formData.costThb !== undefined
        ? Number(formData.costThb)
        : schedule.reduce((acc, t) => acc + (t.costThb || 0), 0) * adults;

    // Primary summary title
    const primaryTourTitle =
      schedule.length > 1
        ? `${schedule[0].tourTitle} + ${schedule.length - 1} Tur`
        : schedule[0].tourTitle;
    const primaryTourDate = schedule[0].tourDate;
    const primaryPickupTime = schedule[0].pickupTime || '07:30';

    if (editingBooking) {
      const updated = bookings.map((b) =>
        b.id === editingBooking.id
          ? ({
              ...b,
              ...formData,
              tourTitle: primaryTourTitle,
              tourDate: primaryTourDate,
              pickupTime: primaryPickupTime,
              tours: schedule,
              totalPriceThb: total,
              costThb: calculatedCost,
              paidAmountThb: paid,
              remainingAmountThb: remaining,
              paymentStatus,
            } as Booking)
          : b
      );
      saveBookings(updated);
      showToast('Rezervasyon güncellendi!');

      // ☁️ Sync update with Supabase
      if (isSupabaseConfigured && supabase) {
        const target = updated.find((b) => b.id === editingBooking.id);
        if (target) {
          supabase
            .from('bookings')
            .upsert(bookingToRow(target))
            .then(({ error }) => {
              if (error) console.warn('Supabase upsert error:', error.message);
            });
        }
      }
    } else {
      const newBooking: Booking = {
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: formData.customerName || 'İsimsiz Misafir',
        phone: formData.phone || '',
        hotel: formData.hotel || 'Belirtilmedi',
        roomNumber: formData.roomNumber,
        tourId: formData.tourId || 'coklu-tur',
        tourTitle: primaryTourTitle,
        tourDate: primaryTourDate,
        pickupTime: primaryPickupTime,
        tours: schedule,
        adultCount: adults,
        childCount: Number(formData.childCount) || 0,
        totalPriceThb: total,
        costThb: calculatedCost,
        supplier: formData.supplier || schedule[0]?.supplier || 'Yerel Acente',
        paidAmountThb: paid,
        remainingAmountThb: remaining,
        nationalParkFeeIncluded: formData.nationalParkFeeIncluded ?? false,
        status: (formData.status as Booking['status']) || 'confirmed',
        paymentStatus,
        specialNotes: formData.specialNotes,
        createdAt: new Date().toISOString().split('T')[0],
      };
      saveBookings([newBooking, ...bookings]);
      showToast('Yeni rezervasyon başarıyla eklendi!');

      // ☁️ Sync insert with Supabase
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('bookings')
          .insert(bookingToRow(newBooking))
          .then(({ error }) => {
            if (error) console.warn('Supabase insert error:', error.message);
          });
      }
    }
    setIsModalOpen(false);
  };

  const handleAssignVehicleToBooking = async (
    bookingId: string,
    tourIndex: number,
    vehicle: string
  ) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;

    const full = { ...target };
    if (tourIndex >= 0 && full.tours && full.tours[tourIndex]) {
      const nextTours = [...full.tours];
      nextTours[tourIndex] = {
        ...nextTours[tourIndex],
        assignedVehicle: vehicle,
      };
      full.tours = nextTours;
    } else {
      full.assignedVehicle = vehicle;
    }

    const updated = bookings.map((b) => (b.id === bookingId ? full : b));
    setBookings(updated);
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));

    const db = isSupabaseConfigured ? supabase : null;
    if (db) {
      try {
        await db.from('bookings').update(bookingToRow(full)).eq('id', full.id);
      } catch (err) {
        console.warn('Supabase araç atama hatası:', err);
      }
    }

    showToast(`🚐 ${full.customerName} için hat atandı: ${vehicle}`);
  };

  // Tour CRUD
  const handleOpenCreateTour = () => {
    setEditingTour(null);
    setTourActiveTab('general');
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
      included: [
        'Otel çift yönlü klimalı transferi (seçili bölgeler)',
        'Sürat teknesi veya katamaran ulaşımı',
        'Öğle yemeği ve taze tropikal meyve ikramları',
        'Şnorkel maskesi, can yeleği ve deniz güvenlik ekipmanları',
        'İngilizce & Türkçe operasyon desteği',
        'Temel seyahat ve kaza sigortası',
      ],
      excluded: [
        'Millî park giriş ücretleri (yerinde nakit ödenir)',
        'Kişisel harcamalar ve özel içecekler',
        'Rehber ve tekne mürettebatı bahşişleri',
      ],
      program: [
        '07:30 - Otelden klimalı transfer ve iskelede karşılama & brifing',
        '09:00 - Sürat teknesi ile ilk ada koyuna hareket',
        '11:30 - Berrak turkuaz lagünde yüzme ve şnorkel molası',
        '13:00 - Adada kumsal kenarında açık büfe öğle yemeği',
        '14:30 - Fotoğraf çekimi, plaj yürüyüşü ve serbest zaman',
        '16:30 - Phuket iskelesine dönüş ve otele transfer',
      ],
      faq: [
        {
          q: 'Tura katılırken yanıma ne almalıyım?',
          a: 'Güneş kremi, güneş gözlüğü, havlu, yedek kuru kıyafet, su geçirmez telefon kılıfı ve milli park harçları için nakit Baht almanız önerilir.',
        },
        {
          q: 'Hava şartları bozulursa tur iptal olur mu?',
          a: 'Deniz güvenliği önceliğimizdir. Dalga veya hava uyarısı durumunda tur bir sonraki güne ertelenir veya tam iade sağlanır.',
        },
      ],
      restrictions: [
        'Hamile misafirler ve 1 yaşından küçük bebekler için sürat tekneleri uygun değildir.',
        'Kalp veya bel/omurga rahatsızlığı olan misafirlerimiz için katamaran turları önerilir.',
      ],
      body: 'Tur detayları ve özel rota notları...',
    });
    setIsTourModalOpen(true);
  };

  const handleOpenEditTour = (t: TourItem) => {
    setEditingTour(t);
    setTourActiveTab('general');
    setTourFormData({
      ...t,
      gallery: t.gallery || [],
      included: t.included || [],
      excluded: t.excluded || [],
      program: t.program || [],
      faq: t.faq || [],
      restrictions: t.restrictions || [],
      body: t.body || '',
    });
    setIsTourModalOpen(true);
  };

  const handleDeleteTour = (id: string, title: string) => {
    if (window.confirm(`"${title}" turunu silmek istediğinize emin misiniz?`)) {
      saveTours(tours.filter((t) => t.id !== id));
      showToast(`"${title}" turu silindi.`);
    }
  };

  const handleToggleTourFeatured = (id: string) => {
    saveTours(tours.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t)));
    showToast('Öne çıkarılan tur durumu güncellendi.');
  };

  const handleSubmitTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourFormData.title) return;

    if (editingTour) {
      saveTours(
        tours.map((t) =>
          t.id === editingTour.id
            ? ({
                ...t,
                ...tourFormData,
                priceThb: Number(tourFormData.priceThb) || 0,
                costThb: Number(tourFormData.costThb) || 0,
                supplier: tourFormData.supplier || '',
                gallery: tourFormData.gallery || [],
                included: tourFormData.included || [],
                excluded: tourFormData.excluded || [],
                program: tourFormData.program || [],
                faq: tourFormData.faq || [],
                restrictions: tourFormData.restrictions || [],
                body: tourFormData.body || '',
              } as TourItem)
            : t
        )
      );
      showToast('Tur başarıyla güncellendi!');
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
        costThb: Number(tourFormData.costThb) || 0,
        supplier: tourFormData.supplier || '',
        duration: tourFormData.duration || 'Tam Gün',
        featured: Boolean(tourFormData.featured),
        active: true,
        image: tourFormData.image || 'phuket_hero.webp',
        excerpt: tourFormData.excerpt,
        gallery: tourFormData.gallery || [],
        included: tourFormData.included || [],
        excluded: tourFormData.excluded || [],
        program: tourFormData.program || [],
        faq: tourFormData.faq || [],
        restrictions: tourFormData.restrictions || [],
        body: tourFormData.body || '',
      };
      saveTours([newTour, ...tours]);
      showToast('Yeni tur başarıyla eklendi!');
    }
    setIsTourModalOpen(false);
  };

  // Media Handlers
  const filteredMedia = useMemo(() => {
    return mediaList.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
        m.url.toLowerCase().includes(mediaSearchQuery.toLowerCase());
      const matchesType = mediaTypeFilter === 'all' || m.type === mediaTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [mediaList, mediaSearchQuery, mediaTypeFilter]);

  const handleFileUpload = (file: File, callback?: (url: string) => void) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (!base64) return;
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const newMedia: MediaItem = {
        id: `med-${Date.now()}`,
        title: cleanTitle,
        url: base64,
        type: 'uploaded',
        size: `${Math.round(file.size / 1024)} KB`,
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      const updated = [newMedia, ...mediaList];
      saveMediaList(updated);
      showToast(`"${file.name}" başarıyla kütüphaneye yüklendi!`);
      if (callback) callback(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;
    const newMedia: MediaItem = {
      id: `med-${Date.now()}`,
      title: newMediaTitle.trim() || 'Yeni Görsel',
      url: newMediaUrl.trim(),
      type: mediaUploadMode === 'file' ? 'uploaded' : 'external',
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };
    saveMediaList([newMedia, ...mediaList]);
    setNewMediaTitle('');
    setNewMediaUrl('');
    setIsAddMediaModalOpen(false);
    showToast('Fotoğraf kütüphaneye eklendi!');
  };

  const handleDeleteMedia = (id: string, title: string) => {
    if (window.confirm(`"${title}" görselini kütüphaneden silmek istediğinize emin misiniz?`)) {
      saveMediaList(mediaList.filter((m) => m.id !== id));
      showToast('Görsel silindi.');
    }
  };

  const handleCopyMediaUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Görsel bağlantısı panoya kopyalandı! 📋');
  };

  const handleAssignMediaAsTourCover = (mediaUrl: string, tourId: string) => {
    saveTours(tours.map((t) => (t.id === tourId ? { ...t, image: mediaUrl } : t)));
    setAssignMediaModal(null);
    showToast('Görsel seçilen turun kapak fotoğrafı yapıldı! ⭐');
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
    const hasMultipleTours = Boolean(b.tours && b.tours.length > 1);
    const nationalParkWarning = b.nationalParkFeeIncluded === false
      ? `\n⚠️ *Önemli Hatırlatma:* Millî Park Giriş Ücreti fiyata dahil değildir. Lütfen limanda ödenmek üzere yanınızda kişi başı nakit Baht (THB) hazır bulundurunuz.\n`
      : '';

    let msg: string;

    if (type === 'reminder') {
      const tourScheduleText = hasMultipleTours
        ? b.tours!
            .map(
              (t, i) =>
                `${i + 1}️⃣ *${t.tourTitle}*\n` +
                `   📅 Tarih: *${t.tourDate}* | ⏰ Otelden Alınış: *${t.pickupTime || '07:30'}*`
            )
            .join('\n\n')
        : `📅 Tur: *${b.tourTitle}*\n` +
          `⏰ Otelden Alınış Saati: *${b.pickupTime || '07:30'}*`;

      msg =
        `Merhaba ${b.customerName} Bey/Hanım! 🌴 Phuket Tatili operasyon ekibinden yazıyoruz.\n\n` +
        `Rezerve ettiğiniz tur programınız:\n\n` +
        `${tourScheduleText}\n\n` +
        `📍 Otel: *${b.hotel}* ${b.roomNumber ? `(Oda: ${b.roomNumber})` : ''}\n` +
        `👥 Kişi Sayısı: *${b.adultCount} Yetişkin ${b.childCount ? `, ${b.childCount} Çocuk` : ''}*\n` +
        (b.remainingAmountThb > 0
          ? `💰 Kalan Ödeme: *${b.remainingAmountThb.toLocaleString()} THB* (Rehbere elden teslim edebilirsiniz).\n`
          : `\n`) +
        nationalParkWarning +
        `\nLütfen belirtilen saatte otelinizin ana lobisinde hazır bulununuz. Harika bir tatil dileriz! 🇹🇭`;
    } else {
      const tourScheduleText = hasMultipleTours
        ? b.tours!
            .map(
              (t, i) =>
                `${i + 1}️⃣ *${t.tourTitle}*\n` +
                `   📅 Tarih: *${t.tourDate}* ${t.pickupTime ? `| ⏰ Alınış: *${t.pickupTime}*` : ''}`
            )
            .join('\n')
        : `Tur: *${b.tourTitle}*\n` +
          `Tarih: *${b.tourDate}*`;

      msg =
        `Merhaba ${b.customerName}! 🏝️ Phuket Tatili rezervasyonunuz onaylanmıştır.\n\n` +
        `📋 Rezervasyon No: *${b.id}*\n\n` +
        `Tur Programınız:\n${tourScheduleText}\n\n` +
        `📍 Otel: *${b.hotel}*\n` +
        `Toplam Tutar: *${b.totalPriceThb.toLocaleString()} THB*\n` +
        `Ödenen Kapora: *${b.paidAmountThb.toLocaleString()} THB*\n` +
        `Kalan Tutar: *${b.remainingAmountThb.toLocaleString()} THB*\n` +
        nationalParkWarning +
        `\nHerhangi bir sorunuzda bu hat üzerinden dilediğiniz zaman bize ulaşabilirsiniz.`;
    }
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID,Musteri,Telefon,Otel,Oda,Turlar,Tarihler,Yetiskin,Cocuk,ToplamTHB,OdenenTHB,KalanTHB,Durum\n'];
    const rows = bookings.map((b) => {
      const toursSummary = (b.tours || [{ tourTitle: b.tourTitle, tourDate: b.tourDate }])
        .map((t) => `${t.tourTitle} (${t.tourDate})`)
        .join(' + ');
      const datesSummary = (b.tours || [{ tourDate: b.tourDate }]).map((t) => t.tourDate).join('; ');
      return `"${b.id}","${b.customerName}","${b.phone}","${b.hotel}","${b.roomNumber || ''}","${toursSummary}","${datesSummary}",${b.adultCount},${b.childCount},${b.totalPriceThb},${b.paidAmountThb},${b.remainingAmountThb},"${b.status}"\n`;
    });
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
                {isCloudConnected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                    Bulut Canlı (Supabase)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-slate-400" />
                    Yerel Mod
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                Tüm Site İçeriği, Rezervasyonlar, Müşteriler ve Hizmetler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/ekip"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Rehber & Saha Ekibi Mobil Uygulamasını Aç"
            >
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">📱 Saha / Rehber Uygulaması</span>
              <span className="sm:hidden">Saha</span>
            </a>

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
            onClick={() => setActiveTab('transfers')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'transfers'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>🚐 Transfer & Şoför Listesi</span>
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
            onClick={() => setActiveTab('media')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-brand-primary text-white shadow-sm ring-2 ring-brand-accent/50'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Image className="w-4 h-4 text-brand-accent" />
            <span>Medya & Fotoğraflar ({mediaList.length})</span>
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
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Rezervasyon</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.totalBookings}
                </div>
                <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="text-emerald-600 font-semibold">{stats.confirmedCount} Onay</span>
                  <span>·</span>
                  <span className="text-amber-600 font-semibold">{stats.pendingCount} Bekleyen</span>
                </div>
              </div>

              <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Ciro</span>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {stats.totalRevenueThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Toplam satış cirosu</p>
              </div>

              <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Tedarikçi Maliyeti</span>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {stats.totalCostThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Tekne & acente gideri</p>
              </div>

              <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-600/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500/20">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Net Kâr (Kazanç)</span>
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {stats.netProfitThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  %{stats.profitMarginPercent} Kâr Marjı
                </p>
              </div>

              <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Kasadaki Kapora</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stats.collectedRevenueThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Kasadaki peşinat</p>
              </div>

              <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Kalan (Sahada)</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {stats.pendingCollectionThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Otelde tahsil edilecek</p>
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
                            {b.tours && b.tours.length > 1 ? (
                              <div className="space-y-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-primary text-white shadow-2xs">
                                  🌴 {b.tours.length} Farklı Tur Paketi
                                </span>
                                {b.tours.map((t, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span className="font-semibold text-slate-900 dark:text-white block">
                                      {idx + 1}. {t.tourTitle}
                                    </span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                                      📅 {t.tourDate} {t.pickupTime ? `· ⏰ ${t.pickupTime}` : ''} {t.priceThb ? `· ${t.priceThb.toLocaleString()} THB` : ''}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <>
                                <span className="font-semibold text-slate-900 dark:text-white block">{b.tourTitle}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                                  📅 {b.tourDate} {b.pickupTime ? `· ⏰ ${b.pickupTime}` : ''}
                                </span>
                              </>
                            )}
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
                              <button
                                onClick={() => setVoucherBooking(b)}
                                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                                title="Bilet / Voucher Kuponu Aç"
                              >
                                <Ticket className="w-4 h-4" />
                              </button>
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
        {/* TAB 2.5: TRANSFERS & DRIVER MANIFEST */}
        {/* ==================================================== */}
        {activeTab === 'transfers' && (() => {
          // Flatten all scheduled tour pickups for the chosen date
          interface PickupItem {
            bookingId: string;
            customerName: string;
            phone: string;
            hotel: string;
            roomNumber?: string;
            tourTitle: string;
            pickupTime: string;
            adultCount: number;
            childCount: number;
            remainingAmountThb: number;
            specialNotes?: string;
            supplier?: string;
            status: string;
            assignedVehicle?: string;
            hotelZone: string;
            tourIndex: number;
          }

          const dailyPickups: PickupItem[] = [];
          bookings.forEach((b) => {
            if (b.status === 'cancelled') return;

            if (b.tours && b.tours.length > 0) {
              b.tours.forEach((t, tIdx) => {
                if (t.tourDate === manifestDate) {
                  dailyPickups.push({
                    bookingId: b.id,
                    customerName: b.customerName,
                    phone: b.phone,
                    hotel: b.hotel,
                    roomNumber: b.roomNumber,
                    tourTitle: t.tourTitle,
                    pickupTime: t.pickupTime || '07:30',
                    adultCount: b.adultCount,
                    childCount: b.childCount,
                    remainingAmountThb: b.remainingAmountThb,
                    specialNotes: b.specialNotes,
                    supplier: t.supplier || b.supplier,
                    status: b.status,
                    assignedVehicle: t.assignedVehicle || b.assignedVehicle || 'Atanmadı',
                    hotelZone: b.hotelZone || t.hotelZone || detectHotelZone(b.hotel),
                    tourIndex: tIdx,
                  });
                }
              });
            } else if (b.tourDate === manifestDate) {
              dailyPickups.push({
                bookingId: b.id,
                customerName: b.customerName,
                phone: b.phone,
                hotel: b.hotel,
                roomNumber: b.roomNumber,
                tourTitle: b.tourTitle,
                pickupTime: b.pickupTime || '07:30',
                adultCount: b.adultCount,
                childCount: b.childCount,
                remainingAmountThb: b.remainingAmountThb,
                specialNotes: b.specialNotes,
                supplier: b.supplier,
                status: b.status,
                assignedVehicle: b.assignedVehicle || 'Atanmadı',
                hotelZone: b.hotelZone || detectHotelZone(b.hotel),
                tourIndex: -1,
              });
            }
          });

          // Sort pickups chronologically by pickupTime
          dailyPickups.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));

          const totalDailyPassengers = dailyPickups.reduce(
            (acc, p) => acc + p.adultCount + p.childCount,
            0
          );

          // Generate clipboard text for drivers / suppliers
          const handleCopyManifest = () => {
            if (dailyPickups.length === 0) {
              showToast('Seçilen tarihte transfer kaydı bulunmuyor.');
              return;
            }
            const dateStr = new Date(manifestDate).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            const textLines = [
              `🚐 *PHUKET TATİLİ - GÜNLÜK TRANSFER & OPERASYON LİSTESİ*`,
              `📅 *Tarih:* ${dateStr}`,
              `👥 *Toplam Yolcu:* ${totalDailyPassengers} Kişi (${dailyPickups.length} Transfer)`,
              `───────────────────────────────`,
              ...dailyPickups.map((p, idx) => {
                const guests = `${p.adultCount} Yetişkin${p.childCount > 0 ? ` + ${p.childCount} Çocuk` : ''}`;
                const remainingText =
                  p.remainingAmountThb > 0
                    ? ` ⚠️ Tahsil Edilecek: *${p.remainingAmountThb.toLocaleString()} THB*`
                    : ` ✅ Ödendi`;
                return (
                  `${idx + 1}️⃣ ⏰ *${p.pickupTime}* — *${p.hotel}* ${p.roomNumber ? `(Oda: ${p.roomNumber})` : ''}\n` +
                  `   👤 Misafir: *${p.customerName}* (${guests})\n` +
                  `   📞 Tel: ${p.phone}\n` +
                  `   🏝️ Tur: *${p.tourTitle}*` +
                  (p.supplier ? ` [${p.supplier}]` : '') +
                  `\n   💰 Durum:${remainingText}` +
                  (p.specialNotes ? `\n   📝 Not: ${p.specialNotes}` : '') +
                  `\n`
                );
              }),
              `───────────────────────────────`,
              `🇹🇭 Phuket Tatili Operasyon Merkezi`,
            ];

            navigator.clipboard.writeText(textLines.join('\n'));
            showToast('Transfer listesi WhatsApp için panoya kopyalandı! 📋');
          };

          return (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      <Car className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                      Günlük Transfer & Şoför Dağıtım Listesi
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Şoförlere ve yerel transfer firmalarına iletilecek saat sıralı alınış listesi.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Quick Date Shortcuts */}
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setManifestDate(new Date().toISOString().split('T')[0])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        manifestDate === new Date().toISOString().split('T')[0]
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Bugün
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        setManifestDate(d.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                      Yarın
                    </button>
                  </div>

                  {/* Date Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={manifestDate}
                      onChange={(e) => setManifestDate(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyManifest}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Şoför İçin Kopyala</span>
                  </button>
                </div>
              </div>

              {/* Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Seçilen Tarih</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {new Date(manifestDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Transfer Sayısı</span>
                  <span className="text-base font-bold text-emerald-600 mt-0.5 block">
                    {dailyPickups.length} Araç Alınışı
                  </span>
                </div>

                <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Taşınacak Yolcu</span>
                  <span className="text-base font-bold text-purple-600 mt-0.5 block">
                    {totalDailyPassengers} Misafir
                  </span>
                </div>

                <div className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400 block">Sahada Kalan Tahsilat</span>
                  <span className="text-base font-bold text-amber-600 mt-0.5 block">
                    {dailyPickups
                      .reduce((acc, p) => acc + p.remainingAmountThb, 0)
                      .toLocaleString()}{' '}
                    THB
                  </span>
                </div>
              </div>

              {/* Manifest Table */}
              <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-slate-800 uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-4 px-5">⏰ Alınış Saati</th>
                        <th className="py-4 px-5">📍 Otel & Oda</th>
                        <th className="py-4 px-5">🚐 Hat & Minibüs</th>
                        <th className="py-4 px-5">👤 Misafir & Telefon</th>
                        <th className="py-4 px-5">👥 Kişi</th>
                        <th className="py-4 px-5">🏝️ Tur & Tedarikçi</th>
                        <th className="py-4 px-5">💰 Tahsilat Durumu</th>
                        <th className="py-4 px-5 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {dailyPickups.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-14 text-center text-slate-400">
                            <Car className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                            <p className="font-semibold text-slate-600 dark:text-slate-400">
                              Bu tarihte planlanmış herhangi bir transfer veya tur bulunamadı.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Yukarıdan başka bir tarih seçebilir veya rezervasyon ekleyebilirsiniz.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        dailyPickups.map((p, idx) => (
                          <tr
                            key={`${p.bookingId}-${idx}`}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                          >
                            <td className="py-4 px-5 font-mono text-sm font-extrabold text-brand-primary dark:text-brand-accent">
                              ⏰ {p.pickupTime}
                            </td>

                            <td className="py-4 px-5">
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {p.hotel}
                              </span>
                              {p.roomNumber && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  Oda: {p.roomNumber}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-5">
                              <select
                                value={p.assignedVehicle || 'Atanmadı'}
                                onChange={(e) =>
                                  handleAssignVehicleToBooking(
                                    p.bookingId,
                                    p.tourIndex,
                                    e.target.value
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                              >
                                <option value="Atanmadı">Hat Atanmadı</option>
                                <option value="Minibüs 1 (Patong & Kalim)">🚐 Minibüs 1 (Patong & Kalim)</option>
                                <option value="Minibüs 2 (Kata & Karon)">🚐 Minibüs 2 (Kata & Karon)</option>
                                <option value="Minibüs 3 (Bang Tao & Kamala)">🚐 Minibüs 3 (Bang Tao & Kamala)</option>
                                <option value="VIP Özel Araç">⭐ VIP Özel Araç</option>
                              </select>
                              <div className="text-[10px] text-sky-500 font-semibold mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{p.hotelZone}</span>
                              </div>
                            </td>

                            <td className="py-4 px-5">
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {p.customerName}
                              </span>
                              <a
                                href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-3 h-3" /> {p.phone}
                              </a>
                            </td>

                            <td className="py-4 px-5">
                              <span className="font-bold">{p.adultCount} Yetişkin</span>
                              {p.childCount > 0 && (
                                <span className="text-xs text-slate-500 block">
                                  +{p.childCount} Çocuk
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-5">
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {p.tourTitle}
                              </span>
                              {p.supplier && (
                                <span className="text-[11px] text-slate-400 block mt-0.5">
                                  Tedarikçi: {p.supplier}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-5">
                              {p.remainingAmountThb > 0 ? (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 inline-block">
                                  Alınacak: {p.remainingAmountThb.toLocaleString()} THB
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 inline-block">
                                  ✓ Tamamı Ödendi
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const target = bookings.find((b) => b.id === p.bookingId);
                                  if (target) setVoucherBooking(target);
                                }}
                                className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-colors"
                                title="Bilet / Voucher Kuponu Aç"
                              >
                                <Ticket className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

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
                      src={getImageUrl(t.image)}
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
                          title="Tüm Ayrıntılarıyla Düzenle"
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
        {/* TAB: MEDIA & PHOTO LIBRARY */}
        {/* ==================================================== */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-2 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                    Medya & Fotoğraf Kütüphanesi ({filteredMedia.length})
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                    Görsel Yönetim Merkezi
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Bilgisayarınızdan fotoğraf yükleyin, harici web URL'leri ekleyin veya mevcut sistem fotoğraflarını yönetin.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={mediaSearchQuery}
                    onChange={(e) => setMediaSearchQuery(e.target.value)}
                    placeholder="Fotoğraf ara..."
                    className="w-48 sm:w-56 px-3.5 py-2 pl-9 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 text-xs font-semibold">
                  <button
                    onClick={() => setMediaTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      mediaTypeFilter === 'all'
                        ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setMediaTypeFilter('system')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      mediaTypeFilter === 'system'
                        ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sistem
                  </button>
                  <button
                    onClick={() => setMediaTypeFilter('uploaded')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      mediaTypeFilter === 'uploaded'
                        ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Yüklenenler
                  </button>
                </div>

                <label className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Fotoğraf Yükle</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>

                <button
                  onClick={() => {
                    setMediaUploadMode('url');
                    setNewMediaTitle('');
                    setNewMediaUrl('');
                    setIsAddMediaModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>URL Ekle</span>
                </button>
              </div>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((m) => {
                const resolvedUrl = getImageUrl(m.url);
                return (
                  <div
                    key={m.id}
                    className="group bg-white dark:bg-surface-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:border-brand-accent/50 hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-900 overflow-hidden">
                      <img
                        src={resolvedUrl}
                        alt={m.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={() => setSelectedLightboxMedia(m)}
                          className="p-2 rounded-xl bg-white/95 text-slate-900 hover:bg-white shadow-md transform hover:scale-110 transition-transform"
                          title="Büyük Boyut İncele"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyMediaUrl(m.url)}
                          className="p-2 rounded-xl bg-white/95 text-slate-900 hover:bg-white shadow-md transform hover:scale-110 transition-transform"
                          title="Görsel Adını / Linkini Kopyala"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssignMediaModal(m)}
                          className="p-2 rounded-xl bg-brand-accent text-white hover:bg-brand-accent/90 shadow-md transform hover:scale-110 transition-transform"
                          title="Bir Tura Kapak Yap"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <span
                        className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                          m.type === 'system'
                            ? 'bg-slate-900/70 text-slate-200 border border-white/20'
                            : m.type === 'uploaded'
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-blue-600/90 text-white'
                        }`}
                      >
                        {m.type === 'system' ? 'Sistem' : m.type === 'uploaded' ? 'Yüklendi' : 'URL'}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={m.title}>
                          {m.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={m.url}>
                          {m.url.startsWith('data:') ? 'Özel Dosya (Base64)' : m.url}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleCopyMediaUrl(m.url)}
                          className="text-brand-accent hover:underline font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Kopyala</span>
                        </button>

                        {m.type !== 'system' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(m.id, m.title)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Fotoğrafı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                          Hero Arka Plan Fotoğrafı
                        </label>
                        <label className="cursor-pointer px-3 py-1 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Yeni Fotoğraf Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(file, (url) => {
                                  setSiteSettings({ ...siteSettings, heroImage: url });
                                });
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                        <select
                          value={siteSettings.heroImage || 'phuket_hero.webp'}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroImage: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                        >
                          {allImageOptions.map((img) => (
                            <option key={img} value={img}>
                              {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          placeholder="veya direkt görsel URL'si girin..."
                          value={siteSettings.heroImage || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, heroImage: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                        />
                      </div>

                      {siteSettings.heroImage && (
                        <div className="flex items-center gap-3 mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <img
                            src={getImageUrl(siteSettings.heroImage)}
                            alt="Hero Önizleme"
                            className="w-20 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                            }}
                          />
                          <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                            {siteSettings.heroImage}
                          </span>
                        </div>
                      )}
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

              {/* Çoklu Tur & Tarih Programı */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Rezerve Edilen Turlar & Tarihler ({(formData.tours || []).length} Tur)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aynı misafir için farklı günlerde gerçekleşecek birden fazla tur ekleyebilirsiniz.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const curTours = formData.tours || [];
                      const lastTour = curTours[curTours.length - 1];
                      let nextDate = new Date().toISOString().split('T')[0];
                      if (lastTour?.tourDate) {
                        const d = new Date(lastTour.tourDate);
                        d.setDate(d.getDate() + 1);
                        nextDate = d.toISOString().split('T')[0];
                      }
                      const nextTourItem = tours[curTours.length % tours.length] || tours[0];
                      const updated: BookingTourSchedule[] = [
                        ...curTours,
                        {
                          tourTitle: nextTourItem?.title || 'Phuket Turu',
                          tourDate: nextDate,
                          pickupTime: '07:30',
                          priceThb: nextTourItem?.priceThb || 3200,
                        },
                      ];
                      const adults = Number(formData.adultCount) || 1;
                      const calculatedTotal = updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                      setFormData({
                        ...formData,
                        tours: updated,
                        totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Başka Bir Tur & Tarih Ekle</span>
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {(formData.tours || []).map((tourSchedule, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-brand-primary text-white">
                          #{idx + 1} Tur Programı
                        </span>

                        {(formData.tours || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.tours || []).filter((_, i) => i !== idx);
                              const adults = Number(formData.adultCount) || 1;
                              const calculatedTotal = updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                              setFormData({
                                ...formData,
                                tours: updated,
                                totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                              });
                            }}
                            className="text-slate-400 hover:text-red-500 p-1 text-xs font-bold transition-colors"
                            title="Bu turu kaldır"
                          >
                            ✕ Turu Kaldır
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Tur Adı *
                          </label>
                          <select
                            value={tourSchedule.tourTitle}
                            onChange={(e) => {
                              const selectedTitle = e.target.value;
                              const matchedTour = tours.find((t) => t.title === selectedTitle);
                              const updated = (formData.tours || []).map((item, i) =>
                                i === idx
                                  ? {
                                      ...item,
                                      tourTitle: selectedTitle,
                                      priceThb: matchedTour?.priceThb || item.priceThb,
                                    }
                                  : item
                              );
                              const adults = Number(formData.adultCount) || 1;
                              const calculatedTotal = updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                              setFormData({
                                ...formData,
                                tours: updated,
                                totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-medium"
                          >
                            {tours.map((t) => (
                              <option key={t.id} value={t.title}>
                                {t.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Tur Tarihi *
                          </label>
                          <input
                            type="date"
                            required
                            value={tourSchedule.tourDate}
                            onChange={(e) => {
                              const updated = (formData.tours || []).map((item, i) =>
                                i === idx ? { ...item, tourDate: e.target.value } : item
                              );
                              setFormData({ ...formData, tours: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Alınış Saati
                          </label>
                          <input
                            type="text"
                            placeholder="07:30"
                            value={tourSchedule.pickupTime || ''}
                            onChange={(e) => {
                              const updated = (formData.tours || []).map((item, i) =>
                                i === idx ? { ...item, pickupTime: e.target.value } : item
                              );
                              setFormData({ ...formData, tours: updated });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                            Fiyat (Kişi Başı THB)
                          </label>
                          <input
                            type="number"
                            value={tourSchedule.priceThb || 0}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const updated = (formData.tours || []).map((item, i) =>
                                i === idx ? { ...item, priceThb: val } : item
                              );
                              const adults = Number(formData.adultCount) || 1;
                              const calculatedTotal = updated.reduce((acc, t) => acc + (t.priceThb || 0), 0) * adults;
                              setFormData({
                                ...formData,
                                tours: updated,
                                totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                              });
                            }}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Yetişkin Sayısı</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.adultCount || 1}
                    onChange={(e) => {
                      const count = Number(e.target.value) || 1;
                      const curTours = formData.tours || [];
                      const calculatedTotal = curTours.reduce((acc, t) => acc + (t.priceThb || 0), 0) * count;
                      setFormData({
                        ...formData,
                        adultCount: count,
                        totalPriceThb: calculatedTotal > 0 ? calculatedTotal : formData.totalPriceThb,
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Çocuk Sayısı</label>
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
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">Toplam Satış Tutarı (THB)</label>
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

              {/* Cost & Supplier & Profit Row */}
              <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    Tedarikçi Maliyeti & Kârlılık Hesabı
                  </span>
                  {Number(formData.totalPriceThb || 0) > 0 && (
                    <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      Net Kâr: {Math.max(0, Number(formData.totalPriceThb || 0) - Number(formData.costThb || 0)).toLocaleString()} THB
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Tedarikçi Firma / Tekne Sahibi
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Andaman Wave Master, Royal Phuket Marina vb."
                      value={formData.supplier || ''}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Toplam Alış / Maliyet Gideri (THB)
                    </label>
                    <input
                      type="number"
                      placeholder="Tekneye ödenecek toplam tutar"
                      value={formData.costThb || 0}
                      onChange={(e) => setFormData({ ...formData, costThb: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/30">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.nationalParkFeeIncluded ?? false}
                      onChange={(e) => setFormData({ ...formData, nationalParkFeeIncluded: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      Millî Park Giriş Harcı Fiyata DAHİLDİR (İşaretlenmezse WhatsApp ve kuponda misafire limanda nakit hazırlaması hatırlatılır)
                    </span>
                  </label>
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
      {/* MODAL 2: TOUR (DEEP & COMPREHENSIVE EDITOR) */}
      {/* ==================================================== */}
      {isTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  {editingTour ? `Turu Düzenle: ${editingTour.title}` : 'Yeni Tur Ekle'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fiyatlar, fotoğraflar, tur akışı, dahil olanlar ve tüm operasyonel ayrıntılar
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTourModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Sub-Tabs Bar */}
            <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto py-2.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setTourActiveTab('general')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'general'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Genel Bilgiler</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('photos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'photos'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Fotoğraflar & Galeri ({(tourFormData.gallery || []).length + 1})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('itinerary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'itinerary'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tur Akışı & Program ({(tourFormData.program || []).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('inclusions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'inclusions'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Dahil & Hariç</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('faqs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'faqs'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>SSS ({(tourFormData.faq || []).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'notes'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kısıtlamalar & Metin</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmitTour} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: GENEL BİLGİLER */}
              {tourActiveTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Tur Başlığı *
                    </label>
                    <input
                      type="text"
                      required
                      value={tourFormData.title || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, title: e.target.value })}
                      placeholder="Örn: Phi Phi, Maya Bay ve Bamboo Adası"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kategori *
                      </label>
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
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Tur Süresi
                      </label>
                      <input
                        type="text"
                        value={tourFormData.duration || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, duration: e.target.value })}
                        placeholder="Örn: Tam Gün (07:30 - 17:30)"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kişi Başı Satış Fiyatı (THB)
                      </label>
                      <input
                        type="number"
                        value={tourFormData.priceThb || 0}
                        onChange={(e) => setTourFormData({ ...tourFormData, priceThb: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">0 girilirse "Teklif Alın" görünür.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kısa Açıklama (Özet)
                      </label>
                      <textarea
                        rows={2}
                        value={tourFormData.excerpt || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, excerpt: e.target.value })}
                        placeholder="Tur kartında görünecek 1-2 cümlelik tanıtım..."
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Supplier & Cost in Tour Editor */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Tedarikçi Firma / Tekne Operatörü
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Andaman Wave Master, Sea Angel vb."
                        value={tourFormData.supplier || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, supplier: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kişi Başı Alış / Maliyet Tutarı (THB)
                      </label>
                      <input
                        type="number"
                        placeholder="Acente maliyet tutarı"
                        value={tourFormData.costThb || 0}
                        onChange={(e) => setTourFormData({ ...tourFormData, costThb: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rezervasyonlarda otomatik kâr hesaplamasında kullanılır.</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tourFormData.featured || false}
                        onChange={(e) => setTourFormData({ ...tourFormData, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Bu turu Ana Sayfada "Öne Çıkan Turlar" arasına ekle ⭐
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: FOTOĞRAFLAR & GALERİ */}
              {tourActiveTab === 'photos' && (
                <div className="space-y-6">
                  {/* Kapak Fotoğrafı */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                        Ana Kapak Fotoğrafı *
                      </label>
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Bilgisayardan Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                setTourFormData({ ...tourFormData, image: url });
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <select
                        value={tourFormData.image || 'phuket_hero.webp'}
                        onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                      >
                        {allImageOptions.map((img) => (
                          <option key={img} value={img}>
                            {img.startsWith('data:') ? 'Özel Yüklenen Dosya' : img}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="veya direkt görsel URL'si girin..."
                        value={tourFormData.image || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      />
                    </div>

                    {tourFormData.image && (
                      <div className="flex items-center gap-3 pt-2">
                        <img
                          src={getImageUrl(tourFormData.image)}
                          alt="Kapak Önizleme"
                          className="w-24 h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                          }}
                        />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Kapak Önizleme</span>
                          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate block max-w-sm">
                            {tourFormData.image}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Galeri Fotoğrafları */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Turdan Fotoğraflar (Galeri)
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tur sayfasında sergilenecek ek fotoğraflar ({ (tourFormData.gallery || []).length } adet)
                        </p>
                      </div>

                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Galeriye Fotoğraf Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                setTourFormData({
                                  ...tourFormData,
                                  gallery: [...(tourFormData.gallery || []), url],
                                });
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {/* Galeri Önizleme Grid */}
                    {(tourFormData.gallery || []).length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                        {(tourFormData.gallery || []).map((img, idx) => (
                          <div key={`${img}-${idx}`} className="relative group">
                            <img
                              src={getImageUrl(img)}
                              alt={`Galeri ${idx + 1}`}
                              className="w-full h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setTourFormData({
                                  ...tourFormData,
                                  gallery: (tourFormData.gallery || []).filter((_, i) => i !== idx),
                                })
                              }
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-red-600 transition-colors"
                              title="Fotoğrafı Galeriden Kaldır"
                            >
                              ✕
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-white text-[8px] font-bold">
                                #1
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-3 italic text-center">
                        Henüz galeri fotoğrafı eklenmemiş. Aşağıdan veya bilgisayarınızdan ekleyebilirsiniz.
                      </p>
                    )}

                    {/* Kütüphaneden Seçerek Galeriye Ekle */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      >
                        <option value="">+ Kütüphaneden Fotoğraf Seç ve Ekle...</option>
                        {allImageOptions.map((img) => (
                          <option key={img} value={img}>
                            {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TUR AKIŞI & PROGRAM */}
              {tourActiveTab === 'itinerary' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Tur Programı & Akış Adımları ({(tourFormData.program || []).length})
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Misafirlerin tur sayfasında gördüğü saat saat zaman çizelgesi.
                    </p>
                  </div>

                  {/* List of items */}
                  <div className="space-y-2">
                    {(tourFormData.program || []).map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-brand-primary/10 text-brand-primary dark:text-brand-accent font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{step}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setTourFormData({
                              ...tourFormData,
                              program: (tourFormData.program || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Adımı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add step */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={tempProgramItem}
                      onChange={(e) => setTempProgramItem(e.target.value)}
                      placeholder="Örn: 09:30 - Maya Bay kumsalında serbest fotoğraf molası"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tempProgramItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              program: [...(tourFormData.program || []), tempProgramItem.trim()],
                            });
                            setTempProgramItem('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempProgramItem.trim()) {
                          setTourFormData({
                            ...tourFormData,
                            program: [...(tourFormData.program || []), tempProgramItem.trim()],
                          });
                          setTempProgramItem('');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ekle</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: DAHİL & HARİÇ OLANLAR */}
              {tourActiveTab === 'inclusions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Dahil Olanlar */}
                  <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                        ✅ Dahil Olanlar ({(tourFormData.included || []).length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {(tourFormData.included || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-xs"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                included: (tourFormData.included || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-2">
                      <input
                        type="text"
                        value={tempIncludedItem}
                        onChange={(e) => setTempIncludedItem(e.target.value)}
                        placeholder="Örn: Açık büfe öğle yemeği"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempIncludedItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              included: [...(tourFormData.included || []), tempIncludedItem.trim()],
                            });
                            setTempIncludedItem('');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                      >
                        + Ekle
                      </button>
                    </div>
                  </div>

                  {/* Hariç Olanlar */}
                  <div className="space-y-3 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-red-800 dark:text-red-300">
                        ❌ Hariç Olanlar ({(tourFormData.excluded || []).length})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {(tourFormData.excluded || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 text-xs"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{item}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                excluded: (tourFormData.excluded || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-2">
                      <input
                        type="text"
                        value={tempExcludedItem}
                        onChange={(e) => setTempExcludedItem(e.target.value)}
                        placeholder="Örn: Milli Park Giriş Harcı"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempExcludedItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              excluded: [...(tourFormData.excluded || []), tempExcludedItem.trim()],
                            });
                            setTempExcludedItem('');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0"
                      >
                        + Ekle
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TURA ÖZEL SSS */}
              {tourActiveTab === 'faqs' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Tura Özel Sıkça Sorulan Sorular ({(tourFormData.faq || []).length})
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Misafirlerin bu tur sayfasına özel göreceği sorular ve cevapları.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(tourFormData.faq || []).map((faqItem, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            S: {faqItem.q}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                faq: (tourFormData.faq || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          C: {faqItem.a}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add FAQ */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold uppercase text-brand-primary dark:text-brand-accent block">
                      + Yeni Soru & Cevap Ekle
                    </span>
                    <input
                      type="text"
                      placeholder="Soru: Örn: Turda vejetaryen yemek var mı?"
                      value={tempFaqQ}
                      onChange={(e) => setTempFaqQ(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      placeholder="Cevap: Örn: Evet, rezervasyon sırasında belirtirseniz vejetaryen menü hazırlanmaktadır."
                      value={tempFaqA}
                      onChange={(e) => setTempFaqA(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempFaqQ.trim() && tempFaqA.trim()) {
                          setTourFormData({
                            ...tourFormData,
                            faq: [...(tourFormData.faq || []), { q: tempFaqQ.trim(), a: tempFaqA.trim() }],
                          });
                          setTempFaqQ('');
                          setTempFaqA('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold"
                    >
                      Soruyu Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: KISITLAMALAR & AÇIKLAMA METNİ */}
              {tourActiveTab === 'notes' && (
                <div className="space-y-5">
                  {/* Restrictions */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-3">
                    <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 block">
                      ⚠️ Katılım Kısıtlamaları & Sağlık Uyarıları ({(tourFormData.restrictions || []).length})
                    </span>

                    <div className="space-y-1.5">
                      {(tourFormData.restrictions || []).map((res, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 text-xs"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{res}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                restrictions: (tourFormData.restrictions || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={tempRestrictionItem}
                        onChange={(e) => setTempRestrictionItem(e.target.value)}
                        placeholder="Örn: Hamile misafirler ve 1 yaş altı bebekler için uygun değildir"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempRestrictionItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              restrictions: [...(tourFormData.restrictions || []), tempRestrictionItem.trim()],
                            });
                            setTempRestrictionItem('');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0"
                      >
                        + Ekle
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Tur Detay Yazısı (Açıklama / Markdown)
                    </label>
                    <textarea
                      rows={6}
                      value={tourFormData.body || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, body: e.target.value })}
                      placeholder="Tur hakkında ayrıntılı açıklama yazısı..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {editingTour ? 'Değişiklikler anında yerel veritabanına kaydedilir.' : 'Yeni tur hemen listeye eklenecektir.'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTourModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingTour ? 'Değişiklikleri Kaydet' : 'Turu Oluştur'}</span>
                  </button>
                </div>
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
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Kapak Görseli
                  </label>
                  <label className="cursor-pointer px-3 py-1 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Görsel Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url) => {
                            setBlogFormData({ ...blogFormData, cover_image: url });
                          });
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={blogFormData.cover_image || 'pileh.webp'}
                    onChange={(e) => setBlogFormData({ ...blogFormData, cover_image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  >
                    {allImageOptions.map((img) => (
                      <option key={img} value={img}>
                        {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="veya direkt görsel URL'si girin..."
                    value={blogFormData.cover_image || ''}
                    onChange={(e) => setBlogFormData({ ...blogFormData, cover_image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                {blogFormData.cover_image && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <img
                      src={getImageUrl(blogFormData.cover_image)}
                      alt="Blog Kapak"
                      className="w-16 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/pileh.webp';
                      }}
                    />
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs">
                      {blogFormData.cover_image}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blogFormData.featured || false}
                    onChange={(e) => setBlogFormData({ ...blogFormData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-brand-accent"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Öne çıkarılan yazı yap ⭐
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

              {/* Hizmet Görseli */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Hizmet Görseli
                  </label>
                  <label className="cursor-pointer px-3 py-1 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Görsel Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url) => {
                            setServiceFormData({ ...serviceFormData, media: url });
                          });
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={serviceFormData.media || 'longtail.webp'}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, media: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  >
                    {allImageOptions.map((img) => (
                      <option key={img} value={img}>
                        {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="veya direkt görsel URL'si girin..."
                    value={serviceFormData.media || ''}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, media: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                {serviceFormData.media && (
                  <div className="flex items-center gap-2.5 pt-1">
                    <img
                      src={getImageUrl(serviceFormData.media)}
                      alt="Hizmet Görseli"
                      className="w-16 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/longtail.webp';
                      }}
                    />
                    <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs">
                      {serviceFormData.media}
                    </span>
                  </div>
                )}
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

      {/* ==================================================== */}
      {/* MODAL 7: ADD MEDIA (FOTOĞRAF YÜKLE / URL EKLE) */}
      {/* ==================================================== */}
      {isAddMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                <Image className="w-5 h-5 text-brand-accent" />
                <span>Kütüphaneye Fotoğraf Ekle</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddMediaModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMediaUploadMode('file')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mediaUploadMode === 'file'
                    ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Bilgisayardan Dosya Seç</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaUploadMode('url')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mediaUploadMode === 'url'
                    ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Web URL'si Gir</span>
              </button>
            </div>

            <form onSubmit={handleAddMediaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Fotoğraf Başlığı / Açıklaması
                </label>
                <input
                  type="text"
                  placeholder="Örn: James Bond Adası Gün Batımı"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              {mediaUploadMode === 'file' ? (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Görsel Dosyası (JPG, PNG, WEBP)
                  </label>
                  <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-accent rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Bilgisayarınızdan bir görsel seçin
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Doğrudan panele ve kütüphaneye kaydedilir
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (!newMediaTitle) {
                            setNewMediaTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setNewMediaUrl((ev.target?.result as string) || '');
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Web Görsel URL'si (HTTPS Linki)
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/... veya CDN linki"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Canlı Önizleme */}
              {newMediaUrl && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Canlı Önizleme</span>
                  <div className="h-40 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <img
                      src={getImageUrl(newMediaUrl)}
                      alt="Önizleme"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddMediaModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={!newMediaUrl}
                  className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-md shadow-brand-primary/20 disabled:opacity-50"
                >
                  Kütüphaneye Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 8: LIGHTBOX (BÜYÜK BOYUT GÖRSEL İNCELEME) */}
      {/* ==================================================== */}
      {selectedLightboxMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-surface-2 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  {selectedLightboxMedia.title}
                </h3>
                <span className="text-[11px] font-mono text-slate-400 truncate block max-w-md">
                  {selectedLightboxMedia.url}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLightboxMedia(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 bg-black/90 p-4 flex items-center justify-center overflow-hidden min-h-[350px]">
              <img
                src={getImageUrl(selectedLightboxMedia.url)}
                alt={selectedLightboxMedia.title}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-semibold">
                Tür: {selectedLightboxMedia.type === 'system' ? 'Sistem Görseli' : selectedLightboxMedia.type === 'uploaded' ? 'Yüklenen Dosya' : 'Web URL'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyMediaUrl(selectedLightboxMedia.url)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Bağlantıyı Kopyala</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAssignMediaModal(selectedLightboxMedia);
                    setSelectedLightboxMedia(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Bir Tura Kapak Yap</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 9: ASSIGN PHOTO AS TOUR COVER */}
      {/* ==================================================== */}
      {assignMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="font-bold font-serif text-lg text-slate-900 dark:text-white mb-2">
              Fotoğrafı Tur Kapağı Yap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              "{assignMediaModal.title}" görselini hangi turun kapak fotoğrafı yapmak istersiniz?
            </p>

            <div className="mb-4">
              <img
                src={getImageUrl(assignMediaModal.url)}
                alt="Seçilen Görsel"
                className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2 mb-6">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Hedef Turu Seçin
              </label>
              <select
                id="assignTourSelect"
                defaultValue={tours[0]?.id || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAssignMediaModal(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = (document.getElementById('assignTourSelect') as HTMLSelectElement)?.value;
                  if (sel) handleAssignMediaAsTourCover(assignMediaModal.url, sel);
                }}
                className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md"
              >
                Kapak Olarak Ata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 10: OFFICIAL TOUR VOUCHER / DIGITAL TICKET (QR BOARDING PASS) */}
      {/* ==================================================== */}
      {voucherBooking && (
        <BoardingPassModal
          booking={voucherBooking}
          tourIndex={0}
          managerPhone={siteSettings.whatsappNumber}
          onClose={() => setVoucherBooking(null)}
        />
      )}

      {/* ==================================================== */}
      {/* TOAST FEEDBACK NOTIFICATION */}
      {/* ==================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900/95 text-white text-xs sm:text-sm font-bold shadow-2xl border border-slate-700/80 flex items-center gap-2.5 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-brand-accent animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
