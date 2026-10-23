import { useState } from 'react';
import { Sparkles, Check, Plus, MessageCircle, ShieldCheck, Car, Compass } from 'lucide-react';

interface BundleAddon {
  id: string;
  title: string;
  tagline: string;
  regularPrice: number;
  bundlePrice: number;
  icon: 'car' | 'island' | 'nature';
}

interface TourSmartBundleProps {
  currentTourTitle: string;
  currentTourPrice?: number;
  whatsappNumber?: string;
}

export default function TourSmartBundle({
  currentTourTitle,
  currentTourPrice = 0,
  whatsappNumber = '66828950665',
}: TourSmartBundleProps) {
  const isPhiPhi = currentTourTitle.toLowerCase().includes('phi phi');
  const isJamesBond = currentTourTitle.toLowerCase().includes('james bond');

  const secondTourAddon: BundleAddon = isPhiPhi
    ? {
        id: 'james-bond',
        title: 'James Bond Adası & Kano Mağara Keşfi',
        tagline: 'Phang Nga Körfezi\'nin sakin koyları ve kano safari macerası',
        regularPrice: 2900,
        bundlePrice: 2600,
        icon: 'island',
      }
    : isJamesBond
    ? {
        id: 'phi-phi',
        title: 'Phi Phi, Maya Bay & Bamboo Adası Turu',
        tagline: 'Turkuaz lagünler, efsanevi Maya Bay ve şnorkel resifleri',
        regularPrice: 3200,
        bundlePrice: 2850,
        icon: 'island',
      }
    : {
        id: 'elephant',
        title: 'Etik Fil Koruma, Besleme & Bakım',
        tagline: 'Fillerle doğal ortamında sevgi dolu bir gün ve çamur banyosu',
        regularPrice: 2500,
        bundlePrice: 2250,
        icon: 'nature',
      };

  const addons: BundleAddon[] = [
    {
      id: 'airport-transfer',
      title: 'Havalimanı ⇄ Otel VIP Minibüs Transferi',
      tagline: 'Uçak inişinde isminizle karşılama, klimalı konforlu özel araç',
      regularPrice: 1400,
      bundlePrice: 1100,
      icon: 'car',
    },
    secondTourAddon,
  ];

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([addons[0].id]);

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedAddons = addons.filter((a) => selectedAddonIds.includes(a.id));
  const basePrice = currentTourPrice > 0 ? currentTourPrice : 0;
  const addonsRegularTotal = selectedAddons.reduce((sum, a) => sum + a.regularPrice, 0);
  const addonsBundleTotal = selectedAddons.reduce((sum, a) => sum + a.bundlePrice, 0);
  const totalSavings = addonsRegularTotal - addonsBundleTotal;

  const totalBundlePrice = basePrice + addonsBundleTotal;

  // WhatsApp mesajı oluştur
  const constructWhatsAppUrl = () => {
    const selectedNames = selectedAddons.map((a) => a.title).join(' + ');
    const message =
      selectedAddons.length > 0
        ? `Merhaba! ${currentTourTitle} turunun yanına avantajlı paket olarak [ ${selectedNames} ] ekleyip paket rezervasyon teklifi almak istiyorum.`
        : `Merhaba, ${currentTourTitle} turu için uygunluk durumu ve fiyat teklifi almak istiyorum.`;

    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="mt-12 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900 border border-amber-500/30 text-white shadow-xl relative overflow-hidden">
      {/* Arka plan dekoratif parıltı */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AKILLI TATİL PAKETİ (BİRLİKTE ALIN, KAZANIN)</span>
          </div>
          {totalSavings > 0 && (
            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 shadow-xs">
              🎉 {totalSavings.toLocaleString()} THB Paket Tasarrufu
            </span>
          )}
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
          Bu Turu Alan Gezginler En Çok Nelerle Birleştiriyor?
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm mb-6 max-w-2xl leading-relaxed">
          Tatilinizi parça parça aramak yerine en popüler transfer ve ada deneyimlerini birleştirerek hem zaman kazanın hem de özel paket indiriminden yararlanın.
        </p>

        {/* Eklenti Seçenekleri Listesi */}
        <div className="space-y-3 mb-6">
          {addons.map((addon) => {
            const isSelected = selectedAddonIds.includes(addon.id);
            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 font-black" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        {addon.icon === 'car' ? <Car className="w-3 h-3" /> : <Compass className="w-3 h-3" />}
                        {addon.icon === 'car' ? 'VIP Transfer' : 'Deneyim Turu'}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-white truncate">
                      {addon.title}
                    </h4>
                    <p className="text-slate-400 text-xs truncate hidden sm:block mt-0.5">
                      {addon.tagline}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-black text-amber-300 font-mono">
                    +{addon.bundlePrice.toLocaleString()} THB
                  </div>
                  <div className="text-[11px] text-slate-500 line-through font-mono">
                    {addon.regularPrice.toLocaleString()} THB
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alt Toplam & WhatsApp Butonu */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
              Paket Özeti
            </span>
            <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{currentTourTitle}</span>
              {selectedAddons.length > 0 && (
                <span className="text-xs font-semibold text-amber-400">
                  + {selectedAddons.length} Hizmet
                </span>
              )}
            </div>
          </div>

          <a
            href={constructWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 transform hover:-translate-y-0.5 cursor-pointer shrink-0"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Paket Teklifini WhatsApp'tan Al</span>
          </a>
        </div>
      </div>
    </div>
  );
}
