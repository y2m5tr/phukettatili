#!/usr/bin/env node
/**
 * İlk yönetici (owner) hesabını oluşturur.
 *
 * Kullanım:
 *   node scripts/create-admin.mjs <kullaniciadi> <sifre> [adSoyad]
 *
 * Örnek:
 *   node scripts/create-admin.mjs ymg 'CokGizli-Sifre-2026!' 'Yasin Yönetici'
 *
 * Gereksinim: .env dosyasında SUPABASE_SERVICE_ROLE_KEY ve
 * PUBLIC_SUPABASE_URL tanımlı olmalı (Supabase şeması — users tablosu —
 * SQL Editor'da çalıştırılmış olmalı).
 *
 * Script idempotent DEĞİL: aynı kullanıcı adıyla ikinci kez çalıştırınca
 * "zaten alınmış" uyarısı verir ve mevcut hesabı DEĞİŞTİRMEZ.
 */
import { readFileSync, existsSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);

// --- .env oku (basit parser — dotenv bağımlılığı gerekmez) ---
function readEnv() {
  const env = {};
  if (!existsSync('.env')) return env;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = { ...readEnv(), ...process.env };

const [username, password, fullNameArg] = process.argv.slice(2);
if (!username || !password) {
  console.error('Kullanım: node scripts/create-admin.mjs <kullaniciadi> <sifre> [adSoyad]');
  process.exit(1);
}

const fullName = fullNameArg || 'Yönetici';

if (password.length < 6) {
  console.error('HATA: Şifre en az 6 karakter olmalı.');
  process.exit(1);
}
if (password.length < 10 || !/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(password) || !/[0-9]/.test(password)) {
  console.warn('⚠️ UYARI: Şifre 10 karakterden kısa veya harf+rakam kombinasyonu içermiyor; yine de oluşturuluyor.');
}

const url = env.PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('HATA: .env içinde PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.');
  process.exit(1);
}

// --- scrypt hash (src/lib/server/passwords.ts ile aynı biçim) ---
async function hashPassword(pass) {
  const salt = randomBytes(16);
  const derived = await scrypt(pass.normalize('NFKC'), salt, 64);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

const db = createClient(url, serviceKey, { auth: { persistSession: false } });

const passwordHash = await hashPassword(password);
const cleanUsername = username.trim().toLowerCase();

// Önce users tablosu var mı diye dene — net hata mesajı ver.
const { data: existing, error: existingErr } = await db
  .from('users')
  .select('id')
  .eq('username', cleanUsername)
  .maybeSingle();

if (existingErr) {
  console.error('HATA: users tablosuna erişilemedi. supabase-schema.sql çalıştırılmış mı?');
  console.error('  Detay:', existingErr.message);
  process.exit(1);
}
if (existing) {
  console.error(`HATA: "${cleanUsername}" kullanıcı adı zaten var. Mevcut hesap değiştirilmedi.`);
  process.exit(1);
}

const { error } = await db
  .from('users')
  .insert({ username: cleanUsername, full_name: fullName, role: 'owner', password_hash: passwordHash });

if (error) {
  console.error('HATA: Kullanıcı oluşturulamadı:', error.message);
  process.exit(1);
}

console.log(`✅ Owner hesabı oluşturuldu: ${cleanUsername} (${fullName})`);
console.log('   Giriş: /ops-login → "Üyelik ile giriş" sekmesi.');
