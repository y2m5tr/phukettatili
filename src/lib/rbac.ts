import type { OpsRole } from './auth';
import type { AdminTab } from '../stores/useAdminStore';

export interface RolePermissions {
  /** Rolün erişebileceği sekme listesi */
  allowedTabs: readonly AdminTab[];
  /** Giriş yapıldığında yönlendirilecek varsayılan sekme */
  defaultTab: AdminTab;
  /** Rezervasyonları kalıcı silme yetkisi (yalnızca patron) */
  canDeleteBookings: boolean;
  /** Ekip kullanıcılarını yönetme (yeni hesap açma, rol değiştirme, şifre sıfırlama) */
  canManageUsers: boolean;
  /** Şirket net maliyet, tedarikçi kâr marjı ve hakediş ekstresini görme */
  canViewFinancialMargins: boolean;
  /** Hassas site ayarlarını ve API anahtarlarını değiştirme */
  canManageSettings: boolean;
  /** Yeni rezervasyon oluşturma yetkisi */
  canCreateBookings: boolean;
  /** Şoför ve araç transfer ataması yapabilme */
  canAssignTransfers: boolean;
  /** Excel/CSV dışa aktarma yetkisi */
  canExportData: boolean;
  /** CMS ve Web içeriklerini düzenleyebilme */
  canManageCms: boolean;
}

export const ROLE_PERMISSIONS: Record<OpsRole, RolePermissions> = {
  // 👑 KURUCU / PATRON (Tam Yetki)
  owner: {
    allowedTabs: [
      'overview',
      'bookings',
      'finance',
      'transfers',
      'proposals',
      'partners',
      'settlements',
      'suppliers',
      'fleet',
      'tours',
      'media',
      'services',
      'blogs',
      'faqs',
      'testimonials',
      'whatsapp',
      'settings',
      'users',
    ],
    defaultTab: 'overview',
    canDeleteBookings: true,
    canManageUsers: true,
    canViewFinancialMargins: true,
    canManageSettings: true,
    canCreateBookings: true,
    canAssignTransfers: true,
    canExportData: true,
    canManageCms: true,
  },

  // 👑 ESKİ MASTER ADMIN (Şifre ile giriş — owner ile aynı)
  admin: {
    allowedTabs: [
      'overview',
      'bookings',
      'finance',
      'transfers',
      'proposals',
      'partners',
      'settlements',
      'suppliers',
      'fleet',
      'tours',
      'media',
      'services',
      'blogs',
      'faqs',
      'testimonials',
      'whatsapp',
      'settings',
      'users',
    ],
    defaultTab: 'overview',
    canDeleteBookings: true,
    canManageUsers: true,
    canViewFinancialMargins: true,
    canManageSettings: true,
    canCreateBookings: true,
    canAssignTransfers: true,
    canExportData: true,
    canManageCms: true,
  },

  // 🧭 OPERASYON AMİRİ (DISPATCHER)
  // Operasyon, rezervasyon, transfer, filo ve CMS'i yönetir.
  // Kullanıcı yönetimi, kalıcı rezervasyon silme ve net kâr marjı gizlidir.
  manager: {
    allowedTabs: [
      'overview',
      'bookings',
      'transfers',
      'proposals',
      'partners',
      'suppliers',
      'fleet',
      'tours',
      'media',
      'services',
      'blogs',
      'faqs',
      'testimonials',
      'whatsapp',
    ],
    defaultTab: 'overview',
    canDeleteBookings: false,
    canManageUsers: false,
    canViewFinancialMargins: false,
    canManageSettings: false,
    canCreateBookings: true,
    canAssignTransfers: true,
    canExportData: true,
    canManageCms: true,
  },

  // 🗣️ SAHA OPERASYON / REHBER
  // İskele ve tur operasyonları: transferler, manifestolar, bilet tara, QR check-in
  guide: {
    allowedTabs: ['transfers', 'proposals', 'bookings', 'whatsapp'],
    defaultTab: 'transfers',
    canDeleteBookings: false,
    canManageUsers: false,
    canViewFinancialMargins: false,
    canManageSettings: false,
    canCreateBookings: true,
    canAssignTransfers: false,
    canExportData: false,
    canManageCms: false,
  },

  // 🗣️ ESKİ SAHA ŞİFRESİ (Field)
  field: {
    allowedTabs: ['transfers', 'proposals', 'bookings', 'whatsapp'],
    defaultTab: 'transfers',
    canDeleteBookings: false,
    canManageUsers: false,
    canViewFinancialMargins: false,
    canManageSettings: false,
    canCreateBookings: true,
    canAssignTransfers: false,
    canExportData: false,
    canManageCms: false,
  },

  // 🚐 TRANSFER ŞOFÖRÜ
  // Sadece günün otel/havalimanı transfer manifestosu, uçuş takibi ve biniş durumu
  driver: {
    allowedTabs: ['transfers'],
    defaultTab: 'transfers',
    canDeleteBookings: false,
    canManageUsers: false,
    canViewFinancialMargins: false,
    canManageSettings: false,
    canCreateBookings: false,
    canAssignTransfers: false,
    canExportData: false,
    canManageCms: false,
  },
};

/**
 * Rol için geçerli yetki matrisini döner.
 * Rol belirtilmemişse (root/geliştirici oturumu) en yüksek yetki (owner) atanır.
 */
export function getRolePermissions(role: OpsRole | null | undefined): RolePermissions {
  if (!role) {
    return ROLE_PERMISSIONS.owner;
  }
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.driver;
}

/**
 * Belirli bir sekmenin verilen role izinli olup olmadığını doğrular.
 */
export function isTabAllowed(tab: AdminTab, role: OpsRole | null | undefined): boolean {
  const perms = getRolePermissions(role);
  return perms.allowedTabs.includes(tab);
}

/**
 * Kullanıcı dostu Türkçe rol unvanı ve rozeti
 */
export function getRoleBadge(role: OpsRole | null | undefined): {
  label: string;
  shortRole: string;
  badgeClass: string;
} {
  switch (role) {
    case 'owner':
    case 'admin':
      return {
        label: '👑 Kurucu / Yönetici',
        shortRole: 'Patron',
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      };
    case 'manager':
      return {
        label: '🧭 Operasyon Amiri (Dispatcher)',
        shortRole: 'Dispatcher',
        badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      };
    case 'guide':
    case 'field':
      return {
        label: '🗣️ Saha Rehberi',
        shortRole: 'Rehber',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      };
    case 'driver':
      return {
        label: '🚐 Transfer Şoförü',
        shortRole: 'Şoför',
        badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      };
    default:
      return {
        label: '👑 Yönetici',
        shortRole: 'Yönetici',
        badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      };
  }
}
