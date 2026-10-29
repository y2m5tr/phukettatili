import { describe, expect, it } from 'vitest';
import {
  parseUtmParams,
  formatCampaignRef,
  enrichWhatsAppUrl,
  type UtmCampaignData,
} from '../src/lib/marketing/utmTracker';

describe('UTM Tracker & Campaign Attribution', () => {
  it('boş sorgularda veya UTM olmayan parametrelerde null dönmeli', () => {
    expect(parseUtmParams('')).toBeNull();
    expect(parseUtmParams('?tab=island&page=2')).toBeNull();
  });

  it('standart UTM parametrelerini doğru ayıklamalı', () => {
    const search = '?utm_source=instagram&utm_medium=cpc&utm_campaign=phi-phi-deluxe&utm_content=reels-video-1';
    const parsed = parseUtmParams(search, '/turlar/phi-phi');
    
    expect(parsed).not.toBeNull();
    expect(parsed?.utm_source).toBe('instagram');
    expect(parsed?.utm_medium).toBe('cpc');
    expect(parsed?.utm_campaign).toBe('phi-phi-deluxe');
    expect(parsed?.utm_content).toBe('reels-video-1');
    expect(parsed?.landing_page).toBe('/turlar/phi-phi');
  });

  it('fbclid veya gclid içeren reklam parametrelerini tanımalı', () => {
    const metaClick = parseUtmParams('?fbclid=IwAR2xyz123');
    expect(metaClick?.utm_source).toBe('meta_ad');
    expect(metaClick?.fbclid).toBe('IwAR2xyz123');

    const googleClick = parseUtmParams('?gclid=Cj0KCQiA');
    expect(googleClick?.utm_source).toBe('google_ad');
    expect(googleClick?.gclid).toBe('Cj0KCQiA');
  });

  it('kampanya referans etiketini doğru formatlamalı', () => {
    const utm1: UtmCampaignData = {
      utm_source: 'instagram',
      utm_campaign: 'yaz-indirimi',
    };
    expect(formatCampaignRef(utm1)).toBe('[Ref: IG/yaz-indirimi]');

    const utm2: UtmCampaignData = {
      utm_source: 'facebook',
      utm_content: 'video2',
    };
    expect(formatCampaignRef(utm2)).toBe('[Ref: FB/video2]');

    const utm3: UtmCampaignData = {
      utm_source: 'tiktok',
    };
    expect(formatCampaignRef(utm3)).toBe('[Ref: TikTok]');

    expect(formatCampaignRef(null)).toBe('');
  });

  it('WhatsApp URL mesajına kampanya referansını temiz şekilde eklemeli', () => {
    const utm: UtmCampaignData = {
      utm_source: 'instagram',
      utm_campaign: 'phi-phi-promo',
    };

    const rawUrl = 'https://wa.me/66828950665?text=Merhaba%2C%20bilgi%20almak%20istiyorum.';
    const enriched = enrichWhatsAppUrl(rawUrl, utm);

    const normalized = decodeURIComponent(enriched).replace(/\+/g, ' ');
    expect(normalized).toContain('[Ref: IG/phi-phi-promo]');
    expect(normalized).toContain('Merhaba, bilgi almak istiyorum.');

    // Çift ekleme yapılmamalı
    const twiceEnriched = enrichWhatsAppUrl(enriched, utm);
    const decodedTwice = decodeURIComponent(twiceEnriched).replace(/\+/g, ' ');
    const matches = decodedTwice.match(/\[Ref:/g);
    expect(matches?.length).toBe(1);
  });
});
