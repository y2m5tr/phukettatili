#!/usr/bin/env node
/**
 * 500 satır kuralı bekçisi (CLAUDE.md: "Keep files under 500 lines").
 *
 * Kullanım:
 *   node scripts/check-file-size.mjs          # ihlal varsa exit 1
 *   MAX_LINES=600 node scripts/check-file-size.mjs  # eşik override (CI için değil)
 *
 * src/ altındaki .ts/.tsx/.astro dosyalarını tarar (.css kapsam dışı — aşağıya
 * bak). Sınırı AŞAN (> 500, 500 değil) her dosyayı listeler ve süreç kodunu
 * 1 yapar — CI'da `npm run check` zincirine bağlıdır, kural ihlali build'i kırar.
 *
 * Bilinen istisna listesi YOKTUR: kural ihlal edilmişse ya dosya bölünür
 * ya da bu script'in eşiği bilinçli bir kararla (commit mesajında gerekçeli)
 * değiştirilir. 2026-10-26 itibarıyla repo temiz: en büyük dosya 499 satır.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');
const MAX_LINES = Number(process.env.MAX_LINES ?? 500);
// .css bilinçli olarak KAPSAM DIŞI (2026-10-26 kullanıcı kararı): global.css
// 514 satır ama tek parça durması cascade/okuma sırası açısından daha güvenli;
// kuralın hedefi dev bileşen/modül dosyaları.
const EXTENSIONS = new Set(['.ts', '.tsx', '.astro']);

/** src/ altında verilen uzantılara sahip dosyaların yollarını toplar. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')))) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];
for (const file of walk(SRC)) {
  // wc -l ile aynı sayım: satır sonu karakteri sayısı (son satır newline ile
  // bitiyorsa split('\n').length bir fazla sayar).
  const content = readFileSync(file, 'utf-8');
  let lines = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '\n') lines++;
  }
  if (!content.endsWith('\n') && content.length > 0) lines++;
  if (lines > MAX_LINES) {
    violations.push({ file: relative(ROOT, file), lines });
  }
}

if (violations.length > 0) {
  violations.sort((a, b) => b.lines - a.lines);
  console.error(`✗ ${MAX_LINES} satır kuralı ihlali (${violations.length} dosya):`);
  for (const v of violations) {
    console.error(`  ${v.lines} satır — ${v.file}`);
  }
  console.error('Dosyaları modüllere bölün (örnek pattern: src/components/admin/finance/).');
  process.exit(1);
}

console.log(`✓ ${MAX_LINES} satır kuralı temiz (src/ tarandı).`);
