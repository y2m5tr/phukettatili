import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { OptionKind, OptionLibrary } from '../../../lib/inclusionLibrary';
import { EMPTY_OPTION_LIBRARY } from '../../../lib/inclusionLibrary';

/**
 * Ayarlar sekmesindeki merkezi "Dahil/Hariç Havuzu" yönetimi.
 *
 * Tur düzenleyicideki chip üzerindeki silme (TourInclusionsTab) tur bağlamında
 * çalışır; bu ekran ise TURDAN BAĞIMSIZ tüm havuzu tek yerden yönetir:
 * listele, ekle, sil. Durum sahibi AdminDashboard'dur (useAdminCollections →
 * `inclusionLibrary` + `rememberLibraryOption`/`forgetLibraryOption`); bu
 * bileşen salt kontrollü bir görünümdür ve Supabase'e doğrudan dokunmaz.
 *
 * DİKKAT — davranış kuralı: `forgetOption` havuzdan siler ama HİÇBİR TURUN
 * kendi `included`/`excluded` listesine dokunmaz (inclusionLibrary.ts sözleşmesi).
 * Bir turda kullanımda olan madde havuzdan silinirse tur onu korumaya devam
 * eder; yalnızca gelecekteki öneri listesinden çıkar. UI'da bu uyarı görünür.
 *
 * Düzenleme bilinçli olarak YOK: bir maddeyi değiştirmek = sil + ekle.
 * (YAGNI; rememberOption/forgetOption ikilisi bunu zaten güvenli yapar.)
 */
interface SettingsInclusionLibrarySectionProps {
  inclusionLibrary?: OptionLibrary | null;
  onRememberOption?: (kind: OptionKind, item: string) => void;
  onForgetOption?: (kind: OptionKind, item: string) => void;
  showToast?: (msg: string) => void;
}

const KIND_LABELS: Record<OptionKind, string> = {
  included: 'Dahil Olanlar',
  excluded: 'Hariç Olanlar',
};

export function SettingsInclusionLibrarySection({
  inclusionLibrary,
  onRememberOption,
  onForgetOption,
  showToast,
}: SettingsInclusionLibrarySectionProps) {
  const library = inclusionLibrary ?? EMPTY_OPTION_LIBRARY;
  const [drafts, setDrafts] = useState<Record<OptionKind, string>>({
    included: '',
    excluded: '',
  });

  const addOption = (kind: OptionKind) => {
    const value = drafts[kind].trim();
    if (!value) return;
    if (library[kind].includes(value)) {
      showToast?.(`"${value}" zaten havuzda.`);
      return;
    }
    onRememberOption?.(kind, value);
    setDrafts((prev) => ({ ...prev, [kind]: '' }));
    showToast?.(`"${value}" havuza eklendi.`);
  };

  const removeOption = (kind: OptionKind, item: string) => {
    onForgetOption?.(kind, item);
    showToast?.(`"${item}" havuzdan çıkarıldı.`);
  };

  return (
    <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
        Dahil / Hariç Havuzu
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Tur düzenleyicide önerilen kalıcı seçenek listesi. Buradan silmek yalnızca
        havuzdan çıkarır — turların kendi dahil/hariç listelerine dokunmaz.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {(Object.keys(KIND_LABELS) as OptionKind[]).map((kind) => (
          <div key={kind} className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              {KIND_LABELS[kind]}
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5">
                {library[kind].length}
              </span>
            </h3>

            <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {library[kind].length === 0 && (
                <li className="text-xs text-slate-400 italic">Havuz boş.</li>
              )}
              {library[kind].map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2"
                >
                  <span className="min-w-0 truncate">{item}</span>
                  {onForgetOption && (
                    <button
                      type="button"
                      onClick={() => removeOption(kind, item)}
                      className="shrink-0 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                      title={`"${item}" havuzdan çıkar`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {onRememberOption && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={drafts[kind]}
                  onChange={(e) =>
                    setDrafts((prev) => ({ ...prev, [kind]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addOption(kind);
                    }
                  }}
                  placeholder="Yeni seçenek yaz…"
                  className="flex-1 min-w-0 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
                />
                <button
                  type="button"
                  onClick={() => addOption(kind)}
                  className="shrink-0 p-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white transition"
                  title={`${KIND_LABELS[kind]} havuzuna ekle`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
