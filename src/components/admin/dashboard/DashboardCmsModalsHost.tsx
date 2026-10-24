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
} from '../../../data/adminInitialData';
import type { CategoryItem } from '../../../data/adminTypes';
import type { OptionLibrary, OptionKind } from '../../../lib/inclusionLibrary';
import { AddMediaModal, MediaLightboxModal } from '../MediaModals';

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
  setFormData: (data: Partial<Booking>) => void;
  onSubmitBooking: (e: React.FormEvent) => void;
  tours: TourItem[];
  vehicles: VehicleItem[];
  drivers: DriverItem[];
  onOpenCreateTour: () => void;
  isTourModalOpen: boolean;
  setIsTourModalOpen: (v: boolean) => void;
  editingTour: TourItem | null;
  tourFormData: Partial<TourItem>;
  setTourFormData: (data: Partial<TourItem>) => void;
  onSubmitTour: (e: React.FormEvent) => void;
  categories: CategoryItem[];
  inclusionLibrary: OptionLibrary;
  onRememberOption: (kind: OptionKind, item: string) => void;
  onForgetOption: (kind: OptionKind, item: string) => void;
  availableImages: string[];
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (v: boolean) => void;
  editingCategory: CategoryItem | null;
  categoryFormData: Partial<CategoryItem>;
  setCategoryFormData: (data: Partial<CategoryItem>) => void;
  onSubmitCategory: (e: React.FormEvent) => void;
  isBlogModalOpen: boolean;
  setIsBlogModalOpen: (v: boolean) => void;
  editingBlog: BlogItem | null;
  blogFormData: Partial<BlogItem>;
  setBlogFormData: (data: Partial<BlogItem>) => void;
  onSubmitBlog: (e: React.FormEvent) => void;
  isServiceModalOpen: boolean;
  setIsServiceModalOpen: (v: boolean) => void;
  editingService: ServiceItem | null;
  serviceFormData: Partial<ServiceItem>;
  setServiceFormData: (data: Partial<ServiceItem>) => void;
  onSubmitService: (e: React.FormEvent) => void;
  isFaqModalOpen: boolean;
  setIsFaqModalOpen: (v: boolean) => void;
  editingFaq: FaqItem | null;
  faqFormData: Partial<FaqItem>;
  setFaqFormData: (data: Partial<FaqItem>) => void;
  onSubmitFaq: (e: React.FormEvent) => void;
  isTestiModalOpen: boolean;
  setIsTestiModalOpen: (v: boolean) => void;
  editingTesti: TestimonialItem | null;
  testiFormData: Partial<TestimonialItem>;
  setTestiFormData: (data: Partial<TestimonialItem>) => void;
  onSubmitTesti: (e: React.FormEvent) => void;
  isAddMediaModalOpen: boolean;
  setIsAddMediaModalOpen: (v: boolean) => void;
  mediaUploadMode: 'file' | 'url';
  setMediaUploadMode: (mode: 'file' | 'url') => void;
  newMediaTitle: string;
  setNewMediaTitle: (t: string) => void;
  newMediaUrl: string;
  setNewMediaUrl: (u: string) => void;
  onAddMediaSubmit: (e: React.FormEvent) => void;
  onFileUpload: (file: File) => void;
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
  vehicles,
  drivers,
  onOpenCreateTour,
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
  isCategoryModalOpen,
  setIsCategoryModalOpen,
  editingCategory,
  categoryFormData,
  setCategoryFormData,
  onSubmitCategory,
  isBlogModalOpen,
  setIsBlogModalOpen,
  editingBlog,
  blogFormData,
  setBlogFormData,
  onSubmitBlog,
  isServiceModalOpen,
  setIsServiceModalOpen,
  editingService,
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
  onFileUpload,
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
          vehicles={vehicles}
          drivers={drivers}
          onOpenCreateTour={onOpenCreateTour}
        />
      )}

      {/* TOUR MODAL */}
      {isTourModalOpen && (
        <TourModal
          isOpen={isTourModalOpen}
          editingTour={editingTour}
          formData={tourFormData}
          setFormData={setTourFormData}
          onClose={() => setIsTourModalOpen(false)}
          onSubmit={onSubmitTour}
          categories={categories}
          inclusionLibrary={inclusionLibrary}
          onRememberOption={onRememberOption}
          onForgetOption={onForgetOption}
          availableImages={availableImages}
        />
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          editingCategory={editingCategory}
          formData={categoryFormData}
          setFormData={setCategoryFormData}
          onClose={() => setIsCategoryModalOpen(false)}
          onSubmit={onSubmitCategory}
        />
      )}

      {/* TESTIMONIAL MODAL */}
      {isTestiModalOpen && (
        <TestimonialModal
          isOpen={isTestiModalOpen}
          editingTestimonial={editingTesti}
          formData={testiFormData}
          setFormData={setTestiFormData}
          onClose={() => setIsTestiModalOpen(false)}
          onSubmit={onSubmitTesti}
          tours={tours}
        />
      )}

      {/* FAQ MODAL */}
      {isFaqModalOpen && (
        <FaqModal
          isOpen={isFaqModalOpen}
          editingFaq={editingFaq}
          formData={faqFormData}
          setFormData={setFaqFormData}
          onClose={() => setIsFaqModalOpen(false)}
          onSubmit={onSubmitFaq}
        />
      )}

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <ServiceModal
          isOpen={isServiceModalOpen}
          editingService={editingService}
          formData={serviceFormData}
          setFormData={setServiceFormData}
          onClose={() => setIsServiceModalOpen(false)}
          onSubmit={onSubmitService}
        />
      )}

      {/* BLOG MODAL */}
      {isBlogModalOpen && (
        <BlogModal
          isOpen={isBlogModalOpen}
          editingBlog={editingBlog}
          formData={blogFormData}
          setFormData={setBlogFormData}
          onClose={() => setIsBlogModalOpen(false)}
          onSubmit={onSubmitBlog}
          availableImages={availableImages}
        />
      )}

      {/* ADD MEDIA MODAL */}
      {isAddMediaModalOpen && (
        <AddMediaModal
          isOpen={isAddMediaModalOpen}
          onClose={() => setIsAddMediaModalOpen(false)}
          mediaUploadMode={mediaUploadMode}
          setMediaUploadMode={setMediaUploadMode}
          newMediaTitle={newMediaTitle}
          setNewMediaTitle={setNewMediaTitle}
          newMediaUrl={newMediaUrl}
          setNewMediaUrl={setNewMediaUrl}
          onSubmit={onAddMediaSubmit}
          onFileUpload={onFileUpload}
        />
      )}

      {/* MEDIA LIGHTBOX MODAL */}
      {selectedLightboxMedia && (
        <MediaLightboxModal
          media={selectedLightboxMedia}
          onClose={() => setSelectedLightboxMedia(null)}
          onCopyUrl={onCopyMediaUrl}
        />
      )}

      {/* ASSIGN MEDIA MODAL */}
      {assignMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Fotoğrafı Tura Ata
            </h3>
            <p className="text-xs text-slate-500">
              "{assignMediaModal.title}" görselini hangi tur ile ilişkilendirmek istersiniz?
            </p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hedef Turu Seçin:
              </label>
              <select
                id="assignTourSelect"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brand-primary"
              >
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
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
