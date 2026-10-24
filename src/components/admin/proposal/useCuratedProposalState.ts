import { useState, useMemo } from 'react';
import {
  buildCuratedProposal,
  buildSingleTourProposal,
  calculateProposalFinancials,
  generateCuratedProposalWhatsAppMessage,
  PROPOSAL_CATALOG_TOURS,
  type CuratedProposalData,
  type CuratedProposalDay,
  type CuratedProposalHotelStay,
  type ProposalTimelineStep,
  type ProposalType,
  type CatalogTourPreset,
} from '../../../lib/curatedProposal';
import { readLocalCollection } from '../../../lib/cmsSync';
import type { TravelStyle, PackageDuration } from '../../../lib/holidayPlanner';
import {
  openProposalInNewTab,
  printCuratedProposalDocument,
  directWhatsAppSend,
  emailSend,
  nativeShareProposal,
} from './proposalActionUtils';
import { createInitialProposal, type InitialProposalArgs } from './proposalInitialBuilder';
import {
  saveProposalToStorage,
  deleteProposalFromStorage,
  type SavedProposalItem,
} from './proposalStorageUtils';
import {
  addTimelineStep,
  updateTimelineStep,
  deleteTimelineStep,
  moveTimelineStep,
} from './proposalTimelineUtils';
import {
  addTourFromCatalogToDays,
  updateDayInList,
  deleteDayFromList,
  moveDayInList,
} from './proposalDaysUtils';
import {
  getProposalHotels,
  addProposalHotelToList,
  updateProposalHotelInList,
  removeProposalHotelFromList,
} from './proposalHotelUtils';

export type EditorTab = 'overview' | 'days' | 'timeline' | 'inclusions' | 'financials';
export type { SavedProposalItem };

export interface UseCuratedProposalStateArgs extends InitialProposalArgs {
  showToast: (msg: string) => void;
}

