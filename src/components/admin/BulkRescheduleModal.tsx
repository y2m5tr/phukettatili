import { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  Waves,
} from 'lucide-react';
import type { Booking } from '../../data/adminInitialData';

interface BulkRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onBulkReschedule: (bookingIds: string[], newDate: string, reason: string) => Promise<void>;
  managerPhone?: string;
}

export default function BulkRescheduleModal({
  isOpen,
  onClose,
  bookings,
  onBulkReschedule,
  managerPhone = '66828950665',
}: BulkRescheduleModalProps) {
  const [sourceDate, setSourceDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [selectedTourFilter, setSelectedTourFilter] = useState<string>('all');
  const [rescheduleReason, setRescheduleReason] = useState<string>(
    'Andaman Denizi yüksek dalga ve Tayland Deniz Liman Başkanlığı fırtına uyarısı nedeniyle'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Kaynak tarihteki rezervasyonlar
  const matchingBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status === 'cancelled') return false;
      const isDateMatch =
        b.tourDate === sourceDate ||
        b.tours?.some((t) => t.tourDate === sourceDate);
      if (!isDateMatch) return false;
      if (selectedTourFilter === 'all') return true;
      return b.tourTitle.toLowerCase().includes(selectedTourFilter.toLowerCase());
    });
  }, [bookings, sourceDate, selectedTourFilter]);

  const totalPax = useMemo(() => {
    return matchingBookings.reduce(
      (sum, b) => sum + (b.adultCount || 1) + (b.childCount || 0),
      0
    );
  }, [matchingBookings]);

  // Benzersiz tur seçenekleri
  const availableTours = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.tourDate === sourceDate || b.tours?.some((t) => t.tourDate === sourceDate)) {
        set.add(b.tourTitle);
      }
    });
    return Array.from(set);
  }, [bookings, sourceDate]);

  // Otomatik Misafir Bilgilendirme WhatsApp Metni
  const generateBroadcastMessage = () => {
    return `🌊 *ÖNEMLİ BİLGİLENDİRME: HAVA MUHALEFETİ & TUR TARİHİ DEĞİŞİKLİĞİ* 🌊

Sayın Misafirimiz,

Bugün için planlanan tekne turunuz, *${rescheduleReason}* misafirlerimizin can ve seyir güvenliği gözetilerek Tayland Kraliyeti Deniz Liman Başkanlığı tarafından geçici olarak ertelenmiştir.

📅 *Eski Tur Tarihi:* ${sourceDate}
✨ *YENİ GÜNCELLENMİŞ TUR TARİHİNİZ:* ${targetDate}

Otel transfer saatleriniz ve biniş kartınız yeni tarihe göre otomatik olarak güncellenmiştir:
🎫 *Canlı Biletiniz:* https://phukettatili.com/bilet

Eğer yeni tarih seyahat planınıza uymuyorsa alternatif ada turu veya kesintisiz tam iade için bizimle iletişime geçebilirsiniz.
📞 *Türkçe Operasyon Hattı:* +${managerPhone.replace(/[^0-9]/g, '')}

Anlayışınız için teşekkür eder, güvenli ve keyifli tatiller dileriz! 🌴🇹🇭`;
  };

  const handleConfirmReschedule = async () => {
    if (matchingBookings.length === 0) return;
    setIsSubmitting(true);
    try {
      const ids = matchingBookings.map((b) => b.id);
      await onBulkReschedule(ids, targetDate, rescheduleReason);
      setSuccessCount(ids.length);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyBroadcast = () => {
    navigator.clipboard.writeText(generateBroadcastMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-surface-2 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Waves className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Hava Muhalefeti & Toplu Tur Erteleme Sihirbazı</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Liman başkanlığı deniz kısıtlamasında turları tek tıkla yeni tarihe kaydırın.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {successCount !== null ? (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {successCount} Rezervasyon Başarıyla Ertelendi!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Seçilen tüm turlar <strong className="text-emerald-500">{targetDate}</strong> tarihine aktarıldı.
                </p>
              </div>

              {/* Toplu Mesaj Kutusu */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>Misafirlere Gönderilecek Bilgilendirme Metni:</span>
                  <button
                    type="button"
                    onClick={handleCopyBroadcast}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1.5 font-bold transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
                  </button>
                </div>
                <pre className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-sans whitespace-pre-wrap max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  {generateBroadcastMessage()}
                </pre>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg"
              >
                Pencereyi Kapat
              </button>
            </div>
          ) : (
            <>
              {/* Filtre ve Tarih Seçimi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                    İptal Olan Gün (Kaynak Tarih) *
                  </label>
                  <input
                    type="date"
                    value={sourceDate}
                    onChange={(e) => setSourceDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Yeni Tur Tarihi (Hedef Gün) *
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Etkilenecek Tur Rotaları
                  </label>
                  <select
                    value={selectedTourFilter}
                    onChange={(e) => setSelectedTourFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Tüm Turlar ({matchingBookings.length} Rezervasyon)</option>
                    {availableTours.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                    İptal & Erteleme Nedeni
                  </label>
                  <input
                    type="text"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Etkilenecek Misafir Özeti */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-700 dark:text-amber-300 font-bold block">
                    Etkilenecek Yolcu Sayısı:
                  </span>
                  <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                    {matchingBookings.length} Rezervasyon · {totalPax} Misafir
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>{sourceDate}</span>
                  <ArrowRight className="inline w-3 h-3 mx-1 text-amber-500" />
                  <span className="font-bold text-slate-900 dark:text-white">{targetDate}</span>
                </div>
              </div>

              {/* Etkilenecek Rezervasyon Listesi */}
              <div className="space-y-2">
                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block">
                  Etkilenecek Misafir Listesi:
                </span>
                <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  {matchingBookings.length === 0 ? (
                    <p className="text-center py-4 text-slate-400">
                      Seçilen tarihte ve turda aktif rezervasyon bulunamadı.
                    </p>
                  ) : (
                    matchingBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-slate-900 dark:text-white font-medium">
                            {b.customerName}
                          </strong>
                          <span className="text-slate-400 ml-1.5 font-mono text-[11px]">
                            ({b.hotel})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
                            {(b.adultCount || 1) + (b.childCount || 0)} PAX
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 font-mono font-bold text-[11px]">
                            {b.id}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {successCount === null && (
          <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={handleConfirmReschedule}
              disabled={isSubmitting || matchingBookings.length === 0}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-98"
            >
              <Calendar className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Erteleme Yapılıyor...'
                  : `${matchingBookings.length} Rezervasyonu Yeni Güne Taşı`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
