import React, { useState, useEffect } from 'react';
import { Sparkles, Ticket } from 'lucide-react';
import type { PartnerAgent, TourItem, Booking } from '../../data/adminInitialData';
import {
  getRecommendedPickupTime,
  calculateAgentCommission,
  getPhuketSeason,
  DEFAULT_EXCHANGE_RATES,
} from '../../data/adminInitialData';
import {
  getLiveExchangeRates,
  type SupportedCurrency,
} from '../../lib/exchangeRates';
import PortalHeader from './portal/PortalHeader';
import AgentWelcomeBanner from './portal/AgentWelcomeBanner';
import BookingConfirmedCard from './portal/BookingConfirmedCard';
import BookingFormFields from './portal/BookingFormFields';
import PriceCommissionPanel from './portal/PriceCommissionPanel';
import AgentBookingsTab from './portal/AgentBookingsTab';
import { shareWhatsAppVoucher } from './portal/shareVoucher';
import type { ConfirmedBookingPayload, DisplayCurrency, PaymentPreference } from './portal/types';

// 500 satır kuralı: görünümler ./portal/ klasörüne taşındı. Bu kabuk yalnızca
// durum yönetimini (form alanları, döviz, rezervasyon listesi), fiyat/komisyon
// hesaplamalarını ve /api/b2b-booking gönderimini tutar — davranış birebir aynı.
interface AgentPortalAppProps {
  agent: PartnerAgent;
  tours: TourItem[];
  existingBookings?: Booking[];
  supportPhone?: string;
}

