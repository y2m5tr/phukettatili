import { describe, it, expect } from 'vitest';
import {
  generateSupplierOrderMessage,
  getSupplierOrderWhatsAppUrl,
  cleanSupplierPhone,
} from '../src/lib/supplierDispatch';
import type { Booking, SupplierItem } from '../src/data/adminInitialData';

describe('Supplier Auto-Dispatch Engine', () => {
  const mockBooking: Booking = {
    id: 'BK-5501',
    ticketCode: 'PT-998811',
    customerName: 'Ahmet Yılmaz',
    phone: '+90 532 111 2233',
    hotel: 'Katathani Phuket Beach Resort',
    roomNumber: '412',
    tourTitle: 'Phi Phi, Maya Bay ve Bamboo Adası',
    tourDate: '2026-11-20',
    pickupTime: '07:15',
    adultCount: 2,
    childCount: 1,
    totalPriceThb: 9600,
    paidAmountThb: 3000,
    remainingAmountThb: 6600,
    status: 'confirmed',
    paymentStatus: 'partial',
    nationalParkFeeIncluded: true,
    specialNotes: 'Vejetaryen yemek talebi',
    passengers: [
      {
        fullName: 'Ahmet Yılmaz',
        passportNo: 'U11223344',
        nationality: 'TUR',
        dietaryPreference: 'vegetarian',
      },
      {
        fullName: 'Zeynep Yılmaz',
        passportNo: 'U55667788',
        nationality: 'TUR',
        dietaryPreference: 'standard',
      },
      {
        fullName: 'Efe Yılmaz',
        nationality: 'TUR',
      },
    ],
  };

  const mockSupplier: SupplierItem = {
    id: 'sup-andaman-wave',
    name: 'Andaman Wave Master',
    category: 'speedboat',
    phone: '+66 76 281 234',
    pierOrLocation: 'Rassada Pier',
    paymentTerms: 'weekly_friday',
    active: true,
  };

  it('cleans Thai supplier phone numbers correctly', () => {
    expect(cleanSupplierPhone('+66 76 281 234')).toBe('6676281234');
    expect(cleanSupplierPhone('082 895 0665')).toBe('66828950665');
  });

  it('generates English supplier booking order message with full manifest', () => {
    const msg = generateSupplierOrderMessage({
      booking: mockBooking,
      supplier: mockSupplier,
      language: 'en',
    });

    expect(msg).toContain('Andaman Wave Master');
    expect(msg).toContain('PT-998811');
    expect(msg).toContain('Phi Phi, Maya Bay ve Bamboo Adası');
    expect(msg).toContain('2026-11-20');
    expect(msg).toContain('*Katathani Phuket Beach Resort* (Room: 412)');
    expect(msg).toContain('3 Pax');
    expect(msg).toContain('Ahmet Yılmaz (Pass: U11223344) [TUR] - Diet: vegetarian');
    expect(msg).toContain('Included in agency invoice');
    expect(msg).toContain('Vejetaryen yemek talebi');
  });

  it('generates Thai supplier booking order message', () => {
    const msg = generateSupplierOrderMessage({
      booking: mockBooking,
      supplier: mockSupplier,
      language: 'th',
    });

    expect(msg).toContain('สวัสดีครับ');
    expect(msg).toContain('Andaman Wave Master');
    expect(msg).toContain('PT-998811');
    expect(msg).toContain('3 ท่าน');
  });

  it('produces valid WhatsApp direct message link', () => {
    const msg = 'Test Order';
    const url = getSupplierOrderWhatsAppUrl(mockSupplier.phone, msg);
    expect(url).toContain('wa.me/6676281234?text=Test%20Order');
  });
});
