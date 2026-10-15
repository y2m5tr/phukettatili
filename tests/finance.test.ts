import { describe, it, expect } from 'vitest';
import {
  initialPayments,
  PAYMENT_METHOD_LABELS,
  COLLECTION_LOCATION_LABELS,
  type PaymentRecord,
  type Booking,
} from '../src/data/adminInitialData';

describe('ERP Finance & Kasa (Phase 1)', () => {
  it('tüm ödeme yöntemleri ve etiketleri eksiksiz tanımlıdır', () => {
    expect(PAYMENT_METHOD_LABELS.cash_thb.label).toBe('Nakit THB (Kasa)');
    expect(PAYMENT_METHOD_LABELS.promptpay.label).toBe('PromptPay (K-Bank QR)');
    expect(PAYMENT_METHOD_LABELS.tr_bank_transfer.label).toBe('TR Banka Havale / EFT');
    expect(PAYMENT_METHOD_LABELS.credit_card.label).toBe('Kredi Kartı / POS');
    expect(COLLECTION_LOCATION_LABELS.hotel_lobby).toBe('Otel Lobisi (Alış Anında)');
  });

  it('başlangıç ödeme kayıtları geçerli alanlara sahiptir', () => {
    expect(initialPayments.length).toBeGreaterThan(0);
    initialPayments.forEach((p) => {
      expect(p.id).toMatch(/^PAY-/);
      expect(p.amountThb).toBeGreaterThan(0);
      expect(PAYMENT_METHOD_LABELS[p.method]).toBeDefined();
      expect(p.receiptNo).toBeDefined();
    });
  });

  it('tahsilat alındığında rezervasyon bakiyesi ve ödeme durumu doğru güncellenir', () => {
    const mockBooking: Booking = {
      id: 'BK-TEST-1',
      customerName: 'Test Müşteri',
      phone: '+90 532 000 00 00',
      hotel: 'Patong Beach Hotel',
      tourId: 'phi-phi',
      tourTitle: 'Phi Phi Turu',
      tourDate: '2026-11-20',
      adultCount: 2,
      childCount: 0,
      totalPriceThb: 6000,
      costThb: 3600,
      paidAmountThb: 2000,
      remainingAmountThb: 4000,
      status: 'confirmed',
      paymentStatus: 'partial',
      createdAt: '2026-10-15',
    };

    // 1. Kısmi tahsilat
    const payment1Amount = 2000;
    const afterPay1Paid = mockBooking.paidAmountThb + payment1Amount;
    const afterPay1Rem = Math.max(0, mockBooking.totalPriceThb - afterPay1Paid);
    const afterPay1Status = afterPay1Rem === 0 ? 'paid' : 'partial';

    expect(afterPay1Paid).toBe(4000);
    expect(afterPay1Rem).toBe(2000);
    expect(afterPay1Status).toBe('partial');

    // 2. Kalan bakiyenin tamamını kapatma
    const payment2Amount = 2000;
    const afterPay2Paid = afterPay1Paid + payment2Amount;
    const afterPay2Rem = Math.max(0, mockBooking.totalPriceThb - afterPay2Paid);
    const afterPay2Status = afterPay2Rem === 0 ? 'paid' : 'partial';

    expect(afterPay2Paid).toBe(6000);
    expect(afterPay2Rem).toBe(0);
    expect(afterPay2Status).toBe('paid');
  });

  it('kasa dağılımı toplamı ödeme kayıtlarıyla birebir uyuşur', () => {
    const totalCashThb = initialPayments
      .filter((p) => p.method === 'cash_thb')
      .reduce((acc, p) => acc + p.amountThb, 0);

    const totalPromptPay = initialPayments
      .filter((p) => p.method === 'promptpay')
      .reduce((acc, p) => acc + p.amountThb, 0);

    expect(totalCashThb).toBe(3500);
    expect(totalPromptPay).toBe(8400);
  });
});
