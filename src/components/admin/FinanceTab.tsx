import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Download,
  AlertCircle,
  CheckCircle2,
  Phone,
  Ticket,
  X,
  Wallet,
  Receipt,
} from 'lucide-react';
import {
  type Booking,
  type PaymentRecord,
  type PaymentMethod,
  type CollectionLocation,
  PAYMENT_METHOD_LABELS,
  COLLECTION_LOCATION_LABELS,
} from '../../data/adminInitialData';

interface FinanceTabProps {
  bookings: Booking[];
  payments: PaymentRecord[];
  onAddPayment: (record: Omit<PaymentRecord, 'id' | 'collectedAt'>) => void;
  onUpdateBooking: (booking: Booking) => void;
  showToast: (msg: string) => void;
  setVoucherBooking: (b: Booking) => void;
}

export default function FinanceTab({
  bookings,
  payments,
  onAddPayment,
  onUpdateBooking,
  showToast,
  setVoucherBooking,
}: FinanceTabProps) {
  // Alt Görünüm Modu
  const [subTab, setSubTab] = useState<'ledger' | 'outstanding' | 'accounts'>('ledger');

  // Filtreler
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month'>('this_month');

  // Hızlı Tahsilat Modal State'i
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectMethod, setCollectMethod] = useState<PaymentMethod>('cash_thb');
  const [collectLocation, setCollectLocation] = useState<CollectionLocation>('hotel_lobby');
  const [collectedBy, setCollectedBy] = useState<string>('Murat Gençer (Ofis)');
  const [collectNote, setCollectNote] = useState<string>('');

  // 1. Finansal KPI Özet Hesaplamaları
  const validBookings = useMemo(
    () => bookings.filter((b) => b.status !== 'cancelled'),
    [bookings]
  );

  const totalRevenue = useMemo(
    () => validBookings.reduce((acc, b) => acc + (b.totalPriceThb || 0), 0),
    [validBookings]
  );

  const totalCollected = useMemo(
    () => validBookings.reduce((acc, b) => acc + (b.paidAmountThb || 0), 0),
    [validBookings]
  );

  const totalOutstanding = useMemo(
    () => Math.max(0, totalRevenue - totalCollected),
    [totalRevenue, totalCollected]
  );

  const collectionRate = useMemo(
    () => (totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0),
    [totalRevenue, totalCollected]
  );

  const totalCost = useMemo(
    () => validBookings.reduce((acc, b) => acc + (b.costThb || 0), 0),
    [validBookings]
  );

  const netProfit = useMemo(() => totalRevenue - totalCost, [totalRevenue, totalCost]);
  const profitMargin = useMemo(
    () => (totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0),
    [totalRevenue, netProfit]
  );

  // Otelde / Sahada tahsil edilecek bekleyen rezervasyonlar
  const outstandingBookings = useMemo(
    () =>
      validBookings
        .filter((b) => (b.remainingAmountThb || 0) > 0)
        .sort((a, b) => (a.tourDate || '').localeCompare(b.tourDate || '')),
    [validBookings]
  );

  // Kasa / Yöntem bazlı toplam dağılım
  const methodTotals = useMemo(() => {
    const acc: Record<PaymentMethod, number> = {
      cash_thb: 0,
      promptpay: 0,
      kbank_transfer: 0,
      tr_bank_transfer: 0,
      cash_usd: 0,
      cash_eur: 0,
      credit_card: 0,
      wise: 0,
      other: 0,
    };

    payments.forEach((p) => {
      if (acc[p.method] !== undefined) {
        acc[p.method] += p.amountThb || 0;
      } else {
        acc.other += p.amountThb || 0;
      }
    });

    return acc;
  }, [payments]);

  // Filtrelenmiş Kasa Defteri Hareketleri
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      // Metin araması
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCustomer = (p.customerName || '').toLowerCase().includes(q);
        const matchTour = (p.tourTitle || '').toLowerCase().includes(q);
        const matchNote = (p.note || '').toLowerCase().includes(q);
        const matchReceipt = (p.receiptNo || '').toLowerCase().includes(q);
        const matchCollector = (p.collectedBy || '').toLowerCase().includes(q);
        if (!matchCustomer && !matchTour && !matchNote && !matchReceipt && !matchCollector) {
          return false;
        }
      }

      // Yöntem filtresi
      if (methodFilter !== 'all' && p.method !== methodFilter) {
        return false;
      }

      // Tarih filtresi
      if (dateFilter !== 'all') {
        const itemDate = new Date(p.collectedAt);
        const now = new Date();
        if (dateFilter === 'today') {
          if (itemDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === 'this_week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (itemDate < weekAgo) return false;
        } else if (dateFilter === 'this_month') {
          if (
            itemDate.getMonth() !== now.getMonth() ||
            itemDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [payments, searchQuery, methodFilter, dateFilter]);

  // Bir rezervasyon için hızlı tahsilat modalı aç
  const handleOpenCollect = (booking: Booking) => {
    setSelectedBookingId(booking.id);
    setCollectAmount(booking.remainingAmountThb || 0);
    setCollectMethod(booking.depositMethod || 'cash_thb');
    setCollectLocation(booking.collectionLocation || 'hotel_lobby');
    setCollectedBy('Somchai (Şoför)');
    setCollectNote(
      `${booking.hotel} otelinde misafirden tahsilat`
    );
    setIsCollectModalOpen(true);
  };

  // Tahsilat Modal Formunu Gönder
  const handleSubmitCollect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || collectAmount <= 0) {
      showToast('⚠️ Lütfen geçerli bir tutar ve rezervasyon giriniz.');
      return;
    }

    const matchedBooking = bookings.find((b) => b.id === selectedBookingId);
    if (!matchedBooking) {
      showToast('⚠️ Seçilen rezervasyon bulunamadı.');
      return;
    }

    const receiptNo = `RCP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(100 + Math.random() * 900))}`;

    // 1. Yeni Tahsilat Kaydını Ekle
    onAddPayment({
      bookingId: matchedBooking.id,
      customerName: matchedBooking.customerName,
      tourTitle: matchedBooking.tourTitle,
      amountThb: collectAmount,
      method: collectMethod,
      collectedBy: collectedBy.trim() || 'Ofis',
      collectionLocation: collectLocation,
      note: collectNote.trim() || undefined,
      receiptNo,
    });

    // 2. Rezervasyonun Bakiye ve Ödeme Durumunu Güncelle
    const newPaid = (matchedBooking.paidAmountThb || 0) + collectAmount;
    const newRemaining = Math.max(0, (matchedBooking.totalPriceThb || 0) - newPaid);
    const newPaymentStatus: Booking['paymentStatus'] =
      newRemaining === 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';

    const updatedBooking: Booking = {
      ...matchedBooking,
      paidAmountThb: newPaid,
      remainingAmountThb: newRemaining,
      paymentStatus: newPaymentStatus,
    };

    onUpdateBooking(updatedBooking);
    setIsCollectModalOpen(false);
    showToast(`✅ ${collectAmount.toLocaleString()} THB tahsilat makbuzu (${receiptNo}) oluşturuldu!`);
  };

  // CSV Dışa Aktarma
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      showToast('Dışa aktarılacak kayıt bulunmuyor.');
      return;
    }

    const headers = [
      'Makbuz No',
      'Tarih',
      'Misafir Adı',
      'Tur Adı',
      'Tutar (THB)',
      'Ödeme Yöntemi',
      'Tahsil Eden',
      'Tahsilat Noktası',
      'Açıklama',
    ];

    const rows = filteredPayments.map((p) => [
      p.receiptNo || p.id,
      new Date(p.collectedAt).toLocaleDateString('tr-TR'),
      `"${p.customerName || ''}"`,
      `"${p.tourTitle || ''}"`,
      p.amountThb,
      `"${PAYMENT_METHOD_LABELS[p.method]?.label || p.method}"`,
      `"${p.collectedBy || ''}"`,
      `"${COLLECTION_LOCATION_LABELS[p.collectionLocation || 'other']}"`,
      `"${p.note || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `phuket_tatili_kasa_defteri_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 Kasa defteri CSV olarak indirildi.');
  };

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* 1. ÜST FİNANSAL KPI KARTLARI */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Toplam Ciro & Tahsilat Oranı */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Toplam Satış Cirosu
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
            {totalRevenue.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Tahsil Edilen:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {totalCollected.toLocaleString()} THB (%{collectionRate})
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, collectionRate)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Açık Bakiye (Alacaklar) */}
        <div
          onClick={() => setSubTab('outstanding')}
          className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tahsil Edilecek Açık Bakiye
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-serif">
            {totalOutstanding.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Bekleyen Misafir:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 transition-colors">
              {outstandingBookings.length} Rezervasyon →
            </span>
          </div>
        </div>

        {/* KPI 3: Nakit El Kasası (THB) */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nakit El Kasası (THB)
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
            {(methodTotals.cash_thb || 0).toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">PromptPay QR:</span>
            <span className="font-extrabold text-sky-600 dark:text-sky-400">
              {(methodTotals.promptpay || 0).toLocaleString()} THB
            </span>
          </div>
        </div>

        {/* KPI 4: Net Acenta Kârı */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tahmini Net Acenta Kârı
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-serif">
            {netProfit.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Net Kâr Marjı:</span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              %{profitMargin} (Maliyet: {totalCost.toLocaleString()} THB)
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. KONTROL ÇUBUĞU (ALT SEKMELER & HIZLI EYLEMLER) */}
      {/* ==================================================== */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Alt Sekme Değiştirici */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setSubTab('ledger')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'ledger'
                ? 'bg-white dark:bg-surface-1 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Kasa Defteri ({filteredPayments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('outstanding')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'outstanding'
                ? 'bg-amber-500 text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Otel Tahsilatları ({outstandingBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('accounts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'accounts'
                ? 'bg-white dark:bg-surface-1 text-slate-900 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Kasa Hesapları</span>
          </button>
        </div>

        {/* Sağ Butonlar: Tahsilat Al + Dışa Aktar */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
            title="Kasa defterini Excel / CSV olarak indir"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV İndir</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedBookingId(outstandingBookings[0]?.id || bookings[0]?.id || '');
              setCollectAmount(outstandingBookings[0]?.remainingAmountThb || 2000);
              setCollectMethod('cash_thb');
              setCollectLocation('hotel_lobby');
              setCollectedBy('Murat Gençer (Ofis)');
              setCollectNote('');
              setIsCollectModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Tahsilat Girişi</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. GÖRÜNÜM A: KASA DEFTERİ / TAHSİLAT HAREKETLERİ */}
      {/* ==================================================== */}
      {subTab === 'ledger' && (
        <div className="space-y-4">
          {/* Arama & Filtre Çubuğu */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Misafir adı, tur, makbuz no veya şoför ara..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
            >
              <option value="all">Tüm Ödeme Yöntemleri</option>
              <option value="cash_thb">💵 Nakit THB (El Kasası)</option>
              <option value="promptpay">📱 PromptPay (K-Bank QR)</option>
              <option value="tr_bank_transfer">🇹🇷 TR Banka Havale / EFT</option>
              <option value="kbank_transfer">🏦 Tayland Banka Havalesi</option>
              <option value="credit_card">💳 Kredi Kartı / POS</option>
              <option value="wise">🌐 Wise / Uluslararası</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none font-medium"
            >
              <option value="all">Tüm Tarihler</option>
              <option value="today">Bugün</option>
              <option value="this_week">Son 7 Gün</option>
              <option value="this_month">Bu Ay</option>
            </select>
          </div>

          {/* Hareket Tablosu */}
          <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Makbuz / Tarih</th>
                    <th className="py-3.5 px-4">Misafir & Tur</th>
                    <th className="py-3.5 px-4">Kasa / Yöntem</th>
                    <th className="py-3.5 px-4">Tahsil Eden & Nokta</th>
                    <th className="py-3.5 px-4 text-right">Tahsil Edilen Tutar</th>
                    <th className="py-3.5 px-4">Not / Açıklama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Arama kriterlerine uygun tahsilat kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => {
                      const methodInfo = PAYMENT_METHOD_LABELS[p.method] || {
                        label: p.method,
                        icon: '💵',
                      };
                      const locLabel =
                        COLLECTION_LOCATION_LABELS[p.collectionLocation || 'other'];

                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {p.receiptNo || p.id}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {new Date(p.collectedAt).toLocaleString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {p.customerName || 'Misafir'}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-xs">
                              {p.tourTitle || 'Phuket Turu'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                              <span>{methodInfo.icon}</span>
                              <span>{methodInfo.label}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                              {p.collectedBy || 'Ofis'}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              📍 {locLabel}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block font-mono">
                              +{p.amountThb.toLocaleString()} THB
                            </span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
                              ✓ Kasaya Girdi
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-xs text-slate-600 dark:text-slate-400 italic block max-w-xs truncate">
                              {p.note || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. GÖRÜNÜM B: OTELDE / SAHADA TAHSİL EDİLECEK BAKİYELER */}
      {/* ==================================================== */}
      {subTab === 'outstanding' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Açık Kalan Otel Tahsilatları ({outstandingBookings.length} Rezervasyon)
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Şoför veya rehber tur sabahı otel lobisinde veya iskelede bu bakiyeleri nakit olarak tahsil etmelidir.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                Toplam Tahsil Edilecek
              </span>
              <span className="text-lg font-black text-amber-900 dark:text-amber-100 font-serif">
                {totalOutstanding.toLocaleString()} THB
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4">Tur Tarihi</th>
                    <th className="py-3.5 px-4">Misafir & İletişim</th>
                    <th className="py-3.5 px-4">Otel & Oda</th>
                    <th className="py-3.5 px-4">Tur Bilgisi</th>
                    <th className="py-3.5 px-4">Ciro / Kapora</th>
                    <th className="py-3.5 px-4">Kalan Bakiye</th>
                    <th className="py-3.5 px-4 text-right">Hızlı İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {outstandingBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        🎉 Tebrikler! Bekleyen açık bakiye bulunmuyor, tüm rezervasyonlar tahsil edildi.
                      </td>
                    </tr>
                  ) : (
                    outstandingBookings.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            📅 {b.tourDate}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            ⏰ {b.pickupTime || '07:30'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {b.customerName}
                            </span>
                            <button
                              type="button"
                              onClick={() => setVoucherBooking(b)}
                              title="Dijital Biniş Kartı / Voucher Önizle"
                              className="p-1 rounded-md text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <a
                            href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Merhaba Sayın ${b.customerName}, Phuket Tatili turunuz için kalan bakiyeniz: ${b.remainingAmountThb.toLocaleString()} THB. Sabah otel lobisinde şoförümüze nakit olarak ödeyebilirsiniz.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-3 h-3" /> {b.phone}
                          </a>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            📍 {b.hotel}
                          </span>
                          {b.roomNumber && (
                            <span className="text-xs text-slate-500 block">
                              Oda: {b.roomNumber}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-900 dark:text-white block truncate max-w-xs">
                            {b.tourTitle}
                          </span>
                          <span className="text-xs text-slate-400 block">
                            👥 {b.adultCount} Yetişkin {b.childCount > 0 ? `+ ${b.childCount} Ç.` : ''}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            Toplam: {b.totalPriceThb.toLocaleString()} THB
                          </span>
                          <span className="text-xs text-emerald-600 block">
                            Alınan: {(b.paidAmountThb || 0).toLocaleString()} THB
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400 block font-mono">
                            {b.remainingAmountThb.toLocaleString()} THB
                          </span>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                            Otel Lobisinde Nakit
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenCollect(b)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tahsilat Al</span>
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
      )}

      {/* ==================================================== */}
      {/* 5. GÖRÜNÜM C: KASA HESAPLARI DAĞILIMI */}
      {/* ==================================================== */}
      {subTab === 'accounts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PAYMENT_METHOD_LABELS).map(([key, info]) => {
            const amount = methodTotals[key as PaymentMethod] || 0;
            const txCount = payments.filter((p) => p.method === key).length;

            return (
              <div
                key={key}
                className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {info.label}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {txCount} İşlem Kaydı
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      info.category === 'cash'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : info.category === 'bank'
                        ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    }`}
                  >
                    {info.category === 'cash'
                      ? 'Nakit Kasa'
                      : info.category === 'bank'
                      ? 'Banka Hesabı'
                      : 'POS / Online'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Bakiye:</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white font-serif">
                    {amount.toLocaleString()}{' '}
                    <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. HIZLI TAHSİLAT AL MODALI */}
      {/* ==================================================== */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Yeni Tahsilat Makbuzu Ekle
                  </h3>
                  <p className="text-xs text-slate-400">
                    Misafirden veya şoförden alınan ödemeyi kasaya işle
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCollectModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCollect} className="space-y-4">
              {/* Rezervasyon Seçimi */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Rezervasyon & Misafir *
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedBookingId(id);
                    const b = bookings.find((item) => item.id === id);
                    if (b) {
                      setCollectAmount(b.remainingAmountThb || 0);
                      setCollectNote(`${b.hotel} otelinde tahsilat`);
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">— Rezervasyon Seçin —</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.customerName} · {b.tourTitle} (Kalan: {(b.remainingAmountThb || 0).toLocaleString()} THB)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tutar & Kasa Yöntemi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Tahsil Edilen Tutar (THB) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={collectAmount || ''}
                    onChange={(e) => setCollectAmount(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Ödeme Yöntemi / Kasa *
                  </label>
                  <select
                    value={collectMethod}
                    onChange={(e) => setCollectMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="cash_thb">💵 Nakit THB (El Kasası)</option>
                    <option value="promptpay">📱 PromptPay (K-Bank QR)</option>
                    <option value="tr_bank_transfer">🇹🇷 TR Banka Havale / EFT</option>
                    <option value="kbank_transfer">🏦 Tayland Banka Havalesi</option>
                    <option value="credit_card">💳 Kredi Kartı / POS</option>
                    <option value="cash_usd">💵 Nakit USD</option>
                    <option value="cash_eur">💶 Nakit EUR</option>
                    <option value="wise">🌐 Wise / Uluslararası</option>
                  </select>
                </div>
              </div>

              {/* Tahsil Eden & Nokta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Tahsil Eden Kişi *
                  </label>
                  <input
                    type="text"
                    required
                    value={collectedBy}
                    onChange={(e) => setCollectedBy(e.target.value)}
                    placeholder="Örn: Somchai (Şoför) veya Murat (Ofis)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Tahsilat Noktası
                  </label>
                  <select
                    value={collectLocation}
                    onChange={(e) => setCollectLocation(e.target.value as CollectionLocation)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="hotel_lobby">🏨 Otel Lobisi (Alış Anında)</option>
                    <option value="pier_marina">⚓ İskele / Marina Girişi</option>
                    <option value="office">🏢 Acenta Ofisi</option>
                    <option value="bank_online">💻 Önceden Havale / Online</option>
                    <option value="other">📍 Diğer Nokta</option>
                  </select>
                </div>
              </div>

              {/* Açıklama / Not */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Makbuz Notu / Açıklama
                </label>
                <input
                  type="text"
                  value={collectNote}
                  onChange={(e) => setCollectNote(e.target.value)}
                  placeholder="Örn: Patong otel lobisinde şoföre elden teslim edildi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Butonlar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  ✓ Kasaya İşle & Makbuz Kes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
