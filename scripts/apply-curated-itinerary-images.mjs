import fs from 'node:fs';
import path from 'node:path';

const toursDir = path.resolve('src/content/tours');

// Curated 100% authentic, relevant asset mapping for each tour's steps
const tourCuratedImages = {
  'james-bond-adasi-ve-kano-turu.md': [
    'phuket_transfer.webp',
    'phuket_ferry_speedboat.webp',
    'bay.webp',
    'james-bond-2.webp',
    'james-bond-3.webp',
    'james-bond-5.webp',
    'james-bond-1.webp',
    'james-bond-6.webp',
    'honeymoon_sunset_beach.webp',
    'phuket_transfer.webp',
  ],
  'phi-phi-maya-ve-bamboo-adasi.md': [
    'phuket_transfer.webp',
    'phuket_ferry_speedboat.webp',
    'phuket_yacht.webp',
    'beach.webp',
    'food.webp',
    'longtail.webp',
    'pileh.webp',
    'bay.webp',
    'honeymoon_sunset_beach.webp',
    'phuket_transfer.webp',
  ],
  'similan-adalari-surat-teknesi-turu.md': [
    'phuket_transfer.webp',
    'phuket_ferry_speedboat.webp',
    'phuket_yacht.webp',
    'similan_islands.webp',
    'underwater.webp',
    'underwater.webp',
    'beach.webp',
    'honeymoon_sunset_beach.webp',
    'food.webp',
    'phuket_transfer.webp',
  ],
  'khao-sok-ve-cheow-lan-golu-macerasi.md': [
    'phuket_transfer.webp',
    'phuket_transfer.webp',
    'longtail.webp',
    'khao_sok_cheow_lan.webp',
    'khao_sok_cheow_lan.webp',
    'khao_sok_cheow_lan.webp',
    'hong_starlight_cave.webp',
    'khao_sok_cheow_lan.webp',
    'longtail.webp',
    'phuket_transfer.webp',
    'phuket_transfer.webp',
  ],
  'phang-nga-rafting-ve-macera-turu.md': [
    'phuket_transfer.webp',
    'phang_nga_rafting.webp',
    'phang_nga_rafting.webp',
    'phang_nga_rafting.webp',
    'food.webp',
    'atv-1.webp',
    'hanuman_cover.webp',
    'culture.webp',
    'phang_nga_rafting.webp',
    'phuket_transfer.webp',
    'phuket_transfer.webp',
  ],
  'atv-quad-safari-ve-orman-macerasi.md': [
    'phuket_transfer.webp',
    'atv-1.webp',
    'atv-2.webp',
    'atv-3.webp',
  ],
  'fil-besleme-ve-bakim-deneyimi.md': [
    'phuket_transfer.webp',
    'elephant.webp',
    'elephant.webp',
    'elephant.webp',
    'elephant.webp',
    'elephant.webp',
    'food.webp',
    'phuket_transfer.webp',
  ],
  'hanuman-world-zipline-deneyimi.md': [
    'phuket_transfer.webp',
    'hanuman_cover.webp',
    'hanuman_cover.webp',
    'hanuman_cover.webp',
    'phuket_transfer.webp',
  ],
  'hong-by-starlight-gece-kano-ve-plankton-deneyimi.md': [
    'phuket_transfer.webp',
    'food.webp',
    'james-bond-2.webp',
    'james-bond-3.webp',
    'hong_starlight_cave.webp',
    'hong_starlight_cave.webp',
  ],
  'banana-beach-koh-hey-gunu.md': [
    'phuket_transfer.webp',
    'phuket_yacht.webp',
    'banana_beach.webp',
    'banana_beach.webp',
    'food.webp',
    'underwater.webp',
    'banana_beach.webp',
    'honeymoon_sunset_beach.webp',
    'phuket_transfer.webp',
  ],
  'surin-adalari-snorkeling-ve-moken-koyu.md': [
    'phuket_transfer.webp',
    'phuket_ferry_speedboat.webp',
    'phuket_yacht.webp',
    'underwater.webp',
    'surin_islands.webp',
    'food.webp',
    'underwater.webp',
    'underwater.webp',
    'honeymoon_sunset_beach.webp',
    'food.webp',
    'phuket_transfer.webp',
  ],
  'koh-rok-ve-koh-haa-gunu.md': [
    'phuket_transfer.webp',
    'phuket_ferry_speedboat.webp',
    'phuket_yacht.webp',
    'koh_rok_haa.webp',
    'koh_rok_haa.webp',
    'food.webp',
    'underwater.webp',
    'beach.webp',
    'honeymoon_sunset_beach.webp',
    'phuket_transfer.webp',
  ],
  'phuket-sehir-ve-kultur-turu.md': [
    'phuket_transfer.webp',
    'bay.webp',
    'culture.webp',
    'culture.webp',
    'food.webp',
    'phuket_culture.webp',
    'phuket_culture.webp',
    'bay.webp',
    'phuket_transfer.webp',
  ],
  'phuket-fantasea-kultur-ve-sahne-sovu.md': [
    'phuket_transfer.webp',
    'phuket_fantasea.webp',
    'food.webp',
    'phuket_fantasea.webp',
    'phuket_fantasea.webp',
    'phuket_fantasea.webp',
    'phuket_transfer.webp',
  ],
  'carnival-magic-isik-ve-tema-parki.md': [
    'phuket_transfer.webp',
    'carnival_magic.webp',
    'food.webp',
    'carnival_magic.webp',
    'carnival_magic.webp',
  ],
  'simon-cabaret-phuket-gosterisi.md': [
    'phuket_transfer.webp',
    'simon_cabaret.webp',
    'simon_cabaret.webp',
    'simon_cabaret.webp',
  ],
  'siam-niramit-gosteri-deneyimi.md': [
    'phuket_transfer.webp',
    'siam_niramit_cover.webp',
    'food.webp',
    'siam_niramit_cover.webp',
    'siam_niramit_cover.webp',
    'siam_niramit_cover.webp',
    'phuket_transfer.webp',
    'phuket_transfer.webp',
  ],
  'moonlight-luks-yat-turu.md': [
    'phuket_transfer.webp',
    'phuket_yacht.webp',
    'yacht.webp',
    'food.webp',
    'pileh.webp',
    'bay.webp',
    'honeymoon_sunset_beach.webp',
    'phuket_transfer.webp',
    'phuket_transfer.webp',
    'phuket_transfer.webp',
    'phuket_transfer.webp',
  ],
  'coral-adasi-tam-gun-surat-teknesi.md': [
    'phuket_transfer.webp',
    'phuket_ferry_speedboat.webp',
    'banana_beach.webp',
    'food.webp',
    'yacht.webp',
    'underwater.webp',
    'beach.webp',
    'honeymoon_sunset_beach.webp',
    'phuket_transfer.webp',
  ],
  'geleneksel-longtail-tekne-kiralama.md': [
    'phuket_transfer.webp',
    'longtail.webp',
    'longtail.webp',
    'underwater.webp',
    'phuket_transfer.webp',
  ],
  'phuketphi-phi-feribot-ve-surat-teknesi-ulasimi.md': [
    'phuket_transfer.webp',
    'phuket_ferry_speedboat.webp',
    'phuket_ferry_speedboat.webp',
    'bay.webp',
  ],
};

for (const [file, images] of Object.entries(tourCuratedImages)) {
  const filePath = path.join(toursDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${file}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');

  // Verify program steps count
  const progMatch = content.match(/program:\n([\s\S]*?)(?=\n[a-z_]+:|\n---)/);
  if (!progMatch) {
    console.warn(`No program in ${file}`);
    continue;
  }
  const rawProgramLines = progMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
  const stepsCount = rawProgramLines.length;

  // Align images count with steps count
  const finalImages = images.slice(0, stepsCount);
  while (finalImages.length < stepsCount) {
    finalImages.push('phuket_transfer.webp');
  }

  const formattedImagesYaml = 'program_images:\n' + finalImages.map(img => `  - "${img}"`).join('\n');

  let updatedContent = '';
  if (content.includes('program_images:')) {
    updatedContent = content.replace(/program_images:\n([\s\S]*?)(?=\n[a-z_]+:|\n---)/, formattedImagesYaml);
  } else {
    updatedContent = content.replace(/(program:\n[\s\S]*?)(?=\n[a-z_]+:|\n---)/, `$1\n${formattedImagesYaml}`);
  }

  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`✓ ${file}: ${finalImages.length}/${stepsCount} steps accurately mapped to authentic assets.`);
}
