import React, { useState, useEffect, useMemo, useTransition, useCallback } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  PlusCircle,
  Calendar,
  Search,
  Share2,
  RefreshCw,
  LogOut,
  ChevronRight,
  Check,
  Building,
  Compass,
  Wifi,
  WifiOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X,
  Camera,
  Ticket,
  Bus,
  CreditCard,
} from 'lucide-react';
import { isSupabaseConfigured, subscribeBookingsSignal } from '../../lib/supabase';
import { generateTicketCode } from '../../lib/ticketCodes';
import { initialBookings, type Booking, type TourItem, type PassengerItem, detectHotelZone } from '../../data/adminInitialData';
import { generateMultiStopMapUrl, detectDeparturePier, getSingleHotelMapUrl } from '../../lib/maps';
import QrScannerModal from './QrScannerModal';
import NewBookingTab from './NewBookingTab';
import BoardingPassModal from '../shared/BoardingPassModal';
import WhatsAppTemplatesModal from '../shared/WhatsAppTemplatesModal';
import MarinePoliceManifestModal from '../shared/MarinePoliceManifestModal';
import { fmtMoney } from '../../lib/moneyFormat';

const CREW_NAME_STORAGE_KEY = 'phuket_field_crew_name';
const LOCAL_BOOKINGS_KEY = 'phuket_bookings_cache_v1';

