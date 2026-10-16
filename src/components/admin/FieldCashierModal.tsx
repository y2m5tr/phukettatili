import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Coins,
  RefreshCw,
  ArrowRight,
  Send,
  MessageCircle,
  Copy,
  Check,
  Wallet,
  Receipt,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import {
  type SupportedCurrency,
  getLiveExchangeRates,
  calculateCashChange,
  generateCashPaymentSlipWhatsApp,
  getCashPaymentSlipWhatsAppUrl,
} from '../../lib/exchangeRates';
import { DEFAULT_EXCHANGE_RATES } from '../../data/adminInitialData';

interface FieldCashierModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings?: Booking[];
  initialBooking?: Booking | null;
  showToast: (msg: string) => void;
  onRecordPayment?: (payment: {
    bookingId?: string;
    amountThb: number;
    method: string;
    note: string;
  }) => void;
}

export default function FieldCashierModal({
  isOpen,
  onClose,
  bookings = [],
  initialBooking = null,
  showToast,
  onRecordPayment,
}: FieldCashierModalProps) {
  // Live rates state
  const [exchangeRates, setExchangeRates] = useState<Record<SupportedCurrency, number>>(DEFAULT_EXCHANGE_RATES);
  const [ratesSource, setRatesSource] = useState<'live' | 'fallback'>('fallback');
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string>('');
  const [isRefreshingRates, setIsRefreshingRates] = useState<boolean>(false);

  // Form state
  const [selectedBookingId, setSelectedBookingId] = useState<string>(initialBooking?.id || '');
  const [guestName, setGuestName] = useState<string>(initialBooking?.customerName || '');
  const [guestPhone, setGuestPhone] = useState<string>(initialBooking?.phone || '');
  const [serviceTitle, setServiceTitle] = useState<string>(
    initialBooking ? `${initialBooking.tourTitle} (Kalan Bakiye)` : 'VIP Transfer / Tur Hizmeti'
  );
  const [hotelLocation, setHotelLocation] = useState<string>(initialBooking?.hotel || '');
  const [collectorName, setCollectorName] = useState<string>('Saha Operasyon Şoförü');

  const [dueAmountThb, setDueAmountThb] = useState<number>(
    initialBooking ? (initialBooking.remainingAmountThb > 0 ? initialBooking.remainingAmountThb : initialBooking.totalPriceThb) : 2500
  );
  const [paidCurrency, setPaidCurrency] = useState<SupportedCurrency | 'THB'>('USD');
  const [paidAmount, setPaidAmount] = useState<number>(100);
  const [customRate, setCustomRate] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Load live rates
  useEffect(() => {
    let isMounted = true;
    getLiveExchangeRates().then((data) => {
      if (isMounted) {
        setExchangeRates(data.rates);
        setRatesSource(data.source);
        setRatesLastUpdated(data.lastUpdated);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Update fields if initialBooking changes
  useEffect(() => {
    if (initialBooking) {
      setSelectedBookingId(initialBooking.id);
      setGuestName(initialBooking.customerName);
      setGuestPhone(initialBooking.phone);
      setServiceTitle(`${initialBooking.tourTitle} (Kalan Bakiye)`);
      setHotelLocation(initialBooking.hotel);
      setDueAmountThb(
        initialBooking.remainingAmountThb > 0
          ? initialBooking.remainingAmountThb
          : initialBooking.totalPriceThb
      );
    }
  }, [initialBooking]);

  const handleBookingSelect = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    if (!bookingId) return;

    const b = bookings.find((item) => item.id === bookingId);
    if (b) {
      setGuestName(b.customerName);
      setGuestPhone(b.phone);
      setServiceTitle(`${b.tourTitle} (Kalan Bakiye)`);
      setHotelLocation(b.hotel);
      setDueAmountThb(b.remainingAmountThb > 0 ? b.remainingAmountThb : b.totalPriceThb);
    }
  };

  const handleRefreshRates = async () => {
    setIsRefreshingRates(true);
    try {
      const data = await getLiveExchangeRates(true);
      setExchangeRates(data.rates);
      setRatesSource(data.source);
      setRatesLastUpdated(data.lastUpdated);
      showToast('💱 Canlı döviz kurları başarıyla güncellendi!');
    } catch {
      showToast('⚠️ Kurlar güncellenirken hata oluştu.');
    } finally {
      setIsRefreshingRates(false);
    }
  };

  // Active rate
  const activeRate = useMemo(() => {
    if (paidCurrency === 'THB') return 1;
    if (customRate > 0) return customRate;
    return exchangeRates[paidCurrency as SupportedCurrency] || 1;
  }, [paidCurrency, customRate, exchangeRates]);

  // Cash change computation
  const calculation = useMemo(() => {
    return calculateCashChange({
      dueThb: dueAmountThb,
      paidCurrency,
      paidAmount,
      customRate: customRate > 0 ? customRate : undefined,
      rates: exchangeRates,
    });
  }, [dueAmountThb, paidCurrency, paidAmount, customRate, exchangeRates]);

  // WhatsApp text & url
  const receiptText = useMemo(() => {
    return generateCashPaymentSlipWhatsApp({
      guestName,
      serviceTitle,
      dueThb: dueAmountThb,
      paidCurrency,
      paidAmount,
      effectiveRate: calculation.effectiveRate,
      changeDueThb: calculation.changeDueThb,
      remainingDebtThb: calculation.remainingDebtThb,
      collectorName,
      hotelOrLocation: hotelLocation,
    });
  }, [guestName, serviceTitle, dueAmountThb, paidCurrency, paidAmount, calculation, collectorName, hotelLocation]);

  const whatsappUrl = useMemo(() => {
    return getCashPaymentSlipWhatsAppUrl(guestPhone, receiptText);
  }, [guestPhone, receiptText]);

  const handleCopyReceipt = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    showToast('📋 WhatsApp tahsilat makbuzu panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLedger = () => {
    if (onRecordPayment) {
      onRecordPayment({
        bookingId: selectedBookingId || undefined,
        amountThb: calculation.paidInThb - calculation.changeDueThb, // net collected
        method: paidCurrency === 'THB' ? 'cash_thb' : `cash_${paidCurrency.toLowerCase()}`,
        note: `Saha Nakit Tahsilat: ${paidAmount} ${paidCurrency} alındı. Verilen Para Üstü: ${calculation.changeDueThb} THB (Kur: ${calculation.effectiveRate})`,
      });
      showToast('🏦 Tahsilat merkez kasa hareketlerine işlendi!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-surface-1 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Saha Çoklu Döviz & Para Üstü Kasa Hesaplayıcı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                  Field Cashier
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dolar, Euro, TL veya THB nakit ödemelerde kur çevirimi, para üstü ve anlık makbuz
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Exchange Rate Bar */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400">Canlı Kurlar:</span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              🇺🇸 1 USD = <strong>{exchangeRates.USD}฿</strong>
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              🇪🇺 1 EUR = <strong>{exchangeRates.EUR}฿</strong>
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              🇹🇷 1 TRY = <strong>{exchangeRates.TRY}฿</strong>
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              🇬🇧 1 GBP = <strong>{exchangeRates.GBP}฿</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleRefreshRates}
            disabled={isRefreshingRates}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingRates ? 'animate-spin' : ''}`} />
            <span>{isRefreshingRates ? 'Kurlar Alınıyor...' : 'Kurları Yenile'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Booking Quick Selector */}
          {bookings.length > 0 && (
            <div>
              <label htmlFor="field-cashier-booking-select" className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Kayıtlı Rezervasyondan Otomatik Doldur (Opsiyonel)
              </label>
              <select
                id="field-cashier-booking-select"
                value={selectedBookingId}
                onChange={(e) => handleBookingSelect(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="">-- Serbest Tahsilat (Elle Giriş) --</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.customerName} - {b.tourTitle} (Kalan: {b.remainingAmountThb.toLocaleString()} THB)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Guest and Service Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Misafir Adı</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Misafir Tel (WhatsApp)</label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="+90 532..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tahsil Eden Şoför / Personel</label>
              <input
                type="text"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                placeholder="Şoför Somchai / Merkez"
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>
          </div>

          {/* Calculator Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left: Due Amount in THB */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  1. Hizmet / Tur Bedeli (THB) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={dueAmountThb || ''}
                    onChange={(e) => setDueAmountThb(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black text-slate-900 dark:text-white focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                    THB (฿)
                  </span>
                </div>
              </div>

              {/* Right: Paid Currency & Amount */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  2. Alınan Para Birimi & Tutar *
                </label>
                <div className="flex gap-2">
                  <select
                    value={paidCurrency}
                    onChange={(e) => {
                      setPaidCurrency(e.target.value as any);
                      setCustomRate(0);
                    }}
                    className="w-1/3 px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="USD">🇺🇸 USD ($)</option>
                    <option value="EUR">🇪🇺 EUR (€)</option>
                    <option value="TRY">🇹🇷 TRY (₺)</option>
                    <option value="GBP">🇬🇧 GBP (£)</option>
                    <option value="THB">🇹🇭 THB (฿)</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={paidAmount || ''}
                    onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
                    className="w-2/3 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-black text-emerald-600 dark:text-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Denomination Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-400">Hızlı Tutar Seçimi:</span>
              {paidCurrency === 'USD' && (
                <>
                  {[20, 50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPaidAmount(amt)}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      ${amt}
                    </button>
                  ))}
                </>
              )}
              {paidCurrency === 'EUR' && (
                <>
                  {[20, 50, 100, 200].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPaidAmount(amt)}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      €{amt}
                    </button>
                  ))}
                </>
              )}
              {paidCurrency === 'THB' && (
                <>
                  {[1000, 1500, 2000, 3000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPaidAmount(amt)}
                      className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      {amt.toLocaleString()}฿
                    </button>
                  ))}
                </>
              )}
            </div>

            {/* Exchange Rate Adjustment (Optional override) */}
            {paidCurrency !== 'THB' && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="text-slate-500">
                  Uygulanan Kur: <strong>1 {paidCurrency} = {calculation.effectiveRate} THB</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <label htmlFor="custom-fx-rate-input" className="text-[10px] text-slate-400">Özel Kur Girişi:</label>
                  <input
                    id="custom-fx-rate-input"
                    type="number"
                    step="0.05"
                    placeholder={String(activeRate)}
                    value={customRate || ''}
                    onChange={(e) => setCustomRate(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                  />
                  {customRate > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomRate(0)}
                      className="text-[10px] text-red-500 hover:underline cursor-pointer"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Display Board */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Alınan Döviz Karşılığı:
                </span>
                <div className="text-xl font-mono font-black text-white">
                  {calculation.paidInThb.toLocaleString()} THB
                </div>
              </div>

              {/* Status & Change Result */}
              <div>
                {calculation.changeDueThb > 0 ? (
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 sm:justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verilecek Para Üstü:</span>
                    </span>
                    <div className="text-2xl font-mono font-black text-emerald-400">
                      +{calculation.changeDueThb.toLocaleString()} THB
                    </div>
                  </div>
                ) : calculation.remainingDebtThb > 0 ? (
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1 sm:justify-end">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Kalan Eksik Bakiye:</span>
                    </span>
                    <div className="text-2xl font-mono font-black text-red-400">
                      -{calculation.remainingDebtThb.toLocaleString()} THB
                    </div>
                  </div>
                ) : (
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                      Durum:
                    </span>
                    <div className="text-xl font-bold text-sky-400">
                      ✅ Tam Tutar Alındı
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banknote breakdown (Only if change is due) */}
            {calculation.changeDueThb > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1.5">
                  💵 Tayland Bahtı Para Üstü Banknot Dağılımı:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {calculation.changeBreakdown.bill1000 > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-amber-300">
                      {calculation.changeBreakdown.bill1000}x 1,000฿
                    </span>
                  )}
                  {calculation.changeBreakdown.bill500 > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-purple-300">
                      {calculation.changeBreakdown.bill500}x 500฿
                    </span>
                  )}
                  {calculation.changeBreakdown.bill100 > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-red-300">
                      {calculation.changeBreakdown.bill100}x 100฿
                    </span>
                  )}
                  {calculation.changeBreakdown.bill50 > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-blue-300">
                      {calculation.changeBreakdown.bill50}x 50฿
                    </span>
                  )}
                  {calculation.changeBreakdown.bill20 > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-emerald-300">
                      {calculation.changeBreakdown.bill20}x 20฿
                    </span>
                  )}
                  {calculation.changeBreakdown.coins > 0 && (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 font-mono font-bold text-slate-300">
                      {calculation.changeBreakdown.coins}฿ Madeni
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-2/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReceipt}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Makbuzu Kopyala'}</span>
            </button>

            {onRecordPayment && (
              <button
                type="button"
                onClick={handleSaveToLedger}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Kasaya Kaydet</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Misafire WhatsApp Makbuz Gönder</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-bold cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
