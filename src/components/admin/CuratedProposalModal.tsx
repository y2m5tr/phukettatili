import React from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';
import type { ProposalType } from '../../lib/curatedProposal';
import { ProposalTopToolbar } from './proposal/ProposalTopToolbar';
import { ProposalSingleTourOverviewTab } from './proposal/ProposalSingleTourOverviewTab';
import { ProposalSingleTourTimelineTab } from './proposal/ProposalSingleTourTimelineTab';
import { ProposalPackageOverviewTab } from './proposal/ProposalPackageOverviewTab';
import { ProposalPackageDaysTab } from './proposal/ProposalPackageDaysTab';
import { ProposalInclusionsTab } from './proposal/ProposalInclusionsTab';
import { ProposalFinancialsTab } from './proposal/ProposalFinancialsTab';
import { ProposalPreviewPanel } from './proposal/ProposalPreviewPanel';
import { useCuratedProposalState } from './proposal/useCuratedProposalState';
import type { SavedProposalItem } from './proposal/proposalStorageUtils';

export type { SavedProposalItem };

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  showToast: (msg: string) => void;
  initialCustomerName?: string;
  initialHotel?: string;
  initialZone?: string;
  initialPhone?: string;
  initialProposalType?: ProposalType;
  initialTourTitle?: string;
  initialTourDate?: string;
  initialAdultCount?: number;
  initialChildCount?: number;
  isEmbedded?: boolean;
  onConvertToBooking?: (bookingData: any) => void;
}

