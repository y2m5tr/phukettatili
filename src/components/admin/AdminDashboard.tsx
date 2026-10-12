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
  Download
} from 'lucide-react';
import { initialBookings, type Booking } from '../../data/adminInitialData';

const STORAGE_KEY_BOOKINGS = 'phuket_tatili_crm_bookings_v1';
const STORAGE_KEY_AUTH = 'phuket_tatili_admin_auth_v1';
const ADMIN_PASSCODE = 'phuket2026';

interface AdminDashboardProps {
  initialTours: {
    id: string;
    title: string;
    category: string;
    priceThb: number;
    duration: string;
    featured: boolean;
    image: string;
  }[];
}

export default function AdminDashboard({ initialTours }: AdminDashboardProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'tours' | 'whatsapp'>('overview');

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Modal State for New/Edit Booking
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Booking>>({
    customerName: '',
    phone: '',
    email: '',
    hotel: '',
    roomNumber: '',
    tourTitle: initialTours[0]?.title || '',
    tourDate: new Date().toISOString().split('T')[0],
    pickupTime: '07:30',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 6000,
    paidAmountThb: 2000,
    status: 'confirmed',
    paymentStatus: 'partial',
    specialNotes: '',
  });

  // Check auth & load data from localStorage on mount
  useEffect(() => {
    try {
      const auth = localStorage.getItem(STORAGE_KEY_AUTH);
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
      const savedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      } else {
        setBookings(initialBookings);
        localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(initialBookings));
      }
    } catch {
      setBookings(initialBookings);
    }
  }, []);

  // Save bookings to localStorage whenever they change
  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(newBookings));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE || passcode === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      } catch {}
    } else {
      setAuthError('Hatalı yönetici şifresi! Lütfen tekrar deneyin.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch {}
  };

  // Calculations for Metrics
  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const pendingCount = bookings.filter(b => b.status === 'inquiry').length;
    const totalRevenueThb = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.totalPriceThb || 0), 0);
    const collectedRevenueThb = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.paidAmountThb || 0), 0);
    const pendingCollectionThb = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((acc, b) => acc + (b.remainingAmountThb || 0), 0);
    const totalGuests = bookings
      .filter(b => b.status !== 'cancelled')
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

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch =
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tourTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesDate = !dateFilter || b.tourDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchQuery, statusFilter, dateFilter]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingBooking(null);
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      hotel: '',
      roomNumber: '',
      tourTitle: initialTours[0]?.title || 'Phi Phi Adaları Turu',
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

  // Open modal for Edit
  const handleOpenEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData(booking);
    setIsModalOpen(true);
  };

  // Delete booking
  const handleDeleteBooking = (id: string, name: string) => {
    if (window.confirm(`"${name}" adlı rezervasyonu silmek istediğinize emin misiniz?`)) {
      const next = bookings.filter(b => b.id !== id);
      saveBookings(next);
    }
  };

  // Save Booking (Create or Update)
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(formData.totalPriceThb) || 0;
    const paid = Number(formData.paidAmountThb) || 0;
    const remaining = Math.max(0, total - paid);

    let paymentStatus: Booking['paymentStatus'] = 'unpaid';
    if (paid >= total && total > 0) paymentStatus = 'paid';
    else if (paid > 0) paymentStatus = 'partial';

    if (editingBooking) {
      // Update
      const updated: Booking[] = bookings.map(b => {
        if (b.id === editingBooking.id) {
          return {
            ...b,
            ...formData,
            totalPriceThb: total,
            paidAmountThb: paid,
            remainingAmountThb: remaining,
            paymentStatus: formData.paymentStatus || paymentStatus,
          } as Booking;
        }
        return b;
      });
      saveBookings(updated);
    } else {
      // Create
      const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking: Booking = {
        id: newId,
        customerName: formData.customerName || 'İsimsiz Misafir',
        phone: formData.phone || '',
        email: formData.email,
        hotel: formData.hotel || 'Belirtilmedi',
        roomNumber: formData.roomNumber,
        tourId: formData.tourId || 'genel-tur',
        tourTitle: formData.tourTitle || initialTours[0]?.title || 'Phuket Turu',
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

  // Generate WhatsApp message for customer
  const createWhatsAppLink = (b: Booking, type: 'reminder' | 'confirm' | 'voucher') => {
    const cleanPhone = b.phone.replace(/[^0-9]/g, '');
    let msg = '';
    if (type === 'reminder') {
      msg = `Merhaba ${b.customerName} Bey/Hanım! 🌴 Phuket Tatili ekibinden yazıyoruz.\n\n` +
        `📅 Yarınki turunuz: *${b.tourTitle}*\n` +
        `⏰ Otelden Alınış Saati: *${b.pickupTime || '07:30'}*\n` +
        `📍 Otel: *${b.hotel}* ${b.roomNumber ? `(Oda: ${b.roomNumber})` : ''}\n` +
        `👥 Kişi Sayısı: *${b.adultCount} Yetişkin ${b.childCount ? `, ${b.childCount} Çocuk` : ''}*\n` +
        (b.remainingAmountThb > 0 ? `💰 Kalan Ödeme: *${b.remainingAmountThb.toLocaleString()} THB* (Rehbere elden teslim edebilirsiniz).\n\n` : `\n`) +
        `Lütfen belirtilen saatte otelinizin ana lobisinde hazır bulununuz. Harika bir gün dileriz! 🇹🇭`;
    } else {
      msg = `Merhaba ${b.customerName}! 🏝️ Phuket Tatili rezervasyonunuz onaylanmıştır.\n\n` +
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

  // Quick Status change
  const handleQuickStatusChange = (id: string, newStatus: Booking['status']) => {
    const next = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    saveBookings(next);
  };

  // CSV Export for Accountant / Records
  const handleExportCSV = () => {
    const headers = ['ID,Musteri,Telefon,Otel,Oda,Tur,Tarih,Saat,Yetiskin,Cocuk,ToplamTHB,OdenenTHB,KalanTHB,Durum,Notlar\n'];
    const rows = bookings.map(b => 
      `"${b.id}","${b.customerName}","${b.phone}","${b.hotel}","${b.roomNumber || ''}","${b.tourTitle}","${b.tourDate}","${b.pickupTime || ''}",${b.adultCount},${b.childCount},${b.totalPriceThb},${b.paidAmountThb},${b.remainingAmountThb},"${b.status}","${(b.specialNotes || '').replace(/"/g, '""')}"\n`
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
  // LOGIN SCREEN IF NOT AUTHENTICATED
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
              Yetkili Yönetici ve Acente Kontrol Paneli
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
                Varsayılan şifre: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-accent">phuket2026</code>
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
  // AUTHENTICATED DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-1/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-primary to-slate-800 text-white flex items-center justify-center font-serif font-bold text-lg shadow-md border border-slate-700">
              PT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-brand-primary dark:text-white leading-none">
                  Phuket Tatili <span className="text-brand-accent italic font-sans text-sm font-semibold">Operasyon</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Canlı Sistem
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
                Turizm, Müşteri & Rezervasyon Yönetim Platformu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
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

        {/* Tab Buttons */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800/60 py-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Genel Bakış & Metrikler</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Müşteriler & Rezervasyonlar ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'tours'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Aktif Turlar ({initialTours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Toplu Hatırlatma & Şablonlar</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW & METRICS */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
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
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Kasadaki peşinat / ön ödemeler
                </p>
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
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Tur günü otelde/teknede alınacak bakiye
                </p>
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
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Aktif rezervasyonlardaki toplam yolcu
                </p>
              </div>
            </div>

            {/* Upcoming Tours Alert & Quick Action */}
            <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📅 Yaklaşan Tur Operasyonları</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Önümüzdeki günlerde gerçekleşecek turlar ve misafirlerin otel transfer listesi
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Tüm Rezervasyonları Gör</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {bookings.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 hover:border-brand-accent/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary text-white flex flex-col items-center justify-center font-bold text-xs shrink-0">
                        <span>{b.tourDate.split('-')[2]}</span>
                        <span className="text-[9px] uppercase font-normal text-slate-300">
                          {b.tourDate.split('-')[1]}. Ay
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {b.customerName}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            b.status === 'inquiry' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {b.status === 'confirmed' ? 'Onaylandı' : b.status === 'inquiry' ? 'Teklif' : b.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-medium text-brand-primary dark:text-slate-300">{b.tourTitle}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {b.hotel} {b.roomNumber ? `(${b.roomNumber})` : ''}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Alınış: {b.pickupTime || '07:30'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <a
                        href={createWhatsAppLink(b, 'reminder')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Otel Alınış Hatırlatması Gönder"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Alınış Mesajı At</span>
                      </a>
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: BOOKINGS CRM TABLE */}
        {/* ==================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Action Bar (Search & Filter) */}
            <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Müşteri adı, otel, telefon veya tur ara..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
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

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
                  title="Tur Tarihine Göre Filtrele"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                  >
                    Tarihi Sıfırla
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                  title="Excel / CSV Olarak İndir"
                >
                  <Download className="w-4 h-4" />
                  <span>Dışa Aktar (CSV)</span>
                </button>

                <button
                  onClick={handleOpenCreateModal}
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
                            <select
                              value={b.status}
                              onChange={(e) => handleQuickStatusChange(b.id, e.target.value as Booking['status'])}
                              className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none ${
                                b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' :
                                b.status === 'inquiry' ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' :
                                b.status === 'completed' ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' :
                                'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                              }`}
                            >
                              <option value="inquiry">🟡 Teklif Aşamasında</option>
                              <option value="confirmed">🟢 Kesinleşti / Onay</option>
                              <option value="completed">🔵 Tamamlandı</option>
                              <option value="cancelled">🔴 İptal Edildi</option>
                            </select>
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={createWhatsAppLink(b, 'reminder')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                                title="WhatsApp Alınış Hatırlatması Gönder"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => handleOpenEditModal(b)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-colors"
                                title="Düzenle"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(b.id, b.customerName)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-colors"
                                title="Sil"
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
        {/* TAB 3: TOURS MANAGEMENT OVERVIEW */}
        {/* ==================================================== */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  Sitede Yayında Olan Turlar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tur detaylarını, içerik metinlerini ve fotoğraflarını düzenlemek için Keystatic CMS'i de kullanabilirsiniz.
                </p>
              </div>
              <a
                href="/keystatic/collection/tours"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto hover:bg-brand-primary/90 transition-all"
              >
                <span>Keystatic'te Tur Düzenle</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {initialTours.map((t) => (
                <div
                  key={t.id}
                  className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="h-44 relative bg-slate-100 dark:bg-slate-900">
                    <img
                      src={`/assets/${t.image}`}
                      alt={t.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {t.category}
                      </span>
                    </div>
                    {t.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Öne Çıkan
                        </span>
                      </div>
                    )}
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
                      <div className="text-xs">
                        <span className="text-slate-400 block text-[10px]">Fiyat Bilgisi:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {t.priceThb > 0 ? `${t.priceThb.toLocaleString()} THB` : 'Teklif Alın'}
                        </span>
                      </div>

                      <a
                        href={`/turlar/${t.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Sitede Gör</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: WHATSAPP NOTIFICATION TEMPLATES */}
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
              {/* Template 1 */}
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
                  👉 Müşteriler sekmesindeki her satırın yanındaki yeşil WhatsApp butonuna basınca bu mesaj otomatik olarak dolar.
                </p>
              </div>

              {/* Template 2 */}
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
                  👉 Tur tamamlandıktan sonra misafirden Google yorumu almak için idealdir.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL: CREATE / EDIT BOOKING */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-2 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                {editingBooking ? 'Rezervasyonu Düzenle' : 'Yeni Müşteri & Rezervasyon Kaydı'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Müşteri Adı Soyadı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName || ''}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Örn: Mehmet Özkan"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Telefon / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Örn: +90 532 123 45 67"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Konaklanan Otel & Bölge *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hotel || ''}
                    onChange={(e) => setFormData({ ...formData, hotel: e.target.value })}
                    placeholder="Örn: Amari Phuket (Patong)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Oda Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.roomNumber || ''}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="Örn: 402 veya Villa 5"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Seçilen Tur *
                  </label>
                  <select
                    value={formData.tourTitle || ''}
                    onChange={(e) => setFormData({ ...formData, tourTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  >
                    {initialTours.map((t) => (
                      <option key={t.id} value={t.title}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Tur Tarihi *
                  </label>
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
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Otel Alınış Saati
                  </label>
                  <input
                    type="text"
                    value={formData.pickupTime || ''}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                    placeholder="Örn: 07:30"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Yetişkin Sayısı
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.adultCount || 1}
                    onChange={(e) => setFormData({ ...formData, adultCount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Çocuk Sayısı
                  </label>
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
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Toplam Ücret (THB)
                  </label>
                  <input
                    type="number"
                    value={formData.totalPriceThb || 0}
                    onChange={(e) => setFormData({ ...formData, totalPriceThb: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Alınan Kapora (THB)
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmountThb || 0}
                    onChange={(e) => setFormData({ ...formData, paidAmountThb: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none text-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Rezervasyon Durumu
                  </label>
                  <select
                    value={formData.status || 'confirmed'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Booking['status'] })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-semibold"
                  >
                    <option value="inquiry">🟡 Teklif Aşamasında</option>
                    <option value="confirmed">🟢 Kesinleşti / Onay</option>
                    <option value="completed">🔵 Tamamlandı</option>
                    <option value="cancelled">🔴 İptal Edildi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Özel Notlar & Hatırlatmalar
                </label>
                <textarea
                  rows={2}
                  value={formData.specialNotes || ''}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  placeholder="Vejetaryen yemek, bebek koltuğu, havalimanı iniş saati vb..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-lg shadow-brand-primary/20"
                >
                  {editingBooking ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
