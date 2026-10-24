/**
 * Medya modalları — AdminDashboard'tan ayrıldı.
 *
 * - AddMediaModal: kütüphaneye fotoğraf ekleme (dosya/URL iki modlu).
 * - MediaLightboxModal: büyük boyut görsel inceleme.
 *
 * Form state'leri parent'ta kalır (handleAddMediaSubmit, newMediaUrl,
 * selectedLightboxMedia vb. zincirleri orada); davranış birebir aynıdır.
 */
import { Image, Upload, ExternalLink, Copy, Star } from 'lucide-react';
import type { MediaItem } from '../../data/adminInitialData';

// ---------------------------------------------------------------------------
// MODAL 7: ADD MEDIA
// ---------------------------------------------------------------------------
interface AddMediaModalProps {
  mediaUploadMode: 'file' | 'url';
  setMediaUploadMode: (m: 'file' | 'url') => void;
  newMediaTitle: string;
  setNewMediaTitle: (t: string) => void;
  newMediaUrl: string;
  setNewMediaUrl: (u: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onClose: () => void;
  /** Görsel URL çözümleyici — AdminDashboard ile aynı davranış. */
  getImageUrl: (img?: string) => string;
}

export function AddMediaModal({
  mediaUploadMode,
  setMediaUploadMode,
  newMediaTitle,
  setNewMediaTitle,
  newMediaUrl,
  setNewMediaUrl,
  onSubmit,
  onClose,
  getImageUrl,
}: AddMediaModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
            <Image className="w-5 h-5 text-brand-accent" />
            <span>Kütüphaneye Fotoğraf Ekle</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMediaUploadMode('file')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mediaUploadMode === 'file'
                ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bilgisayardan Dosya Seç</span>
          </button>
          <button
            type="button"
            onClick={() => setMediaUploadMode('url')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mediaUploadMode === 'url'
                ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Web URL'si Gir</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Fotoğraf Başlığı / Açıklaması
            </label>
            <input
              type="text"
              placeholder="Örn: James Bond Adası Gün Batımı"
              value={newMediaTitle}
              onChange={(e) => setNewMediaTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>

          {mediaUploadMode === 'file' ? (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Görsel Dosyası (JPG, PNG, WEBP)
              </label>
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-accent rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Bilgisayarınızdan bir görsel seçin
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Doğrudan panele ve kütüphaneye kaydedilir
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!newMediaTitle) {
                        setNewMediaTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
                      }
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setNewMediaUrl((ev.target?.result as string) || '');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Web Görsel URL'si (HTTPS Linki)
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/... veya CDN linki"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              />
            </div>
          )}

          {/* Canlı Önizleme */}
          {newMediaUrl && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Canlı Önizleme</span>
              <div className="h-40 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <img
                  src={getImageUrl(newMediaUrl)}
                  alt="Önizleme"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                  }}
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={!newMediaUrl}
              className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-md shadow-brand-primary/20 disabled:opacity-50"
            >
              Kütüphaneye Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MODAL 8: LIGHTBOX
// ---------------------------------------------------------------------------
interface MediaLightboxModalProps {
  media: MediaItem;
  onClose: () => void;
  onCopyUrl: (url: string) => void;
  onAssignToTour: () => void;
  getImageUrl: (img?: string) => string;
}

export function MediaLightboxModal({
  media,
  onClose,
  onCopyUrl,
  onAssignToTour,
  getImageUrl,
}: MediaLightboxModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white dark:bg-surface-2 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {media.title}
            </h3>
            <span className="text-[11px] font-mono text-slate-400 truncate block max-w-md">
              {media.url}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 bg-black/90 p-4 flex items-center justify-center overflow-hidden min-h-[350px]">
          <img
            src={getImageUrl(media.url)}
            alt={media.title}
            className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-2xl"
          />
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-semibold">
            Tür: {media.type === 'system' ? 'Sistem Görseli' : media.type === 'uploaded' ? 'Yüklenen Dosya' : 'Web URL'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onCopyUrl(media.url)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Bağlantıyı Kopyala</span>
            </button>

            <button
              type="button"
              onClick={onAssignToTour}
              className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Bir Tura Kapak Yap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