// Phuket (UTC+7) tarihini YYYY-MM-DD olarak alma
function getPhuketToday(): string {
  try {
    const now = new Date();
    const phuketStr = now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
    const phuketDate = new Date(phuketStr);
    const y = phuketDate.getFullYear();
    const m = String(phuketDate.getMonth() + 1).padStart(2, '0');
    const d = String(phuketDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function formatDateDisplay(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
  } catch {
    return dateStr;
  }
}

interface FieldScheduleItem {
  key: string;
  bookingId: string;
  customerName: string;
  phone: string;
  hotel: string;
  roomNumber?: string;
  tourTitle: string;
  tourId: string;
  tourDate: string;
  pickupTime: string;
  tourIndex: number;
  adultCount: number;
  childCount: number;
  totalPriceThb: number;
  paidAmountThb: number;
  remainingAmountThb: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded';
  nationalParkFeeIncluded: boolean;
  specialNotes?: string;
  pickupStatus: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show';
  pickedUpAt?: string;
  assignedVehicle?: string;
  assignedDriver?: string;
  hotelZone?: string;
  fullBooking: Booking;
}

interface Props {
  initialTours?: TourItem[];
  managerPhone?: string;
  viewerRole?: 'owner' | 'manager' | 'guide' | 'driver' | null;
}

export default function FieldApp({
  initialTours = [],
  managerPhone = '66828950665',
  viewerRole = null,
}: Props) {
  const isDriverOnly = viewerRole === 'driver';
  const canAccessAdmin = viewerRole === 'owner' || viewerRole === 'manager' || viewerRole === null;

  // 1. Kimlik — erişim yetkisi sunucuda doğrulanır (src/middleware.ts).
  // Buradaki durum yalnızca "vardiya hangi isimle açıldı" bilgisini tutar;
  // manifesto ve WhatsApp raporlarında görevli adı olarak kullanılır.
  const [isShiftStarted, setIsShiftStarted] = useState<boolean>(false);
  const [identityError, setIdentityError] = useState('');
  const [crewName, setCrewName] = useState<string>(isDriverOnly ? 'Şoför Ekibi' : 'Rehber Ekibi');

  // 2. Navigasyon & Filtreler
  const [activeTab, setActiveTab] = useState<'schedule' | 'new_booking' | 'cash' | 'settings'>('schedule');
  const [selectedDate, setSelectedDate] = useState<string>(getPhuketToday());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  // QR Tarayıcı & Biniş Kartı Modalları
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [boardingPassModalItem, setBoardingPassModalItem] = useState<{ booking: Booking; tourIndex: number } | null>(null);

  // WhatsApp Otomasyon Şablonları & Polis Manifestosu Modalları
  const [whatsAppModalItem, setWhatsAppModalItem] = useState<Booking | null>(null);
  const [isPoliceManifestOpen, setIsPoliceManifestOpen] = useState<boolean>(false);

  // 3. Veri & Çevrimiçi Durum
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, startTransition] = useTransition();

  // 4. Toast & Bildirimler
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 5. Tahsilat Modalı
  const [cashModalItem, setCashModalItem] = useState<FieldScheduleItem | null>(null);
  const [collectedAmountInput, setCollectedAmountInput] = useState<string>('');

  // Şifre Değiştirme State (Üyelik Oturumu)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangeOwnPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(`⚠️ ${data.error || 'Şifre güncellenemedi.'}`);
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      showToast('✅ Şifreniz güncellendi.');
    } catch {
      showToast('⚠️ Ağ hatası — şifre güncellenemedi.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 6. Hızlı Rezervasyon Formu State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+90 ');
  const [newCustHotel, setNewCustHotel] = useState('');
  const [newCustZone, setNewCustZone] = useState('Patong & Kalim');
  const [newCustRoom, setNewCustRoom] = useState('');
  const [newTourId, setNewTourId] = useState(initialTours[0]?.id || 'phi-phi-maya-ve-bamboo-adasi');
  const [newTourDate, setNewTourDate] = useState(getPhuketToday());
  const [newPickupTime, setNewPickupTime] = useState('07:30');
  const [newAdultCount, setNewAdultCount] = useState<number>(2);
  const [newChildCount, setNewChildCount] = useState<number>(0);
  const [newPriceThb, setNewPriceThb] = useState<number>(0);
  const [newDepositThb, setNewDepositThb] = useState<number>(0);
  const [newNatPark, setNewNatPark] = useState<boolean>(false);
  const [newNotes, setNewNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Başlangıç: localStorage kontrolü + üyelik oturumundan görevli adı
  useEffect(() => {
    let hasSavedCrew = false;
    try {
      const savedCrew = localStorage.getItem(CREW_NAME_STORAGE_KEY);
      if (savedCrew) {
        setCrewName(savedCrew);
        hasSavedCrew = true;
      }

      const cached = localStorage.getItem(LOCAL_BOOKINGS_KEY);
      if (cached) {
        setBookings(JSON.parse(cached));
      }
    } catch {
      // ignore
    }

    if (viewerRole && !hasSavedCrew) {
      void fetch('/api/auth/session')
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { user?: { fullName?: string } } | null) => {
          if (data?.user?.fullName) {
            setCrewName(data.user.fullName);
          }
        })
        .catch(() => {});
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Bulut verisi: tablo erişimi /api/bookings üzerinden (oturum cookie'si
   * ile — /ekip oturumu). Canlılık için sunucunun "bookings değişti"
   * Broadcast sinyali dinlenir; sinyal veri taşımaz, veri her seferinde
   * API üzerinden yeniden çekilir.
   */
  const fetchBookingsFromServer = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) {
        setIsCloudConnected(false);
        return;
      }
      const payload = (await res.json()) as { bookings?: Booking[] };
      if (Array.isArray(payload.bookings) && payload.bookings.length > 0) {
        setBookings(payload.bookings);
        setIsCloudConnected(true);
        try {
          localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(payload.bookings));
        } catch {
          // ignore
        }
      } else {
        setIsCloudConnected(true);
      }
    } catch {
      // Çevrimdışı / ağ hatası: yerel cache ile devam (saha senaryosu).
      setIsCloudConnected(false);
    }
  }, []);

  // Supabase Veritabanı ve Realtime Senkronizasyonu
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.log('Saha modu: Supabase bağlı değil, yerel veriyle çalışılıyor.');
      return;
    }

    // İlk çekme
    void fetchBookingsFromServer();

    // Canlı senkronizasyon: ofisteki değişiklikler sinyalle bildirilir,
    // veri API üzerinden yeniden çekilir (RLS anon'a kapalı olduğu için
    // postgres_changes kullanılmaz).
    const unsubscribe = subscribeBookingsSignal(() => {
      void fetchBookingsFromServer();
    });
    return unsubscribe;
  }, [isSupabaseConfigured, fetchBookingsFromServer]);

  // Yeni tur seçilince varsayılan fiyatı hesapla
  useEffect(() => {
    const tour = initialTours.find((t) => t.id === newTourId);
    if (tour) {
      const pricePerPerson = tour.priceThb || 2500;
      setNewPriceThb(pricePerPerson * newAdultCount + (pricePerPerson * 0.7) * newChildCount);
    }
  }, [newTourId, newAdultCount, newChildCount, initialTours]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Vardiya başlatma — erişim yetkisi sunucuda doğrulandığı için burada
  // şifre sorulmaz; yalnızca manifestoda görünecek görevli adı alınır.
  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    const name = crewName.trim();
    if (name.length < 2) {
      setIdentityError('Lütfen manifestoda görünecek adınızı yazın (en az 2 karakter).');
      return;
    }
    setIdentityError('');
    try {
      localStorage.setItem(CREW_NAME_STORAGE_KEY, name);
    } catch {
      // ignore
    }
    setIsShiftStarted(true);
    showToast(`🇹🇭 Vardiya açıldı — ${name}`);
  };

  // Çıkış: sunucudaki imzalı oturum çerezini siler, giriş ekranına döner.
  const handleLogout = async () => {
    try {
      await fetch('/api/ops-login', { method: 'DELETE' });
    } catch {
      // Ağ hatası olsa da kullanıcıyı giriş ekranına gönder
    }
    window.location.href = '/ops-login?next=/ekip';
  };

  // Manuel Yenileme
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (isSupabaseConfigured) {
      await fetchBookingsFromServer();
      if (isCloudConnected) {
        showToast('✅ Veriler bulut ile senkronize edildi');
      } else {
        showToast('⚠️ İnternet bağlantısı zayıf, yerel veriler korunuyor');
      }
    } else {
      showToast('✅ Yerel önbellek güncel');
    }
    setIsRefreshing(false);
  };

  // Tarih Filtresi Butonları (Dün, Bugün, Yarın)
  const todayStr = useMemo(() => getPhuketToday(), []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const phuketStr = d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
    const pd = new Date(phuketStr);
    return `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
  }, []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const phuketStr = d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
    const pd = new Date(phuketStr);
    return `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, '0')}-${String(pd.getDate()).padStart(2, '0')}`;
  }, []);

  // 📋 GÜNLÜK MANİFESTO ÇIKARICI (Çoklu Tur ve Tekil Tur Desteği)
  const scheduleItems = useMemo<FieldScheduleItem[]>(() => {
    const items: FieldScheduleItem[] = [];

    bookings.forEach((b) => {
      // 1. Çoklu tur var mı?
      if (b.tours && b.tours.length > 0) {
        b.tours.forEach((t, idx) => {
          if (t.tourDate === selectedDate) {
            items.push({
              key: `${b.id}-tour-${idx}`,
              bookingId: b.id,
              customerName: b.customerName,
              phone: b.phone,
              hotel: b.hotel,
              roomNumber: b.roomNumber,
              tourTitle: t.tourTitle || b.tourTitle,
              tourId: t.tourId || b.tourId || '',
              tourDate: t.tourDate,
              pickupTime: t.pickupTime || b.pickupTime || '07:30',
              tourIndex: idx,
              adultCount: b.adultCount,
              childCount: b.childCount,
              totalPriceThb: b.totalPriceThb,
              paidAmountThb: b.paidAmountThb,
              remainingAmountThb: b.remainingAmountThb,
              paymentStatus: b.paymentStatus,
              nationalParkFeeIncluded: t.nationalParkFeeIncluded ?? (b.nationalParkFeeIncluded ?? false),
              specialNotes: b.specialNotes,
              pickupStatus: t.pickupStatus || b.pickupStatus || 'pending',
              pickedUpAt: t.pickedUpAt || b.pickedUpAt,
              assignedVehicle: t.assignedVehicle || b.assignedVehicle || 'Atanmadı',
              assignedDriver: t.assignedDriver || b.assignedDriver,
              hotelZone: b.hotelZone || t.hotelZone || detectHotelZone(b.hotel),
              fullBooking: b,
            });
          }
        });
      } else {
        // 2. Klasik tekil tur
        if (b.tourDate === selectedDate) {
          items.push({
            key: `${b.id}-single`,
            bookingId: b.id,
            customerName: b.customerName,
            phone: b.phone,
            hotel: b.hotel,
            roomNumber: b.roomNumber,
            tourTitle: b.tourTitle,
            tourId: b.tourId || '',
            tourDate: b.tourDate,
            pickupTime: b.pickupTime || '07:30',
            tourIndex: -1,
            adultCount: b.adultCount,
            childCount: b.childCount,
            totalPriceThb: b.totalPriceThb,
            paidAmountThb: b.paidAmountThb,
            remainingAmountThb: b.remainingAmountThb,
            paymentStatus: b.paymentStatus,
            nationalParkFeeIncluded: b.nationalParkFeeIncluded ?? false,
            specialNotes: b.specialNotes,
            pickupStatus: b.pickupStatus || 'pending',
            pickedUpAt: b.pickedUpAt,
            assignedVehicle: b.assignedVehicle || 'Atanmadı',
            assignedDriver: b.assignedDriver,
            hotelZone: b.hotelZone || detectHotelZone(b.hotel),
            fullBooking: b,
          });
        }
      }
    });

    // Saate göre kronolojik sıralama (07:00 -> 07:30 -> 08:00...)
    return items.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
  }, [bookings, selectedDate]);

  // Filtrelenmiş Liste
  const filteredSchedule = useMemo(() => {
    return scheduleItems.filter((item) => {
      // Arama filtresi
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.customerName.toLowerCase().includes(q) ||
          item.hotel.toLowerCase().includes(q) ||
          item.tourTitle.toLowerCase().includes(q) ||
          item.phone.includes(q) ||
          (item.assignedVehicle && item.assignedVehicle.toLowerCase().includes(q)) ||
          (item.hotelZone && item.hotelZone.toLowerCase().includes(q)) ||
          (item.roomNumber && item.roomNumber.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Araç / Hat filtresi
      if (vehicleFilter !== 'all' && item.assignedVehicle !== vehicleFilter) {
        return false;
      }

      // Durum filtresi
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && item.pickupStatus !== 'pending') return false;
        if (statusFilter === 'picked_up' && item.pickupStatus !== 'picked_up') return false;
        if (statusFilter === 'completed' && item.pickupStatus !== 'completed') return false;
        if (statusFilter === 'no_show' && item.pickupStatus !== 'no_show') return false;
        if (statusFilter === 'unpaid' && item.remainingAmountThb <= 0) return false;
      }

      return true;
    });
  }, [scheduleItems, searchQuery, statusFilter, vehicleFilter]);

  // İstatistik Sayaçları
  const stats = useMemo(() => {
    let totalPax = 0;
    let pickedUpCount = 0;
    let pendingCount = 0;
    let totalCashToCollect = 0;

    scheduleItems.forEach((i) => {
      totalPax += i.adultCount + i.childCount;
      if (i.pickupStatus === 'picked_up' || i.pickupStatus === 'completed' || i.pickupStatus === 'on_tour') {
        pickedUpCount++;
      } else if (i.pickupStatus === 'pending') {
        pendingCount++;
      }
      totalCashToCollect += i.remainingAmountThb;
    });

    return {
      totalTransfers: scheduleItems.length,
      totalPax,
      pickedUpCount,
      pendingCount,
      totalCashToCollect,
    };
  }, [scheduleItems]);

  // Rezervasyon güncelleme (Optimistic + Supabase Sync)
  const updateBookingRecord = async (updatedBooking: Booking) => {
    // 1. Optimistic yerel güncelleme
    startTransition(() => {
      setBookings((prev) => {
        const next = prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b));
        try {
          localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    });

    // 2. Bulut yazımı /api/bookings üzerinden (oturum cookie'si ile).
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBooking),
      });
      if (!res.ok) console.warn('Bulut güncelleme hatası:', res.status);
    } catch (err) {
      console.warn('Bulut güncelleme hatası:', err);
    }
  };

  // Pasaport & Manifesto Bilgisi Güncelleme
  const handleUpdateBookingPassengers = (bookingId: string, passengers: PassengerItem[]) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return;
    const updated = { ...target, passengers };
    updateBookingRecord(updated);
    showToast('✅ Yolcu pasaport bilgileri kaydedildi.');
  };

  // Yoklama Durumunu Güncelle (Alındı, Bekleniyor, No-Show)
  const handleSetPickupStatus = async (
    item: FieldScheduleItem,
    newStatus: 'pending' | 'picked_up' | 'on_tour' | 'completed' | 'no_show'
  ) => {
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const full = { ...item.fullBooking };

    if (item.tourIndex >= 0 && full.tours && full.tours[item.tourIndex]) {
      const updatedTours = [...full.tours];
      updatedTours[item.tourIndex] = {
        ...updatedTours[item.tourIndex],
        pickupStatus: newStatus,
        pickedUpAt: newStatus === 'picked_up' ? nowTime : undefined,
      };
      full.tours = updatedTours;
    } else {
      full.pickupStatus = newStatus;
      full.pickedUpAt = newStatus === 'picked_up' ? nowTime : undefined;
    }

    if (newStatus === 'completed') {
      full.status = 'completed';
    }

    await updateBookingRecord(full);

    if (newStatus === 'picked_up') {
      showToast(`🚐 ${item.customerName} otelden alındı (${nowTime})`);
    } else if (newStatus === 'no_show') {
      showToast(`⚠️ ${item.customerName} NO-SHOW işaretlendi`);
    } else {
      showToast(`Durum güncellendi: ${newStatus}`);
    }
  };

  // Mevcut rotadaki araçlar listesi
  const availableVehicles = useMemo(() => {
    const list = new Set<string>();
    scheduleItems.forEach((i) => {
      if (i.assignedVehicle && i.assignedVehicle !== 'Atanmadı') {
        list.add(i.assignedVehicle);
      }
    });
    return Array.from(list);
  }, [scheduleItems]);

  // QR Kod Kamera Okuma Başarısı
  const handleQrScanSuccess = (scannedBookingId: string, tourIndex: number) => {
    const cleanId = scannedBookingId.trim().toUpperCase();
    const found = bookings.find((b) => b.id.toUpperCase() === cleanId || b.id.toUpperCase().includes(cleanId));
    if (!found) {
      showToast(`⚠️ Rezervasyon bulunamadı: ${cleanId}`);
      return;
    }

    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const full = { ...found };

    if (full.tours && full.tours[tourIndex]) {
      const nextTours = [...full.tours];
      nextTours[tourIndex] = {
        ...nextTours[tourIndex],
        pickupStatus: 'picked_up',
        pickedUpAt: nowTime,
      };
      full.tours = nextTours;
    } else {
      full.pickupStatus = 'picked_up';
      full.pickedUpAt = nowTime;
    }

    updateBookingRecord(full);
    showToast(`🎉 QR Binişi Onaylandı: ${full.customerName} (${nowTime})`);

    // Eğer misafirin kalan ödemesi varsa, doğrudan tahsilat modalını aç
    if (full.remainingAmountThb > 0) {
      setTimeout(() => {
        const scheduleItem: FieldScheduleItem = {
          key: `${full.id}-qr`,
          bookingId: full.id,
          customerName: full.customerName,
          phone: full.phone,
          hotel: full.hotel,
          roomNumber: full.roomNumber,
          tourTitle: full.tourTitle,
          tourId: full.tourId || '',
          tourDate: full.tourDate,
          pickupTime: full.pickupTime || '07:30',
          tourIndex,
          adultCount: full.adultCount,
          childCount: full.childCount,
          totalPriceThb: full.totalPriceThb,
          paidAmountThb: full.paidAmountThb,
          remainingAmountThb: full.remainingAmountThb,
          paymentStatus: full.paymentStatus,
          nationalParkFeeIncluded: full.nationalParkFeeIncluded ?? false,
          specialNotes: full.specialNotes,
          pickupStatus: 'picked_up',
          pickedUpAt: nowTime,
          assignedVehicle: full.assignedVehicle,
          assignedDriver: full.assignedDriver,
          hotelZone: full.hotelZone || detectHotelZone(full.hotel),
          fullBooking: full,
        };
        setCashModalItem(scheduleItem);
        setCollectedAmountInput(String(full.remainingAmountThb));
      }, 700);
    }
  };

  // Nakit Tahsilatını Tamamla
  const handleConfirmCashCollection = async () => {
    if (!cashModalItem) return;
    const amount = Number(collectedAmountInput) || cashModalItem.remainingAmountThb;
    const full = { ...cashModalItem.fullBooking };

    const newPaid = full.paidAmountThb + amount;
    const newRemaining = Math.max(0, full.remainingAmountThb - amount);

    full.paidAmountThb = newPaid;
    full.remainingAmountThb = newRemaining;
    full.paymentStatus = newRemaining === 0 ? 'paid' : 'partial';

    await updateBookingRecord(full);
    showToast(`💰 ${fmtMoney(amount)} THB tahsilat kaydedildi!`);
    setCashModalItem(null);
    setCollectedAmountInput('');
  };

  // Sahada Hızlı Rezervasyon Kaydet
  const handleCreateQuickBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim() || !newCustHotel.trim()) {
      alert('Lütfen Misafir Adı, Telefon ve Otel alanlarını doldurunuz.');
      return;
    }

    setIsSubmittingBooking(true);
    const selectedTour = initialTours.find((t) => t.id === newTourId);
    const tourTitle = selectedTour?.title || 'Özel Phuket Turu';
    const remaining = Math.max(0, newPriceThb - newDepositThb);

    const newBooking: Booking = {
      // Date.now()'un son 5 hanesi zamanı bilen herkes tarafından hesaplanabilir
      // — id çarpışmasını önlemek ve tahmin edilemezliği sağlamak için
      // rastgele üretilir. (Kayıt id + ayrı bilet kodu ikisi de rastgele.)
      id: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      // Misafir bilet portalı kodu — rehber bunu misafire WhatsApp'tan gönderir.
      ticketCode: generateTicketCode(),
      customerName: newCustName.trim(),
      phone: newCustPhone.trim(),
      hotel: newCustHotel.trim(),
      hotelZone: newCustZone || detectHotelZone(newCustHotel.trim()),
      roomNumber: newCustRoom.trim() || undefined,
      tourId: newTourId,
      tourTitle,
      tourDate: newTourDate,
      pickupTime: newPickupTime,
      tours: [
        {
          tourId: newTourId,
          tourTitle,
          tourDate: newTourDate,
          pickupTime: newPickupTime,
          priceThb: newPriceThb,
          nationalParkFeeIncluded: newNatPark,
          pickupStatus: 'pending',
        },
      ],
      adultCount: newAdultCount,
      childCount: newChildCount,
      totalPriceThb: newPriceThb,
      paidAmountThb: newDepositThb,
      remainingAmountThb: remaining,
      nationalParkFeeIncluded: newNatPark,
      status: 'confirmed',
      paymentStatus: remaining === 0 ? 'paid' : newDepositThb > 0 ? 'partial' : 'unpaid',
      specialNotes: `[Saha Kaydı: ${crewName}] ${newNotes.trim()}`.trim(),
      createdAt: getPhuketToday(),
    };

    // Yerel ve Supabase Ekleme
    startTransition(() => {
      setBookings((prev) => {
        const next = [newBooking, ...prev];
        try {
          localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    });

    // Bulut yazımı /api/bookings üzerinden (oturum cookie'si ile).
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      });
      if (!res.ok) console.warn('Bulut ekleme hatası:', res.status);
    } catch (err) {
      console.warn('Bulut ekleme hatası:', err);
    }

    setIsSubmittingBooking(false);
    showToast(`🎉 ${newBooking.customerName} için rezervasyon açıldı!`);
    // Formu sıfırla
    setNewCustName('');
    setNewCustPhone('+90 ');
    setNewCustHotel('');
    setNewCustRoom('');
    setNewNotes('');
    setNewDepositThb(0);
    // Manifestoya dön
    setSelectedDate(newTourDate);
    setActiveTab('schedule');
  };

  // Gün Sonu WhatsApp Raporu
  const sendDayEndReportToManager = () => {
    const cleanPhone = managerPhone.replace(/[^0-9]/g, '');
    const totalCollectedToday = scheduleItems.reduce((acc, i) => acc + (i.fullBooking.paidAmountThb || 0), 0);

    const reportMsg =
      `📊 *PHUKET TATİLİ - GÜN SONU SAHA RAPORU*\n` +
      `📅 Tarih: *${formatDateDisplay(selectedDate)}*\n` +
      `👤 Görevli: *${crewName}*\n` +
      `--------------------------------\n` +
      `👥 Toplam Yolcu: *${stats.totalPax} Kişi* (${stats.pickedUpCount}/${stats.totalTransfers} Alındı)\n` +
      `💰 Toplam Kasa/Tahsilat: *${fmtMoney(totalCollectedToday)} THB*\n` +
      `⚠️ Kalan Tahsil Edilmemiş: *${fmtMoney(stats.totalCashToCollect)} THB*\n\n` +
      `*Yolcu Listesi & Durum:*\n` +
      scheduleItems
        .map(
          (item, idx) =>
            `${idx + 1}. *${item.customerName}* (${item.adultCount} Yetişkin) - ${item.pickupTime}\n` +
            `   🏨 ${item.hotel}\n` +
            `   Durum: ${item.pickupStatus === 'picked_up' ? '✅ Alındı' : item.pickupStatus === 'no_show' ? '❌ No-Show' : '⏳ Bekliyor'}\n` +
            `   Ödeme: ${item.remainingAmountThb === 0 ? 'Ödendi' : `Kalan: ${fmtMoney(item.remainingAmountThb)} THB`}`
        )
        .join('\n\n') +
      `\n\nOperasyon başarıyla tamamlanmıştır. 🇹🇭`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reportMsg)}`;
    window.open(url, '_blank');
  };

  // -------------------------------------------------------------------------------------------
  // VARDİYA BAŞLATMA EKRANI
  // Erişim yetkisi sunucuda doğrulandı (middleware). Burada yalnızca
  // manifestoda ve ofis raporlarında görünecek görevli adı alınır.
  // -------------------------------------------------------------------------------------------
  if (!isShiftStarted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Logo & Başlık */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 shadow-2xl shadow-amber-500/20 mb-4 border border-amber-300/30">
              <Compass className="w-10 h-10 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-white tracking-wide">
              Phuket Tatili
            </h1>
            <p className="text-amber-400 font-medium text-xs uppercase tracking-widest mt-1">
              Saha & Rehber Operasyon
            </p>
          </div>

          {/* Vardiya Formu */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Oturum Doğrulandı
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PWA Mobil
              </span>
            </div>

            <form onSubmit={handleStartShift} className="space-y-4">
              <div>
                <label htmlFor="crew-name" className="block text-xs text-slate-300 mb-1.5 font-medium">
                  Rehber / Şoför Adı
                </label>
                <input
                  id="crew-name"
                  type="text"
                  value={crewName}
                  onChange={(e) => {
                    setCrewName(e.target.value);
                    setIdentityError('');
                  }}
                  placeholder="Örn: Rehber Deniz"
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950/70 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder-slate-500"
                />
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Bu ad manifestoda ve ofise giden WhatsApp raporlarında görünür.
                </p>
              </div>

              {identityError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{identityError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Vardiyayı Başlat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors"
              >
                Oturumu Kapat (Çıkış Yap)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------------------------
  // SAHA UYGULAMASI ANA GÖRÜNÜMÜ
  // -------------------------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col max-w-md mx-auto shadow-2xl relative border-x border-slate-800/60 pb-24">
      {/* Toast Bildirimi */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-slate-900 border border-amber-400/40 text-amber-300 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs font-semibold leading-tight">{toastMessage}</p>
        </div>
      )}

      {/* ÜST BAR (Header) */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight">Phuket Operasyon</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                {crewName} · <span className="text-amber-400 font-medium">Saha Aktif</span>
              </p>
            </div>
          </div>

          {/* Durum & Yenile */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrScannerOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              title="QR Biniş Kartı Okut"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>QR Tara</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Yenile"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <div
              className={`p-1.5 rounded-lg border text-[10px] font-semibold flex items-center gap-1 ${
                !isOnline
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : isCloudConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
              title={!isOnline ? 'İnternet Yok (Çevrimdışı)' : isCloudConnected ? 'Supabase Bulut Bağlı' : 'Yerel Hafıza Modu'}
            >
              {!isOnline ? (
                <WifiOff className="w-3.5 h-3.5" />
              ) : isCloudConnected ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {!isOnline ? 'Çevrimdışı' : isCloudConnected ? 'Bulut' : 'Yerel'}
              </span>
            </div>
          </div>
        </div>

        {/* Tarih Seçici Çubuğu (Schedule Tab'ındayken) */}
        {activeTab === 'schedule' && (
          <div className="mt-3 pt-3 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setSelectedDate(yesterdayStr)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                  selectedDate === yesterdayStr
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                Dün
              </button>
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  selectedDate === todayStr
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-amber-400 border border-amber-500/30'
                }`}
              >
                📍 Bugün ({formatDateDisplay(todayStr).slice(0, 6)})
              </button>
              <button
                onClick={() => setSelectedDate(tomorrowStr)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                  selectedDate === tomorrowStr
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                Yarın
              </button>
              <div className="relative shrink-0">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --------------------------------------------------------------------------------- */}
      {/* TAB 1: MANİFESTO (GÜNLÜK SAHA OPERASYONU) */}
      {/* --------------------------------------------------------------------------------- */}
      {activeTab === 'schedule' && (
        <main className="flex-1 px-4 py-4 space-y-4">
          {/* Günün Durum Özeti (Sayaçlar) */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Toplam Misafir</span>
              <div className="text-xl font-bold text-white mt-0.5">{stats.totalPax} <span className="text-xs font-normal text-slate-400">kişi</span></div>
              <span className="text-[10px] text-slate-500">{stats.totalTransfers} transfer</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Alınan / Bekleyen</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.pickedUpCount} <span className="text-xs font-normal text-slate-400">/ {stats.pendingCount}</span></div>
              <span className="text-[10px] text-slate-500">otel karşılama</span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Tahsil Edilecek</span>
              <div className="text-sm font-bold text-amber-400 mt-1 truncate">
                {stats.totalCashToCollect > 0 ? `${fmtMoney(stats.totalCashToCollect)} ฿` : '0 ฿ (Tam)'}
              </div>
              <span className="text-[10px] text-slate-500">kalan bakiye</span>
            </div>
          </div>

          {/* Arama & Hızlı Filtre */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Misafir adı, otel veya oda no ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Durum Hapları */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Tümü ({scheduleItems.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-amber-400 border border-slate-800'
                }`}
              >
                Bekleyenler ({stats.pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('picked_up')}
                className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
                  statusFilter === 'picked_up'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-emerald-400 border border-slate-800'
                }`}
              >
                Alınanlar ({stats.pickedUpCount})
              </button>
              {stats.totalCashToCollect > 0 && (
                <button
                  onClick={() => setStatusFilter('unpaid')}
                  className={`px-3 py-1 rounded-full font-medium shrink-0 transition-all ${
                    statusFilter === 'unpaid'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'bg-slate-900 text-rose-400 border border-slate-800'
                  }`}
                >
                  Tahsilatlılar
                </button>
              )}
            </div>

            {/* Hat / Minibüs Filtresi */}
            {availableVehicles.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] pt-1 border-t border-slate-800/40">
                <span className="text-[10px] text-slate-500 uppercase font-semibold shrink-0 flex items-center gap-1">
                  <Bus className="w-3 h-3 text-sky-400" /> Hat:
                </span>
                <button
                  onClick={() => setVehicleFilter('all')}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium shrink-0 transition-all ${
                    vehicleFilter === 'all'
                      ? 'bg-sky-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  Tüm Hatlar
                </button>
                {availableVehicles.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVehicleFilter(v)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium shrink-0 transition-all ${
                      vehicleFilter === v
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-sky-400 border border-slate-800'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Manifest Başlığı & Saha Operasyon Aksiyonları */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 px-1 pt-1">
            <span className="font-semibold text-slate-300">
              {formatDateDisplay(selectedDate)} Manifestosu ({filteredSchedule.length} Kayıt)
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {filteredSchedule.length > 0 && (
                <a
                  href={generateMultiStopMapUrl(
                    filteredSchedule.map((i) => i.hotel),
                    detectDeparturePier(filteredSchedule[0]?.tourTitle)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                  title="Günün tüm otellerini ardışık Google Maps rotası olarak aç"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>🗺️ Çoklu Rota</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => setIsPoliceManifestOpen(true)}
                className="px-2.5 py-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                title="Tayland Deniz Polisi & Millî Park Yolcu Manifestosu"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>🛂 Polis Manifestosu</span>
              </button>
              <button
                type="button"
                onClick={sendDayEndReportToManager}
                className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1 active:scale-95 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Raporla</span>
              </button>
            </div>
          </div>

          {/* LİSTE / KARTLAR */}
          {filteredSchedule.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                {selectedDate === todayStr ? 'Bugün için planlanmış tur bulunamadı' : 'Bu tarihte tur bulunamadı'}
              </p>
              {!isDriverOnly && (
                <>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Yeni bir misafir eklemek için alttaki "+ Yeni Satış" butonunu kullanabilirsiniz.
                  </p>
                  <button
                    onClick={() => setActiveTab('new_booking')}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-md hover:bg-amber-400 transition-all"
                  >
                    + Yeni Rezervasyon Oluştur
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSchedule.map((item) => {
                const isPickedUp = item.pickupStatus === 'picked_up' || item.pickupStatus === 'completed';
                const isNoShow = item.pickupStatus === 'no_show';
                const hasBalance = item.remainingAmountThb > 0;

                return (
                  <div
                    key={item.key}
                    className={`rounded-3xl border transition-all overflow-hidden ${
                      isPickedUp
                        ? 'bg-slate-900/60 border-emerald-500/40 shadow-emerald-500/5'
                        : isNoShow
                        ? 'bg-rose-950/20 border-rose-500/40'
                        : 'bg-slate-900/90 border-slate-800 shadow-lg'
                    }`}
                  >
                    {/* Kart Üst Bilgisi: Saat + Otel + Durum Rozeti */}
                    <div className="p-4 pb-3 border-b border-slate-800/60">
                      <div className="flex items-start justify-between gap-2">
                        {/* Alınış Saati */}
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${
                              isPickedUp
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{item.pickupTime}</span>
                          </div>

                          {/* Tur Başlığı */}
                          <div className="text-xs font-medium text-slate-300 truncate max-w-[190px]">
                            {item.tourTitle}
                          </div>
                        </div>

                        {/* Durum Rozeti */}
                        <div>
                          {isPickedUp ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{item.pickedUpAt ? `Alındı (${item.pickedUpAt})` : 'Alındı'}</span>
                            </span>
                          ) : isNoShow ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              No-Show
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/20">
                              Bekleniyor
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Misafir Adı & Kişi Sayısı */}
                      <div className="mt-2.5 flex items-baseline justify-between">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {item.customerName}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.adultCount} Yetişkin{item.childCount > 0 ? `, ${item.childCount} Ç` : ''}
                        </span>
                      </div>

                      {/* Otel & Oda No */}
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-300/90 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{item.hotel}</span>
                        {item.roomNumber && (
                          <span className="shrink-0 text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-md text-[10px]">
                            Oda: {item.roomNumber}
                          </span>
                        )}
                      </div>

                      {/* Hat / Minibüs & Bölge */}
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-sky-400 font-medium">
                        <Bus className="w-3 h-3 text-sky-400 shrink-0" />
                        <span className="font-semibold">{item.assignedVehicle !== 'Atanmadı' ? item.assignedVehicle : 'Hat Atanmadı'}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{item.hotelZone}</span>
                      </div>
                    </div>

                    {/* Finansal Durum & Millî Park Hatırlatması */}
                    <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/40 flex items-center justify-between text-xs">
                      <div>
                        {hasBalance ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5" />
                              Kalan: {fmtMoney(item.remainingAmountThb)} THB
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ({item.paidAmountThb > 0 ? `${fmtMoney(item.paidAmountThb)} ฿ ödendi` : 'kapora yok'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Tamamı Ödendi ({fmtMoney(item.totalPriceThb)} THB)
                          </span>
                        )}
                      </div>

                      {/* Hızlı Tahsilat Butonu */}
                      {hasBalance && !isDriverOnly && (
                        <button
                          onClick={() => {
                            setCashModalItem(item);
                            setCollectedAmountInput(String(item.remainingAmountThb));
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[11px] active:scale-95 transition-all flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Tahsil Et</span>
                        </button>
                      )}
                    </div>

                    {/* Özel Not & Millî Park Uyarısı */}
                    {(item.specialNotes || !item.nationalParkFeeIncluded) && (
                      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/40 space-y-1 text-[11px]">
                        {!item.nationalParkFeeIncluded && (
                          <div className="text-amber-400 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>Millî Park Hariç (Kişi başı 400 THB nakit alınacak)</span>
                          </div>
                        )}
                        {item.specialNotes && (
                          <div className="text-slate-400 italic">
                            💬 Not: {item.specialNotes}
                          </div>
                        )}
                      </div>
                    )}

                    {/* BUTONLAR & SAHA AKSİYONLARI */}
                    <div className="p-3 bg-slate-950/80 flex items-center gap-2">
                      {/* Harita */}
                      <a
                        href={getSingleHotelMapUrl(item.hotel)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Google Maps'te Aç"
                        className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5 text-sky-400" />
                        <span>Harita</span>
                      </a>

                      {/* Telefon */}
                      <a
                        href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-semibold text-xs flex items-center justify-center active:scale-95 transition-all"
                        title="Telefonla Ara"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      </a>

                      {/* WhatsApp Şablonları */}
                      <button
                        type="button"
                        onClick={() => setWhatsAppModalItem(item.fullBooking)}
                        className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 font-semibold text-xs flex items-center justify-center gap-1 active:scale-95 transition-all"
                        title="WhatsApp Şablonları & Hazır Mesaj Motoru"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Şablonlar</span>
                      </button>

                      {/* Biniş Kartı & QR Voucher */}
                      <button
                        type="button"
                        onClick={() =>
                          setBoardingPassModalItem({
                            booking: item.fullBooking,
                            tourIndex: item.tourIndex >= 0 ? item.tourIndex : 0,
                          })
                        }
                        title="Biniş Kartı & QR Kod"
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 font-semibold text-xs flex items-center justify-center active:scale-95 transition-all"
                      >
                        <Ticket className="w-4 h-4" />
                      </button>

                      {/* Alındı Yoklama Butonu */}
                      {!isPickedUp ? (
                        <button
                          onClick={() => handleSetPickupStatus(item, 'picked_up')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Alındı</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSetPickupStatus(item, 'pending')}
                          title="Geri al"
                          className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs active:scale-95"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* TAB 2: HIZLI SATIŞ & YENİ REZERVASYON (Sahada Yeni Misafir) */}
      {/* --------------------------------------------------------------------------------- */}
        {activeTab === 'new_booking' && (
          <NewBookingTab
            newCustName={newCustName}
            setNewCustName={setNewCustName}
            newCustPhone={newCustPhone}
            setNewCustPhone={setNewCustPhone}
            newCustHotel={newCustHotel}
            setNewCustHotel={setNewCustHotel}
            newCustZone={newCustZone}
            setNewCustZone={setNewCustZone}
            newCustRoom={newCustRoom}
            setNewCustRoom={setNewCustRoom}
            newTourId={newTourId}
            setNewTourId={setNewTourId}
            newTourDate={newTourDate}
            setNewTourDate={setNewTourDate}
            newPickupTime={newPickupTime}
            setNewPickupTime={setNewPickupTime}
            newAdultCount={newAdultCount}
            setNewAdultCount={setNewAdultCount}
            newChildCount={newChildCount}
            setNewChildCount={setNewChildCount}
            newPriceThb={newPriceThb}
            setNewPriceThb={setNewPriceThb}
            newDepositThb={newDepositThb}
            setNewDepositThb={setNewDepositThb}
            newNatPark={newNatPark}
            setNewNatPark={setNewNatPark}
            newNotes={newNotes}
            setNewNotes={setNewNotes}
            isSubmittingBooking={isSubmittingBooking}
            onSubmit={handleCreateQuickBooking}
            tours={initialTours}
          />
        )}

      {/* --------------------------------------------------------------------------------- */}
      {/* TAB 3: KASA & TAHSİLAT RAPORU */}
      {/* --------------------------------------------------------------------------------- */}
      {activeTab === 'cash' && (
        <main className="flex-1 px-4 py-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-center">
            <span className="text-xs text-slate-400 uppercase font-semibold">Günün Kasa Durumu</span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">
              {fmtMoney(scheduleItems.reduce((acc, i) => acc + (i.paidAmountThb || 0), 0))} ฿
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {formatDateDisplay(selectedDate)} · Kayıtlı Tahsilat
            </p>

            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Tahsil Edilenler</span>
                <p className="text-sm font-bold text-emerald-400">
                  {scheduleItems.filter((i) => i.paidAmountThb > 0).length} Misafir
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Bekleyen Bakiye</span>
                <p className="text-sm font-bold text-rose-400">
                  {fmtMoney(stats.totalCashToCollect)} ฿
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Tahsilat Detayları</span>
              <button
                onClick={sendDayEndReportToManager}
                className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Ofise WhatsApp Raporu At</span>
              </button>
            </div>

            <div className="space-y-2">
              {scheduleItems.map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.customerName}</h4>
                    <p className="text-[11px] text-slate-400">{item.hotel}</p>
                    <span className="text-[10px] text-slate-500">{item.tourTitle}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      {fmtMoney(item.paidAmountThb)} ฿ Alındı
                    </div>
                    {item.remainingAmountThb > 0 ? (
                      <span className="text-[10px] font-bold text-rose-400">
                        Kalan: {fmtMoney(item.remainingAmountThb)} ฿
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500">Kalan Yok</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* TAB 4: AYARLAR & PROFİL */}
      {/* --------------------------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <main className="flex-1 px-4 py-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-lg">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{crewName}</h3>
                <p className="text-xs text-slate-400">Saha Operasyon Görevlisi</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Bulut Senkronizasyonu</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isCloudConnected ? 'Supabase Canlı' : 'Yerel Hafıza'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Toplam Kayıtlı Rezervasyon</span>
                <span className="font-bold text-white">{bookings.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Saat Dilimi</span>
                <span className="font-medium text-slate-300">Phuket (GMT+7)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">PWA Modu</span>
                <span className="font-medium text-amber-400">Tam Ekran Mobil Uygulama</span>
              </div>
            </div>
          </div>

          {viewerRole && (
            <form
              onSubmit={handleChangeOwnPassword}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3"
            >
              <h4 className="text-sm font-bold text-white">Şifre Değiştir</h4>
              <input
                type="password"
                required
                placeholder="Mevcut şifreniz"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <input
                type="password"
                required
                placeholder="Yeni şifre (en az 10 karakter, harf + rakam)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
              >
                {isChangingPassword ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
              </button>
            </form>
          )}

          {/* Hızlı Kısayollar */}
          <div className="space-y-2">
            {canAccessAdmin && (
              <a
                href="/admin"
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between hover:bg-slate-800 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Building className="w-4 h-4 text-amber-400" />
                  <span>Masaüstü Yönetici CRM Paneline Geç</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </a>
            )}

            <button
              onClick={handleLogout}
              className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-500/20 active:scale-98 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Oturumu Kapat (Çıkış Yap)</span>
            </button>
          </div>
        </main>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* TAHSİLAT MODALI */}
      {/* --------------------------------------------------------------------------------- */}
      {cashModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Nakit Tahsilat</h3>
              </div>
              <button
                onClick={() => setCashModalItem(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <p className="text-xs text-slate-400">Misafir</p>
                <p className="text-sm font-bold text-white">{cashModalItem.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Otel</p>
                <p className="text-xs font-medium text-slate-300">{cashModalItem.hotel}</p>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Tahsil Edilecek Tutar (THB)
                </label>
                <input
                  type="number"
                  value={collectedAmountInput}
                  onChange={(e) => setCollectedAmountInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-xl font-bold font-mono text-amber-400 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setCashModalItem(null)}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 font-semibold text-xs active:scale-95"
              >
                Vazgeç
              </button>
              <button
                onClick={handleConfirmCashCollection}
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Tahsil Edildi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------------------- */}
      {/* ALT GEZİNTİ ÇUBUĞU (Bottom Navigation Bar) */}
      {/* --------------------------------------------------------------------------------- */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 max-w-md mx-auto px-3 py-2">
        <div className={`grid ${isDriverOnly ? 'grid-cols-2' : 'grid-cols-4'} gap-1`}>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center py-1.5 rounded-2xl transition-all ${
              activeTab === 'schedule'
                ? 'text-amber-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Compass className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Manifesto</span>
          </button>

          {!isDriverOnly && (
            <button
              onClick={() => setActiveTab('new_booking')}
              className={`flex flex-col items-center py-1.5 rounded-2xl transition-all ${
                activeTab === 'new_booking'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <PlusCircle className="w-5 h-5 mb-1" />
              <span className="text-[10px]">+ Satış</span>
            </button>
          )}

          {!isDriverOnly && (
            <button
              onClick={() => setActiveTab('cash')}
              className={`flex flex-col items-center py-1.5 rounded-2xl transition-all ${
                activeTab === 'cash'
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <CreditCard className="w-5 h-5 mb-1" />
              <span className="text-[10px]">Kasa</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center py-1.5 rounded-2xl transition-all ${
              activeTab === 'settings'
                ? 'text-amber-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-1" />
            <span className="text-[10px]">Ekip</span>
          </button>
        </div>
      </nav>

      {/* QR Kod Tarayıcı Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanResult={handleQrScanSuccess}
      />

      {/* Biniş Kartı & QR Voucher Modal */}
      {boardingPassModalItem && (
        <BoardingPassModal
          booking={boardingPassModalItem.booking}
          tourIndex={boardingPassModalItem.tourIndex}
          managerPhone={managerPhone}
          onClose={() => setBoardingPassModalItem(null)}
        />
      )}

      {/* WhatsApp Otomasyon Şablonları & Hazır Mesaj Motoru */}
      {whatsAppModalItem && (
        <WhatsAppTemplatesModal
          booking={whatsAppModalItem}
          managerPhone={managerPhone}
          onClose={() => setWhatsAppModalItem(null)}
        />
      )}

      {/* Tayland Deniz Polisi & Millî Park Yolcu Manifestosu */}
      {isPoliceManifestOpen && (
        <MarinePoliceManifestModal
          date={selectedDate}
          bookings={bookings.filter(
            (b) =>
              b.tourDate === selectedDate ||
              b.tours?.some((t) => t.tourDate === selectedDate)
          )}
          onUpdatePassengers={handleUpdateBookingPassengers}
          onClose={() => setIsPoliceManifestOpen(false)}
        />
      )}
    </div>
  );
}
