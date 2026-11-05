import fs from 'node:fs';
import path from 'node:path';

const toursDir = path.resolve('src/content/tours');
const files = fs.readdirSync(toursDir).filter(f => f.endsWith('.md'));

function getContextualImage(desc, tourSlug, idx) {
  const text = (desc || '').toLowerCase();

  // Otel transferleri
  if (idx === 0 || text.includes('otel') || text.includes('alınış') || text.includes('servis')) {
    return 'itinerary/hotel_transfer.webp';
  }

  // İskele & Karşılama
  if (text.includes('iskele') || text.includes('marina') || text.includes('brifing') || text.includes('karşılama') || text.includes('kahvaltı') || text.includes('atıştırmalık') || text.includes('check-in')) {
    return 'itinerary/pier_lounge.webp';
  }

  // ATV
  if (tourSlug.includes('atv') || text.includes('atv') || text.includes('quad') || text.includes('motor')) {
    const atvImgs = ['atv-1.webp', 'atv-2.webp', 'atv-3.webp'];
    return atvImgs[idx % atvImgs.length];
  }

  // Fil Turu
  if (tourSlug.includes('fil') || text.includes('fil') || text.includes('kerchor') || text.includes('besleme')) {
    return 'itinerary/elephant_mud_bath.webp';
  }

  // Hanuman Zipline
  if (tourSlug.includes('zipline') || tourSlug.includes('hanuman') || text.includes('zipline') || text.includes('köprü') || text.includes('canopy')) {
    return 'itinerary/zipline_canopy_bridge.webp';
  }

  // Rafting
  if (tourSlug.includes('rafting') || text.includes('rafting') || text.includes('akarsu') || text.includes('kürek')) {
    return 'itinerary/whitewater_rafting_rapid.webp';
  }

  // Khao Sok / Cheow Lan
  if (tourSlug.includes('khao-sok') || text.includes('cheow lan') || text.includes('göl') || text.includes('bungalov')) {
    return 'itinerary/cheow_lan_lake_raft.webp';
  }

  // James Bond
  if (text.includes('james bond') || text.includes('khao tapu') || text.includes('khao phing') || text.includes('altın tabancalı')) {
    return 'james-bond-1.webp';
  }
  if (text.includes('panyi') || text.includes('yüzen köy')) {
    return 'itinerary/koh_panyi_stilt_village.webp';
  }
  if (text.includes('panak') || text.includes('hong') || text.includes('kano') || text.includes('mağara')) {
    return 'itinerary/sea_kayak_cave.webp';
  }

  // Gösteri / Şov Turları
  if (tourSlug.includes('fantasea')) return 'phuket_fantasea.webp';
  if (tourSlug.includes('carnival')) return 'carnival_magic.webp';
  if (tourSlug.includes('simon')) return 'simon_cabaret.webp';
  if (tourSlug.includes('siam-niramit')) return 'siam_niramit_cover.webp';

  // Şehir Turu
  if (text.includes('old town') || text.includes('şehir') || text.includes('sino')) {
    return 'itinerary/old_phuket_heritage.webp';
  }
  if (text.includes('buddha') || text.includes('wat') || text.includes('tapınak')) {
    return 'itinerary/big_buddha_temple.webp';
  }

  // Similan / Surin
  if (text.includes('sailing rock') || text.includes('yelken kaya') || (tourSlug.includes('similan') && text.includes('ada no.8'))) {
    return 'itinerary/sailing_rock_view.webp';
  }
  if (text.includes('kaplumbağa') || text.includes('turtle')) {
    return 'itinerary/sea_turtle_reef.webp';
  }

  // Phi Phi & Maya Bay
  if (text.includes('maya bay') || text.includes('pileh') || text.includes('lagün')) {
    return 'itinerary/maya_bay_lagoon.webp';
  }
  if (text.includes('maymun') || text.includes('monkey')) {
    return 'itinerary/monkey_beach_wild.webp';
  }
  if (text.includes('bamboo')) {
    return 'itinerary/white_sand_beach.webp';
  }

  // Şnorkel & Sualtı
  if (text.includes('şnorkel') || text.includes('mercan') || text.includes('resif') || text.includes('balık')) {
    return 'itinerary/tropical_reef_fish.webp';
  }

  // Yemek
  if (text.includes('öğle yemeği') || text.includes('yemek') || text.includes('açık büfe') || text.includes('restoran')) {
    return 'itinerary/thai_buffet_lunch.webp';
  }

  // Plaj & Deniz & Paddleboard
  if (text.includes('plaj') || text.includes('kumsal') || text.includes('yüzme') || text.includes('paddleboard')) {
    return 'itinerary/white_sand_beach.webp';
  }

  // Dönüş & Akşam
  if (text.includes('dönüş') || text.includes('sunset') || text.includes('gün batımı')) {
    return 'itinerary/sunset_sea_cruise.webp';
  }

  // Tekne hareketi
  if (text.includes('sürat teknesi') || text.includes('katamaran') || text.includes('hareket') || text.includes('seyir')) {
    return 'itinerary/speedboat_sea.webp';
  }

  return 'itinerary/white_sand_beach.webp';
}

for (const file of files) {
  const filePath = path.join(toursDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const slug = file.replace('.md', '');

  // Extract program array
  const progMatch = content.match(/program:\n([\s\S]*?)(?=\n[a-z_]+:|\n---)/);
  if (!progMatch) {
    console.log(`Skipping ${file}: no program found`);
    continue;
  }

  const rawProgramLines = progMatch[1].split('\n').filter(l => l.trim().startsWith('-'));
  const programSteps = rawProgramLines.map(l => l.trim().replace(/^-\s*["']?/, '').replace(/["']?$/, ''));

  const generatedImages = programSteps.map((step, idx) => {
    return getContextualImage(step, slug, idx);
  });

  const formattedImagesYaml = 'program_images:\n' + generatedImages.map(img => `  - "${img}"`).join('\n');

  let updatedContent = '';
  if (content.includes('program_images:')) {
    // Replace existing program_images block
    updatedContent = content.replace(/program_images:\n([\s\S]*?)(?=\n[a-z_]+:|\n---)/, formattedImagesYaml);
  } else {
    // Insert right after program block
    updatedContent = content.replace(/(program:\n[\s\S]*?)(?=\n[a-z_]+:|\n---)/, `$1\n${formattedImagesYaml}`);
  }

  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Updated ${file}: ${generatedImages.length} step images added.`);
}
