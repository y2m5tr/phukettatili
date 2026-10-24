import React, { useState } from 'react';
import {
  Database,
  Download,
  FileUp,
  AlertTriangle,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import type { SiteSettingsState } from './settingsTypes';

interface SettingsBackupPasswordSectionProps {
  siteSettings: SiteSettingsState;
  viewerRole?: 'owner' | 'manager' | 'guide' | 'driver' | null;
  showToast?: (msg: string) => void;
}

const STORAGE_BACKUP_KEYS = [
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

export const SettingsBackupPasswordSection: React.FC<SettingsBackupPasswordSectionProps> = ({
  siteSettings,
  viewerRole = null,
  showToast,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sistem Yedekleme (Export JSON)
  const handleExportBackup = () => {
    try {
      const backupData: Record<string, unknown> = {};

      STORAGE_BACKUP_KEYS.forEach((k) => {
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
      a.download = `phuket-tatili-crm-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast?.('💾 Sistem yedeği (JSON) başarıyla indirildi.');
    } catch {
      showToast?.('⚠️ Yedekleme dosyası oluşturulurken hata oluştu.');
    }
  };

  // Sistem Geri Yükleme (Import JSON)
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.storage || typeof parsed.storage !== 'object') {
          showToast?.('⚠️ Hata: Seçilen dosya geçerli bir Phuket Tatili JSON yedeği değil.');
          return;
        }

        if (
          !confirm(
            '⚠️ DİKKAT: Yüklenen yedek dosyasındaki veriler mevcut yerel veritabanınızın üzerine yazılacaktır. Devam etmek istiyor musunuz?'
          )
        ) {
          return;
        }

        let restoredCount = 0;
        Object.entries(parsed.storage).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            localStorage.setItem(
              key,
              typeof value === 'string' ? value : JSON.stringify(value)
            );
            restoredCount++;
          }
        });

        if (parsed.siteSettings) {
          localStorage.setItem('phuket_tatili_crm_site_settings_v2', JSON.stringify(parsed.siteSettings));
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

    STORAGE_BACKUP_KEYS.forEach((k) => localStorage.removeItem(k));
    showToast?.('🧹 Önbellek temizlendi, sayfa yenileniyor...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handlePasswordChange = async (e: React.SyntheticEvent) => {
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
    <div className="space-y-6">
      {/* SİSTEM VERİTABANI YEDEKLEME & GERİ YÜKLEME */}
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
    </div>
  );
};
