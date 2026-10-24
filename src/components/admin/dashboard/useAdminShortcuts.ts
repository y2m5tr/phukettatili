import { useEffect } from 'react';
import type { AdminTab } from '../adminNav';

export interface UseAdminShortcutsArgs {
  activeTab: AdminTab;
  setActiveTab: (t: AdminTab) => void;
  visibleNavItems: { id: AdminTab }[];
  allowedTabs: readonly AdminTab[];
  modals: any;
  showToast: (msg: string) => void;
}

export function useAdminShortcuts({
  activeTab,
  setActiveTab,
  visibleNavItems,
  allowedTabs,
  modals,
  showToast,
}: UseAdminShortcutsArgs) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modals.confirmModal) { modals.setConfirmModal(null); return; }
        if (modals.conflictBooking) { modals.setConflictBooking(null); return; }
        if (modals.workflowBooking) { modals.setWorkflowBooking(null); return; }
        if (modals.isCommandPaletteOpen) { modals.setIsCommandPaletteOpen(false); return; }
        if (modals.isTourModalOpen) { modals.setIsTourModalOpen(false); return; }
        if (modals.isCategoryModalOpen) { modals.setIsCategoryModalOpen(false); return; }
        if (modals.isModalOpen) { modals.setIsModalOpen(false); return; }
        if (modals.isBlogModalOpen) { modals.setIsBlogModalOpen(false); return; }
        if (modals.isServiceModalOpen) { modals.setIsServiceModalOpen(false); return; }
        if (modals.isFaqModalOpen) { modals.setIsFaqModalOpen(false); return; }
        if (modals.isTestiModalOpen) { modals.setIsTestiModalOpen(false); return; }
        if (modals.isAddMediaModalOpen) { modals.setIsAddMediaModalOpen(false); return; }
        if (modals.voucherBooking) { modals.setVoucherBooking(null); return; }
        if (modals.whatsAppModalBooking) { modals.setWhatsAppModalBooking(null); return; }
        if (modals.isPoliceManifestOpen) { modals.setIsPoliceManifestOpen(false); return; }
        if (modals.isQrScannerOpen) { modals.setIsQrScannerOpen(false); return; }
        if (modals.isBulkRescheduleOpen) { modals.setIsBulkRescheduleOpen(false); return; }
        if (modals.isLostFoundOpen) { modals.setIsLostFoundOpen(false); return; }
        if (modals.isDietaryManifestOpen) { modals.setIsDietaryManifestOpen(false); return; }
        if (modals.isFieldCashierOpen) { modals.setIsFieldCashierOpen(false); return; }
        if (modals.isFlightRadarOpen) { modals.setIsFlightRadarOpen(false); return; }
        if (modals.isDriverExpenseOpen) { modals.setIsDriverExpenseOpen(false); return; }
        if (modals.isGuideExpenseOpen) { modals.setIsGuideExpenseOpen(false); return; }
        if (modals.isWelcomeBoardOpen) { modals.setIsWelcomeBoardOpen(false); return; }
        if (modals.isLuggageExpressOpen) { modals.setIsLuggageExpressOpen(false); return; }
        if (modals.isPierManifestOpen) { modals.setIsPierManifestOpen(false); return; }
        if (modals.isCaptainDrawerOpen) { modals.setIsCaptainDrawerOpen(false); return; }
        if (modals.curatedProposalData) { modals.setCuratedProposalData(null); return; }
        if (modals.isPromptPayQrOpen) { modals.setIsPromptPayQrOpen(false); return; }
        return;
      }

      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '[' || e.key === ']') {
        const idx = visibleNavItems.findIndex((i) => i.id === activeTab);
        if (idx !== -1) {
          const next =
            e.key === ']'
              ? (idx + 1) % visibleNavItems.length
              : (idx - 1 + visibleNavItems.length) % visibleNavItems.length;
          setActiveTab(visibleNavItems[next].id);
        }
      }

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const keyMap: Record<string, AdminTab> = {
          '1': 'overview',
          '2': 'bookings',
          '3': 'transfers',
          '4': 'settlements',
          '5': 'fleet',
        };
        const targetTab = keyMap[e.key];
        if (targetTab && allowedTabs.includes(targetTab)) {
          setActiveTab(targetTab);
          showToast(`⚡ ${targetTab} sekmesine geçildi`);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, visibleNavItems, allowedTabs, modals, setActiveTab, showToast]);
}
