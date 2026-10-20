import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  mergeHomeSettings,
  mergeSiteSettings,
  mergeListContent,
  clearHomeSettingsCache,
  type HomeSettingsOverlay,
} from '../src/lib/server/homeSettings';
import homeJson from '../src/content/pages/home.json';

/** content_store satır mock'u: `{ key, data }` dizisi döndüren bir db zinciri. */
function mockDb(rows: () => Promise<{ data: unknown; error: unknown }>) {
  return {
    from: () => ({ select: () => ({ in: () => rows() }) }),
  };
}

/**
 * Anasayfa bölüm görünürlüğü — regresyon koruması.
 *
 * HATA BUYDU: panel "Anasayfa Modül & Metin Yönetimi" bölüm görünürlüğünü
 * `home-settings` koleksiyonuna (Supabase) yazıyordu ama `index.astro` yalnızca
 * derleme zamanında gömülen `home.json`'u okuyordu. "Gizli" yapılan bölümler
 * sayfada görünmeye devam ediyordu. Bu testler iki kaynağın doğru birleştiğini
 * ve Supabase erişilemezse anasayfanın home.json ile ayakta kaldığını kilitler.
 */

describe('mergeHomeSettings — bölüm görünürlüğü', () => {
  it('panelin gizlediği bölüm birleşimde false kalır', () => {
    const overlay: HomeSettingsOverlay = {
      sections: { hero: false, testimonials: false },
    };

    const merged = mergeHomeSettings(
      { sections: { hero: true, testimonials: true, faq: true } },
      overlay,
    );

    expect(merged.sections.hero).toBe(false);
    expect(merged.sections.testimonials).toBe(false);
  });

  it('panelin hiç yazmadığı bölümler tabandaki değerini korur', () => {
    const overlay: HomeSettingsOverlay = { sections: { hero: false } };

    const merged = mergeHomeSettings(
      { sections: { hero: true, faq: true, marquee: true } },
      overlay,
    );

    expect(merged.sections.hero).toBe(false);
    expect(merged.sections.faq).toBe(true);
    expect(merged.sections.marquee).toBe(true);
  });

  it('overlay null ise taban aynen döner (bulut erişilemez durumu)', () => {
    const base = { sections: { hero: true }, heroTitle: 'Taban Başlık' };
    expect(mergeHomeSettings(base, null)).toBe(base);
  });

  it('overlay bozuk/obje değilse taban aynen döner', () => {
    const base = { sections: { hero: true } };
    expect(mergeHomeSettings(base, 'bozuk' as unknown as HomeSettingsOverlay)).toBe(base);
    expect(mergeHomeSettings(base, 42 as unknown as HomeSettingsOverlay)).toBe(base);
  });

  it('gerçek home.json ile: panelin gizlediği 16 bölümden hiçbiri görünür kalmaz', () => {
    const allKeys = Object.keys(homeJson.sections as Record<string, boolean>);
    const overlay: HomeSettingsOverlay = {
      sections: Object.fromEntries(allKeys.map((k) => [k, false])),
    };

    const merged = mergeHomeSettings(homeJson, overlay);
    const mergedSections = merged.sections as Record<string, boolean>;

    for (const key of allKeys) {
      expect(mergedSections[key], key).toBe(false);
    }
  });

  it('tabanda sections yoksa overlay yine de uygulanır', () => {
    const merged = mergeHomeSettings(
      {} as { sections?: Record<string, boolean> },
      { sections: { hero: false } },
    );
    expect(merged.sections?.hero).toBe(false);
  });
});

describe('mergeHomeSettings — metin ve görsel alanları', () => {
  it('panelin yazdığı metin tabanı ezer', () => {
    const merged = mergeHomeSettings(
      { heroTitle: 'Eski Başlık', heroSubtitle: 'Eski Alt Başlık' },
      { heroTitle: 'Yeni Başlık' },
    );

    expect(merged.heroTitle).toBe('Yeni Başlık');
    // Panel bu alanı yazmadı — taban korunur
    expect(merged.heroSubtitle).toBe('Eski Alt Başlık');
  });

  it('panelin yazdığı liste (ör. trustBadges) tabanın yerine geçer', () => {
    const overlayBadges = [{ title: 'Yeni Rozet' }];
    const merged = mergeHomeSettings(
      { trustBadges: [{ title: 'Eski 1' }, { title: 'Eski 2' }] },
      { trustBadges: overlayBadges },
    );

    expect(merged.trustBadges).toEqual(overlayBadges);
  });

  it('sections ve metinler birlikte güncellenebilir', () => {
    const merged = mergeHomeSettings(
      { sections: { hero: true, faq: true }, heroTitle: 'Eski' },
      { sections: { hero: false }, heroTitle: 'Yeni' },
    );

    expect(merged.sections.hero).toBe(false);
    expect(merged.sections.faq).toBe(true);
    expect(merged.heroTitle).toBe('Yeni');
  });
});

describe('mergeSiteSettings — Ayarlar sekmesi', () => {
  it('panelin yazdığı alan site.json tabanını ezer', () => {
    const merged = mergeSiteSettings(
      { whatsappNumber: '66828950665', email: 'eski@x.com' },
      { email: 'yeni@x.com' },
    );
    expect(merged.email).toBe('yeni@x.com');
    expect(merged.whatsappNumber).toBe('66828950665'); // yazılmayan korunur
  });

  it('overlay null/bozuksa taban aynen döner', () => {
    const base = { whatsappNumber: 'x' };
    expect(mergeSiteSettings(base, null)).toBe(base);
    expect(mergeSiteSettings(base, 'bozuk' as unknown as Record<string, unknown>)).toBe(base);
    expect(mergeSiteSettings(base, [] as unknown as Record<string, unknown>)).toBe(base);
  });

  it('panelin eklediği yeni alan birleşime girer', () => {
    const merged = mergeSiteSettings({ siteTitle: 'Phuket' }, { topBarText: 'Duyuru' });
    expect(merged.siteTitle).toBe('Phuket');
    expect((merged as { topBarText?: string }).topBarText).toBe('Duyuru');
  });
});

