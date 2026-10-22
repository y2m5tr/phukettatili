import { useState } from 'react';
import {
  Calendar,
  Share2,
  Printer,
  Copy,
  Check,
  MessageCircle,
  Luggage,
  Sparkles,
  Ticket,
  ChevronRight,
} from 'lucide-react';
import type { GuestItinerary } from '../../lib/guestItinerary';

interface Props {
  itinerary: GuestItinerary;
  ticketCode?: string;
  whatsappNumber?: string;
  whatsappShareUrl?: string;
  whatsappSummaryText?: string;
}

export default function GuestItineraryCard({
  itinerary,
  ticketCode,
  whatsappNumber = '66828950665',
  whatsappShareUrl = '',
  whatsappSummaryText = '',
}: Props) {
  const [activeTab, setActiveTab] = useState<'story' | 'timeline' | 'packing'>('story');
  const [copied, setCopied] = useState<boolean>(false);

  const cleanCode = ticketCode || itinerary.bookingId;
  const ticketPortalUrl = `/bilet/${cleanCode}`;

  const handleCopySummary = async () => {
    if (!whatsappSummaryText) return;
    try {
      await navigator.clipboard.writeText(whatsappSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${itinerary.guestName} - Phuket Tatil Programı`,
          text: whatsappSummaryText,
          url: itinerary.publicUrl,
        });
      } catch {
        // Kullanıcı iptal ettiyse sessizce geç
      }
    } else {
      handleCopySummary();
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ÜST NAVİGASYON & HIZLI EYLEM ÇUBUĞU (Yazdırmada Gizlenir) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 print:hidden">
        {/* Görünüm Sekmeleri */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'story'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>📱 Karne / Story</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>🗓️ Gün Gün Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'packing'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Luggage className="w-3.5 h-3.5" />
            <span>🎒 Hazırlık</span>
          </button>
        </div>

        {/* Eylem Butonları */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNativeShare}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Telefonda paylaş veya kopyala"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Paylaş</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="WhatsApp metin özetini panoya kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Yazdır veya PDF olarak kaydet"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Yazdır</span>
          </button>

          <a
            href={ticketPortalUrl}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Canlı lobi geri sayımı ve bilet sayfası"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Bilet Portalım</span>
          </a>
        </div>
      </div>

      {/* 2. GÖRÜNÜM A: ŞIK DİJİTAL TATİL KARNESİ (STORY KARTI FORMATI) */}
      {activeTab === 'story' && (
        <div id="print-story-card" className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Arka Plan Tropik Vurgu */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Kart Üst Başlık */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌴</span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block font-sans">
                  PHUKET TATİL KARNESİ
                </span>
                <span className="text-xs font-serif font-bold text-slate-300">
                  Kişiye Özel Tur & Transfer Programı
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs">
                {cleanCode}
              </span>
            </div>
          </div>

          {/* Misafir & Otel Bilgi Şeridi */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Sayın Misafirimiz:</span>
              <span className="text-base font-bold text-white font-serif">{itinerary.guestName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Konaklama:</span>
              <span className="font-semibold text-slate-200">
                🏨 {itinerary.hotel} {itinerary.roomNumber ? `(Oda: ${itinerary.roomNumber})` : ''}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Program Kapsamı:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                {itinerary.totalDays} Günlük Tur Rotası
              </span>
            </div>
          </div>

          {/* Rota Akışı (Timeline) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              <span>Gün Gün Tur Programınız</span>
              <span className="text-[10px] text-amber-400">⏰ Lobi Alınış Saatleri</span>
            </div>

            <div className="space-y-2.5">
              {itinerary.days.map((day) => (
                <div
                  key={day.dayIndex}
                  className="p-4 rounded-2xl bg-white/5 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      {day.dayIndex}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{day.date}</span>
                        <span className="text-xs text-slate-400">({day.dayNameTr})</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {day.tourTitle}
                      </h4>
                      {day.whatToBring && day.whatToBring.length > 0 && (
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          🎒 Yanınıza alın: {day.whatToBring[0]}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Lobi Alınış:</span>
                    <span className="px-3 py-1 rounded-xl bg-slate-900 text-emerald-300 font-mono font-black text-xs inline-block mt-0.5 border border-emerald-500/30">
                      ⏰ {day.pickupTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alt Özet & WhatsApp Hızlı İletişim */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Tüm turlarınızda otel lobi transferi ve sigorta dahildir.</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={whatsappShareUrl || `https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp İle Paylaş</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. GÖRÜNÜM B: GÜN GÜN DETAYLI LİSTE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {itinerary.days.map((day) => (
            <div
              key={day.dayIndex}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                    {day.dayIndex}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{day.date}</span>
                      <span className="text-xs text-slate-400">({day.dayNameTr})</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{day.tourTitle}</h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Lobi Alınış:</span>
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-emerald-400 font-mono font-black text-xs inline-block mt-0.5 border border-slate-700">
                    ⏰ {day.pickupTime}
                  </span>
                </div>
              </div>

              {/* Ne Getirmeli Listesi */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                  🎒 Yanınıza Almanız Gerekenler:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {day.whatToBring.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bilgilendirme Notları */}
              {day.importantNotes && day.importantNotes.length > 0 && (
                <div className="text-[11px] text-slate-400 bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-300 block">💡 Tur İpuçları:</span>
                  {day.importantNotes.map((note, ni) => (
                    <p key={ni} className="leading-relaxed">• {note}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 2. GÖRÜNÜM C: GENEL VALİZ & HAZIRLIK KONTROLÜ */}
      {activeTab === 'packing' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Luggage className="w-4 h-4 text-amber-400" />
              <span>Phuket Tatili Genel Valiz Kontrol Listesi</span>
            </h3>
            <p className="text-xs text-slate-400">
              Turlara çıkmadan önce odanızdan almayı unutmamanız gereken temel eşyalar:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              { title: 'Otel Plaj Havlusu', desc: 'Otel resepsiyonundan ücretsiz talep edebilirsiniz.' },
              { title: 'Su Geçirmez Telefon Kılıfı', desc: 'Sürat teknesinde ve şnorkelde telefonunuzu korur.' },
              { title: 'Güneş Kremi (SPF 50+) & Şapka', desc: 'Tropik güneş altında yanıkları önlemek için şarttır.' },
              { title: 'Nakit Baht (THB)', desc: 'Milli park gişeleri ve ada içi içecek harcamaları için.' },
              { title: 'Pasaport Fotoğrafı', desc: 'Telefonunuzda pasaport ilk sayfa fotoğrafı bulunması yeterlidir.' },
              { title: 'Rahat Terlik / Deniz Ayakkabısı', desc: 'Mercan ve kaya olan sahillerde ayaklarınızı korur.' },
            ].map((pItem, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="font-bold text-white block">✓ {pItem.title}</span>
                <span className="text-slate-400 block text-[11px]">{pItem.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BİLET PORTALINA YÖNLENDİRME KARTI */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-lg shrink-0">
            🙋‍♂️
          </span>
          <div>
            <span className="text-xs font-bold text-white block">
              Sabah Lobiye İndiğinizde Şoföre Bildirin
            </span>
            <span className="text-[11px] text-slate-400 block">
              Bilet portalınızdan canlı geri sayımı takip edebilir ve "Lobideyim, Hazırım" butonunu kullanabilirsiniz.
            </span>
          </div>
        </div>

        <a
          href={ticketPortalUrl}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-md transition-all"
        >
          <span>Portala Git</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
