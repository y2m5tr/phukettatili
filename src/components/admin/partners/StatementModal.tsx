import { useState } from 'react';
import { Check, Copy, MessageCircle, Printer, X } from 'lucide-react';
import type { PartnerAgent } from '../../../data/adminInitialData';
import { generateStatementText, printStatement } from './statementUtils';
import type { AgentStats } from './types';

export interface StatementModalProps {
  statementAgent: PartnerAgent;
  agentStats: Record<string, AgentStats>;
  managerPhone: string;
  onClose: () => void;
}

// MODAL: ACENTA HESAP EKSTRESİ (STATEMENT) — PartnersTab'ten birebir taşındı.
export default function StatementModal({
  statementAgent,
  agentStats,
  managerPhone,
  onClose,
}: StatementModalProps) {
  const [copied, setCopied] = useState(false);

  const statementText = generateStatementText(statementAgent, agentStats, managerPhone);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-2 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Acenta Hakediş ve Mutabakat Ekstresi
            </h3>
            <p className="text-xs text-slate-400">
              {statementAgent.name} ({statementAgent.code})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-80 overflow-y-auto leading-relaxed">
          {statementText}
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href={`https://wa.me/${statementAgent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              statementText
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp İle Gönder</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printStatement(statementAgent, agentStats, managerPhone)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              title="Resmi A4 Acente Mutabakat Bordrosu Yazdır / PDF İndir"
            >
              <Printer className="w-4 h-4 text-brand-primary" />
              <span>Yazdır / PDF</span>
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(statementText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
