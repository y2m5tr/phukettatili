import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const outputDir = path.resolve('public/assets/itinerary');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Curated royalty-free Unsplash photography for Phuket itineraries
const imagesToFetch = [
  {
    name: 'hotel_transfer.webp',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'pier_lounge.webp',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'speedboat_sea.webp',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'sea_kayak_cave.webp',
    url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'thai_buffet_lunch.webp',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'sea_turtle_reef.webp',
    url: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'tropical_reef_fish.webp',
    url: 'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'sailing_rock_view.webp',
    url: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'white_sand_beach.webp',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'maya_bay_lagoon.webp',
    url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'monkey_beach_wild.webp',
    url: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'sunset_sea_cruise.webp',
    url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'elephant_mud_bath.webp',
    url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'zipline_canopy_bridge.webp',
    url: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'whitewater_rafting_rapid.webp',
    url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'cheow_lan_lake_raft.webp',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'koh_panyi_stilt_village.webp',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'old_phuket_heritage.webp',
    url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'big_buddha_temple.webp',
    url: 'https://images.unsplash.com/photo-1563492065599-3580f7779066?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'paddleboard_clear_water.webp',
    url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80',
  },
];

async function run() {
  for (const item of imagesToFetch) {
    const dest = path.join(outputDir, item.name);
    if (fs.existsSync(dest)) {
      console.log(`Already exists: ${item.name}`);
      continue;
    }
    try {
      console.log(`Downloading ${item.name}...`);
      const resp = await fetch(item.url);
      if (!resp.ok) {
        console.warn(`Failed to fetch ${item.url}: status ${resp.status}`);
        continue;
      }
      const buffer = Buffer.from(await resp.arrayBuffer());
      await sharp(buffer)
        .resize({ width: 600, height: 400, fit: 'cover', position: 'center' })
        .webp({ quality: 80 })
        .toFile(dest);
      console.log(`Saved: ${item.name} (${Math.round(fs.statSync(dest).size / 1024)} KB)`);
    } catch (err) {
      console.error(`Error processing ${item.name}:`, err.message);
    }
  }
}

run();
