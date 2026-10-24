/**
 * A4 teklif belgesinin TEKLİ TUR kolu — CuratedProposalModal'dan ayrıldı.
 *
 * Saf presentational: print'e hazır A4 belge gövdesini basar. Tüm veri
 * parent'tan prop olarak gelir; bileşen state tutmaz, yan etki üretmez.
 */
import {
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  DEFAULT_SINGLE_TOUR_TIPS,
  MEAL_PLAN_META,
  NATIONAL_PARK_META,
  TRANSPORT_META,
} from '../../../lib/curatedProposal';
import type {
  CuratedProposalData,
  CuratedProposalFinancials,
  CuratedProposalDay,
} from '../../../lib/curatedProposal';
import { fmtMoney } from '../../../lib/moneyFormat';

interface ProposalSingleTourDocProps {
  proposal: CuratedProposalData;
  financials: CuratedProposalFinancials;
  singleDay: CuratedProposalDay;
  brandLogoSrc: string;
}

export default function ProposalSingleTourDoc({
  proposal,
  financials,
  singleDay,
  brandLogoSrc,
}: ProposalSingleTourDocProps) {
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
              VIP TUR & AKTİVİTE TEKLİFİ
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

      {/* MİSAFİR & TUR KARTI */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider block">
            Kişiye Özel Hazırlanan VIP Tur Teklifi
          </span>
          <h2 className="text-xl font-extrabold text-slate-950">
            {proposal.customerName}
          </h2>
          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 pt-0.5">
            <span>🏨 Alınış Oteli: <strong className="text-slate-900">{proposal.hotelName}</strong> ({proposal.hotelZone})</span>
            {proposal.customerPhone && (
              <>
                <span>·</span>
                <span className="font-semibold text-slate-800">📱 {proposal.customerPhone}</span>
              </>
            )}
            {proposal.singleTourDate && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  <Calendar className="w-3 h-3 text-amber-600" />
                  <span>Tur Tarihi: {proposal.singleTourDate}</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-950 text-xs font-black inline-block shadow-2xs">
            {singleDay.tourTitle || proposal.packageTitle}
          </span>
          <div className="text-xs text-slate-600 flex sm:justify-end items-center gap-1.5">
            <span>👥 {proposal.adultCount} Yetişkin {proposal.childCount > 0 ? `+ ${proposal.childCount} Çocuk` : ''}</span>
            <span>·</span>
            <span className="font-bold text-emerald-700">Özel / VIP Tur</span>
          </div>
          <p className="text-[10px] text-slate-400">
            👨‍💼 Danışman: <span className="font-semibold text-slate-700">{proposal.agentInfo.name}</span> ({proposal.agentInfo.phone})
          </p>
        </div>
      </div>

      {/* LOJİSTİK VE DONANIM BİLGİ ROZETLERİ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70">
          <span className="text-[10px] text-amber-700 font-bold block">⏰ Lobi Alınış:</span>
          <span className="text-xs font-extrabold text-slate-900 font-mono block mt-0.5">
            {singleDay.pickupWindow || '07:30 - 07:45'}
          </span>
          <span className="text-[10px] text-slate-500">Süre: {singleDay.tourDuration || 'Tam Gün'}</span>
        </div>

        <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/70">
          <span className="text-[10px] text-sky-700 font-bold block">🚤 Ulaşım / Araç:</span>
          <span className="text-xs font-extrabold text-slate-900 block mt-0.5 truncate" title={proposal.singleTourVesselInfo || TRANSPORT_META[singleDay.transportType]?.label}>
            {proposal.singleTourVesselInfo || TRANSPORT_META[singleDay.transportType]?.label || 'VIP Klimalı Araç'}
          </span>
          <span className="text-[10px] text-slate-500">Konforlu Seyahat</span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
          <span className="text-[10px] text-emerald-700 font-bold block">🍽️ Yemek Planı:</span>
          <span className="text-xs font-extrabold text-slate-900 block mt-0.5 truncate">
            {MEAL_PLAN_META[singleDay.mealPlan]?.label || 'Açık Büfe Yemek'}
          </span>
          <span className="text-[10px] text-slate-500">Meyve & Soğuk Su Dahil</span>
        </div>

        <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/70">
          <span className="text-[10px] text-purple-700 font-bold block">🎫 Milli Park Durumu:</span>
          <span className="text-xs font-extrabold text-slate-900 block mt-0.5 truncate">
            {NATIONAL_PARK_META[singleDay.nationalParkFeeStatus]?.label || 'Dahil'}
          </span>
          <span className="text-[10px] text-slate-500">Resmi İzinli</span>
        </div>
      </div>

      {/* ÖNE ÇIKAN VURGU */}
      {singleDay.highlight && (
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-950 italic flex items-start gap-2">
          <span className="text-base leading-none">✨</span>
          <span>"{singleDay.highlight}"</span>
        </div>
      )}

      {/* SAATLİK TUR AKIŞI & ZAMAN ÇİZELGESİ (TIMELINE) */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4 break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Öngörülen Saatlik Tur Akışı & Zaman Çizelgesi:</span>
          </h3>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
            {(proposal.singleTourTimeline || []).length} Durak / Aşama
          </span>
        </div>

        {(!proposal.singleTourTimeline || proposal.singleTourTimeline.length === 0) ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Henüz saatlik adım eklenmedi. Sol panelden "Saatlik Tur Akışı" sekmesinden adımları ekleyebilirsiniz.
          </p>
        ) : (
          <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-400/40">
            {proposal.singleTourTimeline.map((step, sIdx) => (
              <div key={step.id || sIdx} className="relative flex items-start gap-3 text-xs">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center shadow-2xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>

                {/* Zaman rozeti */}
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 font-mono font-bold text-[11px] shrink-0">
                  {step.time}
                </span>

                {/* Detay */}
                <div className="flex-1 min-w-0">
                  <span className="font-black text-slate-900 block">{step.title}</span>
                  {step.description && (
                    <span className="text-[11px] text-slate-600 block mt-0.5 leading-relaxed">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DAHİL OLANLAR & YANINIZDA GETİRECEKLERİNİZ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fiyata Dahil Olan Güvenceler:</span>
          </h4>
          <ul className="space-y-1 text-[10px] text-slate-700">
            {(singleDay.included && singleDay.included.length > 0 ? singleDay.included : proposal.inclusions.slice(0, 5)).map((inc, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{inc}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-2">
            <span>🎒</span>
            <span>Yanınızda Getirmeniz Önerilenler:</span>
          </h4>
          <ul className="space-y-1 text-[10px] text-slate-700">
            {(proposal.singleTourTips && proposal.singleTourTips.length > 0 ? proposal.singleTourTips : DEFAULT_SINGLE_TOUR_TIPS).map((tip, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FİNANSAL TABLO & İNDİRİMLİ ÖDEME PLANI */}
      <div className="p-5 rounded-3xl bg-slate-950 text-white space-y-3.5 shadow-lg break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800 text-slate-400">
          <span>Tur Liste Fiyatı:</span>
          <span className="font-mono">{fmtMoney(financials.subtotalThb)} THB</span>
        </div>

        {proposal.discountPercent > 0 && (
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
            <span>Özel İndirim (%{proposal.discountPercent}):</span>
            <span className="font-mono">-{fmtMoney(financials.discountThb)} THB</span>
          </div>
        )}

        <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
          <div>
            <span className="text-base font-black text-white block">Net Tur Bedeli:</span>
            <span className="text-[11px] text-slate-400">
              (~{fmtMoney(financials.totalTry)} TL · ~{fmtMoney(financials.totalUsd)} USD · ~{fmtMoney(financials.totalEur)} EUR)
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
              {fmtMoney(financials.totalThb)} <span className="text-sm font-normal">THB</span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              (Kişi başı: {fmtMoney(financials.perPersonThb)} THB)
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
              Tur Günü Kalan Bakiye:
            </span>
            <span className="font-black text-amber-300 font-mono text-sm sm:text-base mt-0.5 block">
              {fmtMoney(financials.remainingThb)} THB
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Sabah transferde / marinada nakit Baht
            </span>
          </div>
        </div>

        {proposal.paymentMethodsNote && (
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
            💳 <strong>Ödeme Kanalları:</strong> {proposal.paymentMethodsNote}
          </p>
        )}
      </div>

      {/* GÜVENCELER & RESMİ MÜHÜR */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5 text-[10px] text-slate-600 break-inside-avoid" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
        <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Phuket Tatili Resmi Operatör Güvenceleri:</span>
        </div>
        <p>
          • <strong>Hava Muhalefeti Güvencesi:</strong> Andaman Denizi liman başkanlığı tarafından dalga/fırtına nedeniyle tur iptali kararı verilirse %100 kesintisiz tarih değişimi veya tam ücret iadesi uygulanır.
        </p>
        <p>
          • <strong>Sigorta Kapsamı:</strong> Tayland Turizm Bakanlığı (TAT: 34/02819) nezdinde geçerli seyahat kaza sigortası dahildir.
        </p>
        <p className="pt-1 text-slate-500 font-medium">
          Rezervasyon Onayı & 7/24 Türkçe Saha Asistanı: +66 82 895 0665 · info@phukettatili.com
        </p>
      </div>
    </>
  );
}
