import { describe, it, expect } from 'vitest';
import { buildTourDetailSchemas } from '../src/components/tour/detail/tourDetailSchemas';

describe('Tour Detail Structured Data (Google Merchant Listings Compliance)', () => {
  const mockTour = {
    id: 'phi-phi-maya-ve-bamboo-adasi',
    data: {
      title: 'Phi Phi, Maya Bay ve Bamboo Adası Sürat Teknesi Turu',
      excerpt: 'Phuket en popüler ada turu',
      price_thb: 3200,
      duration: 'Tam Gün',
      image: 'phuket_tours.webp',
      category: 'island-tours',
      category_label: 'Ada Turları',
    },
  } as any;

  const site = 'https://phukettatili.com';

  it('generates Product schema with compliant Merchant Listings offer properties', () => {
    const schemas = buildTourDetailSchemas(mockTour, site, []);
    const productSchema = schemas.find((s) => s['@type'] === 'Product') as Record<string, any>;

    expect(productSchema).toBeDefined();
    expect(productSchema.name).toBe(mockTour.data.title);
    expect(productSchema.sku).toBe(mockTour.id);

    const offers = productSchema.offers;
    expect(offers).toBeDefined();
    expect(offers['@type']).toBe('Offer');
    expect(offers.price).toBe(3200);
    expect(offers.priceCurrency).toBe('THB');
    expect(offers.availability).toBe('https://schema.org/InStock');

    // 1. "validFrom" alanı eksik uyarısı için
    expect(offers.validFrom).toBeDefined();
    expect(typeof offers.validFrom).toBe('string');
    expect(offers.validFrom).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(offers.priceValidUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // 2. "shippingDetails" alanı eksik uyarısı için
    expect(offers.shippingDetails).toBeDefined();
    expect(offers.shippingDetails['@type']).toBe('OfferShippingDetails');
    expect(offers.shippingDetails.shippingRate.value).toBe('0');
    expect(offers.shippingDetails.shippingRate.currency).toBe('THB');
    expect(offers.shippingDetails.shippingDestination.addressCountry).toBe('TH');
    expect(offers.shippingDetails.deliveryTime.handlingTime.unitCode).toBe('DAY');

    // 3. "hasMerchantReturnPolicy" alanı eksik uyarısı için
    expect(offers.hasMerchantReturnPolicy).toBeDefined();
    expect(offers.hasMerchantReturnPolicy['@type']).toBe('MerchantReturnPolicy');
    expect(offers.hasMerchantReturnPolicy.applicableCountry).toBe('TH');
    expect(offers.hasMerchantReturnPolicy.returnPolicyCategory).toBe('https://schema.org/MerchantReturnFiniteReturnWindow');
    expect(offers.hasMerchantReturnPolicy.merchantReturnDays).toBe(1);
    expect(offers.hasMerchantReturnPolicy.returnFees).toBe('https://schema.org/FreeReturn');
  });

  it('generates TouristTrip schema with the same offer details', () => {
    const schemas = buildTourDetailSchemas(mockTour, site, []);
    const tripSchema = schemas.find((s) => s['@type'] === 'TouristTrip') as Record<string, any>;

    expect(tripSchema).toBeDefined();
    expect(tripSchema.offers.validFrom).toBeDefined();
    expect(tripSchema.offers.shippingDetails).toBeDefined();
    expect(tripSchema.offers.hasMerchantReturnPolicy).toBeDefined();
  });
});
