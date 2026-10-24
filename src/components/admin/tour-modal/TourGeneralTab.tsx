import type React from 'react';
import type { TourItem, CategoryItem } from '../../../data/adminTypes';

export interface TourGeneralTabProps {
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
  categories?: CategoryItem[];
  onOpenCategoryModal?: () => void;
}

export function TourGeneralTab({
  tourFormData,
  setTourFormData,
  categories = [],
  onOpenCategoryModal,
}: TourGeneralTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
          Tur Başlığı *
        </label>
        <input
          type="text"
          required
          value={tourFormData.title || ''}
          onChange={(e) => setTourFormData({ ...tourFormData, title: e.target.value })}
          placeholder="Örn: Phi Phi, Maya Bay ve Bamboo Adası"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
              Kategori *
            </label>
            {onOpenCategoryModal && (
              <button
                type="button"
                onClick={onOpenCategoryModal}
                className="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ Yeni Kategori Ekle</span>
              </button>
            )}
          </div>
          <select
            value={tourFormData.category || categories[0]?.slug || 'island-tours'}
            onChange={(e) => {
              const selected = categories.find((c) => c.slug === e.target.value);
              setTourFormData({
                ...tourFormData,
                category: e.target.value,
                categoryLabel: selected?.label_tr || tourFormData.categoryLabel,
              });
            }}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
          >
            {(categories.length > 0 ? categories : [
              { slug: 'island-tours', label_tr: 'Ada Turları', icon: '🏝️' },
              { slug: 'adventure-tours', label_tr: 'Macera & Doğa', icon: '🧗' },
              { slug: 'entertainment-tours', label_tr: 'Kültür & Şovlar', icon: '🎭' },
              { slug: 'private-charters', label_tr: 'VIP Yat & Özel', icon: '⛵' },
            ]).map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.icon ? `${cat.icon} ` : ''}{cat.label_tr}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Sıralama (Sıra No) *
          </label>
          <input
            type="number"
            min="1"
            required
            value={tourFormData.order ?? 1}
            onChange={(e) => setTourFormData({ ...tourFormData, order: Number(e.target.value) })}
            placeholder="Örn: 1, 2, 3..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none"
          />
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            (1: En üstte / ilk sırada)
          </span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
          Tur Süresi
        </label>
        <input
          type="text"
          value={tourFormData.duration || ''}
          onChange={(e) => setTourFormData({ ...tourFormData, duration: e.target.value })}
          placeholder="Örn: Tam Gün (07:30 - 17:30)"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Kişi Başı Satış Fiyatı (THB)
          </label>
          <input
            type="number"
            value={tourFormData.priceThb || 0}
            onChange={(e) => setTourFormData({ ...tourFormData, priceThb: Number(e.target.value) })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">0 girilirse "Teklif Alın" görünür.</span>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Kısa Açıklama (Özet)
          </label>
          <textarea
            rows={2}
            value={tourFormData.excerpt || ''}
            onChange={(e) => setTourFormData({ ...tourFormData, excerpt: e.target.value })}
            placeholder="Tur kartında görünecek 1-2 cümlelik tanıtım..."
            className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Supplier & Cost in Tour Editor */}
      <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Tedarikçi Firma / Tekne Operatörü
          </label>
          <input
            type="text"
            placeholder="Örn: Andaman Wave Master, Sea Angel vb."
            value={tourFormData.supplier || ''}
            onChange={(e) => setTourFormData({ ...tourFormData, supplier: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
            Kişi Başı Alış / Maliyet Tutarı (THB)
          </label>
          <input
            type="number"
            placeholder="Acente maliyet tutarı"
            value={tourFormData.costThb || 0}
            onChange={(e) => setTourFormData({ ...tourFormData, costThb: Number(e.target.value) })}
            className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 focus:outline-none"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Rezervasyonlarda otomatik kâr hesaplamasında kullanılır.</span>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={tourFormData.featured || false}
            onChange={(e) => setTourFormData({ ...tourFormData, featured: e.target.checked })}
            className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
          />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Bu turu Ana Sayfada "Öne Çıkan Turlar" arasına ekle ⭐
          </span>
        </label>
      </div>
    </div>
  );
}
