import type React from 'react';
import {
  Upload,
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import type { SiteSettingsState } from './settingsTypes';

interface SettingsGeneralHeroSectionProps {
  siteSettings: SiteSettingsState;
  setSiteSettings: (next: SiteSettingsState) => void;
  getImageUrl: (img?: string) => string;
  handleFileUpload: (file: File, cb: (url: string) => void) => void;
  allImageOptions: string[];
  showToast?: (msg: string) => void;
  onOpenLogoPicker: () => void;
  onOpenHeroPicker: () => void;
}

export const SettingsGeneralHeroSection: React.FC<SettingsGeneralHeroSectionProps> = ({
  siteSettings,
  setSiteSettings,
  getImageUrl,
  handleFileUpload,
  allImageOptions,
  showToast,
  onOpenLogoPicker,
  onOpenHeroPicker,
}) => {
  return (
    <div className="space-y-5">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div>
          <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Google Haritalar / Yorum Linki
          </label>
          <input
            type="url"
            placeholder="https://g.page/r/.../review"
            value={siteSettings.googleReviewUrl || ''}
            onChange={(e) => setSiteSettings({ ...siteSettings, googleReviewUrl: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            Rezervasyonlar sekmesindeki 5 yıldız butonuyla misafire atılacak bağlantı
          </span>
        </div>
      </div>

      {/* Sol Üst Logo & Marka Kimliği */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>🎨</span>
              <span>Sol Üst Logo & Marka Kimliği</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sitenin tüm sayfalarının sol üst menüsünde (Header) ve alt bilgi (Footer) alanında görünen logo ve marka metni.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          {/* Canlı Önizleme Çift Ekranı: Açık ve Koyu Zemin */}
          <div>
            <span className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
              Canlı Logo Önizleme (Açık Menü ve Koyu Menü / Footer)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Açık Zemin Önizlemesi */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={getImageUrl(siteSettings.logoUrl || '/assets/logo-main-transparent.png')}
                    alt="Logo Açık Zemin"
                    className="h-10 w-auto object-contain max-w-[120px]"
                  />
                  <span className="font-serif text-lg font-bold text-slate-900 tracking-tight">
                    {siteSettings.logoText || 'Phuket Tatili'}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  Gündüz Menü
                </span>
              </div>

              {/* Koyu Zemin Önizlemesi */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={getImageUrl(siteSettings.logoUrl || '/assets/logo-main-transparent.png')}
                    alt="Logo Koyu Zemin"
                    className="h-10 w-auto object-contain max-w-[120px] brightness-0 invert opacity-95"
                  />
                  <span className="font-serif text-lg font-bold text-white tracking-tight">
                    {siteSettings.logoText || 'Phuket Tatili'}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full shrink-0">
                  Gece / Footer
                </span>
              </div>
            </div>
          </div>

          {/* Logo Değiştirme Butonları & Kontroller */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>PC'den Yeni Logo Yükle</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, (url) => {
                      setSiteSettings({ ...siteSettings, logoUrl: url });
                      showToast?.('✅ Yeni logo yüklendi ve seçildi.');
                    });
                  }
                  e.target.value = '';
                }}
              />
            </label>

            <button
              type="button"
              onClick={onOpenLogoPicker}
              className="px-3.5 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>🖼️ Önizlemeli Seç</span>
            </button>

            <select
              value={siteSettings.logoUrl || '/assets/logo-main-transparent.png'}
              onChange={(e) => setSiteSettings({ ...siteSettings, logoUrl: e.target.value })}
              className="flex-1 min-w-[180px] px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
            >
              <option value="/assets/logo-main-transparent.png">Orijinal Şeffaf Logo (/assets/logo-main-transparent.png)</option>
              {allImageOptions.map((img) => (
                <option key={`logo-${img}`} value={img}>
                  {img}
                </option>
              ))}
            </select>

            {siteSettings.logoUrl && siteSettings.logoUrl !== '/assets/logo-main-transparent.png' && (
              <button
                type="button"
                onClick={() => {
                  setSiteSettings({ ...siteSettings, logoUrl: '/assets/logo-main-transparent.png' });
                  showToast?.('Orijinal logoya dönüldü.');
                }}
                className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                title="Varsayılan orijinal logoya sıfırla"
              >
                Varsayılana Sıfırla
              </button>
            )}
          </div>

          {/* Logo Metni Düzenleme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Logo Yanı Marka Metni
              </label>
              <input
                type="text"
                value={siteSettings.logoText ?? 'Phuket Tatili'}
                onChange={(e) => setSiteSettings({ ...siteSettings, logoText: e.target.value })}
                placeholder="Örn: Phuket Tatili"
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Menüde logonun hemen yanında yazacak metin.
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Logo Dosya Yolu / URL
              </label>
              <input
                type="text"
                value={siteSettings.logoUrl || '/assets/logo-main-transparent.png'}
                onChange={(e) => setSiteSettings({ ...siteSettings, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-500 dark:text-slate-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Aktif logo kaynağı (CDN veya yerel yol).
              </span>
            </div>
          </div>
        </div>
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

            <button
              type="button"
              onClick={onOpenHeroPicker}
              className="w-full py-2.5 px-4 mb-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>🖼️ Hero Fotoğrafını Görerek Seç (Önizlemeli Kütüphane)</span>
            </button>

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
    </div>
  );
};
