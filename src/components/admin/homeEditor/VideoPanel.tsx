import { Image as ImageIcon, Video } from 'lucide-react';
import type { HomeEditorPanelProps } from './types';

// SEKME 5: TANITIM VİDEOSU & KAPAK
export default function VideoPanel({
  homeSettings,
  setHomeSettings,
  getImageUrl,
  openPicker,
}: HomeEditorPanelProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-brand-accent" />
          <span>Tanıtım Videosu & Kapak Görseli</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Anasayfadaki video vitrininin başlığını, alt metnini, video dosya yolunu ve tıklama öncesi kapak fotoğrafını düzenleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Üst Rozet Metni
            </label>
            <input
              type="text"
              value={homeSettings?.videoBadge || 'Tanıtım Filmi'}
              onChange={(e) => setHomeSettings({ ...homeSettings, videoBadge: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Bölüm Başlığı
            </label>
            <input
              type="text"
              value={homeSettings?.videoTitle || "Phuket'i Saniyeler İçinde Keşfedin"}
              onChange={(e) => setHomeSettings({ ...homeSettings, videoTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Alt Açıklama
            </label>
            <textarea
              rows={2}
              value={homeSettings?.videoSubtitle || ''}
              onChange={(e) => setHomeSettings({ ...homeSettings, videoSubtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Video Dosya Yolu veya URL
            </label>
            <input
              type="text"
              value={homeSettings?.videoUrl || '/assets/tours_video.mp4'}
              onChange={(e) => setHomeSettings({ ...homeSettings, videoUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
            Video Kapak Fotoğrafı (Poster)
          </label>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <img
              src={getImageUrl(homeSettings?.videoPoster || 'phuket_hero.webp')}
              alt="Video Poster"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              openPicker(
                'Video Kapak Fotoğrafı Seç',
                homeSettings?.videoPoster || 'phuket_hero.webp',
                (url) => setHomeSettings({ ...homeSettings, videoPoster: url })
              )
            }
            className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Fotoğraf Kütüphanesinden Kapak Seç</span>
          </button>
        </div>
      </div>
    </div>
  );
}
