import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  applyTourOverlay,
  applyTourOverlayToEntry,
  clearTourCache,
  type TourOverlayItem,
  type TourEntryLike,
} from '../src/lib/server/tourContent';

/**
 * Tur overlay — regresyon koruması.
 *
 * HATA BUYDU: panel Turlar ekranı `tours` koleksiyonuna (Supabase
 * content_store) yazıyordu; tur DETAY sayfası bu kaydı okuyordu ama LİSTE
 * sayfaları (`turlar/index`, `tur-kategorisi/[category]`) ve anasayfadaki öne
 * çıkan turlar `prerender = true` + statik .md koleksiyonuna sabitliydi.
 * Sonuç: panelde fiyat değişince detayda yeni, listede eski fiyat görünüyordu.
 *
 * Bu testler alan eşlemesini (priceThb -> price_thb), detay/liste
 * tutarlılığını, gövdenin korunmasını ve bulut erişilemezken sayfaların .md
 * ile ayakta kaldığını kilitler.
 */

const mdTour = (id: string, over: Partial<TourEntryLike['data']> = {}): TourEntryLike => ({
  id,
  data: {
    title: 'Taban Tur',
    category: 'island-tours',
    category_label: 'Ada Turları',
    excerpt: 'Taban özet',
    image: 'phi-phi.webp',
    price_type: 'fixed',
    price_thb: 1500,
    duration: 'Tam gün',
    featured: false,
    order: 100,
    body: 'MARKDOWN GÖVDESİ',
    ...over,
  },
});

