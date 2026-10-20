import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  mergeHomeSettings,
  getPublicHomeSettings,
  clearHomeSettingsCache,
  type HomeSettingsOverlay,
} from '../src/lib/server/homeSettings';
import homeJson from '../src/content/pages/home.json';

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

    for (const key of allKeys) {
      expect(merged.sections[key], key).toBe(false);
    }
  });

  it('tabanda sections yoksa overlay yine de uygulanır', () => {
    const merged = mergeHomeSettings({} as object, { sections: { hero: false } });
    expect(merged.sections.hero).toBe(false);
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

describe('getPublicHomeSettings — dayanıklılık', () => {
  beforeEach(() => {
    clearHomeSettingsCache();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    clearHomeSettingsCache();
  });

  it('Supabase yapılandırılmamışsa null döner (anasayfa home.json ile çalışmaya devam eder)', async () => {
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => false,
      getSupabaseAdmin: () => null,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    expect(await mod.getPublicHomeSettings()).toBeNull();
    expect(mod.mergeHomeSettings({ sections: { hero: true } }, await mod.getPublicHomeSettings()).sections.hero).toBe(true);
  });

  it('veritabanı hatası fırlarsa sessizce null döner — sayfa çökmez', async () => {
    const db = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => Promise.reject(new Error('db down')),
          }),
        }),
      }),
    };
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    await expect(mod.getPublicHomeSettings()).resolves.toBeNull();
  });

  it('kayıt yoksa null döner ve sonucu önbelleğe alır (negatif cache)', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const db = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }) };
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    const t0 = 1_000_000;
    expect(await mod.getPublicHomeSettings(t0)).toBeNull();
    // TTL içinde ikinci çağrı veritabanına gitmemeli
    expect(await mod.getPublicHomeSettings(t0 + 1_000)).toBeNull();
    expect(maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('panelden gelen kaydı döner ve TTL boyunca önbellekten servis eder', async () => {
    const overlay = { sections: { hero: false } };
    const maybeSingle = vi.fn().mockResolvedValue({ data: { data: overlay }, error: null });
    const db = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }) };
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    const t0 = 5_000_000;
    expect(await mod.getPublicHomeSettings(t0)).toEqual(overlay);
    expect(await mod.getPublicHomeSettings(t0 + 5_000)).toEqual(overlay);
    expect(maybeSingle).toHaveBeenCalledTimes(1);

    // TTL (30 sn) aşıldığında yeniden okur — panel değişikliği canlıya yansır
    await mod.getPublicHomeSettings(t0 + 60_000);
    expect(maybeSingle).toHaveBeenCalledTimes(2);
  });

  it('sorgu hata dönerse (exception değil) mevcut önbellek korunur', async () => {
    const overlay = { sections: { faq: false } };
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { data: overlay }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'timeout' } });
    const db = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }) };
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/homeSettings');

    const t0 = 9_000_000;
    expect(await mod.getPublicHomeSettings(t0)).toEqual(overlay);
    // TTL geçmiş + hata -> son bilinen iyi değer döner, sayfa bozulmaz
    expect(await mod.getPublicHomeSettings(t0 + 60_000)).toEqual(overlay);
  });
});
