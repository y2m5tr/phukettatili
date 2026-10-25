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
  Smartphone,
} from 'lucide-react';
import type { MediaItem } from '../../data/adminInitialData';
import ImagePickerModal from './ImagePickerModal';
import SectionsPanel from './homeEditor/SectionsPanel';
import HeroPanel from './homeEditor/HeroPanel';
import BadgesPanel from './homeEditor/BadgesPanel';
import WhyUsPanel from './homeEditor/WhyUsPanel';
import VideoPanel from './homeEditor/VideoPanel';
import MomentsPanel from './homeEditor/MomentsPanel';
import OtherPanel from './homeEditor/OtherPanel';
import MobileSimulatorModal from './homeEditor/MobileSimulatorModal';

// 500 satır kuralı: 7 alt sekme paneli ve mobil simülatör ./homeEditor/
// klasörüne taşındı. Bu kabuk yalnızca durum yönetimini (aktif sekme, kaydet
// geri bildirimi, görsel seçici, simülatör) ve kompozisyonu tutar — panel
// JSX'i tamamen alt bileşenlerde, davranış birebir aynı.
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
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

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

  const handleSave = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onSave(homeSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    if (showToast) {
      showToast('Anasayfa ayarları başarıyla kaydedildi!');
    }
  };

  // Panellere giden ortak prop paketi
  const panelProps = { homeSettings, setHomeSettings, getImageUrl, openPicker };

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
            onClick={() => setIsMobileSimulatorOpen(!isMobileSimulatorOpen)}
            className={`px-4 py-2.5 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              isMobileSimulatorOpen
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{isMobileSimulatorOpen ? 'Simülatörü Kapat' : 'Canlı Mobil Simülatör'}</span>
          </button>
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

      {/* SEKME 1: BÖLÜM GÖRÜNÜRLÜK YÖNETİCİSİ (MASTER SWITCHER) */}
      {activeSubTab === 'sections' && <SectionsPanel {...panelProps} />}

      {/* SEKME 2: HERO & SLAYTLAR (4 FOTOĞRAF) */}
      {activeSubTab === 'hero' && <HeroPanel {...panelProps} />}

      {/* SEKME 3: GÜVEN ROZETLERİ (4 ROZET) */}
      {activeSubTab === 'badges' && <BadgesPanel {...panelProps} />}

      {/* SEKME 4: NEDEN PHUKET TATİLİ? (WHY US - 3 KART) */}
      {activeSubTab === 'why_us' && <WhyUsPanel {...panelProps} />}

      {/* SEKME 5: TANITIM VİDEOSU & KAPAK */}
      {activeSubTab === 'video' && <VideoPanel {...panelProps} />}

      {/* SEKME 6: MİSAFİR ANILARI (INSTAGRAM GALERİSİ) */}
      {activeSubTab === 'moments' && <MomentsPanel {...panelProps} />}

      {/* SEKME 7: BENTO & BLOG BAŞLIKLARI */}
      {activeSubTab === 'other' && <OtherPanel {...panelProps} />}

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

      {/* Canlı Mobil Cihaz Simülatörü Modalı */}
      {isMobileSimulatorOpen && (
        <MobileSimulatorModal
          previewKey={previewKey}
          onReload={() => setPreviewKey((k) => k + 1)}
          onClose={() => setIsMobileSimulatorOpen(false)}
        />
      )}
    </div>
  );
}
