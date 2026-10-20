import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  applyBlogOverlay,
  applyBlogOverlayToEntry,
  clearBlogCache,
  type BlogOverlayItem,
  type BlogPostLike,
} from '../src/lib/server/blogContent';

/**
 * Blog metadata overlay — regresyon koruması.
 *
 * HATA BUYDU: panel Blog ekranı `blogs` koleksiyonuna (Supabase content_store)
 * yazıyordu ama blog sayfaları `prerender = true` + statik .md koleksiyonu
 * okuyordu. Panelde değiştirilen başlık/özet/kapak canlıya yansımıyordu
 * (stories/home-settings fix'i 0971510 ile aynı hastalık).
 *
 * SINIR: panelde gövde alanı yoktur; gövde yalnızca .md'den gelir. Bu testler
 * metadata birleşimini, gövdenin (body) korunmasını ve bulut erişilemezken
 * sayfaların .md ile ayakta kaldığını kilitler.
 */

const mdPost = (id: string, over: Partial<BlogPostLike['data']> = {}): BlogPostLike => ({
  id,
  data: {
    title: 'Taban Başlık',
    excerpt: 'Taban Özet',
    cover_image: 'beach.webp',
    author: 'Phuket Tatili Ekibi',
    date: new Date('2026-10-07'),
    featured: false,
    body: 'MARKDOWN GÖVDESİ',
    ...over,
  },
});

describe('applyBlogOverlay — metadata birleşimi', () => {
  it('eşleşen cloud kaydı metadata alanlarını ezer', () => {
    const overlay: BlogOverlayItem[] = [
      { id: 'yazi-1', title: 'Yeni Başlık', excerpt: 'Yeni Özet', featured: true },
    ];
    const merged = applyBlogOverlay([mdPost('yazi-1')], overlay);

    expect(merged[0].data.title).toBe('Yeni Başlık');
    expect(merged[0].data.excerpt).toBe('Yeni Özet');
    expect(merged[0].data.featured).toBe(true);
    // yazılmayan alanlar tabandan korunur
    expect(merged[0].data.cover_image).toBe('beach.webp');
    expect(merged[0].data.author).toBe('Phuket Tatili Ekibi');
  });

  it('gövde (body) her zaman korunur — panel gövdeyi yönetmez', () => {
    const overlay: BlogOverlayItem[] = [
      { id: 'yazi-1', title: 'Değişti', body: 'PANEL GÖVDESİ YOK SAYILMALI' },
    ];
    const merged = applyBlogOverlay([mdPost('yazi-1')], overlay);
    expect(merged[0].data.body).toBe('MARKDOWN GÖVDESİ');
  });

  it('cloud date string ise Date e çevrilir (.md tabanıyla tip uyumu)', () => {
    const overlay: BlogOverlayItem[] = [{ id: 'yazi-1', date: '2026-11-01' }];
    const merged = applyBlogOverlay([mdPost('yazi-1')], overlay);
    expect(merged[0].data.date).toBeInstanceOf(Date);
    expect((merged[0].data.date as Date).getFullYear()).toBe(2026);
  });

  it('bozuk date tabanı korur', () => {
    const overlay: BlogOverlayItem[] = [{ id: 'yazi-1', date: 'geçersiz-tarih' }];
    const merged = applyBlogOverlay([mdPost('yazi-1', { date: new Date('2026-10-07') })], overlay);
    expect((merged[0].data.date as Date).toISOString().slice(0, 10)).toBe('2026-10-07');
  });

  it('slug eşleşmesi de çalışır (panel id=slug üretir ama eski kayıtlar farklı olabilir)', () => {
    const overlay: BlogOverlayItem[] = [{ id: 'panel-uuid', slug: 'yazi-1', title: 'Slug ile eşleşti' }];
    const merged = applyBlogOverlay([mdPost('yazi-1')], overlay);
    expect(merged[0].data.title).toBe('Slug ile eşleşti');
  });

  it('eşleşmeyen cloud kaydı postu değiştirmez', () => {
    const posts = [mdPost('yazi-1')];
    const merged = applyBlogOverlay(posts, [{ id: 'baska-yazi', title: 'İlgisiz' }]);
    expect(merged[0]).toBe(posts[0]); // aynı referans — hiç dokunulmadı
  });

  it('.md dosyası olmayan cloud kaydı YOK SAYILIR (kırık detay sayfası üretilmez)', () => {
    const merged = applyBlogOverlay(
      [mdPost('yazi-1')],
      [{ id: 'yazi-1' }, { id: 'sade-panelde-var', title: 'Gövdesiz' }],
    );
    expect(merged).toHaveLength(1);
    expect(merged.some((p) => p.id === 'sade-panelde-var')).toBe(false);
  });

  it('overlay null/boş/bozuk ise taban aynen döner', () => {
    const posts = [mdPost('yazi-1')];
    expect(applyBlogOverlay(posts, null)).toBe(posts);
    expect(applyBlogOverlay(posts, [])).toBe(posts);
    expect(applyBlogOverlay(posts, 'bozuk' as unknown as BlogOverlayItem[])).toBe(posts);
    // null öğe içeren liste: indeks boş kalır, postlar değişmeden döner
    expect(applyBlogOverlay(posts, [null as unknown as BlogOverlayItem])).toEqual(posts);
  });

  it('girdi postları mutasyona uğramaz (saf fonksiyon)', () => {
    const post = mdPost('yazi-1');
    applyBlogOverlay([post], [{ id: 'yazi-1', title: 'Değişik' }]);
    expect(post.data.title).toBe('Taban Başlık');
  });
});

