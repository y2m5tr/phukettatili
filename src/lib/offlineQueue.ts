/**
 * Çevrimdışı Kuyruk & IndexedDB Çevrimdışı Senkronizasyon Motoru (Aşama 4)
 *
 * Chalong/Rassada iskelelerinde veya açık denizde teknede internet kesildiğinde
 * sahadaki personelin (şoför/rehber/dispatcher) kesintisiz çalışmasını sağlar:
 * 1. Bilet check-in, otel pickup işaretleme, yolcu manifestosu ve rezervasyon
 *    düzenlemeleri IndexedDB outbox kuyruğuna kaydedilir.
 * 2. Ekran asla geri alma (rollback) hatası vermez; işlem başarıyla onaylanır.
 * 3. İnternet bağlantısı geri geldiğinde (online event veya periyodik sync)
 *    kuyruk sırayla sunucuya iletilir ve bulutla tam senkronize edilir.
 *
 * IndexedDB desteklenmeyen veya SSR ortamlarında otomatik olarak
 * localStorage / bellek fallback'ine geçer.
 */

export interface QueuedMutation {
  id: string;
  type: 'PUT_BOOKING' | 'POST_BOOKING' | 'DELETE_BOOKING' | 'PUT_CONTENT';
  url: string;
  method: 'PUT' | 'POST' | 'DELETE';
  body?: unknown;
  description: string;
  createdAt: number;
  retryCount: number;
}

const DB_NAME = 'phuket_tatili_offline_v1';
const DB_VERSION = 1;
const STORE_MUTATIONS = 'mutations';
const STORE_CACHE = 'cache';
const FALLBACK_STORAGE_KEY = 'ptt_offline_mutations_queue_v1';
const FALLBACK_CACHE_KEY_PREFIX = 'ptt_offline_cache_';

/** Bellek içi geçici liste (test ve SSR ortamları için) */
const memoryQueue: QueuedMutation[] = [];
const memoryCache = new Map<string, unknown>();

