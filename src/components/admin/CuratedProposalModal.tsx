import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Sparkles,
  Calendar,
  Hotel,
  Users,
  Percent,
  Compass,
  ShieldCheck,
  Clock,
  Phone,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Gift,
  DollarSign,
  CheckCircle2,
  XCircle,
  MessageCircle,
  CreditCard,
  Globe,
  Share2,
  Save,
  FolderOpen,
  Ship,
  MapPin,
  ListOrdered,
  Bookmark,
  Eye,
  Send,
  Mail,
  ExternalLink,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import {
  buildCuratedProposal,
  buildSingleTourProposal,
  calculateProposalFinancials,
  generateCuratedProposalWhatsAppMessage,
  convertProposalToBookingFormData,
  getCategoryIcon,
  PROPOSAL_CATALOG_TOURS,
  TRANSPORT_META,
  MEAL_PLAN_META,
  NATIONAL_PARK_META,
  GUIDE_LANGUAGE_META,
  CURRENCY_SYMBOLS,
  DEFAULT_INCLUSIONS,
  DEFAULT_EXCLUSIONS,
  DEFAULT_GIFTS,
  DEFAULT_SINGLE_TOUR_TIPS,
  type CuratedProposalData,
  type CuratedProposalDay,
  type CuratedProposalHotelStay,
  type ProposalTimelineStep,
  type ProposalType,
  type TransportType,
  type MealPlanType,
  type NationalParkStatus,
  type GuideLanguage,
  type CurrencyCode,
  type CatalogTourPreset,
} from '../../lib/curatedProposal';
import type { TravelStyle, PackageDuration } from '../../lib/holidayPlanner';
import { HOTEL_ZONES, detectHotelZone } from '../../data/adminInitialData';

export interface SavedProposalItem {
  id: string;
  savedAt: string;
  title: string;
  customerName: string;
  proposalType: ProposalType;
  data: CuratedProposalData;
}

const STORAGE_KEY_PROPOSALS = 'ptt_saved_curated_proposals_v1';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  showToast: (msg: string) => void;
  initialCustomerName?: string;
  initialHotel?: string;
  initialZone?: string;
  isEmbedded?: boolean;
  onConvertToBooking?: (bookingData: any) => void;
}

type EditorTab = 'overview' | 'days' | 'timeline' | 'inclusions' | 'financials';

