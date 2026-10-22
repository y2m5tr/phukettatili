import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  safeGet,
  safeSet,
  safeRemove,
  safeGetRaw,
  safeSetRaw,
  clearMemoryFallback,
} from '../src/lib/safeStorage';

const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => (k in memoryStore ? memoryStore[k] : null),
  setItem: (k: string, v: string) => { memoryStore[k] = String(v); },
  removeItem: (k: string) => { delete memoryStore[k]; },
  clear: () => { for (const k in memoryStore) delete memoryStore[k]; },
};

(globalThis as any).window = globalThis;
(globalThis as any).localStorage = mockLocalStorage;

describe('SafeStorage layer', () => {
  beforeEach(() => {
    clearMemoryFallback();
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads and writes JSON values correctly', () => {
    const data = { id: 'BK-1', title: 'Phi Phi Tour', count: 4 };
    expect(safeSet('test_key', data)).toBe(true);
    expect(safeGet('test_key', null)).toEqual(data);
  });

  it('returns default fallback when key does not exist', () => {
    const fallback = { empty: true };
    expect(safeGet('non_existent_key', fallback)).toEqual(fallback);
  });

  it('catches invalid JSON gracefully and returns fallback without throwing', () => {
    mockLocalStorage.setItem('corrupted_key', '{not a valid json...');
    const fallback = { recovered: true };
    expect(safeGet('corrupted_key', fallback)).toEqual(fallback);
  });

  it('falls back to memory store when localStorage throws QuotaExceededError', () => {
    vi.spyOn(mockLocalStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const data = { savedInMemory: true };
    const success = safeSet('quota_test', data);
    expect(success).toBe(true); // safely handled via memory fallback
    expect(safeGet('quota_test', null)).toEqual(data); // successfully retrieved from memory
  });

  it('handles raw string values and removal cleanly', () => {
    safeSetRaw('token', 'secret-123');
    expect(safeGetRaw('token')).toBe('secret-123');

    safeRemove('token');
    expect(safeGetRaw('token')).toBeNull();
  });
});
