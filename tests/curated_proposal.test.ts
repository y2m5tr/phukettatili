import { describe, it, expect } from 'vitest';
import {
  buildCuratedProposal,
  calculateProposalFinancials,
  generateCuratedProposalWhatsAppMessage,
} from '../src/lib/curatedProposal';

describe('📄 Kişiye Özel Logolu PDF Tur Teklifi & Tatil Programı (Curated Proposal Generator)', () => {
  it('seçilen gün sayısı ve seyahat tarzına göre eksiksiz gün dökümü oluşturmalı', () => {
    const proposal = buildCuratedProposal(
      'Begüm & Canberk Özkan',
      'honeymoon',
      5,
      'The Shore at Katathani',
      'Kata Noi',
      2,
      0
    );

    expect(proposal.customerName).toBe('Begüm & Canberk Özkan');
    expect(proposal.hotelName).toBe('The Shore at Katathani');
    expect(proposal.days.length).toBe(5);
    expect(proposal.proposalNumber).toMatch(/^PT-PROP-\d{4}-\d{4}$/);

    // Her günün alınış saati aralığı ve dahil olanlar bulunmalı
    proposal.days.forEach((day) => {
      expect(day.pickupWindow).toBeDefined();
      expect(day.tourDuration).toBeDefined();
      expect(day.included.length).toBeGreaterThan(0);
      expect(day.priceThb).toBeGreaterThan(0);
    });
  });

  it('finansal hesaplamaları (indirim, kapora, bakiye, TL/USD) doğru yapmalı', () => {
    const proposal = buildCuratedProposal('Ali Yılmaz', 'family', 3, 'Centara Grand', 'Karon', 2, 1);
    proposal.discountPercent = 10;
    proposal.depositPercent = 30;

    const financials = calculateProposalFinancials(proposal, {
      tryRate: 1.0,
      usdRate: 35,
      eurRate: 38,
    });

    expect(financials.subtotalThb).toBeGreaterThan(0);
    expect(financials.discountThb).toBe(Math.round(financials.subtotalThb * 0.1));
    expect(financials.totalThb).toBe(financials.subtotalThb - financials.discountThb);
    expect(financials.depositThb).toBe(Math.round(financials.totalThb * 0.3));
    expect(financials.remainingThb).toBe(financials.totalThb - financials.depositThb);
    expect(financials.totalTry).toBe(financials.totalThb);
    expect(financials.totalUsd).toBe(Math.round(financials.totalThb / 35));
  });

  it('WhatsApp teklif özetini zengin ve kurumsal formatta üretmeli', () => {
    const proposal = buildCuratedProposal('Emre Kaya', 'adventure', 3, 'Beyond Resort', 'Kata', 2, 0);
    const financials = calculateProposalFinancials(proposal);
    const text = generateCuratedProposalWhatsAppMessage(proposal, financials);

    expect(text).toContain('KİŞİYE ÖZEL TATİL & TUR TEKLİFİ');
    expect(text).toContain('Emre Kaya');
    expect(text).toContain('Beyond Resort');
    expect(text).toContain('GÜN GÜN TATİL PROGRAMINIZ:');
    expect(text).toContain('FİYATLANDIRMA & ÖDEME PLANI:');
    expect(text).toContain(`${financials.totalThb.toLocaleString()} THB`);
    expect(text).toContain('TAT License: 34/02819');
  });
});