export function useCuratedProposalState(args: UseCuratedProposalStateArgs) {
  const { showToast } = args;
  const [proposal, setProposal] = useState<CuratedProposalData>(() => createInitialProposal(args));

  const [activeTab, setActiveTab] = useState<EditorTab>('overview');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  // Form field additions
  const [newInclusionText, setNewInclusionText] = useState<string>('');
  const [newExclusionText, setNewExclusionText] = useState<string>('');
  const [newGiftText, setNewGiftText] = useState<string>('');

  // Single tour & timeline states
  const [newStepTime, setNewStepTime] = useState<string>('09:00');
  const [newStepTitle, setNewStepTitle] = useState<string>('');
  const [newStepDesc, setNewStepDesc] = useState<string>('');
  const [newTipText, setNewTipText] = useState<string>('');

  // Saved proposals state & modal
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [savedProposals, setSavedProposals] = useState<SavedProposalItem[]>(() => {
    return readLocalCollection<SavedProposalItem[]>('proposals', []) || [];
  });

  // PDF Görüntüleme & Paylaşım Modu
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [sendPhone, setSendPhone] = useState<string>(proposal.customerPhone || '');
  const [sendEmail, setSendEmail] = useState<string>(proposal.customerEmail || '');

  const isSingleTour = proposal.proposalType === 'single_tour';
  const singleDay = proposal.days[0] || ({} as CuratedProposalDay);

  const financials = useMemo(() => {
    return calculateProposalFinancials(proposal);
  }, [proposal]);

  const handleSwitchProposalType = (type: ProposalType) => {
    if (proposal.proposalType === type) return;
    if (type === 'single_tour') {
      const defaultTour = PROPOSAL_CATALOG_TOURS[0];
      const newProp = buildSingleTourProposal(
        proposal.customerName,
        defaultTour.id,
        proposal.singleTourDate || proposal.createdAtDate,
        proposal.hotelName,
        proposal.hotelZone,
        proposal.adultCount,
        proposal.childCount
      );
      newProp.currency = proposal.currency;
      newProp.agentInfo = proposal.agentInfo;
      setProposal(newProp);
      setActiveTab('overview');
      showToast('🎯 Tekli Tur & VIP Paket Teklifi moduna geçildi.');
    } else {
      const newProp = buildCuratedProposal(
        proposal.customerName,
        proposal.travelStyle || 'honeymoon',
        5,
        proposal.hotelName,
        proposal.hotelZone,
        proposal.adultCount,
        proposal.childCount
      );
      newProp.currency = proposal.currency;
      newProp.agentInfo = proposal.agentInfo;
      setProposal(newProp);
      setActiveTab('overview');
      showToast('🌟 Çok Günlü Tatil Paketi moduna geçildi.');
    }
  };

  const handleApplySingleTourPreset = (preset: CatalogTourPreset) => {
    const updated = buildSingleTourProposal(
      proposal.customerName,
      preset.id,
      proposal.singleTourDate || proposal.createdAtDate,
      proposal.hotelName,
      proposal.hotelZone,
      proposal.adultCount,
      proposal.childCount
    );
    updated.currency = proposal.currency;
    updated.agentInfo = proposal.agentInfo;
    setProposal(updated);
    showToast(`🎯 "${preset.tourTitle}" şablonu ve saatlik tur akışı yüklendi!`);
  };

  const handleUpdateSingleDay = (updates: Partial<CuratedProposalDay>) => {
    setProposal((prev) => {
      const d0 = prev.days[0] || {
        id: 'DAY-1',
        dayNumber: 1,
        dayTitle: prev.packageTitle,
        tourTitle: prev.packageTitle,
        pickupWindow: '08:00 - 08:30',
        tourDuration: '09:00 - 17:00',
        category: 'island',
        transportType: 'speedboat',
        mealPlan: 'buffet_lunch',
        nationalParkFeeStatus: 'included',
        guideLanguage: 'turkish',
        highlight: '',
        included: [],
        image: '/assets/phi_phi_island.webp',
        priceThb: 0,
        hotelName: prev.hotelName,
        hotelZone: prev.hotelZone,
      };
      return {
        ...prev,
        days: [{ ...d0, ...updates }, ...prev.days.slice(1)],
      };
    });
  };

  const handleAddTimelineStep = () => {
    if (!newStepTitle.trim()) {
      showToast('⚠️ Lütfen adım başlığı giriniz (Örn: Maya Bay Molası)');
      return;
    }
    const next = addTimelineStep(
      proposal.singleTourTimeline,
      newStepTime,
      newStepTitle,
      newStepDesc
    );
    setProposal((prev) => ({ ...prev, singleTourTimeline: next }));
    setNewStepTitle('');
    setNewStepDesc('');
    showToast('➕ Yeni saatlik adım akışa eklendi');
  };

  const handleUpdateTimelineStep = (stepId: string, patch: Partial<ProposalTimelineStep>) => {
    setProposal((prev) => ({
      ...prev,
      singleTourTimeline: updateTimelineStep(prev.singleTourTimeline, stepId, patch),
    }));
  };

  const handleDeleteTimelineStep = (stepId: string) => {
    setProposal((prev) => ({
      ...prev,
      singleTourTimeline: deleteTimelineStep(prev.singleTourTimeline, stepId),
    }));
    showToast('🗑️ Saatlik adım kaldırıldı');
  };

  const handleMoveTimelineStep = (idx: number, direction: 'up' | 'down') => {
    setProposal((prev) => ({
      ...prev,
      singleTourTimeline: moveTimelineStep(prev.singleTourTimeline, idx, direction),
    }));
  };

  const handleAddTip = () => {
    if (!newTipText.trim()) return;
    setProposal((prev) => ({
      ...prev,
      singleTourTips: [...(prev.singleTourTips || []), newTipText.trim()],
    }));
    setNewTipText('');
  };

  const handleDeleteTip = (index: number) => {
    setProposal((prev) => ({
      ...prev,
      singleTourTips: (prev.singleTourTips || []).filter((_, i) => i !== index),
    }));
  };

  const handleSaveProposal = () => {
    const updated = saveProposalToStorage(proposal, savedProposals, showToast);
    setSavedProposals(updated);
  };

  const handleLoadSavedProposal = (item: SavedProposalItem) => {
    setProposal(item.data);
    setSendPhone(item.data.customerPhone || '');
    setSendEmail(item.data.customerEmail || '');
    setShowSavedModal(false);
    setActiveTab('overview');
    showToast(`📂 "${item.title}" teklifi yüklendi.`);
  };

  const handleDeleteSavedProposal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteProposalFromStorage(id, savedProposals, showToast);
    setSavedProposals(updated);
  };

  const proposalHotels: CuratedProposalHotelStay[] = useMemo(() => {
    return getProposalHotels(
      proposal.hotels,
      proposal.hotelName,
      proposal.hotelZone,
      proposal.createdAtDate,
      proposal.validUntilDate
    );
  }, [proposal.hotels, proposal.hotelName, proposal.hotelZone, proposal.createdAtDate, proposal.validUntilDate]);

  const handleAddProposalHotel = () => {
    const nextHotels = addProposalHotelToList(proposalHotels);
    setProposal((prev) => ({ ...prev, hotels: nextHotels }));
    showToast('🏨 Yeni konaklama oteli eklendi');
  };

  const handleUpdateProposalHotel = (
    hotelId: string,
    patch: Partial<CuratedProposalHotelStay>
  ) => {
    const nextHotels = updateProposalHotelInList(proposalHotels, hotelId, patch);
    const first = nextHotels[0];
    setProposal((prev) => ({
      ...prev,
      hotels: nextHotels,
      hotelName: first?.hotelName || prev.hotelName,
      hotelZone: first?.hotelZone || prev.hotelZone,
    }));
  };

  const handleRemoveProposalHotel = (hotelId: string) => {
    if (proposalHotels.length <= 1) {
      showToast('⚠️ En az bir konaklama oteli bulunmalıdır');
      return;
    }
    const nextHotels = removeProposalHotelFromList(proposalHotels, hotelId);
    const first = nextHotels[0];
    setProposal((prev) => ({
      ...prev,
      hotels: nextHotels,
      hotelName: first?.hotelName || prev.hotelName,
      hotelZone: first?.hotelZone || prev.hotelZone,
    }));
    showToast('🗑️ Otel tekliften kaldırıldı');
  };

  const handleApplyPreset = (style: TravelStyle, duration: PackageDuration) => {
    const updated = buildCuratedProposal(
      proposal.customerName,
      style,
      duration,
      proposal.hotelName,
      proposal.hotelZone,
      proposal.adultCount,
      proposal.childCount
    );
    updated.currency = proposal.currency;
    updated.agentInfo = proposal.agentInfo;
    setProposal(updated);
    showToast(`✨ ${duration} Günlük ${updated.packageTitle} şablonu yüklendi`);
  };

  const handleApplyBlank = () => {
    setProposal((prev) => ({
      ...prev,
      packageTitle: 'Kişiye Özel Phuket Seyahat Programı',
      packageSubtitle: 'Sizin taleplerinize göre gün gün hazırlanan özel tatil rotası',
      days: [],
      discountPercent: 0,
    }));
    showToast('✏️ Boş taslak oluşturuldu. Şimdi dilediğiniz turları ekleyebilirsiniz.');
    setActiveTab('days');
  };

  const handleAddTourFromCatalog = (preset: CatalogTourPreset) => {
    const { nextDays, newDayId } = addTourFromCatalogToDays(
      proposal.days,
      preset,
      proposal.adultCount,
      proposal.childCount
    );
    setProposal((prev) => ({ ...prev, days: nextDays }));
    setExpandedDayId(newDayId);
    showToast(`➕ ${preset.tourTitle} teklife eklendi!`);
  };

  const handleUpdateDay = (dayId: string, updates: Partial<CuratedProposalDay>) => {
    setProposal((prev) => ({
      ...prev,
      days: updateDayInList(prev.days, dayId, updates),
    }));
  };

  const handleDeleteDay = (dayId: string) => {
    setProposal((prev) => ({
      ...prev,
      days: deleteDayFromList(prev.days, dayId),
    }));
    showToast('🗑️ Gün tekliften kaldırıldı.');
  };

  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    setProposal((prev) => ({
      ...prev,
      days: moveDayInList(prev.days, index, direction),
    }));
  };

  const handleAddInclusion = () => {
    if (!newInclusionText.trim()) return;
    setProposal((prev) => ({
      ...prev,
      inclusions: [...prev.inclusions, newInclusionText.trim()],
    }));
    setNewInclusionText('');
  };

  const handleDeleteInclusion = (index: number) => {
    setProposal((prev) => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddExclusion = () => {
    if (!newExclusionText.trim()) return;
    setProposal((prev) => ({
      ...prev,
      exclusions: [...prev.exclusions, newExclusionText.trim()],
    }));
    setNewExclusionText('');
  };

  const handleDeleteExclusion = (index: number) => {
    setProposal((prev) => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, idx) => idx !== index),
    }));
  };

  const handleAddGift = () => {
    if (!newGiftText.trim()) return;
    setProposal((prev) => ({
      ...prev,
      specialGifts: [...(prev.specialGifts || []), newGiftText.trim()],
    }));
    setNewGiftText('');
  };

  const handleDeleteGift = (index: number) => {
    setProposal((prev) => ({
      ...prev,
      specialGifts: (prev.specialGifts || []).filter((_, idx) => idx !== index),
    }));
  };

  const handleCopyWhatsApp = () => {
    const text = generateCuratedProposalWhatsAppMessage(proposal, financials);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('📋 Teklif metni WhatsApp formatında kopyalandı!');
    setTimeout(() => setCopied(false), 2500);
  };

  return {
    proposal,
    setProposal,
    activeTab,
    setActiveTab,
    copied,
    expandedDayId,
    setExpandedDayId,
    newInclusionText,
    setNewInclusionText,
    newExclusionText,
    setNewExclusionText,
    newGiftText,
    setNewGiftText,
    newStepTime,
    setNewStepTime,
    newStepTitle,
    setNewStepTitle,
    newStepDesc,
    setNewStepDesc,
    newTipText,
    setNewTipText,
    showSavedModal,
    setShowSavedModal,
    savedProposals,
    isPreviewMode,
    setIsPreviewMode,
    showSendModal,
    setShowSendModal,
    sendPhone,
    setSendPhone,
    sendEmail,
    setSendEmail,
    isSingleTour,
    singleDay,
    financials,
    proposalHotels,
    handleSwitchProposalType,
    handleApplySingleTourPreset,
    handleUpdateSingleDay,
    handleAddTimelineStep,
    handleUpdateTimelineStep,
    handleDeleteTimelineStep,
    handleMoveTimelineStep,
    handleAddTip,
    handleDeleteTip,
    handleSaveProposal,
    handleLoadSavedProposal,
    handleDeleteSavedProposal,
    handleAddProposalHotel,
    handleUpdateProposalHotel,
    handleRemoveProposalHotel,
    handleApplyPreset,
    handleApplyBlank,
    handleAddTourFromCatalog,
    handleUpdateDay,
    handleDeleteDay,
    handleMoveDay,
    handleAddInclusion,
    handleDeleteInclusion,
    handleAddExclusion,
    handleDeleteExclusion,
    handleAddGift,
    handleDeleteGift,
    handleDirectWhatsAppSend: (targetPhone?: string) =>
      directWhatsAppSend(proposal, financials, sendPhone, targetPhone, (val) => setProposal((p) => ({ ...p, customerPhone: val })), showToast),
    handleEmailSend: (targetEmail?: string) =>
      emailSend(proposal, financials, sendEmail, targetEmail, (val) => setProposal((p) => ({ ...p, customerEmail: val })), showToast),
    handleCopyWhatsApp,
    handleNativeShare: () => nativeShareProposal(proposal, financials, handleCopyWhatsApp, showToast),
    handleOpenInNewTab: () => openProposalInNewTab(proposal, showToast),
    handlePrint: () => printCuratedProposalDocument(showToast),
  };
}
