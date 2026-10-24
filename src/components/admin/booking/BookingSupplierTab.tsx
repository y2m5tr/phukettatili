import React from 'react';
import { Building, Briefcase } from 'lucide-react';
import {
  type Booking,
  type PartnerAgent,
  type SupplierItem,
  type TourCostItem,
  calculateAgentCommission,
  lookupTourCost,
} from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface BookingSupplierTabProps {
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  agents: PartnerAgent[];
  suppliers: SupplierItem[];
  tourCosts: TourCostItem[];
  showToast: (msg: string) => void;
}

export function BookingSupplierTab({
  formData,
  setFormData,
  agents,
  suppliers,
  tourCosts,
  showToast,
}: BookingSupplierTabProps) {
  return (
    <div className="space-y-4">
      {/* B2B Partner / Acenta */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            B2B Partner & Alt Acenta Komisyonu
          </span>
          {formData.agentId && (Number(formData.agentCommissionThb) || 0) > 0 && (
            <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
              Komisyon: {fmtMoney(Number(formData.agentCommissionThb) || 0)} THB
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Yönlendiren Acenta
            </label>
            <select
              value={formData.agentId || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (!selectedId) {
                  setFormData({
                    ...formData,
                    agentId: undefined,
                    agentName: undefined,
                    agentCommissionThb: 0,
                    agentCommissionStatus: 'pending',
                  });
                  return;
                }
                const selectedAgent = agents.find((a) => a.id === selectedId);
                if (selectedAgent) {
                  const comm = calculateAgentCommission(
                    selectedAgent,
                    Number(formData.totalPriceThb) || 0,
                    Number(formData.adultCount) || 1,
                    Number(formData.childCount) || 0
                  );
                  setFormData({
                    ...formData,
                    agentId: selectedAgent.id,
                    agentName: selectedAgent.name,
                    agentCommissionThb: comm,
                    agentCommissionStatus: formData.agentCommissionStatus || 'pending',
                  });
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs focus:outline-none font-medium"
            >
              <option value="">Doğrudan Satış / Acenta Yok</option>
              {agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.commissionType === 'percentage' ? `%${ag.commissionRate}` : `${ag.commissionRate} THB/Pax`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Komisyon Tutarı (THB)
            </label>
            <input
              type="number"
              value={formData.agentCommissionThb || 0}
              onChange={(e) =>
                setFormData({ ...formData, agentCommissionThb: Number(e.target.value) })
              }
              disabled={!formData.agentId}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 focus:outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Komisyon Durumu
            </label>
            <select
              value={formData.agentCommissionStatus || 'pending'}
              onChange={(e) =>
                setFormData({ ...formData, agentCommissionStatus: e.target.value as any })
              }
              disabled={!formData.agentId}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs focus:outline-none font-medium disabled:opacity-50"
            >
              <option value="pending">⏳ Beklemede</option>
              <option value="settled">✅ Ödendi / Kapatıldı</option>
              <option value="cancelled">❌ İptal Edildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tedarikçi & Maliyet */}
      <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            Tedarikçi Maliyeti & Kârlılık Hesabı
          </span>
          {Number(formData.totalPriceThb || 0) > 0 && (
            <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              Net Kâr:{' '}
              {fmtMoney(Math.max(
                0,
                Number(formData.totalPriceThb || 0) -
                  Number(formData.costThb || 0) -
                  (Number(formData.agentCommissionThb) || 0)
              ))}{' '}
              THB
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Tedarikçi Firma / Tekne Sahibi
            </label>
            <input
              type="text"
              list="registered-suppliers-list"
              placeholder="Örn: Andaman Wave Master, Seastar vb."
              value={formData.supplier || ''}
              onChange={(e) => {
                const sName = e.target.value;
                const primaryTour = formData.tours?.[0]?.tourTitle || formData.tourTitle;
                let newCost = formData.costThb;
                if (primaryTour && sName) {
                  const costRule = lookupTourCost(tourCosts, primaryTour, sName);
                  if (costRule) {
                    const aCount = Number(formData.adultCount) || 1;
                    const cCount = Number(formData.childCount) || 0;
                    newCost = costRule.netCostAdultThb * aCount + costRule.netCostChildThb * cCount;
                  }
                }
                setFormData({ ...formData, supplier: sName, costThb: newCost });
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
            />
            <datalist id="registered-suppliers-list">
              {suppliers.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
                Maliyet Gideri (THB)
              </label>
              {(() => {
                const primaryTour = formData.tours?.[0]?.tourTitle || formData.tourTitle;
                const match =
                  primaryTour && formData.supplier
                    ? lookupTourCost(tourCosts, primaryTour, formData.supplier)
                    : null;
                if (!match) return null;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const aCount = Number(formData.adultCount) || 1;
                      const cCount = Number(formData.childCount) || 0;
                      const calc =
                        match.netCostAdultThb * aCount + match.netCostChildThb * cCount;
                      setFormData({ ...formData, costThb: calc });
                      showToast(`Matris uygulandı: ${fmtMoney(calc)} THB`);
                    }}
                    className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                  >
                    ⚡ Matristen Doldur
                  </button>
                );
              })()}
            </div>
            <input
              type="number"
              placeholder="Tekneye ödenecek toplam tutar"
              value={formData.costThb || 0}
              onChange={(e) => setFormData({ ...formData, costThb: Number(e.target.value) })}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Tedarikçi Konfirmasyon No (Ref)
            </label>
            <input
              type="text"
              placeholder="Örn: AWM-8492"
              value={formData.supplierRefCode || ''}
              onChange={(e) =>
                setFormData({ ...formData, supplierRefCode: e.target.value.toUpperCase() })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-mono uppercase focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
              Tedarikçi Onay Durumu
            </label>
            <select
              value={formData.supplierStatus || 'pending'}
              onChange={(e) =>
                setFormData({ ...formData, supplierStatus: e.target.value as any })
              }
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-semibold focus:outline-none"
            >
              <option value="pending">⏳ Sipariş İletildi / Teyit Bekliyor</option>
              <option value="confirmed">✅ Tedarikçi Onayladı</option>
              <option value="cancelled">❌ Tekne Dolu / İptal</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/30">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.nationalParkFeeIncluded ?? false}
              onChange={(e) =>
                setFormData({ ...formData, nationalParkFeeIncluded: e.target.checked })
              }
              className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              Millî Park Giriş Harcı Fiyata DAHİLDİR
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