describe('applyBlogOverlayToEntry — yerinde güncelleme (detay sayfası)', () => {
  it('entry.data yerinde güncellenir (render gövdeyi korur)', () => {
    const post = mdPost('yazi-1');
    applyBlogOverlayToEntry(post, [{ id: 'yazi-1', title: 'Yeni', cover_image: 'yeni.webp' }]);

    expect(post.data.title).toBe('Yeni');
    expect(post.data.cover_image).toBe('yeni.webp');
    expect(post.data.body).toBe('MARKDOWN GÖVDESİ');
  });

  it('eşleşme yoksa / overlay null ise hiçbir şey değişmez', () => {
    const post = mdPost('yazi-1');
    const before = JSON.stringify(post.data);
    applyBlogOverlayToEntry(post, null);
    applyBlogOverlayToEntry(post, [{ id: 'baska' }]);
    expect(JSON.stringify(post.data)).toBe(before);
  });
});

describe('getCloudBlogPosts — dayanıklılık', () => {
  beforeEach(() => {
    clearBlogCache();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    clearBlogCache();
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
    const mod = await import('../src/lib/server/blogContent');
    expect(await mod.getCloudBlogPosts()).toBeNull();
  });

  it('veritabanı hatası fırlarsa sessizce null döner — sayfa çökmez', async () => {
    const db = mockDb(() => Promise.reject(new Error('db down')));
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => db,
    }));
    const mod = await import('../src/lib/server/blogContent');
    await expect(mod.getCloudBlogPosts()).resolves.toBeNull();
  });

  it('kayıt yoksa null döner ve negatif cache uygulanır (TTL içinde tek sorgu)', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(maybeSingle),
    }));
    const mod = await import('../src/lib/server/blogContent');

    const t0 = 1_000_000;
    expect(await mod.getCloudBlogPosts(t0)).toBeNull();
    expect(await mod.getCloudBlogPosts(t0 + 1_000)).toBeNull();
    expect(maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('dizi olmayan data bozuk kayıttır — null döner (tip güvenliği)', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { data: { degil: 'dizi' } }, error: null });
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(maybeSingle),
    }));
    const mod = await import('../src/lib/server/blogContent');
    expect(await mod.getCloudBlogPosts(2_000_000)).toBeNull();
  });

  it('panelden gelen listeyi döner ve TTL (30sn) aşımında tazeler', async () => {
    const blogs = [{ id: 'yazi-1', title: 'Cloud' }];
    const maybeSingle = vi.fn().mockResolvedValue({ data: { data: blogs }, error: null });
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(maybeSingle),
    }));
    const mod = await import('../src/lib/server/blogContent');

    const t0 = 5_000_000;
    expect(await mod.getCloudBlogPosts(t0)).toEqual(blogs);
    expect(await mod.getCloudBlogPosts(t0 + 5_000)).toEqual(blogs);
    expect(maybeSingle).toHaveBeenCalledTimes(1);

    await mod.getCloudBlogPosts(t0 + 60_000);
    expect(maybeSingle).toHaveBeenCalledTimes(2);
  });

  it('sorgu hata dönerse (exception değil) son iyi önbellek korunur', async () => {
    const blogs = [{ id: 'yazi-1', title: 'Cloud' }];
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { data: blogs }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'timeout' } });
    vi.doMock('../src/lib/server/supabaseAdmin', () => ({
      isSupabaseAdminConfigured: () => true,
      getSupabaseAdmin: () => mockDb(maybeSingle),
    }));
    const mod = await import('../src/lib/server/blogContent');

    const t0 = 9_000_000;
    expect(await mod.getCloudBlogPosts(t0)).toEqual(blogs);
    expect(await mod.getCloudBlogPosts(t0 + 60_000)).toEqual(blogs);
  });
});
