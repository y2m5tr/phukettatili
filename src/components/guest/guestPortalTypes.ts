export interface GuestBookingView {
  id: string;
  customerName: string;
  hotel: string;
  roomNumber?: string;
  tourTitle: string;
  tourDate: string;
  pickupTime?: string;
  adultCount: number;
  childCount: number;
  remainingAmountThb: number;
  nationalParkFeeIncluded: boolean;
  assignedVehicle?: string;
  passengerNames: string[];
}

export interface CheckinPassenger {
  fullName: string;
  passportNo: string;
  nationality: string;
  birthDate: string;
  gender: 'M' | 'F';
  dietaryPreference: 'standard' | 'vegetarian' | 'halal' | 'vegan' | 'seafood_allergy';
}

export interface MarineSafetyInfo {
  level: 'calm' | 'moderate' | 'severe';
  waveHeightMeters: number;
  windSpeedKnots: number;
  summary: string;
  warningNote: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}
