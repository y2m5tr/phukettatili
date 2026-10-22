/**
 * PWA Anlık Bildirim Motoru (Web Push & Transfer Saati Güncellemeleri)
 *
 * Şoför, rehber ve saha operasyon ekibine transfer saatleri veya rota durakları
 * değiştiğinde telefonlarına anında işletim sistemi seviyesinde push bildirim gönderir.
 *
 * YETENEKLER:
 * 1. İzin Yönetimi (Notification.requestPermission)
 * 2. Service Worker & Yerel Bildirim Tetikleme (showNotification)
 * 3. Web Audio API tabanlı 0-gecikmeli kristal bildirim sesi (chime)
 * 4. Titreşim Deseni (Mobile Vibration API)
 * 5. Bildirim Geçmişi & Bildirim Merkezi Depolaması (localStorage)
 * 6. Bulut Gerçek Zamanlı Dağıtım (/api/notifications/push)
 */

export interface TransferNotificationPayload {
  bookingId: string;
  customerName: string;
  hotel: string;
  oldTime?: string;
  newTime: string;
  vehicle?: string;
  driverName?: string;
  driverId?: string;
  tourTitle?: string;
  roomNumber?: string;
  phone?: string;
}

export interface CrewNotificationItem {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  type: 'time_change' | 'vehicle_assigned' | 'general';
  bookingId?: string;
  read: boolean;
  url?: string;
}

const STORAGE_KEY_NOTIFICATIONS = 'ptt_notification_history';
const MAX_STORED_NOTIFICATIONS = 30;

/**
 * Bildirim izni durumunu döner.
 */
export function getNotificationPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Kullanıcıdan/Şoförden bildirim izni talep eder.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.warn('[PWA Notification] İzin isteme hatası:', err);
    return false;
  }
}

/**
 * Web Audio API ile sıfır gecikmeli, harici dosya indirmeden iki tonlu zil sesi çalar.
 */
export function playNotificationChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // İki tonlu hoş operasyon melodisi (D5 -> A5)
    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // Re (D5)
    osc.frequency.setValueAtTime(880.0, now + 0.12); // La (A5)

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch {
    // Tarayıcı otomatik oynatma politikası engellerse sessizce geç
  }
}

/**
 * Misafir otel lobisinde 'Hazırım' butonuna bastığında çalan üç tonlu melodik uyarı (Do -> Mi -> Sol)
 */
export function playLobbyReadyChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Üç tonlu neşeli 'hazırım' melodisi (C5 -> E5 -> G5)
    osc.type = 'triangle';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(523.25, now); // Do (C5)
    osc.frequency.setValueAtTime(659.25, now + 0.1); // Mi (E5)
    osc.frequency.setValueAtTime(783.99, now + 0.2); // Sol (G5)

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.start(now);
    osc.stop(now + 0.55);
  } catch {
    // Tarayıcı otomatik oynatma politikası engellerse sessizce geç
  }
}

/**
 * Transfer saati değişikliği için başlık ve gövde metnini standartlaştırır.
 */
export function formatTransferChangeMessage(payload: TransferNotificationPayload): {
  title: string;
  body: string;
} {
  const title = '🚐 Transfer Saati Güncellendi!';
  const room = payload.roomNumber ? ` (Oda: ${payload.roomNumber})` : '';
  const vehiclePart = payload.vehicle ? ` · 🚐 ${payload.vehicle}` : '';
  const oldTimePart = payload.oldTime && payload.oldTime !== payload.newTime ? ` (Önceki: ${payload.oldTime})` : '';

  const body = `📍 ${payload.hotel}${room} · 👤 ${payload.customerName}\nYeni Saat: ⏰ ${payload.newTime}${oldTimePart}${vehiclePart}`;

  return { title, body };
}

/**
 * Yerel hafızadaki bildirim geçmişini okur.
 */
export function getNotificationHistory(): CrewNotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Bildirim geçmişine yeni bir bildirim ekler.
 */
export function saveNotificationToHistory(notification: Omit<CrewNotificationItem, 'id' | 'timestamp' | 'read'>): CrewNotificationItem {
  const history = getNotificationHistory();
  const newItem: CrewNotificationItem = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const updated = [newItem, ...history].slice(0, MAX_STORED_NOTIFICATIONS);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ptt:notification:updated', { detail: { items: updated } }));
    } catch {}
  }

  return newItem;
}

/**
 * Tüm bildirimleri okundu olarak işaretler.
 */
export function markAllNotificationsAsRead(): void {
  const history = getNotificationHistory();
  const updated = history.map((n) => ({ ...n, read: true }));
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('ptt:notification:updated', { detail: { items: updated } }));
    } catch {}
  }
}

/**
 * Bildirim geçmişini tamamen temizler.
 */
export function clearNotificationHistory(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
      window.dispatchEvent(new CustomEvent('ptt:notification:updated', { detail: { items: [] } }));
    } catch {}
  }
}

/**
 * Şoföre ve rehbere anlık PWA bildirimi gönderir.
 * - Tarayıcı bildirimini patlatır.
 * - Zil sesi çalar.
 * - Titreşim gönderir.
 * - Bildirim merkezine kaydeder.
 * - Arka planda /api/notifications/push uç noktasına iletir.
 */
export async function sendTransferPushNotification(payload: TransferNotificationPayload): Promise<boolean> {
  const { title, body } = formatTransferChangeMessage(payload);

  // 1. Bildirim merkezine kaydet
  saveNotificationToHistory({
    title,
    body,
    type: 'time_change',
    bookingId: payload.bookingId,
    url: '/admin?tab=transfers',
  });

  // 2. Ses ve Titreşim
  playNotificationChime();
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 200]);
    } catch {}
  }

  // 3. İşletim Sistemi / Tarayıcı Bildirimi (PWA Native Notification)
  let notificationShown = false;
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          const swOptions: any = {
            body,
            icon: '/assets/logo-main-transparent.png',
            badge: '/favicon.svg',
            tag: `transfer-${payload.bookingId}-${Date.now()}`,
            data: { url: '/admin?tab=transfers', bookingId: payload.bookingId },
            vibrate: [200, 100, 200],
          };
          await registration.showNotification(title, swOptions);
          notificationShown = true;
        }
      }

      if (!notificationShown) {
        // Fallback: Standart Web Notification
        new Notification(title, {
          body,
          icon: '/assets/logo-main-transparent.png',
          tag: `transfer-${payload.bookingId}`,
        });
        notificationShown = true;
      }
    } catch (err) {
      console.warn('[PWA Notification] Bildirim gösterilemedi:', err);
    }
  }

  // 4. Arka plan API çağrısı (diğer cihazlara/şoförlere yayın yapma - best effort)
  try {
    fetch('/api/notifications/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body,
        payload,
        targetRole: 'driver',
        driverId: payload.driverId,
      }),
    }).catch(() => {});
  } catch {}

  return notificationShown;
}
