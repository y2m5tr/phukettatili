/**
 * Şifre hash'leme — Node yerleşik scrypt (bcrypt bağımlılığı gerekmez).
 *
 * Biçim: 'scrypt$<saltHex>$<hashHex>'
 * - Salt: 16 bayt rastgele (kullanıcı başına benzersiz)
 * - Hash: scrypt(N=16384, r=8, p=1, 64 bayt çıktı)
 * - Doğrulama sabit zamanlı karşılaştırmayla yapılır.
 *
 * Bu modül YALNIZCA sunucuda çalışır (apiGuard deseninin parçası);
 * hash'leme fonksiyonları API uçlarında çağrılır, client'a asla gitmez.
 */
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/** Yeni şifre için hash üretir. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = (await scryptAsync(password.normalize('NFKC'), salt, KEY_LENGTH)) as Buffer;
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/** Aday şifre saklanan hash ile eşleşiyor mu? (sabit zamanlı) */
export async function verifyPassword(candidate: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expected = Buffer.from(parts[2], 'hex');
  if (salt.length !== SALT_LENGTH || expected.length !== KEY_LENGTH) return false;

  const derived = (await scryptAsync(candidate.normalize('NFKC'), salt, KEY_LENGTH)) as Buffer;
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

/**
 * Şifre gücü politikası — kayıt/parola değiştirmede API sınırında uygulanır.
 * En az 8 karakter + harf + rakam. (Env-şifrelerimizden farklı olarak
 * kullanıcılar kendi şifresini seçtiği için taban gerekir.)
 */
export function validatePasswordPolicy(password: string): string | null {
  if (!password || password.length < 8) return 'Şifre en az 8 karakter olmalı.';
  if (!/[a-zA-ZçğıöşüÇĞİÖŞÜ]/.test(password) || !/[0-9]/.test(password)) {
    return 'Şifre en az bir harf ve bir rakam içermeli.';
  }
  return null; // geçerli
}
