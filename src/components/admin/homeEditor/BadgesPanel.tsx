import { Shield } from 'lucide-react';
import type { HomeEditorPanelProps } from './types';

// SEKME 3: GÜVEN ROZETLERİ (4 ROZET)
export default function BadgesPanel({ homeSettings, setHomeSettings }: HomeEditorPanelProps) {
  return (
    <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand-accent" />
          <span>4 Güven & Kalite Rozeti (Hero Altı Strip)</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Ziyaretçilere ilk 3 saniyede güven veren 4 rozetin ikonu, başlığı, açıklaması ve vurgu etiketini özelleştirin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[0, 1, 2, 3].map((idx) => {
          const badges = homeSettings?.trustBadges || [];
          const b = badges[idx] || {
            icon: idx === 0 ? '🇹🇷' : idx === 1 ? '⭐' : idx === 2 ? '🛡️' : '💬',
            highlight: '',
            title: '',
            desc: '',
          };

          const updateBadge = (field: string, val: string) => {
            const updated = [...badges];
            updated[idx] = { ...b, [field]: val };
            setHomeSettings({ ...homeSettings, trustBadges: updated });
          };

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-xs text-brand-accent uppercase tracking-wider">
                  Rozet #{idx + 1}
                </span>
                <input
                  type="text"
                  title="Emoji / İkon"
                  value={b.icon || ''}
                  onChange={(e) => updateBadge('icon', e.target.value)}
                  className="w-12 text-center py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Vurgu Etiketi (Mini Tag)</label>
                <input
                  type="text"
                  value={b.highlight || ''}
                  onChange={(e) => updateBadge('highlight', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Ana Başlık</label>
                <input
                  type="text"
                  value={b.title || ''}
                  onChange={(e) => updateBadge('title', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={b.desc || ''}
                  onChange={(e) => updateBadge('desc', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
