import { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Filter,
  Search,
  Printer,
  Copy,
  Check,
  Building,
  X,
  Edit2,
  FileText,
  ArrowUpRight,
  Receipt,
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import { fmtMoney } from '../../lib/moneyFormat';

interface Props {
  bookings: Booking[];
  onUpdateBooking?: (booking: Booking) => void;
  managerPhone?: string;
}

interface SettlementItem {
  bookingId: string;
  tourIndex: number;
  customerName: string;
  phone: string;
  tourTitle: string;
  tourDate: string;
  pickupTime: string;
  supplier: string;
  adultCount: number;
  childCount: number;
  totalPax: number;
  revenueThb: number;
  costThb: number;
  profitThb: number;
  marginPercent: number;
  isCustomCost: boolean;
  fullBooking: Booking;
}

export default function SupplierSettlementManager({
  bookings,
  onUpdateBooking,
  managerPhone = '66828950665',
}: Props) {
  // Filtre durumları
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'this_week' | 'this_month' | 'custom'>('this_month');
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
  const [copied, setCopied] = useState<boolean>(false);

  // Satır içi maliyet düzenleme
  const [editingItem, setEditingItem] = useState<{ bookingId: string; tourIndex: number; cost: number } | null>(null);

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
  const totals = useMemo(() => {
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
  const supplierGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        supplier: string;
        pax: number;
        toursCount: number;
        totalRev: number;
        totalCost: number;
        netProfit: number;
        marginPct: number;
      }
    >();

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

  // Hızlı Maliyet Kaydetme
  const handleSaveCost = (item: SettlementItem, newCost: number) => {
    if (!onUpdateBooking) return;
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
    setEditingItem(null);
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

  // Tedarikçiye WhatsApp Mutabakat Mesajı Kopyalama (İngilizce / Tayca format)
  const handleCopySupplierWhatsApp = () => {
    if (!statementSupplier) return;
    const dateRangeStr =
      dateFilter === 'today'
        ? new Date().toISOString().split('T')[0]
        : `${startDate} - ${endDate}`;

    let text = `🇹🇭 *PHUKET TATILI — SUPPLIER SETTLEMENT STATEMENT*\n`;
    text += `🏢 *Company / Supplier:* ${statementSupplier}\n`;
    text += `📅 *Billing Period:* ${dateRangeStr}\n`;
    text += `👥 *Total Guests:* ${statementTotalPax} PAX (${statementItems.length} Tours)\n`;
    text += `───────────────────────────────\n`;

    statementItems.forEach((it, idx) => {
      text += `${idx + 1}. [${it.tourDate}] *${it.customerName}* (${it.totalPax} PAX)\n`;
      text += `   🏝️ Tour: ${it.tourTitle}\n`;
      text += `   💵 Cost Due: *${fmtMoney(it.costThb)} THB*\n\n`;
    });

    text += `───────────────────────────────\n`;
    text += `💰 *TOTAL PAYOUT AMOUNT:* *${fmtMoney(statementTotalCost)} THB*\n`;
    text += `📄 Ref No: PT-SETTLE-${new Date().getTime().toString().slice(-6)}\n`;
    text += `Operated by: Phuket Tatili Co., Ltd. (TAT License: 34/02819)\n`;
    text += `Hotline: +${managerPhone.replace(/[^0-9]/g, '')}\n`;
    text += `Khop khun khrup! 🙏🇹🇭`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ÜST FİLTRE VE BAŞLIK KARTI */}
      <div className="bg-white dark:bg-surface-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Receipt className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Tedarikçi Hakediş & Net Kâr Yönetimi
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tekne, safari, fil kampı ve transfer tedarikçilerine ödenecek hakedişleri takip edin, net kâr marjını hesaplayın ve mutabakat fişleri oluşturun.
          </p>
        </div>

        {/* Hızlı Filtre Butonları */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {(['today', 'this_week', 'this_month', 'all'] as const).map((df) => (
              <button
                key={df}
                type="button"
                onClick={() => setDateFilter(df)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dateFilter === df
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {df === 'today' ? 'Bugün' : df === 'this_week' ? 'Bu Hafta' : df === 'this_month' ? 'Bu Ay' : 'Tümü'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateFilter('custom');
              }}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-mono font-bold focus:outline-none"
              title="Başlangıç Tarihi"
            />
            <span className="text-slate-400 font-bold">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateFilter('custom');
              }}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-mono font-bold focus:outline-none"
              title="Bitiş Tarihi"
            />
          </div>

          {/* Tedarikçi Seçici */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">🏢 Tüm Tedarikçiler ({availableSuppliers.length})</option>
            {availableSuppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Durum Filtresi */}
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'all' ? 'confirmed_only' : 'all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === 'confirmed_only'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            {statusFilter === 'confirmed_only' ? '✓ Yalnızca Onaylılar' : 'Tüm Durumlar'}
          </button>
        </div>
      </div>

      {/* FİNANSAL KPI METRİK KARTLARI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Toplam Ciro */}
        <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Satış (Ciro)</span>
            <DollarSign className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
            {fmtMoney(totals.totalRev)} <span className="text-xs font-sans font-bold text-slate-400">THB</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            {totals.itemCount} Tur / Rezervasyon
          </span>
        </div>

        {/* Toplam Tedarikçi Hakedişi */}
        <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Tedarikçi Borcu</span>
            <Building className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
            {fmtMoney(totals.totalCost)} <span className="text-xs font-sans font-bold text-slate-400">THB</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            Ödenecek Toplam Hakediş
          </span>
        </div>

        {/* Net Acenta Kârı */}
        <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 dark:from-emerald-950/20 to-transparent shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Acenta Kârı</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
            {fmtMoney(totals.totalNetProfit)} <span className="text-xs font-sans font-bold text-emerald-600/70">THB</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>%{totals.marginPct} Kâr Marjı</span>
          </div>
        </div>

        {/* Toplam Yolcu */}
        <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Yolcu (PAX)</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
            {totals.totalPax} <span className="text-xs font-sans font-bold text-slate-400">Kişi</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            Hakediş Hesaplanan Yolcu
          </span>
        </div>

        {/* Ortalama Yolcu Başı Net Kâr */}
        <div className="bg-white dark:bg-surface-2 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">PAX Başına Kâr</span>
            <Receipt className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {fmtMoney(totals.avgProfitPerPax)} <span className="text-xs font-sans font-bold text-slate-400">THB</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
            Kişi Başı Ortalama Net Getiri
          </span>
        </div>
      </div>

      {/* TEDARİKÇİ BAZINDA HAKEDİŞ ÖZETİ KARTLARI */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-500" />
          <span>Tedarikçi Borç & Hakediş Dağılımı ({supplierGroups.length} Firma)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {supplierGroups.map((g) => (
            <div
              key={g.supplier}
              className="bg-white dark:bg-surface-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                    {g.supplier}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                    {g.toursCount} Tur · {g.pax} PAX
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Ödenecek Borç</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-base">
                      {fmtMoney(g.totalCost)} THB
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Acenta Kârı</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                      {fmtMoney(g.netProfit)} THB
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatementSupplier(g.supplier)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Mutabakat Fişi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSupplier(g.supplier);
                  }}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="Bu tedarikçiyi filtrele"
                >
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAYLI KALEMLER TABLOSU */}
      <div className="bg-white dark:bg-surface-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Tüm Tur & Hakediş Kayıtları ({filteredItems.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rezervasyon veya Misafir Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none w-56"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Tarih</th>
                <th className="py-3.5 px-4">Rezervasyon / Misafir</th>
                <th className="py-3.5 px-4">Tur Başlığı</th>
                <th className="py-3.5 px-4">Tedarikçi</th>
                <th className="py-3.5 px-4 text-center">PAX</th>
                <th className="py-3.5 px-4 text-right">Satış (THB)</th>
                <th className="py-3.5 px-4 text-right">Hakediş Maliyeti (THB)</th>
                <th className="py-3.5 px-4 text-right">Net Kâr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Seçilen filtrelerde hakediş kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={`${item.bookingId}-${item.tourIndex}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-medium whitespace-nowrap">
                      {item.tourDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {item.customerName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.bookingId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-900 dark:text-white max-w-xs truncate block">
                        {item.tourTitle}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        {item.supplier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono font-bold">
                      {item.totalPax}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                      {fmtMoney(item.revenueThb)} ฿
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-rose-600 dark:text-rose-400">
                      {editingItem && editingItem.bookingId === item.bookingId && editingItem.tourIndex === item.tourIndex ? (
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            defaultValue={item.costThb}
                            id={`cost-input-${item.bookingId}`}
                            className="w-20 px-1.5 py-0.5 rounded border border-amber-500 text-xs font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const el = document.getElementById(`cost-input-${item.bookingId}`) as HTMLInputElement;
                              if (el) handleSaveCost(item, Number(el.value) || 0);
                            }}
                            className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 group">
                          <span>{fmtMoney(item.costThb)} ฿</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditingItem({
                                bookingId: item.bookingId,
                                tourIndex: item.tourIndex,
                                cost: item.costThb,
                              })
                            }
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-500 transition-opacity"
                            title="Maliyeti Düzenle"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{fmtMoney(item.profitThb)} ฿
                      <span className="text-[10px] text-slate-400 ml-1 font-sans">
                        (%{item.marginPercent})
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TEDARİKÇİ MUTABAKAT FİŞİ MODALI (A4 YAZDIR / WHATSAPP) */}
      {/* ==================================================== */}
      {statementSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white text-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none max-h-[95vh] flex flex-col">
            {/* Modal Kontrol Çubuğu (Yazdırmada Gizli) */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm leading-tight">
                    Tedarikçi Mutabakat Fişi (Supplier Statement)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Firma: <span className="font-bold text-white">{statementSupplier}</span> · Toplam {statementTotalPax} PAX
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySupplierWhatsApp}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp Metni Kopyala</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>A4 Yazdır / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatementSupplier(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Yazdırılabilir Belge Gövdesi */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-white" id="supplierStatementDoc">
              {/* Belge Başlığı */}
              <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl font-serif">
                    🇹🇭
                  </div>
                  <div>
                    <h1 className="font-serif font-black text-lg sm:text-xl text-slate-950 tracking-tight">
                      TOUR OPERATOR SETTLEMENT & RECONCILIATION STATEMENT
                    </h1>
                    <p className="text-xs font-bold text-slate-600 tracking-wider uppercase">
                      OFFICIAL PAYMENT STATEMENT FOR INBOUND SERVICES
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Phuket Tatili Co., Ltd. · Licensed Inbound DMC · TAT License No: 34/02819
                    </p>
                  </div>
                </div>

                <div className="sm:text-right text-xs">
                  <div className="font-bold text-slate-900">
                    Tarih: <span className="font-mono text-base">{new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div className="text-slate-600">
                    Ref: <span className="font-mono font-bold">PT-SETTLE-{new Date().getTime().toString().slice(-6)}</span>
                  </div>
                </div>
              </div>

              {/* Tedarikçi Bilgi Şeridi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tedarikçi Firma</span>
                  <span className="font-bold text-slate-900 truncate block text-sm">{statementSupplier}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Toplam Hizmet</span>
                  <span className="font-bold text-slate-900 block">{statementItems.length} Tur Kaydı</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Yolcu Sayısı</span>
                  <span className="font-bold text-emerald-800 block">{statementTotalPax} PAX</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Toplam Ödenecek</span>
                  <span className="font-black text-rose-700 block text-sm font-mono">
                    {fmtMoney(statementTotalCost)} THB
                  </span>
                </div>
              </div>

              {/* Kalem Kalem Mutabakat Tablosu */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Tur Tarihi</th>
                      <th className="py-2.5 px-3">Misafir Adı</th>
                      <th className="py-2.5 px-3">Tur Başlığı</th>
                      <th className="py-2.5 px-3 text-center">PAX</th>
                      <th className="py-2.5 px-3 text-right">Birim Hakediş</th>
                      <th className="py-2.5 px-3 text-right">Toplam Tutar (THB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {statementItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-medium">{item.tourDate}</td>
                        <td className="py-2 px-3 font-bold">{item.customerName}</td>
                        <td className="py-2 px-3 text-slate-700">{item.tourTitle}</td>
                        <td className="py-2 px-3 text-center font-bold font-mono">{item.totalPax}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {item.totalPax > 0 ?fmtMoney( Math.round(item.costThb / item.totalPax)) : item.costThb} ฿
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                          {fmtMoney(item.costThb)} ฿
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t-2 border-slate-900 font-bold">
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-right uppercase text-xs">
                        Genel Toplam Hakediş Tutarı:
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-sm">
                        {statementTotalPax}
                      </td>
                      <td></td>
                      <td className="py-3 px-3 text-right font-mono font-black text-base text-rose-700">
                        {fmtMoney(statementTotalCost)} THB
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Kaşe & İmza Alanı */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-xs border-t border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Hazırlayan (DMC Operasyon):</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">Phuket Tatili Co., Ltd.</span>
                  <div className="h-16 border-b border-dashed border-slate-300 mt-4"></div>
                  <span className="text-[10px] text-slate-400 block mt-1">İmza & Kaşe</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Tedarikçi Onayı:</span>
                  <span className="text-slate-500 block text-[11px] mt-0.5">{statementSupplier}</span>
                  <div className="h-16 border-b border-dashed border-slate-300 mt-4"></div>
                  <span className="text-[10px] text-slate-400 block mt-1">Teslim Alan / Kaşe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
