import React from 'react';
import type {
  TourItem,
  FaqItem,
  TestimonialItem,
  ServiceItem,
  BlogItem,
  MediaItem,
  Booking,
  VehicleItem,
  DriverItem,
  PartnerAgent,
  SupplierItem,
  TourCostItem,
} from '../../../data/adminInitialData';
import type { CategoryItem } from '../../../data/adminTypes';
import type { OptionLibrary, OptionKind } from '../../../lib/inclusionLibrary';

// Lazy modals — AddMedia/Lightbox yalnızca medya yönetimi açıldığında indirilir.
const AddMediaModal = React.lazy(() => import('../MediaModals').then((m) => ({ default: m.AddMediaModal })));
const MediaLightboxModal = React.lazy(() =>
  import('../MediaModals').then((m) => ({ default: m.MediaLightboxModal })),
);

const BookingModal = React.lazy(() => import('../BookingModal'));
const TourModal = React.lazy(() => import('../TourModal'));
const CategoryModal = React.lazy(() => import('../CategoryModal'));
const TestimonialModal = React.lazy(() => import('../TestimonialModal'));
const FaqModal = React.lazy(() => import('../FaqModal'));
const ServiceModal = React.lazy(() => import('../ServiceModal'));
const BlogModal = React.lazy(() => import('../BlogModal'));

export interface DashboardCmsModalsHostProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  editingBooking: Booking | null;
  formData: Partial<Booking>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Booking>>>;
  onSubmitBooking: (e: React.SyntheticEvent) => void;
  tours: TourItem[];
  bookings?: Booking[];
  agents?: PartnerAgent[];
  suppliers?: SupplierItem[];
  tourCosts?: TourCostItem[];
  vehicles: VehicleItem[];
  drivers: DriverItem[];
  onOpenCreateTour: () => void;
  showToast?: (msg: string) => void;

  isTourModalOpen: boolean;
  setIsTourModalOpen: (v: boolean) => void;
  editingTour: TourItem | null;
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
  onSubmitTour: (e: React.SyntheticEvent) => void;
  categories: CategoryItem[];
  inclusionLibrary: OptionLibrary;
  onRememberOption: (kind: OptionKind, item: string) => void;
  onForgetOption: (kind: OptionKind, item: string) => void;
  availableImages: string[];
  mediaList?: MediaItem[];
  getImageUrl?: (url?: string) => string;
  handleFileUpload?: (file: File, callback?: (url: string) => void) => void;

  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (v: boolean) => void;
  onSaveCategory: (category: CategoryItem) => void;
  onDeleteCategory?: (slug: string) => void;

  isBlogModalOpen: boolean;
  setIsBlogModalOpen: (v: boolean) => void;
  editingBlog: BlogItem | null;
  blogFormData: Partial<BlogItem>;
  setBlogFormData: React.Dispatch<React.SetStateAction<Partial<BlogItem>>>;
  onSubmitBlog: (e: React.SyntheticEvent) => void;

  isServiceModalOpen: boolean;
  setIsServiceModalOpen: (v: boolean) => void;
  serviceFormData: Partial<ServiceItem>;
  setServiceFormData: React.Dispatch<React.SetStateAction<Partial<ServiceItem>>>;
  onSubmitService: (e: React.SyntheticEvent) => void;

  isFaqModalOpen: boolean;
  setIsFaqModalOpen: (v: boolean) => void;
  editingFaq: FaqItem | null;
  faqFormData: Partial<FaqItem>;
  setFaqFormData: React.Dispatch<React.SetStateAction<Partial<FaqItem>>>;
  onSubmitFaq: (e: React.SyntheticEvent) => void;

  isTestiModalOpen: boolean;
  setIsTestiModalOpen: (v: boolean) => void;
  editingTesti: TestimonialItem | null;
  testiFormData: Partial<TestimonialItem>;
  setTestiFormData: React.Dispatch<React.SetStateAction<Partial<TestimonialItem>>>;
  onSubmitTesti: (e: React.SyntheticEvent) => void;

  isAddMediaModalOpen: boolean;
  setIsAddMediaModalOpen: (v: boolean) => void;
  mediaUploadMode: 'file' | 'url';
  setMediaUploadMode: (mode: 'file' | 'url') => void;
  newMediaTitle: string;
  setNewMediaTitle: (t: string) => void;
  newMediaUrl: string;
  setNewMediaUrl: (u: string) => void;
  onAddMediaSubmit: (e: React.SyntheticEvent) => void;
  selectedLightboxMedia: MediaItem | null;
  setSelectedLightboxMedia: (m: MediaItem | null) => void;
  onCopyMediaUrl: (url: string) => void;

  assignMediaModal: MediaItem | null;
  setAssignMediaModal: (m: MediaItem | null) => void;
  onAddMediaToTourGallery: (url: string, tourId: string) => void;
  onAssignMediaAsTourCover: (url: string, tourId: string) => void;
}

