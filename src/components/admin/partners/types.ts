import type { Booking } from '../../../data/adminInitialData';

// PartnersTab alt bileşenlerinin paylaştığı tipler.

/** Acenta bazlı rezervasyon & komisyon istatistikleri (agentStats girdisi). */
export interface AgentStats {
  bookingCount: number;
  paxCount: number;
  totalRevenueThb: number;
  earnedCommissionThb: number;
  bookingList: Booking[];
}

export const EMPTY_AGENT_STATS: AgentStats = {
  bookingCount: 0,
  paxCount: 0,
  totalRevenueThb: 0,
  earnedCommissionThb: 0,
  bookingList: [],
};
