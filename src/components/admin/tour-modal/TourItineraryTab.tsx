import React, { useState } from 'react';
import { Edit2, Image, Plus, Trash2, Upload } from 'lucide-react';
import type { TourItem } from '../../../data/adminTypes';

interface TourItineraryTabProps {
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
  getImageUrl: (url?: string) => string;
  handleFileUpload?: (file: File, callback?: (url: string) => void) => void;
  openPicker: (title: string, currentValue: string | undefined, onSelect: (url: string) => void) => void;
  allImageOptions: string[];
}

export const TourItineraryTab: React.FC<TourItineraryTabProps> = ({
  tourFormData,
  setTourFormData,
  getImageUrl,
  handleFileUpload,
  openPicker,
  allImageOptions,
}) => {
  const [editingProgramIdx, setEditingProgramIdx] = useState<number | null>(null);
  const [programImageFor, setProgramImageFor] = useState<number | null>(null);
  const [tempProgramItem, setTempProgramItem] = useState('');

  const programList = tourFormData.program || [];
  const programImages = (tourFormData.programImages || []).map((images) =>
    Array.isArray(images) ? images : [images].filter(Boolean),
  );

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
          Tur Programı & Akış Adımları ({programList.length})
        </span>
        <p className="text-xs text-slate-400 mb-3">
          Misafirlerin tur sayfasında gördüğü saat saat zaman çizelgesi.
        </p>
      </div>

      {/* List of items */}
      <div className="space-y-2">
        {programList.map((step, idx) => {
          const stepImages = programImages[idx] || [];
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-brand-primary/10 text-brand-primary dark:text-brand-accent font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{step}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingProgramIdx === idx) {
                        setEditingProgramIdx(null);
                        setTempProgramItem('');
                      } else {
                        setEditingProgramIdx(idx);
                        setTempProgramItem(step);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${editingProgramIdx === idx ? 'text-brand-accent bg-brand-accent/10' : 'text-slate-400 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title="Adımı Düzenle"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setProgramImageFor(programImageFor === idx ? null : idx)}
                    className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${stepImages.length > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-semibold' : 'text-slate-400 hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    title={stepImages.length > 0 ? `Bu adımda ${stepImages.length} fotoğraf var (açmak için tıklayın)` : 'Bu adıma fotoğraf ekle'}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {stepImages.length > 0 && <span className="text-[11px] font-bold">{stepImages.length}</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTourFormData({
                        ...tourFormData,
                        program: (tourFormData.program || []).filter((_, i) => i !== idx),
                        programImages: programImages.filter((_, i) => i !== idx),
                      });
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Adımı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {editingProgramIdx === idx && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
                  <input
                    type="text"
                    value={tempProgramItem}
                    onChange={(e) => setTempProgramItem(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tempProgramItem.trim()) {
                          const next = [...(tourFormData.program || [])];
                          next[idx] = tempProgramItem.trim();
                          setTourFormData({ ...tourFormData, program: next });
                          setEditingProgramIdx(null);
                          setTempProgramItem('');
                        }
                      }
                      if (e.key === 'Escape') {
                        setEditingProgramIdx(null);
                        setTempProgramItem('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tempProgramItem.trim()) {
                        const next = [...(tourFormData.program || [])];
                        next[idx] = tempProgramItem.trim();
                        setTourFormData({ ...tourFormData, program: next });
                      }
                      setEditingProgramIdx(null);
                      setTempProgramItem('');
                    }}
                    className="px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold whitespace-nowrap"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProgramIdx(null);
                      setTempProgramItem('');
                    }}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold whitespace-nowrap"
                  >
                    İptal
                  </button>
                </div>
              )}
              {programImageFor === idx && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>PC'den Yükle</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && handleFileUpload) {
                            handleFileUpload(file, (url) => {
                              const next = [...programImages];
                              while (next.length <= idx) next.push([]);
                              next[idx] = [...stepImages, url];
                              setTourFormData({ ...tourFormData, programImages: next });
                            });
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        openPicker(`${idx + 1}. Adım İçin Görsel Seç`, undefined, (url) => {
                          const next = [...programImages];
                          while (next.length <= idx) next.push([]);
                          next[idx] = [...stepImages, url];
                          setTourFormData({ ...tourFormData, programImages: next });
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <Image className="w-3.5 h-3.5" />
                      <span>🖼️ Önizlemeli Seç</span>
                    </button>

                    <select
                      value=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v && !stepImages.includes(v)) {
                          const next = [...programImages];
                          while (next.length <= idx) next.push([]);
                          next[idx] = [...stepImages, v];
                          setTourFormData({ ...tourFormData, programImages: next });
                        }
                      }}
                      className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                    >
                      <option value="">+ Listeden görsel ekle...</option>
                      {allImageOptions.map((img) => (
                        <option key={img} value={img} disabled={stepImages.includes(img)}>
                          {img} {stepImages.includes(img) ? '(Eklendi)' : ''}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setProgramImageFor(null)}
                      className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs border border-slate-200 dark:border-slate-700"
                    >
                      Paneli Kapat
                    </button>
                  </div>

                  {stepImages.length > 0 ? (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-300 dark:border-emerald-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <span>Bu adıma ekli fotoğraflar ({stepImages.length}) — Silmek için çarpıya (✕) tıklayın:</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                        {stepImages.map((image, imgIdx) => (
                          <div
                            key={`${image}-${imgIdx}`}
                            className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-emerald-400 group shadow-xs"
                          >
                            <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                            <span className="absolute bottom-0.5 left-1 px-1 rounded bg-black/60 text-[9px] text-white">
                              #{imgIdx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...programImages];
                                next[idx] = stepImages.filter((_, i) => i !== imgIdx);
                                setTourFormData({ ...tourFormData, programImages: next });
                              }}
                              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 shadow-xs cursor-pointer"
                              title="Bu fotoğrafı adımdan kaldır"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Bu adıma henüz fotoğraf eklenmedi. Yukarıdaki butonlardan fotoğraf yükleyebilir veya seçebilirsiniz.
                    </p>
                  )}

                  {allImageOptions.length > 0 && (
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Hızlı Seçim (Tıklayıp Adıma Ekle):
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {allImageOptions.slice(0, 16).map((img) => {
                          const isAdded = stepImages.includes(img);
                          return (
                            <button
                              key={`prog-step-${idx}-${img}`}
                              type="button"
                              onClick={() => {
                                if (isAdded) return;
                                const next = [...programImages];
                                while (next.length <= idx) next.push([]);
                                next[idx] = [...stepImages, img];
                                setTourFormData({ ...tourFormData, programImages: next });
                              }}
                              className={`relative shrink-0 w-12 h-9 rounded-md overflow-hidden border transition-all ${
                                isAdded
                                  ? 'border-emerald-500 ring-2 ring-emerald-500/40 opacity-50 cursor-not-allowed'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-accent hover:scale-105'
                              }`}
                              title={isAdded ? `${img} (Zaten eklendi)` : `${img} — Adıma ekle`}
                            >
                              <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                              {isAdded && (
                                <span className="absolute inset-0 flex items-center justify-center bg-emerald-950/40 text-white font-bold text-xs">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add step */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="text"
          value={tempProgramItem}
          onChange={(e) => setTempProgramItem(e.target.value)}
          placeholder="Örn: 09:30 - Maya Bay kumsalında serbest fotoğraf molası"
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (tempProgramItem.trim()) {
                setTourFormData({
                  ...tourFormData,
                  program: [...(tourFormData.program || []), tempProgramItem.trim()],
                });
                setTempProgramItem('');
              }
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (tempProgramItem.trim()) {
              setTourFormData({
                ...tourFormData,
                program: [...(tourFormData.program || []), tempProgramItem.trim()],
              });
              setTempProgramItem('');
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shrink-0 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ekle</span>
        </button>
      </div>
    </div>
  );
};
