
import { Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import {
  PROPOSAL_CATALOG_TOURS,
  TRANSPORT_META,
  MEAL_PLAN_META,
  NATIONAL_PARK_META,
  getCategoryIcon,
  type CuratedProposalData,
  type CuratedProposalDay,
  type CuratedProposalHotelStay,
  type TransportType,
  type MealPlanType,
  type NationalParkStatus,
  type CatalogTourPreset,
} from '../../../lib/curatedProposal';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface ProposalPackageDaysTabProps {
  proposal: CuratedProposalData;
  proposalHotels: CuratedProposalHotelStay[];
  expandedDayId: string | null;
  setExpandedDayId: (id: string | null) => void;
  handleAddTourFromCatalog: (preset: CatalogTourPreset) => void;
  handleUpdateDay: (dayId: string, updates: Partial<CuratedProposalDay>) => void;
  handleDeleteDay: (dayId: string) => void;
  handleMoveDay: (index: number, direction: 'up' | 'down') => void;
}

export function ProposalPackageDaysTab({
  proposal,
  proposalHotels,
  expandedDayId,
  setExpandedDayId,
  handleAddTourFromCatalog,
  handleUpdateDay,
  handleDeleteDay,
  handleMoveDay,
}: ProposalPackageDaysTabProps) {
  return (
    <div className="space-y-4">
      {/* Hızlı Katalogdan Tur Ekleme */}
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-amber-500" />
            <span>Katalogdan Tek Tıkla Tur Ekle:</span>
          </span>
          <span className="text-[10px] text-slate-400">{PROPOSAL_CATALOG_TOURS.length} Seçenek</span>
        </label>
        <select
          defaultValue=""
          onChange={(e) => {
            const found = PROPOSAL_CATALOG_TOURS.find((t) => t.id === e.target.value);
            if (found) {
              handleAddTourFromCatalog(found);
              e.target.value = '';
            }
          }}
          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="" disabled>
            ➕ Listeye eklenecek turu seçiniz...
          </option>
          {PROPOSAL_CATALOG_TOURS.map((t) => (
            <option key={t.id} value={t.id}>
              {getCategoryIcon(t.category)} {t.tourTitle} ({fmtMoney(t.priceThb)} ฿)
            </option>
          ))}
        </select>
      </div>

      {/* Günler Listesi & Kartları */}
      <div className="space-y-3">
        {proposal.days.map((day, idx) => {
          const isExpanded = expandedDayId === day.id;
          return (
            <div
              key={day.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-xs transition-all"
            >
              {/* Kart Başlığı */}
              <div
                className="p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {day.dayNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {day.dayTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {day.tourTitle} · {day.pickupWindow}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mr-1">
                    {fmtMoney(day.priceThb)}฿
                  </span>

                  <button
                    type="button"
                    onClick={() => handleMoveDay(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    title="Yukarı Taşı"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveDay(idx, 'down')}
                    disabled={idx === proposal.days.length - 1}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    title="Aşağı Taşı"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteDay(day.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Günü Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Açılır Gün Detayları */}
              {isExpanded && (
                <div className="p-3.5 pt-0 space-y-2.5 text-xs border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Gün Başlığı (Örn: Romantik Günbatımı Yat Turu):
                    </label>
                    <input
                      type="text"
                      value={day.dayTitle}
                      onChange={(e) => handleUpdateDay(day.id, { dayTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Tur Adı:
                    </label>
                    <input
                      type="text"
                      value={day.tourTitle}
                      onChange={(e) => handleUpdateDay(day.id, { tourTitle: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>

                  {proposalHotels.length > 1 && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        🏨 Bu Günün Alınış Oteli:
                      </label>
                      <select
                        value={day.hotelName || proposalHotels[0]?.hotelName || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const matched = proposalHotels.find((h) => h.hotelName === val);
                          handleUpdateDay(day.id, {
                            hotelName: val,
                            hotelZone: matched?.hotelZone || proposal.hotelZone,
                          });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                      >
                        {proposalHotels.map((h, hIdx) => (
                          <option key={h.id || hIdx} value={h.hotelName}>
                            #{hIdx + 1}: {h.hotelName || `Otel ${hIdx + 1}`} ({h.hotelZone})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        ⏰ Lobi Alınış Aralığı:
                      </label>
                      <input
                        type="text"
                        value={day.pickupWindow}
                        onChange={(e) => handleUpdateDay(day.id, { pickupWindow: e.target.value })}
                        placeholder="07:15 - 07:30"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        ⏳ Tur Süresi:
                      </label>
                      <input
                        type="text"
                        value={day.tourDuration}
                        onChange={(e) => handleUpdateDay(day.id, { tourDuration: e.target.value })}
                        placeholder="08:30 - 16:30"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        🚤 Ulaşım / Araç Tipi:
                      </label>
                      <select
                        value={day.transportType}
                        onChange={(e) => handleUpdateDay(day.id, { transportType: e.target.value as TransportType })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold"
                      >
                        {(Object.keys(TRANSPORT_META) as TransportType[]).map((k) => (
                          <option key={k} value={k}>
                            {TRANSPORT_META[k].icon} {TRANSPORT_META[k].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        🍽️ Yemek & İkram:
                      </label>
                      <select
                        value={day.mealPlan}
                        onChange={(e) => handleUpdateDay(day.id, { mealPlan: e.target.value as MealPlanType })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold"
                      >
                        {(Object.keys(MEAL_PLAN_META) as MealPlanType[]).map((k) => (
                          <option key={k} value={k}>
                            {MEAL_PLAN_META[k].icon} {MEAL_PLAN_META[k].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        🏞️ Milli Park Durumu:
                      </label>
                      <select
                        value={day.nationalParkFeeStatus}
                        onChange={(e) => handleUpdateDay(day.id, { nationalParkFeeStatus: e.target.value as NationalParkStatus })}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold"
                      >
                        {(Object.keys(NATIONAL_PARK_META) as NationalParkStatus[]).map((k) => (
                          <option key={k} value={k}>
                            {NATIONAL_PARK_META[k].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                        💵 Günlük Fiyat (THB):
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={day.priceThb}
                        onChange={(e) => handleUpdateDay(day.id, { priceThb: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                      Öne Çıkan Deneyim Açıklaması:
                    </label>
                    <textarea
                      rows={2}
                      value={day.highlight}
                      onChange={(e) => handleUpdateDay(day.id, { highlight: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
