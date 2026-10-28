import { useState } from 'react';
import { History, Trash2, RefreshCw } from 'lucide-react';
import { getAuditLog, clearAuditLog, type AuditLogEntry } from '../../lib/cmsSync';

interface AuditLogTabProps {
  showToast: (msg: string) => void;
}

export default function AuditLogTab({ showToast }: AuditLogTabProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>(() => getAuditLog());

  const handleRefresh = () => {
    setEntries(getAuditLog());
    showToast('Geçmiş yenilendi.');
  };

  const handleClear = () => {
    clearAuditLog();
    setEntries([]);
    showToast('Değişiklik geçmişi temizlendi.');
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const actionLabels: Record<AuditLogEntry['action'], string> = {
    save: 'Kaydet',
    delete: 'Sil',
    sync: 'Senkron',
  };

  const actionColors: Record<AuditLogEntry['action'], string> = {
    save: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    delete: 'bg-red-500/10 text-red-600 dark:text-red-400',
    sync: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <History className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Değişiklik Geçmişi</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              CMS koleksiyonlarında yapılan son 50 değişiklik
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yenile</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={entries.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Temizle</span>
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400 dark:text-slate-300 mb-2">Henüz Kayıt Yok</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            CMS koleksiyonlarında bir değişiklik yaptığınızda burada görünecek.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${actionColors[entry.action]}`}>
                      {actionLabels[entry.action]}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {entry.key}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {entry.summary}
                  </p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
