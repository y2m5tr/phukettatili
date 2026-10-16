import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  UserCheck,
  Plus,
  Send,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  User,
  Receipt,
  Trash2,
  DollarSign,
  Wallet,
  Compass,
} from 'lucide-react';
import {
  type GuideExpenseItem,
  type GuideExpenseCategory,
  GUIDE_EXPENSE_CATEGORIES,
  INITIAL_GUIDE_EXPENSES,
  calculateGuideDailySettlement,
  generateGuideDayEndSettlementWhatsApp,
  getGuideExpenseWhatsAppUrl,
} from '../../lib/guideExpenses';
import type { DriverItem } from '../../data/adminInitialData';

interface GuideExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers?: DriverItem[];
  showToast: (msg: string) => void;
}

const STORAGE_KEY = 'phuket_guide_expenses_v1';

export default function GuideExpenseModal({
  isOpen,
  onClose,
  drivers = [],
  showToast,
}: GuideExpenseModalProps) {
  const [expenses, setExpenses] = useState<GuideExpenseItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_GUIDE_EXPENSES;
  });

  // Filter staff to guides or both
  const guideStaff = useMemo(() => {
    const list = drivers.filter((d) => d.role === 'guide' || d.role === 'both');
    if (list.length > 0) return list;
    // Fallback if no specific guide role exists yet
    return drivers.length > 0
      ? drivers
      : [
          {
            id: 'gui-narin',
            fullName: 'Narin "Noi" Saelim',
            name: 'Narin "Noi" Saelim',
            phone: '+66898765432',
            role: 'guide' as const,
            active: true,
          },
        ];
  }, [drivers]);

  const [selectedGuideId, setSelectedGuideId] = useState<string>(() => {
    return guideStaff[0]?.id || 'gui-narin';
  });

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [collectedCash, setCollectedCash] = useState<number>(3500);

  // New expense form
  const [category, setCategory] = useState<GuideExpenseCategory>('taxi_grab_bolt');
  const [amount, setAmount] = useState<number>(350);
  const [description, setDescription] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      } catch {}
    }
  }, [expenses]);

  const activeGuide = useMemo<DriverItem>(() => {
    return (
      guideStaff.find((g) => g.id === selectedGuideId) ||
      drivers.find((d) => d.id === selectedGuideId) || {
        id: selectedGuideId,
        fullName: 'Narin "Noi" Saelim',
        name: 'Narin "Noi" Saelim',
        phone: '+66898765432',
        role: 'guide',
        active: true,
      }
    );
  }, [guideStaff, drivers, selectedGuideId]);

  // Quick category select sets default amount
  const handleSelectCategory = (cat: GuideExpenseCategory) => {
    setCategory(cat);
    const def = GUIDE_EXPENSE_CATEGORIES[cat].defaultThb;
    if (def) setAmount(def);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      showToast('⚠️ Geçerli bir masraf tutarı giriniz.');
      return;
    }

    const newExp: GuideExpenseItem = {
      id: `GEXP-${Date.now().toString().slice(-4)}`,
      date: selectedDate,
      guideId: activeGuide.id,
      guideName: activeGuide.fullName || activeGuide.name || 'Rehber',
      category,
      amountThb: amount,
      description: description.trim() || GUIDE_EXPENSE_CATEGORIES[category].label,
      receiptNumber: receiptNo.trim() || undefined,
      reimbursementStatus: 'deducted_from_handover',
      recordedAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExp, ...prev]);
    showToast(`✅ ${amount.toLocaleString()} THB ${GUIDE_EXPENSE_CATEGORIES[category].shortLabel} fişi eklendi!`);

    setDescription('');
    setReceiptNo('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('🗑️ Masraf fişi silindi.');
  };

  const settlement = useMemo(() => {
    return calculateGuideDailySettlement({
      guideId: activeGuide.id,
      date: selectedDate,
      collectedCashThb: collectedCash,
      expenses,
    });
  }, [activeGuide, selectedDate, collectedCash, expenses]);

  const whatsappMessage = useMemo(() => {
    return generateGuideDayEndSettlementWhatsApp({
      guideName: activeGuide.fullName || activeGuide.name || 'Rehber',
      date: selectedDate,
      collectedCashThb: collectedCash,
      expenses: settlement.guideExpenses,
    });
  }, [activeGuide, selectedDate, collectedCash, settlement]);

  const whatsappUrl = useMemo(() => {
    return getGuideExpenseWhatsAppUrl(activeGuide.phone, whatsappMessage);
  }, [activeGuide, whatsappMessage]);

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappMessage);
    setCopied(true);
    showToast('📋 Rehber gün sonu hesap özeti panoya kopyalandı!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-expense-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-700 dark:text-teal-300">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h3 id="guide-expense-modal-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🗣️ Rehber Masraf & Saha Harcama Masası</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-black">
                  Saha & Taksi / Grab
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rehberin taksi/Grab ile müşteri karşılama, otele gidiş, yemek ve acil saha harcamaları mahsuplaşması.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Bar: Guide Select, Date & Cash Input */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {/* Guide Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-500" />
                <span>Rehber Kadrosu</span>
              </label>
              <select
                value={selectedGuideId}
                onChange={(e) => setSelectedGuideId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {guideStaff.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.fullName || g.name} {g.phone ? `(${g.phone})` : ''} {g.role === 'both' ? '• Şoför/Rehber' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-500" />
                <span>Operasyon Tarihi</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            {/* Collected Guest Cash Input */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rehberin Topladığı Nakit (THB)</span>
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={collectedCash}
                onChange={(e) => setCollectedCash(Number(e.target.value) || 0)}
                placeholder="Örn: 3500"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>
          </div>

          {/* Settlement KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" />
                <span>Toplanan Nakit</span>
              </p>
              <p className="text-xl sm:text-2xl font-black mt-1 text-emerald-700 dark:text-emerald-300">
                {settlement.collectedCashThb.toLocaleString()} <span className="text-xs font-normal">THB</span>
              </p>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">Misafirlerden tahsil edilen</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span>🗣️</span>
                <span>Toplam Rehber Masrafı</span>
              </p>
              <p className="text-xl sm:text-2xl font-black mt-1 text-rose-700 dark:text-rose-300">
                - {settlement.totalExpensesThb.toLocaleString()} <span className="text-xs font-normal">THB</span>
              </p>
              <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">{settlement.guideExpenses.length} adet fiş/harcama</p>
            </div>

            <div className={`p-4 rounded-2xl border ${
              settlement.reimbursementDueThb > 0
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-950 dark:text-amber-200'
                : 'bg-teal-500/10 border-teal-500/20 text-teal-950 dark:text-teal-200'
            }`}>
              <p className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span>{settlement.reimbursementDueThb > 0 ? '💸' : '💰'}</span>
                <span>{settlement.reimbursementDueThb > 0 ? 'Ofisten Rehbere Ödenecek' : 'Ofise Teslim Edilecek Net'}</span>
              </p>
              <p className={`text-xl sm:text-2xl font-black mt-1 ${
                settlement.reimbursementDueThb > 0
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-teal-700 dark:text-teal-300'
              }`}>
                {settlement.reimbursementDueThb > 0
                  ? `+ ${settlement.reimbursementDueThb.toLocaleString()}`
                  : settlement.netHandoverToOfficeThb.toLocaleString()}{' '}
                <span className="text-xs font-normal">THB</span>
              </p>
              <p className="text-[10px] opacity-80 mt-0.5">
                {settlement.reimbursementDueThb > 0
                  ? 'Rehber cebinden fazla harcadı'
                  : 'Nakit kasa teslimatı'}
              </p>
            </div>
          </div>

          {/* Quick Expense Entry Form */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-teal-500" />
                <span>Yeni Rehber Harcaması / Fiş Ekle</span>
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Taksi / Grab, Otel Karşılama, Yemek ve İkram Masrafları
              </span>
            </div>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(GUIDE_EXPENSE_CATEGORIES) as GuideExpenseCategory[]).map((catKey) => {
                const meta = GUIDE_EXPENSE_CATEGORIES[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleSelectCategory(catKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-400/40'
                        : 'bg-white dark:bg-surface-3 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.shortLabel}</span>
                    {meta.defaultThb && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        isSelected ? 'bg-teal-700/60 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        ~{meta.defaultThb}฿
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Masraf Tutarı (THB)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    required
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">THB</span>
                </div>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Açıklama / Güzergâh / Not
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Grab Taxi Patong -> Kata misafir karşılama"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Receipt className="w-3 h-3 text-slate-400" />
                  <span>Fiş / Makbuz No</span>
                </label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="GRB-1234"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-surface-3 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Fişi Kaydet</span>
                </button>
              </div>
            </form>
          </div>

          {/* Expenses List for Active Date & Guide */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-teal-500" />
                <span>
                  {activeGuide.fullName || activeGuide.name} — {selectedDate} Masraf Kayıtları ({settlement.guideExpenses.length})
                </span>
              </h4>
            </div>

            {settlement.guideExpenses.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
                Bu tarihte bu rehbere ait henüz bir masraf kaydı bulunmuyor. Yukarıdan taksi, yemek veya ikram fişi ekleyebilirsiniz.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Açıklama</th>
                      <th className="p-3">Fiş No</th>
                      <th className="p-3 text-right">Tutar (THB)</th>
                      <th className="p-3 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-surface-2 font-medium">
                    {settlement.guideExpenses.map((exp) => {
                      const catMeta = GUIDE_EXPENSE_CATEGORIES[exp.category];
                      return (
                        <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 font-bold text-[11px]">
                              <span>{catMeta.icon}</span>
                              <span>{catMeta.shortLabel}</span>
                            </span>
                          </td>
                          <td className="p-3 text-slate-800 dark:text-slate-200">
                            {exp.description}
                          </td>
                          <td className="p-3">
                            {exp.receiptNumber ? (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                                {exp.receiptNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-black text-rose-600 dark:text-rose-400">
                            - {exp.amountThb.toLocaleString()} THB
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* WhatsApp Day-End Summary Card */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  📱 Gün Sonu Rehber WhatsApp Mutabakat Raporu
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
                </button>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp ile Gönder</span>
                </a>
              </div>
            </div>

            {/* Message Preview */}
            <pre className="p-3 rounded-xl bg-white dark:bg-surface-3 border border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {whatsappMessage}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-surface-2 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rehberin nakit teslimatı Patong ofis kasasına girildiğinde muhasebe kaydı otomatik güncellenir.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
