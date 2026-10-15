import { describe, it, expect } from 'vitest';
import {
  generateTicketCode,
  isTicketCode,
  normalizeTicketCode,
  ticketCodeMatches,
} from '../src/lib/ticketCodes';

describe('generateTicketCode', () => {
  it('PT- öneki ve 7 karakter üretir', () => {
    const code = generateTicketCode();
    expect(code).toMatch(/^PT-[A-Z2-9]{7}$/);
  });

  it('karışıklık yaratan karakterleri içermez (0, 1, I, L, O)', () => {
    // 1000 kod üret, hiçbirinde yasaklı karakter olmamalı
    for (let i = 0; i < 1000; i++) {
      const code = generateTicketCode();
      expect(code).not.toMatch(/[01ILO]/);
    }
  });

  it('ardışık üretimde farklı kodlar verir', () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateTicketCode()));
    // 500 üretimde 500 farklı kod — çarpışma pratik olarak imkansız
    expect(codes.size).toBe(500);
  });
});

describe('isTicketCode', () => {
  it('yeni format kodu tanır', () => {
    expect(isTicketCode('PT-7K2M9XQ')).toBe(true);
    expect(isTicketCode('pt-7k2m9xq')).toBe(true); // küçük harf kullanıcı girişi
    expect(isTicketCode('7K2M9XQ')).toBe(false); // öneksiz
  });

  it('eski BK- idyi bilet kodu saymaz (id araması yapılacak)', () => {
    expect(isTicketCode('BK-1001')).toBe(false);
  });

  it('yanlış uzunluğu reddeder', () => {
    expect(isTicketCode('PT-7K2M9X')).toBe(false); // 6 karakter
    expect(isTicketCode('PT-7K2M9XQQ')).toBe(false); // 8 karakter
    expect(isTicketCode('')).toBe(false);
  });
});

describe('normalizeTicketCode', () => {
  it('büyük harfe çevirir ve kenar boşluklarını atar', () => {
    expect(normalizeTicketCode('  pt-7k2m9xq  ')).toBe('PT-7K2M9XQ');
  });
});

describe('ticketCodeMatches', () => {
  it('aynı kodu eşler', () => {
    expect(ticketCodeMatches('PT-7K2M9XQ', 'PT-7K2M9XQ')).toBe(true);
  });

  it('büyük/küçük harf ve boşluk farkını tolere eder', () => {
    expect(ticketCodeMatches('PT-7K2M9XQ', ' pt-7k2m9xq ')).toBe(true);
  });

  it('farklı kodu reddeder', () => {
    expect(ticketCodeMatches('PT-7K2M9XQ', 'PT-7K2M9XR')).toBe(false);
  });

  it('kayıtlı kod yoksa reddeder', () => {
    expect(ticketCodeMatches(null, 'PT-7K2M9XQ')).toBe(false);
    expect(ticketCodeMatches(undefined, 'PT-7K2M9XQ')).toBe(false);
    expect(ticketCodeMatches('', 'PT-7K2M9XQ')).toBe(false);
  });
});
