import type { TourItem } from '../../../data/adminInitialData';
import type { CategoryItem } from '../../../data/adminTypes';

export function buildInitialTourFormData(orderCount: number): Partial<TourItem> {
  return {
    title: '',
    priceThb: 0,
    costThb: 0,
    duration: 'Tam Gün',
    featured: false,
    image: 'phuket_hero.webp',
    category: 'island-tours',
    included: ['Otel Transferi', 'Öğle Yemeği', 'Şnorkel Ekipmanı', 'Sigorta'],
    excluded: ['Milli Park Ücreti (Gerekiyorsa)', 'Kişisel Harcamalar'],
    order: orderCount + 1,
  };
}

export function buildSubmittedTour(
  tourFormData: Partial<TourItem>,
  editingTour: TourItem | null,
  categories: CategoryItem[]
): TourItem {
  if (editingTour) {
    return {
      ...editingTour,
      ...tourFormData,
      order: Number(tourFormData.order) || editingTour.order || 999,
      priceThb: Number(tourFormData.priceThb) || 0,
      costThb: Number(tourFormData.costThb) || 0,
      supplier: tourFormData.supplier || '',
      gallery: tourFormData.gallery || [],
      included: tourFormData.included || [],
      excluded: tourFormData.excluded || [],
      program: tourFormData.program || [],
      faq: tourFormData.faq || [],
      restrictions: tourFormData.restrictions || [],
      body: tourFormData.body || '',
    } as TourItem;
  }

  const slug = (tourFormData.title || '')
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const matchedCat = categories.find((c) => c.slug === tourFormData.category);
  const categoryLabel = matchedCat?.label_tr || tourFormData.category || 'Ada Turları';

  return {
    id: slug || `tur-${Date.now()}`,
    title: tourFormData.title || '',
    order: Number(tourFormData.order) || 1,
    category: tourFormData.category || 'island-tours',
    categoryLabel,
    priceThb: Number(tourFormData.priceThb) || 0,
    costThb: Number(tourFormData.costThb) || 0,
    supplier: tourFormData.supplier || '',
    duration: tourFormData.duration || 'Tam Gün',
    featured: Boolean(tourFormData.featured),
    active: true,
    image: tourFormData.image || 'phuket_hero.webp',
    excerpt: tourFormData.excerpt,
    gallery: tourFormData.gallery || [],
    included: tourFormData.included || [],
    excluded: tourFormData.excluded || [],
    program: tourFormData.program || [],
    faq: tourFormData.faq || [],
    restrictions: tourFormData.restrictions || [],
    body: tourFormData.body || '',
  };
}
