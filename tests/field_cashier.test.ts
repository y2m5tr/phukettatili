import { describe, it, expect } from 'vitest';
import {
  calculateCashChange,
  generateCashPaymentSlipWhatsApp,
  getCashPaymentSlipWhatsAppUrl,
} from '../src/lib/exchangeRates';

describe('Multi-Currency Field Cashier & Change Engine', () => {
  it('should accurately calculate change when paying in USD', () => {
    // Due 3,200 THB, guest pays 100 USD with rate 36.5 THB
    // 100 * 36.5 = 3,650 THB => Change: 450 THB
    const result = calculateCashChange({
      dueThb: 3200,
      paidCurrency: 'USD',
      paidAmount: 100,
      customRate: 36.5,
    });

    expect(result.paidInThb).toBe(3650);
    expect(result.changeDueThb).toBe(450);
    expect(result.remainingDebtThb).toBe(0);
    expect(result.isExact).toBe(false);
    expect(result.isUnderpaid).toBe(false);

    // Breakdown for 450 THB: 4x 100฿, 1x 50฿
    expect(result.changeBreakdown.bill100).toBe(4);
    expect(result.changeBreakdown.bill50).toBe(1);
    expect(result.changeBreakdown.bill20).toBe(0);
  });

  it('should accurately calculate exact payment in THB', () => {
    const result = calculateCashChange({
      dueThb: 1500,
      paidCurrency: 'THB',
      paidAmount: 1500,
    });

    expect(result.changeDueThb).toBe(0);
    expect(result.remainingDebtThb).toBe(0);
    expect(result.isExact).toBe(true);
    expect(result.isUnderpaid).toBe(false);
  });

  it('should detect underpayment and report remaining debt in THB', () => {
    // Due 3,000 THB, guest pays 50 EUR at rate 40 THB
    // 50 * 40 = 2,000 THB => Remaining debt: 1,000 THB
    const result = calculateCashChange({
      dueThb: 3000,
      paidCurrency: 'EUR',
      paidAmount: 50,
      customRate: 40.0,
    });

    expect(result.paidInThb).toBe(2000);
    expect(result.changeDueThb).toBe(0);
    expect(result.remainingDebtThb).toBe(1000);
    expect(result.isUnderpaid).toBe(true);
  });

  it('should generate professional WhatsApp receipt text and valid URL', () => {
    const slip = generateCashPaymentSlipWhatsApp({
      guestName: 'Murat Bey',
      serviceTitle: 'VIP Havalimanı Karşılama & Transfer',
      dueThb: 1800,
      paidCurrency: 'USD',
      paidAmount: 60,
      effectiveRate: 36.5,
      changeDueThb: 390,
      remainingDebtThb: 0,
      collectorName: 'Somchai (VIP Van 35-1249)',
      hotelOrLocation: 'Patong Beach',
    });

    expect(slip).toContain('SAHA NAKİT TAHSİLAT MAKBUZU');
    expect(slip).toContain('Murat Bey');
    expect(slip).toContain('1,800 THB');
    expect(slip).toContain('60 USD');
    expect(slip).toContain('36.5 THB');
    expect(slip).toContain('390 THB');

    const url = getCashPaymentSlipWhatsAppUrl('+905551234567', slip);
    expect(url).toContain('https://wa.me/905551234567?text=');
  });
});
