import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Share2,
  FileText,
  Sparkles,
  Calendar,
  Hotel,
  Users,
  Percent,
  Compass,
  ShieldCheck,
  Clock,
  Phone,
} from 'lucide-react';
import {
  buildCuratedProposal,
  calculateProposalFinancials,
  generateCuratedProposalWhatsAppMessage,
  getCategoryIcon,
  type CuratedProposalData,
} from '../../lib/curatedProposal';
import type { TravelStyle, PackageDuration } from '../../lib/holidayPlanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  initialCustomerName?: string;
  initialHotel?: string;
  initialZone?: string;
}

export default function CuratedProposalModal({
  isOpen,
  onClose,
  showToast,
  initialCustomerName = 'Begüm & Canberk Özkan',
  initialHotel = 'The Shore at Katathani',
  initialZone = 'Kata & Karon',
}: Props) {
  if (!isOpen) return null;

  const [proposal, setProposal] = useState<CuratedProposalData>(() =>
    buildCuratedProposal(
      initialCustomerName,
      'honeymoon',
      5,
      initialHotel,
      initialZone,
      2,
      0
    )
  );

  const [copied, setCopied] = useState<boolean>(false);

  const financials = calculateProposalFinancials(proposal);

  const handleApplyPreset = (style: TravelStyle, duration: PackageDuration) => {
    const updated = buildCuratedProposal(
      proposal.customerName,
      style,
      duration,
      proposal.hotelName,
      proposal.hotelZone,
      proposal.adultCount,
      proposal.childCount
    );
    setProposal(updated);
    showToast(`✨ ${duration} Günlük ${updated.packageTitle} şablonu yüklendi`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsApp = () => {
    const text = generateCuratedProposalWhatsAppMessage(proposal, financials);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('📋 Teklif metni WhatsApp formatında kopyalandı!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:rounded-none">
        
        {/* ÜST BAR (YAZDIRMA ESNASINDA GİZLENİR) */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 print:hidden bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Kişiye Özel Logolu PDF Tur Teklifi & Tatil Broşürü</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  A4 Kurumsal
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Misafirin adına özel gün gün program, transfer saatleri ve indirimli fiyat dökümü.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kopyalandı' : 'WhatsApp Teklifi'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4 PDF İndir / Yazdır</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* İÇERİK ALANI: SOL DÜZENLEYİCİ + SAĞ A4 CANLI ÖNİZLEME */}
        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 print:overflow-visible print:block">
          
          {/* SOL PANEL: HIZLI DÜZENLEME & ŞABLONLAR (PRINTTE GİZLENİR) */}
          <div className="w-full lg:w-80 p-5 space-y-4 shrink-0 bg-slate-50/50 dark:bg-slate-950/40 print:hidden overflow-y-auto">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Hızlı Paket Şablonları:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('honeymoon', 5)}
                  className="p-2 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white block">💑 5G Balayı</span>
                  <span className="text-[10px] text-slate-500">Romantik & Konfor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('vip_luxury', 5)}
                  className="p-2 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white block">👑 5G VIP Özel</span>
                  <span className="text-[10px] text-slate-500">Lüks Yat & Özel Araç</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('family', 5)}
                  className="p-2 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white block">👨‍👩‍👧‍👦 5G Aile</span>
                  <span className="text-[10px] text-slate-500">Güvenli & Çocuklu</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('adventure', 3)}
                  className="p-2 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs"
                >
                  <span className="font-bold text-slate-900 dark:text-white block">⚡ 3G Macera</span>
                  <span className="text-[10px] text-slate-500">ATV, Kano & Rafting</span>
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Misafir Adı (Hitap):
                </label>
                <input
                  type="text"
                  value={proposal.customerName}
                  onChange={(e) => setProposal({ ...proposal, customerName: e.target.value })}
                  placeholder="Örn: Begüm & Canberk Özkan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Otel & Bölge:
                </label>
                <input
                  type="text"
                  value={proposal.hotelName}
                  onChange={(e) => setProposal({ ...proposal, hotelName: e.target.value })}
                  placeholder="Örn: The Shore at Katathani"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Yetişkin:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={proposal.adultCount}
                    onChange={(e) => setProposal({ ...proposal, adultCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Çocuk:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={proposal.childCount}
                    onChange={(e) => setProposal({ ...proposal, childCount: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    İndirim (%):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={proposal.discountPercent}
                    onChange={(e) => setProposal({ ...proposal, discountPercent: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Kapora (%):
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={proposal.depositPercent}
                    onChange={(e) => setProposal({ ...proposal, depositPercent: Math.max(10, parseInt(e.target.value) || 30) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SAĞ PANEL: A4 CANLI VE BASKIYA HAZIR LÜKS TEKLİF DOKÜMANI */}
          <div className="flex-1 p-6 sm:p-10 bg-white text-slate-900 overflow-y-auto print:p-0 print:overflow-visible">
            <div className="max-w-[760px] mx-auto space-y-6">
              
              {/* ANTET / OPERATÖR BAŞLIĞI */}
              <div className="flex items-start justify-between border-b-2 border-amber-500 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold tracking-tight text-slate-950 font-serif">
                      PHUKET TATİLİ
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold uppercase tracking-wider">
                      VIP INBOUND
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Siam Horizon Co., Ltd. · Licensed Inbound Tour Operator · TAT License: 34/02819
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Phuket Office: 48/12 Moo 5, Chalong, Mueang Phuket, 83130 Thailand
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-600 block">
                    {proposal.proposalNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Tarih: {proposal.createdAtDate}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    Geçerlilik: {proposal.validUntilDate}
                  </span>
                </div>
              </div>

              {/* MİSAFİR HITAP KARTI */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                    Kişiye Özel Hazırlanan Program
                  </span>
                  <h2 className="text-lg font-bold text-slate-950">
                    {proposal.customerName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    🏨 Konaklama: <span className="font-semibold text-slate-900">{proposal.hotelName}</span> ({proposal.hotelZone})
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold inline-block">
                    {proposal.packageTitle}
                  </span>
                  <span className="text-xs text-slate-500 block mt-1">
                    👥 {proposal.adultCount} Yetişkin {proposal.childCount > 0 ? `+ ${proposal.childCount} Çocuk` : ''}
                  </span>
                </div>
              </div>

              {/* GÜN GÜN PROGRAM KARTLARI */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
                  🗓️ Gün Gün Seyahat Programı & Alınış Saatleri:
                </h3>

                {proposal.days.map((day) => (
                  <div
                    key={day.dayNumber}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400/60 transition-all flex items-start gap-3 page-break-inside-avoid"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex flex-col items-center justify-center shrink-0 font-bold">
                      <span className="text-[10px] text-slate-400 leading-none">GÜN</span>
                      <span className="text-sm leading-none">{day.dayNumber}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                          <span>{getCategoryIcon(day.category)}</span>
                          <span>{day.dayTitle}</span>
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          {day.priceThb.toLocaleString()} THB
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                        {day.highlight}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-mono">
                          <Clock className="w-3 h-3" />
                          <span>Lobi Alınış: {day.pickupWindow}</span>
                        </span>
                        <span className="text-slate-400">·</span>
                        <span>Tur Süresi: {day.tourDuration}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-emerald-700">✓ {day.included.slice(0, 2).join(' · ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FİNANSAL TABLO & İNDİRİM DÖKÜMÜ */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 page-break-inside-avoid">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Turlar Liste Fiyatı Toplamı:</span>
                  <span className="font-mono">{financials.subtotalThb.toLocaleString()} THB</span>
                </div>

                {proposal.discountPercent > 0 && (
                  <div className="flex items-center justify-between text-xs text-amber-400">
                    <span>Özel Paket İndirimi (%{proposal.discountPercent}):</span>
                    <span className="font-mono">-{financials.discountThb.toLocaleString()} THB</span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-sm font-bold text-white block">Net Paket Bedeli:</span>
                    <span className="text-[11px] text-slate-400">
                      (~{financials.totalTry.toLocaleString()} TL / ~{financials.totalUsd.toLocaleString()} USD)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-amber-400 font-mono">
                      {financials.totalThb.toLocaleString()} THB
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-800/60">
                    <span className="text-slate-400 block">Rezervasyon Kapora Bedeli (%{proposal.depositPercent}):</span>
                    <span className="font-bold text-emerald-400 font-mono text-xs">
                      {financials.depositThb.toLocaleString()} THB
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Havale / Kredi Kartı / PromptPay</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800/60">
                    <span className="text-slate-400 block">Tur Günü Teslim Edilecek Kalan:</span>
                    <span className="font-bold text-amber-300 font-mono text-xs">
                      {financials.remainingThb.toLocaleString()} THB
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Sabah şoföre veya rehbere nakit Baht</span>
                  </div>
                </div>
              </div>

              {/* DAHİL OLAN GÜVENCELER & KURUMSAL ALT NOT */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-[10px] text-slate-500 page-break-inside-avoid">
                <div className="flex items-center gap-1 font-bold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Phuket Tatili Resmi Operatör Garantileri:</span>
                </div>
                <p>
                  • Tüm turlarımızda otelden gidiş-dönüş VIP klimalı transferler, şnorkel ekipmanları ve öğle yemekleri dahildir.
                </p>
                <p>
                  • Tayland Turizm Bakanlığı (TAT) ve Deniz Polisi nezdinde geçerli yolcu kaza ve seyahat sigortası pakete dahildir.
                </p>
                <p>
                  • <strong>Hava Muhalefeti Güvencesi:</strong> Andaman Denizi liman başkanlığı tarafından hava/dalga nedeniyle tur iptali kararı alınırsa %100 kesintisiz tarih değişimi veya anında tam ücret iadesi garantilidir.
                </p>
                <p className="pt-1 text-slate-400">
                  Rezervasyon Onayı & 7/24 Türkçe Saha Asistanı: +66 82 895 0665 · info@phukettatili.com · www.phukettatili.com
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