function hasIndexedDB(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/** IndexedDB veritabanı bağlantısı açar */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MUTATIONS)) {
        db.createObjectStore(STORE_MUTATIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

/** Yeni bir işlemi çevrimdışı outbox kuyruğuna ekler */
export async function enqueueMutation(
  mutation: Omit<QueuedMutation, 'id' | 'createdAt' | 'retryCount'>
): Promise<QueuedMutation> {
  const item: QueuedMutation = {
    ...mutation,
    id: `mut-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    retryCount: 0,
  };

  if (hasIndexedDB()) {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_MUTATIONS, 'readwrite');
        const store = tx.objectStore(STORE_MUTATIONS);
        const req = store.add(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      return item;
    } catch {
      // IndexedDB hatası durumunda fallback'e devam et
    }
  }

  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
      const list: QueuedMutation[] = raw ? JSON.parse(raw) : [];
      list.push(item);
      window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(list));
      return item;
    } catch {
      // localStorage doluysa bellek içine ekle
    }
  }

  memoryQueue.push(item);
  return item;
}

/** Bekleyen tüm çevrimdışı mutasyonları tarih sırasına göre listeler */
export async function getPendingMutations(): Promise<QueuedMutation[]> {
  if (hasIndexedDB()) {
    try {
      const db = await openDb();
      return await new Promise<QueuedMutation[]>((resolve, reject) => {
        const tx = db.transaction(STORE_MUTATIONS, 'readonly');
        const store = tx.objectStore(STORE_MUTATIONS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as QueuedMutation[];
          list.sort((a, b) => a.createdAt - b.createdAt);
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback'e devam
    }
  }

  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
      if (raw) {
        const list: QueuedMutation[] = JSON.parse(raw);
        list.sort((a, b) => a.createdAt - b.createdAt);
        return list;
      }
    } catch {
      // fallback
    }
  }

  return [...memoryQueue].sort((a, b) => a.createdAt - b.createdAt);
}

/** Başarıyla gönderilen bir mutasyonu kuyruktan siler */
export async function removeMutation(id: string): Promise<void> {
  if (hasIndexedDB()) {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_MUTATIONS, 'readwrite');
        const store = tx.objectStore(STORE_MUTATIONS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      return;
    } catch {
      // Fallback
    }
  }

  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
      if (raw) {
        const list: QueuedMutation[] = JSON.parse(raw);
        const next = list.filter((m) => m.id !== id);
        window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(next));
        return;
      }
    } catch {
      // fallback
    }
  }

  const idx = memoryQueue.findIndex((m) => m.id === id);
  if (idx >= 0) memoryQueue.splice(idx, 1);
}

/** Kuyruktaki tüm bekleyen işlemleri temizler */
export async function clearPendingMutations(): Promise<void> {
  if (hasIndexedDB()) {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_MUTATIONS, 'readwrite');
        const store = tx.objectStore(STORE_MUTATIONS);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      return;
    } catch {
      // Fallback
    }
  }

  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(FALLBACK_STORAGE_KEY);
    } catch {
      // fallback
    }
  }

  memoryQueue.length = 0;
}

/** Çevrimdışı veri önbelleğine (offline cache) anahtar/veri kaydeder */
export async function setOfflineCache(key: string, data: unknown): Promise<void> {
  if (hasIndexedDB()) {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_CACHE, 'readwrite');
        const store = tx.objectStore(STORE_CACHE);
        const req = store.put({ key, data, cachedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      return;
    } catch {
      // fallback
    }
  }

  if (hasLocalStorage()) {
    try {
      window.localStorage.setItem(`${FALLBACK_CACHE_KEY_PREFIX}${key}`, JSON.stringify(data));
      return;
    } catch {
      // fallback
    }
  }

  memoryCache.set(key, data);
}

/** Çevrimdışı veri önbelleğinden okur */
export async function getOfflineCache<T>(key: string): Promise<T | null> {
  if (hasIndexedDB()) {
    try {
      const db = await openDb();
      return await new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(STORE_CACHE, 'readonly');
        const store = tx.objectStore(STORE_CACHE);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && typeof req.result === 'object' && 'data' in req.result) {
            resolve(req.result.data as T);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      // fallback
    }
  }

  if (hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(`${FALLBACK_CACHE_KEY_PREFIX}${key}`);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // fallback
    }
  }

  return (memoryCache.get(key) as T) ?? null;
}

export interface FlushResult {
  succeeded: number;
  failed: number;
  remaining: number;
}

/**
 * Bekleyen çevrimdışı mutasyonları sunucuya gönderir (Flush Outbox).
 * İnternet bağlantısı geri geldiğinde otomatik tetiklenir.
 */
export async function flushPendingMutations(
  onProgress?: (current: number, total: number, item: QueuedMutation) => void
): Promise<FlushResult> {
  const list = await getPendingMutations();
  if (list.length === 0) {
    return { succeeded: 0, failed: 0, remaining: 0 };
  }

  let succeeded = 0;
  let failed = 0;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    onProgress?.(i + 1, list.length, item);

    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      if (res.ok) {
        await removeMutation(item.id);
        succeeded++;
      } else if (res.status >= 400 && res.status < 500) {
        // İstemci/doğrulama hatası (4xx) — sonsuza kadar kuyrukta kalıp sistemi kilitlemesin
        console.warn(`[OfflineSync] 4xx yanıtı alındı, işlem kuyruktan çıkarıldı:`, item.description, res.status);
        await removeMutation(item.id);
        failed++;
      } else {
        // Sunucu 5xx hatası — daha sonra tekrar denemek üzere döngüyü durdur
        failed++;
        break;
      }
    } catch (networkErr) {
      // Ağ hatası (cihaz halen çevrimdışı veya bağlantı koptu)
      // Kalan mutasyonlar kuyrukta tutulur, döngü sonlanır
      break;
    }
  }

  const remainingList = await getPendingMutations();
  return {
    succeeded,
    failed,
    remaining: remainingList.length,
  };
}
