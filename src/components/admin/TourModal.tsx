import { useState, useMemo } from 'react';
import {
  Save,
  ListChecks,
  Compass,
  Image,
  HelpCircle,
  Clock,
  FileText,
} from 'lucide-react';
import ImagePickerModal from './ImagePickerModal';
import {
  mergeOptionSources,
  EMPTY_OPTION_LIBRARY,
  type OptionLibrary,
} from '../../lib/inclusionLibrary';
import {
  PRESET_INCLUSIONS,
  PRESET_EXCLUSIONS,
  TOUR_TEMPLATES,
  type TourActiveTab,
  type TourModalProps,
} from './tour-modal/tourModalTypes';
import { TourGeneralTab } from './tour-modal/TourGeneralTab';
import { TourPhotosTab } from './tour-modal/TourPhotosTab';
import { TourItineraryTab } from './tour-modal/TourItineraryTab';
import { TourInclusionsTab } from './tour-modal/TourInclusionsTab';
import { TourFaqsTab, TourNotesTab } from './tour-modal/TourFaqsAndNotesTab';

export { PRESET_INCLUSIONS, PRESET_EXCLUSIONS, TOUR_TEMPLATES };
export type InclusionLibrary = OptionLibrary;
export type { TourModalProps };

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
  inclusionLibrary,
  onRememberOption,
  onForgetOption,
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

  const [tourActiveTab, setTourActiveTab] = useState<TourActiveTab>('general');

  const availableInclusions = useMemo(
    () => mergeOptionSources(inclusionLibrary ?? EMPTY_OPTION_LIBRARY, 'included', PRESET_INCLUSIONS, allTours || []),
    [allTours, inclusionLibrary]
  );

  const availableExclusions = useMemo(
    () => mergeOptionSources(inclusionLibrary ?? EMPTY_OPTION_LIBRARY, 'excluded', PRESET_EXCLUSIONS, allTours || []),
    [allTours, inclusionLibrary]
  );

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
              <span>Fotoğraflar</span>
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
              <span>Tur Akışı & Program</span>
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
              <span>Dahil & Hariç Olanlar</span>
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
              <span>Özel SSS</span>
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
              <span>Kısıtlamalar & Açıklama</span>
            </button>
          </div>

          {/* Modal Form Content */}
          <form onSubmit={onSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
            {tourActiveTab === 'general' && (
              <TourGeneralTab
                tourFormData={tourFormData}
                setTourFormData={setTourFormData}
                categories={categories}
                onOpenCategoryModal={onOpenCategoryModal}
              />
            )}

            {tourActiveTab === 'photos' && (
              <TourPhotosTab
                tourFormData={tourFormData}
                setTourFormData={setTourFormData}
                getImageUrl={getImageUrl}
                handleFileUpload={handleFileUpload}
                openPicker={openPicker}
                allImageOptions={allImageOptions}
              />
            )}

            {tourActiveTab === 'itinerary' && (
              <TourItineraryTab
                tourFormData={tourFormData}
                setTourFormData={setTourFormData}
                getImageUrl={getImageUrl}
                handleFileUpload={handleFileUpload}
                openPicker={openPicker}
                allImageOptions={allImageOptions}
              />
            )}

            {tourActiveTab === 'inclusions' && (
              <TourInclusionsTab
                tourFormData={tourFormData}
                setTourFormData={setTourFormData}
                availableInclusions={availableInclusions}
                availableExclusions={availableExclusions}
                inclusionLibrary={inclusionLibrary}
                onRememberOption={onRememberOption}
                onForgetOption={onForgetOption}
              />
            )}

            {tourActiveTab === 'faqs' && (
              <TourFaqsTab
                tourFormData={tourFormData}
                setTourFormData={setTourFormData}
              />
            )}

            {tourActiveTab === 'notes' && (
              <TourNotesTab
                tourFormData={tourFormData}
                setTourFormData={setTourFormData}
              />
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
