import { describe, it, expect } from 'vitest';
import {
  generatePromptPayPayload,
  formatPromptPayTarget,
  crc16,
  getPromptPayQrImageUrl,
} from '../src/lib/promptpay';

describe('PromptPay Dynamic QR Engine', () => {
  it('formats Thai mobile numbers correctly to 0066 standard', () => {
    expect(formatPromptPayTarget('0828950665')).toEqual({
      type: 'mobile',
      formatted: '0066828950665',
    });

    expect(formatPromptPayTarget('+66 82 895 0665')).toEqual({
      type: 'mobile',
      formatted: '0066828950665',
    });

    expect(formatPromptPayTarget('66828950665')).toEqual({
      type: 'mobile',
      formatted: '0066828950665',
    });
  });

  it('formats 13-digit national ID / tax ID', () => {
    expect(formatPromptPayTarget('0105558123456')).toEqual({
      type: 'tax_id',
      formatted: '0105558123456',
    });
  });

  it('calculates correct CRC16 checksum', () => {
    // Standard test vector for CRC16-CCITT
    const crc = crc16('123456789');
    expect(crc).toBe('29B1');
  });

  it('generates standard static PromptPay payload (no amount)', () => {
    const payload = generatePromptPayPayload({
      target: '0828950665',
    });

    expect(payload.startsWith('000201')).toBe(true);
    expect(payload).toContain('010211'); // Static QR
    expect(payload).toContain('0016A000000677010111'); // PromptPay AID
    expect(payload).toContain('01130066828950665'); // Mobile
    expect(payload).toContain('5303764'); // Currency THB
    expect(payload).toContain('5802TH'); // Country TH
    expect(payload).toContain('6304'); // Checksum tag
    expect(payload.length).toBeGreaterThan(60);
  });

  it('generates dynamic PromptPay payload with exact THB amount', () => {
    const payload = generatePromptPayPayload({
      target: '0828950665',
      amountThb: 3200,
    });

    expect(payload.startsWith('000201')).toBe(true);
    expect(payload).toContain('010212'); // Dynamic QR
    expect(payload).toContain('54073200.00'); // Amount 3200.00 with tag 54
    expect(payload).toContain('5303764');
  });

  it('produces valid QR image URL', () => {
    const payload = generatePromptPayPayload({
      target: '0828950665',
      amountThb: 1500,
    });
    const url = getPromptPayQrImageUrl(payload, 250);
    expect(url).toContain('api.qrserver.com');
    expect(url).toContain('250x250');
  });
});
