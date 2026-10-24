import { Landmark, ArrowRightLeft, ArrowRight } from 'lucide-react';
import {
  type PaymentRecord,
  type PaymentMethod,
  PAYMENT_METHOD_LABELS,
} from '../../../data/adminInitialData';
import { VAULT_ACCOUNTS, type VaultAccountId, type VirmanRecord } from './vaultTypes';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface VaultBalances {
  balances: Record<VaultAccountId, number>;
  totalLiquid: number;
}

interface VaultPanelProps {
  vaultBalances: VaultBalances;
  virmans: VirmanRecord[];
  methodTotals: Record<PaymentMethod, number>;
  payments: PaymentRecord[];
  setIsVirmanModalOpen: (open: boolean) => void;
  setVirmanSource: (account: VaultAccountId) => void;
  onDeleteVirman: (id: string) => void;
}

export default function VaultPanel({
  vaultBalances,
  virmans,
  methodTotals,
  payments,
  setIsVirmanModalOpen,
  setVirmanSource,
  onDeleteVirman,
}: VaultPanelProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Vault Top Control & Overview Bar */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold text-xl">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Kurumsal Kasa & Banka Hesapları (Multi-Account Vault)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Nakit ofis kasası, K-Bank PromptPay, TR bankası ve Wise döviz bakiyeleri canlı virman yönetimi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Konsolide Likit Varlık</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-serif">
              {fmtMoney(vaultBalances.totalLiquid)} THB
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsVirmanModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-md shadow-brand-primary/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Hesaplar Arası Virman Yap</span>
          </button>
        </div>
      </div>

      {/* 4 Ana Kurumsal Kasa Kartı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(VAULT_ACCOUNTS) as VaultAccountId[]).map((vaultKey) => {
          const info = VAULT_ACCOUNTS[vaultKey];
          const balance = vaultBalances.balances[vaultKey] || 0;
          const share = vaultBalances.totalLiquid > 0 ? Math.round((balance / vaultBalances.totalLiquid) * 100) : 0;

          return (
            <div
              key={vaultKey}
              className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-brand-primary/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {info.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[170px]" title={info.detail}>
                        {info.detail}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {info.currency}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Kasa Bakiyesi</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif mt-0.5">
                    {fmtMoney(balance)}{' '}
                    <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
                  </div>

                  {/* Pay bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-brand-primary dark:bg-brand-accent h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, share))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>Likit Payı: %{share}</span>
                    <span>Aktif Kasa</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setVirmanSource(vaultKey);
                    setIsVirmanModalOpen(true);
                  }}
                  className="text-xs font-bold text-brand-primary dark:text-brand-accent hover:underline flex items-center gap-1"
                >
                  <span>Buradan Fon Aktar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Virman Transfer Geçmişi Tablosu */}
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-brand-primary dark:text-brand-accent" />
              <span>Son Hesaplar Arası Virman Transferleri</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Kasalar arasında aktarılan nakit ve banka fon kayıtları.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300">
            {virmans.length} Virman Kaydı
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Tarih & Kod</th>
                <th className="py-3 px-4">Kaynak Kasa</th>
                <th className="py-3 px-4">Hedef Kasa</th>
                <th className="py-3 px-4">Tutar (THB)</th>
                <th className="py-3 px-4">İşlemi Yapan</th>
                <th className="py-3 px-4">Açıklama</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {virmans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Henüz kaydedilmiş virman transferi bulunmuyor.
                  </td>
                </tr>
              ) : (
                virmans.map((v) => {
                  const src = VAULT_ACCOUNTS[v.sourceAccount];
                  const dst = VAULT_ACCOUNTS[v.targetAccount];
                  return (
                    <tr key={v.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">{v.id}</span>
                        <span className="text-[10px] text-slate-400">{v.date}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <span>{src.icon}</span>
                          <span>{src.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span>{dst.icon}</span>
                          <span>{dst.name}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-black text-slate-900 dark:text-white">
                          {fmtMoney(v.amountThb)} THB
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {v.transferredBy}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate" title={v.note}>
                        {v.note}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteVirman(v.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 text-xs transition-colors"
                          title="Virman Kaydını Sil"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alt Bölüm: Ödeme Yöntemleri Bazında Detaylı Kırılım */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Ödeme Yöntemleri Bazında Ham Tahsilat Dağılımı
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(PAYMENT_METHOD_LABELS).map(([key, info]) => {
            const amount = methodTotals[key as PaymentMethod] || 0;
            const txCount = payments.filter((p) => p.method === key).length;

            return (
              <div
                key={key}
                className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{info.icon}</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {info.label}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      {txCount} Tahsilat Fişi
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {fmtMoney(amount)} THB
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
