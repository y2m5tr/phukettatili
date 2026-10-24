import React from 'react';
import { CheckCircle2, XCircle, Gift, Trash2 } from 'lucide-react';
import type { CuratedProposalData } from '../../../lib/curatedProposal';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface ProposalInclusionsTabProps {
  proposal: CuratedProposalData;
  setProposal: React.Dispatch<React.SetStateAction<CuratedProposalData>>;
  isSingleTour: boolean;
  newTipText: string;
  setNewTipText: (val: string) => void;
  handleAddTip: () => void;
  handleDeleteTip: (index: number) => void;
  newInclusionText: string;
  setNewInclusionText: (val: string) => void;
  handleAddInclusion: () => void;
  handleDeleteInclusion: (index: number) => void;
  newExclusionText: string;
  setNewExclusionText: (val: string) => void;
  handleAddExclusion: () => void;
  handleDeleteExclusion: (index: number) => void;
  newGiftText: string;
  setNewGiftText: (val: string) => void;
  handleAddGift: () => void;
  handleDeleteGift: (index: number) => void;
}

export function ProposalInclusionsTab({
  proposal,
  setProposal,
  isSingleTour,
  newTipText,
  setNewTipText,
  handleAddTip,
  handleDeleteTip,
  newInclusionText,
  setNewInclusionText,
  handleAddInclusion,
  handleDeleteInclusion,
  newExclusionText,
  setNewExclusionText,
  handleAddExclusion,
  handleDeleteExclusion,
  newGiftText,
  setNewGiftText,
  handleAddGift,
  handleDeleteGift,
}: ProposalInclusionsTabProps) {
  return (
    <div className="space-y-4 text-xs">
      {/* Yanınızda Getirmeniz Önerilenler (Özellikle Tekli Turda Çok Önemli) */}
      {isSingleTour && (
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
          <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
            <span>🎒</span>
            <span>Yanınızda Getirmeniz Önerilenler ({(proposal.singleTourTips || []).length}):</span>
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {(proposal.singleTourTips || []).map((tip, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-[11px]"
              >
                <span className="text-amber-900 dark:text-amber-300 font-medium">🎒 {tip}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteTip(idx)}
                  className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Örn: Güneş gözlüğü, su geçirmez kılıf..."
              value={newTipText}
              onChange={(e) => setNewTipText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTip()}
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <button
              type="button"
              onClick={handleAddTip}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Ekle
            </button>
          </div>
        </div>
      )}

      {/* Dahil Olanlar */}
      <div>
        <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Pakete Dahil Olan Hizmetler ({proposal.inclusions.length}):</span>
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {proposal.inclusions.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]"
            >
              <span className="text-slate-700 dark:text-slate-300">✓ {item}</span>
              <button
                type="button"
                onClick={() => handleDeleteInclusion(idx)}
                className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                title="Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Yeni dahil olan madde..."
            value={newInclusionText}
            onChange={(e) => setNewInclusionText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddInclusion()}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
          <button
            type="button"
            onClick={handleAddInclusion}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
          >
            Ekle
          </button>
        </div>
      </div>

      {/* Hariç Olanlar */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
          <XCircle className="w-4 h-4 text-rose-500" />
          <span>Pakete Dahil Olmayanlar ({proposal.exclusions.length}):</span>
        </label>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {proposal.exclusions.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]"
            >
              <span className="text-slate-700 dark:text-slate-300">✕ {item}</span>
              <button
                type="button"
                onClick={() => handleDeleteExclusion(idx)}
                className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Yeni hariç olan madde..."
            value={newExclusionText}
            onChange={(e) => setNewExclusionText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddExclusion()}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
          <button
            type="button"
            onClick={handleAddExclusion}
            className="px-3 py-1.5 rounded-xl bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Ekle
          </button>
        </div>
      </div>

      {/* VIP İkram & Sürprizler */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5 flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-purple-500" />
          <span>Kişiye Özel İkram & Sürprizler ({proposal.specialGifts?.length || 0}):</span>
        </label>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {(proposal.specialGifts || []).map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 text-[11px]"
            >
              <span className="text-purple-900 dark:text-purple-300 font-medium">🎁 {item}</span>
              <button
                type="button"
                onClick={() => handleDeleteGift(idx)}
                className="text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Örn: Otel odasına şampanya & meyve ikramı..."
            value={newGiftText}
            onChange={(e) => setNewGiftText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGift()}
            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
          />
          <button
            type="button"
            onClick={handleAddGift}
            className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs cursor-pointer"
          >
            Ekle
          </button>
        </div>
      </div>

      {/* 💎 Opsiyonel Tur İçi Ekstralar & Upsell Add-ons */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>💎</span>
            <span>Opsiyonel Ek Hizmetler & Upsell ({(proposal.addons || []).filter((a) => a.selected).length} Seçili):</span>
          </label>
          <span className="text-[10px] text-slate-400">Teklife ekleyip çıkarabilirsiniz</span>
        </div>

        <div className="space-y-2">
          {(proposal.addons || []).map((addon) => (
            <label
              key={addon.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                addon.selected
                  ? 'bg-amber-500/10 border-amber-500/50 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(addon.selected)}
                onChange={() => {
                  const next = (proposal.addons || []).map((a) =>
                    a.id === addon.id ? { ...a, selected: !a.selected } : a
                  );
                  setProposal({ ...proposal, addons: next });
                }}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <span>{addon.icon || '✨'}</span>
                    <span>{addon.title}</span>
                  </span>
                  <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 shrink-0">
                    +{fmtMoney(addon.priceThb)} THB
                  </span>
                </div>
                {addon.description && (
                  <p className="text-[11px] opacity-75 mt-0.5 leading-tight">
                    {addon.description}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
