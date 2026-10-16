import type { Booking } from '../data/adminInitialData';
import type { PickupItem } from './adminFilters';

export interface EmergencyContact {
  id: string;
  title: string;
  number: string;
  telUri: string;
  category: 'police' | 'marine' | 'hospital' | 'pier' | 'office';
  description: string;
  badge?: string;
}

export interface RadioFrequency {
  channel: string;
  frequency: string;
  usage: string;
}

export const CAPTAIN_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'tourist_police',
    title: 'Phuket Turist Polisi (Tourist Police)',
    number: '1155',
    telUri: 'tel:1155',
    category: 'police',
    description: '7/24 İngilizce ve Türkçe tercüman destekli acil çağrı hattı',
    badge: '🚨 24 Saat Acil',
  },
  {
    id: 'marine_police',
    title: 'Phuket Deniz Polisi (Marine Police Station)',
    number: '076-211-883',
    telUri: 'tel:+6676211883',
    category: 'marine',
    description: 'Andaman Denizi açıklarında acil kurtarma ve devriye botu',
    badge: '🚤 Deniz Kurtarma',
  },
  {
    id: 'thai_navy',
    title: 'Kraliyet Donanması 3. Bölge Komutanlığı',
    number: '076-391-598',
    telUri: 'tel:+6676391598',
    category: 'marine',
    description: 'Phuket & Similan açık deniz arama-kurtarma deniz üssü',
  },
  {
    id: 'bangkok_hospital',
    title: 'Bangkok Hospital Phuket Acil Servis (VIP)',
    number: '1719 / 076-254-444',
    telUri: 'tel:+6676254444',
    category: 'hospital',
    description: 'Uluslararası sigorta anlaşmalı, hiperbarik basınç odalı tam teşekküllü acil',
    badge: '🏥 Uluslararası Hastane',
  },
  {
    id: 'vachira_hospital',
    title: 'Vachira Phuket Devlet Hastanesi Acil',
    number: '076-361-234',
    telUri: 'tel:+6676361234',
    category: 'hospital',
    description: 'Phuket Merkez resmi devlet travma ve acil tıp merkezi',
  },
  {
    id: 'chalong_pier',
    title: 'Chalong İskelesi Liman Başkanlığı (Harbor Master)',
    number: '076-381-835',
    telUri: 'tel:+6676381835',
    category: 'pier',
    description: 'Tekne giriş-çıkış koordinasyon ve fırtına uyarı kontrol merkezi',
    badge: '⚓ Chalong İskelesi',
  },
  {
    id: 'rassada_pier',
    title: 'Rassada İskelesi Kontrol Noktası (Phi Phi İskelesi)',
    number: '076-241-118',
    telUri: 'tel:+6676241118',
    category: 'pier',
    description: 'Feribot ve sürat tekneleri liman kontrol merkezi',
    badge: '⚓ Rassada İskelesi',
  },
  {
    id: 'tablamu_pier',
    title: 'Tablamu İskelesi (Similan Çıkışı Liman İdaresi)',
    number: '076-443-276',
    telUri: 'tel:+6676443276',
    category: 'pier',
    description: 'Khao Lak / Similan Adaları çıkış liman kontrolü',
    badge: '⚓ Tablamu İskelesi',
  },
  {
    id: 'office_support',
    title: 'Phuket Tatili 7/24 Türkçe Saha Koordinatörü',
    number: '+66 82 895 0665',
    telUri: 'tel:+66828950665',
    category: 'office',
    description: 'Acente merkezi acil operasyon ve şoför/kaptan destek hattı',
    badge: '🇹🇭 7/24 Türkçe',
  },
];

export const CAPTAIN_VHF_CHANNELS: RadioFrequency[] = [
  {
    channel: 'VHF CH 16',
    frequency: '156.800 MHz',
    usage: 'Uluslararası Tehlike, Güvenlik ve İlk Çağrı Kanalı (Mayday / Pan-Pan)',
  },
  {
    channel: 'VHF CH 74',
    frequency: '156.725 MHz',
    usage: 'Chalong Liman Başkanlığı ve İskele Yanaşma Koordinasyonu',
  },
  {
    channel: 'VHF CH 71',
    frequency: '156.575 MHz',
    usage: 'Rassada Liman İdaresi & Ada Tur Gemileri Haberleşmesi',
  },
  {
    channel: 'VHF CH 08',
    frequency: '156.400 MHz',
    usage: 'Tekneler Arası Operasyonel Koordinasyon Kanalı',
  },
];

export interface CachedOfflineSnapshot {
  date: string;
  cachedAt: number;
  pickups: PickupItem[];
  bookingsCount: number;
}

const STORAGE_KEY_PREFIX = 'phuket_offline_manifest_';
const STORAGE_KEY_LATEST = 'phuket_offline_manifest_latest';

/**
 * Günlük manifestoyu ve biniş listesini internet varken yerel hafızaya (localStorage) kaydeder.
 */
export function cacheDailyManifestForOffline(
  date: string,
  pickups: PickupItem[],
  bookings: Booking[] = []
): CachedOfflineSnapshot {
  const snapshot: CachedOfflineSnapshot = {
    date,
    cachedAt: Date.now(),
    pickups,
    bookingsCount: bookings.length,
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const serialized = JSON.stringify(snapshot);
      window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${date}`, serialized);
      window.localStorage.setItem(STORAGE_KEY_LATEST, serialized);
    } catch (e) {
      console.warn('[OfflineVault] LocalStorage önbellekleme uyarısı:', e);
    }
  }

  return snapshot;
}

/**
 * İnternet kesildiğinde veya Andaman Denizi açıklarında yerel hafızadaki manifestoyu çeker.
 */
export function getCachedOfflineManifest(date?: string): CachedOfflineSnapshot | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    if (date) {
      const item = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${date}`);
      if (item) return JSON.parse(item);
    }
    const latest = window.localStorage.getItem(STORAGE_KEY_LATEST);
    if (latest) return JSON.parse(latest);
  } catch (e) {
    console.warn('[OfflineVault] LocalStorage okuma uyarısı:', e);
  }

  return null;
}
