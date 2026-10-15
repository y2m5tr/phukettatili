/**
 * Genel Bakış (Overview) sekmesi — AdminDashboard'tan ayrıldı.
 *
 * Stats hesabı AdminDashboard'taki useMemo'da kalır (settlements ve
 * diğer görünümler de aynı stats'ı kullanıyor); buraya hazır değerler
 * prop olarak geçer.
 */
import {
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Compass,
  Car,
  BookOpen,
  HelpCircle,
  MessageSquareQuote,
} from 'lucide-react';
import type { AdminTab } from './AdminDashboard';

/** AdminDashboard'taki stats useMemo çıktısı — alan isimleri birebir. */
export interface OverviewStats {
  totalBookings: number;
  confirmedCount: number;
  pendingCount: number;
  totalRevenueThb: number;
  collectedRevenueThb: number;
  pendingCollectionThb: number;
  totalGuests: number;
  totalCostThb: number;
  netProfitThb: number;
  profitMarginPercent: number;
}

interface OverviewTabProps {
  stats: OverviewStats;
  /** Sekme kısayolları için sayım ve geçiş. */
  bookingsCount: number;
  toursCount: number;
  servicesCount: number;
  blogsCount: number;
  faqsCount: number;
  testimonialsCount: number;
  setActiveTab: (tab: AdminTab) => void;
}

export default function OverviewTab({
  stats,
  bookingsCount,
  toursCount,
  servicesCount,
  blogsCount,
  faqsCount,
  testimonialsCount,
  setActiveTab,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Rezervasyon</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalBookings}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold">{stats.confirmedCount} Onay</span>
            <span>·</span>
            <span className="text-amber-600 font-semibold">{stats.pendingCount} Bekleyen</span>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Toplam Ciro</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {stats.totalRevenueThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Toplam satış cirosu</p>
        </div>

        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tedarikçi Maliyeti</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {stats.totalCostThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Tekne & acente gideri</p>
        </div>

        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-emerald-500/30 dark:border-emerald-600/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Kâr (Kazanç)</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
            {stats.netProfitThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            %{stats.profitMarginPercent} Kâr Marjı
          </p>
        </div>

        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kasadaki Kapora</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.collectedRevenueThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Kasadaki peşinat</p>
        </div>

        <div className="bg-white dark:bg-surface-2 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Kalan (Sahada)</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.pendingCollectionThb.toLocaleString()} <span className="text-xs font-semibold">THB</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Otelde tahsil edilecek</p>
        </div>
      </div>

      {/* Quick Content Navigation Cards */}
      <div>
        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-4">
          İçerik & Modül Kısayolları
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setActiveTab('bookings')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Users className="w-6 h-6 text-brand-primary group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Müşteriler</div>
            <div className="text-xs text-slate-400">{bookingsCount} Kayıt</div>
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Compass className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Turlar</div>
            <div className="text-xs text-slate-400">{toursCount} Tur</div>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <Car className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Hizmetler</div>
            <div className="text-xs text-slate-400">{servicesCount} Sayfa</div>
          </button>

          <button
            onClick={() => setActiveTab('blogs')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <BookOpen className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Blog & Rehber</div>
            <div className="text-xs text-slate-400">{blogsCount} Yazı</div>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <HelpCircle className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">SSS Soruları</div>
            <div className="text-xs text-slate-400">{faqsCount} Soru</div>
          </button>

          <button
            onClick={() => setActiveTab('testimonials')}
            className="p-5 rounded-2xl bg-white dark:bg-surface-2 border border-slate-200/80 dark:border-slate-800 hover:border-brand-accent transition-all text-left group"
          >
            <MessageSquareQuote className="w-6 h-6 text-pink-500 group-hover:scale-110 transition-transform mb-2" />
            <div className="font-bold text-sm text-slate-900 dark:text-white">Yorumlar</div>
            <div className="text-xs text-slate-400">{testimonialsCount} Yorum</div>
          </button>
        </div>
      </div>
    </div>
  );
}