describe('applyTourOverlay — alan eşlemesi', () => {
  it('panel alan adlarını koleksiyon şemasına çevirir (priceThb -> price_thb)', () => {
    const overlay: TourOverlayItem[] = [
      { id: 'tur-1', priceThb: 2500, categoryLabel: 'Yeni Etiket' },
    ];
    const merged = applyTourOverlay([mdTour('tur-1')], overlay);

    expect(merged[0].data.price_thb).toBe(2500);
    expect(merged[0].data.category_label).toBe('Yeni Etiket');
  });

  it('fiyatla birlikte price_type türetilir (0 -> quote, >0 -> fixed)', () => {
    const toQuote = applyTourOverlay([mdTour('tur-1')], [{ id: 'tur-1', priceThb: 0 }]);
    expect(toQuote[0].data.price_thb).toBe(0);
    expect(toQuote[0].data.price_type).toBe('quote');

    const toFixed = applyTourOverlay([mdTour('tur-1', { price_type: 'quote' })], [
      { id: 'tur-1', priceThb: 3200 },
    ]);
    expect(toFixed[0].data.price_thb).toBe(3200);
    expect(toFixed[0].data.price_type).toBe('fixed');
  });

  it('fiyat bozuk tipte ise (string/NaN) taban korunur — listeye NaN basılmaz', () => {
    const merged = applyTourOverlay([mdTour('tur-1')], [
      { id: 'tur-1', priceThb: '2500' as unknown as number },
    ]);
    expect(merged[0].data.price_thb).toBe(1500);
    expect(merged[0].data.price_type).toBe('fixed');

    const nan = applyTourOverlay([mdTour('tur-1')], [{ id: 'tur-1', priceThb: Number.NaN }]);
    expect(nan[0].data.price_thb).toBe(1500);
  });

  it('başlık/kapak/özet/süre/öne-çıkan alanları ezilir', () => {
    const merged = applyTourOverlay([mdTour('tur-1')], [
      {
        id: 'tur-1',
        title: 'Yeni Başlık',
        image: 'yeni.webp',
        excerpt: 'Yeni özet',
        duration: 'Yarım gün',
        featured: true,
      },
    ]);

    expect(merged[0].data.title).toBe('Yeni Başlık');
    expect(merged[0].data.image).toBe('yeni.webp');
    expect(merged[0].data.excerpt).toBe('Yeni özet');
    expect(merged[0].data.duration).toBe('Yarım gün');
    expect(merged[0].data.featured).toBe(true);
  });

  it('listeler (galeri/program/dahil-hariç/SSS) ezilir', () => {
    const overlay: TourOverlayItem[] = [
      {
        id: 'tur-1',
        gallery: ['a.webp', 'b.webp'],
        program: ['08:30 Karşılama'],
        included: ['Transfer'],
        excluded: ['Kişisel harcama'],
        faq: [{ q: 'Soru?', a: 'Cevap.' }],
      },
    ];
    const merged = applyTourOverlay([mdTour('tur-1')], overlay);

    expect(merged[0].data.gallery).toEqual(['a.webp', 'b.webp']);
    expect(merged[0].data.program).toEqual(['08:30 Karşılama']);
    expect(merged[0].data.included).toEqual(['Transfer']);
    expect(merged[0].data.excluded).toEqual(['Kişisel harcama']);
    expect(merged[0].data.faq).toEqual([{ q: 'Soru?', a: 'Cevap.' }]);
  });

  it('boş liste tabanı SİLMEZ (panel alanı boşaltmadı, hiç göndermedi)', () => {
    const merged = applyTourOverlay(
      [mdTour('tur-1', { gallery: ['eski.webp'], included: ['Eski'] })],
      [{ id: 'tur-1', gallery: [], included: [] }],
    );
    expect(merged[0].data.gallery).toEqual(['eski.webp']);
    expect(merged[0].data.included).toEqual(['Eski']);
  });

  it('bozuk SSS kayıtları filtrelenir (q/a string olmayanlar düşer)', () => {
    const merged = applyTourOverlay([mdTour('tur-1')], [
      { id: 'tur-1', faq: [{ q: 'Geçerli', a: 'Cevap' }, { q: 42, a: null }] as unknown as TourOverlayItem['faq'] },
    ]);
    expect(merged[0].data.faq).toEqual([{ q: 'Geçerli', a: 'Cevap' }]);
  });

  it('gövde (body) her zaman korunur — panel gövdeyi yönetmez', () => {
    const merged = applyTourOverlay([mdTour('tur-1')], [
      { id: 'tur-1', title: 'Değişti', body: 'PANEL GÖVDESİ YOK SAYILMALI' },
    ]);
    expect(merged[0].data.body).toBe('MARKDOWN GÖVDESİ');
  });

  it('slug eşleşmesi de çalışır', () => {
    const merged = applyTourOverlay([mdTour('tur-1')], [
      { id: 'panel-uuid', slug: 'tur-1', title: 'Slug ile eşleşti' },
    ]);
    expect(merged[0].data.title).toBe('Slug ile eşleşti');
  });

  it('.md dosyası olmayan cloud kaydı YOK SAYILIR (kırık detay sayfası üretilmez)', () => {
    const merged = applyTourOverlay(
      [mdTour('tur-1')],
      [{ id: 'tur-1' }, { id: 'sade-panelde-var', title: 'Gövdesiz' }],
    );
    expect(merged).toHaveLength(1);
    expect(merged.some((t) => t.id === 'sade-panelde-var')).toBe(false);
  });

  it('eşleşmeyen tur değişmez ve overlay null/boş/bozuksa taban döner', () => {
    const tours = [mdTour('tur-1')];
    expect(applyTourOverlay(tours, [{ id: 'baska' }])[0]).toBe(tours[0]);
    expect(applyTourOverlay(tours, null)).toBe(tours);
    expect(applyTourOverlay(tours, [])).toBe(tours);
    expect(applyTourOverlay(tours, 'bozuk' as unknown as TourOverlayItem[])).toBe(tours);
  });

  it('girdi turları mutasyona uğramaz (saf fonksiyon)', () => {
    const tour = mdTour('tur-1');
    applyTourOverlay([tour], [{ id: 'tur-1', title: 'Değişik' }]);
    expect(tour.data.title).toBe('Taban Tur');
  });
});

describe('applyTourOverlay — detay/liste tutarlılığı', () => {
  it('aynı overlay iki fonksiyonda da aynı fiyatı üretir', () => {
    const overlay: TourOverlayItem[] = [{ id: 'tur-1', priceThb: 2750, title: 'Tutarlı' }];

    // liste yolu (saf)
    const listResult = applyTourOverlay([mdTour('tur-1')], overlay)[0];
    // detay yolu (yerinde)
    const detailEntry = mdTour('tur-1');
    applyTourOverlayToEntry(detailEntry, overlay);

    expect(listResult.data.price_thb).toBe(detailEntry.data.price_thb);
    expect(listResult.data.title).toBe(detailEntry.data.title);
    expect(listResult.data.price_type).toBe(detailEntry.data.price_type);
  });
});

