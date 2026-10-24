import type React from 'react';
import type { CuratedProposalData, ProposalType } from '../../../lib/curatedProposal';
import { saveCmsCollection } from '../../../lib/cmsSync';

export interface SavedProposalItem {
  id: string;
  savedAt: string;
  title: string;
  customerName: string;
  proposalType: ProposalType;
  data: CuratedProposalData;
}

export function saveProposalToStorage(
  proposal: CuratedProposalData,
  savedProposals: SavedProposalItem[],
  showToast: (msg: string) => void
): SavedProposalItem[] {
  try {
    const item: SavedProposalItem = {
      id: proposal.proposalNumber || `prop-${Date.now()}`,
      savedAt: new Date().toLocaleString('tr-TR'),
      title: proposal.packageTitle || 'Özel Teklif',
      customerName: proposal.customerName || 'Misafir',
      proposalType: proposal.proposalType || 'package_multiday',
      data: proposal,
    };
    const updated = [item, ...savedProposals.filter((p) => p.id !== item.id)].slice(0, 50);
    void saveCmsCollection('proposals', updated, (err) => showToast(`⚠️ ${err}`));
    showToast(`💾 "${item.title}" teklifi kaydedildi ve buluta senkronlandı!`);
    return updated;
  } catch {
    showToast('⚠️ Teklif kaydedilirken bir hata oluştu');
    return savedProposals;
  }
}

export function deleteProposalFromStorage(
  id: string,
  savedProposals: SavedProposalItem[],
  showToast: (msg: string) => void
): SavedProposalItem[] {
  try {
    const updated = savedProposals.filter((p) => p.id !== id);
    void saveCmsCollection('proposals', updated, (err) => showToast(`⚠️ ${err}`));
    showToast('🗑️ Kayıtlı teklif silindi');
    return updated;
  } catch {
    showToast('⚠️ Silinemedi');
    return savedProposals;
  }
}
