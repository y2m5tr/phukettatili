import { describe, it, expect } from 'vitest';
import {
  evaluateWaiverHealthRisk,
  createWaiverRecord,
  generateWaiverRequestWhatsApp,
  generateWaiverConfirmationWhatsApp,
  getWaiverWhatsAppUrl,
  type WaiverFormInput,
} from '../src/lib/digitalWaiver';

describe('Fast Digital Tour Insurance & Waiver Protocol', () => {
  it('should approve standard guest with zero medical risks', () => {
    const input: WaiverFormInput = {
      bookingId: 'BK-101',
      passengerName: 'Hakan Yılmaz',
      passportNumber: 'U12345678',
      nationality: 'Turkish',
      hasHeartCondition: false,
      isPregnant: false,
      hasBackNeckSurgery: false,
      hasSevereAllergy: false,
      emergencyContactName: 'Fatma Yılmaz',
      emergencyContactPhone: '+905321112233',
      acceptedLiability: true,
    };

    const record = createWaiverRecord(input);
    expect(record.status).toBe('approved');
    expect(record.riskWarnings.length).toBe(0);
    expect(record.id).toMatch(/^WAV-/);
  });

  it('should flag pregnant guest with stern seating safety restriction', () => {
    const input: WaiverFormInput = {
      bookingId: 'BK-102',
      passengerName: 'Elif Kaya',
      hasHeartCondition: false,
      isPregnant: true,
      hasBackNeckSurgery: false,
      hasSevereAllergy: false,
      emergencyContactName: 'Ali Kaya',
      emergencyContactPhone: '+905334445566',
      acceptedLiability: true,
    };

    const record = createWaiverRecord(input);
    expect(record.status).toBe('flagged_medical');
    expect(record.riskWarnings.some((w) => w.includes('burun (pruva) koltuğuna oturamaz'))).toBe(true);
  });

  it('should reject record if liability terms are not accepted', () => {
    const input: WaiverFormInput = {
      bookingId: 'BK-103',
      passengerName: 'Refusal Guest',
      hasHeartCondition: false,
      isPregnant: false,
      hasBackNeckSurgery: false,
      hasSevereAllergy: false,
      emergencyContactName: 'Contact',
      emergencyContactPhone: '+905000000000',
      acceptedLiability: false,
    };

    const record = createWaiverRecord(input);
    expect(record.status).toBe('rejected');
  });

  it('should format WhatsApp waiver invitation message with direct link', () => {
    const msg = generateWaiverRequestWhatsApp({
      guestName: 'Hakan Bey',
      bookingId: 'BK-101',
      tourTitle: 'Phi Phi Islands Speedboat',
      waiverUrl: 'https://phukettatili.com/sigorta/BK-101',
    });

    expect(msg).toContain('Hakan Bey');
    expect(msg).toContain('Phi Phi Islands Speedboat');
    expect(msg).toContain('Tayland Turizm Bakanlığı (TAT)');
    expect(msg).toContain('/sigorta/BK-101');

    const url = getWaiverWhatsAppUrl('+905321112233', msg);
    expect(url).toContain('https://wa.me/905321112233?text=');
  });
});
