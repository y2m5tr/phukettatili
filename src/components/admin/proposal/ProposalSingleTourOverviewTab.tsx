import React from 'react';
import { Sparkles, Phone, Mail, Calendar, Hotel } from 'lucide-react';
import {
  PROPOSAL_CATALOG_TOURS,
  TRANSPORT_META,
  MEAL_PLAN_META,
  NATIONAL_PARK_META,
  getCategoryIcon,
  type CuratedProposalData,
  type CuratedProposalDay,
  type TransportType,
  type MealPlanType,
  type NationalParkStatus,
  type CatalogTourPreset,
} from '../../../lib/curatedProposal';
import { HOTEL_ZONES, detectHotelZone } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface ProposalSingleTourOverviewTabProps {
  proposal: CuratedProposalData;
  setProposal: React.Dispatch<React.SetStateAction<CuratedProposalData>>;
  singleDay: CuratedProposalDay;
  handleApplySingleTourPreset: (preset: CatalogTourPreset) => void;
  handleUpdateSingleDay: (updates: Partial<CuratedProposalDay>) => void;
  setSendPhone: (val: string) => void;
  setSendEmail: (val: string) => void;
}

export function ProposalSingleTourOverviewTab({
  proposal,
  setProposal,
  singleDay,
  handleApplySingleTourPreset,
  handleUpdateSingleDay,
  setSendPhone,
  setSendEmail,
}: ProposalSingleTourOverviewTabProps) {
  return (
    <div className="space-y-4 text-xs">
      {/* Hızlı Katalog Şablonları */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Hazır Katalog Şablonu Yükle:</span>
          </label>
          <span className="text-[10px] text-slate-400">Tek tıkla saatlik akış yükler</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {PROPOSAL_CATALOG_TOURS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplySingleTourPreset(preset)}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                singleDay.tourTitle === preset.tourTitle || proposal.packageTitle === preset.tourTitle
                  ? 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-300 font-bold'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <span className="block truncate font-bold text-[11px]">
                {getCategoryIcon(preset.category)} {preset.tourTitle}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {fmtMoney(preset.priceThb)} THB · {preset.tourDuration}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Misafir Bilgileri */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Misafir Adı / Hitap:
          </label>
          <input
            type="text"
            value={proposal.customerName}
            onChange={(e) => setProposal({ ...proposal, customerName: e.target.value })}
            placeholder="Örn: Mert & Selin Çetin"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1 text-[11px]">
              <Phone className="w-3 h-3 text-emerald-500" />
              <span>Telefon (WhatsApp):</span>
            </label>
            <input
              type="text"
              value={proposal.customerPhone || ''}
              onChange={(e) => {
                const val = e.target.value;
                setProposal((prev) => ({ ...prev, customerPhone: val }));
                setSendPhone(val);
              }}
              placeholder="Örn: +90 532 123 4567"
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1 text-[11px]">
              <Mail className="w-3 h-3 text-sky-500" />
              <span>E-posta:</span>
            </label>
            <input
              type="email"
              value={proposal.customerEmail || ''}
              onChange={(e) => {
                const val = e.target.value;
                setProposal((prev) => ({ ...prev, customerEmail: val }));
                setSendEmail(val);
              }}
              placeholder="Örn: misafir@gmail.com"
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Yetişkin Sayısı:
            </label>
            <input
              type="number"
              min={1}
              value={proposal.adultCount}
              onChange={(e) => setProposal({ ...proposal, adultCount: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Çocuk Sayısı:
            </label>
            <input
              type="number"
              min={0}
              value={proposal.childCount}
              onChange={(e) => setProposal({ ...proposal, childCount: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            />
          </div>
        </div>

        {/* Tur Tarihi & Alınış Oteli */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Tur Tarihi:</span>
            </label>
            <input
              type="date"
              value={proposal.singleTourDate || singleDay.date || ''}
              onChange={(e) => {
                const val = e.target.value;
                setProposal((prev) => ({
                  ...prev,
                  singleTourDate: val,
                  days: prev.days.map((d, i) => (i === 0 ? { ...d, date: val } : d)),
                }));
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
              <Hotel className="w-3.5 h-3.5 text-amber-500" />
              <span>Alınış Bölgesi:</span>
            </label>
            <select
              value={proposal.hotelZone || 'Patong & Kalim'}
              onChange={(e) => {
                const zone = e.target.value;
                setProposal((prev) => ({
                  ...prev,
                  hotelZone: zone,
                  days: prev.days.map((d, i) => (i === 0 ? { ...d, hotelZone: zone } : d)),
                }));
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-[11px]"
            >
              {HOTEL_ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Alınış Oteli:
          </label>
          <input
            type="text"
            value={proposal.hotelName}
            onChange={(e) => {
              const h = e.target.value;
              const detected = detectHotelZone(h);
              setProposal((prev) => ({
                ...prev,
                hotelName: h,
                hotelZone: detected || prev.hotelZone,
                days: prev.days.map((d, i) => (i === 0 ? { ...d, hotelName: h, hotelZone: detected || d.hotelZone } : d)),
              }));
            }}
            placeholder="Örn: Katathani Phuket Beach Resort"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Tur Başlığı:
          </label>
          <input
            type="text"
            value={proposal.packageTitle}
            onChange={(e) => {
              const val = e.target.value;
              setProposal((prev) => ({
                ...prev,
                packageTitle: val,
                days: prev.days.map((d, i) => (i === 0 ? { ...d, tourTitle: val } : d)),
              }));
            }}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
          />
        </div>

        {/* Lojistik Saatler & Donanım */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
              ⏰ Lobi Alınış Aralığı:
            </label>
            <input
              type="text"
              value={singleDay.pickupWindow || ''}
              onChange={(e) => handleUpdateSingleDay({ pickupWindow: e.target.value })}
              placeholder="07:15 - 07:30"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-[11px]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
              ⏱️ Tur Süresi:
            </label>
            <input
              type="text"
              value={singleDay.tourDuration || ''}
              onChange={(e) => handleUpdateSingleDay({ tourDuration: e.target.value })}
              placeholder="08:30 - 16:30"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
              🚤 Ulaşım / Araç Tipi:
            </label>
            <select
              value={singleDay.transportType || 'speedboat'}
              onChange={(e) => {
                const t = e.target.value as TransportType;
                handleUpdateSingleDay({ transportType: t });
                setProposal((prev) => ({
                  ...prev,
                  singleTourVesselInfo: TRANSPORT_META[t]?.label || prev.singleTourVesselInfo,
                }));
              }}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-semibold"
            >
              {(Object.keys(TRANSPORT_META) as TransportType[]).map((k) => (
                <option key={k} value={k}>{TRANSPORT_META[k].icon} {TRANSPORT_META[k].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
              🍽️ Yemek Planı:
            </label>
            <select
              value={singleDay.mealPlan || 'buffet_lunch'}
              onChange={(e) => handleUpdateSingleDay({ mealPlan: e.target.value as MealPlanType })}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-semibold"
            >
              {(Object.keys(MEAL_PLAN_META) as MealPlanType[]).map((k) => (
                <option key={k} value={k}>{MEAL_PLAN_META[k].icon} {MEAL_PLAN_META[k].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
              🏞️ Milli Park Harcı:
            </label>
            <select
              value={singleDay.nationalParkFeeStatus || 'included'}
              onChange={(e) => handleUpdateSingleDay({ nationalParkFeeStatus: e.target.value as NationalParkStatus })}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-semibold"
            >
              {(Object.keys(NATIONAL_PARK_META) as NationalParkStatus[]).map((k) => (
                <option key={k} value={k}>{NATIONAL_PARK_META[k].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
              💵 Tur Fiyatı (THB):
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={singleDay.priceThb || 0}
              onChange={(e) => handleUpdateSingleDay({ priceThb: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-xs"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
            Öne Çıkan Vurgu & Açıklama:
          </label>
          <textarea
            rows={2}
            value={singleDay.highlight || ''}
            onChange={(e) => handleUpdateSingleDay({ highlight: e.target.value })}
            placeholder="Turun öne çıkan özellikleri..."
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px]"
          />
        </div>

        {/* Danışman Bilgileri */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
            👨‍💼 Teklifi Hazırlayan Danışman:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={proposal.agentInfo.name}
              onChange={(e) =>
                setProposal({
                  ...proposal,
                  agentInfo: { ...proposal.agentInfo, name: e.target.value },
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-white dark:bg-slate-900 text-xs font-bold"
            />
            <input
              type="text"
              value={proposal.agentInfo.phone}
              onChange={(e) =>
                setProposal({
                  ...proposal,
                  agentInfo: { ...proposal.agentInfo, phone: e.target.value },
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-white dark:bg-slate-900 text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
