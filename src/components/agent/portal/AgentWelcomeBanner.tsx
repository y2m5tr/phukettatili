import { Building2, ShieldCheck } from 'lucide-react';
import type { PartnerAgent } from '../../../data/adminInitialData';

export interface AgentWelcomeBannerProps {
  agent: PartnerAgent;
}

// Acente Profil Karşılama Bandı (AgentPortalApp'ten birebir taşındı).
// <main> içinde render edilir.
export default function AgentWelcomeBanner({ agent }: AgentWelcomeBannerProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 sm:p-7 border border-indigo-900/50 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
              {agent.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {agent.code}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Doğrulanmış Acente
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {agent.companyTitle || 'Yetkili Turizm Acentesi & Otel Concierge Partneri'} · Bölge: {agent.cityOrZone || 'Phuket'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Sözleşmeli Komisyonunuz</span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {agent.commissionType === 'percentage' ? `%${agent.commissionRate}` : `${agent.commissionRate} THB`}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {agent.commissionType === 'percentage' ? 'Her rezervasyonda ciro üzerinden' : 'Yetişkin yolcu başına net'}
          </span>
        </div>
      </div>
    </div>
  );
}
