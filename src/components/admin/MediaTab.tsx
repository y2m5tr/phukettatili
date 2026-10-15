/**
 * Medya & Fotoğraf Kütüphanesi sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Filtre state'i (arama, tip) AdminDashboard'ta kalır çünkü
 * allImageOptions hesabı da aynı state'ten besleniyor.
 * Not: Diğer CMS sekmeleri gibi YEREL kaydeder (localStorage).
 */
import { Search, Upload, ExternalLink, Maximize2, Copy, Star, Trash2 } from 'lucide-react';
import type { MediaItem } from '../../data/adminInitialData';

export type MediaTypeFilter = 'all' | 'system' | 'uploaded' | 'external';

interface MediaTabProps {
  /** Arama sorgusu (parent state — allImageOptions ile paylaşılıyor). */
  mediaSearchQuery: string;
  setMediaSearchQuery: (q: string) => void;
  mediaTypeFilter: MediaTypeFilter;
  setMediaTypeFilter: (t: MediaTypeFilter) => void;
  /** Filtrelenmiş liste — parent'taki useMemo sonucu. */
  filteredMedia: MediaItem[];
  /** Görsel URL çözümleyici — AdminDashboard ile aynı davranış. */
  getImageUrl: (img?: string) => string;
  /** Base64 dosya yükleme yardımcısı. */
  handleFileUpload: (file: File, cb?: (url: string) => void) => void;
  onOpenUrlModal: () => void;
  setSelectedLightboxMedia: (m: MediaItem | null) => void;
  setAssignMediaModal: (m: MediaItem | null) => void;
  handleCopyMediaUrl: (url: string) => void;
  handleDeleteMedia: (id: string, title: string) => void;
}

export default function MediaTab({
  mediaSearchQuery,
  setMediaSearchQuery,
  mediaTypeFilter,
  setMediaTypeFilter,
  filteredMedia,
  getImageUrl,
  handleFileUpload,
  onOpenUrlModal,
  setSelectedLightboxMedia,
  setAssignMediaModal,
  handleCopyMediaUrl,
  handleDeleteMedia,
}: MediaTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Medya & Fotoğraf Kütüphanesi ({filteredMedia.length})
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
              Görsel Yönetim Merkezi
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bilgisayarınızdan fotoğraf yükleyin, harici web URL'leri ekleyin veya mevcut sistem fotoğraflarını yönetin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={mediaSearchQuery}
              onChange={(e) => setMediaSearchQuery(e.target.value)}
              placeholder="Fotoğraf ara..."
              className="w-48 sm:w-56 px-3.5 py-2 pl-9 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setMediaTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                mediaTypeFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setMediaTypeFilter('system')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                mediaTypeFilter === 'system'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sistem
            </button>
            <button
              onClick={() => setMediaTypeFilter('uploaded')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                mediaTypeFilter === 'uploaded'
                  ? 'bg-white dark:bg-slate-800 text-brand-primary dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yüklenenler
            </button>
          </div>

          <label className="cursor-pointer px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all">
            <Upload className="w-4 h-4" />
            <span>Fotoğraf Yükle</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = '';
              }}
            />
          </label>

          <button
            onClick={onOpenUrlModal}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>URL Ekle</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredMedia.map((m) => {
          const resolvedUrl = getImageUrl(m.url);
          return (
            <div
              key={m.id}
              className="group bg-white dark:bg-surface-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:border-brand-accent/50 hover:shadow-md transition-all flex flex-col"
            >
              <div className="relative aspect-square bg-slate-100 dark:bg-slate-900 overflow-hidden">
                <img
                  src={resolvedUrl}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLightboxMedia(m)}
                    className="p-2 rounded-xl bg-white/95 text-slate-900 hover:bg-white shadow-md transform hover:scale-110 transition-transform"
                    title="Büyük Boyut İncele"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyMediaUrl(m.url)}
                    className="p-2 rounded-xl bg-white/95 text-slate-900 hover:bg-white shadow-md transform hover:scale-110 transition-transform"
                    title="Görsel Adını / Linkini Kopyala"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignMediaModal(m)}
                    className="p-2 rounded-xl bg-brand-accent text-white hover:bg-brand-accent/90 shadow-md transform hover:scale-110 transition-transform"
                    title="Bir Tura Kapak Yap"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>

                <span
                  className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                    m.type === 'system'
                      ? 'bg-slate-900/70 text-slate-200 border border-white/20'
                      : m.type === 'uploaded'
                      ? 'bg-emerald-600/90 text-white'
                      : 'bg-blue-600/90 text-white'
                  }`}
                >
                  {m.type === 'system' ? 'Sistem' : m.type === 'uploaded' ? 'Yüklendi' : 'URL'}
                </span>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={m.title}>
                    {m.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={m.url}>
                    {m.url.startsWith('data:') ? 'Özel Dosya (Base64)' : m.url}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleCopyMediaUrl(m.url)}
                    className="text-brand-accent hover:underline font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Kopyala</span>
                  </button>

                  {m.type !== 'system' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(m.id, m.title)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Fotoğrafı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
