import { ExternalLink, Share2 } from 'lucide-react';
import type { Booking } from '../../../data/adminInitialData';
import { fmtMoney } from '../../../lib/moneyFormat';

export interface AgentBookingsTabProps {
  agentBookings: Booking[];
  totalGuestsSent: number;
  totalAgentRevenue: number;
  totalAgentCommission: number;
  onShareWhatsApp: (booking: Booking) => void;
}

// TAB 2: ACENTA REZERVASYONLARI VE HAKEDİŞLERİ (stat kartları + tablo)
// AgentPortalApp'ten birebir taşındı.
export default function AgentBookingsTab({
  agentBookings,
  totalGuestsSent,
  totalAgentRevenue,
  totalAgentCommission,
  onShareWhatsApp,
}: AgentBookingsTabProps) {
  return (
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
                          onClick={() => onShareWhatsApp(b)}
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
  );
}
