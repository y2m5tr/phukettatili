import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  Phone,
  Ticket,
  Clock,
  Share2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { PartnerAgent, TourItem, Booking } from '../../data/adminInitialData';
import {
  HOTEL_ZONES,
  detectHotelZone,
  getRecommendedPickupTime,
  calculateAgentCommission,
  getPhuketSeason,
  DEFAULT_EXCHANGE_RATES,
} from '../../data/adminInitialData';
import {
  getLiveExchangeRates,
  convertThbToForeign,
  type SupportedCurrency,
} from '../../lib/exchangeRates';
import { formatDayMonthYear } from '../../lib/whatsappEngine';
import { fmtMoney } from '../../lib/moneyFormat';

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
  const [paymentPreference, setPaymentPreference] = useState<'agent_collected' | 'office_cash_on_pickup'>(
    'office_cash_on_pickup'
  );
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [customPickupTime, setCustomPickupTime] = useState<string>('');

  // UI / Status State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<{
    booking: Booking;
    ticketUrl: string;
    commission: { amountThb: number; netToPayToAgencyThb: number };
  } | null>(null);

  // Fiyat & Komisyon Hesaplamaları
  const pricePerAdult = selectedTour.priceThb > 0 ? selectedTour.priceThb : 2800;
  const pricePerChild = Math.round(pricePerAdult * 0.7);

  const totalPriceThb = adultCount * pricePerAdult + childCount * pricePerChild;
  const myCommissionThb = calculateAgentCommission(agent, totalPriceThb, adultCount, childCount);
  const netPayableThb = Math.max(0, totalPriceThb - myCommissionThb);

  const recommendedPickup = getRecommendedPickupTime(hotelZone);
  const season = getPhuketSeason(tourDate);

  // Çoklu Para Birimi (Canlı Döviz Desteği)
  const [displayCurrency, setDisplayCurrency] = useState<SupportedCurrency | 'THB'>('THB');
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
    const cleanPhone = booking.phone.replace(/[^0-9]/g, '');
    const text =
      `🌴 *PHUKET TATİLİ & ${agent.name.toUpperCase()} — TUR BİLETİNİZ HAZIR*\n` +
      `───────────────────────────────\n` +
      `Sayın *${booking.customerName}*,\n` +
      `Acentemiz aracılığıyla rezerve edilen tur detaylarınız onaylanmıştır:\n\n` +
      `🏝️ *Tur:* ${booking.tourTitle}\n` +
      `📅 *Tarih:* ${formatDayMonthYear(booking.tourDate)}\n` +
      `⏰ *Otelden Alınış Saati:* ${booking.pickupTime || '07:30'}\n` +
      `🏨 *Alınış Yeri:* ${booking.hotel} ${booking.roomNumber ? `(Oda: ${booking.roomNumber})` : ''}\n` +
      `👥 *Kişi Sayısı:* ${booking.adultCount} Yetişkin${booking.childCount > 0 ? ` + ${booking.childCount} Çocuk` : ''}\n` +
      `💰 *Toplam Tutar:* ${fmtMoney(booking.totalPriceThb)} THB\n` +
      `💵 *Kalan Ödeme:* ${booking.remainingAmountThb > 0 ? `${fmtMoney(booking.remainingAmountThb)} THB (Sabah lobide şoföre nakit)` : '✓ Ödendi'}\n` +
      `───────────────────────────────\n` +
      `🎫 *Canlı Bilet & Biniş Kartı Takip Linkiniz:*\n` +
      `${window.location.origin}/bilet/${booking.id}\n\n` +
      `Harika bir tur dileriz! 🇹🇭✨`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
              PHUKET<span className="text-amber-400">TATİLİ</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              B2B Partner Extranet
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex flex-col items-end">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                {agent.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Kod: <strong>{agent.code}</strong> · Komisyon:{' '}
                {agent.commissionType === 'percentage' ? `%${agent.commissionRate}` : `${agent.commissionRate} THB/Pax`}
              </span>
            </div>

            <a
              href={`https://wa.me/${supportPhone}?text=${encodeURIComponent(
                `Merhaba Phuket Tatili Operasyon, Acenta Kodumuz: ${agent.code} (${agent.name}). Bir konuda yardıma ihtiyacım var.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all text-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">7/24 Merkez Destek</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 flex-1">
        {/* Agent Profile Welcome Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 sm:p-7 border border-indigo-900/50 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  {agent.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {agent.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Doğrulanmış Acente
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {agent.companyTitle || 'Yetkili Turizm Acentesi & Otel Concierge Partneri'} · Bölge: {agent.cityOrZone || 'Phuket'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sözleşmeli Komisyonunuz</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {agent.commissionType === 'percentage' ? `%${agent.commissionRate}` : `${agent.commissionRate} THB`}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {agent.commissionType === 'percentage' ? 'Her rezervasyonda ciro üzerinden' : 'Yetişkin yolcu başına net'}
              </span>
            </div>
          </div>
        </div>

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
            {/* Onay Bildirimi Kartı (Başarılı Gönderim Sonrası) */}
            {confirmedBooking && (
              <div className="p-6 rounded-3xl bg-emerald-950/60 border border-emerald-500/40 text-white space-y-4 animate-in fade-in duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-emerald-300">
                        Rezervasyon Başarıyla Onaylandı!
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Rezervasyon No: <strong className="font-mono text-white">{confirmedBooking.booking.id}</strong> ·
                        Merkez operasyon sistemine iletildi.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmedBooking(null)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Kapat ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-black/40 border border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Misafir & Tur</span>
                    <strong className="text-white text-sm">{confirmedBooking.booking.customerName}</strong>
                    <p className="text-slate-400">{confirmedBooking.booking.tourTitle}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tarih & Alınış</span>
                    <strong className="text-white">{confirmedBooking.booking.tourDate}</strong>
                    <p className="text-slate-400">⏰ {confirmedBooking.booking.pickupTime} ({confirmedBooking.booking.hotel})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Acente Komisyonunuz</span>
                    <strong className="text-amber-400 text-sm font-mono">
                      +{fmtMoney(confirmedBooking.commission.amountThb)} THB
                    </strong>
                    <p className="text-slate-400">Cari hesabınıza alacak işlendi</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsAppVoucher(confirmedBooking.booking)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Misafire WhatsApp Biletini Gönder</span>
                  </button>

                  <a
                    href={`/bilet/${confirmedBooking.booking.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Canlı Biniş Kartını Aç</span>
                  </a>
                </div>
              </div>
            )}

            {/* Rezervasyon Giriş Formu */}
            <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sol Taraf: Tur ve Misafir Bilgileri */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Tur Seçimi */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">1</span>
                      Tur Programı Seçiniz
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Aktif {tours.length} Tur
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                    {tours.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTour(t)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedTour.id === t.id
                            ? 'bg-brand-primary/10 border-brand-accent shadow-sm'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-white line-clamp-1">{t.title}</h4>
                          {selectedTour.id === t.id && (
                            <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400">{t.duration || 'Tam Gün'}</span>
                          <span className="font-bold text-white font-mono">
                            {t.priceThb > 0 ? `${fmtMoney(t.priceThb)} THB` : '2,800 THB'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Tarih ve Kişi Sayısı */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">2</span>
                    Tarih & Yolcu Sayısı
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1 flex items-center justify-between">
                        <span>Tur Tarihi *</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border ${season.badgeColor}`}>
                          {season.season === 'peak' ? 'Peak' : season.season === 'low' ? 'Low' : 'High'}
                        </span>
                      </label>
                      <input
                        type="date"
                        required
                        value={tourDate}
                        onChange={(e) => setTourDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-brand-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Yetişkin ({fmtMoney(pricePerAdult)} THB) *
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setAdultCount((c) => Math.max(1, c - 1))}
                          className="w-10 h-10 rounded-l-xl bg-slate-800 hover:bg-slate-700 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={adultCount}
                          onChange={(e) => setAdultCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full h-10 text-center bg-slate-950 border-y border-slate-700 text-xs font-bold text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setAdultCount((c) => c + 1)}
                          className="w-10 h-10 rounded-r-xl bg-slate-800 hover:bg-slate-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Çocuk 4-11 Yaş ({fmtMoney(pricePerChild)} THB)
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setChildCount((c) => Math.max(0, c - 1))}
                          className="w-10 h-10 rounded-l-xl bg-slate-800 hover:bg-slate-700 font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={childCount}
                          onChange={(e) => setChildCount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full h-10 text-center bg-slate-950 border-y border-slate-700 text-xs font-bold text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setChildCount((c) => c + 1)}
                          className="w-10 h-10 rounded-r-xl bg-slate-800 hover:bg-slate-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Misafir & Otel Alınış Bilgileri */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">3</span>
                    Misafir İletişim & Otel Transfer Noktası
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Misafir Adı ve Soyadı *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Hakan Öztürk"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Telefon / WhatsApp Numarası *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Örn: +90 532 123 45 67"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Otel Bölgesi (Zone) *
                      </label>
                      <select
                        value={hotelZone}
                        onChange={(e) => setHotelZone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-brand-accent"
                      >
                        {HOTEL_ZONES.map((z) => (
                          <option key={z} value={z}>
                            📍 {z}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                          Otel Adı *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: Amari Phuket Resort"
                          value={hotel}
                          onChange={(e) => {
                            setHotel(e.target.value);
                            const detected = detectHotelZone(e.target.value);
                            if (detected && detected !== 'Diğer') setHotelZone(detected);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
                        />
                      </div>

                      <div className="w-24">
                        <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                          Oda No
                        </label>
                        <input
                          type="text"
                          placeholder="304"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Otelden Alınış Saati (Manuel Giriş & Hızlı Butonlar) */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>⏰ Otelden Alış Saati</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setCustomPickupTime(recommendedPickup)}
                        className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                        title="Bölge için standart önerilen saati uygula"
                      >
                        ⚡ Önerilen: {recommendedPickup}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder={`Örn: ${recommendedPickup} - 08:00`}
                      value={customPickupTime !== '' ? customPickupTime : `${recommendedPickup} - 08:00`}
                      onChange={(e) => setCustomPickupTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-brand-accent"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-500">Hızlı Aralık:</span>
                      {['07:15 - 07:30', '07:30 - 07:45', '07:45 - 08:00', '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:15'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setCustomPickupTime(time)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            (customPickupTime !== '' ? customPickupTime : `${recommendedPickup} - 08:00`) === time
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Özel Notlar (İsteğe bağlı)
                    </label>
                    <input
                      type="text"
                      placeholder="Vejetaryen yemek tercihi, balayı çifti vb."
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Sağ Taraf: Canlı Fiyatlandırma & Komisyon Paneli */}
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 sticky top-20 space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Finansal Özet & Cari Hakediş
                      </span>
                      {/* Currency Selector */}
                      <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                        {(['THB', 'TRY', 'USD', 'EUR'] as const).map((curr) => (
                          <button
                            key={curr}
                            type="button"
                            onClick={() => setDisplayCurrency(curr)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                              displayCurrency === curr
                                ? 'bg-amber-500 text-slate-950 shadow-xs'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white font-serif">
                      Fiyat & Komisyon Dağılımı
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs border-y border-slate-800 py-4">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Yetişkin ({adultCount} x {fmtMoney(pricePerAdult)} THB)</span>
                      <span className="text-white font-mono font-semibold">{fmtMoney((adultCount * pricePerAdult))} THB</span>
                    </div>

                    {childCount > 0 && (
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Çocuk ({childCount} x {fmtMoney(pricePerChild)} THB)</span>
                        <span className="text-white font-mono font-semibold">{fmtMoney((childCount * pricePerChild))} THB</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-slate-300 font-bold pt-2 border-t border-slate-800/60">
                      <span>Toplam Satış Bedeli</span>
                      <div className="text-right">
                        <span className="text-white font-mono text-sm block">{fmtMoney(totalPriceThb)} THB</span>
                        {displayCurrency !== 'THB' && (
                          <span className="text-[11px] text-amber-400 font-mono font-semibold">
                            ≈ {fmtMoney(convertThbToForeign(totalPriceThb, displayCurrency, exchangeRates))} {displayCurrency}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acenta Komisyonu Vurgusu */}
                    <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-between">
                      <div>
                        <span className="font-bold block text-xs">Acenta Komisyonunuz:</span>
                        <span className="text-[10px] text-amber-400/80">
                          {agent.commissionType === 'percentage' ? `%${agent.commissionRate} oranında` : 'Kişi başı sabit'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black font-mono block">
                          +{fmtMoney(myCommissionThb)} THB
                        </span>
                        {displayCurrency !== 'THB' && (
                          <span className="text-[10px] text-amber-400/90 font-mono font-semibold">
                            ≈ {fmtMoney(convertThbToForeign(myCommissionThb, displayCurrency, exchangeRates))} {displayCurrency}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-slate-400 pt-1">
                      <span>Phuket Tatili Net Hakediş:</span>
                      <div className="text-right">
                        <span className="text-slate-200 font-mono font-semibold block">{fmtMoney(netPayableThb)} THB</span>
                        {displayCurrency !== 'THB' && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            ≈ {fmtMoney(convertThbToForeign(netPayableThb, displayCurrency, exchangeRates))} {displayCurrency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ödeme / Tahsilat Tercihi */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-slate-400 block">
                      Tahsilat Yöntemi Tercihi *
                    </label>

                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
                      paymentPreference === 'office_cash_on_pickup'
                        ? 'bg-brand-primary/10 border-brand-accent text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="office_cash_on_pickup"
                        checked={paymentPreference === 'office_cash_on_pickup'}
                        onChange={() => setPaymentPreference('office_cash_on_pickup')}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="font-bold block">Rehber Otelde Nakit Alsın</span>
                        <span className="text-[11px] text-slate-400">Şoför lobide {fmtMoney(totalPriceThb)} THB nakit toplar; komisyonunuz cari hesabınıza yazılır.</span>
                      </div>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer text-xs transition-all ${
                      paymentPreference === 'agent_collected'
                        ? 'bg-brand-primary/10 border-brand-accent text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="agent_collected"
                        checked={paymentPreference === 'agent_collected'}
                        onChange={() => setPaymentPreference('agent_collected')}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="font-bold block">Tahsilatı Ben Yaptım (Ödendi)</span>
                        <span className="text-[11px] text-slate-400">Misafirden tahsilatı siz aldınız; Phuket Tatili'ne net {fmtMoney(netPayableThb)} THB havale edeceksiniz.</span>
                      </div>
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/40 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-xl shadow-brand-primary/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Rezervasyon Kaydediliyor...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                        <span>Rezervasyonu Onayla ve Bilet Kes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: ACENTA REZERVASYONLARI VE HAKEDİŞLERİ */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Toplam Gönderilen Misafir
                </span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">
                  {totalGuestsSent} <span className="text-xs font-normal text-slate-400">Yolcu</span>
                </span>
                <span className="text-xs text-slate-500 mt-1 block">{agentBookings.length} Rezervasyon Kaydı</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Toplam Satış Hacmi
                </span>
                <span className="text-2xl font-black text-sky-400 font-mono mt-1 block">
                  {fmtMoney(totalAgentRevenue)} <span className="text-xs font-normal text-slate-400">THB</span>
                </span>
                <span className="text-xs text-slate-500 mt-1 block">Acenteniz üzerinden üretilen ciro</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  Toplam Acenta Komisyonunuz
                </span>
                <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                  {fmtMoney(totalAgentCommission)} <span className="text-xs font-normal text-slate-400">THB</span>
                </span>
                <span className="text-xs text-slate-500 mt-1 block">Mutabakat dönemi sonunda ödenir</span>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">Rezervasyon Kayıtları</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Misafirlerin anlık transfer ve biniş durumlarını canlı takip edin.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Kod & Misafir</th>
                      <th className="py-3.5 px-4">Tur & Tarih</th>
                      <th className="py-3.5 px-4">Otel & Alınış</th>
                      <th className="py-3.5 px-4">Tutar & Komisyon</th>
                      <th className="py-3.5 px-4">Saha / Biniş</th>
                      <th className="py-3.5 px-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {agentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Henüz acenteniz üzerinden oluşturulmuş rezervasyon bulunmuyor.
                        </td>
                      </tr>
                    ) : (
                      agentBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{b.customerName}</span>
                            <span className="font-mono text-[10px] text-amber-400 block">{b.id}</span>
                            <span className="text-[11px] text-slate-400">{b.phone}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-200 block truncate max-w-xs">{b.tourTitle}</span>
                            <span className="text-[11px] text-slate-400">
                              📅 {b.tourDate} · {b.adultCount} Yetişkin{b.childCount > 0 ? ` + ${b.childCount} Ç.` : ''}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-200 font-medium block">📍 {b.hotel}</span>
                            <span className="text-[11px] text-slate-400">
                              ⏰ {b.pickupTime || '07:30'} {b.roomNumber ? `(Oda: ${b.roomNumber})` : ''}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block font-mono">
                              {fmtMoney(b.totalPriceThb)} THB
                            </span>
                            <span className="text-[11px] font-bold text-amber-400 font-mono block">
                              Komisyon: +{fmtMoney((b.agentCommissionThb || 0))} THB
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                                b.pickupStatus === 'picked_up'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : b.pickupStatus === 'on_tour'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : b.pickupStatus === 'completed'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : b.pickupStatus === 'no_show'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {b.pickupStatus === 'picked_up'
                                ? '🚐 Araca Bindi'
                                : b.pickupStatus === 'on_tour'
                                ? '⛵ Turda'
                                : b.pickupStatus === 'completed'
                                ? '✅ Tamamlandı'
                                : b.pickupStatus === 'no_show'
                                ? '❌ Gelmedi'
                                : '⏳ Alınmayı Bekliyor'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`/bilet/${b.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white transition-colors"
                                title="Biniş Kartını Gör"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleShareWhatsAppVoucher(b)}
                                className="p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                                title="WhatsApp ile Paylaş"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
