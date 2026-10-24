import React, { useState, useEffect } from 'react';
import { formatDisplayPrice, type DisplayCurrency } from '../../lib/siteCurrency';
import PromptPayQrModal from '../shared/PromptPayQrModal';

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
  const [isPromptPayOpen, setIsPromptPayOpen] = useState(false);
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [hotel, setHotel] = useState('');
  const [currency, setCurrency] = useState<DisplayCurrency>('THB');

  // Gönderim & Başarı Durumu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{
    ticketCode: string;
    ticketUrl: string;
    whatsAppUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

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

  const generateWhatsAppUrl = (ticketCode?: string) => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const displayDate = date ? date.split('-').reverse().join('/') : '';
    const lines = [
      `🌴 *Merhaba Phuket Tatili, ${tourTitle} Turu İçin Rezervasyon Talebi:*`,
      ``,
      ...(ticketCode ? [`🎫 *Referans Kodu:* ${ticketCode}`, ``] : []),
      ...(customerName ? [`👤 *İsim:* ${customerName.trim()}`] : []),
      `📅 *Tarih:* ${displayDate}`,
      `👥 *Kişi:* ${adults} Yetişkin${children > 0 ? `, ${children} Çocuk` : ''} (Toplam ${totalPax} Kişi)`,
      `🏨 *Otel / Bölge:* ${hotel ? hotel.trim() : 'Belirtilmedi (Görüşmede netleşecek)'}`,
      `💰 *Tahmini Tutar:* ~${totalThb.toLocaleString('tr-TR')} THB (${formatDisplayPrice(totalThb, currency)})`,
      ``,
      `Tur programı, otel transfer saati ve müsaitlik durumu hakkında bilgi alabilir miyim?`,
    ];
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handleSubmitBooking = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Lütfen isminizi ve soyisminizi giriniz.');
      return;
    }
    if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 7) {
      setErrorMessage('Lütfen geçerli bir WhatsApp telefon numarası giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          hotel: hotel.trim(),
          tourId,
          tourTitle,
          tourDate: date,
          adultCount: adults,
          childCount: children,
          totalPriceThb: totalThb,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setSubmitSuccess({
          ticketCode: data.ticketCode,
          ticketUrl: data.ticketUrl,
          whatsAppUrl: data.whatsAppUrl || generateWhatsAppUrl(data.ticketCode),
        });
        // WhatsApp görüşmesini anında yeni sekmede de aç
        if (typeof window !== 'undefined') {
          window.open(data.whatsAppUrl || generateWhatsAppUrl(data.ticketCode), '_blank', 'noopener,noreferrer');
        }
      } else {
        setErrorMessage(data.error || 'Talep gönderilemedi. Lütfen WhatsApp üzerinden doğrudan iletişime geçiniz.');
      }
    } catch {
      // Ağ hatasında doğrudan WhatsApp fallback
      window.open(generateWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const directWhatsAppUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `🌴 Merhaba Phuket Tatili, "${tourTitle}" turu hakkında detaylı bilgi ve güncel müsaitlik almak istiyorum.`
  )}`;

  return (
    <>
      {/* ==================================================== */}
      {/* 1. MOBİL SABİT (STICKY) ALT BAR */}
      {/* ==================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 p-3 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-2.5">
        <div className="min-w-0 pr-1">
          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-mono">
            {priceThb > 0 ? 'KİŞİ BAŞI' : 'FİYATLANDIRMA'}
          </span>
          <div className="flex items-baseline gap-1">
            {priceThb > 0 ? (
              <>
                <strong className="text-base font-black text-amber-400 font-mono truncate">
                  {formatDisplayPrice(priceThb, currency)}
                </strong>
                {currency !== 'THB' && (
                  <span className="text-[9px] text-slate-400">
                    (฿{priceThb.toLocaleString('tr-TR')})
                  </span>
                )}
              </>
            ) : (
              <strong className="text-xs font-bold text-amber-400">Teklif Alın</strong>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1 transition cursor-pointer"
            title="WhatsApp ile Sor"
          >
            <span className="text-sm">💬</span>
            <span className="hidden xs:inline">WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(null);
              setIsOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white font-bold text-xs shadow-lg shadow-brand-accent/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>⚡</span>
            <span>Rezervasyon</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. AÇILIR REZERVASYON ÇEKMECESİ (DRAWER / MODAL) */}
      {/* ==================================================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
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

            {submitSuccess ? (
              /* ==================================================== */
              /* BAŞARI GÖRÜNÜMÜ: BİLET KODU & WHATSAPP YÖNLENDİRME */
              /* ==================================================== */
              <div className="space-y-5 py-2 text-center animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center text-2xl border border-emerald-500/30">
                  ✓
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-1">
                    Rezervasyon Talebiniz Alındı!
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Talebiniz operasyon sistemimize kaydedildi. Canlı bilet ve transfer takibiniz için referans kodunuz oluşturuldu:
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 inline-block w-full">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Misafir Takip & Bilet Kodunuz
                  </div>
                  <div className="text-2xl font-mono font-black text-amber-400 tracking-wider">
                    {submitSuccess.ticketCode}
                  </div>
                  <a
                    href={submitSuccess.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-accent hover:underline block pt-1 font-semibold"
                  >
                    🎟️ Bilet Portalı ve Canlı Alınış Takibini Aç →
                  </a>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <a
                    href={submitSuccess.whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>💬</span>
                    <span>WhatsApp Görüşmesini Başlat</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsPromptPayOpen(true)}
                    className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>📱</span>
                    <span>PromptPay Canlı QR ile Öde</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            ) : (
              /* ==================================================== */
              /* REZERVASYON FORMU */
              /* ==================================================== */
              <form onSubmit={handleSubmitBooking} className="space-y-4 text-xs">
                
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
                    ⚠️ {errorMessage}
                  </div>
                )}

                {/* Misafir İletişim Bilgileri */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      İsminiz & Soyisminiz *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Ahmet Yılmaz"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      WhatsApp Numaranız *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Örn: 0532 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

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

                {/* Toplam Hesaplama & Gönder Butonu */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">TOPLAM TAHMİNİ TUTAR</span>
                    <strong className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                      {formatDisplayPrice(totalThb, currency)}
                    </strong>
                    {currency !== 'THB' && (
                      <span className="text-[10px] text-slate-400 block">
                        (~{totalThb.toLocaleString('tr-TR')} THB)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-xl shadow-brand-accent/25 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <span>⚡</span>
                      <span>{isSubmitting ? 'Kaydediliyor...' : 'Talebi Gönder & Bilet Al'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {isPromptPayOpen && (
        <PromptPayQrModal
          isOpen={isPromptPayOpen}
          onClose={() => setIsPromptPayOpen(false)}
          bookingRef={submitSuccess?.ticketCode || 'WEB-BOOKING'}
          customerName={customerName}
          initialAmountThb={totalThb}
          promptPayTarget={whatsappNumber}
          showToast={(msg) => alert(msg)}
        />
      )}
    </>
  );
}
