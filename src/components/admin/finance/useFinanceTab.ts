import React, { useState, useMemo } from 'react';
import {
  type Booking,
  type PaymentRecord,
  type PaymentMethod,
  type CollectionLocation,
  type ExpenseRecord,
  initialExpenses,
  PAYMENT_METHOD_LABELS,
  COLLECTION_LOCATION_LABELS,
} from '../../../data/adminInitialData';
import { calculateFinancialBreakdown } from '../../../lib/profitability';
import { type VaultAccountId, type VirmanRecord, VAULT_ACCOUNTS } from './vaultTypes';
import { readLocalCollection, saveCmsCollection } from '../../../lib/cmsSync';

interface UseFinanceTabParams {
  bookings: Booking[];
  payments: PaymentRecord[];
  onAddPayment: (record: Omit<PaymentRecord, 'id' | 'collectedAt'>) => void;
  onUpdateBooking: (booking: Booking) => void;
  showToast: (msg: string) => void;
}

/**
 * FinanceTab'in tum state, hesaplama (memo) ve handler katmani.
 * Bilesen govdesinden mekanik olarak tasindi; davranis birebir ayni.
 */
export function useFinanceTab({
  bookings,
  payments,
  onAddPayment,
  onUpdateBooking,
  showToast,
}: UseFinanceTabParams) {
  // Alt Görünüm Modu
  const [subTab, setSubTab] = useState<'ledger' | 'outstanding' | 'accounts' | 'driver_handover' | 'expenses'>('ledger');
  const [settledDrivers, setSettledDrivers] = useState<string[]>([]);


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

  // Çoklu Kasa & Virman State'i
  const [virmans, setVirmans] = useState<VirmanRecord[]>(() => {
    return (
      readLocalCollection<VirmanRecord[]>('virmans', [
        {
          id: 'VRM-101',
          sourceAccount: 'office_cash',
          targetAccount: 'kbank',
          amountThb: 35000,
          date: '2026-10-15',
          transferredBy: 'Murat Gençer',
          note: 'Haftalık şoför nakit tahsilatlarının K-Bank ATM hesabına yatırılması',
        },
      ]) || []
    );
  });

  const [isVirmanModalOpen, setIsVirmanModalOpen] = useState(false);
  const [virmanSource, setVirmanSource] = useState<VaultAccountId>('office_cash');
  const [virmanTarget, setVirmanTarget] = useState<VaultAccountId>('kbank');
  const [virmanAmount, setVirmanAmount] = useState<number>(10000);
  const [virmanDate, setVirmanDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [virmanBy, setVirmanBy] = useState<string>('Murat Gençer (Ofis)');
  const [virmanNote, setVirmanNote] = useState<string>('');

  // Operasyonel Giderler State'i
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    return readLocalCollection<ExpenseRecord[]>('expenses', initialExpenses) || initialExpenses;
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    void saveCmsCollection('expenses', updated, (err) => showToast(`⚠️ ${err}`));
    showToast('Gider kaydı silindi.');
  };

  const financialBreakdown = useMemo(() => {
    return calculateFinancialBreakdown(bookings, expenses);
  }, [bookings, expenses]);

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

  // Çoklu Kasa Bakiyeleri & Virman Dengelemesi
  const vaultBalances = useMemo(() => {
    const rawBalances: Record<VaultAccountId, number> = {
      kbank: (methodTotals.promptpay || 0) + (methodTotals.kbank_transfer || 0),
      office_cash: (methodTotals.cash_thb || 0) + (methodTotals.cash_usd || 0) + (methodTotals.cash_eur || 0),
      tr_bank: methodTotals.tr_bank_transfer || 0,
      wise: (methodTotals.wise || 0) + (methodTotals.credit_card || 0),
    };

    // Apply virmans
    virmans.forEach((v) => {
      if (rawBalances[v.sourceAccount] !== undefined) {
        rawBalances[v.sourceAccount] -= v.amountThb;
      }
      if (rawBalances[v.targetAccount] !== undefined) {
        rawBalances[v.targetAccount] += v.amountThb;
      }
    });

    // Kasalardan yapılan operasyonel harcamaları (yakıt, yevmiye vb.) düş
    expenses.forEach((e) => {
      if (rawBalances[e.paidFromAccount] !== undefined) {
        rawBalances[e.paidFromAccount] -= e.amountThb;
      }
    });

    const totalLiquid = Object.values(rawBalances).reduce((sum, b) => sum + b, 0);

    return {
      balances: rawBalances,
      totalLiquid,
    };
  }, [methodTotals, virmans, expenses]);

  const handleSaveVirman = (e: React.FormEvent) => {
    e.preventDefault();
    if (virmanSource === virmanTarget) {
      showToast('Kaynak ve hedef kasa aynı olamaz! Lütfen farklı bir hesap seçin.');
      return;
    }
    if (virmanAmount <= 0) {
      showToast('Lütfen geçerli bir virman tutarı giriniz.');
      return;
    }

    const newVirman: VirmanRecord = {
      id: `VRM-${Date.now().toString().slice(-4)}`,
      sourceAccount: virmanSource,
      targetAccount: virmanTarget,
      amountThb: virmanAmount,
      date: virmanDate,
      transferredBy: virmanBy,
      note: virmanNote || `${VAULT_ACCOUNTS[virmanSource].name} ➔ ${VAULT_ACCOUNTS[virmanTarget].name} virman işlemi`,
    };

    const nextVirmans = [newVirman, ...virmans];
    setVirmans(nextVirmans);
    void saveCmsCollection('virmans', nextVirmans, (err) => showToast(`⚠️ ${err}`));

    setIsVirmanModalOpen(false);
    showToast(`✓ ${virmanAmount.toLocaleString()} THB virman transferi kaydedildi ve buluta aktarıldı! 🔄`);
  };

  const handleDeleteVirman = (id: string) => {
    const nextVirmans = virmans.filter((v) => v.id !== id);
    setVirmans(nextVirmans);
    void saveCmsCollection('virmans', nextVirmans, (err) => showToast(`⚠️ ${err}`));
    showToast('Virman transfer kaydı silindi.');
  };

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

  // Şoför Kasa Kapatma (Z-Raporu) Verileri
  const driverCashGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        driverName: string;
        totalAmountThb: number;
        payments: PaymentRecord[];
      }
    >();

    payments.forEach((p) => {
      if (p.method === 'cash_thb' && p.collectedBy) {
        const collector = p.collectedBy.trim();
        if (!map.has(collector)) {
          map.set(collector, { driverName: collector, totalAmountThb: 0, payments: [] });
        }
        const g = map.get(collector)!;
        g.totalAmountThb += p.amountThb || 0;
        g.payments.push(p);
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalAmountThb - a.totalAmountThb);
  }, [payments]);

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
  // Yeni gider eklenmesi (ExpenseModal onSave) — kalıcılık parent'ta
  const persistExpense = (newExp: ExpenseRecord) => {
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    void saveCmsCollection('expenses', updated, (err) => showToast(`⚠️ ${err}`));
    setIsExpenseModalOpen(false);
  };

  // Toolbar'daki "+ Yeni Tahsilat Girişi" hızlı aksiyonu
  const handleQuickCollect = () => {
    setSelectedBookingId(outstandingBookings[0]?.id || bookings[0]?.id || '');
    setCollectAmount(outstandingBookings[0]?.remainingAmountThb || 2000);
    setCollectMethod('cash_thb');
    setCollectLocation('hotel_lobby');
    setCollectedBy('Murat Gençer (Ofis)');
    setCollectNote('');
    setIsCollectModalOpen(true);
  };

  return {
    subTab, setSubTab, settledDrivers, setSettledDrivers,
    searchQuery, setSearchQuery, methodFilter, setMethodFilter, dateFilter, setDateFilter,
    isCollectModalOpen, setIsCollectModalOpen,
    selectedBookingId, setSelectedBookingId,
    collectAmount, setCollectAmount, collectMethod, setCollectMethod,
    collectLocation, setCollectLocation, collectedBy, setCollectedBy,
    collectNote, setCollectNote,
    virmans, isVirmanModalOpen, setIsVirmanModalOpen,
    virmanSource, setVirmanSource, virmanTarget, setVirmanTarget,
    virmanAmount, setVirmanAmount, virmanDate, setVirmanDate,
    virmanBy, setVirmanBy, virmanNote, setVirmanNote,
    isExpenseModalOpen, setIsExpenseModalOpen, expenses,
    financialBreakdown, filteredPayments, outstandingBookings,
    methodTotals, vaultBalances, driverCashGroups,
    totalRevenue, totalCollected, totalOutstanding, collectionRate,
    totalCost, netProfit, profitMargin,
    handleSaveVirman, handleDeleteVirman, handleDeleteExpense,
    handleOpenCollect, handleSubmitCollect, handleExportCSV,
    handleQuickCollect, persistExpense,
  };
}
