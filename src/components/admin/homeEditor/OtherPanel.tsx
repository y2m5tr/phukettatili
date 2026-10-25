import { BookOpen } from 'lucide-react';
import type { HomeEditorPanelProps } from './types';

// SEKME 7: BENTO & BLOG BAŞLIKLARI
export default function OtherPanel({ homeSettings, setHomeSettings }: HomeEditorPanelProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-accent" />
          <span>Bento Grid & Blog Vitrini Başlıkları</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          "Phuket'te Neler Yapabilirsiniz?" ve "Phuket Gezi Rehberi & İpuçları" bölümlerinin manşet ve açıklamaları.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bento Grid */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <span className="font-bold text-xs text-brand-accent uppercase tracking-wider block">
            🍱 Bento Grid (Deneyimler & Rotalar)
          </span>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Üst Rozet</label>
            <input
              type="text"
              value={homeSettings?.bentoBadge || 'Deneyimler & Rotalar'}
              onChange={(e) => setHomeSettings({ ...homeSettings, bentoBadge: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Ana Başlık</label>
            <input
              type="text"
              value={homeSettings?.bentoTitle || "Phuket'te Neler Yapabilirsiniz?"}
              onChange={(e) => setHomeSettings({ ...homeSettings, bentoTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Alt Açıklama</label>
            <textarea
              rows={3}
              value={homeSettings?.bentoSubtitle || 'Günübirlik tropik ada kaçamaklarından özel yat turlarına kadar Phuket\'in en iyileri.'}
              onChange={(e) => setHomeSettings({ ...homeSettings, bentoSubtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
            />
          </div>
        </div>

        {/* Blog Vitrini */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <span className="font-bold text-xs text-brand-accent uppercase tracking-wider block">
            📚 Blog & Gezi Rehberi Vitrini
          </span>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Üst Rozet</label>
            <input
              type="text"
              value={homeSettings?.blogSectionBadge || '📚 Phuket Gezi Rehberi'}
              onChange={(e) => setHomeSettings({ ...homeSettings, blogSectionBadge: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Ana Başlık</label>
            <input
              type="text"
              value={homeSettings?.blogSectionTitle || 'Seyahatiniz İçin İpuçları & Rotalar'}
              onChange={(e) => setHomeSettings({ ...homeSettings, blogSectionTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Alt Açıklama</label>
            <textarea
              rows={3}
              value={homeSettings?.blogSectionSubtitle || 'Phuket tatilinizi planlarken ihtiyacınız olan en güncel ada karşılaştırmaları.'}
              onChange={(e) => setHomeSettings({ ...homeSettings, blogSectionSubtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
