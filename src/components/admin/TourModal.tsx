import React, { useState, useMemo } from 'react';
import { Edit2,
  Save,
  ListChecks,
  Compass,
  Trash2,
  Image,
  HelpCircle,
  Upload,
  Clock,
  FileText,
  Plus,
  Sparkles,
} from 'lucide-react';
import type { TourItem, MediaItem, CategoryItem } from '../../data/adminTypes';
import ImagePickerModal from './ImagePickerModal';

const PRESET_INCLUSIONS = [
  '🚐 Otel Gidiş-Dönüş Klimalı Transfer',
  '🍽️ Açık Büfe Öğle Yemeği',
  '🥤 Soğuk İçecekler & Taze Tropikal Meyveler',
  '🤿 Şnorkel & Can Yeleği Ekipmanları',
  '🛡️ Tayland Lisanslı Kaza Sigortası',
  '👨‍✈️ İngilizce Profesyonel Rehberlik Hizmeti',
  '🚣 Kano & Profesyonel Kürekçi Hizmeti',
  '🎫 Milli Park Giriş Ücretleri Dahil',
  '☕ Sabah Karşılama Kahvesi ve Atıştırmalıklar',
  '🦺 Güvenlik Ekipmanları',
];

const PRESET_EXCLUSIONS = [
  '🏞️ Milli Park Giriş Harcı (Yetişkin 400 THB / Çocuk 200 THB)',
  '🍹 Kişisel Harcamalar ve Alkollü İçecekler',
  '🚐 Uzak Bölge Transfer Ekstra Ücreti (Rawai, Nai Harn vb.)',
  '📸 Profesyonel Fotoğraf & Drone Çekim Hizmeti',
  '🪙 Bahşişler (Kaptan ve Mürettebat için isteğe bağlı)',
  '🤿 Palet (Fins) Kiralama',
  '🏨 Otel Ekstra Harcamaları',
];

const TOUR_TEMPLATES = [
  {
    name: '🏝️ Standart Ada Turu Şablonu (Phi Phi, James Bond vb.)',
    included: [
      '🚐 Otel Gidiş-Dönüş Klimalı Transfer',
      '🍽️ Açık Büfe Öğle Yemeği',
      '🥤 Soğuk İçecekler & Taze Tropikal Meyveler',
      '🤿 Şnorkel & Can Yeleği Ekipmanları',
      '🛡️ Tayland Lisanslı Kaza Sigortası',
      '👨‍✈️ İngilizce Profesyonel Rehberlik Hizmeti',
    ],
    excluded: [
      '🏞️ Milli Park Giriş Harcı (Yetişkin 400 THB / Çocuk 200 THB)',
      '🍹 Kişisel Harcamalar ve Alkollü İçecekler',
      '🪙 Bahşişler (Mürettebat için isteğe bağlı)',
    ],
  },
  {
    name: '🚤 VIP & Özel Tekne / Yat Şablonu',
    included: [
      '🚐 Özel VIP Minibüs ile Otel Transferi',
      '🍽️ Özel Şef Hazırlığı Gurme Öğle Yemeği',
      '🥤 Limitsiz Soft İçecekler & Premium Meyve Tabağı',
      '🤿 Premium Şnorkel Ekipmanları & SUP Paddle Board',
      '🛡️ Kapsamlı Tayland Seyahat Sigortası',
      '👨‍✈️ Özel Kaptan ve Mürettebat Hizmeti',
    ],
    excluded: [
      '🏞️ Milli Park Giriş Harcı (Kişi Başı Nakit Ödenir)',
      '🍹 Şampanya & Alkollü İçecekler (İsteğe bağlı menü)',
      '🪙 Mürettebat Bahşişi',
    ],
  },
  {
    name: '⚡ Macera, Rafting & Safari Şablonu',
    included: [
      '🚐 Otel Transferi (Gidiş - Dönüş)',
      '🍽️ Tay Usulü Set Öğle Yemeği',
      '🥤 Gün Boyu Su ve Meşrubat İkramı',
      '🦺 Kask, Can Yeleği ve Güvenlik Ekipmanları',
      '👨‍✈️ Profesyonel Nehir Rehberi ve Güvenlik Eğitimi',
      '🛡️ Tayland Doğa Sporları Kaza Sigortası',
    ],
    excluded: [
      '📸 Nehir & ATV Aksiyon Fotoğraf/Video Çekimleri',
      '🍹 Ekstra Atıştırmalık ve Kişisel İçecekler',
      '🪙 Eğitmen ve Şoför Bahşişi',
    ],
  },
];

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTour: TourItem | null;
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
  onSubmit: (e: React.FormEvent) => void;
  getImageUrl?: (url?: string) => string;
  handleFileUpload?: (file: File, callback?: (url: string) => void) => void;
  allImageOptions?: string[];
  mediaList?: MediaItem[];
  allTours?: TourItem[];
  categories?: CategoryItem[];
  onOpenCategoryModal?: () => void;
}

