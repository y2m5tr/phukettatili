/**
 * PromptPay Dinamik QR Motoru (Bank of Thailand & EMVCo Uyumlu)
 *
 * Phuket'te ve Tayland genelinde PromptPay (K-Bank, SCB, Bangkok Bank, Krungthai vb.)
 * ulusal standart QR ödeme altyapısıdır.
 *
 * Bu modül:
 * 1. Tayland telefon numarası (+66 / 08x...) veya Vergi Numarası (Tax ID) alır.
 * 2. İsteğe bağlı Baht (THB) tutarı ekler (Dinamik QR).
 * 3. Resmi EMVCo TLV (Tag-Length-Value) ve CRC-16 (CCITT-FALSE) sağlama toplamı
 *    ile taranabilir PromptPay QR Payload'u üretir.
 * 4. Tüm Tayland banka uygulamaları tarafından sorunsuz taranır.
 */

/**
 * EMVCo TLV (Tag-Length-Value) yardımcısı.
 */
function f(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * CRC-16/CCITT-FALSE algoritması.
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
export function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Telefon numarasını PromptPay formatına (0066xxxxxxxxx) dönüştürür.
 * Örn: "+66 82 895 0665" -> "0066828950665"
 *      "0828950665"      -> "0066828950665"
 */
export function formatPromptPayTarget(target: string): { type: 'mobile' | 'tax_id'; formatted: string } {
  const clean = target.replace(/[^\d]/g, '');

  // 13 haneli ulusal kimlik veya vergi no (Tax ID)
  if (clean.length === 13) {
    return { type: 'tax_id', formatted: clean };
  }

  // Telefon numarası
  let mobile = clean;
  if (mobile.startsWith('66')) {
    mobile = '00' + mobile;
  } else if (mobile.startsWith('0')) {
    mobile = '0066' + mobile.substring(1);
  } else {
    mobile = '0066' + mobile;
  }

  return { type: 'mobile', formatted: mobile };
}

export interface PromptPayOptions {
  /** Telefon numarası (Örn: 0828950665 veya +66828950665) veya 13 haneli Tax ID */
  target: string;
  /** İsteğe bağlı tutar (Baht / THB) */
  amountThb?: number;
}

/**
 * Bank of Thailand EMVCo standartlarında resmi PromptPay QR string'i üretir.
 */
export function generatePromptPayPayload({ target, amountThb }: PromptPayOptions): string {
  const { type, formatted } = formatPromptPayTarget(target);

  // 00: Payload Format Indicator (01)
  let payload = f('00', '01');

  // 01: Point of Initiation Method (12: Dynamic with amount, 11: Static)
  const isDynamic = typeof amountThb === 'number' && amountThb > 0;
  payload += f('01', isDynamic ? '12' : '11');

  // 29: Merchant Account Information (PromptPay)
  // Sub-tag 00: AID = A000000677010111
  // Sub-tag 01: Mobile (0066xxxxxxxxx) veya 02: Tax ID (13 haneli)
  const aid = f('00', 'A000000677010111');
  const accountSubtag = type === 'mobile' ? f('01', formatted) : f('02', formatted);
  payload += f('29', aid + accountSubtag);

  // 53: Transaction Currency (764 = THB)
  payload += f('53', '764');

  // 54: Transaction Amount (2 ondalık basamak, örn: "2500.00")
  if (isDynamic) {
    const amountStr = amountThb.toFixed(2);
    payload += f('54', amountStr);
  }

  // 58: Country Code (TH)
  payload += f('58', 'TH');

  // 63: CRC-16 Checksum (ID "63", Length "04" + 4 hex)
  const payloadToCrc = payload + '6304';
  const checksum = crc16(payloadToCrc);

  return payloadToCrc + checksum;
}

/**
 * Üretilen EMVCo PromptPay QR string'ini anında taranabilir yüksek çözünürlüklü
 * QR kod görsel URL'sine çevirir.
 */
export function getPromptPayQrImageUrl(payload: string, size = 300): string {
  const encoded = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encoded}`;
}
