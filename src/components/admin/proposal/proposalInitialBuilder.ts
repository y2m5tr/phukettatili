import {
  buildCuratedProposal,
  buildSingleTourProposal,
  PROPOSAL_CATALOG_TOURS,
  type CuratedProposalData,
  type ProposalType,
} from '../../../lib/curatedProposal';

export interface InitialProposalArgs {
  initialCustomerName?: string;
  initialHotel?: string;
  initialZone?: string;
  initialPhone?: string;
  initialProposalType?: ProposalType;
  initialTourTitle?: string;
  initialTourDate?: string;
  initialAdultCount?: number;
  initialChildCount?: number;
}

export function createInitialProposal({
  initialCustomerName = 'Begüm & Canberk Özkan',
  initialHotel = 'The Shore at Katathani',
  initialZone = 'Kata & Karon',
  initialPhone,
  initialProposalType,
  initialTourTitle,
  initialTourDate,
  initialAdultCount = 2,
  initialChildCount = 0,
}: InitialProposalArgs): CuratedProposalData {
  if (initialProposalType === 'single_tour') {
    const matchedPreset = initialTourTitle
      ? PROPOSAL_CATALOG_TOURS.find(
          (p) =>
            p.tourTitle.toLowerCase().includes(initialTourTitle.toLowerCase()) ||
            initialTourTitle.toLowerCase().includes(p.tourTitle.toLowerCase())
        )?.id || 'phi_phi_speed'
      : 'phi_phi_speed';

    const base = buildSingleTourProposal(
      initialCustomerName,
      matchedPreset,
      initialTourDate || '',
      initialHotel,
      initialZone,
      initialAdultCount,
      initialChildCount
    );
    if (initialTourTitle && base.days[0]) {
      base.days[0].tourTitle = initialTourTitle;
    }
    if (initialPhone) {
      base.customerPhone = initialPhone;
    }
    return base;
  }

  const base = buildCuratedProposal(
    initialCustomerName,
    'honeymoon',
    5,
    initialHotel,
    initialZone,
    initialAdultCount,
    initialChildCount
  );
  if (initialPhone) {
    base.customerPhone = initialPhone;
  }
  return base;
}
