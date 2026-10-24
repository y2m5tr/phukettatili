import type {
  CuratedProposalDay,
  CatalogTourPreset,
} from '../../../lib/curatedProposal';

export function addTourFromCatalogToDays(
  days: CuratedProposalDay[],
  preset: CatalogTourPreset,
  adultCount: number,
  childCount: number
): { nextDays: CuratedProposalDay[]; newDayId: string } {
  const newDayNumber = days.length + 1;
  const newDayId = `DAY-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
  const newDay: CuratedProposalDay = {
    id: newDayId,
    dayNumber: newDayNumber,
    dayTitle: preset.defaultDayTitle,
    tourTitle: preset.tourTitle,
    pickupWindow: preset.pickupWindow,
    tourDuration: preset.tourDuration,
    category: preset.category,
    transportType: preset.transportType,
    mealPlan: preset.mealPlan,
    nationalParkFeeStatus: preset.nationalParkFeeStatus,
    guideLanguage: 'turkish',
    highlight: preset.highlight,
    included: [...preset.included],
    image: preset.image,
    priceThb: preset.priceThb * adultCount + Math.round(preset.priceThb * 0.7 * childCount),
  };

  return {
    nextDays: [...days, newDay],
    newDayId,
  };
}

export function updateDayInList(
  days: CuratedProposalDay[],
  dayId: string,
  updates: Partial<CuratedProposalDay>
): CuratedProposalDay[] {
  return days.map((d) => (d.id === dayId ? { ...d, ...updates } : d));
}

export function deleteDayFromList(
  days: CuratedProposalDay[],
  dayId: string
): CuratedProposalDay[] {
  const filtered = days.filter((d) => d.id !== dayId);
  return filtered.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
}

export function moveDayInList(
  days: CuratedProposalDay[],
  index: number,
  direction: 'up' | 'down'
): CuratedProposalDay[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= days.length) return days;
  const nextDays = [...days];
  const [moved] = nextDays.splice(index, 1);
  nextDays.splice(targetIndex, 0, moved);
  return nextDays.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
}
