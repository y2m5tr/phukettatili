import type React from 'react';
import type { TourItem, MediaItem, CategoryItem } from '../../../data/adminTypes';
import { type OptionLibrary } from '../../../lib/inclusionLibrary';

export const PRESET_INCLUSIONS = [
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

export const PRESET_EXCLUSIONS = [
  '🏞️ Milli Park Giriş Harcı (Yetişkin 400 THB / Çocuk 200 THB)',
  '🍹 Kişisel Harcamalar ve Alkollü İçecekler',
  '🚐 Uzak Bölge Transfer Ekstra Ücreti (Rawai, Nai Harn vb.)',
  '📸 Profesyonel Fotoğraf & Drone Çekim Hizmeti',
  '🪙 Bahşişler (Kaptan ve Mürettebat için isteğe bağlı)',
  '🤿 Palet (Fins) Kiralama',
  '🏨 Otel Ekstra Harcamaları',
];

export const TOUR_TEMPLATES = [
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

export type InclusionLibrary = OptionLibrary;

export type TourActiveTab = 'general' | 'photos' | 'itinerary' | 'inclusions' | 'faqs' | 'notes';

export interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTour: TourItem | null;
  tourFormData: Partial<TourItem>;
  setTourFormData: React.Dispatch<React.SetStateAction<Partial<TourItem>>>;
  onSubmit: (e: React.SyntheticEvent) => void;
  getImageUrl?: (url?: string) => string;
  handleFileUpload?: (file: File, callback?: (url: string) => void) => void;
  allImageOptions?: string[];
  mediaList?: MediaItem[];
  allTours?: TourItem[];
  categories?: CategoryItem[];
  onOpenCategoryModal?: () => void;
  inclusionLibrary?: InclusionLibrary;
  onRememberOption?: (kind: 'included' | 'excluded', item: string) => void;
  onForgetOption?: (kind: 'included' | 'excluded', item: string) => void;
}
