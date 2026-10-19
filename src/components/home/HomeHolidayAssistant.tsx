import { useState, useEffect } from 'react';
import { Sparkles, Calendar, Heart, Users, CheckCircle2, MessageCircle, Compass } from 'lucide-react';
import {
  generateHolidayPackage,
  generatePackageWhatsAppMessage,
  type PackageDuration,
  type TravelStyle,
} from '../../lib/holidayPlanner';
import { HOTEL_ZONES } from '../../lib/publicRefs';
import {
  TRAVELER_PROFILES,
  VACATION_VIBES,
  buildWizardRecommendation,
  generateWizardWhatsAppUrl,
  type TravelerProfile,
  type VacationVibe,
  type TourCandidate,
  type WizardRecommendation,
} from '../../lib/tourWizard';
import { formatDisplayPrice, type DisplayCurrency } from '../../lib/siteCurrency';

interface HomeHolidayAssistantProps {
  tours?: TourCandidate[];
  whatsappNumber?: string;
}

export default function HomeHolidayAssistant({
  tours = [],
  whatsappNumber = '66828950665',
}: HomeHolidayAssistantProps) {
  // Aktif Sekme: 'package' (Çok Günlü Paket) | 'single' (Tekil Tur Sihirbazı)
  const [activeTab, setActiveTab] = useState<'package' | 'single'>('package');

  // Paket Planlayıcı Durumu
  const [duration, setDuration] = useState<PackageDuration>(5);
  const [style, setStyle] = useState<TravelStyle>('honeymoon');
  const [zone, setZone] = useState<string>('Patong & Kalim');

  // Tur Sihirbazı Durumu
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedProfile, setSelectedProfile] = useState<TravelerProfile>('honeymoon');
  const [selectedVibe, setSelectedVibe] = useState<VacationVibe>('luxury_catamaran');
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

  // Hesaplamalar
  const packagePlan = generateHolidayPackage(duration, style, zone);
  const handlePackageWhatsApp = () => {
    const text = generatePackageWhatsAppMessage(packagePlan);
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const wizardRecommendation: WizardRecommendation = buildWizardRecommendation(
    selectedProfile,
    selectedVibe,
    'medium',
    tours
  );
  const wizardWhatsAppUrl = generateWizardWhatsAppUrl(wizardRecommendation, 2, whatsappNumber);

  return (
    <section id="tatil-asistani" className="w-full max-w-6xl mx-auto my-16 px-4 sm:px-6">
      <div className="rounded-3xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-10 space-y-8">
        
        {/* Üst Başlık & Sekme Geçişi */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kişiselleştirilmiş Phuket Tatil Asistanı</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Tatilinizi Uzman Dokunuşuyla Planlayın
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-light">
            İster günler süren dengeli bir paket program oluşturun, ister seyahat tarzınıza göre en iyi rotayı saniyeler içinde keşfedin.
          </p>

          {/* Sekme Değiştirici Butonlar */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('package')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'package'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🌴 Çok Günlü Paket Planlayıcı</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                %15 İndirim
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'single'
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4 text-brand-accent" />
              <span>🎯 Hızlı Tur Tavsiye Sihirbazı</span>
            </button>
          </div>
        </div>

        {/* MOD 1: Çok Günlü Paket Planlayıcı */}
        {activeTab === 'package' && (
          <div className="space-y-8">
            {/* 3 Adımlı Filtre Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Adım 1: Kalış Süresi */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                  <span>1. Kalış Süreniz</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 3 as PackageDuration, label: '3 Gün', sub: 'Hızlı Kaçamak' },
                    { val: 5 as PackageDuration, label: '5 Gün', sub: 'En Popüler ⭐' },
                    { val: 7 as PackageDuration, label: '7 Gün', sub: 'Eksiksiz Adalar' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setDuration(item.val)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        duration === item.val
                          ? 'bg-brand-primary text-white border-brand-primary shadow-md scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-primary/40'
                      }`}
                    >
                      <div className="text-sm font-extrabold">{item.label}</div>
                      <div className={`text-[10px] mt-0.5 ${duration === item.val ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Adım 2: Seyahat Tarzı */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>2. Seyahat Tarzınız</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'honeymoon' as TravelStyle, label: '💑 Balayı / Çift', desc: 'Romantik & Rahat' },
                    { id: 'family' as TravelStyle, label: '👨‍👩‍👧‍👦 Aile & Çocuk', desc: 'Yormayan & Güvenli' },
                    { id: 'adventure' as TravelStyle, label: '⚡ Macera & Doğa', desc: 'Hız & Adrenalin' },
                    { id: 'vip_luxury' as TravelStyle, label: '👑 VIP & Lüks', desc: 'Özel Yat & Konfor' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStyle(item.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        style === item.id
                          ? 'bg-brand-primary text-white border-brand-primary shadow-md scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-primary/40'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{item.label}</div>
                      <div className={`text-[10px] mt-0.5 truncate ${style === item.id ? 'text-white/80' : 'text-slate-400'}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Adım 3: Otel Bölgesi */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>3. Otel Bölgeniz</span>
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/40 cursor-pointer"
                >
                  {HOTEL_ZONES.map((z) => (
                    <option key={z} value={z}>
                      📍 {z}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  * Otel transferleriniz seçilen bölgeden klimalı VIP araçlarla lobiden alınış olarak planlanır.
                </p>
              </div>
            </div>

            {/* Üretilen Paket Çıktısı */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      🎁 %{packagePlan.discountPercentage} Paket İndirimi
                    </span>
                    <span className="text-xs text-slate-500">{packagePlan.duration} Günlük Akıllı Rota</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                    {packagePlan.packageName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {packagePlan.packageDescription}
                  </p>
                </div>

                {/* Fiyatlama Kutusu */}
                <div className="text-left sm:text-right shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                  <div className="text-xs text-slate-400 line-through">
                    Ayrı Ayrı: {packagePlan.totalIndividualPriceThb.toLocaleString()} ฿
                  </div>
                  <div className="text-2xl font-black text-brand-primary dark:text-amber-400 font-mono">
                    {packagePlan.finalPackagePriceThb.toLocaleString()} ฿
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Kişi Başı {packagePlan.discountAmountThb.toLocaleString()} ฿ Tasarruf!
                  </div>
                </div>
              </div>

              {/* Gün Gün Rota Akışı */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {packagePlan.itinerary.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary text-[10px]">
                        GÜN {day.dayNumber}
                      </span>
                      <span>{day.timeSlot}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-800 dark:text-white">
                      {day.dayTitle}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {day.highlight}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp Butonu */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Ücretsiz iptal & değişiklik hakkı, Türkçe rehberlik ve transfer dahil.</span>
                </div>

                <button
                  type="button"
                  onClick={handlePackageWhatsApp}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Bu Paketi WhatsApp'tan Ayırt</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MOD 2: Kişiye Özel Tur Sihirbazı */}
        {activeTab === 'single' && (
          <div className="space-y-8">
            {/* Adım İlerleyiş Göstergesi */}
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setWizardStep(s as 1 | 2 | 3)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    wizardStep === s
                      ? 'bg-brand-accent text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{s}. {s === 1 ? 'Kimsiniz?' : s === 2 ? 'Tarzınız' : 'Öneri'}</span>
                </button>
              ))}
            </div>

            {/* Adım 1: Kiminle Seyahat Ediyorsunuz? */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Phuket'e kiminle seyahat ediyorsunuz?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Size en uygun tur dinamiğini seçin</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TRAVELER_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProfile(p.id);
                        setWizardStep(2);
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        selectedProfile === p.id
                          ? 'bg-brand-primary text-white border-brand-primary shadow-md scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-primary/40'
                      }`}
                    >
                      <div className="text-2xl mb-1">{p.icon}</div>
                      <div className="text-xs font-bold">{p.title}</div>
                      <div className={`text-[10px] mt-0.5 ${selectedProfile === p.id ? 'text-white/80' : 'text-slate-400'}`}>
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Adım 2: Nasıl Bir Tatil Havası İstiyorsunuz? */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Nasıl bir deneyim arıyorsunuz?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Gününüzü nasıl geçirmek istediğinizi seçin</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {VACATION_VIBES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVibe(v.id);
                        setWizardStep(3);
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                        selectedVibe === v.id
                          ? 'bg-brand-primary text-white border-brand-primary shadow-md scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-primary/40'
                      }`}
                    >
                      <div className="text-2xl mb-1">{v.icon}</div>
                      <div className="text-xs font-bold">{v.title}</div>
                      <div className={`text-[10px] mt-0.5 ${selectedVibe === v.id ? 'text-white/80' : 'text-slate-400'}`}>
                        {v.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
                  >
                    ← Önceki Adıma Dön
                  </button>
                </div>
              </div>
            )}

            {/* Adım 3: Öneri Kartı */}
            {wizardStep === 3 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        ⭐ {wizardRecommendation.packageBadge || 'Kişiye Özel Rota'}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                      {wizardRecommendation.packageTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {wizardRecommendation.packageSummary}
                    </p>
                  </div>

                  {wizardRecommendation.discountedPriceThb > 0 && (
                    <div className="text-left sm:text-right shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                      <div className="text-xs text-slate-400">İndirimli Paket Fiyatı</div>
                      <div className="text-2xl font-black text-brand-primary dark:text-amber-400 font-mono">
                        {formatDisplayPrice(wizardRecommendation.discountedPriceThb, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400">Kişi başı yaklaşık</div>
                    </div>
                  )}
                </div>

                {/* Öne Çıkan Özellikler */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wizardRecommendation.perks.map((perk: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                {/* WhatsApp Butonu & Yeniden Başla */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="text-xs font-bold text-brand-accent hover:underline cursor-pointer"
                  >
                    🔄 Farklı Bir Seçim Yap
                  </button>

                  <a
                    href={wizardWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp'tan Detaylı Bilgi Al</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
