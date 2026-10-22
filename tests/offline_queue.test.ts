import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  enqueueMutation,
  getPendingMutations,
  removeMutation,
  clearPendingMutations,
  setOfflineCache,
  getOfflineCache,
  flushPendingMutations,
  submitMutation,
} from '../src/lib/offlineQueue';

describe('Aşama 4: Offline Queue & Resilience Engine', () => {
  beforeEach(async () => {
    await clearPendingMutations();
    vi.restoreAllMocks();
  });

  it('kuyruğa yeni mutasyon eklemeli ve id ile createdAt üretmeli', async () => {
    const item = await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { id: 'BK-1234', customerName: 'Ali Yılmaz' },
      description: 'Ali Yılmaz check-in işlemi',
    });

    expect(item.id).toMatch(/^mut-/);
    expect(typeof item.createdAt).toBe('number');
    expect(item.description).toBe('Ali Yılmaz check-in işlemi');

    const pending = await getPendingMutations();
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe(item.id);
  });

  it('bekleyen mutasyonları FIFO (öncelik sırasına göre) getirmeli', async () => {
    const item1 = await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { id: 'BK-1' },
      description: 'İşlem 1',
    });

    // Küçük bir gecikmeyle 2. elemanı ekle
    await new Promise((r) => setTimeout(r, 10));

    const item2 = await enqueueMutation({
      type: 'POST_BOOKING',
      url: '/api/bookings',
      method: 'POST',
      body: { id: 'BK-2' },
      description: 'İşlem 2',
    });

    const pending = await getPendingMutations();
    expect(pending.length).toBe(2);
    expect(pending[0].id).toBe(item1.id);
    expect(pending[1].id).toBe(item2.id);
  });

  it('belirli bir mutasyonu kuyruktan çıkarabilmeli', async () => {
    const item1 = await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      description: 'Silinecek',
    });
    const item2 = await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      description: 'Kalacak',
    });

    await removeMutation(item1.id);

    const pending = await getPendingMutations();
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe(item2.id);
  });

  it('tüm kuyruğu tek hamlede temizleyebilmeli', async () => {
    await enqueueMutation({ type: 'PUT_BOOKING', url: '/api/bookings', method: 'PUT', description: 'A' });
    await enqueueMutation({ type: 'PUT_BOOKING', url: '/api/bookings', method: 'PUT', description: 'B' });

    await clearPendingMutations();
    const pending = await getPendingMutations();
    expect(pending.length).toBe(0);
  });

  it('çevrimdışı veri önbelleğine (offline cache) veri yazıp okuyabilmeli', async () => {
    const sampleBookings = [{ id: 'BK-999', customerName: 'Deniz Kaya' }];
    await setOfflineCache('bookings', sampleBookings);

    const retrieved = await getOfflineCache<typeof sampleBookings>('bookings');
    expect(retrieved).toEqual(sampleBookings);
  });

  it('flushPendingMutations başarılı istekleri kuyruktan temizlemeli', async () => {
    await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { id: 'BK-OK' },
      description: 'Başarılı işlem',
    });

    // fetch mock: 200 OK
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await flushPendingMutations();
    expect(res.succeeded).toBe(1);
    expect(res.failed).toBe(0);
    expect(res.remaining).toBe(0);

    const pending = await getPendingMutations();
    expect(pending.length).toBe(0);
  });

  it('submitMutation queues an offline booking write and marks it pending', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    const result = await submitMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { id: 'BK-OFFLINE' },
      description: 'Çevrimdışı rezervasyon güncellemesi',
    });

    expect(result.status).toBe('queued');
    expect(await getPendingMutations()).toEqual([
      expect.objectContaining({
        body: { id: 'BK-OFFLINE' },
        syncStatus: 'pending',
      }),
    ]);
  });

  it('submitMutation does not enqueue a rejected online write as successful', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Bu işlem için yetkiniz yok.' }),
    }));

    const result = await submitMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { id: 'BK-DENIED' },
      description: 'Yetkisiz rezervasyon güncellemesi',
    });

    expect(result.status).toBe('rejected');
    if (result.status !== 'rejected') throw new Error('Expected rejected mutation');
    expect(result.error).toBe('Bu işlem için yetkiniz yok.');
    expect(await getPendingMutations()).toHaveLength(0);
  });

  it('flushPendingMutations keeps rejected client mutations queued and reports status and reason', async () => {
    await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { invalid: true },
      description: 'Hatalı rezervasyon',
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ error: 'Rezervasyon alanları doğrulanamadı.' }),
    }));

    const result = await flushPendingMutations();

    expect(result.failed).toBe(1);
    expect(result.remaining).toBe(1);
    expect(result.items).toEqual([
      expect.objectContaining({
        status: 'needs_attention',
        statusCode: 422,
        error: 'Rezervasyon alanları doğrulanamadı.',
        description: 'Hatalı rezervasyon',
      }),
    ]);
    expect(await getPendingMutations()).toHaveLength(1);
  });

  it('flushPendingMutations keeps transient failures retryable', async () => {
    await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { id: 'BK-RETRY' },
      description: 'Tekrar denenecek',
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Geçici sunucu hatası.' }),
    }));

    const result = await flushPendingMutations();

    expect(result.items).toEqual([
      expect.objectContaining({ status: 'retrying', statusCode: 503 }),
    ]);
    expect(await getPendingMutations()).toHaveLength(1);
  });

  it('flushPendingMutations ağ hatasında döngüyü kesmeli ve kuyruğu korumalı', async () => {
    await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { id: 'BK-RETRY' },
      description: 'Yeniden denenecek',
    });

    // fetch mock: Ağ hatası fırlat
    const fetchMock = vi.fn().mockRejectedValue(new Error('Network error (No internet)'));
    vi.stubGlobal('fetch', fetchMock);

    const res = await flushPendingMutations();
    expect(res.succeeded).toBe(0);
    expect(res.remaining).toBe(1);

    const pending = await getPendingMutations();
    expect(pending.length).toBe(1);
  });
});