export default function TourModal({
  isOpen,
  onClose,
  editingTour,
  tourFormData,
  setTourFormData,
  onSubmit,
  getImageUrl = (url?: string) => {
    if (!url) return '/images/hero-bg.webp';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
    return `/images/${url}`;
  },
  handleFileUpload = (file: File, callback?: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && callback) {
        callback(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  },
  allImageOptions = [],
  mediaList = [],
  allTours = [],
  categories = [],
  onOpenCategoryModal,
}: TourModalProps) {
  if (!isOpen) return null;

  const [pickerConfig, setPickerConfig] = useState<{
    isOpen: boolean;
    title: string;
    currentValue?: string;
    onSelect: (url: string) => void;
  }>({
    isOpen: false,
    title: '',
    onSelect: () => {},
  });

  const openPicker = (title: string, currentValue: string | undefined, onSelect: (url: string) => void) => {
    setPickerConfig({
      isOpen: true,
      title,
      currentValue,
      onSelect,
    });
  };

  const closePicker = () => {
    setPickerConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const [tourActiveTab, setTourActiveTab] = useState<
    'general' | 'photos' | 'itinerary' | 'inclusions' | 'faqs' | 'notes'
  >('general');

  const [tempProgramItem, setTempProgramItem] = useState<string>('');
  const [editingProgramIdx, setEditingProgramIdx] = useState<number | null>(null);
  const [programImageFor, setProgramImageFor] = useState<number | null>(null);
  const [tempIncludedItem, setTempIncludedItem] = useState<string>('');
  const [tempExcludedItem, setTempExcludedItem] = useState<string>('');
  const [tempFaqQ, setTempFaqQ] = useState<string>('');
  const [tempFaqA, setTempFaqA] = useState<string>('');
  const [tempRestrictionItem, setTempRestrictionItem] = useState<string>('');

  // Yeniden kullanılabilir Dahil/Hariç havuzu (Mevcut turlardan ve şablonlardan derlenir)
  const availableInclusions = useMemo(() => {
    const set = new Set<string>(PRESET_INCLUSIONS);
    (allTours || []).forEach((t) => {
      (t.included || []).forEach((item) => {
        if (item && item.trim()) set.add(item.trim());
      });
    });
    return Array.from(set);
  }, [allTours]);

  const availableExclusions = useMemo(() => {
    const set = new Set<string>(PRESET_EXCLUSIONS);
    (allTours || []).forEach((t) => {
      (t.excluded || []).forEach((item) => {
        if (item && item.trim()) set.add(item.trim());
      });
    });
    return Array.from(set);
  }, [allTours]);

  const toggleInclusion = (item: string) => {
    const current = tourFormData.included || [];
    if (current.includes(item)) {
      setTourFormData({ ...tourFormData, included: current.filter((x) => x !== item) });
    } else {
      setTourFormData({ ...tourFormData, included: [...current, item] });
    }
  };

  const toggleExclusion = (item: string) => {
    const current = tourFormData.excluded || [];
    if (current.includes(item)) {
      setTourFormData({ ...tourFormData, excluded: current.filter((x) => x !== item) });
    } else {
      setTourFormData({ ...tourFormData, excluded: [...current, item] });
    }
  };

  const applyInclusionTemplate = (tplIdx: number) => {
    const tpl = TOUR_TEMPLATES[tplIdx];
    if (!tpl) return;
    const incSet = new Set([...(tourFormData.included || []), ...tpl.included]);
    const excSet = new Set([...(tourFormData.excluded || []), ...tpl.excluded]);
    setTourFormData({
      ...tourFormData,
      included: Array.from(incSet),
      excluded: Array.from(excSet),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-2 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  {editingTour ? `Turu Düzenle: ${editingTour.title}` : 'Yeni Tur Ekle'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Fiyatlar, fotoğraflar, tur akışı, dahil olanlar ve tüm operasyonel ayrıntılar
                </p>
              </div>
              <button
                type="button"
                onClick={() => onClose()}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Sub-Tabs Bar */}
            <div className="px-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto py-2.5 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
              <button
                type="button"
                onClick={() => setTourActiveTab('general')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'general'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Genel Bilgiler</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('photos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'photos'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Fotoğraflar & Galeri ({(tourFormData.gallery || []).length + 1})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('itinerary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'itinerary'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tur Akışı & Program ({(tourFormData.program || []).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('inclusions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'inclusions'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Dahil & Hariç</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('faqs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'faqs'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>SSS ({(tourFormData.faq || []).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTourActiveTab('notes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  tourActiveTab === 'notes'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Kısıtlamalar & Metin</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: GENEL BİLGİLER */}
              {tourActiveTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Tur Başlığı *
                    </label>
                    <input
                      type="text"
                      required
                      value={tourFormData.title || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, title: e.target.value })}
                      placeholder="Örn: Phi Phi, Maya Bay ve Bamboo Adası"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                          Kategori *
                        </label>
                        {onOpenCategoryModal && (
                          <button
                            type="button"
                            onClick={onOpenCategoryModal}
                            className="text-[11px] font-bold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>+ Yeni Kategori Ekle</span>
                          </button>
                        )}
                      </div>
                      <select
                        value={tourFormData.category || (categories[0]?.slug) || 'island-tours'}
                        onChange={(e) => {
                          const selected = categories.find((c) => c.slug === e.target.value);
                          setTourFormData({
                            ...tourFormData,
                            category: e.target.value,
                            categoryLabel: selected?.label_tr || tourFormData.categoryLabel,
                          });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                      >
                        {(categories.length > 0 ? categories : [
                          { slug: 'island-tours', label_tr: 'Ada Turları', icon: '🏝️' },
                          { slug: 'adventure-tours', label_tr: 'Macera & Doğa', icon: '🧗' },
                          { slug: 'entertainment-tours', label_tr: 'Kültür & Şovlar', icon: '🎭' },
                          { slug: 'private-charters', label_tr: 'VIP Yat & Özel', icon: '⛵' },
                        ]).map((cat) => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.icon ? `${cat.icon} ` : ''}{cat.label_tr}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Sıralama (Sıra No) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={tourFormData.order ?? 1}
                        onChange={(e) => setTourFormData({ ...tourFormData, order: Number(e.target.value) })}
                        placeholder="Örn: 1, 2, 3..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        (1: En üstte / ilk sırada)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Tur Süresi
                    </label>
                    <input
                      type="text"
                      value={tourFormData.duration || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, duration: e.target.value })}
                      placeholder="Örn: Tam Gün (07:30 - 17:30)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kişi Başı Satış Fiyatı (THB)
                      </label>
                      <input
                        type="number"
                        value={tourFormData.priceThb || 0}
                        onChange={(e) => setTourFormData({ ...tourFormData, priceThb: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none font-bold"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">0 girilirse "Teklif Alın" görünür.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kısa Açıklama (Özet)
                      </label>
                      <textarea
                        rows={2}
                        value={tourFormData.excerpt || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, excerpt: e.target.value })}
                        placeholder="Tur kartında görünecek 1-2 cümlelik tanıtım..."
                        className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Supplier & Cost in Tour Editor */}
                  <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Tedarikçi Firma / Tekne Operatörü
                      </label>
                      <input
                        type="text"
                        placeholder="Örn: Andaman Wave Master, Sea Angel vb."
                        value={tourFormData.supplier || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, supplier: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                        Kişi Başı Alış / Maliyet Tutarı (THB)
                      </label>
                      <input
                        type="number"
                        placeholder="Acente maliyet tutarı"
                        value={tourFormData.costThb || 0}
                        onChange={(e) => setTourFormData({ ...tourFormData, costThb: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-600 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rezervasyonlarda otomatik kâr hesaplamasında kullanılır.</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tourFormData.featured || false}
                        onChange={(e) => setTourFormData({ ...tourFormData, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-brand-accent focus:ring-brand-accent"
                      />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Bu turu Ana Sayfada "Öne Çıkan Turlar" arasına ekle ⭐
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: FOTOĞRAFLAR & GALERİ */}
              {tourActiveTab === 'photos' && (
                <div className="space-y-6">
                  {/* Kapak Fotoğrafı */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                        Ana Kapak Fotoğrafı *
                      </label>
                      <span className="text-[11px] text-slate-400">Tur kartı ve sayfa başlığı görseli</span>
                    </div>

                    {/* Hızlı Seçim Butonları: Önizlemeli Kütüphane + PC'den Yükle */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openPicker('Tur Kapak Fotoğrafını Seç', tourFormData.image, (url) => {
                            setTourFormData((prev) => ({ ...prev, image: url }));
                          })
                        }
                        className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Image className="w-4 h-4" />
                        <span>🖼️ Fotoğrafı Görerek Seç (Önizlemeli Kütüphane)</span>
                      </button>

                      <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all whitespace-nowrap">
                        <Upload className="w-4 h-4 text-brand-accent" />
                        <span>PC'den Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                setTourFormData({ ...tourFormData, image: url });
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {/* Hızlı Görsel Şeridi: Küçük Resme Tıklayarak Kapak Seç */}
                    {allImageOptions.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                          Hızlı Kapak Seçimi (Küçük görsele tıklayarak anında seçebilirsiniz):
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                          {allImageOptions.slice(0, 16).map((img) => {
                            const isCurrent = (tourFormData.image || 'phuket_hero.webp') === img;
                            return (
                              <button
                                key={`quick-cover-${img}`}
                                type="button"
                                onClick={() => setTourFormData((prev) => ({ ...prev, image: img }))}
                                className={`relative group shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'border-brand-accent ring-2 ring-brand-accent/40 scale-105 shadow-sm'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-accent hover:scale-105 shadow-xs'
                                }`}
                                title={`${img.startsWith('data:') ? 'Özel Görsel' : img} — Kapak yapmak için tıkla`}
                              >
                                <img
                                  src={getImageUrl(img)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                {isCurrent && (
                                  <div className="absolute inset-0 bg-brand-accent/30 flex items-center justify-center">
                                    <span className="text-white text-[9px] font-bold bg-black/70 px-1 py-0.5 rounded">Seçili</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <select
                        value={tourFormData.image || 'phuket_hero.webp'}
                        onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none"
                      >
                        {allImageOptions.map((img) => (
                          <option key={img} value={img}>
                            {img.startsWith('data:') ? 'Özel Yüklenen Dosya' : img}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="veya direkt görsel URL'si girin..."
                        value={tourFormData.image || ''}
                        onChange={(e) => setTourFormData({ ...tourFormData, image: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      />
                    </div>

                    {tourFormData.image && (
                      <div className="flex items-center gap-3 pt-2">
                        <img
                          src={getImageUrl(tourFormData.image)}
                          alt="Kapak Önizleme"
                          className="w-24 h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                          }}
                        />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Kapak Önizleme</span>
                          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 truncate block max-w-sm">
                            {tourFormData.image}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Galeri Fotoğrafları */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Turdan Fotoğraflar (Galeri)
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Tur sayfasında sergilenecek ek fotoğraflar ({ (tourFormData.gallery || []).length } adet)
                        </p>
                      </div>

                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Galeriye Fotoğraf Yükle</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(file, (url) => {
                                setTourFormData({
                                  ...tourFormData,
                                  gallery: [...(tourFormData.gallery || []), url],
                                });
                              });
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {/* Galeri Önizleme Grid */}
                    {(tourFormData.gallery || []).length > 0 ? (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 pt-2">
                        {(tourFormData.gallery || []).map((img, idx) => (
                          <div key={`${img}-${idx}`} className="relative group">
                            <img
                              src={getImageUrl(img)}
                              alt={`Galeri ${idx + 1}`}
                              className="w-full h-16 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setTourFormData({
                                  ...tourFormData,
                                  gallery: (tourFormData.gallery || []).filter((_, i) => i !== idx),
                                })
                              }
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-red-600 transition-colors"
                              title="Fotoğrafı Galeriden Kaldır"
                            >
                              ✕
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-white text-[8px] font-bold">
                                #1
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-3 italic text-center">
                        Henüz galeri fotoğrafı eklenmemiş. Aşağıdan veya bilgisayarınızdan ekleyebilirsiniz.
                      </p>
                    )}

                    {/* Kütüphaneden Seçerek Galeriye Ekle */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() =>
                          openPicker('Galeriye Fotoğraf Ekle', undefined, (url) => {
                            if (url && !(tourFormData.gallery || []).includes(url)) {
                              setTourFormData((prev) => ({
                                ...prev,
                                gallery: [...(prev.gallery || []), url],
                              }));
                            }
                          })
                        }
                        className="flex-1 py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <Image className="w-4 h-4" />
                        <span>🖼️ Kütüphaneden Fotoğraf Seç & Ekle (Önizlemeli)</span>
                      </button>

                      <div className="sm:w-64">
                        <select
                          value=""
                          onChange={(e) => {
                            const selected = e.target.value;
                            if (selected && !(tourFormData.gallery || []).includes(selected)) {
                              setTourFormData({
                                ...tourFormData,
                                gallery: [...(tourFormData.gallery || []), selected],
                              });
                            }
                            e.target.value = '';
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                        >
                          <option value="">veya listeden seç...</option>
                          {allImageOptions.map((img) => (
                            <option key={img} value={img}>
                              {img.startsWith('data:') ? 'Özel Yüklenen Görsel' : img}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Hızlı Görsel Şeridi: Küçük Görsele Tıklayarak Galeriye Ekle */}
                    {allImageOptions.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">
                            Kütüphanedeki Görseller (Küçük görsele tıklayarak anında galeriye ekleyin):
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {allImageOptions.length} adet görsel
                          </span>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                          {allImageOptions.map((img) => {
                            const isAlreadyInGallery = (tourFormData.gallery || []).includes(img);
                            return (
                              <button
                                key={`quick-gallery-${img}`}
                                type="button"
                                onClick={() => {
                                  if (!isAlreadyInGallery) {
                                    setTourFormData((prev) => ({
                                      ...prev,
                                      gallery: [...(prev.gallery || []), img],
                                    }));
                                  }
                                }}
                                disabled={isAlreadyInGallery}
                                className={`relative group shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                                  isAlreadyInGallery
                                    ? 'border-emerald-500 opacity-60 cursor-not-allowed'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-brand-accent hover:scale-105 cursor-pointer shadow-xs'
                                }`}
                                title={isAlreadyInGallery ? 'Zaten galeride ekli' : `${img.startsWith('data:') ? 'Özel Görsel' : img} — Galeriye eklemek için tıkla`}
                              >
                                <img
                                  src={getImageUrl(img)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                                {isAlreadyInGallery && (
                                  <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">✓</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TUR AKIŞI & PROGRAM */}
              {tourActiveTab === 'itinerary' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Tur Programı & Akış Adımları ({(tourFormData.program || []).length})
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Misafirlerin tur sayfasında gördüğü saat saat zaman çizelgesi.
                    </p>
                  </div>

                  {/* List of items */}
                  <div className="space-y-2">
                    {(tourFormData.program || []).map((step, idx) => {
                      const programImages = (tourFormData.programImages || []).map((images) =>
                        Array.isArray(images) ? images : [images].filter(Boolean),
                      );
                      const stepImages = programImages[idx] || [];
                      return (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-brand-primary/10 text-brand-primary dark:text-brand-accent font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{step}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (editingProgramIdx === idx) {
                                  setEditingProgramIdx(null);
                                  setTempProgramItem('');
                                } else {
                                  setEditingProgramIdx(idx);
                                  setTempProgramItem(step);
                                }
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${editingProgramIdx === idx ? 'text-brand-accent bg-brand-accent/10' : 'text-slate-400 hover:text-brand-primary hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                              title="Adımı Düzenle"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setProgramImageFor(programImageFor === idx ? null : idx)}
                              className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${stepImages.length > 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-semibold' : 'text-slate-400 hover:text-brand-accent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                              title={stepImages.length > 0 ? `Bu adımda ${stepImages.length} fotoğraf var (açmak için tıklayın)` : 'Bu adıma fotoğraf ekle'}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {stepImages.length > 0 && <span className="text-[11px] font-bold">{stepImages.length}</span>}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTourFormData({
                                  ...tourFormData,
                                  program: (tourFormData.program || []).filter((_, i) => i !== idx),
                                  programImages: (programImages).filter((_, i) => i !== idx),
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Adımı Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {editingProgramIdx === idx && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
                            <input
                              type="text"
                              value={tempProgramItem}
                              onChange={(e) => setTempProgramItem(e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (tempProgramItem.trim()) {
                                    const next = [...(tourFormData.program || [])];
                                    next[idx] = tempProgramItem.trim();
                                    setTourFormData({ ...tourFormData, program: next });
                                    setEditingProgramIdx(null);
                                    setTempProgramItem('');
                                  }
                                }
                                if (e.key === 'Escape') {
                                  setEditingProgramIdx(null);
                                  setTempProgramItem('');
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (tempProgramItem.trim()) {
                                  const next = [...(tourFormData.program || [])];
                                  next[idx] = tempProgramItem.trim();
                                  setTourFormData({ ...tourFormData, program: next });
                                }
                                setEditingProgramIdx(null);
                                setTempProgramItem('');
                              }}
                              className="px-3 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold whitespace-nowrap"
                            >
                              Kaydet
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProgramIdx(null);
                                setTempProgramItem('');
                              }}
                              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold whitespace-nowrap"
                            >
                              İptal
                            </button>
                          </div>
                        )}
                        {programImageFor === idx && (
                          <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 space-y-2.5">
                            {/* Üst Eylem Butonları */}
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs">
                                <Upload className="w-3.5 h-3.5" />
                                <span>PC'den Yükle</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file && handleFileUpload) {
                                      handleFileUpload(file, (url) => {
                                        const next = [...programImages];
                                        while (next.length <= idx) next.push([]);
                                        next[idx] = [...stepImages, url];
                                        setTourFormData({ ...tourFormData, programImages: next });
                                      });
                                    }
                                    e.target.value = '';
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  openPicker(`${idx + 1}. Adım İçin Görsel Seç`, undefined, (url) => {
                                    const next = [...programImages];
                                    while (next.length <= idx) next.push([]);
                                    next[idx] = [...stepImages, url];
                                    setTourFormData({ ...tourFormData, programImages: next });
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                              >
                                <Image className="w-3.5 h-3.5" />
                                <span>🖼️ Önizlemeli Seç</span>
                              </button>

                              <select
                                value=""
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (v && !stepImages.includes(v)) {
                                    const next = [...programImages];
                                    while (next.length <= idx) next.push([]);
                                    next[idx] = [...stepImages, v];
                                    setTourFormData({ ...tourFormData, programImages: next });
                                  }
                                }}
                                className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                              >
                                <option value="">+ Listeden görsel ekle...</option>
                                {allImageOptions.map((img) => (
                                  <option key={img} value={img} disabled={stepImages.includes(img)}>
                                    {img} {stepImages.includes(img) ? '(Eklendi)' : ''}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="button"
                                onClick={() => setProgramImageFor(null)}
                                className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs border border-slate-200 dark:border-slate-700"
                              >
                                Paneli Kapat
                              </button>
                            </div>

                            {/* Bu Adıma Eklenen Fotoğraflar */}
                            {stepImages.length > 0 ? (
                              <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-300 dark:border-emerald-800 space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                                  <span>Bu adıma ekli fotoğraflar ({stepImages.length}) — Silmek için çarpıya (✕) tıklayın:</span>
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                                  {stepImages.map((image, imgIdx) => (
                                    <div
                                      key={`${image}-${imgIdx}`}
                                      className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border border-emerald-400 group shadow-xs"
                                    >
                                      <img src={getImageUrl(image)} alt="" className="w-full h-full object-cover" />
                                      <span className="absolute bottom-0.5 left-1 px-1 rounded bg-black/60 text-[9px] text-white">
                                        #{imgIdx + 1}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [...programImages];
                                          next[idx] = stepImages.filter((_, i) => i !== imgIdx);
                                          setTourFormData({ ...tourFormData, programImages: next });
                                        }}
                                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 shadow-xs cursor-pointer"
                                        title="Bu fotoğrafı adımdan kaldır"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-400 italic">
                                Bu adıma henüz fotoğraf eklenmedi. Yukarıdaki butonlardan fotoğraf yükleyebilir veya seçebilirsiniz.
                              </p>
                            )}

                            {/* Hızlı Seçim Küçük Resimleri */}
                            {allImageOptions.length > 0 && (
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                                  Hızlı Seçim (Tıklayıp Adıma Ekle):
                                </span>
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                                  {allImageOptions.slice(0, 16).map((img) => {
                                    const isAdded = stepImages.includes(img);
                                    return (
                                      <button
                                        key={`prog-step-${idx}-${img}`}
                                        type="button"
                                        onClick={() => {
                                          if (isAdded) return;
                                          const next = [...programImages];
                                          while (next.length <= idx) next.push([]);
                                          next[idx] = [...stepImages, img];
                                          setTourFormData({ ...tourFormData, programImages: next });
                                        }}
                                        className={`relative shrink-0 w-12 h-9 rounded-md overflow-hidden border transition-all ${
                                          isAdded
                                            ? 'border-emerald-500 ring-2 ring-emerald-500/40 opacity-50 cursor-not-allowed'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-accent hover:scale-105'
                                        }`}
                                        title={isAdded ? `${img} (Zaten eklendi)` : `${img} — Adıma ekle`}
                                      >
                                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                        {isAdded && (
                                          <span className="absolute inset-0 flex items-center justify-center bg-emerald-950/40 text-white font-bold text-xs">
                                            ✓
                                          </span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>

                  {/* Add step */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={tempProgramItem}
                      onChange={(e) => setTempProgramItem(e.target.value)}
                      placeholder="Örn: 09:30 - Maya Bay kumsalında serbest fotoğraf molası"
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tempProgramItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              program: [...(tourFormData.program || []), tempProgramItem.trim()],
                            });
                            setTempProgramItem('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempProgramItem.trim()) {
                          setTourFormData({
                            ...tourFormData,
                            program: [...(tourFormData.program || []), tempProgramItem.trim()],
                          });
                          setTempProgramItem('');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ekle</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: DAHİL & HARİÇ OLANLAR */}
              {tourActiveTab === 'inclusions' && (
                <div className="space-y-4">
                  {/* Hızlı Şablon Yükleyici Barı */}
                  <div className="p-3.5 rounded-2xl bg-brand-primary/5 dark:bg-slate-800/60 border border-brand-primary/20 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-accent shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                          Hızlı Hazır Şablon Uygula
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Sık kullanılan dahil/hariç paketlerini tek tıkla bu tura ekleyin
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val !== '') {
                            applyInclusionTemplate(parseInt(val, 10));
                            e.target.value = '';
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="">⚡ Bir şablon seçip tura ekle...</option>
                        {TOUR_TEMPLATES.map((tpl, i) => (
                          <option key={tpl.name} value={i}>
                            {tpl.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Dahil Olanlar */}
                    <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                          ✅ Dahil Olanlar ({(tourFormData.included || []).length})
                        </span>
                        {(tourFormData.included || []).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setTourFormData({ ...tourFormData, included: [] })}
                            className="text-[10px] text-red-500 hover:underline cursor-pointer"
                          >
                            Tümünü Temizle
                          </button>
                        )}
                      </div>

                      {/* Aktif Liste */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(tourFormData.included || []).length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">
                            Henüz dahil olan eklenmedi. Aşağıdaki hazır butonlara tıklayabilir veya kendiniz yazabilirsiniz.
                          </p>
                        ) : (
                          (tourFormData.included || []).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900 text-xs"
                            >
                              <span className="text-slate-800 dark:text-slate-200">{item}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setTourFormData({
                                    ...tourFormData,
                                    included: (tourFormData.included || []).filter((_, i) => i !== idx),
                                  })
                                }
                                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Elle Yeni Madde Ekleme */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={tempIncludedItem}
                          onChange={(e) => setTempIncludedItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tempIncludedItem.trim()) {
                              e.preventDefault();
                              setTourFormData({
                                ...tourFormData,
                                included: [...(tourFormData.included || []), tempIncludedItem.trim()],
                              });
                              setTempIncludedItem('');
                            }
                          }}
                          placeholder="Örn: Açık büfe öğle yemeği"
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempIncludedItem.trim()) {
                              setTourFormData({
                                ...tourFormData,
                                included: [...(tourFormData.included || []), tempIncludedItem.trim()],
                              });
                              setTempIncludedItem('');
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                        >
                          + Ekle
                        </button>
                      </div>

                      {/* Sık Kullanılan & Yeniden Kullanılabilir Hazır Seçenekler (Haplar / Chips) */}
                      <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60">
                        <span className="block text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-1.5">
                          💡 Sık Kullanılan Seçenekler (Tıklayıp Ekle/Çıkar):
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                          {availableInclusions.map((chip) => {
                            const isSelected = (tourFormData.included || []).includes(chip);
                            return (
                              <button
                                key={`inc-chip-${chip}`}
                                type="button"
                                onClick={() => toggleInclusion(chip)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 text-left ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                                }`}
                              >
                                <span>{isSelected ? '✓' : '+'}</span>
                                <span>{chip}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Hariç Olanlar */}
                    <div className="space-y-3 p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-red-800 dark:text-red-300">
                          ❌ Hariç Olanlar ({(tourFormData.excluded || []).length})
                        </span>
                        {(tourFormData.excluded || []).length > 0 && (
                          <button
                            type="button"
                            onClick={() => setTourFormData({ ...tourFormData, excluded: [] })}
                            className="text-[10px] text-red-500 hover:underline cursor-pointer"
                          >
                            Tümünü Temizle
                          </button>
                        )}
                      </div>

                      {/* Aktif Liste */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {(tourFormData.excluded || []).length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">
                            Henüz hariç olan eklenmedi. Aşağıdaki hazır butonlara tıklayabilir veya kendiniz yazabilirsiniz.
                          </p>
                        ) : (
                          (tourFormData.excluded || []).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 text-xs"
                            >
                              <span className="text-slate-800 dark:text-slate-200">{item}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setTourFormData({
                                    ...tourFormData,
                                    excluded: (tourFormData.excluded || []).filter((_, i) => i !== idx),
                                  })
                                }
                                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Elle Yeni Madde Ekleme */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={tempExcludedItem}
                          onChange={(e) => setTempExcludedItem(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && tempExcludedItem.trim()) {
                              e.preventDefault();
                              setTourFormData({
                                ...tourFormData,
                                excluded: [...(tourFormData.excluded || []), tempExcludedItem.trim()],
                              });
                              setTempExcludedItem('');
                            }
                          }}
                          placeholder="Örn: Milli Park Giriş Harcı"
                          className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (tempExcludedItem.trim()) {
                              setTourFormData({
                                ...tourFormData,
                                excluded: [...(tourFormData.excluded || []), tempExcludedItem.trim()],
                              });
                              setTempExcludedItem('');
                            }
                          }}
                          className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 cursor-pointer"
                        >
                          + Ekle
                        </button>
                      </div>

                      {/* Sık Kullanılan & Yeniden Kullanılabilir Hazır Seçenekler (Haplar / Chips) */}
                      <div className="pt-2 border-t border-red-200/60 dark:border-red-900/60">
                        <span className="block text-[10px] font-bold uppercase text-red-800 dark:text-red-300 mb-1.5">
                          💡 Sık Kullanılan Seçenekler (Tıklayıp Ekle/Çıkar):
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                          {availableExclusions.map((chip) => {
                            const isSelected = (tourFormData.excluded || []).includes(chip);
                            return (
                              <button
                                key={`exc-chip-${chip}`}
                                type="button"
                                onClick={() => toggleExclusion(chip)}
                                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 text-left ${
                                  isSelected
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-red-200/80 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-950/60'
                                }`}
                              >
                                <span>{isSelected ? '✓' : '+'}</span>
                                <span>{chip}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TURA ÖZEL SSS */}
              {tourActiveTab === 'faqs' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                      Tura Özel Sıkça Sorulan Sorular ({(tourFormData.faq || []).length})
                    </span>
                    <p className="text-xs text-slate-400 mb-3">
                      Misafirlerin bu tur sayfasına özel göreceği sorular ve cevapları.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(tourFormData.faq || []).map((faqItem, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 relative group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            S: {faqItem.q}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                faq: (tourFormData.faq || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          C: {faqItem.a}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add FAQ */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                    <span className="text-xs font-bold uppercase text-brand-primary dark:text-brand-accent block">
                      + Yeni Soru & Cevap Ekle
                    </span>
                    <input
                      type="text"
                      placeholder="Soru: Örn: Turda vejetaryen yemek var mı?"
                      value={tempFaqQ}
                      onChange={(e) => setTempFaqQ(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                    />
                    <textarea
                      rows={2}
                      placeholder="Cevap: Örn: Evet, rezervasyon sırasında belirtirseniz vejetaryen menü hazırlanmaktadır."
                      value={tempFaqA}
                      onChange={(e) => setTempFaqA(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tempFaqQ.trim() && tempFaqA.trim()) {
                          setTourFormData({
                            ...tourFormData,
                            faq: [...(tourFormData.faq || []), { q: tempFaqQ.trim(), a: tempFaqA.trim() }],
                          });
                          setTempFaqQ('');
                          setTempFaqA('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold"
                    >
                      Soruyu Ekle
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: KISITLAMALAR & AÇIKLAMA METNİ */}
              {tourActiveTab === 'notes' && (
                <div className="space-y-5">
                  {/* Restrictions */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-3">
                    <span className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 block">
                      ⚠️ Katılım Kısıtlamaları & Sağlık Uyarıları ({(tourFormData.restrictions || []).length})
                    </span>

                    <div className="space-y-1.5">
                      {(tourFormData.restrictions || []).map((res, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-900 text-xs"
                        >
                          <span className="text-slate-800 dark:text-slate-200">{res}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setTourFormData({
                                ...tourFormData,
                                restrictions: (tourFormData.restrictions || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={tempRestrictionItem}
                        onChange={(e) => setTempRestrictionItem(e.target.value)}
                        placeholder="Örn: Hamile misafirler ve 1 yaş altı bebekler için uygun değildir"
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempRestrictionItem.trim()) {
                            setTourFormData({
                              ...tourFormData,
                              restrictions: [...(tourFormData.restrictions || []), tempRestrictionItem.trim()],
                            });
                            setTempRestrictionItem('');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0"
                      >
                        + Ekle
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      Tur Detay Yazısı (Açıklama / Markdown)
                    </label>
                    <textarea
                      rows={6}
                      value={tourFormData.body || ''}
                      onChange={(e) => setTourFormData({ ...tourFormData, body: e.target.value })}
                      placeholder="Tur hakkında ayrıntılı açıklama yazısı..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {editingTour ? 'Değişiklikler anında yerel veritabanına kaydedilir.' : 'Yeni tur hemen listeye eklenecektir.'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingTour ? 'Değişiklikleri Kaydet' : 'Turu Oluştur'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {pickerConfig.isOpen && (
          <ImagePickerModal
            isOpen={pickerConfig.isOpen}
            onClose={closePicker}
            title={pickerConfig.title}
            currentValue={pickerConfig.currentValue}
            onSelect={pickerConfig.onSelect}
            mediaList={mediaList}
            allImageOptions={allImageOptions}
            getImageUrl={getImageUrl}
            handleFileUpload={handleFileUpload}
          />
        )}
      </>
  );
}
