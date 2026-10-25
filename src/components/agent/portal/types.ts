import type { Booking } from '../../../data/adminInitialData';
import type { SupportedCurrency } from '../../../lib/exchangeRates';

// AgentPortalApp alt bileşenlerinin paylaştığı tipler.

/** /api/b2b-booking yanıtı: onaylanan rezervasyon + bilet + komisyon bilgisi. */
export interface ConfirmedBookingPayload {
  booking: Booking;
  ticketUrl: string;
  commission: { amountThb: number; netToPayToAgencyThb: number };
}

export type PaymentPreference = 'agent_collected' | 'office_cash_on_pickup';

export type DisplayCurrency = SupportedCurrency | 'THB';
