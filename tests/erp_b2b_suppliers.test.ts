import { describe, it, expect } from 'vitest';
import {
  initialAgents,
  initialSuppliers,
  initialTourCosts,
  calculateAgentCommission,
  lookupTourCost,
  type PartnerAgent,
  type Booking,
} from '../src/data/adminInitialData';

describe('Tourism ERP Faz 2: B2B Partner / Alt Acenta & Komisyon Motoru', () => {
  it('başlangıç acenta listesi geçerli alanlara ve benzersiz kimliklere sahiptir', () => {
    expect(initialAgents.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    initialAgents.forEach((agent) => {
      expect(agent.id).toMatch(/^agent-/);
      expect(ids.has(agent.id)).toBe(false);
      ids.add(agent.id);
      expect(agent.name.length).toBeGreaterThan(0);
      expect(agent.contactPerson.length).toBeGreaterThan(0);
      expect(agent.phone.length).toBeGreaterThan(0);
      expect(['percentage', 'fixed_per_pax']).toContain(agent.commissionType);
      expect(agent.commissionRate).toBeGreaterThanOrEqual(0);
      expect(typeof agent.active).toBe('boolean');
    });
  });

  it('yüzdesel komisyon hesaplaması doğru çalışır (%10 ve %15)', () => {
    const percentAgent: PartnerAgent = {
      id: 'agent-test-1',
      name: 'Test Istanbul Travel',
      code: 'TST-IST',
      contactPerson: 'Ali Yılmaz',
      phone: '+90 532 111 22 33',
      cityOrZone: 'İstanbul',
      commissionType: 'percentage',
      commissionRate: 10, // %10
      totalPaidCommissionThb: 0,
      active: true,
      createdAt: '2026-10-15',
    };

    // 10.000 THB satış tutarında %10 = 1.000 THB
    const comm1 = calculateAgentCommission(percentAgent, 10000, 2, 0);
    expect(comm1).toBe(1000);

    // 25.500 THB satış tutarında %10 = 2.550 THB
    const comm2 = calculateAgentCommission(percentAgent, 25500, 4, 1);
    expect(comm2).toBe(2550);

    // Yüzde 15 komisyon testi
    const percent15Agent: PartnerAgent = { ...percentAgent, commissionRate: 15 };
    const comm3 = calculateAgentCommission(percent15Agent, 20000, 2, 2);
    expect(comm3).toBe(3000);
  });

  it('kişi başı sabit (fixed_per_pax) komisyon hesaplaması yetişkin ve çocuk toplamına göre doğru çalışır', () => {
    const fixedAgent: PartnerAgent = {
      id: 'agent-test-2',
      name: 'Test Antalya VIP',
      code: 'TST-AYT',
      contactPerson: 'Mehmet Demir',
      phone: '+90 542 333 44 55',
      cityOrZone: 'Antalya',
      commissionType: 'fixed_per_pax',
      commissionRate: 200, // 200 THB / Pax (çocuklar %50 = 100 THB)
      totalPaidCommissionThb: 0,
      active: true,
      createdAt: '2026-10-15',
    };

    // 2 yetişkin (2x200) + 1 çocuk (1x100) = 500 THB
    const comm1 = calculateAgentCommission(fixedAgent, 9000, 2, 1);
    expect(comm1).toBe(500);

    // 4 yetişkin + 0 çocuk = 4 pax * 200 THB = 800 THB
    const comm2 = calculateAgentCommission(fixedAgent, 16000, 4, 0);
    expect(comm2).toBe(800);
  });

  it('0 veya geçersiz değerlerde komisyon 0 döner', () => {
    const percentAgent: PartnerAgent = {
      id: 'agent-test-3',
      name: 'Test Zero',
      code: 'TST-0',
      contactPerson: 'Ahmet',
      phone: '000',
      commissionType: 'percentage',
      commissionRate: 10,
      totalPaidCommissionThb: 0,
      active: true,
      createdAt: '2026-10-15',
    };

    expect(calculateAgentCommission(percentAgent, 0, 2, 0)).toBe(0);
    expect(calculateAgentCommission(percentAgent, -500, 2, 0)).toBe(0);
  });

  it('rezervasyon B2B alanları (agentId, agentCommissionThb, agentCommissionStatus) entegrasyonu', () => {
    const b2bBooking: Booking = {
      id: 'BK-B2B-101',
      customerName: 'Acenta Misafiri',
      phone: '+90 533 123 45 67',
      hotel: 'Hilton Phuket Arcadia',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi Turu',
      tourDate: '2026-11-25',
      adultCount: 2,
      childCount: 1,
      totalPriceThb: 10500,
      costThb: 5400,
      agentId: 'agent-ist-travel',
      agentName: 'İstanbul Tour Partner',
      agentCommissionThb: 1050,
      agentCommissionStatus: 'pending',
      paidAmountThb: 3000,
      remainingAmountThb: 7500,
      status: 'confirmed',
      paymentStatus: 'partial',
      createdAt: '2026-10-15',
    };

    expect(b2bBooking.agentId).toBe('agent-ist-travel');
    expect(b2bBooking.agentCommissionThb).toBe(1050);
    expect(b2bBooking.agentCommissionStatus).toBe('pending');

    // Net acenta kârı = Toplam Satış - Tedarikçi Maliyeti - Acenta Komisyonu
    const netProfitThb = b2bBooking.totalPriceThb - (b2bBooking.costThb || 0) - (b2bBooking.agentCommissionThb || 0);
    expect(netProfitThb).toBe(10500 - 5400 - 1050); // 4050 THB
  });
});

describe('Tourism ERP Faz 3: Tedarikçi & Net Maliyet Matrisi Kataloğu', () => {
  it('başlangıç tedarikçi listesi eksiksiz ve geçerli kategorilere sahiptir', () => {
    expect(initialSuppliers.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    initialSuppliers.forEach((s) => {
      expect(s.id).toMatch(/^sup-/);
      expect(ids.has(s.id)).toBe(false);
      ids.add(s.id);
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.phone.length).toBeGreaterThan(0);
      expect(['speedboat', 'catamaran', 'yacht', 'adventure', 'show', 'safari', 'transfer', 'other']).toContain(s.category);
      expect(s.pierOrLocation.length).toBeGreaterThan(0);
      expect(s.rating).toBeGreaterThanOrEqual(1);
      expect(s.rating).toBeLessThanOrEqual(5);
    });
  });

  it('başlangıç tur maliyet matrisi doğru fiyatlar içerir', () => {
    expect(initialTourCosts.length).toBeGreaterThan(0);
    initialTourCosts.forEach((tc) => {
      expect(tc.id).toMatch(/^cost-/);
      expect(tc.tourTitle.length).toBeGreaterThan(0);
      expect(tc.supplierName.length).toBeGreaterThan(0);
      expect(tc.netCostAdultThb).toBeGreaterThan(0);
      expect(tc.netCostChildThb).toBeGreaterThanOrEqual(0);
    });
  });

  it('lookupTourCost fonksiyonu tur adı ve tedarikçi ile tam eşleşme bulur', () => {
    const cost = lookupTourCost(
      initialTourCosts,
      'Phi Phi, Maya Bay ve Bamboo Adası',
      'Andaman Wave Master'
    );
    expect(cost).toBeDefined();
    expect(cost?.netCostAdultThb).toBe(1900);
    expect(cost?.netCostChildThb).toBe(1300);
  });

  it('lookupTourCost fonksiyonu büyük/küçük harf veya kısmi tur adı eşleşmesini yakalar', () => {
    // Küçük harf veya kısaltma: 'phi phi' ve 'Andaman Wave Master'
    const cost = lookupTourCost(
      initialTourCosts,
      'phi phi',
      'Andaman Wave Master'
    );
    expect(cost).toBeDefined();
    expect(cost?.netCostAdultThb).toBe(1900);
  });

  it('lookupTourCost eşleşmeyen kayıtlarda undefined döner', () => {
    const cost = lookupTourCost(
      initialTourCosts,
      'Bilinmeyen Mars Turu',
      'Olmayan Tedarikçi'
    );
    expect(cost).toBeUndefined();
  });

  it('matristen gelen net maliyetlerle rezervasyon toplam maliyet ve kâr hesabı', () => {
    const matchedCost = lookupTourCost(
      initialTourCosts,
      'James Bond Adası ve Kano Turu',
      'Phang Nga Discovery'
    );
    expect(matchedCost).toBeDefined();

    const adults = 3;
    const children = 1;
    const totalCost = (matchedCost!.netCostAdultThb * adults) + (matchedCost!.netCostChildThb * children);
    // (1700 * 3) + (1200 * 1) = 5100 + 1200 = 6300 THB
    expect(totalCost).toBe(6300);

    const salePrice = 3000 * adults + 2200 * children; // 9000 + 2200 = 11200 THB
    const netProfit = salePrice - totalCost;
    expect(netProfit).toBe(11200 - 6300); // 4900 THB
    const margin = Math.round((netProfit / salePrice) * 100);
    expect(margin).toBe(44); // %44 kâr marjı
  });
});
