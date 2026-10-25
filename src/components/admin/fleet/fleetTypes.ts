import { Bus, Crown, Ship, Car } from 'lucide-react';
import type { VehicleKind, DriverItem } from '../../../data/adminInitialData';

export const KIND_META: Record<VehicleKind, { label: string; icon: typeof Car; accent: string }> = {
  minibus: { label: 'Minibüs', icon: Bus, accent: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50' },
  vip: { label: 'VIP', icon: Crown, accent: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50' },
  speedboat: { label: 'Sürat Teknesi', icon: Ship, accent: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50' },
  other: { label: 'Diğer', icon: Car, accent: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
};

export const ROLE_LABEL: Record<DriverItem['role'], string> = {
  driver: 'Şoför',
  guide: 'Rehber',
  both: 'Şoför + Rehber',
};

export function newFleetId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