describe('applyTourOverlayToEntry — yerinde güncelleme (detay sayfası)', () => {
  it('entry.data yerinde güncellenir, gövde korunur', () => {
    const tour = mdTour('tur-1');
    applyTourOverlayToEntry(tour, [{ id: 'tur-1', title: 'Yeni', priceThb: 999 }]);

    expect(tour.data.title).toBe('Yeni');
    expect(tour.data.price_thb).toBe(999);
    expect(tour.data.body).toBe('MARKDOWN GÖVDESİ');
  });

  it('eşleşme yoksa / overlay null ise hiçbir şey değişmez', () => {
    const tour = mdTour('tur-1');
    const before = JSON.stringify(tour.data);
    applyTourOverlayToEntry(tour, null);
    applyTourOverlayToEntry(tour, [{ id: 'baska' }]);
    expect(JSON.stringify(tour.data)).toBe(before);
  });
});

describe('getCloudTours — dayanıklılık', () => {
  beforeEach(() => {
    clearTourCache();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    clearTourCache();
  });

  /** content_store sorgu mock'u: from().select().eq().maybeSingle() zinciri. */
  const mockDb = (maybeSingle: () => Promise<{ data: unknown; error: unknown }>) => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle }) }) }),
  });

  it('Supabase yapılandırılmamışsa null döner (sayfalar .md ile devam eder)', async () => {
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => false,
      getSupabaseAdmin: () => null,
    }));
    const mod = await import('../src/lib/server/tourContent');
    expect(await mod.getCloudTours()).toBeNull();
  });

  it('veritabanı hatası fırlarsa sessizce null döner — sayfa çökmez', async () => {
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(() => Promise.reject(new Error('db down'))),
    }));
    const mod = await import('../src/lib/server/tourContent');
    await expect(mod.getCloudTours()).resolves.toBeNull();
  });

  it('kayıt yoksa null döner ve negatif cache uygulanır (TTL içinde tek sorgu)', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(maybeSingle),
    }));
    const mod = await import('../src/lib/server/tourContent');

    const t0 = 1_000_000;
    expect(await mod.getCloudTours(t0)).toBeNull();
    expect(await mod.getCloudTours(t0 + 1_000)).toBeNull();
    expect(maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('dizi olmayan data bozuk kayıttır — null döner', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { data: { degil: 'dizi' } }, error: null });
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(maybeSingle),
    }));
    const mod = await import('../src/lib/server/tourContent');
    expect(await mod.getCloudTours(2_000_000)).toBeNull();
  });

  it('panelden gelen listeyi döner ve TTL (30sn) aşımında tazeler', async () => {
    const tours = [{ id: 'tur-1', title: 'Cloud' }];
    const maybeSingle = vi.fn().mockResolvedValue({ data: { data: tours }, error: null });
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(maybeSingle),
    }));
    const mod = await import('../src/lib/server/tourContent');

    const t0 = 5_000_000;
    expect(await mod.getCloudTours(t0)).toEqual(tours);
    expect(await mod.getCloudTours(t0 + 5_000)).toEqual(tours);
    expect(maybeSingle).toHaveBeenCalledTimes(1);

    await mod.getCloudTours(t0 + 60_000);
    expect(maybeSingle).toHaveBeenCalledTimes(2);
  });

  it('sorgu hata dönerse (exception değil) son iyi önbellek korunur', async () => {
    const tours = [{ id: 'tur-1', title: 'Cloud' }];
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { data: tours }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'timeout' } });
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(maybeSingle),
    }));
    const mod = await import('../src/lib/server/tourContent');

    const t0 = 9_000_000;
    expect(await mod.getCloudTours(t0)).toEqual(tours);
    expect(await mod.getCloudTours(t0 + 60_000)).toEqual(tours);
  });
});
