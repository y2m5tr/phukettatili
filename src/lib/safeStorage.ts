/**
 * Güvenli ve Hata Toleranslı Yerel Depolama Katmanı (Safe Storage Layer)
 *
 * Özellikler:
 * - Tarayıcı depolama kotası dolduğunda (QuotaExceededError) çökmez, belleğe düşer (memory fallback).
 * - Gizli pencere veya çerez engeli (SecurityError) durumunda sessizce belleğe düşer.
 * - Bozuk / geçersiz JSON verilerinde hata fırlatmak yerine güvenli varsayılan değere döner.
 * - SSR (Server-Side Rendering) ortamında window tanımsızken çökmez.
 */

const memoryFallback = new Map<string, string>();

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return false;
  }
  try {
    const testKey = '__ptt_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Güvenli JSON okuma: Bozuk JSON veya kapalı depolama durumunda fallback döner.
 */
export function safeGet<T>(key: string, fallback: T): T {
  try {
    if (isStorageAvailable()) {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      try {
        return JSON.parse(raw) as T;
      } catch (parseErr) {
        console.warn(`[SafeStorage] JSON parse hatası "${key}", varsayılana dönüldü:`, parseErr);
        return fallback;
      }
    } else {
      const memRaw = memoryFallback.get(key);
      if (memRaw === undefined) return fallback;
      try {
        return JSON.parse(memRaw) as T;
      } catch {
        return fallback;
      }
    }
  } catch {
    return fallback;
  }
}

/**
 * Güvenli JSON yazma: Kota aşımı veya yazma hatasında memoryFallback'e yazar ve false döner.
 */
export function safeSet<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    if (isStorageAvailable()) {
      try {
        window.localStorage.setItem(key, serialized);
        return true;
      } catch (writeErr) {
        console.warn(`[SafeStorage] localStorage yazma hatası "${key}", belleğe yazılıyor:`, writeErr);
        memoryFallback.set(key, serialized);
        return false;
      }
    } else {
      memoryFallback.set(key, serialized);
      return true;
    }
  } catch (serializeErr) {
    console.error(`[SafeStorage] JSON serileştirme hatası "${key}":`, serializeErr);
    return false;
  }
}

/**
 * Güvenli ham string okuma.
 */
export function safeGetRaw(key: string, fallback: string | null = null): string | null {
  try {
    if (isStorageAvailable()) {
      const val = window.localStorage.getItem(key);
      return val !== null ? val : fallback;
    }
    return memoryFallback.get(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Güvenli ham string yazma.
 */
export function safeSetRaw(key: string, value: string): boolean {
  try {
    if (isStorageAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch {
        memoryFallback.set(key, value);
        return false;
      }
    }
    memoryFallback.set(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Güvenli anahtar silme.
 */
export function safeRemove(key: string): boolean {
  try {
    memoryFallback.delete(key);
    if (isStorageAvailable()) {
      window.localStorage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Bellek yedeğini temizler (testler ve oturum sıfırlama için).
 */
export function clearMemoryFallback(): void {
  memoryFallback.clear();
}
