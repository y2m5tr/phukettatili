import { describe, it, expect } from 'vitest';
import { parseWhatsAppBookingText } from '../src/lib/whatsappParser';

describe('Akıllı WhatsApp Rezervasyon Ayrıştırıcı (parseWhatsAppBookingText)', () => {
  const mockTours = [
    { id: 'tour-1', title: 'Phi Phi & Maya Bay Erken Çıkış Sürat Teknesi', priceThb: 3200 },
    { id: 'tour-2', title: 'James Bond & Phang Nga Kano Turu', priceThb: 2800 },
    { id: 'tour-3', title: 'Etik Fil Barınağı & Doğal Yaşam Deneyimi', priceThb: 2500 },
  ];

  it('standart bir WhatsApp rezervasyon talebinden tüm alanları hatasız çıkarır', () => {
    const raw = `
      Merhaba iyi günler,
      İsim: Caner Özkan
      Biz 2 yetişkin 1 çocuk, 24 Ekim tarihinde Phi Phi turuna katılmak istiyoruz.
      Otelimiz Centara Grand, oda no: 304.
      Tel: 0532 123 4567.
      Fiyat: 7200 Baht demiştiniz.
    `;

    const parsed = parseWhatsAppBookingText(raw, mockTours);

    expect(parsed.customerName).toBe('Caner Özkan');
    expect(parsed.adultCount).toBe(2);
    expect(parsed.childCount).toBe(1);
    expect(parsed.tourDate).toBe(`${new Date().getFullYear()}-10-24`);
    expect(parsed.hotel).toBe('Centara Grand');
    expect(parsed.roomNumber).toBe('304');
    expect(parsed.phone).toBe('05321234567');
    expect(parsed.tourTitle).toContain('Phi Phi');
    expect(parsed.priceThb).toBe(7200);
  });

  it('serbest konuşma dilindeki mesajları doğru ayrıştırır', () => {
    const raw = 'Selam ben Zeynep Kaya, yarın için 3 kişi James Bond turu istiyoruz. Amari Phuket oda 204. Tel +66 82 895 0665, 8400 thb';

    const parsed = parseWhatsAppBookingText(raw, mockTours);

    expect(parsed.customerName).toBe('Zeynep Kaya');
    expect(parsed.adultCount).toBe(3);
    expect(parsed.hotel).toBe('Amari Phuket');
    expect(parsed.roomNumber).toBe('204');
    expect(parsed.tourTitle).toContain('James Bond');
    expect(parsed.priceThb).toBe(8400);
  });

  it('yarın ve farklı tarih formatlarını başarıyla yakalar', () => {
    const raw = 'Merhaba, yarın için 2 yetişkin Similan adaları turu almak istiyoruz. Otelimiz Pullman Phuket oda 512, tel: 0544 999 8877';
    const parsed = parseWhatsAppBookingText(raw, mockTours);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(parsed.tourDate).toBe(tomorrow.toISOString().split('T')[0]);
    expect(parsed.adultCount).toBe(2);
    expect(parsed.hotel).toBe('Pullman Phuket');
    expect(parsed.roomNumber).toBe('512');
    expect(parsed.phone).toBe('05449998877');
    expect(parsed.tourTitle).toContain('Similan');
  });

  it('boş veya eksik metinlerde çökmeden boş nesne döner', () => {
    expect(parseWhatsAppBookingText('')).toEqual({});
    expect(parseWhatsAppBookingText('Sadece selam vermek istedim')).toEqual({});
  });
});
