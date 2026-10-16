/**
 * Site & Hero Ayarları sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Not: Bu sekme de diğer içerik sekmeleri gibi YEREL kaydeder
 * (localStorage) ve /api/content üzerinden buluta senkronlar.
 */
import { useState } from 'react';
import { Upload, Check, Save, KeyRound, Globe, Coins, Waves, Compass, Zap } from 'lucide-react';

export interface SiteSettingsState {
  whatsappNumber: string;
  email: string;
  siteTitle: string;
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;

  // 1. Üst Duyuru Barı & Hızlı Bağlantılar
  topBarEnabled?: boolean;
  topBarText?: string;

  // 2. Canlı Para Birimleri & Kur Yönetimi
  currencyEnabled?: boolean;
  currencyMode?: 'live' | 'manual';
  customRateTry?: number;
  customRateUsd?: number;
  customRateEur?: number;

  // 3. Phuket Canlı Deniz Durumu & Güvenlik
  marineSentinelEnabled?: boolean;
  marineSentinelMode?: 'auto' | 'manual';
  manualMarineStatus?: 'calm' | 'moderate' | 'severe';
  manualMarineText?: string;
  manualMarineWave?: number;

  // 4. Akıllı Rota & Tur Sihirbazı
  tourWizardEnabled?: boolean;
  tourWizardTitle?: string;
  tourWizardSubtitle?: string;

  // 5. Mobil Hızlı Teklif Çekmecesi
  stickyBookingBarEnabled?: boolean;
}

interface SettingsTabProps {
  siteSettings: SiteSettingsState;
  setSiteSettings: (next: SiteSettingsState) => void;
  settingsSaved: boolean;
  onSave: (e: React.FormEvent) => void;
  /** Görsel URL çözümleyici — AdminDashboard ile aynı davranış. */
  getImageUrl: (img?: string) => string;
  /** Base64 dosya yükleme yardımcısı — AdminDashboard'tan geçer. */
  handleFileUpload: (file: File, cb: (url: string) => void) => void;
  /** Select'te sunulacak görsel seçenekleri (sistem + yüklenen). */
  allImageOptions: string[];
  viewerRole?: 'owner' | 'manager' | 'guide' | 'driver' | null;
  showToast?: (msg: string) => void;
}

