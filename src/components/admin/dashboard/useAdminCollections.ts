import { useState, useCallback, useMemo } from 'react';
import type {
  TourItem,
  FaqItem,
  TestimonialItem,
  ServiceItem,
  BlogItem,
  MediaItem,
  VehicleItem,
  DriverItem,
  PaymentRecord,
  PartnerAgent,
  SupplierItem,
  TourCostItem,
} from '../../../data/adminInitialData';
import {
  initialPayments,
  initialAgents,
  initialSuppliers,
  initialTourCosts,
} from '../../../data/adminInitialData';
import type { CategoryItem } from '../../../data/adminTypes';
import type { SiteSettingsState } from '../SettingsTab';
import {
  STORAGE_KEY_TOURS,
  STORAGE_KEY_PAYMENTS,
  STORAGE_KEY_AGENTS,
  STORAGE_KEY_SUPPLIERS,
  STORAGE_KEY_TOUR_COSTS,
  STORAGE_KEY_HOME_SETTINGS,
  STORAGE_KEY_CATEGORIES,
  DEFAULT_AVAILABLE_IMAGES,
} from './dashboardTypes';
import {
  loadCmsCollections,
  saveCmsCollection,
  writeLocalCollection,
  readLocalCollection,
  type CmsCollectionKey,
} from '../../../lib/cmsSync';
import {
  normalizeOptionLibrary,
  rememberOption as rememberOptionInLibrary,
  forgetOption as forgetOptionInLibrary,
  type OptionLibrary,
  type OptionKind,
} from '../../../lib/inclusionLibrary';
import { safeGet, } from '../../../lib/safeStorage';
import {
  UPLOAD_MAX_MB,
  slugifyFileName,
  processImageFile,
  uploadToStorage,
} from '../../../lib/imageUpload';

export interface UseAdminCollectionsArgs {
  initialTours: TourItem[];
  initialCategories?: CategoryItem[];
  initialBlogs: BlogItem[];
  initialServices: ServiceItem[];
  initialFaqs: FaqItem[];
  initialTestimonials: TestimonialItem[];
  initialSiteSettings: SiteSettingsState;
  initialHomeSettings?: any;
  availableImages?: string[];
  showToast: (msg: string) => void;
}

