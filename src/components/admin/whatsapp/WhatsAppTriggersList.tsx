import React from 'react';
import {
  Clock,
  Car,
  Star,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Filter,
} from 'lucide-react';
import type { WhatsAppNotification, WhatsAppTriggerType } from '../../../lib/whatsappEngine';

export interface WhatsAppTriggersListProps {
  stats: {
    t24: number;
    arrived: number;
    review: number;
    balance: number;
    total: number;
  };
  triggerFilter: 'all' | WhatsAppTriggerType;
  setTriggerFilter: (f: 'all' | WhatsAppTriggerType) => void;
  filteredTriggers: WhatsAppNotification[];
  copiedId: string | null;
  onCopyText: (text: string, id: string) => void;
  onDispatchNotification: (notif: WhatsAppNotification) => void;
}

export function WhatsAppTriggersList({
  stats,
  triggerFilter,
  setTriggerFilter,
  filteredTriggers,
  copiedId,
  onCopyText,
  onDispatchNotification,
}: WhatsAppTriggersListProps) {
  return (
    <div className="space-y-6">
      {/* İstatistik Metrik Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <button
          type="button"
          onClick={() => setTriggerFilter('t24_reminder')}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            triggerFilter === 't24_reminder'
              ? 'bg-emerald-500/10 border-emerald-500/40 dark:bg-emerald-500/15'
              : 'bg-white dark:bg-surface-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              T-24h Hatırlatma
            </span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.t24}</div>
          <p className="text-[10px] text-slate-400 mt-1">Yarınki tur misafirleri</p>
        </button>

        <button
          type="button"
          onClick={() => setTriggerFilter('driver_arrived')}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            triggerFilter === 'driver_arrived'
              ? 'bg-blue-500/10 border-blue-500/40 dark:bg-blue-500/15'
              : 'bg-white dark:bg-surface-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Araç Lobide
            </span>
            <Car className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.arrived}</div>
          <p className="text-[10px] text-slate-400 mt-1">Bugünkü tur alınışları</p>
        </button>

        <button
          type="button"
          onClick={() => setTriggerFilter('review_booster')}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            triggerFilter === 'review_booster'
              ? 'bg-amber-500/10 border-amber-500/40 dark:bg-amber-500/15'
              : 'bg-white dark:bg-surface-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Review Booster
            </span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.review}</div>
          <p className="text-[10px] text-slate-400 mt-1">Google 5★ yorum bekleyen</p>
        </button>

        <button
          type="button"
          onClick={() => setTriggerFilter('balance_alert')}
          className={`p-4 rounded-2xl border transition-all text-left cursor-pointer ${
            triggerFilter === 'balance_alert'
              ? 'bg-rose-500/10 border-rose-500/40 dark:bg-rose-500/15'
              : 'bg-white dark:bg-surface-2 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Kalan Bakiye
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.balance}</div>
          <p className="text-[10px] text-slate-400 mt-1">Nakit Baht uyarısı</p>
        </button>
      </div>

      {/* Filtre Barı */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-surface-2 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Filtrele:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTriggerFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                triggerFilter === 'all'
                  ? 'bg-brand-accent text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Tümü ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setTriggerFilter('t24_reminder')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                triggerFilter === 't24_reminder'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              T-24h ({stats.t24})
            </button>
            <button
              type="button"
              onClick={() => setTriggerFilter('driver_arrived')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                triggerFilter === 'driver_arrived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Araç Lobide ({stats.arrived})
            </button>
            <button
              type="button"
              onClick={() => setTriggerFilter('review_booster')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                triggerFilter === 'review_booster'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Yorum ({stats.review})
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          {filteredTriggers.length} bekleyen bildirim
        </div>
      </div>

      {/* Bildirim Kuyruğu Listesi */}
      {filteredTriggers.length === 0 ? (
        <div className="bg-white dark:bg-surface-2 p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Harika! Bekleyen Otomatik Bildirim Yok
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Tüm yarınki turlar hatırlatılmış, araçlar yönlendirilmiş ve değerlendirmeler tamamlanmıştır.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTriggers.map((notif) => {
            const isCopied = copiedId === notif.id;

            const badgeBg =
              notif.type === 't24_reminder'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : notif.type === 'driver_arrived'
                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                : notif.type === 'review_booster'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20';

            return (
              <div
                key={notif.id}
                className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  {/* Üst Başlık Satırı */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider mb-1.5 ${badgeBg}`}
                      >
                        {notif.title}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {notif.customerName}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      {notif.phone}
                    </span>
                  </div>

                  {/* Tur ve Saat Bilgisi */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 mb-3">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      🏝️ {notif.tourTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>📅 {notif.tourDate}</span>
                      <span>•</span>
                      <span>⏰ Lobi: {notif.pickupTime}</span>
                    </div>
                  </div>

                  {/* Önizleme Kutusuna Kısaltılmış Metin */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 text-[11px] font-mono text-slate-700 dark:text-slate-300 max-h-24 overflow-y-auto whitespace-pre-line border border-slate-100 dark:border-slate-800/80 mb-3">
                    {notif.message.slice(0, 220)}...
                  </div>
                </div>

                {/* Alt Aksiyon Butonları */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onCopyText(notif.message, notif.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Mesajı panoya kopyala"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopyala</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDispatchNotification(notif)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-whatsapp hover:bg-whatsapp-dark text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp'ta Aç & Gönder</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
