import { ArrowRightLeft, X } from 'lucide-react';
import { VAULT_ACCOUNTS, type VaultAccountId } from './vaultTypes';

/**
 * Hesaplar arası virman / para transferi modalı (presentational).
 * Form state'i FinanceTab'da kalır çünkü VaultPanel'deki "Fon Aktar"
 * butonu kaynak kasayı dışarıdan set eder ve değerler modal kapanınca
 * korunur — bu davranışı değiştirmemek için state parent'ta tutulur.
 */
interface VirmanModalProps {
  virmanSource: VaultAccountId;
  setVirmanSource: (v: VaultAccountId) => void;
  virmanTarget: VaultAccountId;
  setVirmanTarget: (v: VaultAccountId) => void;
  virmanAmount: number;
  setVirmanAmount: (v: number) => void;
  virmanDate: string;
  setVirmanDate: (v: string) => void;
  virmanBy: string;
  setVirmanBy: (v: string) => void;
  virmanNote: string;
  setVirmanNote: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function VirmanModal({
  virmanSource,
  setVirmanSource,
  virmanTarget,
  setVirmanTarget,
  virmanAmount,
  setVirmanAmount,
  virmanDate,
  setVirmanDate,
  virmanBy,
  setVirmanBy,
  virmanNote,
  setVirmanNote,
  onSubmit,
  onClose,
}: VirmanModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Başlığı */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Hesaplar Arası Virman / Para Transferi
              </h3>
              <p className="text-[11px] text-slate-400">
                Nakit kasa ve banka hesapları arasında fon aktarımı yapın.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {/* Kaynak ve Hedef Kasa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Çıkış Yapılacak (Kaynak) Kasa *
              </label>
              <select
                value={virmanSource}
                onChange={(e) => setVirmanSource(e.target.value as VaultAccountId)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              >
                {(Object.keys(VAULT_ACCOUNTS) as VaultAccountId[]).map((k) => (
                  <option key={k} value={k}>
                    {VAULT_ACCOUNTS[k].icon} {VAULT_ACCOUNTS[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Giriş Yapılacak (Hedef) Kasa *
              </label>
              <select
                value={virmanTarget}
                onChange={(e) => setVirmanTarget(e.target.value as VaultAccountId)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              >
                {(Object.keys(VAULT_ACCOUNTS) as VaultAccountId[]).map((k) => (
                  <option key={k} value={k} disabled={k === virmanSource}>
                    {VAULT_ACCOUNTS[k].icon} {VAULT_ACCOUNTS[k].name} {k === virmanSource ? '(Aynı Kasa Seçilemez)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tutar & Hızlı Butonlar */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Virman Tutarı (THB) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="100"
                required
                value={virmanAmount || ''}
                onChange={(e) => setVirmanAmount(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black font-mono text-slate-900 dark:text-white focus:outline-none"
                placeholder="0"
              />
              <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                THB
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[5000, 10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setVirmanAmount(amt)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-brand-primary/10 hover:text-brand-primary text-slate-600 dark:text-slate-300 transition-colors"
                >
                  +{amt.toLocaleString()} THB
                </button>
              ))}
            </div>
          </div>

          {/* Tarih & Personel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                İşlem Tarihi
              </label>
              <input
                type="date"
                required
                value={virmanDate}
                onChange={(e) => setVirmanDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                İşlemi Yapan Personel
              </label>
              <input
                type="text"
                required
                value={virmanBy}
                onChange={(e) => setVirmanBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Açıklama / Dekont Notu
            </label>
            <input
              type="text"
              value={virmanNote}
              onChange={(e) => setVirmanNote(e.target.value)}
              placeholder="Örn: Şoför nakit tahsilatlarının K-Bank ATM hesabına yatırılması"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Butonlar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Virmanı Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
