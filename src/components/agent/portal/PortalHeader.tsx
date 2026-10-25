import { Building2, Phone } from 'lucide-react';
import type { PartnerAgent } from '../../../data/adminInitialData';

export interface PortalHeaderProps {
  agent: PartnerAgent;
  supportPhone: string;
}

// Üst Navbar (AgentPortalApp'ten birebir taşındı)
export default function PortalHeader({ agent, supportPhone }: PortalHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
            PHUKET<span className="text-amber-400">TATİLİ</span>
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            B2B Partner Extranet
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex flex-col items-end">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              {agent.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Kod: <strong>{agent.code}</strong> · Komisyon:{' '}
              {agent.commissionType === 'percentage' ? `%${agent.commissionRate}` : `${agent.commissionRate} THB/Pax`}
            </span>
          </div>

          <a
            href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(
              `Merhaba Phuket Tatili Operasyon, Acenta Kodumuz: ${agent.code} (${agent.name}). Bir konuda yardıma ihtiyacım var.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all text-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">7/24 Merkez Destek</span>
          </a>
        </div>
      </div>
    </header>
  );
}
