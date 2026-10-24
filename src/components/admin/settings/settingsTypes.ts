import type React from 'react';
import type { MediaItem } from '../../../data/adminInitialData';

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
  googleSiteVerification?: string;

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

export interface SettingsTabProps {
  siteSettings: SiteSettingsState;
  setSiteSettings: (next: SiteSettingsState) => void;
  settingsSaved: boolean;
  onSave: (e: React.SyntheticEvent) => void;
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
