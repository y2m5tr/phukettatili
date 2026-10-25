import { useState, useMemo } from 'react';
import type { Booking } from '../../data/adminInitialData';
import SettlementFilterBar, { type SettlementDateFilter } from './settlement/SettlementFilterBar';
import SettlementKpiCards from './settlement/SettlementKpiCards';
import SupplierGroupsGrid from './settlement/SupplierGroupsGrid';
import SettlementItemsTable from './settlement/SettlementItemsTable';
import SettlementStatementModal from './settlement/SettlementStatementModal';
import type { SettlementItem, SettlementTotals, SupplierGroup } from './settlement/types';

// 500 satır kuralı: filtre çubuğu, KPI kartları, tedarikçi grup kartları,
// kalem tablosu ve mutabakat fişi modalı ./settlement/ klasörüne taşındı.
// Bu kabuk state, hakediş hesapları ve filtreleme mantığını tutar —
// davranış birebir aynı.
interface Props {
  bookings: Booking[];
  onUpdateBooking?: (booking: Booking) => void;
  managerPhone?: string;
}

export default function SupplierSettlementManager({
  bookings,
  onUpdateBooking,
  managerPhone = '66828950665',
}: Props) {
  // Filtre durumları
  const [dateFilter, setDateFilter] = useState<SettlementDateFilter>('this_month');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1); // Ayın 1'i
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0); // Ayın son günü
    return d.toISOString().split('T')[0];
  });
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed_only'>('confirmed_only');

  // Mutabakat Modalı State
  const [statementSupplier, setStatementSupplier] = useState<string | null>(null);

  // 1. Tüm rezervasyon ve turları düzleştirerek hakediş kalemlerine dönüştür
  const allSettlementItems: SettlementItem[] = useMemo(() => {
    const list: SettlementItem[] = [];

    bookings.forEach((b) => {
      // İptal edilenleri hesaba katma
      if (b.status === 'cancelled') return;
      if (statusFilter === 'confirmed_only' && b.status !== 'confirmed') return;

      const totalPax = (b.adultCount || 1) + (b.childCount || 0);

      if (b.tours && b.tours.length > 0) {
        b.tours.forEach((t, tIdx) => {
          const supplier = (t.supplier || b.supplier || 'Tedarikçi Belirtilmedi').trim();
          const itemRev = t.priceThb ? t.priceThb * (b.adultCount || 1) + (t.priceThb * 0.7) * (b.childCount || 0) : b.totalPriceThb / b.tours!.length;
          const itemCost = t.costThb !== undefined && t.costThb !== null ? t.costThb * (b.adultCount || 1) : (b.costThb ? b.costThb / b.tours!.length : 0);
          const profit = itemRev - itemCost;
          const margin = itemRev > 0 ? Math.round((profit / itemRev) * 100) : 0;

          list.push({
            bookingId: b.id,
            tourIndex: tIdx,
            customerName: b.customerName,
            phone: b.phone,
            tourTitle: t.tourTitle || b.tourTitle,
            tourDate: t.tourDate || b.tourDate,
            pickupTime: t.pickupTime || b.pickupTime || '07:30',
            supplier,
            adultCount: b.adultCount,
            childCount: b.childCount,
            totalPax,
            revenueThb: Math.round(itemRev),
            costThb: Math.round(itemCost),
            profitThb: Math.round(profit),
            marginPercent: margin,
            isCustomCost: t.costThb !== undefined && t.costThb > 0,
            fullBooking: b,
          });
        });
      } else {
        const supplier = (b.supplier || 'Tedarikçi Belirtilmedi').trim();
        const itemRev = b.totalPriceThb || 0;
        const itemCost = b.costThb || 0;
        const profit = itemRev - itemCost;
        const margin = itemRev > 0 ? Math.round((profit / itemRev) * 100) : 0;

        list.push({
          bookingId: b.id,
          tourIndex: -1,
          customerName: b.customerName,
          phone: b.phone,
          tourTitle: b.tourTitle,
          tourDate: b.tourDate,
          pickupTime: b.pickupTime || '07:30',
          supplier,
          adultCount: b.adultCount,
          childCount: b.childCount,
          totalPax,
          revenueThb: itemRev,
          costThb: itemCost,
          profitThb: profit,
          marginPercent: margin,
          isCustomCost: !!b.costThb,
          fullBooking: b,
        });
      }
    });

    return list;
  }, [bookings, statusFilter]);

  // 2. Filtreleri Uygula
  const filteredItems = useMemo(() => {
    return allSettlementItems.filter((item) => {
      // Tedarikçi Filtresi
      if (selectedSupplier !== 'all' && item.supplier !== selectedSupplier) {
        return false;
      }

      // Arama Filtresi
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const match =
          item.customerName.toLowerCase().includes(q) ||
          item.bookingId.toLowerCase().includes(q) ||
          item.tourTitle.toLowerCase().includes(q) ||
          item.supplier.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Tarih Filtresi
      const itemDate = item.tourDate;
      const today = new Date().toISOString().split('T')[0];

      if (dateFilter === 'today') {
        return itemDate === today;
      }
      if (dateFilter === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return itemDate === d.toISOString().split('T')[0];
      }
      if (dateFilter === 'this_week') {
        const now = new Date();
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1)).toISOString().split('T')[0];
        const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7)).toISOString().split('T')[0];
        return itemDate >= firstDay && itemDate <= lastDay;
      }
      if (dateFilter === 'this_month') {
        const now = new Date();
        const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        return itemDate.startsWith(ym);
      }
      if (dateFilter === 'custom') {
        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
        return true;
      }

      return true;
    });
  }, [allSettlementItems, selectedSupplier, searchQuery, dateFilter, startDate, endDate]);

  // 3. Mevcut Tedarikçilerin Listesi
  const availableSuppliers = useMemo(() => {
    const set = new Set<string>();
    allSettlementItems.forEach((i) => {
      if (i.supplier && i.supplier !== 'Tedarikçi Belirtilmedi') {
        set.add(i.supplier);
      }
    });
    return Array.from(set).sort();
  }, [allSettlementItems]);

  // 4. Finansal Metrikler (KPIs)
  const totals: SettlementTotals = useMemo(() => {
    const totalRev = filteredItems.reduce((acc, i) => acc + i.revenueThb, 0);
    const totalCost = filteredItems.reduce((acc, i) => acc + i.costThb, 0);
    const totalNetProfit = totalRev - totalCost;
    const marginPct = totalRev > 0 ? Math.round((totalNetProfit / totalRev) * 100) : 0;
    const totalPax = filteredItems.reduce((acc, i) => acc + i.totalPax, 0);
    const avgProfitPerPax = totalPax > 0 ? Math.round(totalNetProfit / totalPax) : 0;

    return {
      totalRev,
      totalCost,
      totalNetProfit,
      marginPct,
      totalPax,
      avgProfitPerPax,
      itemCount: filteredItems.length,
    };
  }, [filteredItems]);

  // 5. Tedarikçi Bazında Gruplama
  const supplierGroups: SupplierGroup[] = useMemo(() => {
    const map = new Map<string, SupplierGroup>();

    filteredItems.forEach((i) => {
      const sup = i.supplier || 'Tedarikçi Belirtilmedi';
      const cur = map.get(sup) || {
        supplier: sup,
        pax: 0,
        toursCount: 0,
        totalRev: 0,
        totalCost: 0,
        netProfit: 0,
        marginPct: 0,
      };

      cur.pax += i.totalPax;
      cur.toursCount += 1;
      cur.totalRev += i.revenueThb;
      cur.totalCost += i.costThb;
      cur.netProfit += i.profitThb;
      map.set(sup, cur);
    });

    const arr = Array.from(map.values());
    arr.forEach((g) => {
      g.marginPct = g.totalRev > 0 ? Math.round((g.netProfit / g.totalRev) * 100) : 0;
    });

    return arr.sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredItems]);

  // Hızlı Maliyet Kaydetme — true dönerse tablo satır içi düzenlemeyi kapatır.
  const handleSaveCost = (item: SettlementItem, newCost: number): boolean => {
    if (!onUpdateBooking) return false;
    const b = { ...item.fullBooking };

    if (item.tourIndex >= 0 && b.tours && b.tours[item.tourIndex]) {
      const nextTours = [...b.tours];
      nextTours[item.tourIndex] = {
        ...nextTours[item.tourIndex],
        costThb: newCost,
      };
      b.tours = nextTours;
      // Genel costThb'yi de güncelle
      b.costThb = nextTours.reduce((sum, t) => sum + (t.costThb || 0), 0);
    } else {
      b.costThb = newCost;
    }

    onUpdateBooking(b);
    return true;
  };

  // Mutabakat Modalı için seçili tedarikçi kalemleri
  const statementItems = useMemo(() => {
    if (!statementSupplier) return [];
    return filteredItems.filter((i) => i.supplier === statementSupplier);
  }, [filteredItems, statementSupplier]);

  const statementTotalCost = useMemo(() => {
    return statementItems.reduce((acc, i) => acc + i.costThb, 0);
  }, [statementItems]);

  const statementTotalPax = useMemo(() => {
    return statementItems.reduce((acc, i) => acc + i.totalPax, 0);
  }, [statementItems]);

  return (
    <div className="space-y-6">
      {/* ÜST FİLTRE VE BAŞLIK KARTI */}
      <SettlementFilterBar
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        selectedSupplier={selectedSupplier}
        onSelectedSupplierChange={setSelectedSupplier}
        availableSuppliers={availableSuppliers}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* FİNANSAL KPI METRİK KARTLARI */}
      <SettlementKpiCards totals={totals} />

      {/* TEDARİKÇİ BAZINDA HAKEDİŞ ÖZETİ KARTLARI */}
      <SupplierGroupsGrid
        supplierGroups={supplierGroups}
        onStatement={(supplier) => setStatementSupplier(supplier)}
        onFilterSupplier={(supplier) => {
          setSelectedSupplier(supplier);
        }}
      />

      {/* DETAYLI KALEMLER TABLOSU */}
      <SettlementItemsTable
        filteredItems={filteredItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSaveCost={handleSaveCost}
      />

      {/* TEDARİKÇİ MUTABAKAT FİŞİ MODALI (A4 YAZDIR / WHATSAPP) */}
      {statementSupplier && (
        <SettlementStatementModal
          statementSupplier={statementSupplier}
          statementItems={statementItems}
          statementTotalPax={statementTotalPax}
          statementTotalCost={statementTotalCost}
          dateFilter={dateFilter}
          startDate={startDate}
          endDate={endDate}
          managerPhone={managerPhone}
          onClose={() => setStatementSupplier(null)}
        />
      )}
    </div>
  );
}
