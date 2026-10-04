import { ENV } from '@/env';

export const DEFAULT_WHATSAPP_NUMBER = '66828950665';
export const WHATSAPP_NUMBER = (ENV?.WHATSAPP_PHONE ? ENV.WHATSAPP_PHONE.replace(/[^0-9]/g, '') : '') || DEFAULT_WHATSAPP_NUMBER;

/**
 * Build a WhatsApp URL with pre-filled message
 * @param context - The context or subject of the message
 * @param details - Additional details to include in the message
 * @returns WhatsApp URL with encoded message
 */
export function buildWhatsAppUrl(context: string = 'Genel Bilgi', details: string = ''): string {
  // Strip HTML tags and trim
  const cleanContext = context.replace(/<[^>]*>?/gm, '').trim();
  
  // Avoid double greeting: if context already starts with "Merhaba", don't prepend another
  let message: string;
  if (cleanContext.toLowerCase().startsWith('merhaba')) {
    message = cleanContext;
  } else {
    message = `Merhaba, ${cleanContext} hakkında bilgi almak istiyorum.`;
  }

  if (details.trim()) {
    message += `\n\n${details.trim()}`;
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(priceType: 'fixed' | 'starting' | 'quote' = 'quote', priceThb?: number | null): string {
  if (priceType === 'quote' || !priceThb) {
    return 'Teklif alın';
  }
  const formatted = new Intl.NumberFormat('tr-TR').format(priceThb) + ' THB';
  return priceType === 'starting' ? `${formatted}'dan` : formatted;
}