/**
 * Sahada Hızlı Tur Satışı formu — FieldApp'ten ayrıldı.
 *
 * Form state'i PARENT'ta kalır (handleCreateQuickBooking zinciri,
 * API çağrısı ve toast akışı orada). Buraya yalnızca JSX + props geçer.
 */
import { PlusCircle, Check } from 'lucide-react';
import {
  type TourItem,
  HOTEL_ZONES,
  detectHotelZone,
  getRecommendedPickupTime,
} from '../../data/adminInitialData';
import { fmtMoney } from '../../lib/moneyFormat';

interface NewBookingTabProps {
  newCustName: string;
  setNewCustName: (v: string) => void;
  newCustPhone: string;
  setNewCustPhone: (v: string) => void;
  newCustHotel: string;
  setNewCustHotel: (v: string) => void;
  newCustZone?: string;
  setNewCustZone?: (v: string) => void;
  newCustRoom: string;
  setNewCustRoom: (v: string) => void;
  newTourId: string;
  setNewTourId: (v: string) => void;
  newTourDate: string;
  setNewTourDate: (v: string) => void;
  newPickupTime: string;
  setNewPickupTime: (v: string) => void;
  newAdultCount: number;
  setNewAdultCount: (v: number) => void;
  newChildCount: number;
  setNewChildCount: (v: number) => void;
  newPriceThb: number;
  setNewPriceThb: (v: number) => void;
  newDepositThb: number;
  setNewDepositThb: (v: number) => void;
  newNatPark: boolean;
  setNewNatPark: (v: boolean) => void;
  newNotes: string;
  setNewNotes: (v: string) => void;
  isSubmittingBooking: boolean;
  onSubmit: (e: React.FormEvent) => void;
  tours: TourItem[];
}

export default function NewBookingTab({
  newCustName,
  setNewCustName,
  newCustPhone,
  setNewCustPhone,
  newCustHotel,
  setNewCustHotel,
  newCustZone,
  setNewCustZone,
  newCustRoom,
  setNewCustRoom,
  newTourId,
  setNewTourId,
  newTourDate,
  setNewTourDate,
  newPickupTime,
  setNewPickupTime,
  newAdultCount,
  setNewAdultCount,
  newChildCount,
  setNewChildCount,
  newPriceThb,
  setNewPriceThb,
  newDepositThb,
  setNewDepositThb,
  newNatPark,
  setNewNatPark,
  newNotes,
  setNewNotes,
  isSubmittingBooking,
  onSubmit,
  tours,
}: NewBookingTabProps) {
  return (
    <main className="flex-1 px-4 py-4 space-y-4">
      <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-amber-400" />
          Sahada Hızlı Tur Satışı
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Misafirle sahada anlaşınca 1 dakikada rezervasyonu açın; ofis ekranına ve günün manifestosuna anında düşsün.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Misafir Adı & Soyadı *
          </label>
          <input
            type="text"
            required
            value={newCustName}
            onChange={(e) => setNewCustName(e.target.value)}
            placeholder="Örn: Mehmet Can / Can Ailesi"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              WhatsApp No *
            </label>
            <input
              type="text"
              required
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              placeholder="+90 532..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Oda Numarası
            </label>
            <input
              type="text"
              value={newCustRoom}
              onChange={(e) => setNewCustRoom(e.target.value)}
              placeholder="Örn: 204"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              🏨 Otel Adı *
            </label>
            <input
              type="text"
              required
              value={newCustHotel}
              onChange={(e) => {
                const val = e.target.value;
                setNewCustHotel(val);
                if (setNewCustZone) {
                  const detected = detectHotelZone(val);
                  if (!newCustZone || newCustZone === 'Patong & Kalim' || newCustZone === 'Genel Phuket') {
                    setNewCustZone(detected);
                  }
                }
              }}
              placeholder="Örn: Millennium Resort Patong"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              📍 Bölge / Hat *
            </label>
            <select
              value={newCustZone || (newCustHotel ? detectHotelZone(newCustHotel) : 'Patong & Kalim')}
              onChange={(e) => setNewCustZone && setNewCustZone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {HOTEL_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Tur Seçimi *
          </label>
          <select
            value={newTourId}
            onChange={(e) => setNewTourId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
          >
            {tours.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.priceThb ? `${fmtMoney(t.priceThb)} THB` : 'Özel Fiyat'})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tur Tarihi *
            </label>
            <input
              type="date"
              required
              value={newTourDate}
              onChange={(e) => setNewTourDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span>⏰</span> Alınış Saati
              </label>
              {(() => {
                const activeZone =
                  newCustZone || (newCustHotel ? detectHotelZone(newCustHotel) : 'Patong & Kalim');
                const rec = getRecommendedPickupTime(activeZone);
                return (
                  <button
                    type="button"
                    onClick={() => setNewPickupTime(rec)}
                    className="text-[10px] text-amber-400 font-bold hover:underline cursor-pointer"
                    title="Önerilen saati doldur"
                  >
                    ⚡ Önerilen: {rec}
                  </button>
                );
              })()}
            </div>
            <input
              type="text"
              placeholder="Örn: 08:30 - 09:00"
              value={newPickupTime}
              onChange={(e) => setNewPickupTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            />
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {['07:15 - 07:30', '07:30 - 07:45', '07:45 - 08:00', '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:15'].map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setNewPickupTime(time)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    newPickupTime === time
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Yetişkin Sayısı
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={newAdultCount}
              onChange={(e) => setNewAdultCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Çocuk Sayısı
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={newChildCount}
              onChange={(e) => setNewChildCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Toplam Tutar (THB)
            </label>
            <input
              type="number"
              value={newPriceThb}
              onChange={(e) => setNewPriceThb(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alınan Kapora (THB)
            </label>
            <input
              type="number"
              value={newDepositThb}
              onChange={(e) => setNewDepositThb(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-emerald-400 font-bold focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="quick-natpark"
            checked={newNatPark}
            onChange={(e) => setNewNatPark(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
          />
          <label htmlFor="quick-natpark" className="text-xs text-slate-300 cursor-pointer">
            Millî Park Giriş Ücreti Fiyata Dahildir
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Özel Notlar (Opsiyonel)
          </label>
          <textarea
            rows={2}
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            placeholder="Örn: Vejetaryen yemek istiyorlar, çocuk için can yeleği..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmittingBooking}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <Check className="w-4 h-4" />
          <span>{isSubmittingBooking ? 'Kaydediliyor...' : 'Rezervasyonu Kaydet & Canlıya Al'}</span>
        </button>
      </form>
    </main>
  );
}
