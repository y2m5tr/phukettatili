import React, { useState } from 'react';
import {
  Save,
  Check,
  Layers,
  Image as ImageIcon,
  Shield,
  Star,
  Video,
  Camera,
  BookOpen,
  Eye,
} from 'lucide-react';
import type { MediaItem } from '../../data/adminInitialData';
import ImagePickerModal from './ImagePickerModal';

export interface HomeEditorTabProps {
  homeSettings: any;
  setHomeSettings: React.Dispatch<React.SetStateAction<any>>;
  onSave: (settings: any) => void;
  getImageUrl: (img?: string) => string;
  handleFileUpload: (file: File, cb: (url: string) => void) => void;
  allImageOptions: string[];
  mediaList?: MediaItem[];
  showToast?: (msg: string) => void;
}

export default function HomeEditorTab({
  homeSettings,
  setHomeSettings,
  onSave,
  getImageUrl,
  handleFileUpload,
  allImageOptions,
  mediaList = [],
  showToast,
}: HomeEditorTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'sections' | 'hero' | 'badges' | 'why_us' | 'video' | 'moments' | 'other'
  >('sections');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Image picker modal state
  const [pickerConfig, setPickerConfig] = useState<{
    isOpen: boolean;
    title: string;
    onSelect: (url: string) => void;
    currentValue: string;
  }>({
    isOpen: false,
    title: '',
    onSelect: () => {},
    currentValue: '',
  });

  const openPicker = (title: string, currentValue: string, onSelect: (url: string) => void) => {
    setPickerConfig({
      isOpen: true,
      title,
      currentValue,
      onSelect: (url: string) => {
        onSelect(url);
        setPickerConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(homeSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    if (showToast) {
      showToast('Anasayfa ayarları başarıyla kaydedildi!');
    }
  };

  const sections = homeSettings?.sections || {};

  const toggleSection = (key: string) => {
    const nextVal = sections[key] === false ? true : false;
    setHomeSettings((prev: any) => ({
      ...prev,
      sections: {
        ...(prev.sections || {}),
        [key]: nextVal,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Üst Bilgi Kartı & Kaydet Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-accent/10 text-brand-accent mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Anasayfa İçerik & Tasarım Stüdyosu</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Anasayfa Modül & Metin Yönetimi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Hero, arama çubuğu, güven rozetleri, Neden Biz kartları, tanıtım filmi ve bölüm görünürlüklerini özelleştirin.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {savedSuccess && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4" /> Kaydedildi!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-primary/20 flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Değişiklikleri Kaydet</span>
          </button>
        </div>
      </div>

      {/* Alt Sekme Çubuğu */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'sections', label: 'Bölüm Aç / Kapa', icon: Eye },
          { id: 'hero', label: 'Hero & Slaytlar', icon: ImageIcon },
          { id: 'badges', label: 'Güven Rozetleri (4)', icon: Shield },
          { id: 'why_us', label: 'Neden Biz? (3 Kart)', icon: Star },
          { id: 'video', label: 'Tanıtım Videosu', icon: Video },
          { id: 'moments', label: 'Misafir Anıları (Instagram)', icon: Camera },
          { id: 'other', label: 'Bento & Blog Başlıkları', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-brand-accent dark:text-slate-950 shadow-sm'
                  : 'bg-white dark:bg-surface-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* SEKME 1: BÖLÜM GÖRÜNÜRLÜK YÖNETİCİSİ (MASTER SWITCHER) */}
      {/* ========================================================= */}
      {activeSubTab === 'sections' && (
        <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-brand-accent" />
              <span>Anasayfa Bölüm Görünürlük Anahtarları</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              İstediğiniz bölümü tek tıkla gizleyebilir veya yayına alabilirsiniz. Gizlenen bölümler anasayfada hiç yüklenmez.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'topBar', label: 'Üst Duyuru & Bilgi Barı', desc: 'Acente lisansı, para birimi ve acil iletişim bandı', icon: '📢' },
              { key: 'hero', label: 'Hero Karşılama Alanı', desc: 'Büyük başlık, slider görselleri ve çağrı butonları', icon: '🖼️' },
              { key: 'quickSearch', label: 'Hızlı Tur Arama & Filtre', desc: 'Hero altındaki kategori, süre ve tarz arama çubuğu', icon: '🔍' },
              { key: 'trustBadges', label: '4 Güven & Kalite Rozeti', desc: 'Türkçe rehberlik, TAT lisansı, 4.9/5 puan rozetleri', icon: '🛡️' },
              { key: 'stories', label: 'Tur Hikayeleri (Stories Reel)', desc: 'Instagram formatında yuvarlak ada hikaye daireleri', icon: '📱' },
              { key: 'marineRadar', label: 'Canlı Deniz Güvenlik Radarı', desc: 'Dalga boyu, meteoroloji ve günlük ada güvenlik paneli', icon: '🌊' },
              { key: 'bentoGrid', label: 'Deneyimler Bento Grid', desc: 'Ada turları, VIP yat, fil koruma ve macera rotaları', icon: '🍱' },
              { key: 'featuredTours', label: 'Öne Çıkan Rotalar Vitrini', desc: 'En çok tercih edilen 3 popüler turun kartları', icon: '⭐' },
              { key: 'holidayAssistant', label: 'Akıllı Tatil & Tur Asistanı', desc: 'Çok günlü paket planlayıcı ve hızlı tur sihirbazı', icon: '🌴' },
              { key: 'videoShowcase', label: 'Tanıtım Filmi & Video', desc: 'Phuket tanıtım videosu ve oynatıcı kapak kartı', icon: '🎬' },
              { key: 'marquee', label: 'Kayan Slogan Bandı', desc: 'Hızlı güven rozetleri ve avantajlar kayan şeridi', icon: '🏷️' },
              { key: 'whyUs', label: 'Neden Phuket Tatili?', desc: 'Güvenli seyahat, Türkçe rehberlik ve VIP standart kartları', icon: '🌟' },
              { key: 'testimonials', label: 'Misafir Değerlendirmeleri', desc: 'Gerçek misafirlerin yorumları ve Google yıldızları', icon: '💬' },
              { key: 'guestMoments', label: 'Misafirlerimizin Phuket Anıları', desc: 'Instagram fotoğrafları ve sosyal kanıt galerisi', icon: '📸' },
              { key: 'blogSection', label: 'Phuket Gezi Rehberi & Blog', desc: 'En çok okunan 3 gezi makalesi ve SEO vitrini', icon: '📚' },
              { key: 'faq', label: 'Sıkça Sorulan Sorular', desc: 'Phuket tatili ve turlar hakkında accordion SSS', icon: '❓' },
            ].map((item) => {
              const isVisible = sections[item.key] !== false;
              return (
                <div
                  key={item.key}
                  onClick={() => toggleSection(item.key)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isVisible
                      ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-brand-accent/50 shadow-xs'
                      : 'bg-slate-100/50 dark:bg-slate-900/20 border-dashed border-slate-300 dark:border-slate-800/80 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0">
                      {item.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {item.label}
                        </h4>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                            isVisible
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {isVisible ? 'Yayında' : 'Gizli'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pt-1">
                    <div
                      className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                        isVisible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isVisible ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKME 2: HERO & SLAYTLAR (4 FOTOĞRAF) */}
      {/* ========================================================= */}
      {activeSubTab === 'hero' && (
        <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-accent" />
              <span>Hero Karşılama Alanı & Slider Fotoğrafları</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Anasayfa açıldığında ziyaretçiyi karşılayan büyük manşet, açıklama, butonlar ve döner 4 arka plan fotoğrafı.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Büyük Başlık (Hero Title)
              </label>
              <input
                type="text"
                value={homeSettings?.heroTitle || ''}
                onChange={(e) => setHomeSettings({ ...homeSettings, heroTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-serif font-bold text-slate-900 dark:text-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                * Başlıkta "Büyüsünü" kelimesi geçerse otomatik olarak altın italik renkle vurgulanır.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Alt Açıklama (Hero Subtitle)
              </label>
              <textarea
                rows={2}
                value={homeSettings?.heroSubtitle || ''}
                onChange={(e) => setHomeSettings({ ...homeSettings, heroSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Butonlar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Birincil Buton Metni
                </label>
                <input
                  type="text"
                  value={homeSettings?.heroCtaPrimaryText || 'Turları İncele'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, heroCtaPrimaryText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Birincil Buton Hedef Linki
                </label>
                <input
                  type="text"
                  value={homeSettings?.heroCtaPrimaryLink || '/turlar'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, heroCtaPrimaryLink: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  İkincil Buton Metni (WhatsApp)
                </label>
                <input
                  type="text"
                  value={homeSettings?.heroCtaSecondaryText || "WhatsApp'tan Ulaşın"}
                  onChange={(e) => setHomeSettings({ ...homeSettings, heroCtaSecondaryText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>
            </div>

            {/* 4 Slider Arka Plan Fotoğrafları */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Hero Arka Plan Slaytları (Dönen 4 Fotoğraf)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((idx) => {
                  const sliderImages = homeSettings?.heroSliderImages || [
                    'phuket_hero.webp',
                    'pileh.webp',
                    'yacht.webp',
                    'longtail.webp',
                  ];
                  const currentImg = sliderImages[idx] || '';

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                        <span>Slayt {idx + 1} {idx === 0 ? '(Açılış)' : ''}</span>
                      </div>

                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                        <img
                          src={getImageUrl(currentImg)}
                          alt={`Slayt ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/phuket_hero.webp';
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openPicker(`Slayt ${idx + 1} Fotoğrafı Seç`, currentImg, (selectedUrl) => {
                            const updated = [...sliderImages];
                            updated[idx] = selectedUrl;
                            setHomeSettings({ ...homeSettings, heroSliderImages: updated });
                          })
                        }
                        className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-brand-accent hover:text-white dark:hover:bg-brand-accent text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Görseli Değiştir</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKME 3: GÜVEN ROZETLERİ (4 ROZET) */}
      {/* ========================================================= */}
      {activeSubTab === 'badges' && (
        <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-accent" />
              <span>4 Güven & Kalite Rozeti (Hero Altı Strip)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ziyaretçilere ilk 3 saniyede güven veren 4 rozetin ikonu, başlığı, açıklaması ve vurgu etiketini özelleştirin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[0, 1, 2, 3].map((idx) => {
              const badges = homeSettings?.trustBadges || [];
              const b = badges[idx] || {
                icon: idx === 0 ? '🇹🇷' : idx === 1 ? '⭐' : idx === 2 ? '🛡️' : '💬',
                highlight: '',
                title: '',
                desc: '',
              };

              const updateBadge = (field: string, val: string) => {
                const updated = [...badges];
                updated[idx] = { ...b, [field]: val };
                setHomeSettings({ ...homeSettings, trustBadges: updated });
              };

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800">
                    <span className="font-bold text-xs text-brand-accent uppercase tracking-wider">
                      Rozet #{idx + 1}
                    </span>
                    <input
                      type="text"
                      title="Emoji / İkon"
                      value={b.icon || ''}
                      onChange={(e) => updateBadge('icon', e.target.value)}
                      className="w-12 text-center py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Vurgu Etiketi (Mini Tag)</label>
                    <input
                      type="text"
                      value={b.highlight || ''}
                      onChange={(e) => updateBadge('highlight', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Ana Başlık</label>
                    <input
                      type="text"
                      value={b.title || ''}
                      onChange={(e) => updateBadge('title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Açıklama</label>
                    <textarea
                      rows={2}
                      value={b.desc || ''}
                      onChange={(e) => updateBadge('desc', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKME 4: NEDEN PHUKET TATİLİ? (WHY US - 3 KART) */}
      {/* ========================================================= */}
      {activeSubTab === 'why_us' && (
        <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span>Neden Phuket Tatili? (3 Özellik Kartı)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bölüm başlıklarını ve 3 özelliğin görsellerini, rozetlerini, başlık ve açıklamalarını düzenleyin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Üst Rozet Metni</label>
              <input
                type="text"
                value={homeSettings?.whyUsBadge || '★ Neden Phuket Tatili?'}
                onChange={(e) => setHomeSettings({ ...homeSettings, whyUsBadge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Bölüm Ana Başlığı</label>
              <input
                type="text"
                value={homeSettings?.whyUsTitle || 'Ayrıcalıklı, Güvenli ve Tamamen Size Özel'}
                onChange={(e) => setHomeSettings({ ...homeSettings, whyUsTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Bölüm Alt Açıklaması</label>
              <input
                type="text"
                value={homeSettings?.whyUsSubtitle || 'Standart turların karmaşasından uzak, yerel ekibimizle her anınız güvence altında.'}
                onChange={(e) => setHomeSettings({ ...homeSettings, whyUsSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[0, 1, 2].map((idx) => {
              const cards = homeSettings?.whyUsCards || [];
              const c = cards[idx] || {
                badge: idx === 0 ? 'Tam Güvence' : idx === 1 ? 'Yerel Ekip' : 'Ayrıcalıklı Rota',
                title: idx === 0 ? 'Güvenli Seyahat' : idx === 1 ? '7/24 Türkçe Destek' : 'VIP Deneyim',
                desc: '',
                image: idx === 0 ? 'beach.webp' : idx === 1 ? 'culture.webp' : 'yacht.webp',
              };

              const updateCard = (field: string, val: string) => {
                const updated = [...cards];
                updated[idx] = { ...c, [field]: val };
                setHomeSettings({ ...homeSettings, whyUsCards: updated });
              };

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <img
                      src={getImageUrl(c.image)}
                      alt={c.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openPicker(`Kart ${idx + 1} Fotoğrafı Seç`, c.image, (url) => updateCard('image', url))
                      }
                      className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Görsel Seç</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Üst Rozet</label>
                    <input
                      type="text"
                      value={c.badge || ''}
                      onChange={(e) => updateCard('badge', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Kart Başlığı</label>
                    <input
                      type="text"
                      value={c.title || ''}
                      onChange={(e) => updateCard('title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Açıklama</label>
                    <textarea
                      rows={3}
                      value={c.desc || ''}
                      onChange={(e) => updateCard('desc', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKME 5: TANITIM VİDEOSU & KAPAK */}
      {/* ========================================================= */}
      {activeSubTab === 'video' && (
        <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-brand-accent" />
              <span>Tanıtım Videosu & Kapak Görseli</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Anasayfadaki video vitrininin başlığını, alt metnini, video dosya yolunu ve tıklama öncesi kapak fotoğrafını düzenleyin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Üst Rozet Metni
                </label>
                <input
                  type="text"
                  value={homeSettings?.videoBadge || 'Tanıtım Filmi'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, videoBadge: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Bölüm Başlığı
                </label>
                <input
                  type="text"
                  value={homeSettings?.videoTitle || "Phuket'i Saniyeler İçinde Keşfedin"}
                  onChange={(e) => setHomeSettings({ ...homeSettings, videoTitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Alt Açıklama
                </label>
                <textarea
                  rows={2}
                  value={homeSettings?.videoSubtitle || ''}
                  onChange={(e) => setHomeSettings({ ...homeSettings, videoSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  Video Dosya Yolu veya URL
                </label>
                <input
                  type="text"
                  value={homeSettings?.videoUrl || '/assets/tours_video.mp4'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, videoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Video Kapak Fotoğrafı (Poster)
              </label>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                <img
                  src={getImageUrl(homeSettings?.videoPoster || 'phuket_hero.webp')}
                  alt="Video Poster"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  openPicker(
                    'Video Kapak Fotoğrafı Seç',
                    homeSettings?.videoPoster || 'phuket_hero.webp',
                    (url) => setHomeSettings({ ...homeSettings, videoPoster: url })
                  )
                }
                className="w-full py-2.5 px-4 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Fotoğraf Kütüphanesinden Kapak Seç</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKME 6: MİSAFİR ANILARI (INSTAGRAM GALERİSİ) */}
      {/* ========================================================= */}
      {activeSubTab === 'moments' && (
        <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-brand-accent" />
              <span>Misafirlerimizin Phuket Anıları (Instagram Vitrini)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Anasayfadaki 5 fotoğraf kartının görsellerini, etiketlerini ve konum bilgilerini özelleştirin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Instagram Kullanıcı Adı</label>
              <input
                type="text"
                value={homeSettings?.guestMomentsBadge || '@phukettatili'}
                onChange={(e) => setHomeSettings({ ...homeSettings, guestMomentsBadge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Bölüm Başlığı</label>
              <input
                type="text"
                value={homeSettings?.guestMomentsTitle || 'Misafirlerimizin Phuket Anıları'}
                onChange={(e) => setHomeSettings({ ...homeSettings, guestMomentsTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Alt Açıklama</label>
              <input
                type="text"
                value={homeSettings?.guestMomentsSubtitle || 'Özel turlarımızda misafirlerimizin biriktirdiği gerçek anlar.'}
                onChange={(e) => setHomeSettings({ ...homeSettings, guestMomentsSubtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[0, 1, 2, 3, 4].map((idx) => {
              const moments = homeSettings?.guestMoments || [];
              const m = moments[idx] || {
                image: idx === 0 ? 'couple.webp' : idx === 1 ? 'pileh.webp' : idx === 2 ? 'elephant.webp' : idx === 3 ? 'underwater.webp' : 'bay.webp',
                title: '',
                tag: '',
                location: '',
              };

              const updateMoment = (field: string, val: string) => {
                const updated = [...moments];
                updated[idx] = { ...m, [field]: val };
                setHomeSettings({ ...homeSettings, guestMoments: updated });
              };

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5"
                >
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                    <img
                      src={getImageUrl(m.image)}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openPicker(`Misafir Fotoğrafı #${idx + 1}`, m.image, (url) => updateMoment('image', url))
                      }
                      className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Seç</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Etiket (Tag)</label>
                    <input
                      type="text"
                      value={m.tag || ''}
                      onChange={(e) => updateMoment('tag', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Başlık</label>
                    <input
                      type="text"
                      value={m.title || ''}
                      onChange={(e) => updateMoment('title', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Konum</label>
                    <input
                      type="text"
                      value={m.location || ''}
                      onChange={(e) => updateMoment('location', e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SEKME 7: BENTO & BLOG BAŞLIKLARI */}
      {/* ========================================================= */}
      {activeSubTab === 'other' && (
        <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-accent" />
              <span>Bento Grid & Blog Vitrini Başlıkları</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              "Phuket'te Neler Yapabilirsiniz?" ve "Phuket Gezi Rehberi & İpuçları" bölümlerinin manşet ve açıklamaları.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bento Grid */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-bold text-xs text-brand-accent uppercase tracking-wider block">
                🍱 Bento Grid (Deneyimler & Rotalar)
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Üst Rozet</label>
                <input
                  type="text"
                  value={homeSettings?.bentoBadge || 'Deneyimler & Rotalar'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, bentoBadge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Ana Başlık</label>
                <input
                  type="text"
                  value={homeSettings?.bentoTitle || "Phuket'te Neler Yapabilirsiniz?"}
                  onChange={(e) => setHomeSettings({ ...homeSettings, bentoTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Alt Açıklama</label>
                <textarea
                  rows={3}
                  value={homeSettings?.bentoSubtitle || 'Günübirlik tropik ada kaçamaklarından özel yat turlarına kadar Phuket\'in en iyileri.'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, bentoSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            {/* Blog Vitrini */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-bold text-xs text-brand-accent uppercase tracking-wider block">
                📚 Blog & Gezi Rehberi Vitrini
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Üst Rozet</label>
                <input
                  type="text"
                  value={homeSettings?.blogSectionBadge || '📚 Phuket Gezi Rehberi'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, blogSectionBadge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Ana Başlık</label>
                <input
                  type="text"
                  value={homeSettings?.blogSectionTitle || 'Seyahatiniz İçin İpuçları & Rotalar'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, blogSectionTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Alt Açıklama</label>
                <textarea
                  rows={3}
                  value={homeSettings?.blogSectionSubtitle || 'Phuket tatilinizi planlarken ihtiyacınız olan en güncel ada karşılaştırmaları.'}
                  onChange={(e) => setHomeSettings({ ...homeSettings, blogSectionSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Görsel Seçim Modalı */}
      <ImagePickerModal
        isOpen={pickerConfig.isOpen}
        onClose={() => setPickerConfig((prev) => ({ ...prev, isOpen: false }))}
        onSelect={pickerConfig.onSelect}
        currentValue={pickerConfig.currentValue}
        title={pickerConfig.title}
        mediaList={mediaList}
        allImageOptions={allImageOptions}
        getImageUrl={getImageUrl}
        handleFileUpload={handleFileUpload}
      />
    </div>
  );
}