describe('mergeListContent — testimonials / faqs', () => {
  it('panel listesi tabanın yerine geçer (tümünü-değiştir semantiği)', () => {
    const base = [{ name: 'Eski 1' }, { name: 'Eski 2' }];
    const overlay = [{ name: 'Yeni 1' }];
    expect(mergeListContent(base, overlay)).toEqual(overlay);
  });

  it('overlay null ise (bulut erişilemez) taban döner', () => {
    const base = [{ name: 'Korunan' }];
    expect(mergeListContent(base, null)).toBe(base);
  });

  it('boş dizi geçerlidir — panel listeyi bilerek boşalttı', () => {
    expect(mergeListContent([{ name: 'x' }], [])).toEqual([]);
  });

  it('overlay dizi değilse bozuk kayıt — taban korunur', () => {
    const base = [{ name: 'Korunan' }];
    expect(mergeListContent(base, 'bozuk' as unknown as unknown[])).toBe(base);
    expect(mergeListContent(base, { a: 1 } as unknown as unknown[])).toBe(base);
  });
});

describe('getPublicHomeContent / getPublicHomeSettings — dayanıklılık', () => {
  beforeEach(() => {
    clearHomeSettingsCache();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    clearHomeSettingsCache();
  });

  it('Supabase yapılandırılmamışsa homeSettings null döner (home.json ile devam eder)', async () => {
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => false,
      getSupabaseAdmin: () => null,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    expect(await mod.getPublicHomeSettings()).toBeNull();
    expect(mod.mergeHomeSettings({ sections: { hero: true } }, await mod.getPublicHomeSettings()).sections.hero).toBe(true);
  });

  it('veritabanı hatası fırlarsa sessizce boş içerik döner — sayfa çökmez', async () => {
    const db = mockDb(() => Promise.reject(new Error('db down')));
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    await expect(mod.getPublicHomeSettings()).resolves.toBeNull();
  });

  it('kayıt yoksa null döner ve sonucu önbelleğe alır (negatif cache)', async () => {
    const rows = vi.fn().mockResolvedValue({ data: [], error: null });
    const db = mockDb(rows);
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    const t0 = 1_000_000;
    expect(await mod.getPublicHomeSettings(t0)).toBeNull();
    // TTL içinde ikinci çağrı veritabanına gitmemeli
    expect(await mod.getPublicHomeSettings(t0 + 1_000)).toBeNull();
    expect(rows).toHaveBeenCalledTimes(1);
  });

  it('dört anahtarı tek sorguda ayrıştırır ve TTL boyunca önbellekten servis eder', async () => {
    const homeSettings = { sections: { hero: false } };
    const siteSettings = { whatsappNumber: '66999' };
    const testimonials = [{ name: 'T1' }];
    const faqs = [{ question: 'S', answer: 'C' }];
    const rows = vi.fn().mockResolvedValue({
      data: [
        { key: 'home-settings', data: homeSettings },
        { key: 'site-settings', data: siteSettings },
        { key: 'testimonials', data: testimonials },
        { key: 'faqs', data: faqs },
      ],
      error: null,
    });
    const db = mockDb(rows);
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    const t0 = 5_000_000;
    const content = await mod.getPublicHomeContent(t0);
    expect(content.homeSettings).toEqual(homeSettings);
    expect(content.siteSettings).toEqual(siteSettings);
    expect(content.testimonials).toEqual(testimonials);
    expect(content.faqs).toEqual(faqs);
    // getPublicHomeSettings aynı önbelleği paylaşır
    expect(await mod.getPublicHomeSettings(t0 + 1_000)).toEqual(homeSettings);
    expect(rows).toHaveBeenCalledTimes(1);

    // TTL (30 sn) aşıldığında yeniden okur — panel değişikliği canlıya yansır
    await mod.getPublicHomeContent(t0 + 60_000);
    expect(rows).toHaveBeenCalledTimes(2);
  });

  it('beklenmeyen tipteki satır yok sayılır (bozuk kayıt sayfa çökertmez)', async () => {
    const rows = vi.fn().mockResolvedValue({
      data: [
        { key: 'home-settings', data: { sections: { faq: false } } },
        { key: 'testimonials', data: 'bozuk-dizi-degil' }, // dizi bekleniyordu
        { key: 'site-settings', data: ['bozuk-dizi'] }, // nesne bekleniyordu
      ],
      error: null,
    });
    const db = mockDb(rows);
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    const content = await mod.getPublicHomeContent(7_000_000);
    expect(content.homeSettings).toEqual({ sections: { faq: false } });
    expect(content.testimonials).toBeNull(); // bozuk -> null, taban kullanılır
    expect(content.siteSettings).toBeNull(); // bozuk -> null, taban kullanılır
  });

  it('sorgu hata dönerse (exception değil) mevcut önbellek korunur', async () => {
    const homeSettings = { sections: { faq: false } };
    const rows = vi
      .fn()
      .mockResolvedValueOnce({ data: [{ key: 'home-settings', data: homeSettings }], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'timeout' } });
    const db = mockDb(rows);
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    const t0 = 9_000_000;
    expect(await mod.getPublicHomeSettings(t0)).toEqual(homeSettings);
    // TTL geçmiş + hata -> son bilinen iyi değer döner, sayfa bozulmaz
    expect(await mod.getPublicHomeSettings(t0 + 60_000)).toEqual(homeSettings);
  });
});
