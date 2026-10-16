import React, { useState, useEffect } from 'react';
import {
  TRAVELER_PROFILES,
  VACATION_VIBES,
  TRIP_DURATIONS,
  buildWizardRecommendation,
  generateWizardWhatsAppUrl,
  type TravelerProfile,
  type VacationVibe,
  type TripDuration,
  type TourCandidate,
  type WizardRecommendation,
} from '../../lib/tourWizard';
import { formatDisplayPrice, type DisplayCurrency } from '../../lib/siteCurrency';

interface HomeTourWizardProps {
  tours?: TourCandidate[];
  whatsappNumber?: string;
  title?: string;
  subtitle?: string;
}

export default function HomeTourWizard({
  tours = [],
  whatsappNumber = '66828950665',
  title = 'Phuket Tatil Asistanı: Size Özel İdeal Rota',
  subtitle = '3 adımda seyahat tarzınızı seçin, uzman rehberlerimizin sizin için hazırladığı en iyi tur kombinasyonunu anında görün.',
}: HomeTourWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedProfile, setSelectedProfile] = useState<TravelerProfile>('honeymoon');
  const [selectedVibe, setSelectedVibe] = useState<VacationVibe>('luxury_catamaran');
  const [selectedDuration, setSelectedDuration] = useState<TripDuration>('medium');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [currency, setCurrency] = useState<DisplayCurrency>('THB');

  // Sayfa para birimi değişimini dinle
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

  const recommendation: WizardRecommendation = buildWizardRecommendation(
    selectedProfile,
    selectedVibe,
    selectedDuration,
    tours
  );

  const whatsappUrl = generateWizardWhatsAppUrl(recommendation, guestCount, whatsappNumber);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="tatil-asistani">
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Başlık */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-accent/10 border border-brand-accent/30 text-brand-accent">
            <span>🧭</span>
            <span>KİŞİYE ÖZEL ROTA SİHİRBAZI</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400">
            {subtitle}
          </p>

          {/* Adım İlerleme Çubuğu */}
          <div className="flex items-center justify-center gap-3 pt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-2 text-xs font-bold transition-all ${
                  step === s
                    ? 'text-brand-accent scale-105'
                    : step > s
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                    step === s
                      ? 'bg-brand-accent text-white shadow-md shadow-brand-accent/30'
                      : step > s
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > s ? '✓' : s}
                </span>
                <span className="hidden sm:inline">
                  {s === 1 ? 'Seyahat Tipi' : s === 2 ? 'Tatil Ritmi' : 'Süre'}
                </span>
                {s < 3 && <span className="text-slate-700">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================== */}
        {/* ADIM 1: SEYAHAT PROFİLİ */}
        {/* ==================================================== */}
        {step === 1 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <h3 className="text-center text-sm font-bold uppercase tracking-wider text-slate-300">
              Adım 1: Phuket'i Kiminle Geziyorsunuz?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRAVELER_PROFILES.map((p) => {
                const isSelected = selectedProfile === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProfile(p.id);
                      setStep(2);
                    }}
                    className={`p-6 rounded-2xl border text-left transition-all cursor-pointer group flex items-start gap-4 ${
                      isSelected
                        ? 'bg-brand-accent/10 border-brand-accent shadow-lg shadow-brand-accent/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                      {p.icon}
                    </span>
                    <div className="space-y-1">
                      <strong className="text-sm sm:text-base font-bold text-white block">
                        {p.title}
                      </strong>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ADIM 2: TATİL RİTMİ */}
        {/* ==================================================== */}
        {step === 2 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                ← Geri
              </button>
              <h3 className="text-center text-sm font-bold uppercase tracking-wider text-slate-300">
                Adım 2: Tercih Ettiğiniz Tatil Ritmi Nedir?
              </h3>
              <div className="w-12"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VACATION_VIBES.map((v) => {
                const isSelected = selectedVibe === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setSelectedVibe(v.id);
                      setStep(3);
                    }}
                    className={`p-6 rounded-2xl border text-left transition-all cursor-pointer group flex items-start gap-4 ${
                      isSelected
                        ? 'bg-brand-accent/10 border-brand-accent shadow-lg shadow-brand-accent/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                      {v.icon}
                    </span>
                    <div className="space-y-1">
                      <strong className="text-sm sm:text-base font-bold text-white block">
                        {v.title}
                      </strong>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {v.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ADIM 3: SÜRE */}
        {/* ==================================================== */}
        {step === 3 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer"
              >
                ← Geri
              </button>
              <h3 className="text-center text-sm font-bold uppercase tracking-wider text-slate-300">
                Adım 3: Phuket'te Kaç Gün Geçireceksiniz?
              </h3>
              <div className="w-12"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TRIP_DURATIONS.map((d) => {
                const isSelected = selectedDuration === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setSelectedDuration(d.id);
                      setStep(4);
                    }}
                    className={`p-6 rounded-2xl border text-center transition-all cursor-pointer group space-y-2 ${
                      isSelected
                        ? 'bg-brand-accent/10 border-brand-accent shadow-lg shadow-brand-accent/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <span className="text-3xl block">{d.icon}</span>
                    <strong className="text-base font-bold text-white block">
                      {d.title}
                    </strong>
                    <p className="text-xs text-slate-400">
                      {d.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* ADIM 4: KİŞİSELLEŞTİRİLMİŞ TAVSİYE KARTI */}
        {/* ==================================================== */}
        {step === 4 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            
            {/* Paket Kartı */}
            <div className="bg-slate-950 p-6 sm:p-10 rounded-3xl border border-brand-accent/40 shadow-2xl relative space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-accent/10 text-brand-accent border border-brand-accent/30 inline-block">
                    {recommendation.packageBadge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
                    {recommendation.packageTitle}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {recommendation.packageSummary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition shrink-0 cursor-pointer"
                >
                  🔄 Seçimleri Değiştir
                </button>
              </div>

              {/* Turlar Listesi */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  PAKETE DAHİL EDİLEN TURLAR ({recommendation.recommendedTours.length} TUR):
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recommendation.recommendedTours.map((tour, idx) => (
                    <div
                      key={tour.id || idx}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <span className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent font-bold text-xs flex items-center justify-center mb-2 font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {tour.title}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">Kişi Başı</span>
                        <strong className="text-amber-400 font-black">
                          {formatDisplayPrice(tour.priceThb, currency)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ayrıcalıklar / Dahil Olanlar */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono uppercase">
                  <span>✓</span>
                  <span>Özel VIP Hizmet Standartları</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {recommendation.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fiyatlandırma & WhatsApp CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-4 border-t border-slate-800">
                
                {/* Kişi Sayısı Seçimi */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300 uppercase font-mono">Misafir:</span>
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                    {[1, 2, 4, 6].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setGuestCount(count)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          guestCount === count
                            ? 'bg-brand-accent text-white font-black shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {count} Kişi
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fiyat & WhatsApp Butonu */}
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">
                      TOPLAM PAKET ({guestCount} Kişi)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-slate-500 line-through">
                        {formatDisplayPrice(recommendation.totalPriceThb * guestCount, currency)}
                      </span>
                      <strong className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                        {formatDisplayPrice(recommendation.discountedPriceThb * guestCount, currency)}
                      </strong>
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#128C7E] text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>💬</span>
                    <span>Bu Rotayı WhatsApp'tan Talep Et</span>
                  </a>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
}
