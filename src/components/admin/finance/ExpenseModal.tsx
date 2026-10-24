import { useState } from 'react';
import { Fuel, X } from 'lucide-react';
import {
  type ExpenseRecord,
  type ExpenseCategory,
  EXPENSE_CATEGORY_LABELS,
} from '../../../data/adminInitialData';
import { VAULT_ACCOUNTS, type VaultAccountId } from './vaultTypes';
import { fmtMoney } from '../../../lib/moneyFormat';

interface ExpenseModalProps {
  onSave: (expense: ExpenseRecord) => void;
  onClose: () => void;
  showToast: (msg: string) => void;
}

/**
 * Yeni harcama / gider fişi giriş modalı. Form state'i ve doğrulama
 * mantığı bileşene aittir; kalıcılık (liste güncelleme + localStorage)
 * parent'ın onSave callback'i üzerinden yapılır.
 */
export default function ExpenseModal({ onSave, onClose, showToast }: ExpenseModalProps) {
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('fuel');
  const [expenseAmount, setExpenseAmount] = useState<number>(1800);
  const [expenseAccount, setExpenseAccount] = useState<VaultAccountId>('office_cash');
  const [expenseVehicle, setExpenseVehicle] = useState<string>('');
  const [expenseTour, setExpenseTour] = useState<string>('');
  const [expenseNote, setExpenseNote] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleSaveExpense = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) {
      showToast('⚠️ Geçerli bir gider tutarı giriniz.');
      return;
    }
    if (!expenseTitle.trim()) {
      showToast('⚠️ Gider açıklaması zorunludur.');
      return;
    }

    const newExp: ExpenseRecord = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      date: expenseDate,
      category: expenseCategory,
      title: expenseTitle.trim(),
      amountThb: expenseAmount,
      paidFromAccount: expenseAccount,
      assignedVehicle: expenseVehicle ? expenseVehicle.trim() : undefined,
      assignedTour: expenseTour ? expenseTour.trim() : undefined,
      recordedBy: 'Murat Gençer (Ofis)',
      note: expenseNote.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSave(newExp);
    showToast(`✓ ${fmtMoney(expenseAmount)} THB tutarındaki gider kaydedildi! ⛽`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Yeni Harcama / Gider Fişi Gir
              </h3>
              <p className="text-[11px] text-slate-500">
                Ödeme yapılan kasadan otomatik düşülecektir.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Harcama Açıklaması *
            </label>
            <input
              type="text"
              required
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              placeholder="Örn: 1 Nolu Minibüs Dizel Yakıt (PTT Patong)"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Gider Kategorisi *
              </label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              >
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((catKey) => {
                  const item = EXPENSE_CATEGORY_LABELS[catKey];
                  return (
                    <option key={catKey} value={catKey}>
                      {item.icon} {item.label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Ödemenin Çıktığı Kasa *
              </label>
              <select
                value={expenseAccount}
                onChange={(e) => setExpenseAccount(e.target.value as VaultAccountId)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              >
                {(Object.keys(VAULT_ACCOUNTS) as VaultAccountId[]).map((k) => (
                  <option key={k} value={k}>
                    {VAULT_ACCOUNTS[k].icon} {VAULT_ACCOUNTS[k].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Tutar (THB) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                required
                value={expenseAmount || ''}
                onChange={(e) => setExpenseAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full pl-3 pr-14 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-black font-mono text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="absolute right-3.5 top-2 text-xs font-bold text-slate-400 font-mono">THB</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              {[500, 1000, 1800, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setExpenseAmount(amt)}
                  className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {fmtMoney(amt)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Tarih *
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                İlgili Araç / Hat (Opsiyonel)
              </label>
              <input
                type="text"
                value={expenseVehicle}
                onChange={(e) => setExpenseVehicle(e.target.value)}
                placeholder="Örn: 1 Nolu Hat"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              İlgili Tur Adı (Opsiyonel)
            </label>
            <input
              type="text"
              value={expenseTour}
              onChange={(e) => setExpenseTour(e.target.value)}
              placeholder="Örn: Phi Phi & Maya Bay Sürat Teknesi"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Ek Not / Fiş Detayı
            </label>
            <input
              type="text"
              value={expenseNote}
              onChange={(e) => setExpenseNote(e.target.value)}
              placeholder="Örn: 52 Litre B7 dizel yakıt alındı, fiş ofiste"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>Gideri Kasaya İşle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
