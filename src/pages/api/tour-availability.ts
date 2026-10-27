/**
 * /api/tour-availability — tur ve tarih için anonim müsaitlik sorgusu.
 *
 * GİZLİLİK MODELİ:
 * - Yalnızca TOPLANI sayı döndürür (kapasite, rezerve pax, kalan koltuk,
 *   durum etiketi). Müşteri adı/telefon/otel gibi bireysel veri ASLA
 *   dönmez — `/api/bookings`'ten farkı budur; bu yüzden guard yok.
 * - Rate limit: IP başına 30 istek/dk (tour-views ile aynı desen).
 * - Yanıt 60 sn cache'lenir; admin yeni rezervasyon girse bile halka
 *   açık gösterge en geç 1 dk sonra tazelenir (sayfalarla aynı SLA).
 *
 * GET /api/tour-availability?tour=<title>&date=YYYY-MM-DD
 *   -> { ok: true, capacity, bookedPax, remainingSeats, status, label }
 *
 * Bulut yapılandırılmamışsa `unknown` durumu döner; istemci göstergesi
 * sessizce gizlenir (site müsaitliksiz de çalışır).
 */
import type { APIRoute } from 'astro';
import { checkRateLimit } from '../../lib/server/rateLimit';
import {
  getSupabaseAdmin,
  isSupabaseAdminConfigured,
} from '../../lib/server/supabaseAdmin';
import { rowToBooking } from '../../lib/supabase';
import { calculateTourOccupancy, getTourCapacity } from '../../lib/allotment';
import { AVAILABILITY_STATUS_LABELS } from '../../lib/availabilityLabels';
import { applyTourOverlay, getCloudTours } from '../../lib/server/tourContent';
import { getCollection } from 'astro:content';

export const prerender = false;

// Tur adı -> kapasite çözümü için content collection + bulut overlay.
// Doluluk `calculateTourOccupancy` başlık eşleşmesiyle hesaplandığından
// (admin tarafıyla aynı mantık) başlığın TAZE olmasına ihtiyaç duyarız;
// statik .md başlığı panelde değiştirilmişse bulut değeri kazanır.
let tourCache: { at: number; titles: Map<string, { title: string; maxCapacity?: number }> } | null = null;
const TOUR_CACHE_MS = 60_000;

async function resolveTourByKey(key: string): Promise<{ title: string; maxCapacity?: number } | null> {
  const now = Date.now();
  if (!tourCache || now - tourCache.at > TOUR_CACHE_MS) {
    try {
      const mdTours = await getCollection('tours');
      const cloudTours = await getCloudTours();
      const tours = applyTourOverlay(mdTours, cloudTours);
      tourCache = {
        at: now,
        titles: new Map(
          tours.map((t) => [t.id.toLowerCase(), { title: t.data.title, maxCapacity: (t.data as any).maxCapacity }]),
        ),
      };
    } catch {
      tourCache = { at: now, titles: new Map() };
    }
  }
  const k = key.toLowerCase();
  return tourCache.titles.get(k) || null;
}

const STATUS_LABELS = AVAILABILITY_STATUS_LABELS;

export const GET: APIRoute = async (context) => {
  const url = new URL(context.request.url);
  const tourKey = (url.searchParams.get('tour') || '').trim();
  const date = (url.searchParams.get('date') || '').trim();

  if (!tourKey || tourKey.length > 150) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid tour' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid date' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';
  const limiter = await checkRateLimit('tour-availability', clientIp, 30, 60);
  if (!limiter.allowed) {
    return new Response(JSON.stringify({ ok: false, error: 'Çok fazla istek.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Tur kaydını çöz (kapasite + güncel başlık); çözülmezse sadece ad üzerinden
  // sezgisel kapasiteyle devam — admin doluluk mantığıyla aynı davranış.
  const tour = await resolveTourByKey(tourKey);
  const title = tour?.title || tourKey;

  if (!isSupabaseAdminConfigured()) {
    return new Response(JSON.stringify({ ok: true, status: 'unknown', label: '' }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  }

  try {
    const db = getSupabaseAdmin();
    if (!db) throw new Error('DB client null');

    // Yalnızca ilgili tarihin satırlarını çek — tüm tabloyu indirmek yerine.
    // Satır şeması snake_case (tour_date); rowToBooking Booking'e çevirir.
    const { data, error } = await db
      .from('bookings')
      .select('*')
      .eq('tour_date', date);

    if (error) throw new Error(error.message);

    const bookings = (data ?? []).map(rowToBooking);
    const occupancy = calculateTourOccupancy(
      title,
      date,
      bookings,
      tour?.maxCapacity || getTourCapacity(title, undefined as any),
    );

    return new Response(
      JSON.stringify({
        ok: true,
        capacity: occupancy.capacity,
        bookedPax: occupancy.bookedPax,
        remainingSeats: occupancy.remainingSeats,
        status: occupancy.status,
        label: STATUS_LABELS[occupancy.status] || occupancy.statusLabel,
        // Bilgi: doluluk eşikleri calculateTourOccupancy içinde tanımlıdır
        // (available >%60 kalan, filling/critical/full).
      }),
      { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' } },
    );
  } catch (err) {
    // Halka açık yanıtta hata detayı sızmaz; yalnızca sunucu log'una düşer.
    console.warn('[tour-availability] query error:', err instanceof Error ? err.message : err);
    return new Response(JSON.stringify({ ok: true, status: 'unknown', label: '' }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  }
};
