import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import TransferOperationsBar from '../src/components/admin/transfers/TransferOperationsBar';
import TransferMarineSafetyCard from '../src/components/admin/transfers/TransferMarineSafetyCard';
import TransferFilterBar from '../src/components/admin/transfers/TransferFilterBar';
import TransferTableView from '../src/components/admin/transfers/TransferTableView';
import TransferRoutesView, { type RouteData } from '../src/components/admin/transfers/TransferRoutesView';
import { initialBookings, initialVehicles, initialDrivers } from '../src/data/adminInitialData';
import { buildDailyPickups } from '../src/lib/adminFilters';

describe('Transfers Modular Subcomponents Verification', () => {
  it('renders TransferOperationsBar with action groups', () => {
    const html = renderToString(
      React.createElement(TransferOperationsBar, {
        onOpenPoliceManifest: () => {},
        onOpenQrScanner: () => {},
        onOpenLostFound: () => {},
        onOpenDietaryManifest: () => {},
        onOpenFieldCashier: () => {},
        onOpenFlightRadar: () => {},
        onOpenDriverExpense: () => {},
        onOpenGuideExpense: () => {},
        onOpenWelcomeBoard: () => {},
        onOpenLuggageExpress: () => {},
        onOpenCaptainVault: () => {},
        onOpenCuratedProposal: () => {},
        setIsBulkDispatchOpen: () => {},
      })
    );
    expect(html).toContain('Sevk &amp; Check-in');
    expect(html).toContain('Kasa &amp; Masraflar');
    expect(html).toContain('Emniyet &amp; Manifestolar');
    expect(html).toContain('Lojistik &amp; Teklif');
  });

  it('renders TransferMarineSafetyCard with calm marine report', () => {
    const rawHtml = renderToString(
      React.createElement(TransferMarineSafetyCard, {
        marineReport: {
          level: 'calm',
          waveHeightMeters: 0.6,
          windSpeedKnots: 8,
          windDirectionText: 'KB',
          summary: 'Deniz sakin, turlar için ideal.',
          color: 'emerald',
          isWaveAlert: false,
          source: 'TMD',
          updatedAt: '2026-10-24T12:00:00Z',
        },
        manifestDate: '2026-11-15',
        dailyPickups: [],
        safeDate: '2026-11-15',
        onRefreshMarine: async () => {},
        isRefreshingMarine: false,
      })
    );
    const html = rawHtml.replace(/<!--.*?-->/g, '');
    expect(html).toContain('Andaman Denizi Canlı Güvenlik Radarı');
    expect(html).toContain('Sakin Deniz');
    expect(html).toContain('0.6m');
  });

  it('renders TransferFilterBar with controls and counts', () => {
    const rawHtml = renderToString(
      React.createElement(TransferFilterBar, {
        vehicleFilter: 'all',
        setVehicleFilter: () => {},
        statusFilter: 'all',
        setStatusFilter: () => {},
        lobbyOnlyFilter: false,
        setLobbyOnlyFilter: () => {},
        soundEnabled: true,
        onToggleSound: () => {},
        routeVehicles: ['Minivan 1', 'Minivan 2'],
        pendingCount: 5,
        pickedUpCount: 3,
        lobbyReadyCount: 2,
        filteredPickupsCount: 8,
        viewMode: 'table',
        setViewMode: () => {},
      })
    );
    const html = rawHtml.replace(/<!--.*?-->/g, '');
    expect(html).toContain('Filtrele:');
    expect(html).toContain('Tüm Hatlar (2)');
    expect(html).toContain('Tablo (8)');
    expect(html).toContain('Hat / Şoför Rotaları (2)');
  });

  it('renders TransferTableView with pickups', () => {
    const pickups = buildDailyPickups(initialBookings, '2026-11-15');
    const html = renderToString(
      React.createElement(TransferTableView, {
        filteredPickups: pickups,
        bookings: initialBookings,
        safeVehicles: initialVehicles,
        safeDrivers: initialDrivers,
        showToast: () => {},
        isPickupLobbyReady: () => false,
        handleAssignVehicleToBooking: () => {},
        handleAssignDriverToBooking: () => {},
        setWhatsAppModalBooking: () => {},
        setVoucherBooking: () => {},
      })
    );
    expect(html).toContain('Alınış Saati');
    expect(html).toContain('Otel &amp; Oda');
    expect(html).toContain('Hat &amp; Minibüs');
  });

  it('renders TransferRoutesView with route data', () => {
    const pickups = buildDailyPickups(initialBookings, '2026-11-15');
    const route: RouteData = {
      vehicle: 'Minivan 1',
      stops: pickups,
      uniqueHotels: ['Hilton', 'Marriott'],
      pier: 'Chalong Pier',
      mapsUrl: 'https://maps.google.com',
      wazeUrl: 'https://waze.com',
      totalGuests: 4,
      sortMode: 'pier_bound',
    };

    const html = renderToString(
      React.createElement(TransferRoutesView, {
        vehicleRoutes: [route],
        bookings: initialBookings,
        showToast: () => {},
        setRouteSortModes: () => {},
        setCustomStopOrder: () => {},
        handleMoveStop: () => {},
        handleSendWhatsAppRouteToDriver: () => {},
        handleCopyRouteForDriver: () => {},
      })
    );
    expect(html).toContain('Minivan 1');
    expect(html).toContain('Chalong Pier');
    expect(html).toContain('Durak Sıralaması');
  });
});