export default function AgentPortalApp({
  agent,
  tours,
  existingBookings = [],
  supportPhone = '66828950665',
}: AgentPortalAppProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'bookings'>('create');

  // Form State
  const defaultTour = tours[0] || {
    id: 'phi-phi',
    title: 'Phi Phi & Maya Bay Sürat Teknesi',
    priceThb: 3200,
    duration: 'Tam Gün (07:30 - 17:00)',
    image: '/assets/phuket_hero.webp',
  };

  const [selectedTour, setSelectedTour] = useState<TourItem>(defaultTour);
  const [tourDate, setTourDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [adultCount, setAdultCount] = useState<number>(2);
  const [childCount, setChildCount] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [hotelZone, setHotelZone] = useState<string>('Patong');
  const [hotel, setHotel] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [paymentPreference, setPaymentPreference] = useState<PaymentPreference>(
    'office_cash_on_pickup'
  );
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [customPickupTime, setCustomPickupTime] = useState<string>('');

  // UI / Status State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBookingPayload | null>(null);

  // Fiyat & Komisyon Hesaplamaları
  const pricePerAdult = selectedTour.priceThb > 0 ? selectedTour.priceThb : 2800;
  const pricePerChild = Math.round(pricePerAdult * 0.7);

  const totalPriceThb = adultCount * pricePerAdult + childCount * pricePerChild;
  const myCommissionThb = calculateAgentCommission(agent, totalPriceThb, adultCount, childCount);
  const netPayableThb = Math.max(0, totalPriceThb - myCommissionThb);

  const recommendedPickup = getRecommendedPickupTime(hotelZone);
  const season = getPhuketSeason(tourDate);

  // Çoklu Para Birimi (Canlı Döviz Desteği)
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('THB');
  const [exchangeRates, setExchangeRates] = useState<Record<SupportedCurrency, number>>(DEFAULT_EXCHANGE_RATES);

  useEffect(() => {
    let isMounted = true;
    getLiveExchangeRates().then((data) => {
      if (isMounted && data.rates) {
        setExchangeRates(data.rates);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Acentanın Kendi Rezervasyonları Listesi
  const [agentBookings, setAgentBookings] = useState<Booking[]>(() => {
    return existingBookings.filter(
      (b) => b.agentId === agent.id || (b.specialNotes || '').includes(agent.code)
    );
  });

  const totalAgentRevenue = agentBookings.reduce((sum, b) => sum + (b.totalPriceThb || 0), 0);
  const totalAgentCommission = agentBookings.reduce((sum, b) => sum + (b.agentCommissionThb || 0), 0);
  const totalGuestsSent = agentBookings.reduce(
    (sum, b) => sum + (b.adultCount || 1) + (b.childCount || 0),
    0
  );

  const handleSubmitBooking = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Lütfen misafirin ad ve soyadını giriniz.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Lütfen misafirin telefon numarasını giriniz.');
      return;
    }
    if (!hotel.trim()) {
      setErrorMsg('Lütfen otel adını giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/b2b-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentCode: agent.code,
          customerName: customerName.trim(),
          phone: customerPhone.trim(),
          hotel: hotel.trim(),
          hotelZone,
          roomNumber: roomNumber.trim() || undefined,
          tourId: selectedTour.id,
          tourTitle: selectedTour.title,
          tourDate,
          pickupTime: customPickupTime.trim() || recommendedPickup,
          adultCount,
          childCount,
          pricePerAdultThb: pricePerAdult,
          pricePerChildThb: pricePerChild,
          paymentPreference,
          specialNotes: specialNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Rezervasyon oluşturulamadı. Lütfen bilgileri kontrol ediniz.');
      }

      setConfirmedBooking(data);
      setAgentBookings((prev) => [data.booking, ...prev]);

      // Formu temizle
      setCustomerName('');
      setCustomerPhone('');
      setHotel('');
      setRoomNumber('');
      setSpecialNotes('');
      setCustomPickupTime('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsAppVoucher = (booking: Booking) => {
    shareWhatsAppVoucher(booking, agent.name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      <PortalHeader agent={agent} supportPhone={supportPhone} />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        <AgentWelcomeBanner agent={agent} />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Hızlı Tur Rezervasyonu Yap</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4 text-sky-400" />
            <span>Acenta Rezervasyonlarım ({agentBookings.length})</span>
          </button>
        </div>

        {/* TAB 1: YENİ REZERVASYON FORMU */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {confirmedBooking && (
              <BookingConfirmedCard
                confirmedBooking={confirmedBooking}
                onClose={() => setConfirmedBooking(null)}
                onShareWhatsApp={() => handleShareWhatsAppVoucher(confirmedBooking.booking)}
              />
            )}

            {/* Rezervasyon Giriş Formu */}
            <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <BookingFormFields
                tours={tours}
                selectedTour={selectedTour}
                setSelectedTour={setSelectedTour}
                tourDate={tourDate}
                setTourDate={setTourDate}
                adultCount={adultCount}
                setAdultCount={setAdultCount}
                childCount={childCount}
                setChildCount={setChildCount}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                hotelZone={hotelZone}
                setHotelZone={setHotelZone}
                hotel={hotel}
                setHotel={setHotel}
                roomNumber={roomNumber}
                setRoomNumber={setRoomNumber}
                specialNotes={specialNotes}
                setSpecialNotes={setSpecialNotes}
                customPickupTime={customPickupTime}
                setCustomPickupTime={setCustomPickupTime}
                recommendedPickup={recommendedPickup}
                season={season}
                pricePerAdult={pricePerAdult}
                pricePerChild={pricePerChild}
              />

              <PriceCommissionPanel
                agent={agent}
                adultCount={adultCount}
                childCount={childCount}
                pricePerAdult={pricePerAdult}
                pricePerChild={pricePerChild}
                totalPriceThb={totalPriceThb}
                myCommissionThb={myCommissionThb}
                netPayableThb={netPayableThb}
                displayCurrency={displayCurrency}
                setDisplayCurrency={setDisplayCurrency}
                exchangeRates={exchangeRates}
                paymentPreference={paymentPreference}
                setPaymentPreference={setPaymentPreference}
                errorMsg={errorMsg}
                isSubmitting={isSubmitting}
              />
            </form>
          </div>
        )}

        {/* TAB 2: ACENTA REZERVASYONLARI VE HAKEDİŞLERİ */}
        {activeTab === 'bookings' && (
          <AgentBookingsTab
            agentBookings={agentBookings}
            totalGuestsSent={totalGuestsSent}
            totalAgentRevenue={totalAgentRevenue}
            totalAgentCommission={totalAgentCommission}
            onShareWhatsApp={handleShareWhatsAppVoucher}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Phuket Tatili / Siam Horizon Co., Ltd. · TAT License: 34/02847</p>
        <p className="text-[11px] text-slate-600 mt-0.5">B2B Sub-Agent & Hotel Concierge Automation Portal</p>
      </footer>
    </div>
  );
}
