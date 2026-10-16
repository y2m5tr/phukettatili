import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  enqueueMutation,
  getPendingMutations,
  removeMutation,
  clearPendingMutations,
  setOfflineCache,
  getOfflineCache,
  flushPendingMutations,
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

  it('flushPendingMutations istemci 4xx hatalarında kuyruğu kilitlemeyip işlemi çıkarmalı', async () => {
    await enqueueMutation({
      type: 'PUT_BOOKING',
      url: '/api/bookings',
      method: 'PUT',
      body: { invalid: true },
      description: 'Hatalı veri',
    });

    // fetch mock: 400 Bad Request
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await flushPendingMutations();
    expect(res.succeeded).toBe(0);
    expect(res.failed).toBe(1);
    expect(res.remaining).toBe(0);

    const pending = await getPendingMutations();
    expect(pending.length).toBe(0); // Kuyruktan çıkarıldı
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
