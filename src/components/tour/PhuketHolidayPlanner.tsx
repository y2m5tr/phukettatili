import { useState } from 'react';
import { Sparkles, Calendar, Heart, Users, CheckCircle2, MessageCircle, } from 'lucide-react';
import {
  generateHolidayPackage,
  generatePackageWhatsAppMessage,
  type PackageDuration,
  type TravelStyle,
} from '../../lib/holidayPlanner';
// `publicRefs` bilerek seçildi: adminInitialData tohum verisi (müşteri adı,
// pasaport, tedarikçi maliyeti, acente komisyonu) taşır ve buradan import
// edilirse Vite onu ana sayfanın client bundle'ına koyar — auth'suz statik
// asset olarak herkese açık servis edilir.
import { HOTEL_ZONES } from '../../lib/publicRefs';
import { fmtMoney } from '../../lib/moneyFormat';

export default function PhuketHolidayPlanner() {
  const [duration, setDuration] = useState<PackageDuration>(5);
  const [style, setStyle] = useState<TravelStyle>('honeymoon');
  const [zone, setZone] = useState<string>('Patong & Kalim');

  const plan = generateHolidayPackage(duration, style, zone);

  const handleWhatsAppClick = () => {
    const text = generatePackageWhatsAppMessage(plan);
    const url = `https://wa.me/66828950665?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="tatil-sihirbazi" className="w-full max-w-6xl mx-auto my-12 px-4 sm:px-6">
      <div className="rounded-3xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
        {/* Başlık Bölümü */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kişiselleştirilmiş Tatil Sihirbazı</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 dark:text-white">
            Kendi Phuket Tatilini Kendin Yarat
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Kalış sürenizi ve seyahat tarzınızı seçin; uzman operasyon ekibimizin hazırladığı mükemmel dengelenmiş tur takvimi ve %15'e varan paket indirimi anında ekranınıza gelsin.
          </p>
        </div>

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
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
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
                  🎁 %{plan.discountPercentage} Paket İndirimi
                </span>
                <span className="text-xs text-slate-500">{plan.duration} Günlük Akıllı Rota</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                {plan.packageName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {plan.packageDescription}
              </p>
            </div>

            {/* Fiyatlama Kutusu */}
            <div className="text-left sm:text-right shrink-0 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="text-xs text-slate-400 line-through">
                Ayrı Ayrı: {fmtMoney(plan.totalIndividualPriceThb)} ฿
              </div>
              <div className="text-2xl font-black text-brand-primary dark:text-amber-400 font-mono">
                {fmtMoney(plan.finalPackagePriceThb)} ฿
              </div>
              <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Kişi Başı {fmtMoney(plan.discountAmountThb)} ฿ Tasarruf!
              </div>
            </div>
          </div>

          {/* Gün Gün Rota Zaman Çizelgesi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              📅 Günlük Tur Akışı ve Zaman Çizelgesi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {plan.itinerary.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-brand-primary text-white">
                        {day.dayNumber}. Gün
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">
                        ⏰ {day.timeSlot}
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {day.tourTitle}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {day.highlight}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Otelden Lobi Alışı</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Dahil</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Ücretsiz iptal garantisi · Rehberlik desteği · Türkçe asistanlık</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Bu Paketi WhatsApp'tan Al / Özelleştir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
