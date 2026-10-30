#!/usr/bin/env node
/**
 * scripts/cron-review-reminders.mjs — Ubuntu VPS Cron WhatsApp Yorum & Memnuniyet Görevi
 *
 * Her gün 12:00'de (Phuket UTC+7 / 05:00 UTC) çalıştırılır:
 * - Dün turu biten misafirlere T+24 Google & TripAdvisor yorum davetini iletir.
 *
 * Kullanım:
 *   node scripts/cron-review-reminders.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

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
const ENDPOINT = `http://${HOST}:${PORT}/api/whatsapp/review-reminders`;

const now = new Date().toISOString();
console.log(`[${now}] [Cron] WhatsApp T+24 Yorum Görevi başlatılıyor...`);

try {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (CRON_SECRET) {
    headers['x-cron-secret'] = CRON_SECRET;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`[${new Date().toISOString()}] [Cron] Başarısız HTTP ${res.status}:`, body);
    process.exit(1);
  }

  console.log(`[${new Date().toISOString()}] [Cron] Başarılı:`, body);
  process.exit(0);
} catch (err) {
  console.error(`[${new Date().toISOString()}] [Cron] İstek hatası:`, err);
  process.exit(1);
}
