/**
 * Sunucu tarafı Supabase istemcisi — servis rolü anahtarı ile.
 *
 * Bu anahtar RLS'i BYPASS eder: veritabanındaki her şeye okuma/yazma
 * hakkı verir. Bu yüzden dosya adında "Admin" vurgusu var ve bu modül
 * YALNIZCA /api/* route'larından import edilebilir. Client bundle'a
 * girmesi durumunda tüm tablolar anon erişimine açık hale gelir.
 *
 * Anahtar kaynağı: astro:env (context: 'server', access: 'secret') —
 * değer build çıktısına gömülmez, her istekte runtime'da okunur.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSecret } from 'astro:env/server';

let cachedClient: SupabaseClient | null = null;
let cachedClientUrl = '';

/** Proje URL'si public bir bilgidir; client ile aynı kaynaktan okunur. */
function resolveUrl(): string {
  // PUBLIC_SUPABASE_URL (şemada tanımlı, secret) → SUPABASE_URL takma adı →
  // process.env. Local'de .env'den, Vercel'de runtime env'den gelir.
  try {
    const fromEnv = getSecret('PUBLIC_SUPABASE_URL');
    if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) return fromEnv.trim();
  } catch { /* şema yoksa düş */ }
  for (const c of [process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL]) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim();
  }
  return '';
}

function resolveServiceKey(): string {
  try {
    const fromEnv = getSecret('SUPABASE_SERVICE_ROLE_KEY');
    if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) return fromEnv.trim();
  } catch { /* şema tanımlı değilse düş */ }
  const processKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (processKey && processKey.trim().length > 0) return processKey.trim();
  return '';
}

/** Servis anahtarı sunucuda tanımlı mı? (Değer asla döndürülmez.) */
export function isSupabaseAdminConfigured(): boolean {
  return resolveUrl().length > 0 && resolveServiceKey().length > 0;
}

/**
 * Servis rolü istemcisi. Anahtar tanımlı değilse null döner —
 * çağıran route veriler olmadan açık kalır, sessizce kilitli olmaz.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = resolveUrl();
  const key = resolveServiceKey();
  if (!url || !key) return null;
  if (cachedClient && cachedClientUrl === url) return cachedClient;
  cachedClient = createClient(url, key, {
    auth: {
      // Sunucu tarafında oturum yönetimi gerekmez; servis anahtarı
      // zaten tam yetki taşır.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  cachedClientUrl = url;
  return cachedClient;
}

/**
 * Broadcast sinyali: "bookings tablosu değişti".
 *
 * ÖNEMLİ: payload'da MÜŞTERİ VERİSİ TAŞINMAZ — yalnızca kaynak ve
 * revizyon numarası. Dinen sinyal dinleyen client (paneller) değişikliği
 * görür görmez /api/bookings üzerinden AUTHENTICATED olarak yeniden
 * çeker. Böylece realtime websocket'i canlılık için kullanılırken
 * veri yolu kapalı kalır.
 */
const BOOKINGS_SIGNAL_CHANNEL = 'bookings-changed';

export async function broadcastBookingsChanged(source: 'admin' | 'field'): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  try {
    await admin.channel(BOOKINGS_SIGNAL_CHANNEL).send({
      type: 'broadcast',
      event: 'changed',
      payload: { source, rev: Date.now() },
    });
  } catch {
    // Sinyal başarısız olursa veri yazımı yine tamamlanmış sayılır;
    // client'lar bir sonraki görünürlük/interval yenilemesinde yakalar.
  }
}