export default function SettingsTab({
  siteSettings,
  setSiteSettings,
  settingsSaved,
  onSave,
  getImageUrl,
  handleFileUpload,
  allImageOptions,
  viewerRole = null,
  showToast,
}: SettingsTabProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast?.(`⚠️ ${data.error || 'Şifre güncellenemedi.'}`);
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      showToast?.('✅ Şifreniz güncellendi.');
    } catch {
      showToast?.('⚠️ Ağ hatası — şifre güncellenemedi.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-1">
          Genel İletişim & Ana Sayfa (Hero) Ayarları
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          WhatsApp hattını, site başlığını ve ana sayfanın en üstündeki karşılama metinlerini düzenleyin.
        </p>

        <form onSubmit={onSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                WhatsApp Numarası
              </label>
              <input
                type="text"
                value={siteSettings.whatsappNumber}
                onChange={(e) => setSiteSettings({ ...siteSettings, whatsappNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Ülke koduyla, örn: 66828950665</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                İletişim E-posta Adresi
              </label>
              <input
                type="email"
                value={siteSettings.email}
                onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Instagram Profil Linki
            </label>
            <input
              type="url"
              value={siteSettings.instagramUrl}
              onChange={(e) => setSiteSettings({ ...siteSettings, instagramUrl: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Ana Sayfa Karşılama Alanı (Hero)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Büyük Başlık (Hero Title)
                </label>
                <input
                  type="text"
                  value={siteSettings.heroTitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Alt Açıklama (Hero Subtitle)
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.heroSubtitle}
                  onChange={(e) => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    Hero Arka Plan Fotoğrafı
                  </label>
                  <label className="cursor-pointer px-3 py-1 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Yeni Fotoğraf Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url) => {
                            setSiteSettings({ ...siteSettings, heroImage: url });
                          });
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <select
                    value={siteSettings.heroImage || 'phuket_hero.webp'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroImage: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                  >
                    {allImageOptions.map((img) => (
                      <option key={img} value={img}>
                        {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="veya direkt görsel URL'si girin..."
                    value={siteSettings.heroImage || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, heroImage: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                  />
                </div>

                {siteSettings.heroImage && (
                  <div className="flex items-center gap-3 mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img
                      src={getImageUrl(siteSettings.heroImage)}
                      alt="Hero Önizleme"
                      className="w-20 h-12 object-cover rounded-lg border border-slate-300 dark:border-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                      }}
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                      {siteSettings.heroImage}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* BÖLÜM 2: ÜST DUYURU BARI & BİLET SORGULAMA ARAÇLARI */}
          {/* ==================================================== */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-accent" />
                  <span>Üst Duyuru & Bilgi Çubuğu (Top Announcement Bar)</span>
                </h3>
                <p className="text-xs text-slate-500">Sitenin en üstünde yer alan acente lisansı, para birimi seçici ve hızlı bilet sorgulama barı.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSettings.topBarEnabled !== false}
                  onChange={(e) => setSiteSettings({ ...siteSettings, topBarEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {siteSettings.topBarEnabled !== false && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Duyuru Metni
                </label>
                <input
                  type="text"
                  value={siteSettings.topBarText || '🌴 Phuket Tatili · Resmi TAT Lisanslı VIP Acente · 24/7 Türkçe Destek'}
                  onChange={(e) => setSiteSettings({ ...siteSettings, topBarText: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* BÖLÜM 3: CANLI DÖVİZ & PARA BİRİMİ KONTROLÜ */}
          {/* ==================================================== */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Canlı Para Birimleri & Kur Çevirici (THB ⇄ TRY ⇄ USD ⇄ EUR)</span>
                </h3>
                <p className="text-xs text-slate-500">Ziyaretçilerin sitedeki fiyatları Türk Lirası, Dolar veya Euro olarak görmesini sağlar.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSettings.currencyEnabled !== false}
                  onChange={(e) => setSiteSettings({ ...siteSettings, currencyEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {siteSettings.currencyEnabled !== false && (
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Kur Kaynağı:</label>
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="currencyMode"
                      value="live"
                      checked={siteSettings.currencyMode !== 'manual'}
                      onChange={() => setSiteSettings({ ...siteSettings, currencyMode: 'live' })}
                    />
                    <span>Otomatik Canlı Kurlar (Açık Piyasa API)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="currencyMode"
                      value="manual"
                      checked={siteSettings.currencyMode === 'manual'}
                      onChange={() => setSiteSettings({ ...siteSettings, currencyMode: 'manual' })}
                    />
                    <span>Sabit / Manuel Özel Kurlar</span>
                  </label>
                </div>

                {siteSettings.currencyMode === 'manual' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">1 TRY = X THB</label>
                      <input
                        type="number"
                        step="0.05"
                        value={siteSettings.customRateTry || 1.2}
                        onChange={(e) => setSiteSettings({ ...siteSettings, customRateTry: parseFloat(e.target.value) || 1.2 })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">1 USD = X THB</label>
                      <input
                        type="number"
                        step="0.5"
                        value={siteSettings.customRateUsd || 36.0}
                        onChange={(e) => setSiteSettings({ ...siteSettings, customRateUsd: parseFloat(e.target.value) || 36.0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">1 EUR = X THB</label>
                      <input
                        type="number"
                        step="0.5"
                        value={siteSettings.customRateEur || 39.0}
                        onChange={(e) => setSiteSettings({ ...siteSettings, customRateEur: parseFloat(e.target.value) || 39.0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* BÖLÜM 4: PHUKET CANLI DENİZ DURUMU & GÜVENLİK SENTİNELİ */}
          {/* ==================================================== */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Waves className="w-4 h-4 text-sky-400" />
                  <span>Phuket Canlı Deniz & Hava Durumu Sentineli</span>
                </h3>
                <p className="text-xs text-slate-500">Ana sayfada günlük ada turları deniz durumu, dalga boyu ve kaptan notu paneli.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSettings.marineSentinelEnabled !== false}
                  onChange={(e) => setSiteSettings({ ...siteSettings, marineSentinelEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>

            {siteSettings.marineSentinelEnabled !== false && (
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mod:</label>
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="marineMode"
                      value="auto"
                      checked={siteSettings.marineSentinelMode !== 'manual'}
                      onChange={() => setSiteSettings({ ...siteSettings, marineSentinelMode: 'auto' })}
                    />
                    <span>Otomatik (Canlı Açık Deniz Meteoroloji Radarı)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                    <input
                      type="radio"
                      name="marineMode"
                      value="manual"
                      checked={siteSettings.marineSentinelMode === 'manual'}
                      onChange={() => setSiteSettings({ ...siteSettings, marineSentinelMode: 'manual' })}
                    />
                    <span>Manuel Operatör Duyurusu / Müdahalesi</span>
                  </label>
                </div>

                {siteSettings.marineSentinelMode === 'manual' && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Deniz Durumu Seviyesi</label>
                        <select
                          value={siteSettings.manualMarineStatus || 'calm'}
                          onChange={(e) => setSiteSettings({ ...siteSettings, manualMarineStatus: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                        >
                          <option value="calm">🟢 Sakin & Seyir İçin Mükemmel (&lt;0.8m)</option>
                          <option value="moderate">🟡 Orta Dalgalı (0.8 - 1.8m)</option>
                          <option value="severe">🔴 Liman Uyarısı / Fırtına (&gt;1.8m)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Tahmini Dalga Boyu (Metre)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={siteSettings.manualMarineWave || 0.6}
                          onChange={(e) => setSiteSettings({ ...siteSettings, manualMarineWave: parseFloat(e.target.value) || 0.6 })}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Özel Kaptan & Operasyon Tavsiyesi</label>
                      <input
                        type="text"
                        value={siteSettings.manualMarineText || 'Andaman Denizi sakin ve ada turları için ideal koşullarda.'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, manualMarineText: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* BÖLÜM 5: AKILLI TUR & ROTA SİHİRBAZI */}
          {/* ==================================================== */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>Akıllı Rota & Tur Sihirbazı ("Phuket Tatil Asistanı")</span>
                </h3>
                <p className="text-xs text-slate-500">Ziyaretçilere balayı, aile veya macera profillerine göre otomatik tur paketi önerir.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSettings.tourWizardEnabled !== false}
                  onChange={(e) => setSiteSettings({ ...siteSettings, tourWizardEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {siteSettings.tourWizardEnabled !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Sihirbaz Başlığı</label>
                  <input
                    type="text"
                    value={siteSettings.tourWizardTitle || 'Phuket Tatil Asistanı: Size Özel İdeal Rota'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, tourWizardTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Alt Açıklama</label>
                  <input
                    type="text"
                    value={siteSettings.tourWizardSubtitle || '3 adımda seyahat tarzınızı seçin, uzman rehberlerimizin sizin için hazırladığı en iyi tur kombinasyonunu anında görün.'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, tourWizardSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* BÖLÜM 6: MOBİL SABİT REZERVASYON BARI & ÇEKMECESİ */}
          {/* ==================================================== */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Mobil Hızlı Rezervasyon Barı & Açılır Çekmece</span>
                </h3>
                <p className="text-xs text-slate-500">Tur detay sayfalarında ekranda sabit duran ve tek tıkla tarih/kişi seçtirip WhatsApp'a yönlendiren lüks bar.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteSettings.stickyBookingBarEnabled !== false}
                  onChange={(e) => setSiteSettings({ ...siteSettings, stickyBookingBarEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            {settingsSaved ? (
              <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Ayarlar kaydedildi!
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Ayarları Kaydet</span>
            </button>
          </div>
        </form>
      </div>

      {viewerRole && (
        <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <KeyRound className="w-5 h-5 text-brand-accent" />
            Hesap Şifresini Değiştir
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Üyelik hesabınızın şifresini güncelleyin (en az 10 karakter, harf ve rakam içermeli).
          </p>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 10 karakter, harf + rakam"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-md shadow-brand-primary/20 disabled:opacity-50"
              >
                {isChangingPassword ? 'Güncelleniyor…' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