export default function CuratedProposalModal({
  isOpen,
  onClose,
  showToast,
  initialCustomerName = 'Begüm & Canberk Özkan',
  initialHotel = 'The Shore at Katathani',
  initialZone = 'Kata & Karon',
  isEmbedded = false,
  onConvertToBooking,
}: Props) {
  if (!isOpen) return null;

  const [proposal, setProposal] = useState<CuratedProposalData>(() =>
    buildCuratedProposal(
      initialCustomerName,
      'honeymoon',
      5,
      initialHotel,
      initialZone,
      2,
      0
    )
  );

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
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROPOSALS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
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

  // Teklif Türü Değiştirme (Çok Günlü Paket vs Tekli Tur)
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

  // Tekli Tur için Hazır Katalog Şablonu Yükleme
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

  // Tekli Turun tek gününü güncelleme
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
      const updatedD0 = { ...d0, ...updates };
      return {
        ...prev,
        days: [updatedD0, ...prev.days.slice(1)],
      };
    });
  };

  // Saatlik Tur Akışı Adımı Ekleme / Güncelleme / Silme
  const handleAddTimelineStep = () => {
    if (!newStepTitle.trim()) {
      showToast('⚠️ Lütfen adım başlığı giriniz (Örn: Maya Bay Molası)');
      return;
    }
    const step: ProposalTimelineStep = {
      id: `step-${Date.now()}`,
      time: newStepTime.trim() || '10:00',
      title: newStepTitle.trim(),
      description: newStepDesc.trim(),
    };
    setProposal((prev) => ({
      ...prev,
      singleTourTimeline: [...(prev.singleTourTimeline || []), step],
    }));
    setNewStepTitle('');
    setNewStepDesc('');
    showToast('➕ Yeni saatlik adım akışa eklendi');
  };

  const handleUpdateTimelineStep = (stepId: string, patch: Partial<ProposalTimelineStep>) => {
    setProposal((prev) => ({
      ...prev,
      singleTourTimeline: (prev.singleTourTimeline || []).map((s) => (s.id === stepId ? { ...s, ...patch } : s)),
    }));
  };

  const handleDeleteTimelineStep = (stepId: string) => {
    setProposal((prev) => ({
      ...prev,
      singleTourTimeline: (prev.singleTourTimeline || []).filter((s) => s.id !== stepId),
    }));
    showToast('🗑️ Saatlik adım kaldırıldı');
  };

  const handleMoveTimelineStep = (idx: number, direction: 'up' | 'down') => {
    const steps = proposal.singleTourTimeline || [];
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= steps.length) return;
    const copy = [...steps];
    const [moved] = copy.splice(idx, 1);
    copy.splice(target, 0, moved);
    setProposal((prev) => ({
      ...prev,
      singleTourTimeline: copy,
    }));
  };

  // Yanınızda Getirilecekler Ekle / Sil
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

  // Teklifi Yerel Hafızaya Kaydetme
  const handleSaveProposal = () => {
    try {
      const item: SavedProposalItem = {
        id: proposal.proposalNumber || `prop-${Date.now()}`,
        savedAt: new Date().toLocaleString('tr-TR'),
        title: proposal.packageTitle || 'Özel Teklif',
        customerName: proposal.customerName || 'Misafir',
        proposalType: proposal.proposalType || 'package_multiday',
        data: proposal,
      };
      const raw = localStorage.getItem(STORAGE_KEY_PROPOSALS);
      const existing: SavedProposalItem[] = raw ? JSON.parse(raw) : [];
      const updated = [item, ...existing.filter((p) => p.id !== item.id)].slice(0, 30);
      localStorage.setItem(STORAGE_KEY_PROPOSALS, JSON.stringify(updated));
      setSavedProposals(updated);
      showToast(`💾 "${item.title}" teklifi kaydedildi!`);
    } catch {
      showToast('⚠️ Teklif kaydedilirken bir hata oluştu');
    }
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
    try {
      const updated = savedProposals.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY_PROPOSALS, JSON.stringify(updated));
      setSavedProposals(updated);
      showToast('🗑️ Kayıtlı teklif silindi');
    } catch {
      showToast('⚠️ Silinemedi');
    }
  };

  // Çoklu Otel Konaklaması Yönetimi
  const proposalHotels: CuratedProposalHotelStay[] = useMemo(() => {
    if (proposal.hotels && proposal.hotels.length > 0) return proposal.hotels;
    return [
      {
        id: 'hotel-1',
        hotelName: proposal.hotelName || '',
        hotelZone: proposal.hotelZone || 'Patong & Kalim',
        checkInDate: proposal.createdAtDate,
        checkOutDate: proposal.validUntilDate,
      },
    ];
  }, [proposal.hotels, proposal.hotelName, proposal.hotelZone, proposal.createdAtDate, proposal.validUntilDate]);

  const handleAddProposalHotel = () => {
    const newId = `hotel-${Date.now()}`;
    const nextHotels: CuratedProposalHotelStay[] = [
      ...proposalHotels,
      {
        id: newId,
        hotelName: '',
        hotelZone: 'Patong & Kalim',
        checkInDate: '',
        checkOutDate: '',
        notes: '',
      },
    ];
    setProposal((prev) => ({
      ...prev,
      hotels: nextHotels,
    }));
    showToast('🏨 Yeni konaklama oteli eklendi');
  };

  const handleUpdateProposalHotel = (
    hotelId: string,
    patch: Partial<CuratedProposalHotelStay>
  ) => {
    const nextHotels = proposalHotels.map((h) => {
      if (h.id === hotelId) {
        const updated = { ...h, ...patch };
        if (patch.hotelName && !patch.hotelZone) {
          const detected = detectHotelZone(patch.hotelName);
          if (detected) updated.hotelZone = detected;
        }
        return updated;
      }
      return h;
    });

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
    const nextHotels = proposalHotels.filter((h) => h.id !== hotelId);
    const first = nextHotels[0];
    setProposal((prev) => ({
      ...prev,
      hotels: nextHotels,
      hotelName: first?.hotelName || prev.hotelName,
      hotelZone: first?.hotelZone || prev.hotelZone,
    }));
    showToast('🗑️ Otel tekliften kaldırıldı');
  };

  // Hızlı Hazır Paket Şablonu Yükleme
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
    // Currency ve custom agent info koru
    updated.currency = proposal.currency;
    updated.agentInfo = proposal.agentInfo;
    setProposal(updated);
    showToast(`✨ ${duration} Günlük ${updated.packageTitle} şablonu yüklendi`);
  };

  // Boş Taslak Yükleme
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

  // Katalogdan Yeni Tur Ekle
  const handleAddTourFromCatalog = (preset: CatalogTourPreset) => {
    const newDayNumber = proposal.days.length + 1;
    const newDay: CuratedProposalDay = {
      id: `DAY-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
      dayNumber: newDayNumber,
      dayTitle: preset.defaultDayTitle,
      tourTitle: preset.tourTitle,
      pickupWindow: preset.pickupWindow,
      tourDuration: preset.tourDuration,
      category: preset.category,
      transportType: preset.transportType,
      mealPlan: preset.mealPlan,
      nationalParkFeeStatus: preset.nationalParkFeeStatus,
      guideLanguage: 'turkish',
      highlight: preset.highlight,
      included: [...preset.included],
      image: preset.image,
      priceThb: preset.priceThb * proposal.adultCount + Math.round(preset.priceThb * 0.7 * proposal.childCount),
    };

    setProposal((prev) => ({
      ...prev,
      days: [...prev.days, newDay],
    }));

    setExpandedDayId(newDay.id);
    showToast(`➕ ${preset.tourTitle} teklife ${newDayNumber}. gün olarak eklendi!`);
  };

  // Günün alanını güncelleme
  const handleUpdateDay = (dayId: string, updates: Partial<CuratedProposalDay>) => {
    setProposal((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? { ...d, ...updates } : d)),
    }));
  };

  // Gün Silme
  const handleDeleteDay = (dayId: string) => {
    setProposal((prev) => {
      const filtered = prev.days.filter((d) => d.id !== dayId);
      // Gün numaralarını yeniden diz
      const renumbered = filtered.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
      return { ...prev, days: renumbered };
    });
    showToast('🗑️ Gün tekliften kaldırıldı.');
  };

  // Gün Sıralama (Yukarı / Aşağı)
  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= proposal.days.length) return;

    setProposal((prev) => {
      const nextDays = [...prev.days];
      const [moved] = nextDays.splice(index, 1);
      nextDays.splice(targetIndex, 0, moved);
      const renumbered = nextDays.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
      return { ...prev, days: renumbered };
    });
  };

  // Dahil Olan Ekle/Sil
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

  // Hariç Olan Ekle/Sil
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

  // VIP İkram Ekle/Sil
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

  const formatSendPhone = (raw: string) => {
    let clean = raw.replace(/\D/g, '');
    if (!clean) return '';
    if (clean.startsWith('05')) clean = '90' + clean.slice(1);
    else if (clean.startsWith('5') && clean.length === 10) clean = '90' + clean;
    else if (clean.startsWith('08') || clean.startsWith('09') || clean.startsWith('06')) clean = '66' + clean.slice(1);
    return clean;
  };

  const handleDirectWhatsAppSend = (targetPhone?: string) => {
    const rawNumber = targetPhone !== undefined ? targetPhone : sendPhone;
    const clean = formatSendPhone(rawNumber);
    if (!clean) {
      showToast('⚠️ Lütfen geçerli bir telefon numarası giriniz (Örn: +90 532... veya 08...)');
      return;
    }
    if (rawNumber && rawNumber !== proposal.customerPhone) {
      setProposal((prev) => ({ ...prev, customerPhone: rawNumber }));
    }
    const text = generateCuratedProposalWhatsAppMessage(proposal, financials);
    const waUrl = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    showToast('💬 WhatsApp sohbeti başlatılıyor...');
  };

  const handleEmailSend = (targetEmail?: string) => {
    const emailToUse = (targetEmail !== undefined ? targetEmail : sendEmail).trim();
    if (!emailToUse || !emailToUse.includes('@')) {
      showToast('⚠️ Lütfen geçerli bir e-posta adresi giriniz');
      return;
    }
    if (emailToUse !== proposal.customerEmail) {
      setProposal((prev) => ({ ...prev, customerEmail: emailToUse }));
    }
    const subject = `Phuket Tatili · Özel Seyahat & Tur Teklifiniz (${proposal.proposalNumber}) - ${proposal.customerName}`;
    const body = generateCuratedProposalWhatsAppMessage(proposal, financials);
    const mailtoUrl = `mailto:${encodeURIComponent(emailToUse)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    showToast('✉️ E-posta istemciniz açılıyor...');
  };

  const handleNativeShare = async () => {
    const text = generateCuratedProposalWhatsAppMessage(proposal, financials);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Phuket Tatili - ${proposal.packageTitle} (${proposal.customerName})`,
          text: text,
          url: window.location.href,
        });
        showToast('📤 Paylaşım menüsü açıldı');
      } catch {
        // Kullanıcı iptal ettiyse sessizce geç
      }
    } else {
      handleCopyWhatsApp();
    }
  };

  const handleOpenInNewTab = () => {
    const printArea = document.getElementById('curated-proposal-print-area');
    if (!printArea) {
      showToast('⚠️ Belge içeriği bulunamadı');
      return;
    }
    const newWin = window.open('', '_blank');
    if (!newWin) {
      showToast('⚠️ Tarayıcı yeni sekme açılmasını engelledi. Lütfen açılır pencerelere izin verin.');
      return;
    }
    newWin.document.write(`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${proposal.proposalNumber} · ${proposal.customerName} · Phuket Tatili Teklif</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .a4-container { box-shadow: none !important; border: none !important; margin: 0 auto !important; }
    }
    body { background-color: #0f172a; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="p-3 sm:p-8 flex flex-col items-center min-h-screen">
  <div class="no-print w-full max-w-[780px] mb-5 p-3.5 bg-slate-900/90 text-white rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between gap-3">
    <div class="flex items-center gap-2 text-xs">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      <span class="font-bold">${proposal.proposalNumber}</span>
      <span class="text-slate-400">·</span>
      <span class="font-medium text-slate-300">${proposal.customerName}</span>
    </div>
    <div class="flex items-center gap-2">
      <button onclick="window.print()" style="cursor:pointer;" class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition">
        🖨️ A4 PDF İndir / Yazdır
      </button>
      <button onclick="window.close()" style="cursor:pointer;" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
        Kapat
      </button>
    </div>
  </div>
  <div class="a4-container w-full max-w-[780px] bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200">
    ${printArea.innerHTML}
  </div>
</body>
</html>`);
    newWin.document.close();
    showToast('🌐 Teklif belgesi yeni sekmede açıldı!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    const text = generateCuratedProposalWhatsAppMessage(proposal, financials);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('📋 Teklif metni WhatsApp formatında kopyalandı!');
    setTimeout(() => setCopied(false), 2500);
  };

  const innerContent = (
    <div className={`relative w-full ${isEmbedded ? 'min-h-[85vh] shadow-sm' : 'max-w-7xl max-h-[94vh] shadow-2xl'} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none`}>
      
      {/* ========================================================= */}
      {/* ÜST BAR (YAZDIRMA ESNASINDA GİZLENİR) */}
      {/* ========================================================= */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500 flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 id="curated-proposal-modal-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Teklifler · Özel Tur & Paket Teklif Stüdyosu</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  {isSingleTour ? '🎯 Tekli VIP Tur' : '🌟 Çok Günlü Paket'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  A4 Kurumsal · Multi-Currency
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kişiye özel çok günlü tatil paketi veya tekli VIP tur teklifleri hazırlayın, saatlik tur akışı belirleyin ve anında paylaşın.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveProposal}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Teklifi tarayıcı hafızasına kaydet"
            >
              <Save className="w-4 h-4 text-amber-600" />
              <span>Kaydet</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSavedModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Kayıtlı teklifleri görüntüle ve geri yükle"
            >
              <FolderOpen className="w-4 h-4 text-sky-500" />
              <span>Kayıtlılar ({savedProposals.length})</span>
            </button>

            {/* 👁️ PDF GÖRÜNTÜLE / DÜZENLEYİCİYE DÖN */}
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPreviewMode
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title={isPreviewMode ? 'Düzenleme paneline geri dön' : 'Sol paneli gizle ve A4 teklif belgesini tam sayfa görüntüle'}
            >
              {isPreviewMode ? <Minimize2 className="w-4 h-4" /> : <Eye className="w-4 h-4 text-sky-500" />}
              <span>{isPreviewMode ? '✏️ Düzenleyiciye Dön' : '👁️ PDF Görüntüle'}</span>
            </button>

            {/* 🖨️ A4 PDF İNDİR */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              title="A4 PDF indir veya yazıcıya gönder"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ A4 PDF İndir</span>
            </button>

            {/* 📤 PDF YOLLA */}
            <button
              type="button"
              onClick={() => {
                setSendPhone(proposal.customerPhone || '');
                setSendEmail(proposal.customerEmail || '');
                setShowSendModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              title="Misafire WhatsApp, E-posta veya sistem paylaşımı ile teklifi yolla"
            >
              <Send className="w-4 h-4" />
              <span>📤 PDF Yolla</span>
            </button>

            {/* ⚡ REZERVASYONA DÖNÜŞTÜR */}
            {onConvertToBooking && (
              <button
                type="button"
                onClick={() => {
                  const converted = convertProposalToBookingFormData(proposal);
                  onConvertToBooking(converted);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                title="Teklifi doğrudan yeni rezervasyon formuna aktar ve rezervasyon modalını aç"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>⚡ Rezervasyona Dönüştür</span>
              </button>
            )}

            {/* 📱 WHATSAPP KOPYALA */}
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="hidden sm:flex px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold items-center gap-1.5 transition-all cursor-pointer"
              title="WhatsApp teklif özetini panoya kopyala"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* İÇERİK ALANI: SOL GELİŞMİŞ PANEL + SAĞ A4 CANLI ÖNİZLEME */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 print:overflow-visible print:block">
          
          {/* SOL PANEL: AYRINTILI TEKLİF MİMARI (PRINTTE VE ÖNİZLEMEDE GİZLENİR) */}
          {!isPreviewMode && (
            <div className="w-full lg:w-[420px] p-5 space-y-4 shrink-0 bg-slate-50/70 dark:bg-slate-950/60 print:hidden overflow-y-auto">
            
            {/* ========================================================= */}
            {/* 0. TEKLİF FORMATI SEÇİCİ (ÇOK GÜNLÜ vs TEKLİ TUR) */}
            {/* ========================================================= */}
            <div className="p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/70 dark:border-slate-800 flex gap-1">
              <button
                type="button"
                onClick={() => handleSwitchProposalType('package_multiday')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isSingleTour
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🌟 Çok Günlü Tatil Paketi</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchProposalType('single_tour')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isSingleTour
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🎯 Tekli Tur & VIP Paket</span>
              </button>
            </div>

            {/* Düzenleme Sekmeleri (Moda Göre Dinamik) */}
            {isSingleTour ? (
              <div className="flex rounded-2xl bg-slate-200/70 dark:bg-slate-900 p-1 border border-slate-300/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🎯 Tur & Misafir
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all relative ${
                    activeTab === 'timeline'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>⏰ Saatlik Akış</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 text-[10px]">
                    {(proposal.singleTourTimeline || []).length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inclusions')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'inclusions'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  📋 İpuçları
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('financials')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'financials'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  💰 Fiyat
                </button>
              </div>
            ) : (
              <div className="flex rounded-2xl bg-slate-200/70 dark:bg-slate-900 p-1 border border-slate-300/60 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  🎯 Genel
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('days')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all relative ${
                    activeTab === 'days'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>🗓️ Günler</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 text-[10px]">
                    {proposal.days.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('inclusions')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'inclusions'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  📋 Dahil/Hariç
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('financials')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'financials'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  💰 Fiyat
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 1 (TEKLİ TUR): TUR, MİSAFİR & LOJİSTİK BİLGİLERİ */}
            {/* ========================================================= */}
            {isSingleTour && activeTab === 'overview' && (
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
                          (singleDay.tourTitle === preset.tourTitle || proposal.packageTitle === preset.tourTitle)
                            ? 'border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <span className="block truncate font-bold text-[11px]">
                          {getCategoryIcon(preset.category)} {preset.tourTitle}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {preset.priceThb.toLocaleString()} THB · {preset.tourDuration}
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
            )}

            {/* ========================================================= */}
            {/* TAB 2 (TEKLİ TUR): SAATLİK TUR AKIŞI (TIMELINE) */}
            {/* ========================================================= */}
            {isSingleTour && activeTab === 'timeline' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Saatlik Tur Akış Durakları ({(proposal.singleTourTimeline || []).length}):</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">A4 Belgesine Yansır</span>
                </div>

                {/* Adımlar Listesi */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {(!proposal.singleTourTimeline || proposal.singleTourTimeline.length === 0) ? (
                    <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                      Henüz saatlik adım eklenmedi. Aşağıdan ilk adımı ekleyebilir veya Genel sekmesinden bir katalog turu seçebilirsiniz.
                    </div>
                  ) : (
                    proposal.singleTourTimeline.map((step, idx) => (
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
                              disabled={idx === (proposal.singleTourTimeline?.length || 1) - 1}
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
            )}

            {/* TAB 1 (ÇOK GÜNLÜ): GENEL & MİSAFİR */}
            {!isSingleTour && activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Hızlı Şablonlar */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Hızlı Paket Şablonları:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('honeymoon', 5)}
                      className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-white block">💑 5G Balayı Rüyası</span>
                      <span className="text-[10px] text-slate-500">Romantik & Konfor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('vip_luxury', 5)}
                      className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-white block">👑 5G VIP Özel Yat</span>
                      <span className="text-[10px] text-slate-500">Lüks Katamaran & Araç</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('family', 5)}
                      className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-white block">👨‍👩‍👧‍👦 5G Aile Paketi</span>
                      <span className="text-[10px] text-slate-500">Güvenli & Çocuk Dostu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset('adventure', 3)}
                      className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-white block">⚡ 3G Doğa & Macera</span>
                      <span className="text-[10px] text-slate-500">Zipline & Kano</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyBlank}
                    className="w-full mt-2 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    ✏️ Sıfırdan Boş Özel Program Oluştur
                  </button>
                </div>

                {/* Misafir Detayları */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Misafir Adı / Hitap:
                    </label>
                    <input
                      type="text"
                      value={proposal.customerName}
                      onChange={(e) => setProposal({ ...proposal, customerName: e.target.value })}
                      placeholder="Örn: Begüm & Canberk Özkan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
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

                  {/* Konaklama Otelleri (Çoklu Otel Destekli) */}
                  <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                        <Hotel className="w-3.5 h-3.5 text-amber-500" />
                        <span>Konaklama Oteli / Otelleri ({proposalHotels.length})</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddProposalHotel}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Başka Otel Ekle</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {proposalHotels.map((h, hIdx) => (
                        <div
                          key={h.id || hIdx}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                              #{hIdx + 1} {hIdx === 0 ? 'Ana Konaklama' : `${hIdx + 1}. Otel`}
                            </span>
                            {proposalHotels.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProposalHotel(h.id)}
                                className="text-slate-400 hover:text-rose-500 p-0.5 text-xs transition cursor-pointer"
                                title="Bu oteli kaldır"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-7">
                              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                                Otel Adı *
                              </label>
                              <input
                                type="text"
                                value={h.hotelName}
                                onChange={(e) =>
                                  handleUpdateProposalHotel(h.id, { hotelName: e.target.value })
                                }
                                placeholder="Örn: The Shore at Katathani"
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                              />
                            </div>
                            <div className="sm:col-span-5">
                              <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                                Bölge *
                              </label>
                              <select
                                value={h.hotelZone || 'Patong & Kalim'}
                                onChange={(e) =>
                                  handleUpdateProposalHotel(h.id, { hotelZone: e.target.value })
                                }
                                className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                              >
                                {HOTEL_ZONES.map((zone) => (
                                  <option key={zone} value={zone}>
                                    {zone}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <label className="text-slate-500 block mb-0.5">Tarih Aralığı (Opsiyonel):</label>
                              <input
                                type="text"
                                value={h.notes || (h.checkInDate && h.checkOutDate ? `${h.checkInDate} - ${h.checkOutDate}` : '')}
                                onChange={(e) => handleUpdateProposalHotel(h.id, { notes: e.target.value })}
                                placeholder="Örn: 20-23 Ekim (3 Gece)"
                                className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-slate-500 block mb-0.5">Oda Tipi / Not:</label>
                              <input
                                type="text"
                                value={h.roomType || ''}
                                onChange={(e) => handleUpdateProposalHotel(h.id, { roomType: e.target.value })}
                                placeholder="Örn: Seaview Pool Villa"
                                className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Paket Başlığı:
                    </label>
                    <input
                      type="text"
                      value={proposal.packageTitle}
                      onChange={(e) => setProposal({ ...proposal, packageTitle: e.target.value })}
                      placeholder="Örn: 5 Günlük Klasik Balayı & Ada Rüyası"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Özel Karşılama Mektubu / Notu:
                    </label>
                    <textarea
                      rows={3}
                      value={proposal.welcomeMessage || ''}
                      onChange={(e) => setProposal({ ...proposal, welcomeMessage: e.target.value })}
                      placeholder="Misafire hitaben yazılan özel tatil karşılama mesajı..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
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
            )}

            {/* TAB 2 (ÇOK GÜNLÜ): GÜN GÜN PROGRAM MİMARI */}
            {!isSingleTour && activeTab === 'days' && (
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
                        {getCategoryIcon(t.category)} {t.tourTitle} ({t.priceThb.toLocaleString()} ฿)
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
                              {day.priceThb.toLocaleString()}฿
                            </span>

                            <button
                              type="button"
                              onClick={() => handleMoveDay(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-20"
                              title="Yukarı Taşı"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveDay(idx, 'down')}
                              disabled={idx === proposal.days.length - 1}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-20"
                              title="Aşağı Taşı"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDay(day.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600"
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
            )}

            {/* TAB 3: DAHİL / HARİÇ VE VIP SÜRPRİZLER */}
            {activeTab === 'inclusions' && (
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
                          className="text-slate-400 hover:text-rose-600 shrink-0"
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
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
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
                          className="text-slate-400 hover:text-rose-600 shrink-0"
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
                      className="px-3 py-1.5 rounded-xl bg-slate-700 text-white font-bold text-xs"
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
                          className="text-slate-400 hover:text-rose-600 shrink-0"
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
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FİYAT, DÖVİZ & ÖDEME */}
            {activeTab === 'financials' && (
              <div className="space-y-4 text-xs">
                {/* Para Birimi Seçimi */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    <span>Teklifte Gösterilecek Ana Para Birimi:</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['THB', 'TRY', 'USD', 'EUR', 'GBP'] as CurrencyCode[]).map((code) => {
                      const isSel = proposal.currency === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setProposal({ ...proposal, currency: code })}
                          className={`py-1.5 px-2 rounded-xl text-center font-bold text-xs transition-all ${
                            isSel
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {code} ({CURRENCY_SYMBOLS[code]})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* İndirim ve Kapora Oranı */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Özel Paket İndirimi (%):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={proposal.discountPercent}
                      onChange={(e) => setProposal({ ...proposal, discountPercent: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                    <div className="flex gap-1 mt-1">
                      {[0, 5, 10, 12, 15, 20].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setProposal({ ...proposal, discountPercent: p })}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            proposal.discountPercent === p
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                          }`}
                        >
                          %{p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Rezervasyon Kaporası (%):
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={proposal.depositPercent}
                      onChange={(e) => setProposal({ ...proposal, depositPercent: Math.max(10, parseInt(e.target.value) || 30) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                    <div className="flex gap-1 mt-1">
                      {[20, 30, 50, 100].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setProposal({ ...proposal, depositPercent: p })}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            proposal.depositPercent === p
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                          }`}
                        >
                          %{p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ödeme Yöntemleri & Banka Notu */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Ödeme Yöntemleri & Banka Bilgisi:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={proposal.paymentMethodsNote || ''}
                    onChange={(e) => setProposal({ ...proposal, paymentMethodsNote: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>

                {/* Güvence ve İptal Şartları */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fiyat Garantisi & Güvence Notu:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={proposal.customNotes}
                    onChange={(e) => setProposal({ ...proposal, customNotes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

          {/* ========================================================= */}
          {/* SAĞ PANEL: A4 CANLI VE BASKIYA HAZIR LÜKS TEKLİF DOKÜMANI */}
          {/* ========================================================= */}
          <div className={`flex-1 p-4 sm:p-10 bg-slate-100/60 dark:bg-slate-950/40 text-slate-900 overflow-y-auto print:p-0 print:bg-white print:overflow-visible ${isPreviewMode ? 'lg:p-12' : ''}`}>

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
                <>
                  {/* ANTET / LÜKS OPERATÖR BAŞLIĞI */}
                  <div className="flex items-start justify-between border-b-2 border-amber-500 pb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                          PHUKET TATİLİ
                        </span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                          VIP TUR & AKTİVİTE TEKLİFİ
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 font-semibold">
                        Siam Horizon Co., Ltd. · Licensed Inbound Tour Operator · TAT License: 34/02819
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Phuket Head Office: 48/12 Moo 5, Chalong, Mueang Phuket, 83130 Thailand
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-amber-600 block">
                        {proposal.proposalNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Düzenleme: {proposal.createdAtDate}
                      </span>
                      <span className="text-[11px] text-emerald-600 font-bold block">
                        Geçerlilik: {proposal.validUntilDate}
                      </span>
                    </div>
                  </div>

                  {/* MİSAFİR & TUR KARTI */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block">
                        Kişiye Özel Hazırlanan VIP Tur Teklifi
                      </span>
                      <h2 className="text-xl font-extrabold text-slate-950">
                        {proposal.customerName}
                      </h2>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pt-0.5">
                        <span>🏨 Alınış Oteli: <strong className="text-slate-900">{proposal.hotelName}</strong> ({proposal.hotelZone})</span>
                        {proposal.customerPhone && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-slate-800">📱 {proposal.customerPhone}</span>
                          </>
                        )}
                        {proposal.singleTourDate && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              <Calendar className="w-3 h-3 text-amber-600" />
                              <span>Tur Tarihi: {proposal.singleTourDate}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-950 text-xs font-black inline-block shadow-2xs">
                        {singleDay.tourTitle || proposal.packageTitle}
                      </span>
                      <div className="text-xs text-slate-600 flex sm:justify-end items-center gap-1.5">
                        <span>👥 {proposal.adultCount} Yetişkin {proposal.childCount > 0 ? `+ ${proposal.childCount} Çocuk` : ''}</span>
                        <span>·</span>
                        <span className="font-bold text-emerald-700">Özel / VIP Tur</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        👨‍💼 Danışman: <span className="font-semibold text-slate-700">{proposal.agentInfo.name}</span> ({proposal.agentInfo.phone})
                      </p>
                    </div>
                  </div>

                  {/* LOJİSTİK VE DONANIM BİLGİ ROZETLERİ */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
                      <span className="text-[10px] text-amber-700 font-bold block">⏰ Lobi Alınış:</span>
                      <span className="text-xs font-extrabold text-slate-900 font-mono block mt-0.5">
                        {singleDay.pickupWindow || '07:30 - 07:45'}
                      </span>
                      <span className="text-[10px] text-slate-500">Süre: {singleDay.tourDuration || 'Tam Gün'}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/70">
                      <span className="text-[10px] text-sky-700 font-bold block">🚤 Ulaşım / Araç:</span>
                      <span className="text-xs font-extrabold text-slate-900 block mt-0.5 truncate" title={proposal.singleTourVesselInfo || TRANSPORT_META[singleDay.transportType]?.label}>
                        {proposal.singleTourVesselInfo || TRANSPORT_META[singleDay.transportType]?.label || 'VIP Klimalı Araç'}
                      </span>
                      <span className="text-[10px] text-slate-500">Konforlu Seyahat</span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
                      <span className="text-[10px] text-emerald-700 font-bold block">🍽️ Yemek Planı:</span>
                      <span className="text-xs font-extrabold text-slate-900 block mt-0.5 truncate">
                        {MEAL_PLAN_META[singleDay.mealPlan]?.label || 'Açık Büfe Yemek'}
                      </span>
                      <span className="text-[10px] text-slate-500">Meyve & Soğuk Su Dahil</span>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/70">
                      <span className="text-[10px] text-purple-700 font-bold block">🎫 Milli Park Durumu:</span>
                      <span className="text-xs font-extrabold text-slate-900 block mt-0.5 truncate">
                        {NATIONAL_PARK_META[singleDay.nationalParkFeeStatus]?.label || 'Dahil'}
                      </span>
                      <span className="text-[10px] text-slate-500">Resmi İzinli</span>
                    </div>
                  </div>

                  {/* ÖNE ÇIKAN VURGU */}
                  {singleDay.highlight && (
                    <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950 italic flex items-start gap-2">
                      <span className="text-base leading-none">✨</span>
                      <span>"{singleDay.highlight}"</span>
                    </div>
                  )}

                  {/* SAATLİK TUR AKIŞI & ZAMAN ÇİZELGESİ (TIMELINE) */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4 break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Öngörülen Saatlik Tur Akışı & Zaman Çizelgesi:</span>
                      </h3>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                        {(proposal.singleTourTimeline || []).length} Durak / Aşama
                      </span>
                    </div>

                    {(!proposal.singleTourTimeline || proposal.singleTourTimeline.length === 0) ? (
                      <p className="text-xs text-slate-400 py-3 text-center">
                        Henüz saatlik adım eklenmedi. Sol panelden "Saatlik Tur Akışı" sekmesinden adımları ekleyebilirsiniz.
                      </p>
                    ) : (
                      <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-400/40">
                        {proposal.singleTourTimeline.map((step, sIdx) => (
                          <div key={step.id || sIdx} className="relative flex items-start gap-3 text-xs">
                            {/* Dot */}
                            <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center shadow-2xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            </div>
                            
                            {/* Zaman rozeti */}
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-mono font-bold text-[11px] shrink-0">
                              {step.time}
                            </span>

                            {/* Detay */}
                            <div className="flex-1 min-w-0">
                              <span className="font-black text-slate-900 block">{step.title}</span>
                              {step.description && (
                                <span className="text-[11px] text-slate-600 block mt-0.5 leading-relaxed">
                                  {step.description}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* DAHİL OLANLAR & YANINIZDA GETİRECEKLERİNİZ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fiyata Dahil Olan Güvenceler:</span>
                      </h4>
                      <ul className="space-y-1 text-[10px] text-slate-700">
                        {(singleDay.included && singleDay.included.length > 0 ? singleDay.included : proposal.inclusions.slice(0, 5)).map((inc, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
                        <span>🎒</span>
                        <span>Yanınızda Getirmeniz Önerilenler:</span>
                      </h4>
                      <ul className="space-y-1 text-[10px] text-slate-700">
                        {(proposal.singleTourTips && proposal.singleTourTips.length > 0 ? proposal.singleTourTips : DEFAULT_SINGLE_TOUR_TIPS).map((tip, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* FİNANSAL TABLO & İNDİRİMLİ ÖDEME PLANI */}
                  <div className="p-5 rounded-3xl bg-slate-950 text-white space-y-3.5 shadow-lg break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 text-slate-400">
                      <span>Tur Liste Fiyatı:</span>
                      <span className="font-mono">{financials.subtotalThb.toLocaleString()} THB</span>
                    </div>

                    {proposal.discountPercent > 0 && (
                      <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                        <span>Özel İndirim (%{proposal.discountPercent}):</span>
                        <span className="font-mono">-{financials.discountThb.toLocaleString()} THB</span>
                      </div>
                    )}

                    <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                      <div>
                        <span className="text-base font-black text-white block">Net Tur Bedeli:</span>
                        <span className="text-[11px] text-slate-400">
                          (~{financials.totalTry.toLocaleString()} TL · ~{financials.totalUsd.toLocaleString()} USD · ~{financials.totalEur.toLocaleString()} EUR)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                          {financials.totalThb.toLocaleString()} <span className="text-sm font-normal">THB</span>
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          (Kişi başı: {financials.perPersonThb.toLocaleString()} THB)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Rezervasyon Kapora Bedeli (%{proposal.depositPercent}):
                        </span>
                        <span className="font-black text-emerald-400 font-mono text-sm sm:text-base mt-0.5 block">
                          {financials.depositThb.toLocaleString()} THB
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Türkiye IBAN / Kredi Kartı / PromptPay
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">
                          Tur Günü Kalan Bakiye:
                        </span>
                        <span className="font-black text-amber-300 font-mono text-sm sm:text-base mt-0.5 block">
                          {financials.remainingThb.toLocaleString()} THB
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Sabah transferde / marinada nakit Baht
                        </span>
                      </div>
                    </div>

                    {proposal.paymentMethodsNote && (
                      <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                        💳 <strong>Ödeme Kanalları:</strong> {proposal.paymentMethodsNote}
                      </p>
                    )}
                  </div>

                  {/* GÜVENCELER & RESMİ MÜHÜR */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-[10px] text-slate-600 break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Phuket Tatili Resmi Operatör Güvenceleri:</span>
                    </div>
                    <p>
                      • <strong>Hava Muhalefeti Güvencesi:</strong> Andaman Denizi liman başkanlığı tarafından dalga/fırtına nedeniyle tur iptali kararı verilirse %100 kesintisiz tarih değişimi veya tam ücret iadesi uygulanır.
                    </p>
                    <p>
                      • <strong>Sigorta Kapsamı:</strong> Tayland Turizm Bakanlığı (TAT: 34/02819) nezdinde geçerli seyahat kaza sigortası dahildir.
                    </p>
                    <p className="pt-1 text-slate-500 font-medium">
                      Rezervasyon Onayı & 7/24 Türkçe Saha Asistanı: +66 82 895 0665 · info@phukettatili.com
                    </p>
                  </div>
                </>
              ) : (
                <>
              {/* ANTET / LÜKS OPERATÖR BAŞLIĞI */}
              <div className="flex items-start justify-between border-b-2 border-amber-500 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl font-black tracking-tight text-slate-950 font-serif">
                      PHUKET TATİLİ
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
                      VIP INBOUND OPERATOR
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-semibold">
                    Siam Horizon Co., Ltd. · Licensed Inbound Tour Operator · TAT License: 34/02819
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Phuket Head Office: 48/12 Moo 5, Chalong, Mueang Phuket, 83130 Thailand
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-black text-amber-600 block">
                    {proposal.proposalNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Düzenleme: {proposal.createdAtDate}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold block">
                    Geçerlilik: {proposal.validUntilDate}
                  </span>
                </div>
              </div>

              {/* MİSAFİR & DANIŞMAN KARTI */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block">
                    Kişiye Özel Hazırlanan Seyahat Programı
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-950">
                      {proposal.customerName}
                    </h2>
                    {proposal.customerPhone && (
                      <span className="text-xs font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-md">
                        📱 {proposal.customerPhone}
                      </span>
                    )}
                  </div>
                  {proposalHotels.length > 1 ? (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                        🏨 Konaklama Otelleri ({proposalHotels.length} Farklı Otel):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {proposalHotels.map((h, i) => (
                          <span
                            key={h.id || i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 shadow-2xs"
                          >
                            <span className="font-extrabold text-amber-600">#{i + 1}</span>
                            <span>{h.hotelName || `Otel ${i + 1}`}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({h.hotelZone}){h.notes ? ` · ${h.notes}` : ''}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600">
                      🏨 Konaklama: <span className="font-bold text-slate-900">{proposal.hotelName}</span> ({proposal.hotelZone})
                    </p>
                  )}
                </div>

                <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-950 text-xs font-black inline-block shadow-2xs">
                    {proposal.packageTitle}
                  </span>
                  <div className="text-xs text-slate-600 flex sm:justify-end items-center gap-1.5">
                    <span>👥 {proposal.adultCount} Yetişkin {proposal.childCount > 0 ? `+ ${proposal.childCount} Çocuk` : ''}</span>
                    <span>·</span>
                    <span className="font-bold text-emerald-700">{proposal.days.length} Günlük Rota</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    👨‍💼 Danışman: <span className="font-semibold text-slate-700">{proposal.agentInfo.name}</span> ({proposal.agentInfo.phone})
                  </p>
                </div>
              </div>

              {/* ÖZEL KARŞILAMA MESAJI (VARSA) */}
              {proposal.welcomeMessage && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950 italic">
                  "{proposal.welcomeMessage}"
                </div>
              )}

              {/* GÜN GÜN PROGRAM KARTLARI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🗓️ Gün Gün Seyahat Programı & Alınış Saatleri:</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {proposal.days.length} Gün · Tam Planlama
                  </span>
                </div>

                {proposal.days.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
                    Henüz gün/tur eklenmedi. Sol panelden "Katalogdan Tek Tıkla Tur Ekle" seçeneğiyle turlarınızı ekleyebilirsiniz.
                  </div>
                ) : (
                  proposal.days.map((day) => {
                    const transMeta = TRANSPORT_META[day.transportType];
                    const mealMeta = MEAL_PLAN_META[day.mealPlan];
                    const npMeta = NATIONAL_PARK_META[day.nationalParkFeeStatus];

                    return (
                      <div
                        key={day.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-400/60 transition-all flex items-start gap-3.5 break-inside-avoid shadow-2xs"
                        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                      >
                        {/* Gün Numarası Rozeti */}
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center shrink-0 font-bold shadow-xs">
                          <span className="text-[9px] text-amber-400 tracking-wider leading-none">GÜN</span>
                          <span className="text-lg leading-tight font-black">{day.dayNumber}</span>
                        </div>

                        {/* Gün İçeriği */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                                <span>{getCategoryIcon(day.category)}</span>
                                <span>{day.dayTitle}</span>
                              </h4>
                              <p className="text-xs font-bold text-amber-700 mt-0.5">
                                {day.tourTitle}
                              </p>
                            </div>
                            <span className="text-xs font-mono font-black text-slate-900 shrink-0">
                              {day.priceThb.toLocaleString()} THB
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2">
                            {day.highlight}
                          </p>

                          {/* Saat & Lojistik Rozetleri */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                            {/* Alınış Saati Rozeti */}
                            <span className="flex items-center gap-1 text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-lg font-mono font-bold">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Lobi Alınış: {day.pickupWindow}</span>
                            </span>

                            {/* Alınış Oteli Rozeti (Çoklu otel varsa) */}
                            {day.hotelName && (
                              <span className="flex items-center gap-1 text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg font-medium border border-slate-200">
                                <Hotel className="w-3 h-3 text-amber-600" />
                                <span>Alınış Oteli: {day.hotelName}</span>
                              </span>
                            )}

                            {/* Tur Süresi */}
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                              Süre: {day.tourDuration}
                            </span>

                            {/* Ulaşım Rozeti */}
                            {transMeta && (
                              <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/60 font-semibold">
                                {transMeta.icon} {transMeta.label}
                              </span>
                            )}

                            {/* Yemek Rozeti */}
                            {mealMeta && mealMeta.label !== 'Yemeksiz / Serbest Tercih' && (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
                                {mealMeta.icon} {mealMeta.label}
                              </span>
                            )}

                            {/* Milli Park Rozeti */}
                            {npMeta && (
                              <span className={`px-2 py-0.5 rounded-lg border font-semibold ${npMeta.badge}`}>
                                {npMeta.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* DAHİL & HARİÇ OLANLAR TABLOSU */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 break-inside-avoid"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pakete Dahil Olan Güvenceler:</span>
                  </h4>
                  <ul className="space-y-1 text-[10px] text-slate-700">
                    {proposal.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Pakete Dahil Olmayanlar:</span>
                  </h4>
                  <ul className="space-y-1 text-[10px] text-slate-600">
                    {proposal.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">✕</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* VIP İKRAM & SÜRPRİZLER (VARSA) */}
              {proposal.specialGifts && proposal.specialGifts.length > 0 && (
                <div
                  className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-950 break-inside-avoid"
                  style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                >
                  <div className="flex items-center gap-1.5 text-xs font-black text-purple-900 mb-1">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <span>Phuket Tatili'nden Çiftimize Özel Jest & İkramlar:</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-semibold text-purple-900/90 pt-1">
                    {proposal.specialGifts.map((gift, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span>🎁</span>
                        <span>{gift}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* FİNANSAL TABLO & İNDİRİMLİ ÖDEME PLANI */}
              <div
                className="p-5 rounded-3xl bg-slate-950 text-white space-y-3.5 break-inside-avoid shadow-lg"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 text-slate-400">
                  <span>Turlar Liste Fiyatı Toplamı:</span>
                  <span className="font-mono">{financials.subtotalThb.toLocaleString()} THB</span>
                </div>

                {proposal.discountPercent > 0 && (
                  <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                    <span>Özel Paket İndirimi (%{proposal.discountPercent}):</span>
                    <span className="font-mono">-{financials.discountThb.toLocaleString()} THB</span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-base font-black text-white block">Net Paket Bedeli:</span>
                    <span className="text-[11px] text-slate-400">
                      (~{financials.totalTry.toLocaleString()} TL · ~{financials.totalUsd.toLocaleString()} USD · ~{financials.totalEur.toLocaleString()} EUR)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                      {financials.totalThb.toLocaleString()} <span className="text-sm font-normal">THB</span>
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      (Kişi başı yaklaşık {financials.perPersonThb.toLocaleString()} THB)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Rezervasyon Kapora Bedeli (%{proposal.depositPercent}):
                    </span>
                    <span className="font-black text-emerald-400 font-mono text-sm sm:text-base mt-0.5 block">
                      {financials.depositThb.toLocaleString()} THB
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Türkiye IBAN / Kredi Kartı / PromptPay
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Tur Günü Teslim Edilecek Kalan:
                    </span>
                    <span className="font-black text-amber-300 font-mono text-sm sm:text-base mt-0.5 block">
                      {financials.remainingThb.toLocaleString()} THB
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Sabah lobi transferinde şoföre nakit Baht
                    </span>
                  </div>
                </div>

                {proposal.paymentMethodsNote && (
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    💳 <strong>Ödeme Kanalları:</strong> {proposal.paymentMethodsNote}
                  </p>
                )}
              </div>

              {/* DAHİL OLAN GÜVENCELER & KURUMSAL MÜHÜR */}
              <div
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-[10px] text-slate-600 break-inside-avoid"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Phuket Tatili Resmi Operatör Güvenceleri & İade Kalkanı:</span>
                </div>
                <p>
                  • <strong>Hava Muhalefeti Güvencesi:</strong> Andaman Denizi liman başkanlığı tarafından dalga/fırtına nedeniyle tur iptali kararı verilirse %100 kesintisiz tarih değişimi veya tam ücret iadesi uygulanır.
                </p>
                <p>
                  • <strong>Sigorta Kapsamı:</strong> Tayland Turizm Bakanlığı (TAT) ve Deniz Polisi nezdinde geçerli seyahat kaza sigortası tüm misafirlerimize turlar boyunca dahildir.
                </p>
                <p className="pt-1 text-slate-500 font-medium">
                  Rezervasyon Onayı & 7/24 Türkçe Saha Asistanı: +66 82 895 0665 · info@phukettatili.com · www.phukettatili.com
                </p>
              </div>
                </>
              )}

            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 📤 PDF & TEKLİF YOLLA / PAYLAŞIM MODALI */}
        {/* ========================================================= */}
        {showSendModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
              
              {/* Modal Başlığı */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Teklif & PDF Paylaşım Merkezi</span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {proposal.proposalNumber} · {proposal.customerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Teklif Özeti Rozeti */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {proposal.packageTitle}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {proposal.adultCount} Yetişkin {proposal.childCount > 0 ? `+ ${proposal.childCount} Çocuk` : ''} · {isSingleTour ? 'Tek Tur' : `${proposal.days.length} Günlük Paket`}
                  </span>
                </div>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {financials.totalThb.toLocaleString()} THB
                </span>
              </div>

              <div className="space-y-4">
                {/* 1. WHATSAPP İLE GÖNDER */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>1. WhatsApp ile Direkt Gönder:</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">En Hızlı</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sendPhone}
                      onChange={(e) => setSendPhone(e.target.value)}
                      placeholder="Örn: +90 532 123 4567 veya 082..."
                      className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleDirectWhatsAppSend()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Gönder</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-emerald-800/70 dark:text-emerald-400/80">
                    💡 WhatsApp web veya uygulamasında doğrudan misafirin sohbeti açılır ve teklif metni hazır olarak doldurulur.
                  </p>
                </div>

                {/* 2. E-POSTA İLE GÖNDER */}
                <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-sky-950 dark:text-sky-300 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-sky-600" />
                      <span>2. E-posta ile Gönder:</span>
                    </label>
                    <span className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">Kurumsal</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={sendEmail}
                      onChange={(e) => setSendEmail(e.target.value)}
                      placeholder="Örn: misafir@gmail.com"
                      className="flex-1 px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleEmailSend()}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer shrink-0"
                    >
                      <Mail className="w-4 h-4" />
                      <span>E-posta Aç</span>
                    </button>
                  </div>
                </div>

                {/* 3. DİĞER KANALLAR & CİHAZ PAYLAŞIMI */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Share2 className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Cihaz Paylaşımı</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      AirDrop, Telegram veya Diğer Uygulamalar
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-emerald-500" />}
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {copied ? 'Kopyalandı!' : 'Metni Kopyala'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Teklif metnini panoya kopyalayıp dilediğiniz yere yapıştırın
                    </span>
                  </button>
                </div>

                {/* 4. A4 PDF DOSYASI EKLEME REHBERİ */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                      <span>📎 PDF Belgesini Dosya Olarak Göndermek İçin:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSendModal(false);
                        handlePrint();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black cursor-pointer shadow-xs"
                    >
                      🖨️ PDF'i Hemen İndir
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    1. <strong>"PDF'i Hemen İndir"</strong> butonuna basıp PDF olarak kaydedin.<br />
                    2. Yukarıdaki <strong>WhatsApp</strong> veya <strong>E-posta</strong> butonuna tıklayın.<br />
                    3. Açılan sohbete indirdiğiniz PDF dosyasını ataş (📎) ile iliştirip gönderin.
                  </p>
                </div>
              </div>

              {/* Alt Butonlar */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Yeni Sekmede Önizle</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Kapat
                </button>
              </div>

            </div>
          </div>
        )}

        {/* KAYITLI TEKLİFLER MODALI */}
        {showSavedModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-sky-500" />
                  <span>Kayıtlı Teklifler ({savedProposals.length})</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSavedModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {savedProposals.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    Henüz kayıtlı bir teklif bulunmuyor. Üst bardaki "Kaydet" butonuna tıklayarak tekliflerinizi buraya kaydedebilirsiniz.
                  </p>
                ) : (
                  savedProposals.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadSavedProposal(item)}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-amber-500/60 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                            {item.proposalType === 'single_tour' ? '🎯 Tekli Tur' : '🌟 Çok Günlü'}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                          <span>👤 {item.customerName}</span>
                          <span>·</span>
                          <span>📅 {item.savedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoadSavedProposal(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                        >
                          Aç
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedProposal(item.id, e)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Teklifi sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSavedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
  );

  if (isEmbedded) {
    return <div className="w-full animate-fadeIn">{innerContent}</div>;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="curated-proposal-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0"
    >
      {innerContent}
    </div>
  );
}
