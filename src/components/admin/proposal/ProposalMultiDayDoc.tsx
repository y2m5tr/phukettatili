/**
 * A4 teklif belgesinin ÇOK GÜNLÜ PAKET kolu — CuratedProposalModal'dan ayrıldı.
 *
 * Saf presentational: print'e hazır A4 belge gövdesini basar. Tüm veri
 * parent'tan prop olarak gelir; bileşen state tutmaz, yan etki üretmez.
 */
import {
  CheckCircle2,
  Clock,
  Gift,
  Hotel,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  MEAL_PLAN_META,
  NATIONAL_PARK_META,
  TRANSPORT_META,
  getCategoryIcon,
} from '../../../lib/curatedProposal';
import type {
  CuratedProposalData,
  CuratedProposalFinancials,
  CuratedProposalHotelStay,
} from '../../../lib/curatedProposal';
import { fmtMoney } from '../../../lib/moneyFormat';

interface ProposalMultiDayDocProps {
  proposal: CuratedProposalData;
  financials: CuratedProposalFinancials;
  proposalHotels: CuratedProposalHotelStay[];
  brandLogoSrc: string;
}

export default function ProposalMultiDayDoc({
  proposal,
  financials,
  proposalHotels,
  brandLogoSrc,
}: ProposalMultiDayDocProps) {
  return (
    <>
      {/* ANTET / LÜKS OPERATÖR BAŞLIĞI */}
      <div className="flex items-start justify-between border-b-2 border-amber-500 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src={brandLogoSrc}
              alt="Phuket Tatili Logo"
              width="460"
              height="340"
              className="h-11 w-auto object-contain shrink-0"
            />
            <span className="text-2xl font-black tracking-tight text-slate-950 font-serif">
              PHUKET TATİLİ
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase tracking-wider">
              VIP INBOUND OPERATOR
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-semibold">
            Siam Horizon Co., Ltd. · Licensed Inbound Tour Operator · TAT License: 34/02819
          </p>
          <p className="text-[10px] text-slate-400">
            Phuket Head Office: 48/12 Moo 5, Chalong, Mueang Phuket, 83130 Thailand
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-black text-amber-600 block">
            {proposal.proposalNumber}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Düzenleme: {proposal.createdAtDate}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block">
            Geçerlilik: {proposal.validUntilDate}
          </span>
        </div>
      </div>

      {/* MİSAFİR & DANIŞMAN KARTI */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block">
            Kişiye Özel Hazırlanan Seyahat Programı
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-950">
              {proposal.customerName}
            </h2>
            {proposal.customerPhone && (
              <span className="text-xs font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-md">
                📱 {proposal.customerPhone}
              </span>
            )}
          </div>
          {proposalHotels.length > 1 ? (
            <div className="pt-1 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                🏨 Konaklama Otelleri ({proposalHotels.length} Farklı Otel):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {proposalHotels.map((h, i) => (
                  <span
                    key={h.id || i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-900 shadow-2xs"
                  >
                    <span className="font-extrabold text-amber-600">#{i + 1}</span>
                    <span>{h.hotelName || `Otel ${i + 1}`}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      ({h.hotelZone}){h.notes ? ` · ${h.notes}` : ''}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              🏨 Konaklama: <span className="font-bold text-slate-900">{proposal.hotelName}</span> ({proposal.hotelZone})
            </p>
          )}
        </div>

        <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-950 text-xs font-black inline-block shadow-2xs">
            {proposal.packageTitle}
          </span>
          <div className="text-xs text-slate-600 flex sm:justify-end items-center gap-1.5">
            <span>👥 {proposal.adultCount} Yetişkin {proposal.childCount > 0 ? `+ ${proposal.childCount} Çocuk` : ''}</span>
            <span>·</span>
            <span className="font-bold text-emerald-700">{proposal.days.length} Günlük Rota</span>
          </div>
          <p className="text-[10px] text-slate-400">
            👨‍💼 Danışman: <span className="font-semibold text-slate-700">{proposal.agentInfo.name}</span> ({proposal.agentInfo.phone})
          </p>
        </div>
      </div>

      {/* ÖZEL KARŞILAMA MESAJI (VARSA) */}
      {proposal.welcomeMessage && (
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950 italic">
          "{proposal.welcomeMessage}"
        </div>
      )}

      {/* GÜN GÜN PROGRAM KARTLARI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🗓️ Gün Gün Seyahat Programı & Alınış Saatleri:</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold">
            {proposal.days.length} Gün · Tam Planlama
          </span>
        </div>

        {proposal.days.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs">
            Henüz gün/tur eklenmedi. Sol panelden "Katalogdan Tek Tıkla Tur Ekle" seçeneğiyle turlarınızı ekleyebilirsiniz.
          </div>
        ) : (
          proposal.days.map((day) => {
            const transMeta = TRANSPORT_META[day.transportType];
            const mealMeta = MEAL_PLAN_META[day.mealPlan];
            const npMeta = NATIONAL_PARK_META[day.nationalParkFeeStatus];

            return (
              <div
                key={day.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-400/60 transition-all flex items-start gap-3.5 break-inside-avoid shadow-2xs"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                {/* Gün Numarası Rozeti */}
                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex flex-col items-center justify-center shrink-0 font-bold shadow-xs">
                  <span className="text-[9px] text-amber-400 tracking-wider leading-none">GÜN</span>
                  <span className="text-lg leading-tight font-black">{day.dayNumber}</span>
                </div>

                {/* Gün İçeriği */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                        <span>{getCategoryIcon(day.category)}</span>
                        <span>{day.dayTitle}</span>
                      </h4>
                      <p className="text-xs font-bold text-amber-700 mt-0.5">
                        {day.tourTitle}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-black text-slate-900 shrink-0">
                      {fmtMoney(day.priceThb)} THB
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {day.highlight}
                  </p>

                  {/* Saat & Lojistik Rozetleri */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                    {/* Alınış Saati Rozeti */}
                    <span className="flex items-center gap-1 text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-lg font-mono font-bold">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Lobi Alınış: {day.pickupWindow}</span>
                    </span>

                    {/* Alınış Oteli Rozeti (Çoklu otel varsa) */}
                    {day.hotelName && (
                      <span className="flex items-center gap-1 text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg font-medium border border-slate-200">
                        <Hotel className="w-3 h-3 text-amber-600" />
                        <span>Alınış Oteli: {day.hotelName}</span>
                      </span>
                    )}

                    {/* Tur Süresi */}
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                      Süre: {day.tourDuration}
                    </span>

                    {/* Ulaşım Rozeti */}
                    {transMeta && (
                      <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/60 font-semibold">
                        {transMeta.icon} {transMeta.label}
                      </span>
                    )}

                    {/* Yemek Rozeti */}
                    {mealMeta && mealMeta.label !== 'Yemeksiz / Serbest Tercih' && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold">
                        {mealMeta.icon} {mealMeta.label}
                      </span>
                    )}

                    {/* Milli Park Rozeti */}
                    {npMeta && (
                      <span className={`px-2 py-0.5 rounded-lg border font-semibold ${npMeta.badge}`}>
                        {npMeta.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DAHİL & HARİÇ OLANLAR TABLOSU */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 break-inside-avoid"
        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      >
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pakete Dahil Olan Güvenceler:</span>
          </h4>
          <ul className="space-y-1 text-[10px] text-slate-700">
            {proposal.inclusions.map((inc, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{inc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Pakete Dahil Olmayanlar:</span>
          </h4>
          <ul className="space-y-1 text-[10px] text-slate-600">
            {proposal.exclusions.map((exc, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">✕</span>
                <span>{exc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* VIP İKRAM & SÜRPRİZLER (VARSA) */}
      {proposal.specialGifts && proposal.specialGifts.length > 0 && (
        <div
          className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-950 break-inside-avoid"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
        >
          <div className="flex items-center gap-1.5 text-xs font-black text-purple-900 mb-1">
            <Gift className="w-4 h-4 text-purple-600" />
            <span>Phuket Tatili'nden Çiftimize Özel Jest & İkramlar:</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-semibold text-purple-900/90 pt-1">
            {proposal.specialGifts.map((gift, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span>🎁</span>
                <span>{gift}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SEÇİLEN VIP EKSTRALAR & UPSELL ADDONS (VARSA) */}
      {(proposal.addons || []).some((a) => a.selected) && (
        <div
          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-950 break-inside-avoid"
          style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
        >
          <div className="flex items-center justify-between text-xs font-black text-amber-900 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span>💎</span>
              <span>Teklife Dahil Edilen Ekstra VIP Hizmetler:</span>
            </span>
            <span className="font-mono text-[11px] font-bold">
              +{fmtMoney((proposal.addons || [])
                .filter((a) => a.selected)
                .reduce((acc, a) => acc + (a.priceThb || 0), 0)
                )}{' '}
              THB
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-950/90">
            {(proposal.addons || [])
              .filter((a) => a.selected)
              .map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between gap-1 p-2 rounded-xl bg-white/70 border border-amber-200/60"
                >
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>{addon.icon || '✨'}</span>
                    <span>{addon.title}</span>
                  </span>
                  <span className="font-mono font-bold text-amber-800 text-[10px]">
                    +{fmtMoney(addon.priceThb)} ฿
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* FİNANSAL TABLO & İNDİRİMLİ ÖDEME PLANI */}
      <div
        className="p-5 rounded-3xl bg-slate-950 text-white space-y-3.5 break-inside-avoid shadow-lg"
        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      >
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 text-slate-400">
          <span>Turlar Liste Fiyatı Toplamı:</span>
          <span className="font-mono">{fmtMoney(financials.subtotalThb)} THB</span>
        </div>

        {proposal.discountPercent > 0 && (
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>Özel Paket İndirimi (%{proposal.discountPercent}):</span>
            <span className="font-mono">-{fmtMoney(financials.discountThb)} THB</span>
          </div>
        )}

        <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
          <div>
            <span className="text-base font-black text-white block">Net Paket Bedeli:</span>
            <span className="text-[11px] text-slate-400">
              (~{fmtMoney(financials.totalTry)} TL · ~{fmtMoney(financials.totalUsd)} USD · ~{fmtMoney(financials.totalEur)} EUR)
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {fmtMoney(financials.totalThb)} <span className="text-sm font-normal">THB</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              (Kişi başı yaklaşık {fmtMoney(financials.perPersonThb)} THB)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              Rezervasyon Kapora Bedeli (%{proposal.depositPercent}):
            </span>
            <span className="font-black text-emerald-400 font-mono text-sm sm:text-base mt-0.5 block">
              {fmtMoney(financials.depositThb)} THB
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Türkiye IBAN / Kredi Kartı / PromptPay
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              Tur Günü Teslim Edilecek Kalan:
            </span>
            <span className="font-black text-amber-300 font-mono text-sm sm:text-base mt-0.5 block">
              {fmtMoney(financials.remainingThb)} THB
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Sabah lobi transferinde şoföre nakit Baht
            </span>
          </div>
        </div>

        {proposal.paymentMethodsNote && (
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
            💳 <strong>Ödeme Kanalları:</strong> {proposal.paymentMethodsNote}
          </p>
        )}
      </div>

      {/* DAHİL OLAN GÜVENCELER & KURUMSAL MÜHÜR */}
      <div
        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-[10px] text-slate-600 break-inside-avoid"
        style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
      >
        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Phuket Tatili Resmi Operatör Güvenceleri & İade Kalkanı:</span>
        </div>
        <p>
          • <strong>Hava Muhalefeti Güvencesi:</strong> Andaman Denizi liman başkanlığı tarafından dalga/fırtına nedeniyle tur iptali kararı verilirse %100 kesintisiz tarih değişimi veya tam ücret iadesi uygulanır.
        </p>
        <p>
          • <strong>Sigorta Kapsamı:</strong> Tayland Turizm Bakanlığı (TAT) ve Deniz Polisi nezdinde geçerli seyahat kaza sigortası tüm misafirlerimize turlar boyunca dahildir.
        </p>
        <p className="pt-1 text-slate-500 font-medium">
          Rezervasyon Onayı & 7/24 Türkçe Saha Asistanı: +66 82 895 0665 · info@phukettatili.com · www.phukettatili.com
        </p>
      </div>
    </>
  );
}
