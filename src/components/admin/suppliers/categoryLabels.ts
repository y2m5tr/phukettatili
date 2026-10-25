import type { SupplierCategory } from '../../../data/adminInitialData';

// Tedarikçi kategori etiketleri — SuppliersTab'ten birebir taşındı.
// Kabuk (SuppliersTab.tsx) bu sabiti yeniden export eder; dışa açık
// yüzey (import yolları) bozulmaz.
export const SUPPLIER_CATEGORY_LABELS: Record<SupplierCategory, { label: string; icon: string }> = {
  speedboat: { label: 'Sürat Teknesi', icon: '🚤' },
  catamaran: { label: 'Katamaran', icon: '⛵' },
  yacht: { label: 'VIP Yat', icon: '🛥️' },
  adventure: { label: 'Zipline & Macera', icon: '🧗' },
  show: { label: 'Şov & Tema Parkı', icon: '🎭' },
  safari: { label: 'Fil & Safari', icon: '🐘' },
  transfer: { label: 'Kara Transferi', icon: '🚐' },
  other: { label: 'Diğer Hizmet', icon: '🌴' },
};
