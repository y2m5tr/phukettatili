import { Image as ImageIcon } from 'lucide-react';
import type { HomeEditorPanelProps } from './types';

// SEKME 2: HERO & SLAYTLAR (4 FOTOĞRAF)
export default function HeroPanel({
  homeSettings,
  setHomeSettings,
  getImageUrl,
  openPicker,
}: HomeEditorPanelProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-brand-accent" />
          <span>Hero Karşılama Alanı & Slider Fotoğrafları</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Anasayfa açıldığında ziyaretçiyi karşılayan büyük manşet, açıklama, butonlar ve döner 4 arka plan fotoğrafı.
        </p>
      </div>

      <div className="space-y-4">

      {/* Canlı Hero Önizleme: metin, vurgu, CTA ve arka plan değişimlerini
          kaydetmeden gerçek hero kompozisyonuna yakın biçimde gösterir. */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Canlı Hero Önizleme
          </span>
          <span className="text-[10px] text-slate-400">Kaydetmeden görsel sonuç</span>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 aspect-[16/7]">
          {(() => {
            const firstImage = homeSettings?.heroSliderImages?.[0] || 'phuket_hero.webp';
            return (
              <img
                src={getImageUrl(firstImage)}
                alt="Hero önizleme arka planı"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                }}
              />
            );
          })()}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/25" />
          <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-center">
            <div className="max-w-2xl">
              {(() => {
                const title = homeSettings?.heroTitle || "Phuket'in Büyüsünü Keşfedin";
                const accent = homeSettings?.heroTitleAccent || '';
                const parts = accent && title.includes(accent)
                  ? title.split(accent)
                  : null;
                return (
                  <div className="font-serif text-white text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
                    {parts ? (
                      <>
                        <span>{parts[0]}</span>
                        <span className="text-amber-400 italic">{accent}</span>
                        <span>{parts.slice(1).join(accent)}</span>
                      </>
                    ) : (
                      title
                    )}
                  </div>
                );
              })()}
              <p className="mt-3 text-slate-200 text-xs sm:text-sm max-w-lg">
                {homeSettings?.heroSubtitle || 'Size özel tasarlanmış turlar, gizli kalmış cennet koylar ve unutulmaz anılar.'}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="px-4 py-2 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
                  {homeSettings?.heroCtaPrimaryText || 'Turları İncele'}
                </span>
                <span className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/30 text-xs font-semibold">
                  {homeSettings?.heroCtaSecondaryText || "WhatsApp'tan Ulaşın"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
            Büyük Başlık (Hero Title)
          </label>
          <input
            type="text"
            value={homeSettings?.heroTitle || ''}
            onChange={(e) => setHomeSettings({ ...homeSettings, heroTitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-serif font-bold text-slate-900 dark:text-white focus:outline-none"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            * "Vurgulanacak Kelime" alanına yazdığınız parça başlıkta geçerse otomatik olarak altın italik renkle vurgulanır.
          </span>
        </div>

        {/* Yapısal vurgu alanı (#8): eskiden vurgu sabit 'Büyüsünü' metnine
            bağlıydı; artık hangi parçanın vurgulanacağını panel belirler. */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
            Vurgulanacak Kelime (Altın İtalik)
          </label>
          <input
            type="text"
            value={homeSettings?.heroTitleAccent || ''}
            onChange={(e) => setHomeSettings({ ...homeSettings, heroTitleAccent: e.target.value })}
            placeholder="örn: Büyüsünü"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-serif font-bold text-amber-600 dark:text-amber-400 italic focus:outline-none"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            * Boş bırakılırsa başlıkta vurgu yapılmaz.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
            Alt Açıklama (Hero Subtitle)
          </label>
          <textarea
            rows={2}
            value={homeSettings?.heroSubtitle || ''}
            onChange={(e) => setHomeSettings({ ...homeSettings, heroSubtitle: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>

        {/* Butonlar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Birincil Buton Metni
            </label>
            <input
              type="text"
              value={homeSettings?.heroCtaPrimaryText || 'Turları İncele'}
              onChange={(e) => setHomeSettings({ ...homeSettings, heroCtaPrimaryText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Birincil Buton Hedef Linki
            </label>
            <input
              type="text"
              value={homeSettings?.heroCtaPrimaryLink || '/turlar'}
              onChange={(e) => setHomeSettings({ ...homeSettings, heroCtaPrimaryLink: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              İkincil Buton Metni (WhatsApp)
            </label>
            <input
              type="text"
              value={homeSettings?.heroCtaSecondaryText || "WhatsApp'tan Ulaşın"}
              onChange={(e) => setHomeSettings({ ...homeSettings, heroCtaSecondaryText: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
            />
          </div>
        </div>

        {/* 4 Slider Arka Plan Fotoğrafları */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
            Hero Arka Plan Slaytları (Dönen 4 Fotoğraf)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((idx) => {
              const sliderImages = homeSettings?.heroSliderImages || [
                'phuket_hero.webp',
                'pileh.webp',
                'yacht.webp',
                'longtail.webp',
              ];
              const currentImg = sliderImages[idx] || '';

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Slayt {idx + 1} {idx === 0 ? '(Açılış)' : ''}</span>
                  </div>

                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <img
                      src={getImageUrl(currentImg)}
                      alt={`Slayt ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      openPicker(`Slayt ${idx + 1} Fotoğrafı Seç`, currentImg, (selectedUrl) => {
                        const updated = [...sliderImages];
                        updated[idx] = selectedUrl;
                        setHomeSettings({ ...homeSettings, heroSliderImages: updated });
                      })
                    }
                    className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-brand-accent hover:text-white dark:hover:bg-brand-accent text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Görseli Değiştir</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
