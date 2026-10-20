import { describe, it, expect } from 'vitest';
import {
  NAV_CATEGORIES,
  NAV_ITEMS,
  PRIMARY_NAV_ITEMS,
  FINANCE_NAV_ITEMS,
  CMS_NAV_ITEMS,
  SYSTEM_NAV_ITEMS,
  type AdminTab,
} from '../src/components/admin/adminNav';

/**
 * adminNav.ts panel menüsünün tek kaynağıdır; AdminDashboard, AdminSidebar ve
 * CommandPaletteModal aynı listeyi tüketir. Bu testler veri bütünlüğünü kilitler:
 * yeni bir sekme eklenirken kopya id, geçersiz kategori veya çakışan hotkey
 * sessizce içeri sızamaz.
 */

/** lucide-react ikonları `forward_ref` nesnesidir; React bileşeni sayılır. */
function isReactComponent(x: unknown): boolean {
  if (typeof x === 'function') return true;
  if (x && typeof x === 'object') {
    const sym = (x as { $$typeof?: unknown }).$$typeof;
    return typeof sym === 'symbol' && typeof (x as { render?: unknown }).render === 'function';
  }
  return false;
}

describe('adminNav — NAV_ITEMS bütünlüğü', () => {
  it('tüm sekme id\'leri benzersizdir', () => {
    const ids = NAV_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('her sekmenin category değeri geçerli dört masadan biridir', () => {
    const valid = ['operations', 'finance', 'content', 'system'];
    for (const item of NAV_ITEMS) {
      expect(valid).toContain(item.category);
    }
  });

  it('her sekmenin label, description ve icon değeri doludur', () => {
    for (const item of NAV_ITEMS) {
      expect(item.label.length, item.id).toBeGreaterThan(0);
      expect(item.description.length, item.id).toBeGreaterThan(0);
      expect(isReactComponent(item.icon), item.id).toBe(true);
    }
  });

  it('alt menü id\'leri kendi içinde benzersizdir (sekme id\'leriyle çakışmaz)', () => {
    const tabIds = new Set(NAV_ITEMS.map((i) => i.id));
    const subIds: string[] = [];
    for (const item of NAV_ITEMS) {
      for (const sub of item.subItems ?? []) {
        expect(tabIds.has(sub.id as AdminTab), sub.id).toBe(false);
        subIds.push(sub.id);
      }
    }
    expect(new Set(subIds).size).toBe(subIds.length);
  });

  it('hotkey\'ler benzersizdir ve 1-9 aralığındadır', () => {
    const hotkeys = NAV_ITEMS.map((i) => i.hotkey).filter((h) => h !== undefined);
    expect(new Set(hotkeys).size).toBe(hotkeys.length);
    for (const h of hotkeys) {
      expect(Number(h)).toBeGreaterThanOrEqual(1);
      expect(Number(h)).toBeLessThanOrEqual(9);
    }
  });

  it('beklenen çekirdek sekmeler listede mevcut', () => {
    const ids = new Set(NAV_ITEMS.map((i) => i.id));
    for (const core of ['overview', 'bookings', 'finance', 'tours', 'settings'] as const) {
      expect(ids.has(core), core).toBe(true);
    }
  });
});

describe('adminNav — kategori filtreleri', () => {
  it('dört filtre toplamı NAV_ITEMS ile aynı kümedir', () => {
    const filtered = [
      ...PRIMARY_NAV_ITEMS,
      ...FINANCE_NAV_ITEMS,
      ...CMS_NAV_ITEMS,
      ...SYSTEM_NAV_ITEMS,
    ];
    expect(filtered.length).toBe(NAV_ITEMS.length);
    expect(new Set(filtered.map((i) => i.id)).size).toBe(NAV_ITEMS.length);
  });

  it('her filtre yalnızca kendi kategorisini içerir', () => {
    expect(PRIMARY_NAV_ITEMS.every((i) => i.category === 'operations')).toBe(true);
    expect(FINANCE_NAV_ITEMS.every((i) => i.category === 'finance')).toBe(true);
    expect(CMS_NAV_ITEMS.every((i) => i.category === 'content')).toBe(true);
    expect(SYSTEM_NAV_ITEMS.every((i) => i.category === 'system')).toBe(true);
  });

  it('hiçbir masa boş değildir — silme/kopyalama hatası yakalanır', () => {
    expect(PRIMARY_NAV_ITEMS.length).toBeGreaterThan(0);
    expect(FINANCE_NAV_ITEMS.length).toBeGreaterThan(0);
    expect(CMS_NAV_ITEMS.length).toBeGreaterThan(0);
    expect(SYSTEM_NAV_ITEMS.length).toBeGreaterThan(0);
  });
});

describe('adminNav — NAV_CATEGORIES', () => {
  it('beş kategori tanımı vardır ve id\'leri benzersizdir', () => {
    expect(NAV_CATEGORIES).toHaveLength(5);
    expect(new Set(NAV_CATEGORIES.map((c) => c.id)).size).toBe(5);
  });

  it('"all" kategorisi mevcuttur ve her tanımın label/shortLabel/icon değeri doludur', () => {
    expect(NAV_CATEGORIES.some((c) => c.id === 'all')).toBe(true);
    for (const cat of NAV_CATEGORIES) {
      expect(cat.label.length, cat.id).toBeGreaterThan(0);
      expect(cat.shortLabel.length, cat.id).toBeGreaterThan(0);
      expect(isReactComponent(cat.icon), cat.id).toBe(true);
    }
  });

  it('her NAV_ITEMS kategorisinin NAV_CATEGORIES\'ta karşılığı vardır', () => {
    const catIds = new Set(NAV_CATEGORIES.map((c) => c.id));
    for (const item of NAV_ITEMS) {
      expect(catIds.has(item.category), item.category).toBe(true);
    }
  });
});
