import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { TourItem } from '../../../data/adminTypes';
import { TOUR_TEMPLATES, type InclusionLibrary } from './tourModalTypes';

interface TourInclusionsTabProps {
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
  availableInclusions: string[];
  availableExclusions: string[];
  inclusionLibrary?: InclusionLibrary;
  onRememberOption?: (kind: 'included' | 'excluded', item: string) => void;
  onForgetOption?: (kind: 'included' | 'excluded', item: string) => void;
}

export const TourInclusionsTab: React.FC<TourInclusionsTabProps> = ({
  tourFormData,
  setTourFormData,
  availableInclusions,
  availableExclusions,
  inclusionLibrary,
  onRememberOption,
  onForgetOption,
}) => {
  const [tempIncludedItem, setTempIncludedItem] = useState('');
  const [tempExcludedItem, setTempExcludedItem] = useState('');

  const toggleInclusion = (item: string) => {
    const current = tourFormData.included || [];
    if (current.includes(item)) {
      setTourFormData({ ...tourFormData, included: current.filter((x) => x !== item) });
    } else {
      setTourFormData({ ...tourFormData, included: [...current, item] });
      onRememberOption?.('included', item);
    }
  };

  const toggleExclusion = (item: string) => {
    const current = tourFormData.excluded || [];
    if (current.includes(item)) {
      setTourFormData({ ...tourFormData, excluded: current.filter((x) => x !== item) });
    } else {
      setTourFormData({ ...tourFormData, excluded: [...current, item] });
      onRememberOption?.('excluded', item);
    }
  };

  const applyInclusionTemplate = (tplIdx: number) => {
    const tpl = TOUR_TEMPLATES[tplIdx];
    if (!tpl) return;
    const incSet = new Set([...(tourFormData.included || []), ...tpl.included]);
    const excSet = new Set([...(tourFormData.excluded || []), ...tpl.excluded]);
    setTourFormData({
      ...tourFormData,
      included: Array.from(incSet),
      excluded: Array.from(excSet),
    });
    tpl.included.forEach((item) => onRememberOption?.('included', item));
    tpl.excluded.forEach((item) => onRememberOption?.('excluded', item));
  };

  const addManualOption = (kind: 'included' | 'excluded', raw: string) => {
    const value = raw.trim();
    if (!value) return;
    const current = tourFormData[kind] || [];
    if (!current.includes(value)) {
      setTourFormData({ ...tourFormData, [kind]: [...current, value] });
    }
    onRememberOption?.(kind, value);
  };

  return (
    <div className="space-y-4">
      {/* Hızlı Şablon Yükleyici Barı */}
      <div className="p-3.5 rounded-2xl bg-brand-primary/5 dark:bg-slate-800/60 border border-brand-primary/20 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              Hızlı Hazır Şablon Uygula
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Sık kullanılan dahil/hariç paketlerini tek tıkla bu tura ekleyin
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value;
              if (val !== '') {
                applyInclusionTemplate(parseInt(val, 10));
                e.target.value = '';
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="">⚡ Bir şablon seçip tura ekle...</option>
            {TOUR_TEMPLATES.map((tpl, i) => (
              <option key={tpl.name} value={i}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Dahil Olanlar */}
        <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
              ✅ Dahil Olanlar ({(tourFormData.included || []).length})
            </span>
            {(tourFormData.included || []).length > 0 && (
              <button
                type="button"
                onClick={() => setTourFormData({ ...tourFormData, included: [] })}
                className="text-[10px] text-red-500 hover:underline cursor-pointer"
              >
                Tümünü Temizle
              </button>
            )}
          </div>

          {/* Aktif Liste */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {(tourFormData.included || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Henüz dahil olan eklenmedi. Aşağıdaki hazır butonlara tıklayabilir veya kendiniz yazabilirsiniz.
              </p>
            ) : (
              (tourFormData.included || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-xs"
                >
                  <span className="text-slate-800 dark:text-slate-200">{item}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setTourFormData({
                        ...tourFormData,
                        included: (tourFormData.included || []).filter((_, i) => i !== idx),
                      })
                    }
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Elle Yeni Madde Ekleme */}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={tempIncludedItem}
              onChange={(e) => setTempIncludedItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tempIncludedItem.trim()) {
                  e.preventDefault();
                  addManualOption('included', tempIncludedItem);
                  setTempIncludedItem('');
                }
              }}
              placeholder="Örn: Açık büfe öğle yemeği"
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (tempIncludedItem.trim()) {
                  addManualOption('included', tempIncludedItem);
                  setTempIncludedItem('');
                }
              }}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              + Ekle
            </button>
          </div>

          {/* Sık Kullanılan & Yeniden Kullanılabilir Hazır Seçenekler (Haplar / Chips) */}
          <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
            <span className="block text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-1.5">
              💡 Sık Kullanılan Seçenekler (Tıklayıp Ekle/Çıkar):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {availableInclusions.map((chip) => {
                const isSelected = (tourFormData.included || []).includes(chip);
                const isLibraryCustom = (inclusionLibrary?.included || []).includes(chip);
                return (
                  <span
                    key={`inc-chip-${chip}`}
                    className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium transition-all gap-1 text-left ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleInclusion(chip)}
                      className="cursor-pointer flex items-center gap-1"
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{chip}</span>
                    </button>
                    {isLibraryCustom && onForgetOption && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${chip}" maddesini havuzdan silmek istediğinize emin misiniz?`)) {
                            onForgetOption('included', chip);
                          }
                        }}
                        className="ml-1 text-[10px] opacity-60 hover:opacity-100 hover:text-red-400 cursor-pointer font-bold px-0.5"
                        title="Havuzdan sil"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hariç Olanlar */}
        <div className="space-y-3 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-red-800 dark:text-red-300">
              ❌ Hariç Olanlar ({(tourFormData.excluded || []).length})
            </span>
            {(tourFormData.excluded || []).length > 0 && (
              <button
                type="button"
                onClick={() => setTourFormData({ ...tourFormData, excluded: [] })}
                className="text-[10px] text-red-500 hover:underline cursor-pointer"
              >
                Tümünü Temizle
              </button>
            )}
          </div>

          {/* Aktif Liste */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {(tourFormData.excluded || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Henüz hariç olan eklenmedi. Aşağıdaki hazır butonlara tıklayabilir veya kendiniz yazabilirsiniz.
              </p>
            ) : (
              (tourFormData.excluded || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 text-xs"
                >
                  <span className="text-slate-800 dark:text-slate-200">{item}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setTourFormData({
                        ...tourFormData,
                        excluded: (tourFormData.excluded || []).filter((_, i) => i !== idx),
                      })
                    }
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Elle Yeni Madde Ekleme */}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={tempExcludedItem}
              onChange={(e) => setTempExcludedItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && tempExcludedItem.trim()) {
                  e.preventDefault();
                  addManualOption('excluded', tempExcludedItem);
                  setTempExcludedItem('');
                }
              }}
              placeholder="Örn: Milli Park Giriş Harcı"
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (tempExcludedItem.trim()) {
                  addManualOption('excluded', tempExcludedItem);
                  setTempExcludedItem('');
                }
              }}
              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              + Ekle
            </button>
          </div>

          {/* Sık Kullanılan & Yeniden Kullanılabilir Hazır Seçenekler (Haplar / Chips) */}
          <div className="pt-2 border-t border-red-200/60 dark:border-red-900/60">
            <span className="block text-[10px] font-bold uppercase text-red-800 dark:text-red-300 mb-1.5">
              💡 Sık Kullanılan Seçenekler (Tıklayıp Ekle/Çıkar):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {availableExclusions.map((chip) => {
                const isSelected = (tourFormData.excluded || []).includes(chip);
                const isLibraryCustom = (inclusionLibrary?.excluded || []).includes(chip);
                return (
                  <span
                    key={`exc-chip-${chip}`}
                    className={`inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-medium transition-all gap-1 text-left ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-red-200/80 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-950/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExclusion(chip)}
                      className="cursor-pointer flex items-center gap-1"
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{chip}</span>
                    </button>
                    {isLibraryCustom && onForgetOption && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${chip}" maddesini havuzdan silmek istediğinize emin misiniz?`)) {
                            onForgetOption('excluded', chip);
                          }
                        }}
                        className="ml-1 text-[10px] opacity-60 hover:opacity-100 hover:text-red-400 cursor-pointer font-bold px-0.5"
                        title="Havuzdan sil"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
