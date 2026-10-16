import React, { useState, useEffect } from 'react';
import { formatDisplayPrice, type DisplayCurrency } from '../../lib/siteCurrency';

interface TourQuickBookingDrawerProps {
  tourTitle: string;
  tourId: string;
  priceThb: number;
  whatsappNumber?: string;
}

export default function TourQuickBookingDrawer({
  tourTitle,
  tourId,
  priceThb,
  whatsappNumber = '66828950665',
}: TourQuickBookingDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [hotel, setHotel] = useState('');
  const [currency, setCurrency] = useState<DisplayCurrency>('THB');

  useEffect(() => {
    const saved = (localStorage.getItem('ptt_currency') as DisplayCurrency) || 'THB';
    setCurrency(saved);

    const handleCurrencyChange = (e: any) => {
      if (e.detail?.currency) {
        setCurrency(e.detail.currency);
      }
    };
    window.addEventListener('ptt:currency-changed', handleCurrencyChange);
    return () => window.removeEventListener('ptt:currency-changed', handleCurrencyChange);
  }, []);

  const totalPax = adults + children;
  // Çocuk için %30 indirimli fiyat hesaplama
  const childPriceThb = Math.round(priceThb * 0.7);
  const totalThb = adults * priceThb + children * childPriceThb;

  const generateWhatsAppUrl = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const lines = [
      `🌴 *Merhaba Phuket Tatili, ${tourTitle} Turu İçin Rezervasyon Talebi:*`,
      ``,
      `📅 *Tarih:* ${date}`,
      `👥 *Kişi:* ${adults} Yetişkin${children > 0 ? `, ${children} Çocuk` : ''} (Toplam ${totalPax} Kişi)`,
      `🏨 *Otel / Bölge:* ${hotel ? hotel.trim() : 'Belirtilmedi (Görüşmede netleşecek)'}`,
      `💰 *Tahmini Tutar:* ~${totalThb.toLocaleString('tr-TR')} THB (${formatDisplayPrice(totalThb, currency)})`,
      ``,
      `Tur programı, otel transfer saati ve müsaitlik durumu hakkında bilgi alabilir miyim?`,
    ];
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  return (
    <>
      {/* ==================================================== */}
      {/* 1. MOBİL SABİT (STICKY) ALT BAR */}
      {/* ==================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 p-3.5 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">KİŞİ BAŞI</span>
          <div className="flex items-baseline gap-1.5">
            <strong className="text-lg font-black text-amber-400 font-mono">
              {formatDisplayPrice(priceThb, currency)}
            </strong>
            {currency !== 'THB' && (
              <span className="text-[10px] text-slate-400">
                (฿ {priceThb.toLocaleString('tr-TR')})
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white font-black text-xs shadow-lg shadow-brand-accent/20 flex items-center gap-1.5 transition cursor-pointer"
        >
          <span>⚡</span>
          <span>Hızlı Rezervasyon</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 2. AÇILIR REZERVASYON ÇEKMECESİ (DRAWER / MODAL) */}
      {/* ==================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative">
            
            {/* Üst Başlık & Kapat Butonu */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand-accent uppercase tracking-wider block">
                  VIP HIZLI TEKLİF & REZERVASYON
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                  {tourTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Alanları */}
            <div className="space-y-4 text-xs">
              
              {/* Tarih Seçimi */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tur Tarihi
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-brand-accent"
                />
              </div>

              {/* Kişi Sayısı (Yetişkin & Çocuk) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Yetişkin</span>
                    <span className="text-amber-400 font-mono font-bold">{formatDisplayPrice(priceThb, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-white font-mono">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Çocuk (4-11)</span>
                    <span className="text-emerald-400 font-mono font-bold">-%30 İndirim</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-white font-mono">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold hover:bg-slate-800 transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Otel Adı (Opsiyonel) */}
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Otel Adı veya Bölgeniz <span className="text-slate-500 font-normal">(Opsiyonel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Örn: The Shore at Katathani veya Patong..."
                  value={hotel}
                  onChange={(e) => setHotel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-brand-accent"
                />
              </div>

            </div>

            {/* Toplam Hesaplama & WhatsApp CTA */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">TOPLAM TUTAR</span>
                <strong className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                  {formatDisplayPrice(totalThb, currency)}
                </strong>
                {currency !== 'THB' && (
                  <span className="text-[10px] text-slate-400 block">
                    (~{totalThb.toLocaleString('tr-TR')} THB)
                  </span>
                )}
              </div>

              <a
                href={generateWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>💬</span>
                <span>WhatsApp ile İlet</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
