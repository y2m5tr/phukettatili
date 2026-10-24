/**
 * Tur düzenleyicide yeniden kullanılan dahil/hariç havuzu.
 *
 * Bu havuz tur kayıtlarından BAĞIMSIZDIR: bir tura madde eklemek havuza da
 * yazar, ama maddeyi turdan çıkarmak havuzdan SİLMEZ. Böylece bir turda
 * kullanılan seçenek başka turlarda da önerilmeye devam eder.
 *
 * Bozuk bulut/yerel kayıt (string dizisi olmayan alan) havuzu çökertmesin
 * diye tüm okuma normalizeOptionLibrary'den geçer.
 */

export type OptionKind = 'included' | 'excluded';

export interface OptionLibrary {
  included: string[];
  excluded: string[];
}

export const EMPTY_OPTION_LIBRARY: OptionLibrary = { included: [], excluded: [] };

function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

/** Herhangi bir kaydı geçerli bir havuza çevirir; bozuk alanları boş listeye düşürür. */
export function normalizeOptionLibrary(value: unknown): OptionLibrary {
  if (!value || typeof value !== 'object') return { ...EMPTY_OPTION_LIBRARY };
  const record = value as Record<string, unknown>;
  return {
    included: normalizeList(record.included),
    excluded: normalizeList(record.excluded),
  };
}

/**
 * Havuza madde ekler. Zaten varsa (aynı referansla) geri döner, böylece
 * gereksiz bulut yazımı ve yeniden render tetiklenmez.
 */
export function rememberOption(
  library: OptionLibrary,
  kind: OptionKind,
  raw: string
): OptionLibrary {
  const value = raw.trim();
  if (!value) return library;
  const current = library[kind];
  if (current.includes(value)) return library;
  return { ...library, [kind]: [...current, value] };
}

/**
 * Havuzdan madde siler. Yoksa (aynı referansla) geri döner.
 */
export function forgetOption(
  library: OptionLibrary,
  kind: OptionKind,
  raw: string
): OptionLibrary {
  const value = raw.trim();
  const current = library[kind];
  if (!current.includes(value)) return library;
  return { ...library, [kind]: current.filter((x) => x !== value) };
}

/**
 * Tura eklenecekleri havuzla birleştirir: kayıtlı havuz + şablonlar +
 * mevcut turlarda kullanılan maddeler. Tekrarlar ayıklanır, sıra korunur.
 */
export function mergeOptionSources(
  library: OptionLibrary,
  kind: OptionKind,
  preset: readonly string[],
  tours: readonly { included?: string[]; excluded?: string[] }[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (item: unknown) => {
    if (typeof item !== 'string') return;
    const trimmed = item.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    out.push(trimmed);
  };

  preset.forEach(add);
  library[kind].forEach(add);
  tours.forEach((tour) => (tour[kind] || []).forEach(add));
  return out;
}
