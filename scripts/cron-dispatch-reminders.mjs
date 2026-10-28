#!/usr/bin/env node
/**
 * scripts/cron-dispatch-reminders.mjs — Ubuntu VPS Cron WhatsApp Görevi
 *
 * Her akşam 20:00'de (Phuket UTC+7) çalıştırılır:
 * - Yarınki turlara ait T-24 misafir ve şoför hatırlatmalarını tetikler.
 *
 * Kullanım:
 *   node scripts/cron-dispatch-reminders.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// .env dosyasını oku (dotenv bağımlılığı olmadan yerleşik parser)
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnv();

const PORT = process.env.PORT || 4321;
const HOST = process.env.HOST || '127.0.0.1';
const CRON_SECRET = process.env.CRON_SECRET || '';
const ENDPOINT = `http://${HOST}:${PORT}/api/whatsapp/dispatch-reminders`;

const now = new Date().toISOString();
console.log(`[${now}] [Cron] WhatsApp T-24 Hatırlatma görevi başlatılıyor...`);

try {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (CRON_SECRET) {
    headers['x-cron-secret'] = CRON_SECRET;
    headers['authorization'] = `Bearer ${CRON_SECRET}`;
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
  });

  const status = response.status;
  const data = await response.json().catch(() => ({}));

  if (response.ok) {
    console.log(`[${new Date().toISOString()}] [Cron] Başarılı (Status ${status}):`, JSON.stringify(data));
    process.exit(0);
  } else {
    console.error(`[${new Date().toISOString()}] [Cron] Hata (Status ${status}):`, JSON.stringify(data));
    process.exit(1);
  }
} catch (error) {
  console.error(`[${new Date().toISOString()}] [Cron] İstek başarısız:`, error.message);
  process.exit(1);
}
