import { useState, useEffect } from 'react';
import {
  X,
  Wifi,
  WifiOff,
  Phone,
  Radio,
  Download,
  Search,
  AlertTriangle,
  Hotel,
  Smartphone,
} from 'lucide-react';
import {
  CAPTAIN_EMERGENCY_CONTACTS,
  CAPTAIN_VHF_CHANNELS,
  cacheDailyManifestForOffline,
  getCachedOfflineManifest,
  type CachedOfflineSnapshot,
} from '../../lib/offlineCaptainVault';
import type { PickupItem } from '../../lib/adminFilters';
import { fmtMoney } from '../../lib/moneyFormat';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  pickups: PickupItem[];
  showToast: (msg: string) => void;
}

export default function CaptainOfflineDrawer({
  isOpen,
  onClose,
  currentDate,
  pickups = [],
  showToast,
}: Props) {
  if (!isOpen) return null;

  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [activeTab, setActiveTab] = useState<'manifest' | 'emergency' | 'pwa_guide'>('manifest');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cachedSnapshot, setCachedSnapshot] = useState<CachedOfflineSnapshot | null>(null);

  useEffect(() => {
    // Çevrimdışı dinleyicileri
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Güncel veriyi hemen yerel hafızaya yedekle
    if (pickups.length > 0) {
      const snap = cacheDailyManifestForOffline(currentDate, pickups);
      setCachedSnapshot(snap);
    } else {
      const existing = getCachedOfflineManifest(currentDate);
      if (existing) setCachedSnapshot(existing);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentDate, pickups]);

  const activePickups = pickups.length > 0 ? pickups : cachedSnapshot?.pickups || [];

  const filteredPickups = activePickups.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.customerName || '').toLowerCase().includes(q) ||
      (p.hotel || '').toLowerCase().includes(q) ||
      (p.roomNumber || '').toLowerCase().includes(q) ||
      (p.tourTitle || '').toLowerCase().includes(q)
    );
  });

  const handleManualCacheSync = () => {
    const snap = cacheDailyManifestForOffline(currentDate, pickups);
    setCachedSnapshot(snap);
    showToast(`✅ ${pickups.length} yolcu kaydı çevrimdışı hafızaya başarıyla kilitlendi!`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex justify-end animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800">
        
        {/* ÜST BAŞLIK & BAĞLANTI DURUMU */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
              }`}
            >
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Andaman Denizi Çevrimdışı Kaptan Kasası
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isOnline
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  }`}
                >
                  {isOnline ? '🟢 Çevrimiçi' : '📶 Çevrimdışı Mod (Deniz)'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {cachedSnapshot
                  ? `${activePickups.length} yolcu hafızada · Son yedek: ${new Date(
                      cachedSnapshot.cachedAt
                    ).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
                  : 'Similan / Phi Phi açıklarında internet kesilse bile çalışır.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEKME DÜĞMELERİ */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 p-1.5 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('manifest')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'manifest'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📋 Çevrimdışı Manifesto ({activePickups.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'emergency'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🆘 Acil Arama & Telsiz
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pwa_guide')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer text-center ${
              activeTab === 'pwa_guide'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📲 PWA Yükle
          </button>
        </div>

        {/* İÇERİK ALANI */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: ÇEVRİMDIŞI MANİFESTO & YOLCU LİSTESİ */}
          {activeTab === 'manifest' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="İnternetsiz yolcu, otel veya oda ara..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleManualCacheSync}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  title="Tüm manifestoyu yerel hafızaya hemen kilitle"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hafızayı Yenile</span>
                </button>
              </div>

              {filteredPickups.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-400 space-y-1 text-xs">
                  <p className="font-bold text-slate-600 dark:text-slate-300">Kayıt Bulunamadı</p>
                  <p>Bu tarihe ait çevrimdışı önbellekte eşleşen misafir bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredPickups.map((p, idx) => (
                    <div
                      key={`${p.bookingId}-${p.tourIndex || idx}`}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white block">
                            {p.customerName}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Hotel className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>
                              {p.hotel}
                              {p.roomNumber ? ` (Oda: ${p.roomNumber})` : ''}
                            </span>
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 block">
                            {p.pickupTime || '07:30'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {p.adultCount || 1} Yetişkin {(p.childCount || 0) > 0 ? `+ ${p.childCount}Ç` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          ⛵ {p.tourTitle}
                        </span>

                        <div>
                          {p.remainingAmountThb > 0 ? (
                            <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                              Alınacak: {fmtMoney(p.remainingAmountThb)} ฿
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓ Tamamı Ödendi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACİL DURUM REHBERİ & VHF TELSİZ KANALLARI */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>
                  Andaman Denizi'nde acil durumlarda telefon çekmese bile VHF Telsiz Kanal 16'dan çağrı yapabilirsiniz.
                </span>
              </div>

              {/* TEK TUŞLA ACİL NUMARALAR */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  📞 Tek Dokunuşla Acil Arama Hattı:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CAPTAIN_EMERGENCY_CONTACTS.map((c) => (
                    <a
                      key={c.id}
                      href={c.telUri}
                      className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-amber-500 hover:bg-amber-500/5 transition-all flex items-start gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {c.title}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 block mt-0.5">
                          {c.number}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {c.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* VHF TELSİZ KANALLARI */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-sky-500" />
                  <span>VHF Deniz Telsizi Acil & Liman Frekansları:</span>
                </h4>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-950/60 overflow-hidden text-xs">
                  {CAPTAIN_VHF_CHANNELS.map((ch) => (
                    <div key={ch.channel} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {ch.channel} ({ch.frequency})
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ch.usage}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-bold shrink-0">
                        Aktif
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PWA KURULUM REHBERİ */}
          {activeTab === 'pwa_guide' && (
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Uygulamayı Ana Ekrana Ekleyin (PWA)</h4>
                  <p className="text-xs mt-0.5">
                    Safari veya Chrome üzerinden telefonunuzun ana ekranına yükleyerek tek dokunuşla tam ekran yerel bir uygulama gibi kullanabilirsiniz.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* iOS Safari */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                    <span>🍎 iPhone (Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <li>Safari ile <strong>phukettatili.com/admin</strong> sayfasına girin.</li>
                    <li>Alt bardaki <strong>Paylaş (Share)</strong> simgesine dokunun.</li>
                    <li>Aşağı kaydırıp <strong>"Ana Ekrana Ekle"</strong> seçeneğini seçin.</li>
                    <li>Sağ üstteki <strong>Ekle</strong> butonuna dokunun.</li>
                  </ol>
                </div>

                {/* Android Chrome */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                    <span>🤖 Android (Chrome)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                    <li>Chrome ile panele giriş yapın.</li>
                    <li>Sağ üstteki <strong>üç nokta (⋮)</strong> menüsüne dokunun.</li>
                    <li><strong>"Uygulamayı Yükle"</strong> veya <strong>"Ana Ekrana Ekle"</strong> butonuna basın.</li>
                    <li>Onaylayın, ana ekranınızda Phuket Tatili ikonu belirecektir.</li>
                  </ol>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-500">
                💡 <strong>Çevrimdışı Çalışma Kuralı:</strong> İskeleden ayrılmadan önce uygulamayı açık tutup hafızanın güncellenmesini sağlayınız. Andaman Denizi açıklarında internet tamamen kesilse bile günün tüm transferleri ve oda numaraları ekranda kalacaktır.
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