export default function CuratedProposalModal({
  isOpen,
  onClose,
  showToast,
  initialCustomerName,
  initialHotel,
  initialZone,
  initialPhone,
  initialProposalType,
  initialTourTitle,
  initialTourDate,
  initialAdultCount,
  initialChildCount,
  isEmbedded = false,
  onConvertToBooking,
}: Props) {
  if (!isOpen) return null;

  const state = useCuratedProposalState({
    initialCustomerName,
    initialHotel,
    initialZone,
    initialPhone,
    initialProposalType,
    initialTourTitle,
    initialTourDate,
    initialAdultCount,
    initialChildCount,
    showToast,
  });

  const innerContent = (
    <div
      className={`relative w-full ${
        isEmbedded ? 'min-h-[85vh] shadow-sm' : 'max-w-7xl max-h-[94vh] shadow-2xl'
      } bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none`}
    >
      {/* ÜST BAR (YAZDIRMA ESNASINDA GİZLENİR) */}
      <ProposalTopToolbar
        proposal={state.proposal}
        financials={state.financials}
        isSingleTour={state.isSingleTour}
        isPreviewMode={state.isPreviewMode}
        setIsPreviewMode={state.setIsPreviewMode}
        copied={state.copied}
        savedProposals={state.savedProposals}
        showSavedModal={state.showSavedModal}
        setShowSavedModal={state.setShowSavedModal}
        showSendModal={state.showSendModal}
        setShowSendModal={state.setShowSendModal}
        sendPhone={state.sendPhone}
        setSendPhone={state.setSendPhone}
        sendEmail={state.sendEmail}
        setSendEmail={state.setSendEmail}
        handleSaveProposal={state.handleSaveProposal}
        handleLoadSavedProposal={state.handleLoadSavedProposal}
        handleDeleteSavedProposal={state.handleDeleteSavedProposal}
        handlePrint={state.handlePrint}
        handleCopyWhatsApp={state.handleCopyWhatsApp}
        handleDirectWhatsAppSend={state.handleDirectWhatsAppSend}
        handleEmailSend={state.handleEmailSend}
        handleNativeShare={state.handleNativeShare}
        onClose={onClose}
        onConvertToBooking={onConvertToBooking}
      />

      {/* İÇERİK ALANI: SOL GELİŞMİŞ PANEL + SAĞ A4 CANLI ÖNİZLEME */}
      <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 print:overflow-visible print:block">
        {/* SOL PANEL: AYRINTILI TEKLİF MİMARI (PRINTTE VE ÖNİZLEMEDE GİZLENİR) */}
        {!state.isPreviewMode && (
          <div className="w-full lg:w-[420px] p-5 space-y-4 shrink-0 bg-slate-50/70 dark:bg-slate-950/60 print:hidden overflow-y-auto">
            {/* 0. TEKLİF FORMATI SEÇİCİ (ÇOK GÜNLÜ vs TEKLİ TUR) */}
            <div className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/70 dark:border-slate-800 flex gap-1">
              <button
                type="button"
                onClick={() => state.handleSwitchProposalType('package_multiday')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !state.isSingleTour
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🌟 Çok Günlü Tatil Paketi</span>
              </button>
              <button
                type="button"
                onClick={() => state.handleSwitchProposalType('single_tour')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  state.isSingleTour
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🎯 Tekli VIP Tur Teklifi</span>
              </button>
            </div>

            {/* SEKMELER */}
            <div className="flex rounded-xl bg-slate-200/60 dark:bg-slate-800/60 p-1 gap-1 text-xs">
              {state.isSingleTour ? (
                <>
                  <button
                    type="button"
                    onClick={() => state.setActiveTab('overview')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      state.activeTab === 'overview'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Tur & Detay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => state.setActiveTab('timeline')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      state.activeTab === 'timeline'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Akış Durakları</span>
                    {(state.proposal.singleTourTimeline || []).length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        {(state.proposal.singleTourTimeline || []).length}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => state.setActiveTab('inclusions')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      state.activeTab === 'inclusions'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Dahil & Ekstra</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => state.setActiveTab('financials')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      state.activeTab === 'financials'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                    <span>Fiyat & Döviz</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => state.setActiveTab('overview')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      state.activeTab === 'overview'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Genel & Otel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => state.setActiveTab('days')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      state.activeTab === 'days'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>Günler ({state.proposal.days.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => state.setActiveTab('inclusions')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      state.activeTab === 'inclusions'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Dahil & Ekstra</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => state.setActiveTab('financials')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      state.activeTab === 'financials'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                    <span>Fiyat & Döviz</span>
                  </button>
                </>
              )}
            </div>

            {/* SEÇİLİ SEKME İÇERİĞİ */}
            {state.isSingleTour && state.activeTab === 'overview' && (
              <ProposalSingleTourOverviewTab
                proposal={state.proposal}
                setProposal={state.setProposal}
                singleDay={state.singleDay}
                handleApplySingleTourPreset={state.handleApplySingleTourPreset}
                handleUpdateSingleDay={state.handleUpdateSingleDay}
                setSendPhone={state.setSendPhone}
                setSendEmail={state.setSendEmail}
              />
            )}

            {state.isSingleTour && state.activeTab === 'timeline' && (
              <ProposalSingleTourTimelineTab
                proposal={state.proposal}
                newStepTime={state.newStepTime}
                setNewStepTime={state.setNewStepTime}
                newStepTitle={state.newStepTitle}
                setNewStepTitle={state.setNewStepTitle}
                newStepDesc={state.newStepDesc}
                setNewStepDesc={state.setNewStepDesc}
                handleAddTimelineStep={state.handleAddTimelineStep}
                handleUpdateTimelineStep={state.handleUpdateTimelineStep}
                handleDeleteTimelineStep={state.handleDeleteTimelineStep}
                handleMoveTimelineStep={state.handleMoveTimelineStep}
              />
            )}

            {!state.isSingleTour && state.activeTab === 'overview' && (
              <ProposalPackageOverviewTab
                proposal={state.proposal}
                setProposal={state.setProposal}
                proposalHotels={state.proposalHotels}
                handleApplyPreset={state.handleApplyPreset}
                handleApplyBlank={state.handleApplyBlank}
                handleAddProposalHotel={state.handleAddProposalHotel}
                handleUpdateProposalHotel={state.handleUpdateProposalHotel}
                handleRemoveProposalHotel={state.handleRemoveProposalHotel}
                setSendPhone={state.setSendPhone}
                setSendEmail={state.setSendEmail}
              />
            )}

            {!state.isSingleTour && state.activeTab === 'days' && (
              <ProposalPackageDaysTab
                proposal={state.proposal}
                proposalHotels={state.proposalHotels}
                expandedDayId={state.expandedDayId}
                setExpandedDayId={state.setExpandedDayId}
                handleAddTourFromCatalog={state.handleAddTourFromCatalog}
                handleUpdateDay={state.handleUpdateDay}
                handleDeleteDay={state.handleDeleteDay}
                handleMoveDay={state.handleMoveDay}
              />
            )}

            {state.activeTab === 'inclusions' && (
              <ProposalInclusionsTab
                proposal={state.proposal}
                setProposal={state.setProposal}
                isSingleTour={state.isSingleTour}
                newTipText={state.newTipText}
                setNewTipText={state.setNewTipText}
                handleAddTip={state.handleAddTip}
                handleDeleteTip={state.handleDeleteTip}
                newInclusionText={state.newInclusionText}
                setNewInclusionText={state.setNewInclusionText}
                handleAddInclusion={state.handleAddInclusion}
                handleDeleteInclusion={state.handleDeleteInclusion}
                newExclusionText={state.newExclusionText}
                setNewExclusionText={state.setNewExclusionText}
                handleAddExclusion={state.handleAddExclusion}
                handleDeleteExclusion={state.handleDeleteExclusion}
                newGiftText={state.newGiftText}
                setNewGiftText={state.setNewGiftText}
                handleAddGift={state.handleAddGift}
                handleDeleteGift={state.handleDeleteGift}
              />
            )}

            {state.activeTab === 'financials' && (
              <ProposalFinancialsTab
                proposal={state.proposal}
                setProposal={state.setProposal}
              />
            )}
          </div>
        )}

        {/* SAĞ PANEL: A4 CANLI VE BASKIYA HAZIR LÜKS TEKLİF DOKÜMANI */}
        <ProposalPreviewPanel
          proposal={state.proposal}
          financials={state.financials}
          isSingleTour={state.isSingleTour}
          singleDay={state.singleDay}
          proposalHotels={state.proposalHotels}
          isPreviewMode={state.isPreviewMode}
          setIsPreviewMode={state.setIsPreviewMode}
          setShowSendModal={state.setShowSendModal}
          setSendPhone={state.setSendPhone}
          setSendEmail={state.setSendEmail}
          handleOpenInNewTab={state.handleOpenInNewTab}
          handlePrint={state.handlePrint}
        />
      </div>
    </div>
  );

  if (isEmbedded) {
    return innerContent;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="curated-proposal-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed-none"
    >
      {innerContent}
    </div>
  );
}
