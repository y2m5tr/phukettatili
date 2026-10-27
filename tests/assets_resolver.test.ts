import { describe, it, expect } from 'vitest';
import { resolveAssetUrl, resolveOgImageUrl, DEFAULT_HERO_IMAGE } from '../src/lib/assets';

describe('Asset & Gallery URL Resolver', () => {
  it('should prepend /assets/ to plain filenames', () => {
    expect(resolveAssetUrl('james-bond-1.webp')).toBe('/assets/james-bond-1.webp');
    expect(resolveAssetUrl('bay.webp')).toBe('/assets/bay.webp');
  });

  it('should preserve paths that already start with /', () => {
    expect(resolveAssetUrl('/assets/james-bond-1.webp')).toBe('/assets/james-bond-1.webp');
    expect(resolveAssetUrl('/images/logo.png')).toBe('/images/logo.png');
  });

  it('should preserve Supabase Storage and full HTTP(S) URLs', () => {
    const supabaseUrl = 'https://xiyuozntwoqibvwivkms.supabase.co/storage/v1/object/public/media/test.webp';
    expect(resolveAssetUrl(supabaseUrl)).toBe(supabaseUrl);
    expect(resolveAssetUrl('http://example.com/photo.jpg')).toBe('http://example.com/photo.jpg');
  });

  it('should preserve base64 data URLs without adding /assets/ prefix', () => {
    const dataUrl = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZ';
    expect(resolveAssetUrl(dataUrl)).toBe(dataUrl);
  });

  it('should fallback to DEFAULT_HERO_IMAGE when undefined or empty', () => {
    expect(resolveAssetUrl(undefined)).toBe(DEFAULT_HERO_IMAGE);
    expect(resolveAssetUrl(null)).toBe(DEFAULT_HERO_IMAGE);
    expect(resolveAssetUrl('')).toBe(DEFAULT_HERO_IMAGE);
    expect(resolveAssetUrl('   ')).toBe(DEFAULT_HERO_IMAGE);
  });

  it('should resolve OpenGraph URLs properly and fallback on data URLs', () => {
    expect(resolveOgImageUrl('james-bond-cover.webp')).toBe('https://phukettatili.com/assets/james-bond-cover.webp');
    expect(resolveOgImageUrl('https://example.com/og.jpg')).toBe('https://example.com/og.jpg');
    // data URLs cannot be scraped by WhatsApp/Facebook, so fallback
    expect(resolveOgImageUrl('data:image/avif;base64,...')).toBe('https://phukettatili.com/assets/phuket_hero.webp');
  });
});

describe('responsiveSrcset', () => {
  it('640 varyantı bilinen yerel asset için srcset üretir', async () => {
    const { responsiveSrcset } = await import('../src/lib/assets');
    const s = responsiveSrcset('bay.webp');
    expect(s).toBe('/assets/bay.webp 1280w, /assets/bay-640.webp 640w');
  });

  it('varyantı olmayan görsel ve bulut URL için undefined döner', async () => {
    const { responsiveSrcset } = await import('../src/lib/assets');
    expect(responsiveSrcset('atv-1.webp')).toBeUndefined();
    expect(responsiveSrcset('https://example.com/a.webp')).toBeUndefined();
    expect(responsiveSrcset(undefined)).toBeUndefined();
  });
});
