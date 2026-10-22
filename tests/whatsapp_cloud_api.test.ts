import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import crypto from 'node:crypto';
import {
  sendWhatsAppTextMessage,
  sendBookingInquiryConfirmation,
  sendT24PickupReminder,
  sendDriverDispatchNotice,
  validateMetaSignature,
} from '../src/lib/server/whatsappCloudApi';
import type { Booking } from '../src/data/adminInitialData';

describe('WhatsApp Cloud API Service', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.WHATSAPP_CLOUD_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
    delete process.env.WHATSAPP_APP_SECRET;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const sampleBooking: Booking = {
    id: 'BK-WA-1',
    customerName: 'Burak & Deniz',
    phone: '+905321234567',
    hotel: 'Katathani Resort',
    roomNumber: '210',
    tourTitle: 'Similan Adaları Sürat Teknesi',
    tourDate: '2026-11-20',
    pickupTime: '06:00',
    adultCount: 2,
    childCount: 0,
    totalPriceThb: 7600,
    paidAmountThb: 7600,
    remainingAmountThb: 0,
    status: 'confirmed',
    paymentStatus: 'paid',
  };

  it('rejects invalid or too short phone numbers gracefully', async () => {
    const res = await sendWhatsAppTextMessage('123', 'Merhaba');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Geçersiz alıcı telefon');
  });

  it('operates in simulation mode and returns simulated messageId when credentials are missing', async () => {
    const res = await sendWhatsAppTextMessage('+905321234567', 'Test mesajı');
    expect(res.success).toBe(true);
    expect(res.simulated).toBe(true);
    expect(res.messageId).toMatch(/^sim_/);
  });

  it('sends booking inquiry confirmation with ticket url in message', async () => {
    const res = await sendBookingInquiryConfirmation(sampleBooking);
    expect(res.success).toBe(true);
    expect(res.simulated).toBe(true);
  });

  it('sends T-24 pickup reminder for tomorrow tour', async () => {
    const res = await sendT24PickupReminder(sampleBooking);
    expect(res.success).toBe(true);
  });

  it('sends driver dispatch job notice to driver phone', async () => {
    const res = await sendDriverDispatchNotice(sampleBooking, '+66812345678');
    expect(res.success).toBe(true);
  });

  it('calls real Meta API endpoint when credentials are provided', async () => {
    process.env.WHATSAPP_CLOUD_TOKEN = 'test_token_123';
    process.env.WHATSAPP_PHONE_NUMBER_ID = '1234567890';

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: 'wamid.HBgLM' }] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await sendWhatsAppTextMessage('+905321234567', 'Canlı Meta API testi');
    expect(res.success).toBe(true);
    expect(res.simulated).toBe(false);
    expect(res.messageId).toBe('wamid.HBgLM');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  describe('validateMetaSignature', () => {
    it('returns true when appSecret is empty in development', () => {
      expect(validateMetaSignature('{}', 'sha256=xxx', '')).toBe(true);
    });

    it('validates correct HMAC-SHA256 signature', () => {
      const secret = 'my_super_secret_app_key';
      const body = JSON.stringify({ object: 'whatsapp_business_account' });
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(body, 'utf8');
      const signature = `sha256=${hmac.digest('hex')}`;

      expect(validateMetaSignature(body, signature, secret)).toBe(true);
    });

    it('rejects tampered body or invalid signature', () => {
      const secret = 'my_super_secret_app_key';
      const body = JSON.stringify({ object: 'whatsapp_business_account' });
      const signature = 'sha256=invalid_hex_string_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

      expect(validateMetaSignature(body, signature, secret)).toBe(false);
    });
  });
});
