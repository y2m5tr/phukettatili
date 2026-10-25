import { Camera, Image as ImageIcon } from 'lucide-react';
import type { HomeEditorPanelProps } from './types';

// SEKME 6: MİSAFİR ANILARI (INSTAGRAM GALERİSİ)
export default function MomentsPanel({
  homeSettings,
  setHomeSettings,
  getImageUrl,
  openPicker,
}: HomeEditorPanelProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-brand-accent" />
          <span>Misafirlerimizin Phuket Anıları (Instagram Vitrini)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Anasayfadaki 5 fotoğraf kartının görsellerini, etiketlerini ve konum bilgilerini özelleştirin.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Instagram Kullanıcı Adı</label>
          <input
            type="text"
            value={homeSettings?.guestMomentsBadge || '@phukettatili'}
            onChange={(e) => setHomeSettings({ ...homeSettings, guestMomentsBadge: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Bölüm Başlığı</label>
          <input
            type="text"
            value={homeSettings?.guestMomentsTitle || 'Misafirlerimizin Phuket Anıları'}
            onChange={(e) => setHomeSettings({ ...homeSettings, guestMomentsTitle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-1">Alt Açıklama</label>
          <input
            type="text"
            value={homeSettings?.guestMomentsSubtitle || 'Özel turlarımızda misafirlerimizin biriktirdiği gerçek anlar.'}
            onChange={(e) => setHomeSettings({ ...homeSettings, guestMomentsSubtitle: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((idx) => {
          const moments = homeSettings?.guestMoments || [];
          const m = moments[idx] || {
            image: idx === 0 ? 'couple.webp' : idx === 1 ? 'pileh.webp' : idx === 2 ? 'elephant.webp' : idx === 3 ? 'underwater.webp' : 'bay.webp',
            title: '',
            tag: '',
            location: '',
          };

          const updateMoment = (field: string, val: string) => {
            const updated = [...moments];
            updated[idx] = { ...m, [field]: val };
            setHomeSettings({ ...homeSettings, guestMoments: updated });
          };

          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                <img
                  src={getImageUrl(m.image)}
                  alt={m.title}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    openPicker(`Misafir Fotoğrafı #${idx + 1}`, m.image, (url) => updateMoment('image', url))
                  }
                  className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Seç</span>
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Etiket (Tag)</label>
                <input
                  type="text"
                  value={m.tag || ''}
                  onChange={(e) => updateMoment('tag', e.target.value)}
                  className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Başlık</label>
                <input
                  type="text"
                  value={m.title || ''}
                  onChange={(e) => updateMoment('title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Konum</label>
                <input
                  type="text"
                  value={m.location || ''}
                  onChange={(e) => updateMoment('location', e.target.value)}
                  className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
