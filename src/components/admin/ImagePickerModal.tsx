/**
 * Görsel Seçim Modalı (ImagePickerModal)
 *
 * Kullanıcıların admin panelindeki tur, blog, hizmet veya site ayarlarında
 * görsel seçerken sadece dosya adı metni yerine tüm fotoğrafları küçük resim
 * (thumbnail) önizlemeleriyle görerek arama ve filtreleme yapıp tek tıkla seçmesini sağlar.
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import type { MediaItem } from '../../data/adminInitialData';

export interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string;
  title?: string;
  description?: string;
  mediaList?: MediaItem[];
  allImageOptions?: string[];
  getImageUrl: (url?: string) => string;
  handleFileUpload?: (file: File, callback: (url: string) => void) => void;
}

export default function ImagePickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue = '',
  title = 'Fotoğraf Kütüphanesinden Seç',
  description = 'Kullanmak istediğiniz fotoğrafa tıklayarak anında seçebilirsiniz.',
  mediaList = [],
  allImageOptions = [],
  getImageUrl,
  handleFileUpload,
}: ImagePickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'uploaded' | 'system' | 'external'>('all');
  const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal kapandığında state'i sıfırla
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setShowDirectUrlInput(false);
      setManualUrl('');
      setIsUploading(false);
    }
  }, [isOpen]);

  // ESC tuşu ile kapatma
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Tüm görselleri tekilleştirerek zengin MediaItem listesi oluştur
  const combinedItems: MediaItem[] = useMemo(() => {
    const map = new Map<string, MediaItem>();

    // 1. mediaList içindeki zengin öğeleri ekle
    (mediaList || []).forEach((m) => {
      if (m && m.url) {
        map.set(m.url, m);
      }
    });

    // 2. allImageOptions içinde olup da mediaList'te bulunmayanları tamamla
    (allImageOptions || []).forEach((url, idx) => {
      if (url && !map.has(url)) {
        const isExternal = url.startsWith('http://') || url.startsWith('https://');
        const isData = url.startsWith('data:');
        const filename = url.split('/').pop() || url;
        const cleanName = filename
          .replace(/\.(webp|jpg|jpeg|png|gif)$/i, '')
          .replace(/[-_]/g, ' ');
        const itemTitle = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : `Görsel ${idx + 1}`;

        map.set(url, {
          id: `opt-${idx}-${url.slice(-15)}`,
          title: isData ? 'Özel Yüklenen Görsel' : itemTitle,
          url,
          type: isExternal ? 'external' : isData ? 'uploaded' : 'system',
          createdAt: isExternal ? 'Bulut / Link' : isData ? 'Yüklendi' : 'Sistem Kataloğu',
        });
      }
    });

    return Array.from(map.values());
  }, [mediaList, allImageOptions]);

  // Arama ve filtreleme mantığı
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return combinedItems.filter((item) => {
      // Tip filtresi
      if (activeFilter === 'uploaded' && item.type !== 'uploaded') return false;
      if (activeFilter === 'system' && item.type !== 'system') return false;
      if (activeFilter === 'external' && item.type !== 'external') return false;

      // Metin araması
      if (!q) return true;
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const urlMatch = (item.url || '').toLowerCase().includes(q);
      const slugMatch = (item.slug || '').toLowerCase().includes(q);
      return titleMatch || urlMatch || slugMatch;
    });
  }, [combinedItems, searchQuery, activeFilter]);

  // Sayım istatistikleri
  const counts = useMemo(() => {
    let uploaded = 0;
    let system = 0;
    let external = 0;
    combinedItems.forEach((i) => {
      if (i.type === 'uploaded') uploaded++;
      else if (i.type === 'system') system++;
      else if (i.type === 'external') external++;
    });
    return { all: combinedItems.length, uploaded, system, external };
  }, [combinedItems]);

  if (!isOpen) return null;

  const handleSelectImage = (url: string) => {
    onSelect(url);
    onClose();
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && handleFileUpload) {
      setIsUploading(true);
      handleFileUpload(file, (uploadedUrl) => {
        setIsUploading(false);
        if (uploadedUrl) {
          handleSelectImage(uploadedUrl);
        }
      });
    }
    e.target.value = '';
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      handleSelectImage(manualUrl.trim());
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* ÜST BAŞLIK */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-accent flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {counts.all} Görsel
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {handleFileUpload && (
              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={isUploading}
                className="px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isUploading ? 'Yükleniyor...' : 'PC\'den Yeni Yükle'}
                </span>
                <span className="sm:hidden">Yükle</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* GİZLİ DOSYA YÜKLEME GİRDİSİ */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ARAMA VE FİLTRELEME ÇUBUĞU */}
        <div className="px-5 sm:px-7 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900">
          {/* Arama Alanı */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Görsel veya dosya adı ara (örn: phi phi, yat, bay)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtre Butonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Tümü ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('uploaded')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'uploaded'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Yüklenenler ({counts.uploaded})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('system')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === 'system'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Sistem ({counts.system})
            </button>

            <button
              type="button"
              onClick={() => setShowDirectUrlInput(!showDirectUrlInput)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                showDirectUrlInput
                  ? 'border-brand-primary text-brand-primary bg-brand-primary/5'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🔗 Direkt URL
            </button>
          </div>
        </div>

        {/* DİREKT URL GİRİŞ ALANI (OPSİYONEL AÇILIR) */}
        {showDirectUrlInput && (
          <form
            onSubmit={handleManualUrlSubmit}
            className="px-5 sm:px-7 py-3 bg-brand-accent/5 dark:bg-brand-accent/10 border-b border-brand-accent/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <input
              type="text"
              placeholder="https://... veya /assets/... adresini yapıştırın"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={!manualUrl.trim()}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold disabled:opacity-50 hover:bg-brand-primary/90 transition-all cursor-pointer whitespace-nowrap"
            >
              Bu Adresi Seç & Kullan
            </button>
          </form>
        )}

        {/* FOTOĞRAF KARTLARI IZGARASI (GRID) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[280px]">
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <ImageIcon className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Aramanıza uygun fotoğraf bulunamadı.
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Farklı bir arama terimi deneyebilir veya bilgisayarınızdan yeni bir görsel yükleyebilirsiniz.
              </p>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Aramayı Temizle
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredItems.map((item) => {
                const resolvedUrl = getImageUrl(item.url);
                const isSelected = currentValue === item.url || (currentValue && currentValue.endsWith(item.url));

                return (
                  <button
                    key={item.id || item.url}
                    type="button"
                    onClick={() => handleSelectImage(item.url)}
                    className={`group relative text-left rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col bg-slate-50 dark:bg-slate-800/60 ${
                      isSelected
                        ? 'border-emerald-500 dark:border-emerald-500 ring-4 ring-emerald-500/20 shadow-lg'
                        : 'border-slate-200/80 dark:border-slate-700/80 hover:border-brand-primary dark:hover:border-brand-accent hover:shadow-md'
                    }`}
                  >
                    {/* Görsel Alanı */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={resolvedUrl}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                        }}
                      />

                      {/* Seçili Rozeti */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Seçili</span>
                        </div>
                      )}

                      {/* Tip Rozeti */}
                      <div className="absolute top-2 left-2">
                        {item.type === 'uploaded' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-600/90 text-white text-[9px] font-bold tracking-wide uppercase shadow-xs">
                            Yüklendi
                          </span>
                        )}
                        {item.type === 'system' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-900/70 text-slate-200 text-[9px] font-medium backdrop-blur-xs">
                            Sistem
                          </span>
                        )}
                        {item.type === 'external' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-cyan-700/90 text-white text-[9px] font-bold tracking-wide uppercase shadow-xs">
                            Bulut
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-md transform translate-y-1 group-hover:translate-y-0 transition-transform">
                          Seç ✓
                        </span>
                      </div>
                    </div>

                    {/* Bilgi Alanı */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block group-hover:text-brand-primary dark:group-hover:text-brand-accent transition-colors">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate block mt-0.5">
                        {item.url.startsWith('data:')
                          ? 'Özel Yükleme'
                          : item.url.split('/').pop() || item.url}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ALT ÇUBUK */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 truncate max-w-lg">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Şu anki görsel:</span>
            <span className="font-mono truncate">{currentValue || 'Seçilmedi'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
