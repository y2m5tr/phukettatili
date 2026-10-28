#!/usr/bin/env node
/**
 * Responsive görsel varyantı üretici.
 *
 * public/assets/*.webp içindeki geniş görseller (>=900px) için 640px genişlikte
 * mobil varyant üretir: `bay.webp` -> `bay-640.webp`. Orijinal dosyaya dokunmaz;
 * varyant zaten varsa ve kaynaktan yeniyse yeniden üretir.
 *
 * Kullanım:  node scripts/generate-responsive-images.mjs [--force]
 * CI'da koşmaz; görsel eklendiğinde elle çalıştırılır (bkz. README/memory notu).
 *
 * Not: Pillow gerektirir (python3 -c "import PIL"). Projenin dev
 * bağımlılıklarından değildir; elle çalıştırılan bir bakım aracıdır.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, statSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';


const ASSETS_DIR = 'public/assets';
const TARGET_WIDTH = 640;
const MIN_SOURCE_WIDTH = 900; // zaten dar olan görsellere varyant üretme
const force = process.argv.includes('--force');

// Varyantı olası dosyalar — hero/LCP ve kart görselleri. Galerideki çoklu
// adım görselleri (james-bond-*, atv-*) 800px zaten; onlar hariç.
const candidates = process.argv
  .slice(2)
  .filter((a) => !a.startsWith('--'))
  .map((a) => basename(a));

const files = candidates.length
  ? candidates
  : (await import('node:fs')).readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.webp'));

const script = `
from PIL import Image
import sys, os
import pillow_avif

src, dst, target_w = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src)
w, h = im.size
if w < target_w:
    print("SKIP-NARROW")
    sys.exit(0)
nw = target_w
nh = round(h * nw / w)
im2 = im.resize((nw, nh), Image.LANCZOS)
im2.save(dst, "AVIF", quality=60, speed=6)
print(f"OK {nw}x{nh} {os.path.getsize(dst)//1024}KB")
`;

// Geçici python script'ini yaz
const tmp = join(ASSETS_DIR, '.resize_tmp.py');
writeFileSync(tmp, script);

let produced = 0;
let skipped = 0;
try {
  for (const file of files) {
    const src = join(ASSETS_DIR, file);
    if (!existsSync(src)) {
      console.error(`✗ ${file}: bulunamadı`);
      continue;
    }
    const width = parseInt(
      execFileSync('python3', ['-c', `from PIL import Image; print(Image.open('${src}').size[0])`], {
        encoding: 'utf8',
      }).trim(),
      10,
    );

    if (width < MIN_SOURCE_WIDTH) {
      console.log(`- ${file}: ${width}px zaten dar, atlandı`);
      skipped++;
      continue;
    }

    const dst = join(ASSETS_DIR, file.replace('.webp', `-${TARGET_WIDTH}.avif`));
    const srcMtime = statSync(src).mtimeMs;
    const dstMtime = existsSync(dst) ? statSync(dst).mtimeMs : 0;

    if (!force && dstMtime > srcMtime) {
      console.log(`= ${basename(dst)} güncel, atlandı`);
      continue;
    }

    const out = execFileSync(
      'python3',
      [tmp, src, dst, String(TARGET_WIDTH)],
      { encoding: 'utf8' },
    ).trim();
    console.log(`${out.startsWith('OK') ? '✓' : '-'} ${file} -> ${basename(dst)}: ${out}`);
    if (out.startsWith('OK')) produced++;
  }
} finally {
  // Geçici dosyayı temizle
  try {
    (await import('node:fs')).unlinkSync(tmp);
  } catch {}
}

console.log(`\n${produced} varyant üretildi, ${skipped} dar görsel atlandı.`);
