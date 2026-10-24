import React from 'react';
import { ExternalLink, Printer, Send, Minimize2 } from 'lucide-react';
import type {
  CuratedProposalData,
  CuratedProposalDay,
  CuratedProposalHotelStay,
  ProposalFinancials,
} from '../../../lib/curatedProposal';
import ProposalSingleTourDoc from './ProposalSingleTourDoc';
import ProposalMultiDayDoc from './ProposalMultiDayDoc';

export const BRAND_LOGO_SRC = '/assets/logo-main-transparent.png';

export interface ProposalPreviewPanelProps {
  proposal: CuratedProposalData;
  financials: ProposalFinancials;
  isSingleTour: boolean;
  singleDay: CuratedProposalDay;
  proposalHotels: CuratedProposalHotelStay[];
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  setShowSendModal: (val: boolean) => void;
  setSendPhone: (val: string) => void;
  setSendEmail: (val: string) => void;
  handleOpenInNewTab: () => void;
  handlePrint: () => void;
}

export function ProposalPreviewPanel({
  proposal,
  financials,
  isSingleTour,
  singleDay,
  proposalHotels,
  isPreviewMode,
  setIsPreviewMode,
  setShowSendModal,
  setSendPhone,
  setSendEmail,
  handleOpenInNewTab,
  handlePrint,
}: ProposalPreviewPanelProps) {
  return (
    <div
      className={`flex-1 p-4 sm:p-10 bg-slate-100/60 dark:bg-slate-950/40 text-slate-900 overflow-y-auto print:p-0 print:bg-white print:overflow-visible ${
        isPreviewMode ? 'lg:p-12' : ''
      }`}
    >
      {/* ÖNİZLEME MODU ÜST KONTROL ÇUBUĞU */}
      {isPreviewMode && (
        <div className="max-w-[780px] mx-auto mb-6 px-4 py-3 rounded-2xl bg-slate-900/95 text-white backdrop-blur-md border border-slate-700 shadow-xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">
              📄 Tam Sayfa A4 Belge Önizleme ({proposal.proposalNumber})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {isSingleTour ? '🎯 Tekli Tur' : '🌟 Çok Günlü'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Teklifi yeni temiz tarayıcı sekmesinde aç"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Yeni Sekmede Aç</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>🖨️ A4 PDF İndir</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSendPhone(proposal.customerPhone || '');
                setSendEmail(proposal.customerEmail || '');
                setShowSendModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>📤 PDF Yolla</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewMode(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Düzenleyiciye Dön</span>
            </button>
          </div>
        </div>
      )}

      <div
        id="curated-proposal-print-area"
        className="max-w-[780px] mx-auto bg-white p-8 sm:p-10 rounded-3xl shadow-xl print:shadow-none print:p-0 print:rounded-none space-y-6 border border-slate-200/80 print:border-none"
      >
        {isSingleTour ? (
          <ProposalSingleTourDoc
            proposal={proposal}
            financials={financials}
            singleDay={singleDay}
            brandLogoSrc={BRAND_LOGO_SRC}
          />
        ) : (
          <ProposalMultiDayDoc
            proposal={proposal}
            financials={financials}
            proposalHotels={proposalHotels}
            brandLogoSrc={BRAND_LOGO_SRC}
          />
        )}
      </div>
    </div>
  );
}
