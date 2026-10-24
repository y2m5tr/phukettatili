import { useState, useCallback, useEffect } from 'react';
import type {
  Booking,
  TourItem,
  FaqItem,
  TestimonialItem,
  ServiceItem,
  BlogItem,
  MediaItem,
} from '../../../data/adminInitialData';
import type { CategoryItem } from '../../../data/adminTypes';
import type { ConflictData } from '../ConflictResolutionModal';

export function useAdminDashboardModals() {
  // 1. Booking Form Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<Partial<Booking>>({});

  // 2. Voucher / Boarding Pass
  const [voucherBooking, setVoucherBooking] = useState<Booking | null>(null);

  // 3. Curated Proposal
  const [curatedProposalData, setCuratedProposalData] = useState<{
    customerName?: string;
    hotel?: string;
    zone?: string;
    phone?: string;
    proposalType?: 'package_multiday' | 'single_tour';
    tourTitle?: string;
    tourDate?: string;
    adultCount?: number;
    childCount?: number;
  } | null>(null);

  // 4. Captain Drawer
  const [isCaptainDrawerOpen, setIsCaptainDrawerOpen] = useState<boolean>(false);

  // 5. WhatsApp Templates
  const [whatsAppModalBooking, setWhatsAppModalBooking] = useState<Booking | null>(null);

  // 6. Workflow Modal
  const [workflowBooking, setWorkflowBooking] = useState<Booking | null>(null);

  // 7. Conflict Resolution
  const [conflictBooking, setConflictBooking] = useState<ConflictData | null>(null);

  // 8. Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const requestConfirm = useCallback(
    (opts: {
      title: string;
      message: string;
      confirmText?: string;
      isDestructive?: boolean;
      onConfirm: () => void;
    }) => {
      setConfirmModal({ isOpen: true, ...opts });
    },
    []
  );

  // 9. Command Palette (Cmd+K)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 10. Operational Modals
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [isPoliceManifestOpen, setIsPoliceManifestOpen] = useState<boolean>(false);
  const [isBulkRescheduleOpen, setIsBulkRescheduleOpen] = useState<boolean>(false);
  const [isLostFoundOpen, setIsLostFoundOpen] = useState<boolean>(false);
  const [isDietaryManifestOpen, setIsDietaryManifestOpen] = useState<boolean>(false);
  const [isFieldCashierOpen, setIsFieldCashierOpen] = useState<boolean>(false);
  const [cashierBooking, setCashierBooking] = useState<Booking | null>(null);
  const [isFlightRadarOpen, setIsFlightRadarOpen] = useState<boolean>(false);
  const [flightRadarFlight, setFlightRadarFlight] = useState<string>('TK 172');
  const [flightRadarGuest, setFlightRadarGuest] = useState<string>('');
  const [isDriverExpenseOpen, setIsDriverExpenseOpen] = useState<boolean>(false);
  const [isGuideExpenseOpen, setIsGuideExpenseOpen] = useState<boolean>(false);
  const [isWelcomeBoardOpen, setIsWelcomeBoardOpen] = useState<boolean>(false);
  const [welcomeBoardBooking, setWelcomeBoardBooking] = useState<Booking | null>(null);
  const [isTourMediaOpen, setIsTourMediaOpen] = useState<boolean>(false);
  const [tourMediaBooking, setTourMediaBooking] = useState<Booking | null>(null);
  const [isLuggageExpressOpen, setIsLuggageExpressOpen] = useState<boolean>(false);
  const [isPierManifestOpen, setIsPierManifestOpen] = useState<boolean>(false);
  const [isSupplierDispatchOpen, setIsSupplierDispatchOpen] = useState<boolean>(false);
  const [supplierDispatchBooking, setSupplierDispatchBooking] = useState<Booking | null>(null);
  const [isPromptPayQrOpen, setIsPromptPayQrOpen] = useState<boolean>(false);
  const [promptPayQrBooking, setPromptPayQrBooking] = useState<Booking | null>(null);

  // 11. CMS Modals
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);
  const [editingTour, setEditingTour] = useState<TourItem | null>(null);
  const [tourFormData, setTourFormData] = useState<Partial<TourItem>>({});

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<CategoryItem>>({});

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState<boolean>(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [testimonialFormData, setTestimonialFormData] = useState<Partial<TestimonialItem>>({});

  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqFormData, setFaqFormData] = useState<Partial<FaqItem>>({});

  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Partial<ServiceItem>>({});

  const [isBlogModalOpen, setIsBlogModalOpen] = useState<boolean>(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogFormData, setBlogFormData] = useState<Partial<BlogItem>>({});

  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState<boolean>(false);
  const [lightboxMedia, setLightboxMedia] = useState<MediaItem | null>(null);
  const [assignMediaModal, setAssignMediaModal] = useState<{ url: string; title?: string } | null>(null);

  return {
    isModalOpen,
    setIsModalOpen,
    editingBooking,
    setEditingBooking,
    formData,
    setFormData,
    voucherBooking,
    setVoucherBooking,
    curatedProposalData,
    setCuratedProposalData,
    isCaptainDrawerOpen,
    setIsCaptainDrawerOpen,
    whatsAppModalBooking,
    setWhatsAppModalBooking,
    workflowBooking,
    setWorkflowBooking,
    conflictBooking,
    setConflictBooking,
    confirmModal,
    setConfirmModal,
    requestConfirm,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isQrScannerOpen,
    setIsQrScannerOpen,
    isPoliceManifestOpen,
    setIsPoliceManifestOpen,
    isBulkRescheduleOpen,
    setIsBulkRescheduleOpen,
    isLostFoundOpen,
    setIsLostFoundOpen,
    isDietaryManifestOpen,
    setIsDietaryManifestOpen,
    isFieldCashierOpen,
    setIsFieldCashierOpen,
    cashierBooking,
    setCashierBooking,
    isFlightRadarOpen,
    setIsFlightRadarOpen,
    flightRadarFlight,
    setFlightRadarFlight,
    flightRadarGuest,
    setFlightRadarGuest,
    isDriverExpenseOpen,
    setIsDriverExpenseOpen,
    isGuideExpenseOpen,
    setIsGuideExpenseOpen,
    isWelcomeBoardOpen,
    setIsWelcomeBoardOpen,
    welcomeBoardBooking,
    setWelcomeBoardBooking,
    isTourMediaOpen,
    setIsTourMediaOpen,
    tourMediaBooking,
    setTourMediaBooking,
    isLuggageExpressOpen,
    setIsLuggageExpressOpen,
    isPierManifestOpen,
    setIsPierManifestOpen,
    isSupplierDispatchOpen,
    setIsSupplierDispatchOpen,
    supplierDispatchBooking,
    setSupplierDispatchBooking,
    isPromptPayQrOpen,
    setIsPromptPayQrOpen,
    promptPayQrBooking,
    setPromptPayQrBooking,
    isTourModalOpen,
    setIsTourModalOpen,
    editingTour,
    setEditingTour,
    tourFormData,
    setTourFormData,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    setEditingCategory,
    categoryFormData,
    setCategoryFormData,
    isTestimonialModalOpen,
    setIsTestimonialModalOpen,
    editingTestimonial,
    setEditingTestimonial,
    testimonialFormData,
    setTestimonialFormData,
    isFaqModalOpen,
    setIsFaqModalOpen,
    editingFaq,
    setEditingFaq,
    faqFormData,
    setFaqFormData,
    isServiceModalOpen,
    setIsServiceModalOpen,
    editingService,
    setEditingService,
    serviceFormData,
    setServiceFormData,
    isBlogModalOpen,
    setIsBlogModalOpen,
    editingBlog,
    setEditingBlog,
    blogFormData,
    setBlogFormData,
    isAddMediaModalOpen,
    setIsAddMediaModalOpen,
    lightboxMedia,
    setLightboxMedia,
    assignMediaModal,
    setAssignMediaModal,
  };
}
