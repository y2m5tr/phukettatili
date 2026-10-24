import React from 'react';
import { Clock, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import type { CuratedProposalData, ProposalTimelineStep } from '../../../lib/curatedProposal';

export interface ProposalSingleTourTimelineTabProps {
  proposal: CuratedProposalData;
  newStepTime: string;
  setNewStepTime: (val: string) => void;
  newStepTitle: string;
  setNewStepTitle: (val: string) => void;
  newStepDesc: string;
  setNewStepDesc: (val: string) => void;
  handleAddTimelineStep: () => void;
  handleUpdateTimelineStep: (stepId: string, patch: Partial<ProposalTimelineStep>) => void;
  handleDeleteTimelineStep: (stepId: string) => void;
  handleMoveTimelineStep: (idx: number, direction: 'up' | 'down') => void;
}

export function ProposalSingleTourTimelineTab({
  proposal,
  newStepTime,
  setNewStepTime,
  newStepTitle,
  setNewStepTitle,
  newStepDesc,
  setNewStepDesc,
  handleAddTimelineStep,
  handleUpdateTimelineStep,
  handleDeleteTimelineStep,
  handleMoveTimelineStep,
}: ProposalSingleTourTimelineTabProps) {
  const steps = proposal.singleTourTimeline || [];

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Saatlik Tur Akış Durakları ({steps.length}):</span>
        </label>
        <span className="text-[10px] text-slate-500 font-semibold">A4 Belgesine Yansır</span>
      </div>

      {/* Adımlar Listesi */}
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {steps.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
            Henüz saatlik adım eklenmedi. Aşağıdan ilk adımı ekleyebilir veya Genel sekmesinden bir katalog turu seçebilirsiniz.
          </div>
        ) : (
          steps.map((step, idx) => (
            <div
              key={step.id || idx}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono">
                  #{idx + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveTimelineStep(idx, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Yukarı taşı"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMoveTimelineStep(idx, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    title="Aşağı taşı"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTimelineStep(step.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Bu adımı sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <label className="text-[10px] text-slate-500 block mb-0.5">Saat / Aralık:</label>
                  <input
                    type="text"
                    value={step.time}
                    onChange={(e) => handleUpdateTimelineStep(step.id, { time: e.target.value })}
                    placeholder="08:30"
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-xs"
                  />
                </div>
                <div className="col-span-8">
                  <label className="text-[10px] text-slate-500 block mb-0.5">Aşama / Durak Başlığı:</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleUpdateTimelineStep(step.id, { title: e.target.value })}
                    placeholder="Maya Bay Plaj Molası"
                    className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Açıklama (Opsiyonel):</label>
                <input
                  type="text"
                  value={step.description || ''}
                  onChange={(e) => handleUpdateTimelineStep(step.id, { description: e.target.value })}
                  placeholder="Örn: The Beach filmiyle ünlü koyda kumsal ve fotoğraf..."
                  className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px]"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Yeni Adım Ekleme Formu */}
      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
          ➕ Yeni Saatlik Akış Adımı Ekle:
        </span>
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-4">
            <input
              type="text"
              placeholder="Saat (09:00)"
              value={newStepTime}
              onChange={(e) => setNewStepTime(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-xs"
            />
          </div>
          <div className="col-span-8">
            <input
              type="text"
              placeholder="Aşama Adı (Örn: Şnorkel Molası)"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTimelineStep()}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
            />
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Detaylı açıklama (Opsiyonel)..."
            value={newStepDesc}
            onChange={(e) => setNewStepDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTimelineStep()}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>
        <button
          type="button"
          onClick={handleAddTimelineStep}
          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
        >
          + Bu Adımı Akışa Ekle
        </button>
      </div>
    </div>
  );
}
