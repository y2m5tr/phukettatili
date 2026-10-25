import type { APIRoute } from 'astro';
import { jsonError } from '../../lib/server/apiGuard';
import { checkRateLimit } from '../../lib/server/rateLimit';
import { getSupabaseAdmin, isSupabaseAdminConfigured } from '../../lib/server/supabaseAdmin';

export const prerender = false;

// In-memory fallback and buffer
const memViews: Record<string, number> = {};

export const GET: APIRoute = async () => {
  if (!isSupabaseAdminConfigured()) {
    return new Response(JSON.stringify({ views: memViews }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  }

  try {
    const db = getSupabaseAdmin();
    if (!db) throw new Error('DB client null');
    const { data } = await db
      .from('content_store')
      .select('data')
      .eq('key', 'tour-views')
      .maybeSingle();

    const views = (data?.data as Record<string, number>) || memViews;
    return new Response(JSON.stringify({ views }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  } catch {
    return new Response(JSON.stringify({ views: memViews }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    });
  }
};

export const POST: APIRoute = async (context) => {
  // IP başına dakika limiti: sınırsız sayaç, popülerlik sinyalini
  // döngüyle şişirmeye açıktı (public-booking/guest-checkin ile aynı desen).
  const clientIp =
    context.clientAddress ||
    (context.request.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';

  const limiter = await checkRateLimit('tour-views', clientIp, 30, 60);
  if (!limiter.allowed) {
    return jsonError(429, 'Çok fazla istek. Lütfen biraz sonra tekrar deneyiniz.');
  }

  const { request } = context;
  let id = '';
  try {
    const body = await request.json();
    id = typeof body.id === 'string' ? body.id.trim() : '';
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!id || id.length > 100) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid tour ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update in-memory
  memViews[id] = (memViews[id] || 0) + 1;

  if (isSupabaseAdminConfigured()) {
    try {
      const db = getSupabaseAdmin();
      if (db) {
        // Atomik sayaç: tek RPC çağrısı DB tarafında artırır ve yeni değeri
        // döndürür. Eski select→+1→upsert akışı eşzamanlı isteklerde
        // güncelleme kaybettiriyordu (bkz. supabase-schema.sql §9).
        const { data: rpcCount, error: rpcError } = await db.rpc('increment_tour_view', {
          tour_id: id,
        });
        if (!rpcError && typeof rpcCount === 'number') {
          memViews[id] = rpcCount;
        } else if (rpcError && /increment_tour_view/i.test(rpcError.message || '')) {
          // Fonksiyon prod DB'ye henüz uygulanmamış → eski yola düş (veri kaybı
          // olmasın); şema güncellendiğinde bu dal kendiliğinden ölür.
          const { data: row } = await db
            .from('content_store')
            .select('data')
            .eq('key', 'tour-views')
            .maybeSingle();

          const current = (row?.data as Record<string, number>) || {};
          current[id] = (current[id] || 0) + 1;

          await db.from('content_store').upsert({
            key: 'tour-views',
            data: current,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } else if (rpcError) {
          console.warn('[tour-views] RPC error:', rpcError.message);
        }
      }
    } catch (err) {
      // Background count failure shouldn't throw 500
      console.warn('[tour-views] Counter write error:', err);
    }
  }

  return new Response(JSON.stringify({ ok: true, id, views: memViews[id] }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
