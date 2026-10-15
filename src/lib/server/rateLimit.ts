/**
 * Kalıcı hız limiti — Supabase `rate_limits` tablosu üzerinde.
 *
 * Neden tablo? Serverless'ta module-level Map her lambda instance'ında
 * ayrı yaşar; dağıtık brute-force trafiğini sayamaz. Bu sayaç tablo
 * üzerinde tek gerçek kaynaktır — tüm instance'lar aynı satırı görür.
 *
 * Kullanım (yalnızca sunucu API uçlarında):
 *   const verdict = await checkRateLimit('login', ip, 5, 15 * 60);
 *   if (!verdict.allowed) return 429...
 *
 * Bulut yapılandırılmamışsa PERMIT döner (fail-open) ve auth.ts'teki
 * in-memory limiter tek savunma olarak çalışmaya devam eder — sessiz
 * yanlış güvenlik yerine bilinçli kademeli yedek.
 */
import { getSupabaseAdmin, isSupabaseAdminConfigured } from './supabaseAdmin';

export interface RateVerdict {
  allowed: boolean;
  /** Limit aşıldıysa beklenmesi gereken saniye. */
  retryAfterSeconds: number;
  /** Bu istek sayıldı mı (bulut kapalıysa false). */
  counted: boolean;
}

export async function checkRateLimit(
  purpose: string,
  identity: string,
  max: number,
  windowSeconds: number,
): Promise<RateVerdict> {
  const pass: RateVerdict = { allowed: true, retryAfterSeconds: 0, counted: false };
  if (!isSupabaseAdminConfigured()) return pass;

  const db = getSupabaseAdmin();
  if (!db) return pass;

  const bucketKey = `${purpose}:${identity}`;
  const now = new Date();

  // Atomik artırma: rpc yerine upsert + geri okuma. Tek isteklik yarış
  // penceresi kabul edilebilir (brute-force sayaçları için kritik değil).
  const { data: existing } = await db
    .from('rate_limits')
    .select('count, reset_at')
    .eq('bucket_key', bucketKey)
    .maybeSingle();

  if (!existing || new Date(existing.reset_at) < now) {
    // Pencere doldu ya da ilk istek — sayacı yeniden başlat.
    await db
      .from('rate_limits')
      .upsert(
        { bucket_key: bucketKey, count: 1, reset_at: new Date(now.getTime() + windowSeconds * 1000).toISOString() },
        { onConflict: 'bucket_key' },
      );
    return { allowed: true, retryAfterSeconds: 0, counted: true };
  }

  if (existing.count >= max) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((new Date(existing.reset_at).getTime() - now.getTime()) / 1000),
    );
    return { allowed: false, retryAfterSeconds, counted: false };
  }

  await db
    .from('rate_limits')
    .update({ count: existing.count + 1 })
    .eq('bucket_key', bucketKey);
  return { allowed: true, retryAfterSeconds: 0, counted: true };
}

/** Başarılı girişte sayacı sıfırla (kalıcı limiter kullanılıyorsa). */
export async function clearRateLimit(purpose: string, identity: string): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;
  const db = getSupabaseAdmin();
  if (!db) return;
  await db.from('rate_limits').delete().eq('bucket_key', `${purpose}:${identity}`);
}
