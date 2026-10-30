/**
 * Phuket Tatili — Tur Combo & Çoklu Sepet Paket Motoru
 *
 * Misafirlerin tek tur yerine 2. veya 3. deneyimi (ada turları + VIP havalimanı transferi)
 * birlikte almasını teşvik eden, %15 avantaj sağlayan paket ve sepet motoru.
 */

import { fmtMoney } from './moneyFormat';

export interface ComboItem {
  id: string;
  title: string;
  category: 'island' | 'adventure' | 'yacht' | 'transfer' | 'show';
  regularPriceThb: number;
}

export interface ComboPackage {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  items: ComboItem[];
  discountPercent: number;
  highlight: string;
}

export interface CalculatedCombo {
  totalRegularThb: number;
  discountPercent: number;
  discountAmountThb: number;
  finalPriceThb: number;
  savingsThb: number;
}

export const POPULAR_COMBOS: ComboPackage[] = [
  {
    id: 'andaman-classic-duo',
    badge: '🏆 EN ÇOK TERCİH EDİLEN',
    title: 'Andaman Çift Ada & VIP Transfer Paketi',
    tagline: 'Phuket\'in 2 ana rotası + Havalimanı VIP Minibüs Transferi',
    description: 'Phi Phi & Maya Bay sürat teknesi, James Bond Adası kano turu ve havalimanı otel transferinizi tek pakette avantajlı fiyata birleştirin.',
    items: [
      { id: 'phi-phi-maya-ve-bamboo-adasi', title: 'Phi Phi, Maya ve Bamboo Adası Sürat Teknesi', category: 'island', regularPriceThb: 3200 },
      { id: 'james-bond-adasi-ve-kano-turu', title: 'James Bond Adası & Kano Mağara Keşfi', category: 'island', regularPriceThb: 2800 },
      { id: 'vip-airport-transfer', title: 'Phuket Havalimanı VIP Minibüs Lobi Transferi', category: 'transfer', regularPriceThb: 1800 },
    ],
    discountPercent: 15,
    highlight: 'En popüler 2 ada turu ve kapıdan kapıya VIP transfer güvencesi.',
  },
  {
    id: 'phuket-adventure-nature',
    badge: '⚡ MACERA & ADRENALİN',
    title: 'Phuket Macera & Doğa Paketi',
    tagline: 'Adalar + Hanuman Zipline / Safari + VIP Transfer',
    description: 'Turkuaz koylardan tropikal yağmur ormanlarına; sürat teknesi ada turu, Hanuman Zipline ve havalimanı ulaşımı.',
    items: [
      { id: 'phi-phi-maya-ve-bamboo-adasi', title: 'Phi Phi, Maya ve Bamboo Adası', category: 'island', regularPriceThb: 3200 },
      { id: 'hanuman-world-zipline-deneyimi', title: 'Hanuman World Zipline Deneyimi', category: 'adventure', regularPriceThb: 2600 },
      { id: 'vip-airport-transfer', title: 'Phuket Havalimanı VIP Minibüs Lobi Transferi', category: 'transfer', regularPriceThb: 1800 },
    ],
    discountPercent: 15,
    highlight: 'Andaman denizi ile tropikal orman heyecanını tek pakette yaşayın.',
  },
  {
    id: 'honeymoon-sunset-luxury',
    badge: '💑 BALAYI & ROMANTİZM',
    title: 'Balayı & Lüks Yat Rüya Paketi',
    tagline: 'Moonlight Katamaran Yat + Banana Beach Pavilyon + VIP Karşılama',
    description: 'Balayı çiftlerine özel gün batımı lüks katamaran seyri, Banana Beach bohem sahil cabanası ve adınıza özel VIP transfer.',
    items: [
      { id: 'moonlight-luks-yat-turu', title: 'Moonlight Lüks Yat Gün Batımı Turu', category: 'yacht', regularPriceThb: 4200 },
      { id: 'banana-beach-koh-hey-gunu', title: 'Banana Beach Koh Hey Bohem Günü', category: 'island', regularPriceThb: 2300 },
      { id: 'vip-airport-transfer', title: 'Phuket Havalimanı VIP Minibüs Çiçekli Karşılama', category: 'transfer', regularPriceThb: 1800 },
    ],
    discountPercent: 15,
    highlight: 'Romantik fotoğraf molaları, şampanyalı gün batımı ve baş başa koylar.',
  },
];

/**
 * Verilen kalemlerin toplam normal tutarını ve indirimli combo fiyatını hesaplar.
 */
export function calculateComboPrice(
  items: Array<{ regularPriceThb: number }>,
  discountPercent = 15
): CalculatedCombo {
  const totalRegularThb = items.reduce((sum, item) => sum + (item.regularPriceThb || 0), 0);
  const discountAmountThb = Math.round((totalRegularThb * discountPercent) / 100);
  const finalPriceThb = totalRegularThb - discountAmountThb;
  const savingsThb = discountAmountThb;

  return {
    totalRegularThb,
    discountPercent,
    discountAmountThb,
    finalPriceThb,
    savingsThb,
  };
}

/**
 * Combo paket için doğrudan WhatsApp teklif linki üretir.
 */
export function generateComboWhatsAppUrl(
  combo: ComboPackage,
  pax = 2,
  whatsappNumber = '66828950665'
): string {
  const calc = calculateComboPrice(combo.items, combo.discountPercent);
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');

  const lines = [
    `🌴 *PHUKET TATİLİ — COMBO PAKET TEKLİF TALEBİ* 🌴`,
    ``,
    `📦 *Paket:* ${combo.title} (${combo.badge})`,
    `👥 *Kişi Sayısı:* ${pax} Kişi`,
    ``,
    `📋 *Dahil Deneyimler:*`,
    ...combo.items.map((it) => `  • ${it.title}`),
    ``,
    `💰 *Normal Tutar:* ~${fmtMoney(calc.totalRegularThb * pax)} THB`,
    `🎉 *%${calc.discountPercent} Paket Avantajı:* ~${fmtMoney(calc.finalPriceThb * pax)} THB`,
    `✨ *Toplam Tasarruf:* ~${fmtMoney(calc.savingsThb * pax)} THB`,
    ``,
    `Tatil tarihlerimiz için uygunluk ve rezervasyon detaylarını alabilir miyiz?`,
  ];

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
