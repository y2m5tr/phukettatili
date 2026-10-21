/**
 * Site & Hero Ayarları sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Not: Bu sekme de diğer içerik sekmeleri gibi YEREL kaydeder
 * (localStorage) ve /api/content üzerinden buluta senkronlar.
 */
import { useState } from 'react';
import {
  Upload,
  Check,
  Save,
  KeyRound,
  Globe,
  Coins,
  Waves,
  Compass,
  Zap,
  Download,
  Database,
  FileUp,
  AlertTriangle,
  RefreshCw,
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import type { MediaItem } from '../../data/adminInitialData';
import ImagePickerModal from './ImagePickerModal';

export interface SiteSettingsState {
  whatsappNumber: string;
  email: string;
  siteTitle: string;
  logoUrl?: string;
  logoText?: string;
  instagramUrl: string;
  googleReviewUrl?: string;
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
  mediaList?: MediaItem[];
  viewerRole?: 'owner' | 'manager' | 'guide' | 'driver' | null;
  showToast?: (msg: string) => void;
  /** Panel CMS verisini tek JSON olarak indirir (repo'ya uygulanmak uzere). */
  onExportSiteData?: () => void;
}

export default function SettingsTab({
  siteSettings,
  setSiteSettings,
  settingsSaved,
  onSave,
  getImageUrl,
  handleFileUpload,
  allImageOptions,
  mediaList = [],
  viewerRole = null,
  showToast,
  onExportSiteData,
}: SettingsTabProps) {
  const [isHeroPickerOpen, setIsHeroPickerOpen] = useState(false);
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sistem Yedekleme (Export JSON)
  const handleExportBackup = () => {
    try {
      const backupData: Record<string, unknown> = {};
      const keys = [
        'phuket_tatili_crm_bookings_v2',
        'phuket_tatili_crm_tours_v2',
        'phuket_tatili_crm_blogs_v2',
        'phuket_tatili_crm_services_v2',
        'phuket_tatili_crm_faqs_v2',
        'phuket_tatili_crm_testimonials_v2',
        'phuket_tatili_crm_site_settings_v2',
        'phuket_tatili_crm_media_v2',
        'phuket_tatili_crm_vehicles_v1',
        'phuket_tatili_crm_drivers_v1',
        'phuket_tatili_crm_payments_v1',
        'phuket_tatili_crm_agents_v1',
        'phuket_tatili_crm_suppliers_v1',
        'phuket_tatili_crm_tour_costs_v1',
        'ptt_curated_proposals_vault_v1',
        'ptt_admin_driver_expenses',
        'ptt_admin_guide_expenses',
      ];

      keys.forEach((k) => {
        const item = localStorage.getItem(k);
        if (item) {
          try {
            backupData[k] = JSON.parse(item);
          } catch {
            backupData[k] = item;
          }
        }
      });

      const payload = {
        app: 'Phuket Tatili VIP CRM Operations',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        siteSettings,
        storage: backupData,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `phuket-tatili-sistem-yedek-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast?.('✅ Sistem veritabanı yedeği JSON olarak başarıyla indirildi!');
    } catch {
      showToast?.('⚠️ Yedek dışa aktarılırken bir hata oluştu.');
    }
  };

  // Sistem Yedeğini Geri Yükle (Import JSON)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Geçersiz dosya formatı');
        }

        let restoredCount = 0;
        if (parsed.storage && typeof parsed.storage === 'object') {
          Object.entries(parsed.storage).forEach(([key, val]) => {
            localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
            restoredCount++;
          });
        }

        if (parsed.siteSettings) {
          setSiteSettings(parsed.siteSettings);
          localStorage.setItem('phuket_tatili_crm_site_settings_v2', JSON.stringify(parsed.siteSettings));
          restoredCount++;
        }

        if (restoredCount === 0) {
          showToast?.('⚠️ Seçilen dosyada geçerli CRM verisi bulunamadı.');
          return;
        }

        showToast?.(`✅ ${restoredCount} veri tablosu geri yüklendi! Sayfa yenileniyor...`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch {
        showToast?.('⚠️ Hata: Seçilen dosya geçerli bir Phuket Tatili JSON yedeği değil.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Fabrika Ayarlarına Sıfırla
  const handleClearCache = () => {
    if (
      !confirm(
        '⚠️ DİKKAT: Tarayıcınızdaki tüm yerel rezervasyon, transfer ve içerik önbelleği silinecek ve varsayılan sistem verilerine dönülecektir. Bu işlem geri alınamaz.\n\nDevam etmek istiyor musunuz?'
      )
    ) {
      return;
    }

    const keys = [
      'phuket_tatili_crm_bookings_v2',
      'phuket_tatili_crm_tours_v2',
      'phuket_tatili_crm_blogs_v2',
      'phuket_tatili_crm_services_v2',
      'phuket_tatili_crm_faqs_v2',
      'phuket_tatili_crm_testimonials_v2',
      'phuket_tatili_crm_site_settings_v2',
      'phuket_tatili_crm_media_v2',
      'phuket_tatili_crm_vehicles_v1',
      'phuket_tatili_crm_drivers_v1',
      'phuket_tatili_crm_payments_v1',
      'phuket_tatili_crm_agents_v1',
      'phuket_tatili_crm_suppliers_v1',
      'phuket_tatili_crm_tour_costs_v1',
      'ptt_curated_proposals_vault_v1',
      'ptt_admin_driver_expenses',
      'ptt_admin_guide_expenses',
    ];

    keys.forEach((k) => localStorage.removeItem(k));
    showToast?.('🧹 Önbellek temizlendi, sayfa yenileniyor...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

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
                  onClick={() => setIsLogoPickerOpen(true)}
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
                  onClick={() => setIsHeroPickerOpen(true)}
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

      {/* Site Verisi İndir — repo'ya uygulanan kalıcı CMS akışı */}
      {onExportSiteData && (
        <div className="mt-8 p-5 rounded-2xl border border-brand-accent/30 bg-brand-accent/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Site Verisini İndir (JSON)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
              Turlar, galeriler, SSS ve yorumlar tek JSON dosyasına iner. Bu dosyayı
              repo köküne kopyalayıp <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">npx tsx scripts/apply-cms.ts</code>
              ile içerik dosyalarına uygularsınız — değişiklikler push sonrası canlıya yansır.
            </p>
          </div>
          <button
            type="button"
            onClick={onExportSiteData}
            className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shadow-md whitespace-nowrap flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            JSON İndir
          </button>
        </div>
      )}
      </div>

      {/* ========================================================= */}
      {/* 💾 SİSTEM VERİTABANI YEDEKLEME & GERİ YÜKLEME (JSON BACKUP / RESTORE) */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-brand-primary" />
              Sistem Veritabanı & Güvenlik Yedeği (JSON)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tüm rezervasyonları, teklifleri, maliyetleri, şoför ve tedarikçi kayıtlarını tek tıkla cihazınıza indirin veya başka bir cihazdan geri yükleyin.
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            🛡️ %100 Çevrimdışı Güvenlik
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Yedek İndir */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-1">
                <Download className="w-4 h-4 text-brand-primary" />
                <span>Yedek Al (JSON İndir)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Tüm rezervasyonlar, teklifler, transferler ve site ayarlarını tarih damgalı JSON dosyası olarak indirir.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON Yedeği İndir</span>
            </button>
          </div>

          {/* 2. Yedekten Geri Yükle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm mb-1">
                <FileUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Yedekten Geri Yükle</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Daha önce indirdiğiniz bir JSON yedeğini yükleyerek tüm verileri sisteme eksiksiz geri yükler.
              </p>
            </div>
            <label className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer">
              <FileUp className="w-3.5 h-3.5" />
              <span>JSON Dosyası Seç</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportBackup}
              />
            </label>
          </div>

          {/* 3. Fabrika Ayarlarına Dön */}
          <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Önbelleği Temizle</span>
              </div>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                Tarayıcı yerel hafızasındaki tüm CRM verilerini siler ve ilk başlangıç verilerine döndürür.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-800 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sıfırla (Fabrika Ayarları)</span>
            </button>
          </div>
        </div>
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

      {isHeroPickerOpen && (
        <ImagePickerModal
          isOpen={isHeroPickerOpen}
          onClose={() => setIsHeroPickerOpen(false)}
          title="Ana Sayfa Hero Görselini Seç"
          currentValue={siteSettings.heroImage}
          onSelect={(url) => setSiteSettings({ ...siteSettings, heroImage: url })}
          mediaList={mediaList}
          allImageOptions={allImageOptions}
          getImageUrl={getImageUrl}
          handleFileUpload={handleFileUpload}
        />
      )}

      {isLogoPickerOpen && (
        <ImagePickerModal
          isOpen={isLogoPickerOpen}
          onClose={() => setIsLogoPickerOpen(false)}
          title="Sol Üst Logo Görselini Seç"
          currentValue={siteSettings.logoUrl || '/assets/logo-main-transparent.png'}
          onSelect={(url) => {
            setSiteSettings({ ...siteSettings, logoUrl: url });
            setIsLogoPickerOpen(false);
          }}
          mediaList={mediaList}
          allImageOptions={allImageOptions}
          getImageUrl={getImageUrl}
          handleFileUpload={handleFileUpload}
        />
      )}
    </div>
  );
}
