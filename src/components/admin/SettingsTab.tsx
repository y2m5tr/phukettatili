import { useState } from 'react';
import ImagePickerModal from './ImagePickerModal';
import type { SiteSettingsState, SettingsTabProps } from './settings/settingsTypes';
import { SettingsGeneralHeroSection } from './settings/SettingsGeneralHeroSection';
import { SettingsFeaturesSection } from './settings/SettingsFeaturesSection';
import { SettingsBackupPasswordSection } from './settings/SettingsBackupPasswordSection';
import { SettingsInclusionLibrarySection } from './settings/SettingsInclusionLibrarySection';

export type { SiteSettingsState, SettingsTabProps };

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
  inclusionLibrary,
  onRememberOption,
  onForgetOption,
}: SettingsTabProps) {
  const [isHeroPickerOpen, setIsHeroPickerOpen] = useState(false);
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);

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
          <SettingsGeneralHeroSection
            siteSettings={siteSettings}
            setSiteSettings={setSiteSettings}
            getImageUrl={getImageUrl}
            handleFileUpload={handleFileUpload}
            allImageOptions={allImageOptions}
            showToast={showToast}
            onOpenLogoPicker={() => setIsLogoPickerOpen(true)}
            onOpenHeroPicker={() => setIsHeroPickerOpen(true)}
          />

          <SettingsFeaturesSection
            siteSettings={siteSettings}
            setSiteSettings={setSiteSettings}
            settingsSaved={settingsSaved}
          />
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

      {/* MERKEZİ DAHİL/HARİÇ HAVUZU YÖNETİMİ */}
      <SettingsInclusionLibrarySection
        inclusionLibrary={inclusionLibrary}
        onRememberOption={onRememberOption}
        onForgetOption={onForgetOption}
        showToast={showToast}
      />

      {/* SİSTEM VERİTABANI YEDEKLEME & ŞİFRE */}
      <SettingsBackupPasswordSection
        siteSettings={siteSettings}
        viewerRole={viewerRole}
        showToast={showToast}
      />

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
