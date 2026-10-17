import React, { useState, useMemo } from 'react';
import {
  Building,
  DollarSign,
  Plus,
  Search,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Edit2,
  Trash2,
  X,
  FileText,
  Percent,
  AlertCircle,
  Printer,
} from 'lucide-react';
import {
  type Booking,
  type PartnerAgent,
  type AgentCommissionType,
  calculateAgentCommission,
} from '../../data/adminInitialData';

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
  const [agentForm, setAgentForm] = useState<Partial<PartnerAgent>>({});

  // Komisyon Ödeme Modalı
  const [payoutAgent, setPayoutAgent] = useState<PartnerAgent | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutNote, setPayoutNote] = useState<string>('');

  // Mutabakat / Ekstre Modalı
  const [statementAgent, setStatementAgent] = useState<PartnerAgent | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. Acenta Bazlı Rezervasyon & Komisyon İstatistikleri Hesaplama
  const agentStats = useMemo(() => {
    const stats: Record<
      string,
      {
        bookingCount: number;
        paxCount: number;
        totalRevenueThb: number;
        earnedCommissionThb: number;
        bookingList: Booking[];
      }
    > = {};

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
  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
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
    setAgentForm({});
  };

  // Acenta Sil
  const handleDeleteAgent = (id: string, name: string) => {
    if (!confirm(`"${name}" acentasını silmek istediğinizden emin misiniz?`)) return;
    const updated = agents.filter((a) => a.id !== id);
    onSaveAgents(updated);
    showToast(`🗑️ "${name}" acentası silindi.`);
  };

  // Komisyon Ödemesi Kaydet
  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
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
    showToast(`💰 ${payoutAgent.name} acentasına ${payoutAmount.toLocaleString()} THB komisyon ödemesi işlendi.`);
    setPayoutAgent(null);
    setPayoutAmount(0);
  };

  // WhatsApp Hakediş Ekstresi Metni Üret
  const generateStatementText = (agent: PartnerAgent) => {
    const s = agentStats[agent.id] || {
      bookingCount: 0,
      paxCount: 0,
      totalRevenueThb: 0,
      earnedCommissionThb: 0,
      bookingList: [],
    };
    const balance = Math.max(0, s.earnedCommissionThb - (agent.totalPaidCommissionThb || 0));

    const lines = [
      `📊 *PHUKET TATİLİ - ACENTA KOMİSYON VE MUTABAKAT EKSTRESİ*`,
      `🏢 *Acenta:* ${agent.name} (${agent.code})`,
      `👤 *Yetkili:* ${agent.contactPerson} (${agent.phone})`,
      `📅 *Rapor Tarihi:* ${new Date().toLocaleDateString('tr-TR')}`,
      `───────────────────────────────`,
      `👥 *Toplam Misafir:* ${s.paxCount} Kişi (${s.bookingCount} Rezervasyon)`,
      `💵 *Toplam Satış Cirosu:* ${s.totalRevenueThb.toLocaleString()} THB`,
      `📈 *Hak Edilen Toplam Komisyon:* ${s.earnedCommissionThb.toLocaleString()} THB`,
      `✅ *Daha Önce Ödenen:* ${(agent.totalPaidCommissionThb || 0).toLocaleString()} THB`,
      `⚠️ *Kalan Ödenecek Bakiye:* *${balance.toLocaleString()} THB*`,
      `───────────────────────────────`,
      `📋 *Rezervasyon Detayları:*`,
      ...s.bookingList.map(
        (b, idx) =>
          `${idx + 1}. ${b.tourDate} · ${b.customerName} · ${b.tourTitle} (${b.adultCount}Y) · Ciro: ${b.totalPriceThb.toLocaleString()} ฿`
      ),
      `───────────────────────────────`,
      `📞 Sorularınız ve ödeme dekontları için: +${managerPhone}`,
    ];

    return lines.join('\n');
  };

  // Yazdır / A4 PDF Mutabakat Bordrosu
  const handlePrintStatement = (agent: PartnerAgent) => {
    const text = generateStatementText(agent);
    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${agent.name} - Komisyon ve Mutabakat Bordrosu</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; line-height: 1.6; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 14px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
          .sub { font-size: 13px; color: #64748b; font-weight: 600; margin-top: 2px; }
          .meta { font-size: 12px; color: #475569; text-align: right; }
          .box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; white-space: pre-wrap; line-height: 1.65; }
          .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">PHUKET TATİLİ TRAVEL CO., LTD.</div>
            <div class="sub">B2B Partner Acenta Komisyon & Mutabakat Bordrosu</div>
          </div>
          <div class="meta">
            <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</div>
            <div><strong>Acenta Kodu:</strong> ${agent.code}</div>
          </div>
        </div>
        <div class="box">${text}</div>
        <div class="footer">
          Phuket Tatili Travel Co., Ltd. · 24/7 B2B Destek & Muhasebe: +${managerPhone} · www.phukettatili.com
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* 1. ÜST KPI KARTLARI */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Partner Acenta Sayısı */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kayıtlı Partner Acentalar
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
            {agents.length}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">Partner</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {agents.filter((a) => a.active).length} Aktif Acenta & Rehber
          </div>
        </div>

        {/* KPI 2: B2B Satış Cirosu */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              B2B Partner Satış Cirosu
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-serif">
            {totalPartnerRevenue.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Acentalar üzerinden gelen toplam satış
          </div>
        </div>

        {/* KPI 3: Hak Edilen Toplam Komisyon */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hak Edilen Toplam Komisyon
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400 font-serif">
            {totalEarnedCommission.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Ödenen: {totalPaidCommission.toLocaleString()} THB
          </div>
        </div>

        {/* KPI 4: Kalan Komisyon Borcu */}
        <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Ödenecek Komisyon Borcu
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-serif">
            {totalOutstandingCommission.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-semibold">THB</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Partnerlere ödenecek bekleyen hakediş
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. KONTROL ÇUBUĞU & ARAMA */}
      {/* ==================================================== */}
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
            setAgentForm({
              commissionType: 'percentage',
              commissionRate: 15,
              active: true,
            });
            setIsAgentModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-brand-primary text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Yeni Acenta / Temsilci Ekle</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 3. ACENTA CARİLERİ & KOMİSYON LİSTESİ */}
      {/* ==================================================== */}
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
                  const s = agentStats[a.id] || {
                    bookingCount: 0,
                    paxCount: 0,
                    totalRevenueThb: 0,
                    earnedCommissionThb: 0,
                    bookingList: [],
                  };
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
                            : `${a.commissionRate.toLocaleString()} ฿ / Kişi`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {s.totalRevenueThb.toLocaleString()} THB
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {s.bookingCount} Rezervasyon ({s.paxCount} Pax)
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sky-600 dark:text-sky-400 block">
                          {s.earnedCommissionThb.toLocaleString()} THB
                        </span>
                        <span className="text-xs text-slate-400 block">
                          Ödenen: {(a.totalPaidCommissionThb || 0).toLocaleString()} THB
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-sm font-black block font-mono ${
                            balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                          }`}
                        >
                          {balance.toLocaleString()} THB
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
                              onClick={() => {
                                setPayoutAgent(a);
                                setPayoutAmount(balance);
                                setPayoutNote(`${a.name} komisyon ödemesi`);
                              }}
                              title="Komisyon Ödemesi Kaydet"
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1 cursor-pointer"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Öde</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setStatementAgent(a)}
                            title="Hesap Ekstresi & WhatsApp Raporu"
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-sky-500" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingAgent(a);
                              setAgentForm(a);
                              setIsAgentModalOpen(true);
                            }}
                            title="Düzenle"
                            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAgent(a.id, a.name)}
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

      {/* ==================================================== */}
      {/* 4. MODAL: YENİ / DÜZENLE PARTNER ACENTA */}
      {/* ==================================================== */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-primary/10 text-brand-primary dark:text-brand-accent flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingAgent ? 'Acenta Bilgilerini Düzenle' : 'Yeni Partner Acenta / Satıcı Ekle'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    B2B alt acenta veya otel tur satış temsilcisi tanımlayın
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAgentModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Acenta / Satıcı Adı *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: İstanbul Tour Partner"
                    value={agentForm.name || ''}
                    onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Acenta Kodu (Kısa) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: IST-TRV"
                    value={agentForm.code || ''}
                    onChange={(e) => setAgentForm({ ...agentForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Şirket Resmi Unvanı (Varsa)
                </label>
                <input
                  type="text"
                  placeholder="Örn: İstanbul Seyahat ve Turizm A.Ş."
                  value={agentForm.companyTitle || ''}
                  onChange={(e) => setAgentForm({ ...agentForm, companyTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Yetkili / İletişim Kişisi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Serkan Bey"
                    value={agentForm.contactPerson || ''}
                    onChange={(e) => setAgentForm({ ...agentForm, contactPerson: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp / Telefon *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+90 532 999 11 22"
                    value={agentForm.phone || ''}
                    onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    Şehir / Bölge
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: İstanbul / TR veya Patong"
                    value={agentForm.cityOrZone || ''}
                    onChange={(e) => setAgentForm({ ...agentForm, cityOrZone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    E-posta (Opsiyonel)
                  </label>
                  <input
                    type="email"
                    placeholder="b2b@acenta.com"
                    value={agentForm.email || ''}
                    onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Komisyon Modeli */}
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/40 space-y-3">
                <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  Komisyon Hesaplama Modeli
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Komisyon Tipi
                    </label>
                    <select
                      value={agentForm.commissionType || 'percentage'}
                      onChange={(e) =>
                        setAgentForm({
                          ...agentForm,
                          commissionType: e.target.value as AgentCommissionType,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-xs focus:outline-none font-medium"
                    >
                      <option value="percentage">Yüzde (%) Ciro Üzerinden</option>
                      <option value="fixed_per_pax">Sabit Tutar (THB / Kişi Başı)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                      Oran / Tutar
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder={agentForm.commissionType === 'percentage' ? '%15' : '300 THB'}
                      value={agentForm.commissionRate || ''}
                      onChange={(e) =>
                        setAgentForm({ ...agentForm, commissionRate: Number(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agentActiveCheck"
                  checked={agentForm.active ?? true}
                  onChange={(e) => setAgentForm({ ...agentForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-primary"
                />
                <label htmlFor="agentActiveCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bu partner acenta şu an aktif (yeni rezervasyonlara atanabilir)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAgentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md hover:bg-brand-primary/90"
                >
                  ✓ {editingAgent ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. MODAL: KOMİSYON ÖDEMESİ YAP (PAYOUT) */}
      {/* ==================================================== */}
      {payoutAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Komisyon Ödemesi Kaydet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPayoutAgent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              <strong className="text-slate-900 dark:text-white">{payoutAgent.name}</strong> acentasına yaptığınız komisyon ödemesini cariden düşün.
            </p>

            <form onSubmit={handleConfirmPayout} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Ödenen Tutar (THB) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={payoutAmount || ''}
                  onChange={(e) => setPayoutAmount(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black text-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Ödeme Açıklaması / Dekont Notu
                </label>
                <input
                  type="text"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  placeholder="Örn: Ekim ayı hakediş havalesi (İş Bankası)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutAgent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  ✓ Ödemeyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. MODAL: ACENTA HESAP EKSTRESİ (STATEMENT) */}
      {/* ==================================================== */}
      {statementAgent && (
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
                onClick={() => setStatementAgent(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap text-slate-800 dark:text-slate-200 max-h-80 overflow-y-auto leading-relaxed">
              {generateStatementText(statementAgent)}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`https://wa.me/${statementAgent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  generateStatementText(statementAgent)
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
                  onClick={() => handlePrintStatement(statementAgent)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  title="Resmi A4 Acente Mutabakat Bordrosu Yazdır / PDF İndir"
                >
                  <Printer className="w-4 h-4 text-brand-primary" />
                  <span>Yazdır / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateStatementText(statementAgent));
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
                  onClick={() => setStatementAgent(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
