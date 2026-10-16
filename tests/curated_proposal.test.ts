import { describe, it, expect } from 'vitest';
import {
  buildCuratedProposal,
  buildSingleTourProposal,
  calculateProposalFinancials,
  generateCuratedProposalWhatsAppMessage,
  PROPOSAL_CATALOG_TOURS,
  TRANSPORT_META,
  MEAL_PLAN_META,
  NATIONAL_PARK_META,
  type CuratedProposalDay,
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
    expect(proposal.agentInfo.name).toBe('Murat Gençer');
    expect(proposal.welcomeMessage).toContain('Begüm & Canberk Özkan');

    // Her günün alınış saati aralığı, transport ve dahil olanları bulunmalı
    proposal.days.forEach((day) => {
      expect(day.pickupWindow).toBeDefined();
      expect(day.tourDuration).toBeDefined();
      expect(day.transportType).toBeDefined();
      expect(day.mealPlan).toBeDefined();
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
      gbpRate: 45,
    });

    expect(financials.subtotalThb).toBeGreaterThan(0);
    expect(financials.discountThb).toBe(Math.round(financials.subtotalThb * 0.1));
    expect(financials.totalThb).toBe(financials.subtotalThb - financials.discountThb);
    expect(financials.depositThb).toBe(Math.round(financials.totalThb * 0.3));
    expect(financials.remainingThb).toBe(financials.totalThb - financials.depositThb);
    expect(financials.totalTry).toBe(financials.totalThb);
    expect(financials.totalUsd).toBe(Math.round(financials.totalThb / 35));
    expect(financials.totalEur).toBe(Math.round(financials.totalThb / 38));
    expect(financials.totalGbp).toBe(Math.round(financials.totalThb / 45));
    expect(financials.perPersonThb).toBeGreaterThan(0);
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
    expect(text).toContain('Murat Gençer');
  });

  it('zengin katalog turları ve ulaşım/yemek metadataları eksiksiz olmalı', () => {
    expect(PROPOSAL_CATALOG_TOURS.length).toBeGreaterThanOrEqual(10);
    const phiPhi = PROPOSAL_CATALOG_TOURS.find((t) => t.id === 'phi_phi_speed');
    expect(phiPhi).toBeDefined();
    expect(phiPhi?.transportType).toBe('speedboat');
    expect(phiPhi?.pickupWindow).toBe('07:15 - 07:30');

    expect(TRANSPORT_META.catamaran.label).toContain('Katamaran');
    expect(MEAL_PLAN_META.buffet_lunch.label).toContain('Açık Büfe');
    expect(NATIONAL_PARK_META.included.label).toContain('Milli Park Dahil');
  });

  it('teklife yeni gün ekleme, düzenleme ve silme işlemlerini desteklemeli', () => {
    const proposal = buildCuratedProposal('Zeynep Demir', 'honeymoon', 3);
    const initialCount = proposal.days.length;

    // Yeni gün ekleme
    const newDay: CuratedProposalDay = {
      id: 'DAY-EXTRA-1',
      dayNumber: initialCount + 1,
      dayTitle: 'Ekstra Özel Katamaran Turu',
      tourTitle: 'Coral & Racha Katamaran',
      pickupWindow: '10:30 - 11:00',
      tourDuration: '12:00 - 19:30',
      category: 'island',
      transportType: 'catamaran',
      mealPlan: 'buffet_lunch',
      nationalParkFeeStatus: 'included',
      highlight: 'Özel günbatımı yelkeni',
      included: ['Yelkenli', 'Yemek'],
      image: '/assets/vip_transfer.webp',
      priceThb: 8000,
    };

    proposal.days.push(newDay);
    expect(proposal.days.length).toBe(initialCount + 1);

    const financials = calculateProposalFinancials(proposal);
    expect(financials.subtotalThb).toBeGreaterThan(0);

    // Günü silme
    proposal.days = proposal.days.filter((d) => d.id !== 'DAY-EXTRA-1');
    expect(proposal.days.length).toBe(initialCount);
  });

  it('birden fazla otelde konaklama durumunu ve gün bazında farklı otel alınışlarını desteklemeli', () => {
    const proposal = buildCuratedProposal('Kemal & Ayşe Sunal', 'honeymoon', 5, 'Amari Phuket', 'Patong & Kalim');
    expect(proposal.hotels).toBeDefined();
    expect(proposal.hotels?.length).toBe(1);

    // 2. otel ekle (Laguna etabı)
    proposal.hotels?.push({
      id: 'hotel-2',
      hotelName: 'SAii Laguna Phuket',
      hotelZone: 'Bang Tao & Surin',
      checkInDate: '2026-11-23',
      checkOutDate: '2026-11-26',
      notes: 'Laguna etabı (3 Gece)',
    });
    expect(proposal.hotels?.length).toBe(2);

    // 2. turun alınışını 2. otelden ayarla
    if (proposal.days[1]) {
      proposal.days[1].hotelName = 'SAii Laguna Phuket';
      proposal.days[1].hotelZone = 'Bang Tao & Surin';
    }

    const financials = calculateProposalFinancials(proposal);
    const wa = generateCuratedProposalWhatsAppMessage(proposal, financials);

    // WhatsApp çıktısında 2 otelin de listelendiğini doğrula
    expect(wa).toContain('Konaklama Otelleri (2 Farklı Otel)');
    expect(wa).toContain('Amari Phuket');
    expect(wa).toContain('SAii Laguna Phuket');
    expect(wa).toContain('Alınış Oteli: *SAii Laguna Phuket*');
  });

  it('tekli tur ve tekli paket teklifi (single_tour) oluşturma ve saatlik akış dökümünü doğru yapmalı', () => {
    const singleProposal = buildSingleTourProposal(
      'Mert & Selin Çetin',
      'phi_phi_speed',
      '2026-11-15',
      'Katathani Phuket Beach Resort',
      'Kata Noi',
      2,
      1
    );

    expect(singleProposal.proposalType).toBe('single_tour');
    expect(singleProposal.singleTourDate).toBe('2026-11-15');
    expect(singleProposal.customerName).toBe('Mert & Selin Çetin');
    expect(singleProposal.hotelName).toBe('Katathani Phuket Beach Resort');
    expect(singleProposal.days.length).toBe(1);
    expect(singleProposal.proposalNumber).toMatch(/^PT-TOUR-\d{4}-\d{4}$/);

    // Saatlik tur akış adımları (Timeline)
    expect(singleProposal.singleTourTimeline).toBeDefined();
    expect(singleProposal.singleTourTimeline?.length).toBeGreaterThanOrEqual(4);
    expect(singleProposal.singleTourTimeline?.[0].time).toBe('07:15 - 07:30');
    expect(singleProposal.singleTourTimeline?.[0].title).toContain('Otel Lobisinden Alınış');

    // Tavsiyeler (Tips)
    expect(singleProposal.singleTourTips?.length).toBeGreaterThan(0);

    // Finansal özet
    const financials = calculateProposalFinancials(singleProposal);
    expect(financials.subtotalThb).toBeGreaterThan(0);
    expect(financials.totalThb).toBe(financials.subtotalThb);
    expect(financials.depositThb).toBe(Math.round(financials.totalThb * 0.3));

    // WhatsApp tekli tur formatı
    const wa = generateCuratedProposalWhatsAppMessage(singleProposal, financials);
    expect(wa).toContain('KİŞİYE ÖZEL TEK TUR TEKLİFİ');
    expect(wa).toContain('Mert & Selin Çetin');
    expect(wa).toContain('2026-11-15');
    expect(wa).toContain('ÖNGÖRÜLEN TUR AKIŞI & SAATLER:');
    expect(wa).toContain('Otel Lobisinden Alınış');
    expect(wa).toContain('Yanınızda Getirmeniz Önerilenler:');
    expect(wa).toContain('Katathani Phuket Beach Resort');
  });
});

