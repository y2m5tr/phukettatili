import { useState, useEffect } from 'react';
import { Sparkles, Calendar, Users, Compass, Check, MessageCircle, X } from 'lucide-react';
import PublicErrorBoundary from '../ui/PublicErrorBoundary';

interface QuickTripAssistantProps {
  whatsappNumber?: string;
}

function QuickTripAssistantInner({ whatsappNumber = '66828950665' }: QuickTripAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState<'3' | '5' | '7'>('5');
  const [party, setParty] = useState<'couple' | 'family' | 'friends'>('couple');
  const [interest, setInterest] = useState<'islands' | 'yacht' | 'nature'>('islands');

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('ptt:trip-assistant:open', handleOpen);

    const onTriggerClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-open-trip-assistant], a[href*="tatil-asistani"], a[href*="tatil-sihirbazi"]');
      if (target) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener('click', onTriggerClick);

    return () => {
      window.removeEventListener('ptt:trip-assistant:open', handleOpen);
      document.removeEventListener('click', onTriggerClick);
    };
  }, []);

  const getPartyLabel = () => {
    if (party === 'couple') return 'Balayı & Çift';
    if (party === 'family') return 'Çocuklu Aile';
    return 'Arkadaş Grubu';
  };

  const getInterestLabel = () => {
    if (interest === 'islands') return 'Sürat Teknesi & Ada Turları';
    if (interest === 'yacht') return 'Lüks VIP Yat & Katamaran';
    return 'Etik Fil Parkı & Doğa';
  };

  const getRecommendedTours = () => {
    if (duration === '3') {
      return ['Phi Phi & Maya Bay Erken Çıkış', 'James Bond & Kano Mağara'];
    }
    if (duration === '5') {
      return ['Phi Phi & Bamboo Adası', 'James Bond & Phang Nga Körfezi', 'Etik Fil Parkı veya Racha Adası'];
    }
    return ['Phi Phi & Maya Bay VIP', 'Similan Adaları Şnorkel', 'James Bond Kano', 'Özel VIP Havalimanı Transferi'];
  };

  const handleWhatsAppSubmit = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const tours = getRecommendedTours();
    let msg = `Merhaba Phuket Tatili, Akıllı Asistan ile hazırladığım tatil planım için özel indirimli teklif almak istiyorum:\n\n`;
    msg += `🗓️ *Kalış Süresi:* ${duration} Gün\n`;
    msg += `👥 *Kişi Profili:* ${getPartyLabel()}\n`;
    msg += `🌴 *Tercih:* ${getInterestLabel()}\n\n`;
    msg += `🎯 *Önerilen Rota Listesi:*\n`;
    tours.forEach((t, idx) => {
      msg += `  ${idx + 1}. ${t}\n`;
    });
    msg += `\n🎁 Paket İndirimi ve müsaitlik hakkında yardımcı olabilir misiniz? Teşekkürler!`;

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 pb-8 sm:pb-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Üst Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                3 Adımda Akıllı Tatil Planlayıcı
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Size özel tur rotasını ve %15 paket indirimini oluşturun
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Adım 1: Süre */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-brand-accent" />
            <span>1. Phuket'te Kaç Gün Kalacaksınız?</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '3', label: '3 Gün', sub: 'Hızlı Kaçamak' },
              { id: '5', label: '5 Gün', sub: 'En Popüler ⭐' },
              { id: '7', label: '7+ Gün', sub: 'Tam Keşif' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDuration(d.id as any)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  duration === d.id
                    ? 'border-brand-accent bg-amber-500/10 dark:bg-amber-500/20 text-brand-accent font-bold ring-2 ring-brand-accent/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-sm font-bold">{d.label}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{d.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Adım 2: Profil */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-brand-accent" />
            <span>2. Kiminle Geliyorsunuz?</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'couple', emoji: '💑', label: 'Balayı & Çift' },
              { id: 'family', emoji: '👨‍👩‍👧', label: 'Aile & Çocuk' },
              { id: 'friends', emoji: '👥', label: 'Arkadaş Grubu' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setParty(p.id as any)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  party === p.id
                    ? 'border-brand-accent bg-amber-500/10 dark:bg-amber-500/20 text-brand-accent font-bold ring-2 ring-brand-accent/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-lg">{p.emoji}</div>
                <div className="text-xs font-bold mt-1">{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Adım 3: İlgi Alanı */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-brand-accent" />
            <span>3. Öncelikli Tatil Beklentiniz?</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'islands', emoji: '🏝️', label: 'Ada Turları' },
              { id: 'yacht', emoji: '🛥️', label: 'Lüks VIP Yat' },
              { id: 'nature', emoji: '🐘', label: 'Doğa & Fil' },
            ].map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setInterest(i.id as any)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  interest === i.id
                    ? 'border-brand-accent bg-amber-500/10 dark:bg-amber-500/20 text-brand-accent font-bold ring-2 ring-brand-accent/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-lg">{i.emoji}</div>
                <div className="text-xs font-bold mt-1">{i.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Özet ve WhatsApp CTA */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Önerilen Rotalarınız:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase">
              %15 Paket İndirimi Uygulanır
            </span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {getRecommendedTours().map((t, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleWhatsAppSubmit}
            className="w-full py-3.5 px-4 rounded-xl bg-whatsapp hover:bg-whatsapp-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Bu Planı WhatsApp'tan İndirimli İste</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuickTripAssistantDrawer(props: QuickTripAssistantProps) {
  return (
    <PublicErrorBoundary fallbackTitle="Tatil Planlayıcı Yüklenemedi">
      <QuickTripAssistantInner {...props} />
    </PublicErrorBoundary>
  );
}
