import { describe, it, expect } from 'vitest';
import {
  initialAgents,
  calculateAgentCommission,
  detectHotelZone,
  getRecommendedPickupTime,
  type PartnerAgent,
} from '../src/data/adminInitialData';

describe('B2B Agent Portal & Commission Engine', () => {
  it('should find initial agents by code case-insensitively', () => {
    const codeQuery = '  ist-trv  ';
    const normalized = codeQuery.trim().toUpperCase();
    const agent = initialAgents.find((a) => a.code.toUpperCase() === normalized);

    expect(agent).toBeDefined();
    expect(agent?.name).toBe('İstanbul Tour Partner');
    expect(agent?.commissionType).toBe('percentage');
    expect(agent?.commissionRate).toBe(15);
  });

  it('should calculate percentage commission correctly for IST-TRV', () => {
    const agent = initialAgents.find((a) => a.code === 'IST-TRV')!;
    const totalAmount = 10000;
    const commission = calculateAgentCommission(agent, totalAmount, 2, 0);

    // %15 of 10000 = 1500 THB
    expect(commission).toBe(1500);
  });

  it('should calculate fixed per pax commission correctly for ALI-PAT', () => {
    const agent = initialAgents.find((a) => a.code === 'ALI-PAT')!;
    const totalAmount = 9000;
    // 3 adults + 1 child (0.5 pax) = 3.5 pax * 300 = 1050 THB
    const commission = calculateAgentCommission(agent, totalAmount, 3, 1);

    expect(commission).toBe(1050);
  });

  it('should calculate 0 commission for Direct Web', () => {
    const agent = initialAgents.find((a) => a.code === 'DIR-WEB')!;
    const totalAmount = 15000;
    const commission = calculateAgentCommission(agent, totalAmount, 4, 2);

    expect(commission).toBe(0);
  });

  it('should auto-detect hotel zone and pickup time for B2B booking flow', () => {
    const detectedPatong = detectHotelZone('Amari Phuket Patong Beach');
    expect(detectedPatong).toBe('Patong & Kalim');

    const detectedKata = detectHotelZone('The Shore at Katathani');
    expect(detectedKata).toBe('Kata & Karon');

    const pickupTime = getRecommendedPickupTime(detectedPatong);
    expect(pickupTime).toBe('07:15');
  });

  it('should respect custom commission object if dynamically set', () => {
    const customAgent: PartnerAgent = {
      id: 'agent-custom',
      name: 'Custom VIP Concierge',
      code: 'VIP-CON',
      contactPerson: 'Serkan Bey',
      phone: '+66 81 234 5678',
      commissionType: 'percentage',
      commissionRate: 20,
      totalPaidCommissionThb: 0,
      active: true,
      createdAt: '2026-10-01',
    };

    const comm = calculateAgentCommission(customAgent, 20000, 2, 0);
    expect(comm).toBe(4000);
  });
});
