import type React from 'react';
import {
  Globe,
  Coins,
  Waves,
  Compass,
  Zap,
  Save,
  Check,
} from 'lucide-react';
import type { SiteSettingsState } from './settingsTypes';

interface SettingsFeaturesSectionProps {
  siteSettings: SiteSettingsState;
  setSiteSettings: (next: SiteSettingsState) => void;
  settingsSaved: boolean;
}

export const SettingsFeaturesSection: React.FC<SettingsFeaturesSectionProps> = ({
  siteSettings,
  setSiteSettings,
  settingsSaved,
}) => {
  return (
    <div className="space-y-6">
      {/* ÜST DUYURU BARI */}
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

      {/* CANLI DÖVİZ & PARA BİRİMİ KONTROLÜ */}
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

      {/* PHUKET CANLI DENİZ DURUMU & GÜVENLİK SENTİNELİ */}
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
                      onChange={(e) => setSiteSettings({ ...siteSettings, manualMarineStatus: e.target.value as 'calm' | 'moderate' | 'severe' })}
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

      {/* AKILLI TUR & ROTA SİHİRBAZI */}
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

      {/* MOBİL SABİT REZERVASYON BARI & ÇEKMECESİ */}
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

      {/* GOOGLE SEARCH CONSOLE & SEO DOĞRULAMA */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🔍</span>
              <span>Google Search Console & SEO Doğrulama</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Google ve Bing arama motorlarında site mülkiyetini doğrulamak ve sitemap indeksini takip etmek için doğrulama anahtarı.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Google Site Verification Kodu (HTML Meta veya Kod)
            </label>
            <input
              type="text"
              placeholder="Örn: google-site-verification=abc123xyz veya doğrudan doğrulama kodu"
              value={siteSettings.googleSiteVerification || ''}
              onChange={(e) => setSiteSettings({ ...siteSettings, googleSiteVerification: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Search Console panelinden alacağınız HTML meta etiketinin <code>content</code> değerini veya kodunu buraya yapıştırabilirsiniz.
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span><strong>Master Sitemap:</strong> <code className="bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">https://phukettatili.com/sitemap.xml</code></span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('https://phukettatili.com/sitemap.xml');
                alert('Sitemap URL panoya kopyalandı! Search Console panelinde "Sitemap\'ler" sekmesine ekleyebilirsiniz.');
              }}
              className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors self-start sm:self-auto cursor-pointer"
            >
              Sitemap URL Kopyala
            </button>
          </div>
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
    </div>
  );
};
