/**
 * Hizmet Sayfaları sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Not: Diğer CMS sekmeleri gibi YEREL kaydeder (localStorage);
 * canlıya yansıtma ayrı bir iş maddesidir (Keystatic entegrasyonu).
 */
import { Eye, Edit2 } from 'lucide-react';
import type { ServiceItem } from '../../data/adminInitialData';

interface ServicesTabProps {
  services: ServiceItem[];
  onOpenEdit: (s: ServiceItem) => void;
}

export default function ServicesTab({ services, onOpenEdit }: ServicesTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
          Hizmet Sayfaları Yönetimi ({services.length})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Transferler, Oteller, Tatil Paketleri ve VIP Hizmetler sayfalarının başlık ve içeriklerini düzenleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {services.map((s) => (
          <div
            key={s.slug}
            className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                  {s.eyebrow || 'Hizmet'}
                </span>
                <span className="font-mono text-xs text-slate-400">/{s.slug}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{s.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                {s.intro}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <a
                href={`/${s.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Sayfayı Canlı Gör</span>
              </a>
              <button
                onClick={() => onOpenEdit(s)}
                className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary/90 flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Düzenle</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
