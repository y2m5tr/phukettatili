import { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  type Booking,
  type PartnerAgent,
  calculateAgentCommission,
} from '../../data/adminInitialData';
import { fmtMoney } from '../../lib/moneyFormat';
import PartnersKpiCards from './partners/PartnersKpiCards';
import PartnersTable from './partners/PartnersTable';
import AgentFormModal from './partners/AgentFormModal';
import PayoutModal from './partners/PayoutModal';
import StatementModal from './partners/StatementModal';
import type { AgentStats } from './partners/types';

// 500 satır kuralı: KPI kartları, cari tablosu ve üç modal ./partners/
// klasörüne taşındı. Bu kabuk state, istatistik hesapları ve kaydetme
// mantığını tutar — davranış birebir aynı.
interface PartnersTabProps {
  agents: PartnerAgent[];
  bookings: Booking[];
  onSaveAgents: (agents: PartnerAgent[]) => void;
  showToast: (msg: string) => void;
  managerPhone?: string;
}

export default function PartnersTab({
  agents,
  bookings,
  onSaveAgents,
  showToast,
  managerPhone = '66828950665',
}: PartnersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active_only'>('all');

  // Modal State'leri
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<PartnerAgent | null>(null);

  // Komisyon Ödeme Modalı
  const [payoutAgent, setPayoutAgent] = useState<PartnerAgent | null>(null);
  const [payoutInitialAmount, setPayoutInitialAmount] = useState<number>(0);
  const [payoutInitialNote, setPayoutInitialNote] = useState<string>('');

  // Mutabakat / Ekstre Modalı
  const [statementAgent, setStatementAgent] = useState<PartnerAgent | null>(null);

  // 1. Acenta Bazlı Rezervasyon & Komisyon İstatistikleri Hesaplama
  const agentStats = useMemo(() => {
    const stats: Record<string, AgentStats> = {};

    agents.forEach((a) => {
      stats[a.id] = {
        bookingCount: 0,
        paxCount: 0,
        totalRevenueThb: 0,
        earnedCommissionThb: 0,
        bookingList: [],
      };
    });

    bookings.forEach((b) => {
      if (b.status === 'cancelled') return;
      if (!b.agentId) return;

      const targetAgent = agents.find((a) => a.id === b.agentId);
      if (!targetAgent) return;

      const totalPax = (b.adultCount || 1) + (b.childCount || 0);
      const earned =
        b.agentCommissionThb !== undefined && b.agentCommissionThb !== null
          ? b.agentCommissionThb
          : calculateAgentCommission(targetAgent, b.totalPriceThb, b.adultCount, b.childCount);

      if (stats[targetAgent.id]) {
        stats[targetAgent.id].bookingCount += 1;
        stats[targetAgent.id].paxCount += totalPax;
        stats[targetAgent.id].totalRevenueThb += b.totalPriceThb;
        stats[targetAgent.id].earnedCommissionThb += earned;
        stats[targetAgent.id].bookingList.push(b);
      }
    });

    return stats;
  }, [agents, bookings]);

  // Toplam KPI'lar
  const totalPartnerRevenue = useMemo(() => {
    return Object.values(agentStats).reduce((acc, s) => acc + s.totalRevenueThb, 0);
  }, [agentStats]);

  const totalEarnedCommission = useMemo(() => {
    return Object.values(agentStats).reduce((acc, s) => acc + s.earnedCommissionThb, 0);
  }, [agentStats]);

  const totalPaidCommission = useMemo(() => {
    return agents.reduce((acc, a) => acc + (a.totalPaidCommissionThb || 0), 0);
  }, [agents]);

  const totalOutstandingCommission = useMemo(() => {
    return Math.max(0, totalEarnedCommission - totalPaidCommission);
  }, [totalEarnedCommission, totalPaidCommission]);

  // Filtrelenmiş Acentalar
  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      if (statusFilter === 'active_only' && !a.active) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.contactPerson.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        (a.cityOrZone || '').toLowerCase().includes(q)
      );
    });
  }, [agents, searchQuery, statusFilter]);

  // Acenta Ekle / Düzenle Kaydet
  const handleSaveAgent = (agentForm: Partial<PartnerAgent>) => {
    if (!agentForm.name || !agentForm.code) {
      showToast('⚠️ Acenta adı ve acenta kodu zorunludur.');
      return;
    }

    if (editingAgent) {
      const updated = agents.map((a) =>
        a.id === editingAgent.id ? ({ ...a, ...agentForm } as PartnerAgent) : a
      );
      onSaveAgents(updated);
      showToast(`✅ "${agentForm.name}" acentası güncellendi.`);
    } else {
      const newAgent: PartnerAgent = {
        id: `agent-${Date.now().toString().slice(-6)}`,
        name: agentForm.name.trim(),
        companyTitle: agentForm.companyTitle?.trim() || undefined,
        code: agentForm.code.trim().toUpperCase(),
        contactPerson: agentForm.contactPerson?.trim() || 'Yetkili',
        phone: agentForm.phone?.trim() || '',
        email: agentForm.email?.trim() || undefined,
        cityOrZone: agentForm.cityOrZone?.trim() || 'Phuket',
        commissionType: agentForm.commissionType || 'percentage',
        commissionRate: Number(agentForm.commissionRate) || 10,
        totalPaidCommissionThb: 0,
        active: true,
        notes: agentForm.notes?.trim() || undefined,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onSaveAgents([newAgent, ...agents]);
      showToast(`🎉 Yeni partner acenta "${newAgent.name}" eklendi.`);
    }

    setIsAgentModalOpen(false);
    setEditingAgent(null);
  };

  // Acenta Sil
  const handleDeleteAgent = (id: string, name: string) => {
    if (!confirm(`"${name}" acentasını silmek istediğinizden emin misiniz?`)) return;
    const updated = agents.filter((a) => a.id !== id);
    onSaveAgents(updated);
    showToast(`🗑️ "${name}" acentası silindi.`);
  };

  // Komisyon Ödemesi Kaydet
  const handleConfirmPayout = (payoutAmount: number) => {
    if (!payoutAgent || payoutAmount <= 0) return;

    const updated = agents.map((a) =>
      a.id === payoutAgent.id
        ? {
            ...a,
            totalPaidCommissionThb: (a.totalPaidCommissionThb || 0) + payoutAmount,
          }
        : a
    );

    onSaveAgents(updated);
    showToast(`💰 ${payoutAgent.name} acentasına ${fmtMoney(payoutAmount)} THB komisyon ödemesi işlendi.`);
    setPayoutAgent(null);
    setPayoutInitialAmount(0);
  };

  return (
    <div className="space-y-6">
      {/* 1. ÜST KPI KARTLARI */}
      <PartnersKpiCards
        agents={agents}
        totalPartnerRevenue={totalPartnerRevenue}
        totalEarnedCommission={totalEarnedCommission}
        totalPaidCommission={totalPaidCommission}
        totalOutstandingCommission={totalOutstandingCommission}
      />

      {/* 2. KONTROL ÇUBUĞU & ARAMA */}
      <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Acenta adı, kodu, yetkili veya telefon ara..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">Tüm Partnerler ({agents.length})</option>
            <option value="active_only">Yalnızca Aktifler</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAgent(null);
            setIsAgentModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-brand-primary text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Acenta / Temsilci Ekle</span>
        </button>
      </div>

      {/* 3. ACENTA CARİLERİ & KOMİSYON LİSTESİ */}
      <PartnersTable
        filteredAgents={filteredAgents}
        agentStats={agentStats}
        onPayout={(a, balance) => {
          setPayoutAgent(a);
          setPayoutInitialAmount(balance);
          setPayoutInitialNote(`${a.name} komisyon ödemesi`);
        }}
        onStatement={(a) => setStatementAgent(a)}
        onEdit={(a) => {
          setEditingAgent(a);
          setIsAgentModalOpen(true);
        }}
        onDelete={handleDeleteAgent}
      />

      {/* 4. MODAL: YENİ / DÜZENLE PARTNER ACENTA */}
      {isAgentModalOpen && (
        <AgentFormModal
          editingAgent={editingAgent}
          onClose={() => {
            setIsAgentModalOpen(false);
            setEditingAgent(null);
          }}
          onSave={handleSaveAgent}
        />
      )}

      {/* 5. MODAL: KOMİSYON ÖDEMESİ YAP (PAYOUT) */}
      {payoutAgent && (
        <PayoutModal
          payoutAgent={payoutAgent}
          initialAmount={payoutInitialAmount}
          initialNote={payoutInitialNote}
          onClose={() => setPayoutAgent(null)}
          onConfirm={(amount) => handleConfirmPayout(amount)}
        />
      )}

      {/* 6. MODAL: ACENTA HESAP EKSTRESİ (STATEMENT) */}
      {statementAgent && (
        <StatementModal
          statementAgent={statementAgent}
          agentStats={agentStats}
          managerPhone={managerPhone}
          onClose={() => setStatementAgent(null)}
        />
      )}
    </div>
  );
}
