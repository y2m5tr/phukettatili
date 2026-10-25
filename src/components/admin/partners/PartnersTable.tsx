import { DollarSign, Edit2, FileText, Phone, Trash2 } from 'lucide-react';
import type { PartnerAgent } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';
import { EMPTY_AGENT_STATS, type AgentStats } from './types';

export interface PartnersTableProps {
  filteredAgents: PartnerAgent[];
  agentStats: Record<string, AgentStats>;
  onPayout: (agent: PartnerAgent, balance: number) => void;
  onStatement: (agent: PartnerAgent) => void;
  onEdit: (agent: PartnerAgent) => void;
  onDelete: (id: string, name: string) => void;
}

// ACENTA CARİLERİ & KOMİSYON LİSTESİ (PartnersTab'ten birebir taşındı)
export default function PartnersTable({
  filteredAgents,
  agentStats,
  onPayout,
  onStatement,
  onEdit,
  onDelete,
}: PartnersTableProps) {
  return (
    <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Acenta Kodu & Adı</th>
              <th className="py-3.5 px-4">İletişim & Bölge</th>
              <th className="py-3.5 px-4">Komisyon Oranı</th>
              <th className="py-3.5 px-4">Satış & Ciro</th>
              <th className="py-3.5 px-4">Hak Edilen Komisyon</th>
              <th className="py-3.5 px-4">Kalan Bakiye</th>
              <th className="py-3.5 px-4 text-right">Eylemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAgents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Arama kriterlerine uygun partner acenta bulunamadı.
                </td>
              </tr>
            ) : (
              filteredAgents.map((a) => {
                const s = agentStats[a.id] || EMPTY_AGENT_STATS;
                const balance = Math.max(0, s.earnedCommissionThb - (a.totalPaidCommissionThb || 0));

                return (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {a.code}
                        </span>
                        {!a.active && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                            Pasif
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white block mt-0.5">
                        {a.name}
                      </span>
                      {a.companyTitle && (
                        <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                          {a.companyTitle}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block text-xs">
                        {a.contactPerson}
                      </span>
                      <a
                        href={`https://wa.me/${a.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" /> {a.phone}
                      </a>
                      {a.cityOrZone && (
                        <span className="text-[11px] text-slate-400 block">
                          📍 {a.cityOrZone}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
                        {a.commissionType === 'percentage'
                          ? `%${a.commissionRate} Ciro`
                          : `${fmtMoney(a.commissionRate)} ฿ / Kişi`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {fmtMoney(s.totalRevenueThb)} THB
                      </span>
                      <span className="text-xs text-slate-500 block">
                        {s.bookingCount} Rezervasyon ({s.paxCount} Pax)
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-sky-600 dark:text-sky-400 block">
                        {fmtMoney(s.earnedCommissionThb)} THB
                      </span>
                      <span className="text-xs text-slate-400 block">
                        Ödenen: {fmtMoney((a.totalPaidCommissionThb || 0))} THB
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-sm font-black block font-mono ${
                          balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                        }`}
                      >
                        {fmtMoney(balance)} THB
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          balance > 0
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {balance > 0 ? 'Borçlu' : 'Sıfır Bakiye'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {balance > 0 && (
                          <button
                            type="button"
                            onClick={() => onPayout(a, balance)}
                            title="Komisyon Ödemesi Kaydet"
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Öde</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onStatement(a)}
                          title="Hesap Ekstresi & WhatsApp Raporu"
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-sky-500" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(a)}
                          title="Düzenle"
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(a.id, a.name)}
                          title="Sil"
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
