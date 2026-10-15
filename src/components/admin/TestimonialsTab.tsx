/**
 * Müşteri Yorumları sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Not: Tüm CMS sekmeleri gibi YEREL kaydeder (localStorage);
 * canlıya yansıtma ayrı bir iş maddesidir (Keystatic entegrasyonu).
 */
import { Plus, Star, Edit2, Trash2 } from 'lucide-react';
import type { TestimonialItem } from '../../data/adminInitialData';

interface TestimonialsTabProps {
  testimonials: TestimonialItem[];
  onOpenCreate: () => void;
  onOpenEdit: (t: TestimonialItem) => void;
  onDelete: (id: string, name: string) => void;
}

export default function TestimonialsTab({
  testimonials,
  onOpenCreate,
  onOpenEdit,
  onDelete,
}: TestimonialsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Müşteri Yorumları ({testimonials.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ana sayfadaki gerçek tatilci yorumlarını, puanlarını ve çift isimlerini yönetin.
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Yorum Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-amber-400 gap-0.5">
                  {Array.from({ length: t.stars || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {t.type}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic mb-4 leading-relaxed">
                "{t.text}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">{t.name}</div>
                <div className="text-[11px] text-brand-accent">{t.tour}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenEdit(t)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(t.id, t.name)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
