import { describe, it, expect } from 'vitest';
import {
  generateLuggageTagNumber,
  generateLuggageCollectedWhatsApp,
  generateLuggageDeliveredWhatsApp,
  getLuggageWhatsAppUrl,
  INITIAL_LUGGAGE_RECORDS,
  LUGGAGE_STATUS_LABELS,
} from '../src/lib/luggageExpress';

describe('Oteller Arası Bagaj Transfer Masası (Luggage Express)', () => {
  it('generates luggage tag number with expected prefix', () => {
    const tag = generateLuggageTagNumber('123');
    expect(tag).toContain('PKT-LUG-');
  });

  it('generates collected WhatsApp message with hotel and bag counts', () => {
    const record = INITIAL_LUGGAGE_RECORDS[0];
    const msg = generateLuggageCollectedWhatsApp(record);
    expect(msg).toContain('Murat Yılmaz');
    expect(msg).toContain('Amari Phuket');
    expect(msg).toContain('The Shore at Katathani');
    expect(msg).toContain(record.tagNumber);
    expect(msg).toContain('3 parça');
  });

  it('generates delivered WhatsApp message with delivery hotel and instructions', () => {
    const record = INITIAL_LUGGAGE_RECORDS[1];
    const msg = generateLuggageDeliveredWhatsApp(record);
    expect(msg).toContain('Zeynep Kaya');
    expect(msg).toContain('Sri Panwa Phuket');
    expect(msg).toContain(record.tagNumber);
    expect(msg).toContain('Check-in');
  });

  it('generates valid WhatsApp URLs for collected and delivered states', () => {
    const record = INITIAL_LUGGAGE_RECORDS[0];
    const urlCollected = getLuggageWhatsAppUrl(record, 'collected');
    const urlDelivered = getLuggageWhatsAppUrl(record, 'delivered');

    expect(urlCollected).toContain('https://wa.me/905321234567?text=');
    expect(urlDelivered).toContain('https://wa.me/905321234567?text=');
  });

  it('has valid labels and colors for all 5 luggage statuses', () => {
    expect(LUGGAGE_STATUS_LABELS.pending).toBeDefined();
    expect(LUGGAGE_STATUS_LABELS.collected_from_hotel).toBeDefined();
    expect(LUGGAGE_STATUS_LABELS.in_transit).toBeDefined();
    expect(LUGGAGE_STATUS_LABELS.delivered_to_hotel).toBeDefined();
    expect(LUGGAGE_STATUS_LABELS.cancelled).toBeDefined();
  });
});
