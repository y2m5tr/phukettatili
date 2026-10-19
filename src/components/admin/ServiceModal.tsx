/**
 * Hizmet Sayfası düzenleme modalı — AdminDashboard'tan ayrıldı.
 * Form state'i parent'ta kalır (handleSubmitService zinciri orada).
 */
import { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import type { MediaItem } from '../../data/adminInitialData';
import ImagePickerModal from './ImagePickerModal';

interface ServiceModalProps {
  serviceFormData: Record<string, unknown>;
  setServiceFormData: (next: Record<string, unknown>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  /** Görsel URL çözümleyici ve Base64 yükleme — AdminDashboard'tan geçer. */
  getImageUrl: (img?: string) => string;
  handleFileUpload: (file: File, cb: (url: string) => void) => void;
  /** Select'te sunulacak görsel seçenekleri (sistem + yüklenen). */
  allImageOptions: string[];
  mediaList?: MediaItem[];
}

export default function ServiceModal({
  serviceFormData,
  setServiceFormData,
  onSubmit,
  onClose,
  getImageUrl,
  handleFileUpload,
  allImageOptions,
  mediaList = [],
}: ServiceModalProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const fd = serviceFormData as { eyebrow?: string; heading?: string; intro?: string; media?: string };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        <h2 className="text-xl font-bold font-serif mb-4">Hizmet Sayfasını Düzenle</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Üst Etiket (Eyebrow)</label>
              <input
                type="text"
                value={fd.eyebrow || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, eyebrow: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Ana Başlık (Heading)</label>
              <input
                type="text"
                value={fd.heading || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, heading: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Giriş Metni (Intro)</label>
            <textarea
              rows={3}
              value={fd.intro || ''}
              onChange={(e) => setServiceFormData({ ...serviceFormData, intro: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border text-sm focus:outline-none"
            />
          </div>

          {/* Hizmet Görseli */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Hizmet Görseli
              </label>
              <label className="cursor-pointer px-3 py-1 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>PC'den Yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file, (url) => {
                        setServiceFormData({ ...serviceFormData, media: url });
                      });
                    }
                    e.target.value = '';
                  }}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>🖼️ Görsel Kütüphanesinden Seç (Önizlemeli)</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <select
                value={fd.media || 'longtail.webp'}
                onChange={(e) => setServiceFormData({ ...serviceFormData, media: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              >
                {allImageOptions.map((img) => (
                  <option key={img} value={img}>
                    {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="veya direkt görsel URL'si girin..."
                value={fd.media || ''}
                onChange={(e) => setServiceFormData({ ...serviceFormData, media: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              />
            </div>

            {fd.media && (
              <div className="flex items-center gap-2.5 pt-1">
                <img
                  src={getImageUrl(fd.media)}
                  alt="Hizmet Görseli"
                  className="w-16 h-10 object-cover rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/longtail.webp';
                  }}
                />
                <span className="text-[11px] font-mono text-slate-500 truncate max-w-xs">
                  {fd.media}
                </span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border text-sm font-semibold">Vazgeç</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-bold">Kaydet</button>
          </div>
        </form>
      </div>
    </div>

    {isPickerOpen && (
      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title="Hizmet Görselini Seç"
        currentValue={fd.media}
        onSelect={(url) => setServiceFormData({ ...serviceFormData, media: url })}
        mediaList={mediaList}
        allImageOptions={allImageOptions}
        getImageUrl={getImageUrl}
        handleFileUpload={handleFileUpload}
      />
    )}
  </>
  );
}