export function useAdminCollections({
  initialTours,
  initialCategories = [],
  initialBlogs,
  initialServices,
  initialFaqs,
  initialTestimonials,
  initialSiteSettings,
  initialHomeSettings,
  availableImages = DEFAULT_AVAILABLE_IMAGES,
  showToast,
}: UseAdminCollectionsArgs) {
  // 1. Tours & Categories
  const [tours, setTours] = useState<TourItem[]>(() =>
    safeGet<TourItem[]>(STORAGE_KEY_TOURS, initialTours)
  );
  const [tourSearchQuery, setTourSearchQuery] = useState<string>('');
  const [tourCategoryFilter, setTourCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<CategoryItem[]>(() =>
    safeGet<CategoryItem[]>(STORAGE_KEY_CATEGORIES, initialCategories)
  );

  const saveTours = useCallback(
    (next: TourItem[]) => {
      setTours(next);
      saveCmsCollection('tours', next, showToast);
    },
    [showToast]
  );

  const saveCategories = useCallback(
    (next: CategoryItem[]) => {
      setCategories(next);
      saveCmsCollection('categories', next, showToast);
    },
    [showToast]
  );

  const tourCategoryOptions = useMemo(() => {
    const fromTours = tours.map((t) => t.category).filter(Boolean);
    const fromCats = categories.map((c) => c.slug).filter(Boolean);
    return Array.from(new Set([...fromTours, ...fromCats])).sort();
  }, [tours, categories]);

  // Inclusion Library
  const [inclusionLibrary, setInclusionLibrary] = useState<OptionLibrary>(() =>
    normalizeOptionLibrary(readLocalCollection<OptionLibrary>('inclusion-library', null))
  );

  const rememberLibraryOption = useCallback(
    (kind: OptionKind, item: string) => {
      setInclusionLibrary((prev) => {
        const next = rememberOptionInLibrary(prev, kind, item);
        if (next === prev) return prev;
        saveCmsCollection('inclusion-library', next, () =>
          showToast('⚠️ Dahil/hariç havuzu buluta kaydedilemedi.')
        );
        return next;
      });
    },
    [showToast]
  );

  const forgetLibraryOption = useCallback(
    (kind: OptionKind, item: string) => {
      setInclusionLibrary((prev) => {
        const next = forgetOptionInLibrary(prev, kind, item);
        if (next === prev) return prev;
        saveCmsCollection('inclusion-library', next, () =>
          showToast('⚠️ Dahil/hariç havuzu güncellenemedi.')
        );
        showToast(`🗑️ "${item}" havuzdan kaldırıldı.`);
        return next;
      });
    },
    [showToast]
  );

  // Fleet & Crew
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);

  const saveVehicles = useCallback(
    (next: VehicleItem[]) => {
      setVehicles(next);
      saveCmsCollection('vehicles', next, showToast);
    },
    [showToast]
  );

  const saveDrivers = useCallback(
    (next: DriverItem[]) => {
      setDrivers(next);
      saveCmsCollection('drivers', next, showToast);
    },
    [showToast]
  );

  // ERP Finance & Payments
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    return safeGet<PaymentRecord[]>(STORAGE_KEY_PAYMENTS, initialPayments);
  });

  const savePayments = useCallback(
    (next: PaymentRecord[]) => {
      setPayments(next);
      saveCmsCollection('payments', next, () =>
        showToast('⚠️ Bulut yazma hatası: kasa kayıtları buluta kaydedilemedi.')
      );
    },
    [showToast]
  );

  const handleAddPayment = useCallback(
    (record: Omit<PaymentRecord, 'id' | 'collectedAt'>) => {
      const newRecord: PaymentRecord = {
        ...record,
        id: `PAY-${Date.now().toString().slice(-6)}`,
        collectedAt: new Date().toISOString(),
      };
      savePayments([newRecord, ...payments]);
    },
    [payments, savePayments]
  );

  // ERP Agents & Suppliers & Tour Costs
  const [agents, setAgents] = useState<PartnerAgent[]>(() => {
    return safeGet<PartnerAgent[]>(STORAGE_KEY_AGENTS, initialAgents);
  });

  const saveAgents = useCallback(
    (next: PartnerAgent[]) => {
      setAgents(next);
      saveCmsCollection('agents', next, () =>
        showToast('⚠️ Bulut yazma hatası: acenta kayıtları buluta kaydedilemedi.')
      );
    },
    [showToast]
  );

  const [suppliers, setSuppliers] = useState<SupplierItem[]>(() => {
    return safeGet<SupplierItem[]>(STORAGE_KEY_SUPPLIERS, initialSuppliers);
  });

  const saveSuppliers = useCallback(
    (next: SupplierItem[]) => {
      setSuppliers(next);
      saveCmsCollection('suppliers', next, () =>
        showToast('⚠️ Bulut yazma hatası: tedarikçi kayıtları buluta kaydedilemedi.')
      );
    },
    [showToast]
  );

  const [tourCosts, setTourCosts] = useState<TourCostItem[]>(() => {
    return safeGet<TourCostItem[]>(STORAGE_KEY_TOUR_COSTS, initialTourCosts);
  });

  const saveTourCosts = useCallback(
    (next: TourCostItem[]) => {
      setTourCosts(next);
      saveCmsCollection('tour-costs', next, () =>
        showToast('⚠️ Bulut yazma hatası: tur maliyet kayıtları buluta kaydedilemedi.')
      );
    },
    [showToast]
  );

  // Media
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'system' | 'uploaded' | 'external'>('all');

  const saveMediaList = useCallback(
    (next: MediaItem[]) => {
      setMediaList(next);
      saveCmsCollection('media', next, showToast);
    },
    [showToast]
  );

  // Blogs, Services, Faqs, Testimonials
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  const saveBlogs = useCallback(
    (next: BlogItem[]) => {
      setBlogs(next);
      saveCmsCollection('blogs', next, showToast);
    },
    [showToast]
  );

  const saveServices = useCallback(
    (next: ServiceItem[]) => {
      setServices(next);
      saveCmsCollection('services', next, showToast);
    },
    [showToast]
  );

  const saveFaqs = useCallback(
    (next: FaqItem[]) => {
      setFaqs(next);
      saveCmsCollection('faqs', next, showToast);
    },
    [showToast]
  );

  const saveTestimonials = useCallback(
    (next: TestimonialItem[]) => {
      setTestimonials(next);
      saveCmsCollection('testimonials', next, showToast);
    },
    [showToast]
  );

  // Site & Home Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettingsState>(initialSiteSettings);
  const [settingsSaved, setSettingsSaved] = useState<boolean>(false);
  const [homeSettings, setHomeSettings] = useState<any>(() => {
    return safeGet(STORAGE_KEY_HOME_SETTINGS, initialHomeSettings || null);
  });

  const handleSaveSettings = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      saveCmsCollection('site-settings', siteSettings, showToast);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    },
    [siteSettings, showToast]
  );

  const handleFileUpload = useCallback(
    (file: File, callback?: (url: string) => void) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Hata: Sadece görsel dosyası yüklenebilir (JPG, PNG, WebP, GIF).');
        return;
      }
      if (file.size > UPLOAD_MAX_MB * 1024 * 1024) {
        showToast(`Hata: Dosya çok büyük (${(file.size / 1024 / 1024).toFixed(1)}MB). En fazla ${UPLOAD_MAX_MB}MB.`);
        return;
      }
      processImageFile(file)
        .then(async ({ width, height, blob }) => {
          const slug = slugifyFileName(file.name);
          const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
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
          const updated = [newMedia, ...mediaList];
          saveMediaList(updated);
          showToast(
            cloud
              ? `"${file.name}" buluta yüklendi: ${width}×${height} → ${(blob.size / 1024).toFixed(0)}KB WebP`
              : `"${file.name}" yerel yüklendi (bulut kapalı): ${width}×${height}`
          );
          if (callback) callback(finalUrl);
        })
        .catch((err) => {
          showToast(err?.message || 'Yükleme sırasında hata oluştu.');
        });
    },
    [mediaList, saveMediaList, showToast]
  );

  const refreshCmsFromServer = useCallback(async (): Promise<void> => {
    try {
      const { items, offline } = await loadCmsCollections();
      if (offline) return;
      const apply = <T,>(key: CmsCollectionKey, setValue: (v: T) => void) => {
        const cloud = items[key];
        if (cloud === undefined) return;
        setValue(cloud as T);
        writeLocalCollection(key, cloud);
      };
      apply('tours', setTours);
      apply('categories', setCategories);
      apply('blogs', setBlogs);
      apply('services', setServices);
      apply('faqs', setFaqs);
      apply('testimonials', setTestimonials);
      apply('media', setMediaList);
      apply('site-settings', setSiteSettings);
      apply('home-settings', setHomeSettings);
      apply('vehicles', setVehicles);
      apply('drivers', setDrivers);
      apply('payments', setPayments);
      apply('agents', setAgents);
      apply('suppliers', setSuppliers);
      apply('tour-costs', setTourCosts);
      apply('inclusion-library', (val) => {
        const normalized = normalizeOptionLibrary(val);
        setInclusionLibrary(normalized);
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
  }, []);

  return {
    tours,
    setTours,
    saveTours,
    tourSearchQuery,
    setTourSearchQuery,
    tourCategoryFilter,
    setTourCategoryFilter,
    categories,
    setCategories,
    saveCategories,
    tourCategoryOptions,
    inclusionLibrary,
    rememberLibraryOption,
    forgetLibraryOption,
    vehicles,
    setVehicles,
    saveVehicles,
    drivers,
    setDrivers,
    saveDrivers,
    payments,
    setPayments,
    savePayments,
    handleAddPayment,
    agents,
    setAgents,
    saveAgents,
    suppliers,
    setSuppliers,
    saveSuppliers,
    tourCosts,
    setTourCosts,
    saveTourCosts,
    mediaList,
    setMediaList,
    saveMediaList,
    mediaSearchQuery,
    setMediaSearchQuery,
    mediaTypeFilter,
    setMediaTypeFilter,
    handleFileUpload,
    blogs,
    setBlogs,
    saveBlogs,
    services,
    setServices,
    saveServices,
    faqs,
    setFaqs,
    saveFaqs,
    testimonials,
    setTestimonials,
    saveTestimonials,
    siteSettings,
    setSiteSettings,
    settingsSaved,
    handleSaveSettings,
    homeSettings,
    setHomeSettings,
    refreshCmsFromServer,
  };
}
