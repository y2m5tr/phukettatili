import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatTransferChangeMessage,
  getNotificationHistory,
  saveNotificationToHistory,
  markAllNotificationsAsRead,
  clearNotificationHistory,
  getNotificationPermissionStatus,
  playLobbyReadyChime,
  type TransferNotificationPayload,
} from '../src/lib/pwaNotifications';

// Node ortamında localStorage mock
const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (k: string) => memoryStore[k] || null,
  setItem: (k: string, v: string) => { memoryStore[k] = v; },
  removeItem: (k: string) => { delete memoryStore[k]; },
  clear: () => { for (const k in memoryStore) delete memoryStore[k]; },
};

(globalThis as any).localStorage = mockLocalStorage;
(globalThis as any).window = globalThis;

describe('PWA Bildirim Motoru (pwaNotifications)', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.restoreAllMocks();
  });

  describe('formatTransferChangeMessage', () => {
    it('transfer saati değişikliği mesajını otel, misafir ve yeni saatle doğru formatlar', () => {
      const payload: TransferNotificationPayload = {
        bookingId: 'BK-101',
        customerName: 'Caner Özkan',
        hotel: 'Centara Grand Beach Resort',
        oldTime: '07:15',
        newTime: '07:45',
        vehicle: 'VIP Minibüs-1',
        roomNumber: '1402',
      };

      const result = formatTransferChangeMessage(payload);

      expect(result.title).toBe('🚐 Transfer Saati Güncellendi!');
      expect(result.body).toContain('Centara Grand Beach Resort (Oda: 1402)');
      expect(result.body).toContain('Caner Özkan');
      expect(result.body).toContain('Yeni Saat: ⏰ 07:45');
      expect(result.body).toContain('(Önceki: 07:15)');
      expect(result.body).toContain('VIP Minibüs-1');
    });

    it('eski saat ve oda numarası olmadığında da temiz metin üretir', () => {
      const payload: TransferNotificationPayload = {
        bookingId: 'BK-102',
        customerName: 'Zeynep Kaya',
        hotel: 'The Shore at Katathani',
        newTime: '08:00',
      };

      const result = formatTransferChangeMessage(payload);

      expect(result.title).toBe('🚐 Transfer Saati Güncellendi!');
      expect(result.body).toContain('The Shore at Katathani');
      expect(result.body).toContain('Zeynep Kaya');
      expect(result.body).toContain('Yeni Saat: ⏰ 08:00');
      expect(result.body).not.toContain('Önceki:');
    });
  });

  describe('Bildirim Geçmişi Depolaması & Yönetimi', () => {
    it('ilk başta bildirim listesi boş döner', () => {
      expect(getNotificationHistory()).toEqual([]);
    });

    it('yeni bildirim eklendiğinde id, zaman damgası ve okunmadı (read=false) olarak kaydeder', () => {
      const saved = saveNotificationToHistory({
        title: 'Test Bildirimi',
        body: 'Bu bir test içeriğidir',
        type: 'time_change',
        bookingId: 'BK-999',
      });

      expect(saved.id).toBeDefined();
      expect(saved.timestamp).toBeDefined();
      expect(saved.read).toBe(false);

      const history = getNotificationHistory();
      expect(history.length).toBe(1);
      expect(history[0].title).toBe('Test Bildirimi');
      expect(history[0].bookingId).toBe('BK-999');
    });

    it('markAllNotificationsAsRead tüm bildirimleri read=true yapar', () => {
      saveNotificationToHistory({
        title: 'Bildirim 1',
        body: 'Detay 1',
        type: 'time_change',
      });
      saveNotificationToHistory({
        title: 'Bildirim 2',
        body: 'Detay 2',
        type: 'vehicle_assigned',
      });

      expect(getNotificationHistory().every((n) => !n.read)).toBe(true);

      markAllNotificationsAsRead();

      const after = getNotificationHistory();
      expect(after.length).toBe(2);
      expect(after.every((n) => n.read)).toBe(true);
    });

    it('clearNotificationHistory tüm bildirimleri siler', () => {
      saveNotificationToHistory({
        title: 'Bildirim 1',
        body: 'Detay 1',
        type: 'time_change',
      });

      expect(getNotificationHistory().length).toBe(1);

      clearNotificationHistory();

      expect(getNotificationHistory().length).toBe(0);
    });
  });

  describe('getNotificationPermissionStatus', () => {
    it('Notification API destekleniyorsa izni okur', () => {
      const status = getNotificationPermissionStatus();
      expect(['granted', 'denied', 'default', 'unsupported']).toContain(status);
    });
    it('playLobbyReadyChime node ortamında çökmeden çalışır', () => {
      expect(() => playLobbyReadyChime()).not.toThrow();
    });
  });
});
