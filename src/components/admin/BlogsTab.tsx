/**
 * Blog & Gezi Rehberi sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Not: Diğer CMS sekmeleri gibi YEREL kaydeder (localStorage);
 * canlıya yansıtma ayrı bir iş maddesidir (Keystatic entegrasyonu).
 */
import { Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import type { BlogItem } from '../../data/adminInitialData';

interface BlogsTabProps {
  blogs: BlogItem[];
  onOpenCreate: () => void;
  onOpenEdit: (b: BlogItem) => void;
  onDelete: (id: string, title: string) => void;
}

export default function BlogsTab({ blogs, onOpenCreate, onOpenEdit, onDelete }: BlogsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Blog & Gezi Rehberi Yönetimi ({blogs.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Yeni rehber yazısı ekleyin, kapak görsellerini ve özetlerini düzenleyin.
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Yazı Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {blogs.map((b) => (
          <div
            key={b.id}
            className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="h-40 relative bg-slate-100 dark:bg-slate-900">
              <img
                src={`/assets/${b.cover_image}`}
                alt={b.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/pileh.webp';
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                  {b.date}
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{b.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{b.excerpt}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={`/blog/${b.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-accent hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Oku</span>
                </a>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenEdit(b)}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-primary hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(b.id, b.title)}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
