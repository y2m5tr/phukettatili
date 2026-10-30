import { describe, it, expect } from 'vitest';
import {
  parseUtmParams,
  formatCampaignRef,
} from '../src/lib/marketing/utmTracker';
import { initialAgents } from '../src/data/seedData';
import { calculateAgentCommission } from '../src/data/businessLogic';

describe('B2B Referral & Commission Tracking', () => {
  it('correctly extracts ?ref= and ?agent= into utm tracking data', () => {
    const utmFromRef = parseUtmParams('?utm_source=instagram&ref=PATONG-HOTEL');
    expect(utmFromRef?.ref).toBe('PATONG-HOTEL');
    expect(utmFromRef?.utm_source).toBe('instagram');

    const utmFromAgent = parseUtmParams('?agent=guide-ali');
    expect(utmFromAgent?.ref).toBe('GUIDE-ALI');
    expect(utmFromAgent?.utm_source).toBe('partner_ref');
  });

  it('formats agent reference tag in WhatsApp summary string', () => {
    const formatted = formatCampaignRef({
      utm_source: 'partner_ref',
      utm_medium: 'referral',
      ref: 'PATONG-HOTEL',
    });
    expect(formatted).toBe('[Acente Ref: PATONG-HOTEL]');
  });

  it('calculates agent commission properly for registered B2B partners', () => {
    const agent = initialAgents[0]; // e.g. agent-1
    expect(agent).toBeDefined();

    const totalBookingThb = 10000;
    const commission = calculateAgentCommission(agent, totalBookingThb, 2, 0);
    expect(commission).toBeGreaterThan(0);
    expect(commission).toBe(Math.round(totalBookingThb * (agent.commissionRate / 100)));
  });
});
