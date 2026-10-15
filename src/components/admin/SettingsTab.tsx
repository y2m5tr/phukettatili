/**
 * Site & Hero Ayarları sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Not: Bu sekme de diğer içerik sekmeleri gibi YEREL kaydeder
 * (localStorage). Site Ayarları'ndaki değişiklik canlı sitenin
 * src/content/settings/site.json'una yazılmaz. Canlıya yansıtma
 * ayrı bir iş maddesidir (Keystatic entegrasyonu).
 */
import { Upload, Check, Save } from 'lucide-react';

export interface SiteSettingsState {
  whatsappNumber: string;
  email: string;
  siteTitle: string;
  instagramUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
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
}

export default function SettingsTab({
  siteSettings,
  setSiteSettings,
  settingsSaved,
  onSave,
  getImageUrl,
  handleFileUpload,
  allImageOptions,
}: SettingsTabProps) {
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
    </div>
  );
}
