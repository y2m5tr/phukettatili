import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Wind, Waves, Compass, Sparkles, MessageCircle } from 'lucide-react';
import { getLiveTourSafetyRadar, type LiveRadarReport, } from '../../lib/tourSafetyRadar';

export default function LiveTourSafetyRadar() {
  const [report, setReport] = useState<LiveRadarReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'island_speedboat' | 'protected_bay' | 'inland_adventure' | 'evening_entertainment'>('all');

  useEffect(() => {
    let mounted = true;
    getLiveTourSafetyRadar()
      .then((data) => {
        if (mounted) {
          setReport(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !report) {
    return (
      <div className="w-full max-w-6xl mx-auto my-8 p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="h-6 w-48 bg-slate-300 dark:bg-slate-800 rounded-md mb-4" />
        <div className="h-20 w-full bg-slate-200 dark:bg-slate-800/60 rounded-2xl" />
      </div>
    );
  }

  const { marineReport, generalVerdict, generalTitle, generalAdvice, evaluations } = report;

  const filteredEvaluations = evaluations.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.categoryGroup === activeFilter;
  });

  const getWhatsAppInquiryUrl = (tourTitle: string, badge: string) => {
    const text = `Merhaba Phuket Tatili! 🌴 Canlı Tur Güvenlik Radarınızda gördüğüm "${tourTitle}" (${badge}) için güncel deniz durumu ve müsaitlik hakkında bilgi alabilir miyim?`;
    return `https://wa.me/66828950665?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="w-full max-w-6xl mx-auto my-10 px-4 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800/80 shadow-2xl overflow-hidden relative">
        {/* Dekoratif Işıma */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-6 sm:p-8 relative z-10 space-y-6">
          {/* Başlık ve Canlı Durum Rozeti */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Canlı Andaman Denizi & Seyir Güvenlik Radarı
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2.5">
                <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                <span>Günün Güvenli Tur ve Rota Rehberi</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Phuket Liman Başkanlığı ve uydu dalga metrikleriyle canlı eşleşir; rüzgar ve dalgaya göre aileniz için en konforlu turları listeler.
              </p>
            </div>

            {/* Canlı Deniz Metrikleri Kartı */}
            <div className="grid grid-cols-3 gap-2 bg-slate-800/70 p-3 rounded-2xl border border-slate-700/60 text-center shrink-0">
              <div className="px-2">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                  <Waves className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dalga</span>
                </div>
                <div className="text-sm sm:text-base font-bold font-mono text-cyan-300 mt-0.5">
                  {marineReport.waveHeightMeters} m
                </div>
              </div>

              <div className="px-2 border-x border-slate-700/60">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                  <Wind className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rüzgar</span>
                </div>
                <div className="text-sm sm:text-base font-bold font-mono text-amber-300 mt-0.5">
                  {marineReport.windSpeedKnots} kn
                </div>
              </div>

              <div className="px-2">
                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 uppercase font-semibold">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Yön</span>
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-emerald-300 mt-1 truncate">
                  {marineReport.windDirectionText.split(' ')[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Genel Tavsiye Bannerı */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              generalVerdict === 'action_needed'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                : generalVerdict === 'moderate'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {generalVerdict === 'action_needed' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold">{generalTitle}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{generalAdvice}</p>
            </div>
          </div>

          {/* Kategori Filtreleri */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Tüm Turlar' },
              { id: 'island_speedboat', label: '🏝️ Açık Deniz Adaları (Phi Phi / Similan)' },
              { id: 'protected_bay', label: '🛶 Sakin İç Körfez (James Bond)' },
              { id: 'inland_adventure', label: '🐘 Doğa & Macera (Fil / ATV)' },
              { id: 'evening_entertainment', label: '🎭 Şov & Akşam' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tur Kartları Izgarası */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
            {filteredEvaluations.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badgeText}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Konfor: <strong className="text-white">{item.suitabilityScore}%</strong>
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {item.tourTitle}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {item.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 truncate">
                    {item.departurePier ? `⚓ ${item.departurePier}` : '🚐 Otel Lobisinden Alış'}
                  </span>

                  <a
                    href={getWhatsAppInquiryUrl(item.tourTitle, item.badgeText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Sor / Rezerve Et</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
