import React, { useState } from 'react';
import { X, Plus, FolderPlus, Trash2, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import type { CategoryItem } from '../../data/adminTypes';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onSaveCategory: (category: CategoryItem) => void;
  onDeleteCategory?: (slug: string) => void;
  availableImages?: string[];
  showToast?: (msg: string) => void;
}

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return text
    .split('')
    .map((char) => trMap[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  onSaveCategory,
  onDeleteCategory,
  availableImages = [],
  showToast,
}: CategoryModalProps) {
  if (!isOpen) return null;

  const [labelTr, setLabelTr] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [icon, setIcon] = useState('🏝️');
  const [order, setOrder] = useState<number>(categories.length + 1);
  const [description, setDescription] = useState('');
  const [heroImage, setHeroImage] = useState('phuket_hero.webp');
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setLabelTr(val);
    if (!isSlugManual && !editingSlug) {
      setSlug(slugify(val));
    }
  };

  const handleStartEdit = (cat: CategoryItem) => {
    setEditingSlug(cat.slug);
    setLabelTr(cat.label_tr);
    setSlug(cat.slug);
    setIsSlugManual(true);
    setIcon(cat.icon || '🏝️');
    setOrder(cat.order ?? 10);
    setDescription(cat.description || '');
    setHeroImage(cat.hero_image || 'phuket_hero.webp');
  };

  const handleResetForm = () => {
    setEditingSlug(null);
    setLabelTr('');
    setSlug('');
    setIsSlugManual(false);
    setIcon('🏝️');
    setOrder(categories.length + 1);
    setDescription('');
    setHeroImage('phuket_hero.webp');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = slug.trim() || slugify(labelTr);
    if (!cleanSlug || !labelTr.trim()) {
      showToast?.('Lütfen kategori başlığını ve URL kodunu doldurun.');
      return;
    }

    const newCategory: CategoryItem = {
      id: cleanSlug,
      name: labelTr.trim(),
      label_tr: labelTr.trim(),
      slug: cleanSlug,
      icon: icon.trim() || '🏝️',
      order: Number(order) || 10,
      description: description.trim(),
      hero_image: heroImage,
      children: [],
    };

    onSaveCategory(newCategory);
    showToast?.(`✅ "${labelTr}" kategorisi başarıyla kaydedildi!`);
    handleResetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-xl">
              📂
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                Tur Kategorileri Yönetimi
              </h3>
              <p className="text-xs text-slate-300">
                Sitede listelenecek tur kategorilerini ekleyin, sıralayın ve düzenleyin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{editingSlug ? '✏️ Kategoriyi Düzenle' : '✨ Yeni Kategori Tanımla'}</span>
              </h4>
              {editingSlug && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                >
                  Yeni Kategori Moduna Dön
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Başlığı (Türkçe) *
                </label>
                <input
                  type="text"
                  required
                  value={labelTr}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Örn: Lüks Katamaran Turları"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:border-brand-accent text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  İkon (Emoji)
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🏝️"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-center focus:outline-none focus:border-brand-accent text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  URL Kodu (Slug) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManual(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="luks-katamaran-turlari"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Sayfa linki: /turlar/?kategori={slug || 'ornek-slug'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Sıralama (Kaçıncı Sırada Çıkacak) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-accent"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Menüde ve filtrelerdeki gösterim sırası (1 en önce)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Kategori Açıklaması (SEO & Sayfa Başlığı)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu kategoriye ait turların kısa tanıtımı..."
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{editingSlug ? 'Değişiklikleri Güncelle' : '+ Kategoriyi Kaydet'}</span>
              </button>
            </div>
          </form>

          {/* Mevcut Kategoriler Tablosu */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sistemdeki Mevcut Kategoriler ({categories.length})
              </h4>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3 w-16 text-center">Sıra</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">URL Slug</th>
                    <th className="py-2.5 px-3 text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categories
                    .slice()
                    .sort((a, b) => (Number(a.order) || 999) - (Number(b.order) || 999))
                    .map((cat) => (
                      <tr key={cat.slug} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            #{cat.order ?? 10}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cat.icon || '🏝️'}</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {cat.label_tr}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <a
                            href={`/turlar/?kategori=${cat.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-slate-500 hover:text-brand-accent flex items-center gap-1"
                            title="Canlı sayfayı gör"
                          >
                            <span>/{cat.slug}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Düzenle
                            </button>
                            {onDeleteCategory && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`"${cat.label_tr}" kategorisini silmek istediğinize emin misiniz?`)) {
                                    onDeleteCategory(cat.slug);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                                title="Kategoriyi Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Kategori sırası ve yeni kategoriler sitenin tamamında (menü, kategori ve tur sayfaları) anında aktif olur.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
