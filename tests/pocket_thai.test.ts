import { describe, it, expect } from 'vitest';
import {
  POCKET_THAI_PHRASES,
  POCKET_THAI_CATEGORIES,
  filterPocketThaiPhrases,
} from '../src/lib/pocketThai';

describe('Pocket Thai Assistant Library', () => {
  it('contains at least 15 essential phrases across 5 categories', () => {
    expect(POCKET_THAI_PHRASES.length).toBeGreaterThanOrEqual(15);
    expect(POCKET_THAI_CATEGORIES.length).toBe(6); // all + 5
  });

  it('filters phrases by category correctly', () => {
    const foodPhrases = filterPocketThaiPhrases('', 'food_dining');
    expect(foodPhrases.length).toBeGreaterThanOrEqual(4);
    expect(foodPhrases.every((p) => p.category === 'food_dining')).toBe(true);
  });

  it('searches phrases by turkish text or phonetic pronunciation', () => {
    const searchNoSpicy = filterPocketThaiPhrases('acısız');
    expect(searchNoSpicy.length).toBeGreaterThanOrEqual(1);
    expect(searchNoSpicy[0].phonetic).toContain('Mai Phet');

    const searchPhonetic = filterPocketThaiPhrases('Check Bin');
    expect(searchPhonetic.length).toBeGreaterThanOrEqual(1);
  });

  it('ensures each phrase has valid thai script, phonetic reading, and turkish meaning', () => {
    POCKET_THAI_PHRASES.forEach((p) => {
      expect(p.thai.trim().length).toBeGreaterThan(0);
      expect(p.phonetic.trim().length).toBeGreaterThan(0);
      expect(p.turkish.trim().length).toBeGreaterThan(0);
    });
  });
});
