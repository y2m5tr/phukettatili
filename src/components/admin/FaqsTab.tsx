/**
 * Sıkça Sorulan Sorular (FAQ) sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Not: Diğer CMS sekmeleri gibi YEREL kaydeder (localStorage);
 * canlıya yansıtma ayrı bir iş maddesidir (Keystatic entegrasyonu).
 */
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { FaqItem } from '../../data/adminInitialData';

interface FaqsTabProps {
  faqs: FaqItem[];
  onOpenCreate: () => void;
  onOpenEdit: (f: FaqItem) => void;
  onDelete: (id: string) => void;
}

export default function FaqsTab({ faqs, onOpenCreate, onOpenEdit, onDelete }: FaqsTabProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Sıkça Sorulan Sorular (FAQ) ({faqs.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ana sayfada yer alan SSS akordiyon sorularını ve cevaplarını yönetin.
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Soru Ekle</span>
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map((f, idx) => (
          <div
            key={f.id}
            className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <span className="text-[11px] font-bold text-brand-accent block mb-1">Soru #{idx + 1}</span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5">{f.question}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{f.answer}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onOpenEdit(f)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(f.id)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
