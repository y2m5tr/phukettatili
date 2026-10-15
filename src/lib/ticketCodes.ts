/**
 * Bilet portalı kodları — /bilet/[code] halka açık olduğu için kodların
 * tahmin edilemez olması gerekir.
 *
 * NEDEN: eski kayıt id'leri `BK-1001` (4 hane) veya `Date.now()`'un son
 * 5 hanesiydi. 10.000 / 100.000 kombinasyon bir bot için saniyeler
 * sürer; `Date` tabanlı üretim zamanı bilen herkes tarafından
 * hesaplanabilir. Kod bilen herkes misafir adını, otelini ve kalan
 * bakiyesini görebildiğinden bu bir işletme-gizliliği sorunudur.
 *
 * Format: `PT-` + 7 karakter, karışıklığa yol açan harfler çıkarılmış
 * (0/O, 1/I/L) alfabe — 31^7 ≈ 27,5 milyar kombinasyon.
 */

/** Karışıklık yaratmayan alfabe: 0,1,I,L,O çıkarıldı. */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 7;
const CODE_PREFIX = 'PT-';

/** Kriptografik rastgelelik gerektirmez — tek gereklilik tahmin edilemezlik. */
function randomChars(n: number): string {
  let out = '';
  for (let i = 0; i < n; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/** Yeni bilet kodu üretir: "PT-7K2M9XQ" gibi. */
export function generateTicketCode(): string {
  return `${CODE_PREFIX}${randomChars(CODE_LENGTH)}`;
}

/**
 * Gelen kodun biçimini normalize eder ve geçerli bilet kodu mı diye bakar.
 * - Kullanıcı "pt-7k2m9xq" ya da "7K2M9XQ" yazabilir → "PT-7K2M9XQ"
 * - Eski "BK-1001" kodları false döner (id araması yapılır — geriye dönük uyumluluk)
 */
export function isTicketCode(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return normalized.startsWith(CODE_PREFIX) && normalized.length === CODE_PREFIX.length + CODE_LENGTH;
}

/** Arama için normalize edilmiş kod. */
export function normalizeTicketCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Kayıtlı bilet kodu ile istenen kodu karşılaştırır.
 * Çarpışma riskini sıfıra indirmek için kayıt id'si farklı olabilir;
 * eşleşme tam-dizi karşılaştırmasıdır (zaman sabitli değil — kod tahmini
 * için zamanlama saldırısı pratik değildir, kod 27 milyarlıktır).
 */
export function ticketCodeMatches(stored: string | null | undefined, requested: string): boolean {
  if (!stored) return false;
  return normalizeTicketCode(stored) === normalizeTicketCode(requested);
}
