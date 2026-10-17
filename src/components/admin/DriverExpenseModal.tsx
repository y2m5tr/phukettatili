import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Fuel,
  Plus,
  Send,
  Check,
  Calendar,
  User,
  Trash2,
  Wallet,
} from 'lucide-react';
import {
  type DriverExpenseItem,
  type DriverExpenseCategory,
  DRIVER_EXPENSE_CATEGORIES,
  INITIAL_DRIVER_EXPENSES,
  calculateDriverDailySettlement,
  generateDriverDayEndSettlementWhatsApp,
  getDriverExpenseWhatsAppUrl,
} from '../../lib/driverExpenses';
import type { DriverItem, VehicleItem } from '../../data/adminInitialData';

interface DriverExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers?: DriverItem[];
  vehicles?: VehicleItem[];
  showToast: (msg: string) => void;
  onAddFinanceExpense?: (expense: {
    category: string;
    amountThb: number;
    description: string;
    date: string;
  }) => void;
}

const STORAGE_KEY = 'phuket_driver_expenses_v1';

export default function DriverExpenseModal({
  isOpen,
  onClose,
  drivers = [],
  vehicles = [],
  showToast,
  onAddFinanceExpense,
}: DriverExpenseModalProps) {
  const [expenses, setExpenses] = useState<DriverExpenseItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_DRIVER_EXPENSES;
  });

  const [selectedDriverId, setSelectedDriverId] = useState<string>('drv-somchai');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [collectedCash, setCollectedCash] = useState<number>(5000);

  // New expense form
  const [category, setCategory] = useState<DriverExpenseCategory>('fuel_diesel');
  const [amount, setAmount] = useState<number>(1200);
  const [description, setDescription] = useState<string>('');
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('+66812345678');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      } catch {}
    }
  }, [expenses]);

  const activeDriver = useMemo<DriverItem>(() => {
    return (
      drivers.find((d) => d.id === selectedDriverId) || {
        id: selectedDriverId,
        fullName: 'Somchai Prasert',
        name: 'Somchai Prasert',
        phone: '+66812345678',
        role: 'driver',
        active: true,
        vehicleId: 'veh-minibus-2',
        assignedVehicle: 'VIP Van 35-1249',
      }
    );
  }, [drivers, selectedDriverId]);

  // Quick category select sets default amount
  const handleSelectCategory = (cat: DriverExpenseCategory) => {
    setCategory(cat);
    const def = DRIVER_EXPENSE_CATEGORIES[cat].defaultThb;
    if (def) setAmount(def);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      showToast('⚠️ Geçerli bir masraf tutarı giriniz.');
      return;
    }

    const newExp: DriverExpenseItem = {
      id: `DEXP-${Date.now().toString().slice(-4)}`,
      date: selectedDate,
      driverId: activeDriver.id,
      driverName: (activeDriver as any).fullName || (activeDriver as any).name || 'Şoför',
      vehiclePlate: (activeDriver as any).assignedVehicle || 'Van 35-1249',
      category,
      amountThb: amount,
      description: description.trim() || DRIVER_EXPENSE_CATEGORIES[category].label,
      receiptNumber: receiptNo.trim() || undefined,
      reimbursementStatus: 'deducted_from_handover',
      recordedAt: new Date().toISOString(),
    };

    setExpenses((prev) => [newExp, ...prev]);
    showToast(`✅ ${amount.toLocaleString()} THB ${DRIVER_EXPENSE_CATEGORIES[category].shortLabel} fişi eklendi!`);

    setDescription('');
    setReceiptNo('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('🗑️ Masraf fişi silindi.');
  };

  const settlement = useMemo(() => {
    return calculateDriverDailySettlement({
      driverId: activeDriver.id,
      date: selectedDate,
      collectedCashThb: collectedCash,
      expenses,
    });
  }, [activeDriver, selectedDate, collectedCash, expenses]);

  const whatsappMessage = useMemo(() => {
    return generateDriverDayEndSettlementWhatsApp({
      driverName: activeDriver.fullName || activeDriver.name || 'Şoför',
      vehiclePlate: (activeDriver as any).assignedVehicle || 'VIP Van 35-1249',
      date: selectedDate,
      collectedCashThb: collectedCash,
      expenses: settlement.driverExpenses,
    });
  }, [activeDriver, selectedDate, collectedCash, settlement]);

  const whatsappUrl = useMemo(() => {
    return getDriverExpenseWhatsAppUrl(activeDriver.phone || driverPhone, whatsappMessage);
  }, [activeDriver, driverPhone, whatsappMessage]);

  const [isHandoverVerified, setIsHandoverVerified] = useState(false);

  const handleVerifyHandover = () => {
    setIsHandoverVerified(true);
    if (onAddFinanceExpense) {
      settlement.driverExpenses.forEach((exp) => {
        onAddFinanceExpense({
          category: 'fuel',
          amountThb: exp.amountThb,
          description: `Şoför Saha Fişi (${activeDriver.fullName || activeDriver.name || 'Şoför'} - ${exp.vehiclePlate}): ${exp.description}`,
          date: exp.date,
        });
      });
      if (settlement.netHandoverToOfficeThb > 0) {
        onAddFinanceExpense({
          category: 'driver_handover_cash',
          amountThb: settlement.netHandoverToOfficeThb,
          description: `🤝 Şoför Gün Sonu Kasa Teslimi: ${activeDriver.fullName || activeDriver.name} (Tarih: ${selectedDate})`,
          date: selectedDate,
        });
      }
    }
    showToast(`✅ ${settlement.netHandoverToOfficeThb.toLocaleString()} THB şoför nakit teslimi onaylandı ve kasaya işlendi!`);
  };

  const handleSyncToFinance = () => {
    if (onAddFinanceExpense && settlement.driverExpenses.length > 0) {
      settlement.driverExpenses.forEach((exp) => {
        onAddFinanceExpense({
          category: 'fuel',
          amountThb: exp.amountThb,
          description: `Şoför Saha Fişi (${activeDriver.fullName || activeDriver.name || 'Şoför'} - ${exp.vehiclePlate}): ${exp.description}`,
          date: exp.date,
        });
      });
      showToast('🏦 Şoför masrafları ana muhasebe kasa defterine işlendi!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-surface-1 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Şoför Saha Yakıt, Otopark & Harç Masraf Masası
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider">
                  Driver Expense Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Benzin, havalimanı otoparkı, köprü geçişleri ve gün sonu nakit mahsuplaşma
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Driver Selector Strip */}
        <div className="px-6 py-3 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label htmlFor="driver-expense-select" className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Şoför:</span>
              </label>
              <select
                id="driver-expense-select"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                {drivers.length > 0 ? (
                  drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName || d.name} ({d.assignedVehicle || d.vehicleId || 'Araçsız'})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="drv-somchai">Somchai Prasert (Van 35-1249)</option>
                    <option value="drv-anan">Anan Sukhumvit (Van 30-8841)</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="driver-expense-date-select" className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tarih:</span>
              </label>
              <input
                id="driver-expense-date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="collected-cash-input" className="text-[11px] font-bold text-slate-500">Müşteriden Toplanan Nakit:</label>
            <div className="relative">
              <input
                id="collected-cash-input"
                type="number"
                min="0"
                step="100"
                value={collectedCash || ''}
                onChange={(e) => setCollectedCash(Number(e.target.value) || 0)}
                className="w-28 px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-600 focus:outline-none text-right pr-6"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">฿</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Quick Expense Entry */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-500" />
              <span>Yeni Saha Masraf Fişi Ekle</span>
            </h3>

            {/* Quick Category Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(DRIVER_EXPENSE_CATEGORIES) as DriverExpenseCategory[]).map((cat) => {
                const meta = DRIVER_EXPENSE_CATEGORIES[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold'
                        : 'bg-white dark:bg-surface-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base block">{meta.icon}</span>
                    <span className="text-[11px] font-semibold block truncate mt-0.5">{meta.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Tutar (THB) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-black text-sm text-amber-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Fiş / Fatura No</label>
                  <input
                    type="text"
                    placeholder="Örn: PTT-88219"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Açıklama / İstasyon Adı</label>
                <input
                  type="text"
                  placeholder="Örn: PTT Gas Station Thalang - 38L Diesel"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Masraf Fişini Kaydet</span>
              </button>
            </form>
          </div>

          {/* Right Column: Settlement Summary & Day List */}
          <div className="space-y-4 flex flex-col">
            {/* KPI Handover Result Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Gün Sonu Kasa Mahsuplaşması:
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">{selectedDate}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Toplanan Nakit</span>
                  <span className="text-sm font-mono font-bold text-white">
                    {settlement.collectedCashThb.toLocaleString()}฿
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-800/60">
                  <span className="text-[10px] text-rose-400 block uppercase font-bold">Düşülen Masraf</span>
                  <span className="text-sm font-mono font-bold text-rose-400">
                    -{settlement.totalExpensesThb.toLocaleString()}฿
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 block uppercase font-bold">Ofise Teslim (Net)</span>
                  <span className="text-base font-mono font-black text-emerald-400">
                    {settlement.netHandoverToOfficeThb.toLocaleString()}฿
                  </span>
                </div>
              </div>
            </div>

            {/* Expense List for this Driver & Date */}
            <div className="flex-1 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Günün Masraf Fişleri ({settlement.driverExpenses.length}):
              </span>

              {settlement.driverExpenses.length === 0 ? (
                <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
                  Bu tarih için kayıtlı masraf fişi bulunmuyor.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {settlement.driverExpenses.map((exp) => {
                    const meta = DRIVER_EXPENSE_CATEGORIES[exp.category];
                    return (
                      <div
                        key={exp.id}
                        className="p-3 rounded-xl bg-white dark:bg-surface-2 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{meta.icon}</span>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{exp.description}</span>
                            <span className="text-[10px] text-slate-400">
                              {exp.receiptNumber ? `Fiş No: ${exp.receiptNumber} • ` : ''}
                              {meta.shortLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                            -{exp.amountThb.toLocaleString()} THB
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-2/30 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Şoföre gün sonu nakit teslimat özetini Tayca WhatsApp ile gönder"
            >
              <Send className="w-3.5 h-3.5" />
              <span>🇹🇭 Şoföre Hesap Özeti Gönder (WhatsApp)</span>
            </a>

            {isHandoverVerified ? (
              <span className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>✓ Kasaya Teslim Alındı ({settlement.netHandoverToOfficeThb.toLocaleString()} THB)</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleVerifyHandover}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Şoförün getirdiği nakit Baht'ı ofis kasasına teslim al ve mühürle"
              >
                <Check className="w-3.5 h-3.5" />
                <span>🤝 Nakit Teslim Alındı ({settlement.netHandoverToOfficeThb.toLocaleString()} THB)</span>
              </button>
            )}

            {onAddFinanceExpense && settlement.driverExpenses.length > 0 && !isHandoverVerified && (
              <button
                type="button"
                onClick={handleSyncToFinance}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Masrafları Kasaya İşle</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 text-xs transition-all cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
