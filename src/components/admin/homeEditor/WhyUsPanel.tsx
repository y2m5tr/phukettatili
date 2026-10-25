import { Image as ImageIcon, Star } from 'lucide-react';
import type { HomeEditorPanelProps } from './types';

// SEKME 4: NEDEN PHUKET TATİLİ? (WHY US - 3 KART)
export default function WhyUsPanel({
  homeSettings,
  setHomeSettings,
  getImageUrl,
  openPicker,
}: HomeEditorPanelProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          <span>Neden Phuket Tatili? (3 Özellik Kartı)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Bölüm başlıklarını ve 3 özelliğin görsellerini, rozetlerini, başlık ve açıklamalarını düzenleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Üst Rozet Metni</label>
          <input
            type="text"
            value={homeSettings?.whyUsBadge || '★ Neden Phuket Tatili?'}
            onChange={(e) => setHomeSettings({ ...homeSettings, whyUsBadge: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Bölüm Ana Başlığı</label>
          <input
            type="text"
            value={homeSettings?.whyUsTitle || 'Ayrıcalıklı, Güvenli ve Tamamen Size Özel'}
            onChange={(e) => setHomeSettings({ ...homeSettings, whyUsTitle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Bölüm Alt Açıklaması</label>
          <input
            type="text"
            value={homeSettings?.whyUsSubtitle || 'Standart turların karmaşasından uzak, yerel ekibimizle her anınız güvence altında.'}
            onChange={(e) => setHomeSettings({ ...homeSettings, whyUsSubtitle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1, 2].map((idx) => {
          const cards = homeSettings?.whyUsCards || [];
          const c = cards[idx] || {
            badge: idx === 0 ? 'Tam Güvence' : idx === 1 ? 'Yerel Ekip' : 'Ayrıcalıklı Rota',
            title: idx === 0 ? 'Güvenli Seyahat' : idx === 1 ? '7/24 Türkçe Destek' : 'VIP Deneyim',
            desc: '',
            image: idx === 0 ? 'beach.webp' : idx === 1 ? 'culture.webp' : 'yacht.webp',
          };

          const updateCard = (field: string, val: string) => {
            const updated = [...cards];
            updated[idx] = { ...c, [field]: val };
            setHomeSettings({ ...homeSettings, whyUsCards: updated });
          };

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                <img
                  src={getImageUrl(c.image)}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    openPicker(`Kart ${idx + 1} Fotoğrafı Seç`, c.image, (url) => updateCard('image', url))
                  }
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Görsel Seç</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Üst Rozet</label>
                <input
                  type="text"
                  value={c.badge || ''}
                  onChange={(e) => updateCard('badge', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Kart Başlığı</label>
                <input
                  type="text"
                  value={c.title || ''}
                  onChange={(e) => updateCard('title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Açıklama</label>
                <textarea
                  rows={3}
                  value={c.desc || ''}
                  onChange={(e) => updateCard('desc', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