export function DashboardCmsModalsHost({
  isModalOpen,
  setIsModalOpen,
  editingBooking,
  formData,
  setFormData,
  onSubmitBooking,
  tours,
  bookings,
  agents,
  suppliers,
  tourCosts,
  vehicles,
  drivers,
  onOpenCreateTour,
  showToast,
  isTourModalOpen,
  setIsTourModalOpen,
  editingTour,
  tourFormData,
  setTourFormData,
  onSubmitTour,
  categories,
  inclusionLibrary,
  onRememberOption,
  onForgetOption,
  availableImages,
  mediaList,
  getImageUrl,
  handleFileUpload,
  isCategoryModalOpen,
  setIsCategoryModalOpen,
  onSaveCategory,
  onDeleteCategory,
  isBlogModalOpen,
  setIsBlogModalOpen,
  editingBlog,
  blogFormData,
  setBlogFormData,
  onSubmitBlog,
  isServiceModalOpen,
  setIsServiceModalOpen,
  serviceFormData,
  setServiceFormData,
  onSubmitService,
  isFaqModalOpen,
  setIsFaqModalOpen,
  editingFaq,
  faqFormData,
  setFaqFormData,
  onSubmitFaq,
  isTestiModalOpen,
  setIsTestiModalOpen,
  editingTesti,
  testiFormData,
  setTestiFormData,
  onSubmitTesti,
  isAddMediaModalOpen,
  setIsAddMediaModalOpen,
  mediaUploadMode,
  setMediaUploadMode,
  newMediaTitle,
  setNewMediaTitle,
  newMediaUrl,
  setNewMediaUrl,
  onAddMediaSubmit,
  selectedLightboxMedia,
  setSelectedLightboxMedia,
  onCopyMediaUrl,
  assignMediaModal,
  setAssignMediaModal,
  onAddMediaToTourGallery,
  onAssignMediaAsTourCover,
}: DashboardCmsModalsHostProps) {
  return (
    <React.Suspense fallback={null}>
      {/* BOOKING MODAL */}
      {isModalOpen && (
        <BookingModal
          isOpen={isModalOpen}
          editingBooking={editingBooking}
          formData={formData}
          setFormData={setFormData}
          onClose={() => setIsModalOpen(false)}
          onSubmit={onSubmitBooking}
          tours={tours}
          bookings={bookings || []}
          agents={agents || []}
          suppliers={suppliers || []}
          tourCosts={tourCosts || []}
          showToast={showToast || (() => {})}
        />
      )}

      {/* TOUR MODAL */}
      {isTourModalOpen && (
        <TourModal
          isOpen={isTourModalOpen}
          editingTour={editingTour}
          tourFormData={tourFormData}
          setTourFormData={setTourFormData}
          onClose={() => setIsTourModalOpen(false)}
          onSubmit={onSubmitTour}
          getImageUrl={getImageUrl}
          handleFileUpload={handleFileUpload}
          allImageOptions={availableImages}
          mediaList={mediaList}
          allTours={tours}
          categories={categories}
          onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
          inclusionLibrary={inclusionLibrary}
          onRememberOption={onRememberOption}
          onForgetOption={onForgetOption}
        />
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          categories={categories}
          onSaveCategory={onSaveCategory}
          onDeleteCategory={onDeleteCategory}
          availableImages={availableImages}
          showToast={showToast}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}

      {/* TESTIMONIAL MODAL */}
      {isTestiModalOpen && (
        <TestimonialModal
          editingTesti={editingTesti}
          testiFormData={testiFormData}
          setTestiFormData={setTestiFormData}
          onClose={() => setIsTestiModalOpen(false)}
          onSubmit={onSubmitTesti}
        />
      )}

      {/* FAQ MODAL */}
      {isFaqModalOpen && (
        <FaqModal
          editingFaq={editingFaq}
          faqFormData={faqFormData}
          setFaqFormData={setFaqFormData}
          onClose={() => setIsFaqModalOpen(false)}
          onSubmit={onSubmitFaq}
        />
      )}

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <ServiceModal
          serviceFormData={serviceFormData}
          setServiceFormData={setServiceFormData}
          onClose={() => setIsServiceModalOpen(false)}
          onSubmit={onSubmitService}
          getImageUrl={getImageUrl || ((img) => img || '')}
          handleFileUpload={handleFileUpload || (() => {})}
          allImageOptions={availableImages}
          mediaList={mediaList}
        />
      )}

      {/* BLOG MODAL */}
      {isBlogModalOpen && (
        <BlogModal
          editingBlog={editingBlog}
          blogFormData={blogFormData}
          setBlogFormData={setBlogFormData}
          onClose={() => setIsBlogModalOpen(false)}
          onSubmit={onSubmitBlog}
          getImageUrl={getImageUrl || ((img) => img || '')}
          handleFileUpload={handleFileUpload || (() => {})}
          allImageOptions={availableImages}
          mediaList={mediaList}
        />
      )}

      {/* ADD MEDIA MODAL */}
      {isAddMediaModalOpen && (
        <AddMediaModal
          mediaUploadMode={mediaUploadMode}
          setMediaUploadMode={setMediaUploadMode}
          newMediaTitle={newMediaTitle}
          setNewMediaTitle={setNewMediaTitle}
          newMediaUrl={newMediaUrl}
          setNewMediaUrl={setNewMediaUrl}
          onSubmit={onAddMediaSubmit}
          onClose={() => setIsAddMediaModalOpen(false)}
          getImageUrl={getImageUrl || ((img) => img || '')}
        />
      )}

      {/* MEDIA LIGHTBOX MODAL */}
      {selectedLightboxMedia && (
        <MediaLightboxModal
          media={selectedLightboxMedia}
          onClose={() => setSelectedLightboxMedia(null)}
          onCopyUrl={onCopyMediaUrl}
          onAssignToTour={() => {
            setAssignMediaModal(selectedLightboxMedia);
            setSelectedLightboxMedia(null);
          }}
          getImageUrl={getImageUrl || ((img) => img || '')}
        />
      )}

      {/* ASSIGN MEDIA MODAL */}
      {assignMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Görseli Tura Bağla
            </h3>
            <p className="text-xs text-slate-500">
              "{assignMediaModal.title}" görselini hangi tura bağlamak istersiniz?
            </p>
            <select
              id="assignTourSelect"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium cursor-pointer"
            >
              {tours.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssignMediaModal(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = (document.getElementById('assignTourSelect') as HTMLSelectElement)?.value;
                  if (sel) onAddMediaToTourGallery(assignMediaModal.url, sel);
                }}
                className="flex-1 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Galerisine Ekle
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = (document.getElementById('assignTourSelect') as HTMLSelectElement)?.value;
                  if (sel) onAssignMediaAsTourCover(assignMediaModal.url, sel);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
              >
                Kapak Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </React.Suspense>
  );
}
