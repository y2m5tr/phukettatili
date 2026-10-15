/**
 * Üyelik sistemi birim testleri — çerez biçimi ve rol hiyerarşisi.
 *
 * auth.ts'in imza fonksiyonu ADMIN_PASSCODE'tan türediği için testlerde
 * process.env.ADMIN_PASSCODE sabitlenir; imzalı çerezler bu anahtarla
 * üretilip doğrulanır.
 */
import { describe, it, expect, beforeAll } from 'vitest';

process.env.ADMIN_PASSCODE = 'test-passcode-123';

// import.meta.env yerine process.env kullanan auth modülü
// (getSecret şema yüklenemezse catch'e düşer).
const {
  createMembershipSessionValue,
  readMembershipSession,
  readSessionValue,
  roleRank,
  isMembershipRole,
  createSessionValue,
} = await import('../src/lib/auth');

const UUID_A = '11111111-2222-3333-4444-555555555555';
const UUID_B = '99999999-8888-7777-6666-555555555555';

describe('roleRank — hiyerarşi', () => {
  it('owner > manager > guide > driver sıralaması korunur', () => {
    expect(roleRank('owner')).toBeGreaterThan(roleRank('manager'));
    expect(roleRank('manager')).toBeGreaterThan(roleRank('guide'));
    expect(roleRank('guide')).toBeGreaterThan(roleRank('driver'));
    expect(roleRank('driver')).toBeGreaterThan(0);
  });

  it('eski roller eşdeğerleriyle aynı seviyededir', () => {
    expect(roleRank('admin')).toBe(roleRank('owner'));
    expect(roleRank('field')).toBe(roleRank('guide'));
  });

  it('geçersiz rol sıfır döner', () => {
    expect(roleRank(null)).toBe(0);
    expect(roleRank('hacker' as never)).toBe(0);
  });
});

describe('isMembershipRole', () => {
  it('dört yeni rolü tanır', () => {
    expect(isMembershipRole('owner')).toBe(true);
    expect(isMembershipRole('manager')).toBe(true);
    expect(isMembershipRole('guide')).toBe(true);
    expect(isMembershipRole('driver')).toBe(true);
  });

  it('eski rolleri ve geçersizleri reddeder', () => {
    expect(isMembershipRole('admin')).toBe(false);
    expect(isMembershipRole('field')).toBe(false);
    expect(isMembershipRole(null)).toBe(false);
  });
});

describe('üyelik çerezi — üret/oku turu', () => {
  it('üretildiği gibi geri okunur', () => {
    const cookie = createMembershipSessionValue(UUID_A, 'manager');
    const session = readMembershipSession(cookie);
    expect(session).not.toBeNull();
    expect(session!.userId).toBe(UUID_A);
    expect(session!.role).toBe('manager');
  });

  it('userId değiştirilirse imza geçersiz olur (sahtecilik engeli)', () => {
    const cookie = createMembershipSessionValue(UUID_A, 'owner');
    // userId'yi B ile değiştir, imzayı koru — doğrulama reddetmeli.
    const parts = cookie.split('.');
    const forged = [UUID_B, parts[1], parts[2], parts[3]].join('.');
    expect(readMembershipSession(forged)).toBeNull();
  });

  it('rol yükseltilirse imza geçersiz olur (driver → owner saldırısı)', () => {
    const cookie = createMembershipSessionValue(UUID_A, 'driver');
    const parts = cookie.split('.');
    const forged = [parts[0], 'owner', parts[2], parts[3]].join('.');
    expect(readMembershipSession(forged)).toBeNull();
  });

  it('imza kırpılırsa reddedilir', () => {
    const cookie = createMembershipSessionValue(UUID_A, 'guide');
    expect(readMembershipSession(cookie.slice(0, -2))).toBeNull();
  });

  it('userId UUID biçiminde değilse reddedilir', () => {
    const cookie = createMembershipSessionValue('not-a-uuid', 'guide');
    expect(readMembershipSession(cookie)).toBeNull();
  });

  it('eski üç-parçalı çerez üyelik okuyucusunda reddedilir', () => {
    const legacy = createSessionValue('admin');
    expect(readMembershipSession(legacy)).toBeNull();
  });
});

describe('eski çerez okuyucusu — geçiş dönemi uyumu', () => {
  it('eski admin çerezi hâlâ okunur', () => {
    const legacy = createSessionValue('admin');
    expect(readSessionValue(legacy)).toBe('admin');
  });

  it('eski field çerezi hâlâ okunur', () => {
    const legacy = createSessionValue('field');
    expect(readSessionValue(legacy)).toBe('field');
  });

  it('üyelik çerezi (4 parça) eski okuyucuda reddedilir', () => {
    const membership = createMembershipSessionValue(UUID_A, 'owner');
    expect(readSessionValue(membership)).toBeNull();
  });
});

const { hashPassword, verifyPassword, validatePasswordPolicy } = await import('../src/lib/server/passwords');

describe('passwords — scrypt hash turları', () => {

  it('üretildiği şifreyle doğrulanır', async () => {
    const hash = await hashPassword('Gizli-Sifre-123');
    expect(await verifyPassword('Gizli-Sifre-123', hash)).toBe(true);
  });

  it('yanlış şifre reddedilir', async () => {
    const hash = await hashPassword('Gizli-Sifre-123');
    expect(await verifyPassword('Baska-Sifre-999', hash)).toBe(false);
  });

  it('aynı şifreden iki hash farklıdır (benzersiz salt)', async () => {
    const h1 = await hashPassword('Ayni-Sifre-555');
    const h2 = await hashPassword('Ayni-Sifre-555');
    expect(h1).not.toBe(h2);
    // ikisi de geçerli doğrulanmalı
    expect(await verifyPassword('Ayni-Sifre-555', h1)).toBe(true);
    expect(await verifyPassword('Ayni-Sifre-555', h2)).toBe(true);
  });

  it('bozuk hash biçimi reddedilir', async () => {
    expect(await verifyPassword('x', 'bozuk-hash')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$abc')).toBe(false);
    expect(await verifyPassword('x', 'plain$0$0')).toBe(false);
  });

  it('Türkçe karakterli şifre doğru işlenir (NFKC normalize)', async () => {
    const hash = await hashPassword('Şifre-Çok-Güçlü-9');
    expect(await verifyPassword('Şifre-Çok-Güçlü-9', hash)).toBe(true);
  });

  it('şifre politikası: kısa/harfsiz/rakamsız reddedilir', () => {
    expect(validatePasswordPolicy('abc123')).not.toBeNull(); // < 10
    expect(validatePasswordPolicy('1234567890123')).not.toBeNull(); // harf yok
    expect(validatePasswordPolicy('abcdefghijk')).not.toBeNull(); // rakam yok
    expect(validatePasswordPolicy('guclu-sifre-2026')).toBeNull(); // geçerli
  });
});
