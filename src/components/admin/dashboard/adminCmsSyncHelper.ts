import type { MediaItem } from '../../../data/adminInitialData';
import {
  UPLOAD_MAX_MB,
  slugifyFileName,
  processImageFile,
  uploadToStorage,
} from '../../../lib/imageUpload';
import {
  loadCmsCollections,
  writeLocalCollection,
  type CmsCollectionKey,
} from '../../../lib/cmsSync';
import { normalizeOptionLibrary } from '../../../lib/inclusionLibrary';

export async function uploadMediaItem(
  file: File,
  showToast: (msg: string) => void,
  callback?: (url: string) => void
): Promise<MediaItem | null> {
  if (!file) return null;
  if (!file.type.startsWith('image/')) {
    showToast('Hata: Sadece görsel dosyası yüklenebilir (JPG, PNG, WebP, GIF).');
    return null;
  }
  if (file.size > UPLOAD_MAX_MB * 1024 * 1024) {
    showToast(`Hata: Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB). En fazla ${UPLOAD_MAX_MB}MB.`);
    return null;
  }
  try {
    const { width, height, blob } = await processImageFile(file);
    const slug = slugifyFileName(file.name);
    const ext = blob.type === 'image/avif' ? 'avif' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const fileName = `${slug}.${ext}`;
    const { url: finalUrl, cloud } = await uploadToStorage(blob, fileName);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const newMedia: MediaItem = {
      id: `med-${Date.now()}`,
      title: cleanTitle,
      url: finalUrl,
      type: 'uploaded',
      size: `${Math.round(blob.size / 1024)} KB · ${width}×${height}`,
      createdAt: new Date().toLocaleDateString('tr-TR'),
      slug: fileName,
    };
    const formatLabel = blob.type === 'image/avif' ? 'AVIF' : blob.type === 'image/webp' ? 'WebP' : 'JPEG';
    showToast(
      cloud
        ? `"${file.name}" buluta yüklendi: ${width}×${height} → ${(blob.size / 1024).toFixed(0)}KB ${formatLabel}`
        : `"${file.name}" yerel yüklendi (bulut kapalı): ${width}×${height}`
    );
    if (callback) callback(finalUrl);
    return newMedia;
  } catch (err: any) {
    showToast(err?.message || 'Yükleme sırasında hata oluştu.');
    return null;
  }
}

export interface CmsSyncSetters {
  setTours: (v: any) => void;
  setCategories: (v: any) => void;
  setBlogs: (v: any) => void;
  setServices: (v: any) => void;
  setFaqs: (v: any) => void;
  setTestimonials: (v: any) => void;
  setMediaList: (v: any) => void;
  setSiteSettings: (v: any) => void;
  setHomeSettings: (v: any) => void;
  setVehicles: (v: any) => void;
  setDrivers: (v: any) => void;
  setPayments: (v: any) => void;
  setAgents: (v: any) => void;
  setSuppliers: (v: any) => void;
  setTourCosts: (v: any) => void;
  setInclusionLibrary: (v: any) => void;
}

export async function fetchAndApplyCloudCms(setters: CmsSyncSetters): Promise<void> {
  try {
    const { items, offline } = await loadCmsCollections();
    if (offline) return;
    const apply = <T>(key: CmsCollectionKey, setValue: (v: T) => void) => {
      const cloud = items[key];
      if (cloud === undefined) return;
      setValue(cloud as T);
      writeLocalCollection(key, cloud);
    };
    apply('tours', setters.setTours);
    apply('categories', setters.setCategories);
    apply('blogs', setters.setBlogs);
    apply('services', setters.setServices);
    apply('faqs', setters.setFaqs);
    apply('testimonials', setters.setTestimonials);
    apply('media', setters.setMediaList);
    apply('site-settings', setters.setSiteSettings);
    apply('home-settings', setters.setHomeSettings);
    apply('vehicles', setters.setVehicles);
    apply('drivers', setters.setDrivers);
    apply('payments', setters.setPayments);
    apply('agents', setters.setAgents);
    apply('suppliers', setters.setSuppliers);
    apply('tour-costs', setters.setTourCosts);
    apply('inclusion-library', (val) => {
      const normalized = normalizeOptionLibrary(val);
      setters.setInclusionLibrary(normalized);
      writeLocalCollection('inclusion-library', normalized);
    });
    apply('expenses', (val) => writeLocalCollection('expenses', val));
    apply('virmans', (val) => writeLocalCollection('virmans', val));
    apply('driver-expenses', (val) => writeLocalCollection('driver-expenses', val));
    apply('guide-expenses', (val) => writeLocalCollection('guide-expenses', val));
    apply('proposals', (val) => writeLocalCollection('proposals', val));
    apply('lost-found', (val) => writeLocalCollection('lost-found', val));
    apply('luggage', (val) => writeLocalCollection('luggage', val));
  } catch {
    // ignore
  }
}
