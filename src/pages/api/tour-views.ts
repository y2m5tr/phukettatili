import type { APIRoute } from 'astro';
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

export const POST: APIRoute = async ({ request }) => {
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
