import { describe, it, expect } from 'vitest';
import {
  INITIAL_LOST_FOUND_ITEMS,
  generateGuestFoundWhatsApp,
  generateDriverInquiryWhatsApp,
  generateHotelDeliveryWhatsApp,
  getLostFoundWhatsAppUrl,
  filterLostFoundItems,
  type LostFoundItem,
} from '../src/lib/lostAndFound';

describe('Lost & Found Hub Protocol', () => {
  it('should have initial mock items with valid fields', () => {
    expect(INITIAL_LOST_FOUND_ITEMS.length).toBeGreaterThan(0);
    const item = INITIAL_LOST_FOUND_ITEMS[0];
    expect(item.id).toMatch(/^LF-/);
    expect(item.title).toBeDefined();
    expect(item.vehicleOrTour).toBeDefined();
    expect(item.status).toBeDefined();
  });

  it('should generate informative guest found WhatsApp message', () => {
    const item = INITIAL_LOST_FOUND_ITEMS[0];
    const msg = generateGuestFoundWhatsApp(item);

    expect(msg).toContain('Müjdemiz var');
    expect(msg).toContain(item.title);
    expect(msg).toContain(item.vehicleOrTour);
    expect(msg).toContain(item.hotelName as string);

    const url = getLostFoundWhatsAppUrl(item.guestPhone, msg);
    expect(url).toContain('https://wa.me/905321112233?text=');
  });

  it('should generate bilingual Thai and English driver inquiry message', () => {
    const msg = generateDriverInquiryWhatsApp({
      driverName: 'Somchai',
      vehicleOrTour: 'Van 35-1249',
      missingItemDesc: 'Black wallet with Turkish ID',
      guestName: 'Kemal Sunal',
      hotelName: 'Hilton Phuket Arcadia',
    });

    expect(msg).toContain('Sawadee khrup Khun Somchai');
    expect(msg).toContain('ภาษาไทย:');
    expect(msg).toContain('Kemal Sunal');
    expect(msg).toContain('Black wallet with Turkish ID');
    expect(msg).toContain('English:');
  });

  it('should generate hotel delivery confirmation message', () => {
    const item = INITIAL_LOST_FOUND_ITEMS[2]; // returned_to_guest
    const msg = generateHotelDeliveryWhatsApp(item);

    expect(msg).toContain(item.hotelName as string);
    expect(msg).toContain(item.title);
    expect(msg).toContain('ön büro resepsiyonuna güvenle teslim edilmiştir');
  });

  it('should correctly filter items by status and query', () => {
    const items: LostFoundItem[] = INITIAL_LOST_FOUND_ITEMS;
    
    // Status filter
    const driverOnly = filterLostFoundItems(items, 'found_with_driver');
    expect(driverOnly.every((i) => i.status === 'found_with_driver')).toBe(true);

    // Search query
    const goproSearch = filterLostFoundItems(items, 'all', 'gopro');
    expect(goproSearch.length).toBe(1);
    expect(goproSearch[0].id).toBe('LF-2402');
  });
});
