import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProposalTopToolbar } from '../src/components/admin/proposal/ProposalTopToolbar';
import { ProposalFinancialsTab } from '../src/components/admin/proposal/ProposalFinancialsTab';
import { ProposalPreviewPanel } from '../src/components/admin/proposal/ProposalPreviewPanel';
import { ProposalSingleTourOverviewTab } from '../src/components/admin/proposal/ProposalSingleTourOverviewTab';
import { buildSingleTourProposal, calculateProposalFinancials } from '../src/lib/curatedProposal';

describe('CuratedProposalModal modular subcomponents (500-line refactor)', () => {
  const dummyProposal = buildSingleTourProposal(
    'Ahmet Yılmaz',
    'phi_phi_speed',
    '2026-11-01',
    'The Shore at Katathani',
    'Kata Noi',
    2,
    0
  );
  const financials = calculateProposalFinancials(dummyProposal);

  it('renders ProposalTopToolbar with action buttons and title', () => {
    const html = renderToString(
      React.createElement(ProposalTopToolbar, {
        proposal: dummyProposal,
        financials,
        isSingleTour: true,
        isPreviewMode: false,
        setIsPreviewMode: vi.fn(),
        copied: false,
        savedProposals: [],
        showSavedModal: false,
        setShowSavedModal: vi.fn(),
        showSendModal: false,
        setShowSendModal: vi.fn(),
        sendPhone: '',
        setSendPhone: vi.fn(),
        sendEmail: '',
        setSendEmail: vi.fn(),
        handleSaveProposal: vi.fn(),
        handleLoadSavedProposal: vi.fn(),
        handleDeleteSavedProposal: vi.fn(),
        handlePrint: vi.fn(),
        handleCopyWhatsApp: vi.fn(),
        handleDirectWhatsAppSend: vi.fn(),
        handleEmailSend: vi.fn(),
        handleCreateBooking: vi.fn(),
        onClose: vi.fn(),
      })
    );

    expect(html).toContain('Özel Tur &amp; Paket Teklif Stüdyosu');
    expect(html).toContain('Kayıtlılar');
    expect(html).toContain('Kaydet');
  });

  it('renders ProposalFinancialsTab correctly with price values', () => {
    const html = renderToString(
      React.createElement(ProposalFinancialsTab, {
        proposal: dummyProposal,
        financials,
        setProposal: vi.fn(),
      })
    );

    expect(html).toContain('Teklifte Gösterilecek Ana Para Birimi:');
    expect(html).toContain('Özel Paket İndirimi (%):');
    expect(html).toContain('Rezervasyon Kaporası (%):');
  });

  it('renders ProposalPreviewPanel with action trigger buttons', () => {
    const html = renderToString(
      React.createElement(ProposalPreviewPanel, {
        proposal: dummyProposal,
        financials,
        isSingleTour: true,
        singleDay: dummyProposal.days[0],
        proposalHotels: [],
        isPreviewMode: true,
        setIsPreviewMode: vi.fn(),
        setShowSendModal: vi.fn(),
        setSendPhone: vi.fn(),
        setSendEmail: vi.fn(),
        handleOpenInNewTab: vi.fn(),
        handlePrint: vi.fn(),
      })
    );

    expect(html).toContain('Phi Phi');
    expect(html).toContain('Tam Sayfa A4 Belge Önizleme');
    expect(html).toContain('Yeni Sekmede Aç');
  });

  it('renders ProposalSingleTourOverviewTab with guest info inputs', () => {
    const html = renderToString(
      React.createElement(ProposalSingleTourOverviewTab, {
        proposal: dummyProposal,
        setProposal: vi.fn(),
        singleDay: dummyProposal.days[0],
        handleApplySingleTourPreset: vi.fn(),
        handleUpdateSingleDay: vi.fn(),
        setSendPhone: vi.fn(),
        setSendEmail: vi.fn(),
      })
    );

    expect(html).toContain('Ahmet Yılmaz');
    expect(html).toContain('Misafir Adı / Hitap:');
  });
});
