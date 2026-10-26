import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  User,
  DollarSign,
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
import { readLocalCollection, saveCmsCollection } from '../../lib/cmsSync';
import { GuideExpenseKpiCards } from './guideExpense/GuideExpenseKpiCards';
import { GuideExpenseForm } from './guideExpense/GuideExpenseForm';
import { GuideExpenseTable } from './guideExpense/GuideExpenseTable';

interface GuideExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers?: DriverItem[];
  showToast: (msg: string) => void;
}

export default function GuideExpenseModal({
  isOpen,
  onClose,
  drivers = [],
  showToast,
}: GuideExpenseModalProps) {
  const [expenses, setExpenses] = useState<GuideExpenseItem[]>(() => {
    return readLocalCollection<GuideExpenseItem[]>('guide-expenses', INITIAL_GUIDE_EXPENSES) || INITIAL_GUIDE_EXPENSES;
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

  const handleAddExpense = (e: React.SyntheticEvent) => {
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

    const next = [newExp, ...expenses];
    setExpenses(next);
    void saveCmsCollection('guide-expenses', next, (err) => showToast(`⚠️ ${err}`));
    showToast(`✅ ${fmtMoney(amount)} THB ${GUIDE_EXPENSE_CATEGORIES[category].shortLabel} fişi eklendi!`);

    setDescription('');
    setReceiptNo('');
  };

  const handleDeleteExpense = (id: string) => {
    const next = expenses.filter((e) => e.id !== id);
    setExpenses(next);
    void saveCmsCollection('guide-expenses', next, (err) => showToast(`⚠️ ${err}`));
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
          <GuideExpenseKpiCards settlement={settlement} />

          {/* Quick Expense Entry Form */}
          <GuideExpenseForm
            category={category}
            handleSelectCategory={handleSelectCategory}
            amount={amount}
            setAmount={setAmount}
            description={description}
            setDescription={setDescription}
            receiptNo={receiptNo}
            setReceiptNo={setReceiptNo}
            handleAddExpense={handleAddExpense}
          />

          {/* Expenses List for Active Date & Guide */}
          <GuideExpenseTable
            activeGuide={activeGuide}
            selectedDate={selectedDate}
            settlement={settlement}
            handleDeleteExpense={handleDeleteExpense}
          />

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
