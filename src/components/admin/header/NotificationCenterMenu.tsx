
import { Bell, BellRing, Trash2 } from 'lucide-react';
import type { CrewNotificationItem } from '../../../lib/pwaNotifications';

export interface NotificationCenterMenuProps {
  isOpen: boolean;
  setIsOpen: (v: boolean | ((prev: boolean) => boolean)) => void;
  unreadCount: number;
  notifications: CrewNotificationItem[];
  permissionStatus: string;
  onClearHistory: () => void;
  onRequestPermission: () => Promise<void>;
  onSendTestPush: () => Promise<void>;
  onToggle: () => void;
}

export function NotificationCenterMenu({
  isOpen,
  setIsOpen,
  unreadCount,
  notifications,
  permissionStatus,
  onClearHistory,
  onRequestPermission,
  onSendTestPush,
  onToggle,
}: NotificationCenterMenuProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-all cursor-pointer"
        title="Şoför & Saha PWA Push Bildirim Merkezi"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-amber-500 animate-bounce" />
        ) : (
          <Bell className="w-4 h-4 text-slate-400 hover:text-slate-200" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-black min-w-[17px] text-center shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Bildirim Paneli Açılır Menüsü */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-surface-1 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Başlık */}
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <span className="text-base">🔔</span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Saha & Şoför Bildirimleri
                </h4>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Temizle</span>
                </button>
              )}
            </div>

            {/* İzin Durumu Banner'ı */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800/80">
              {permissionStatus === 'granted' ? (
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Push Bildirimleri Aktif
                  </span>
                  <button
                    type="button"
                    onClick={onSendTestPush}
                    className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold transition cursor-pointer"
                  >
                    Test Gönder
                  </button>
                </div>
              ) : permissionStatus === 'denied' ? (
                <div className="text-[11px] text-rose-600 dark:text-rose-400">
                  ⚠️ Bildirimler tarayıcıda engellenmiş. Adres çubuğundaki kilit simgesinden izin verebilirsiniz.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onRequestPermission}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Telefon Bildirimlerini Etkinleştir</span>
                </button>
              )}
            </div>

            {/* Bildirim Listesi */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-semibold">Henüz bildirim yok</p>
                  <p className="text-[10px] text-slate-500">
                    Transfer saati veya araç atamaları güncellendiğinde şoför ve ekibe burada anlık liste gösterilir.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      !notif.read ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">
                      {notif.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
