import type React from 'react';
import { Image, Upload, Plus } from 'lucide-react';
import type { TourItem } from '../../../data/adminTypes';

export interface TourPhotosTabProps {
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
  getImageUrl: (url?: string) => string;
  handleFileUpload: (file: File, callback?: (url: string) => void) => void;
  allImageOptions?: string[];
  openPicker: (title: string, currentValue: string | undefined, onSelect: (url: string) => void) => void;
}

export function TourPhotosTab({
  tourFormData,
  setTourFormData,
  getImageUrl,
  handleFileUpload,
  allImageOptions = [],
  openPicker,
}: TourPhotosTabProps) {
  return (
    <div className="space-y-6">
      {/* Kapak Fotoğrafı */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
            Ana Kapak Fotoğrafı *
          </label>
          <span className="text-[11px] text-slate-400">Tur kartı ve sayfa başlığı görseli</span>
        </div>

        {/* Hızlı Seçim Butonları: Önizlemeli Kütüphane + PC'den Yükle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={() =>
              openPicker('Tur Kapak Fotoğrafını Seç', tourFormData.image, (url) => {
                setTourFormData((prev) => ({ ...prev, image: url }));
              })
            }
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Image className="w-4 h-4" />
            <span>🖼️ Fotoğrafı Görerek Seç (Önizlemeli Kütüphane)</span>
          </button>

          <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all whitespace-nowrap">
            <Upload className="w-4 h-4 text-brand-accent" />
            <span>PC'den Yükle</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, (url) => {
                    setTourFormData({ ...tourFormData, image: url });
                  });
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {/* Hızlı Görsel Şeridi: Küçük Resme Tıklayarak Kapak Seç */}
        {allImageOptions.length > 0 && (
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
              Hızlı Kapak Seçimi (Küçük görsele tıklayarak anında seçebilirsiniz):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {allImageOptions.slice(0, 16).map((img) => {
                const isCurrent = (tourFormData.image || 'phuket_hero.webp') === img;
                return (
                  <button
                    key={`quick-cover-${img}`}
                    type="button"
                    onClick={() => setTourFormData((prev) => ({ ...prev, image: img }))}
                    className={`relative group shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'border-brand-accent ring-2 ring-brand-accent/40 scale-105 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-accent hover:scale-105 shadow-xs'
                    }`}
                    title={`${img.startsWith('data:') ? 'Özel Görsel' : img} — Kapak yapmak için tıkla`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && (
                      <div className="absolute inset-0 bg-brand-accent/30 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold bg-black/70 px-1 py-0.5 rounded">Seçili</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <select
            value={tourFormData.image || 'phuket_hero.webp'}
            onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
          >
            {allImageOptions.map((img) => (
              <option key={img} value={img}>
                {img.startsWith('data:') ? 'Özel Yüklenen Dosya' : img}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="veya direkt görsel URL'si girin..."
            value={tourFormData.image || ''}
            onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
            className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
          />
        </div>

        {tourFormData.image && (
          <div className="flex items-center gap-3 pt-2">
            <img
              src={getImageUrl(tourFormData.image)}
              alt="Kapak Önizleme"
              className="w-24 h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
              }}
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kapak Önizleme</span>
              <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate block max-w-sm">
                {tourFormData.image}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Galeri Fotoğrafları */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Turdan Fotoğraflar (Galeri)
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tur sayfasında sergilenecek ek fotoğraflar ({(tourFormData.gallery || []).length} adet)
            </p>
          </div>

          <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Galeriye Fotoğraf Yükle</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, (url) => {
                    setTourFormData({
                      ...tourFormData,
                      gallery: [...(tourFormData.gallery || []), url],
                    });
                  });
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {/* Galeri Önizleme Grid */}
        {(tourFormData.gallery || []).length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
            {(tourFormData.gallery || []).map((img, idx) => (
              <div key={`${img}-${idx}`} className="relative group">
                <img
                  src={getImageUrl(img)}
                  alt={`Galeri ${idx + 1}`}
                  className="w-full h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() =>
                    setTourFormData({
                      ...tourFormData,
                      gallery: (tourFormData.gallery || []).filter((_, i) => i !== idx),
                    })
                  }
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-red-600 transition-colors"
                  title="Fotoğrafı Galeriden Kaldır"
                >
                  ✕
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-white text-[8px] font-bold">
                    #1
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3 italic text-center">
            Henüz galeri fotoğrafı eklenmemiş. Aşağıdan veya bilgisayarınızdan ekleyebilirsiniz.
          </p>
        )}

        {/* Kütüphaneden Seçerek Galeriye Ekle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              openPicker('Galeriye Fotoğraf Ekle', undefined, (url) => {
                if (url && !(tourFormData.gallery || []).includes(url)) {
                  setTourFormData((prev) => ({
                    ...prev,
                    gallery: [...(prev.gallery || []), url],
                  }));
                }
              })
            }
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Image className="w-4 h-4" />
            <span>🖼️ Kütüphaneden Fotoğraf Seç & Ekle (Önizlemeli)</span>
          </button>

          <div className="sm:w-64">
            <select
              value=""
              onChange={(e) => {
                const selected = e.target.value;
                if (selected && !(tourFormData.gallery || []).includes(selected)) {
                  setTourFormData({
                    ...tourFormData,
                    gallery: [...(tourFormData.gallery || []), selected],
                  });
                }
                e.target.value = '';
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="">veya listeden seç...</option>
              {allImageOptions.map((img) => (
                <option key={img} value={img}>
                  {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hızlı Görsel Şeridi: Küçük Görsele Tıklayarak Galeriye Ekle */}
        {allImageOptions.length > 0 && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">
                Kütüphanedeki Görseller (Küçük görsele tıklayarak anında galeriye ekleyin):
              </span>
              <span className="text-[10px] text-slate-400">
                {allImageOptions.length} adet görsel
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {allImageOptions.map((img) => {
                const isAlreadyInGallery = (tourFormData.gallery || []).includes(img);
                return (
                  <button
                    key={`quick-gallery-${img}`}
                    type="button"
                    onClick={() => {
                      if (!isAlreadyInGallery) {
                        setTourFormData((prev) => ({
                          ...prev,
                          gallery: [...(prev.gallery || []), img],
                        }));
                      }
                    }}
                    disabled={isAlreadyInGallery}
                    className={`relative group shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      isAlreadyInGallery
                        ? 'border-emerald-500 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-accent hover:scale-105 cursor-pointer shadow-xs'
                    }`}
                    title={isAlreadyInGallery ? 'Zaten galeride ekli' : `${img.startsWith('data:') ? 'Özel Görsel' : img} — Galeriye eklemek için tıkla`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {isAlreadyInGallery && (
                      <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
