import type { CuratedProposalHotelStay } from '../../../lib/curatedProposal';
import { detectHotelZone } from '../../../data/adminInitialData';

export function getProposalHotels(
  hotels: CuratedProposalHotelStay[] | undefined,
  hotelName: string | undefined,
  hotelZone: string | undefined,
  createdAtDate: string,
  validUntilDate: string
): CuratedProposalHotelStay[] {
  if (hotels && hotels.length > 0) return hotels;
  return [
    {
      id: 'hotel-1',
      hotelName: hotelName || '',
      hotelZone: hotelZone || 'Patong & Kalim',
      checkInDate: createdAtDate,
      checkOutDate: validUntilDate,
    },
  ];
}

export function addProposalHotelToList(
  hotels: CuratedProposalHotelStay[]
): CuratedProposalHotelStay[] {
  return [
    ...hotels,
    {
      id: `hotel-${Date.now()}`,
      hotelName: '',
      hotelZone: 'Patong & Kalim',
      checkInDate: '',
      checkOutDate: '',
      notes: '',
    },
  ];
}

export function updateProposalHotelInList(
  hotels: CuratedProposalHotelStay[],
  hotelId: string,
  patch: Partial<CuratedProposalHotelStay>
): CuratedProposalHotelStay[] {
  return hotels.map((h) => {
    if (h.id === hotelId) {
      const updated = { ...h, ...patch };
      if (patch.hotelName && !patch.hotelZone) {
        const detected = detectHotelZone(patch.hotelName);
        if (detected) updated.hotelZone = detected;
      }
      return updated;
    }
    return h;
  });
}

export function removeProposalHotelFromList(
  hotels: CuratedProposalHotelStay[],
  hotelId: string
): CuratedProposalHotelStay[] {
  return hotels.filter((h) => h.id !== hotelId);
}
