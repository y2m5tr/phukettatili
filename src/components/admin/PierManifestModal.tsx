import { useState, useMemo } from 'react';
import {
  Ship,
  Calendar,
  Search,
  Printer,
  Copy,
  Check,
  X,
  MessageCircle,
  MapPin,
  Users,
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';
import {
  PHUKET_PIERS,
  buildPierManifest,
  generatePierManifestWhatsApp,
  printPierManifestA4,
} from '../../lib/pierManifest';

interface PierManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  defaultDate?: string;
  showToast: (msg: string) => void;
}

export default function PierManifestModal({
  isOpen,
  onClose,
  bookings = [],
  defaultDate,
  showToast,
}: PierManifestModalProps) {
  if (!isOpen) return null;

  const todayStr = useMemo(
    () => defaultDate || new Date().toISOString().split('T')[0],
    [defaultDate]
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedPierId, setSelectedPierId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [captainPhone, setCaptainPhone] = useState<string>('+66 82 895 0665');

  // Derlenen iskele manifestosu
  const manifest = useMemo(() => {
    return buildPierManifest(
      bookings,
      selectedDate,
      selectedPierId === 'all' ? undefined : selectedPierId
    );
  }, [bookings, selectedDate, selectedPierId]);

  // Arama filtresi
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return manifest.items;
    const q = searchQuery.toLowerCase();
    return manifest.items.filter(
      (item) =>
        item.customerName.toLowerCase().includes(q) ||
        item.hotel.toLowerCase().includes(q) ||
        item.tourTitle.toLowerCase().includes(q) ||
        item.ticketCode.toLowerCase().includes(q) ||
        (item.assignedVehicle || '').toLowerCase().includes(q) ||
        item.passengersList.some((p) => p.name.toLowerCase().includes(q))
    );
  }, [manifest.items, searchQuery]);

  const whatsappMessage = useMemo(() => {
    return generatePierManifestWhatsApp(manifest);
  }, [manifest]);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopied(true);
      showToast('📋 İskele manifestosu panoya kopyalandı!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('⚠️ Kopyalama başarısız oldu.');
    }
  };

  const handlePrint = () => {
    printPierManifestA4(manifest);
  };

  const handleSendToCaptain = () => {
    const clean = captainPhone.replace(/[^\d+]/g, '').replace(/^\+/, '');
    const url = clean
      ? `https://wa.me/${clean}?text=${encodeURIComponent(whatsappMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-surface-2 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[94vh] flex flex-col overflow-hidden my-auto">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
                  İskele & Kaptan Manifestosu (Pier Operations)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                  Saha & Marina
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tekne check-in masaları, kaptanlar ve iskele görevlileri için resmi yolcu listesi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="A4 Formatında Yazdır"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yazdır / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTROLS & FILTERS */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Tarih Seçimi */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-primary" /> Tur Tarihi
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* İskele Seçimi */}
            <div className="sm:col-span-5">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-500" /> Kalkış İskelesi / Marina
              </label>
              <select
                value={selectedPierId}
                onChange={(e) => setSelectedPierId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">📍 Tüm İskeleler (Genel Phuket Manifestosu)</option>
                {PHUKET_PIERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.thaiName}) - {p.zone}
                  </option>
                ))}
              </select>
            </div>

            {/* Misafir / Arama */}
            <div className="sm:col-span-4">
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
                <Search className="w-3 h-3 text-slate-400" /> Hızlı Arama
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Misafir adı, otel, oda, bilet kodu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* ÖZET İSTATİSTİK ROZETLERİ */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold flex items-center gap-1.5 border border-sky-100 dark:border-sky-900/40">
              <Users className="w-3.5 h-3.5" />
              {manifest.totalPax} Misafir ({manifest.totalAdults} Y, {manifest.totalChildren} Ç)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-100 dark:border-indigo-900/40">
              {manifest.totalBookings} Bilet / Grup
            </span>
            {manifest.totalRemainingThb > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-100 dark:border-rose-900/40">
                💵 İskelede Tahsil Edilecek: {manifest.totalRemainingThb.toLocaleString()} THB
              </span>
            )}
            {Object.keys(manifest.dietaryCounts).length > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-100 dark:border-amber-900/40">
                🥗 Özel Diyet:{' '}
                {Object.entries(manifest.dietaryCounts)
                  .map(([k, v]) => `${v} ${k}`)
                  .join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 print:p-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Ship className="w-10 h-10 mx-auto opacity-40 text-sky-500" />
              <p className="text-sm font-semibold">
                Seçilen iskele ve tarihte rezervasyon bulunamadı.
              </p>
              <p className="text-xs">
                Tarihi değiştirebilir veya "Tüm İskeleler" seçeneğiyle diğer kalkışları kontrol edebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Alış Saati</th>
                      <th className="py-2.5 px-3">Misafir & Yolcular</th>
                      <th className="py-2.5 px-3">Otel & Oda</th>
                      <th className="py-2.5 px-3">Tur Başlığı</th>
                      <th className="py-2.5 px-3">Transfer Aracı</th>
                      <th className="py-2.5 px-3">Ödeme / Harç</th>
                      <th className="py-2.5 px-3">Notlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    {filteredItems.map((item, idx) => (
                      <tr
                        key={`${item.bookingId}-${idx}`}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-brand-primary text-xs bg-brand-primary/10 px-2 py-0.5 rounded-md">
                            {item.pickupTime || '07:30'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {item.customerName}
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">
                              {item.totalPax} Pax
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Ref: {item.ticketCode} | Tel: {item.phone}
                          </div>
                          {item.passengersList.length > 0 && (
                            <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                              {item.passengersList.map((p, pIdx) => (
                                <div key={pIdx}>
                                  • {p.name}{' '}
                                  <span className="font-mono">({p.passportNo})</span>
                                  {p.dietaryPreference && p.dietaryPreference !== 'standard' && (
                                    <span className="ml-1 text-amber-600 dark:text-amber-400 font-semibold">
                                      [{p.dietaryPreference}]
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.hotel}
                          </div>
                          {item.roomNumber && (
                            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              Oda: {item.roomNumber}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 max-w-[200px]">
                          <span className="font-bold truncate block">{item.tourTitle}</span>
                          {item.supplier && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Tedarikçi: {item.supplier}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                            🚐 {item.assignedVehicle || 'Atanmadı'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {item.remainingAmountThb > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400 font-bold block">
                              💵 {item.remainingAmountThb.toLocaleString()} THB Kalan
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">
                              ✓ Tamamı Ödendi
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 block">
                            {item.nationalParkFeeIncluded ? '✅ Millî Park Dahil' : '⚠️ Harç Hariç'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-500 max-w-[150px] truncate">
                          {item.specialNotes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER & ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 hidden sm:inline">Kaptan Tel:</span>
            <input
              type="text"
              value={captainPhone}
              onChange={(e) => setCaptainPhone(e.target.value)}
              placeholder="+66 82 895 0665"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 w-36 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSendToCaptain}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Kaptana WhatsApp İlet</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
