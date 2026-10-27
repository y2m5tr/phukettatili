/**
 * Tur müsaitlik durumu -> halka açık etiket eşlemesi.
 *
 * `/api/tour-availability` ve istemci göstergesi aynı etiketleri kullanır;
 * tek kaynaktan beslenir. `status` değerleri `calculateTourOccupancy`
 * (src/lib/allotment.ts) çıktısındaki enum ile birebir örtüşür.
 */
export const AVAILABILITY_STATUS_LABELS: Record<string, string> = {
  available: 'Yer var',
  filling: 'Hızla doluyor',
  critical: 'Son birkaç yer',
  full: 'Bu tarih doldu',
  overbooked: 'Bu tarih doldu',
};

export function availabilityStatusLabel(status: string): string {
  return AVAILABILITY_STATUS_LABELS[status] || status;
}
