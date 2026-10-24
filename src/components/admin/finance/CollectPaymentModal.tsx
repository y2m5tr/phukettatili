import { useEffect, useState } from 'react';
import {
  Receipt,
  X,
  Coins,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  type Booking,
  type PaymentMethod,
  type CollectionLocation,
  convertToThb,
  DEFAULT_EXCHANGE_RATES,
} from '../../../data/adminInitialData';
import { getLiveExchangeRates, type SupportedCurrency } from '../../../lib/exchangeRates';
import { fmtMoney } from '../../../lib/moneyFormat';

interface CollectPaymentModalProps {
  bookings: Booking[];
  selectedBookingId: string;
  setSelectedBookingId: (id: string) => void;
  collectAmount: number;
  setCollectAmount: (amount: number) => void;
  collectMethod: PaymentMethod;
  setCollectMethod: (method: PaymentMethod) => void;
  collectLocation: CollectionLocation;
  setCollectLocation: (location: CollectionLocation) => void;
  collectedBy: string;
  setCollectedBy: (name: string) => void;
  collectNote: string;
  setCollectNote: (note: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

/**
 * Hızlı tahsilat modalı. Döviz çevirici state'i ve canlı kur çekimi bu
 * bileşene aittir — FinanceTab'da başka hiçbir yerde kullanılmıyordu.
 * Kurlar modal her açıldığında (mount) tazelenir; kapalıyken gereksiz
 * ağ isteği atılmaz.
 */
export default function CollectPaymentModal({
  bookings,
  selectedBookingId,
  setSelectedBookingId,
  collectAmount,
  setCollectAmount,
  collectMethod,
  setCollectMethod,
  collectLocation,
  setCollectLocation,
  collectedBy,
  setCollectedBy,
  collectNote,
  setCollectNote,
  onSubmit,
  onClose,
  showToast,
}: CollectPaymentModalProps) {
  // Döviz Çevirici State'i & Canlı Kurlar
  const [showCurrencyCalc, setShowCurrencyCalc] = useState(false);
  const [foreignAmount, setForeignAmount] = useState<number>(0);
  const [foreignCurrency, setForeignCurrency] = useState<SupportedCurrency>('TRY');
  const [exchangeRates, setExchangeRates] = useState<Record<SupportedCurrency, number>>(DEFAULT_EXCHANGE_RATES);
  const [ratesSource, setRatesSource] = useState<'live' | 'fallback'>('fallback');
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string>('');
  const [isRefreshingRates, setIsRefreshingRates] = useState<boolean>(false);

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

  const handleRefreshRates = async () => {
    setIsRefreshingRates(true);
    try {
      const res = await fetch('/api/exchange-rates?refresh=true');
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.rates) {
          setExchangeRates(json.rates);
          setRatesSource(json.source);
          setRatesLastUpdated(json.lastUpdated);
          showToast('💱 Canlı banka kurları güncellendi!');
        }
      }
    } catch {
      showToast('⚠️ Kur servisine ulaşılamadı, sabit kurlar kullanılıyor.');
    } finally {
      setIsRefreshingRates(false);
    }
  };

  return (
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
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
                  {b.customerName} · {b.tourTitle} (Kalan: {fmtMoney((b.remainingAmountThb || 0))} THB)
                </option>
              ))}
            </select>
          </div>

          {/* 💱 Çoklu Para Birimi (TRY / USD / EUR → THB) Çevirici */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Döviz / Kur Çevirici (TRY / USD / EUR → THB)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCurrencyCalc(!showCurrencyCalc)}
                className="text-[11px] font-bold text-brand-primary dark:text-brand-accent hover:underline cursor-pointer"
              >
                {showCurrencyCalc ? '✕ Gizle' : '+ Çeviriciyi Aç'}
              </button>
            </div>

            {showCurrencyCalc && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ratesSource === 'live'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${ratesSource === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {ratesSource === 'live' ? 'Canlı Banka Kurları (BOT/FX)' : 'Sabit Kurlar'}
                    </span>
                    {ratesLastUpdated && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(ratesLastUpdated).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshRates}
                    disabled={isRefreshingRates}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer disabled:opacity-50"
                    title="Kurları Şimdi Güncelle"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingRates ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingRates ? 'Güncelleniyor...' : 'Kurları Yenile'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Alınan Döviz Tutarı
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Örn: 5000"
                      value={foreignAmount || ''}
                      onChange={(e) => setForeignAmount(Number(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Para Birimi
                    </label>
                    <select
                      value={foreignCurrency}
                      onChange={(e) => setForeignCurrency(e.target.value as SupportedCurrency)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="TRY">🇹🇷 Türk Lirası (1 TRY ≈ {exchangeRates.TRY} THB)</option>
                      <option value="USD">🇺🇸 ABD Doları (1 USD ≈ {exchangeRates.USD} THB)</option>
                      <option value="EUR">🇪🇺 Euro (1 EUR ≈ {exchangeRates.EUR} THB)</option>
                      <option value="GBP">🇬🇧 İngiliz Sterlini (1 GBP ≈ {exchangeRates.GBP} THB)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Karşılığı:{' '}
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {fmtMoney(convertToThb(foreignAmount, foreignCurrency, exchangeRates))} THB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const converted = convertToThb(foreignAmount, foreignCurrency, exchangeRates);
                      setCollectAmount(converted);
                      setCollectNote(
                        `${fmtMoney(foreignAmount)} ${foreignCurrency} nakit/havale alındı (Canlı Kur: ${exchangeRates[foreignCurrency]})`
                      );
                      showToast(`💱 ${fmtMoney(converted)} THB olarak tahsilat kutusuna aktarıldı!`);
                    }}
                    disabled={foreignAmount <= 0}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Tutara Aktar</span>
                  </button>
                </div>
              </div>
            )}
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
              onClick={onClose}
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
  );
}
