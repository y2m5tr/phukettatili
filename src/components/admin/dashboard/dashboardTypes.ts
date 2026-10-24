import type {
  TourItem,
  FaqItem,
  TestimonialItem,
  ServiceItem,
  BlogItem,
  Booking,
} from '../../data/adminInitialData';
import type { CategoryItem } from '../../data/adminTypes';
import type { SiteSettingsState } from '../SettingsTab';

export const STORAGE_KEY_BOOKINGS = 'phuket_tatili_crm_bookings_v2';
export const STORAGE_KEY_TOURS = 'phuket_tatili_crm_tours_v2';
export const STORAGE_KEY_BLOGS = 'phuket_tatili_crm_blogs_v2';
export const STORAGE_KEY_SERVICES = 'phuket_tatili_crm_services_v2';
export const STORAGE_KEY_FAQS = 'phuket_tatili_crm_faqs_v2';
export const STORAGE_KEY_TESTIMONIALS = 'phuket_tatili_crm_testimonials_v2';
export const STORAGE_KEY_SITE = 'phuket_tatili_crm_site_settings_v2';
export const STORAGE_KEY_MEDIA = 'phuket_tatili_crm_media_v2';
export const STORAGE_KEY_VEHICLES = 'phuket_tatili_crm_vehicles_v1';
export const STORAGE_KEY_DRIVERS = 'phuket_tatili_crm_drivers_v1';
export const STORAGE_KEY_PAYMENTS = 'phuket_tatili_crm_payments_v1';
export const STORAGE_KEY_AGENTS = 'phuket_tatili_crm_agents_v1';
export const STORAGE_KEY_SUPPLIERS = 'phuket_tatili_crm_suppliers_v1';
export const STORAGE_KEY_TOUR_COSTS = 'phuket_tatili_crm_tour_costs_v1';
export const STORAGE_KEY_HOME_SETTINGS = 'phuket_tatili_crm_home_settings_v1';
export const STORAGE_KEY_CATEGORIES = 'phuket_tatili_crm_categories_v1';

export const DEFAULT_AVAILABLE_IMAGES = [
  'phuket_hero.webp',
  'phuket_yacht.webp',
  'pileh.webp',
  'beach.webp',
  'beachclub.webp',
  'couple.webp',
  'family.webp',
  'longtail.webp',
  'railay.webp',
  'bay.webp',
  'elephant.webp',
  'underwater.webp',
  'culture.webp',
  'food.webp',
  'phuket_transfer.webp',
  'phuket_culture.webp',
  'yacht.webp',
];

export interface AdminDashboardProps {
  initialTours: TourItem[];
  initialCategories?: CategoryItem[];
  initialBlogs: BlogItem[];
  initialServices: ServiceItem[];
  initialFaqs: FaqItem[];
  initialTestimonials: TestimonialItem[];
  initialSiteSettings: SiteSettingsState;
  initialHomeSettings?: any;
  availableImages?: string[];
  /** Giriş yapan üyenin rolü (üyelik sistemi) — null: eski şifre girişi. */
  viewerRole?: 'owner' | 'manager' | 'guide' | 'driver' | null;
}
