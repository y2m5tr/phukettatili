import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSecret } from 'astro:env/server';

/**
 * Operasyon paneli oturum yönetimi — SADECE SUNUCU TARAFINDA çalışır.
 *
 * Şifre hiçbir zaman client bundle'a gömülmez: karşılaştırma middleware'de
 * yapılır, tarayıcıya yalnızca imzalı bir oturum çerezi gider.
 */

/** Oturum çerezi adı — /admin ve /ekip ortak kullanır. */
export const SESSION_COOKIE = 'ptt_ops_session';

/** Oturum ömrü: 12 saat. */
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

/** Panel rolleri. Rol çerezde taşınır ve imzayla korunur. */
export type OpsRole = 'admin' | 'field';

/** Çerez imza anahtarı, yönetici şifresinden türetilir (ayrı secret gerekmez). */
function signingSecret(): string {
  return `ptt-ops-v1:${readPasscode()}`;
}

/**
 * Yönetici şifresi — yalnızca sunucu tarafında, RUNTIME'da okunur.
 *
 * Okuma sırası:
 * 1. `astro:env/server` → `getSecret('ADMIN_PASSCODE')`. Bu, astro.config.mjs
 *    içindeki `env.schema` ile `secret: true` olarak tanımlıdır; Astro local'de
 *    .env'i okur, production'da ortam değişkenini runtime'da alır ve değeri
 *    BUILD ÇIKTISINA GÖMMEZ. Doğru mekanizma budur.
 * 2. `process.env.ADMIN_PASSCODE` — yedek (ör. doğrudan Node ile çalıştırma).
 *
 * ⚠️ `import.meta.env` KULLANILMAMALI: Vite bu ifadeyi derleme sırasında
 * .env'deki değerle birebir değiştirir (inline eder). Sonuçta şifre bundle'a
 * düz metin gömülür ve sunucuda değiştirildiğinde bile eski değer geçerli kalır.
 *
 * Bilinçli olarak yedek/varsayılan şifre YOKTUR: ADMIN_PASSCODE tanımlı
 * değilse panel kilitli kalır (fail-closed). Sessizce bilinen bir şifreyle
 * açılan panel, kilitli panelden çok daha tehlikelidir — çünkü fark edilmez.
 */
export function readPasscode(): string {
  try {
    const secret = getSecret('ADMIN_PASSCODE');
    if (typeof secret === 'string' && secret.trim().length > 0) {
      return secret.trim();
    }
  } catch {
    // Şema yüklenemediyse (ör. test ortamı) process.env'e düş
  }

  const envVal = process.env.ADMIN_PASSCODE;
  if (typeof envVal === 'string' && envVal.trim().length > 0) {
    return envVal.trim();
  }
  return '';
}

/**
 * Şifre tanımlı mı? Değilse paneller kilitli kalır ve giriş sayfası
 * kullanıcıya ne yapması gerektiğini söyler.
 */
export function isAuthConfigured(): boolean {
  return readPasscode().length > 0;
}

/** Uzunluk sızıntısı olmadan sabit zamanlı karşılaştırma. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Verilen şifre doğru mu? */
export function verifyPasscode(candidate: string): boolean {
  const expected = readPasscode();
  if (!expected) return false;
  return safeEqual(candidate.trim(), expected);
}

function sign(payload: string): string {
  return createHmac('sha256', signingSecret()).update(payload).digest('hex');
}

/** İmzalı oturum çerezi değeri üretir: `rol.bitmeZamani.imza` */
export function createSessionValue(role: OpsRole): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${role}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** Çerezi doğrular; geçerliyse rolü, değilse null döner. */
export function readSessionValue(value: string | undefined): OpsRole | null {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3) return null;

  const [role, rawExpiresAt, signature] = parts;
  if (role !== 'admin' && role !== 'field') return null;

  const expiresAt = Number(rawExpiresAt);
  if (!Number.isFinite(expiresAt)) return null;
  if (expiresAt * 1000 < Date.now()) return null;

  if (!safeEqual(signature, sign(`${role}.${rawExpiresAt}`))) return null;
  return role;
}

/* -------------------------------------------------------------------------
   Brute-force koruması
   Not: serverless ortamda sayaç instance başınadır, yani kabaca bir
   yavaşlatma sağlar. Kalıcı koruma için Vercel WAF / rate-limit önerilir.
   ------------------------------------------------------------------------- */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string): boolean {
  const bucket = attempts.get(key);
  if (!bucket) return false;
  if (bucket.resetAt < Date.now()) {
    attempts.delete(key);
    return false;
  }
  return bucket.count >= MAX_ATTEMPTS;
}

/** Kalan bekleme süresi (ms) — limit aşılmadıysa 0. */
export function retryAfterMs(key: string): number {
  const bucket = attempts.get(key);
  if (!bucket) return 0;
  return Math.max(0, bucket.resetAt - Date.now());
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const bucket = attempts.get(key);
  if (!bucket || bucket.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function clearFailures(key: string): void {
  attempts.delete(key);
}
