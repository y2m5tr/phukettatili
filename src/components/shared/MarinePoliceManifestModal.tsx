import { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import type { Booking, PassengerItem } from '../../data/adminInitialData';
import { detectDeparturePier } from '../../lib/maps';

interface Props {
  date: string;
  bookings: Booking[];
  tourTitle?: string;
  assignedVehicle?: string;
  onUpdatePassengers?: (bookingId: string, passengers: PassengerItem[]) => void;
  onClose: () => void;
}

export default function MarinePoliceManifestModal({
  date,
  bookings,
  tourTitle = 'Tüm Turlar',
  assignedVehicle = 'Tüm Araçlar',
  onUpdatePassengers,
  onClose,
}: Props) {
  const [copied, setCopied] = useState<boolean>(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editingPassengers, setEditingPassengers] = useState<PassengerItem[]>([]);

  // Bütün yolcuları düzleştirilmiş liste olarak hesapla
  interface FlatPassenger {
    bookingId: string;
    customerName: string;
    hotel: string;
    roomNumber?: string;
    phone: string;
    tourTitle: string;
    passengerName: string;
    passportNo: string;
    nationality: string;
    birthDate: string;
    gender: 'M' | 'F' | '-';
  }

  const manifestPassengers: FlatPassenger[] = [];

  bookings.forEach((b) => {
    if (b.status === 'cancelled') return;

    if (b.passengers && b.passengers.length > 0) {
      b.passengers.forEach((p) => {
        manifestPassengers.push({
          bookingId: b.id,
          customerName: b.customerName,
          hotel: b.hotel,
          roomNumber: b.roomNumber,
          phone: b.phone,
          tourTitle: b.tourTitle,
          passengerName: p.fullName,
          passportNo: p.passportNo || 'GİRİLMEDİ',
          nationality: p.nationality || 'TÜRKİYE (TUR)',
          birthDate: p.birthDate || '-',
          gender: p.gender || '-',
        });
      });
    } else {
      // Pasaport girilmemişse yetişkin/çocuk sayısına göre ana müşteri adına kayıt aç
      const totalCount = Math.max(1, (b.adultCount || 1) + (b.childCount || 0));
      for (let i = 1; i <= totalCount; i++) {
        manifestPassengers.push({
          bookingId: b.id,
          customerName: b.customerName,
          hotel: b.hotel,
          roomNumber: b.roomNumber,
          phone: b.phone,
          tourTitle: b.tourTitle,
          passengerName: i === 1 ? b.customerName : `${b.customerName} (Misafir ${i})`,
          passportNo: 'GİRİLMEDİ',
          nationality: 'TÜRKİYE (TUR)',
          birthDate: '-',
          gender: '-',
        });
      }
    }
  });

  const pier = detectDeparturePier(tourTitle !== 'Tüm Turlar' ? tourTitle : '');

  // Liman WhatsApp Formatı Kopyalama
  const handleCopyWhatsAppManifest = () => {
    let text = `🇹🇭 *ROYAL THAI MARINE POLICE & PIER MANIFEST* 🇹🇭
📅 *Date:* ${date}
🛥️ *Tour:* ${tourTitle}
🚐 *Vehicle / Hat:* ${assignedVehicle}
⚓ *Pier:* ${pier}
👥 *Total Passengers:* ${manifestPassengers.length} PAX

*PASSENGER LIST:*
`;

    manifestPassengers.forEach((p, idx) => {
      text += `${idx + 1}. ${p.passengerName.toUpperCase()} | Pass: ${p.passportNo} | Nat: ${p.nationality} | Hotel: ${p.hotel}${p.roomNumber ? ` (${p.roomNumber})` : ''}\n`;
    });

    text += `\nOperated by Phuket Tatili DMC · TAT License: 34/02819\nHotline: +66 82 895 0665`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Düzenleme Başlat
  const handleStartEdit = (b: Booking) => {
    setEditingBookingId(b.id);
    const initial =
      b.passengers && b.passengers.length > 0
        ? [...b.passengers]
        : Array.from({ length: (b.adultCount || 1) + (b.childCount || 0) }).map((_, i) => ({
            fullName: i === 0 ? b.customerName : `${b.customerName} - Yolcu ${i + 1}`,
            passportNo: '',
            nationality: 'TÜRKİYE (TUR)',
            birthDate: '',
            gender: 'M' as const,
          }));
    setEditingPassengers(initial);
  };

  const handleSaveEdit = (bookingId: string) => {
    if (onUpdatePassengers) {
      onUpdatePassengers(bookingId, editingPassengers);
    }
    setEditingBookingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none max-h-[95vh] flex flex-col">
        {/* Kontrol Çubuğu (Baskıda Gizli) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-sm block">
                Tayland Deniz Polisi & Sigorta Manifestosu (Marine Police Manifest)
              </span>
              <span className="text-[11px] text-slate-400">
                Tarih: {date} · Toplam {manifestPassengers.length} Yolcu
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsAppManifest}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Liman WhatsApp Metni Kopyala</span>
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Resmî Çıktı / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resmî Belge Kağıdı (Baskı Uyumludur) */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-white" id="printableManifest">
          {/* Resmî Başlık (Tayland Turizm & Denizcilik Formatı) */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl font-serif">
                ⚓
              </div>
              <div>
                <h1 className="font-serif font-black text-lg sm:text-xl text-slate-950 tracking-tight">
                  ROYAL THAI MARINE DEPARTMENT & TOURIST POLICE
                </h1>
                <p className="text-xs font-bold text-slate-600 tracking-wider uppercase">
                  PASSENGER SAFETY MANIFEST & INSURANCE REGISTRATION FORM
                </p>
                <p className="text-[10px] text-slate-500">
                  Licensed Inbound Tour Operator: Phuket Tatili Co., Ltd. · TAT License No: 34/02819
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs">
              <div className="font-bold text-slate-900">
                Tarih / Date: <span className="font-mono text-base">{date}</span>
              </div>
              <div className="text-slate-600">
                Kalkış Limanı / Pier: <span className="font-semibold">{pier}</span>
              </div>
              <div className="text-slate-600 font-mono text-[11px]">
                Toplam Yolcu: <span className="font-bold text-emerald-700">{manifestPassengers.length} PAX</span>
              </div>
            </div>
          </div>

          {/* Tur ve Araç Bilgi Şeridi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tur / Expedition</span>
              <span className="font-bold text-slate-900 truncate block">{tourTitle}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Araç / Minibüs</span>
              <span className="font-bold text-sky-800 truncate block">{assignedVehicle}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Baş Rehber</span>
              <span className="font-bold text-slate-900 block">Deniz Yılmaz (TAT Reg: 882190)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sigorta Poliçesi</span>
              <span className="font-bold text-emerald-800 block">Allianz Thailand Marine Coverage</span>
            </div>
          </div>

          {/* Resmî Yolcu Tablosu */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center w-10">No</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Yolcu Adı Soyadı (Full Name)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Pasaport No (Passport)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Uyruk (Nationality)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Doğum Tarihi</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-center">Cinsiyet</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Otel & Oda (Hotel)</th>
                  <th className="py-2.5 px-3 print:hidden text-right w-24">Düzenle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {manifestPassengers.map((p, idx) => {
                  const b = bookings.find((item) => item.id === p.bookingId);
                  const isMissingPassport = p.passportNo === 'GİRİLMEDİ' || !p.passportNo;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold text-slate-600 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                        {p.passengerName}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold">
                        {isMissingPassport ? (
                          <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[10px]">
                            ⚠️ Pasaport Yok
                          </span>
                        ) : (
                          <span className="text-slate-900">{p.passportNo}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-700">
                        {p.nationality}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono">
                        {p.birthDate}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-bold text-slate-700">
                        {p.gender}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-slate-700 truncate max-w-[160px]">
                        {p.hotel} {p.roomNumber ? `(${p.roomNumber})` : ''}
                      </td>
                      <td className="py-2 px-3 print:hidden text-right">
                        {b && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(b)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 transition-colors"
                          >
                            Düzenle
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Alt İmza & Resmî Onay Bölgesi */}
          <div className="pt-8 grid grid-cols-3 gap-8 text-xs text-slate-600 border-t border-slate-300">
            <div className="border-t border-dashed border-slate-400 pt-2 text-center">
              <span className="block font-bold text-slate-900">Kaptan / Şoför İmzası</span>
              <span className="text-[10px] text-slate-400">(Vessel Captain / Driver)</span>
            </div>
            <div className="border-t border-dashed border-slate-400 pt-2 text-center">
              <span className="block font-bold text-slate-900">Tur Rehberi İmzası</span>
              <span className="text-[10px] text-slate-400">(Licensed Tour Guide)</span>
            </div>
            <div className="border-t border-dashed border-slate-400 pt-2 text-center">
              <span className="block font-bold text-slate-900">Liman Polisi / Gişe Mührü</span>
              <span className="text-[10px] text-slate-400">(Marine Police Pier Checkpoint)</span>
            </div>
          </div>
        </div>

        {/* Pasaport Düzenleme Çekmecesi (In-Modal Editor) */}
        {editingBookingId && (
          <div className="p-4 bg-slate-100 border-t border-slate-300 print:hidden space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                Yolcu Pasaport Bilgilerini Düzenle
              </h4>
              <button
                type="button"
                onClick={() =>
                  setEditingPassengers([
                    ...editingPassengers,
                    { fullName: '', passportNo: '', nationality: 'TÜRKİYE (TUR)', birthDate: '', gender: 'M' },
                  ])
                }
                className="px-2 py-1 rounded bg-white border border-slate-300 text-[11px] font-bold text-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Yolcu Ekle
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {editingPassengers.map((psg, pIdx) => (
                <div key={pIdx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                  <input
                    type="text"
                    placeholder="Adı Soyadı"
                    value={psg.fullName}
                    onChange={(e) => {
                      const updated = [...editingPassengers];
                      updated[pIdx].fullName = e.target.value;
                      setEditingPassengers(updated);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Pasaport No (Örn: U12345678)"
                    value={psg.passportNo || ''}
                    onChange={(e) => {
                      const updated = [...editingPassengers];
                      updated[pIdx].passportNo = e.target.value.toUpperCase();
                      setEditingPassengers(updated);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 font-mono text-xs uppercase"
                  />
                  <input
                    type="text"
                    placeholder="Uyruk"
                    value={psg.nationality || 'TÜRKİYE (TUR)'}
                    onChange={(e) => {
                      const updated = [...editingPassengers];
                      updated[pIdx].nationality = e.target.value;
                      setEditingPassengers(updated);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="date"
                    value={psg.birthDate || ''}
                    onChange={(e) => {
                      const updated = [...editingPassengers];
                      updated[pIdx].birthDate = e.target.value;
                      setEditingPassengers(updated);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={psg.gender || 'M'}
                      onChange={(e) => {
                        const updated = [...editingPassengers];
                        updated[pIdx].gender = e.target.value as 'M' | 'F';
                        setEditingPassengers(updated);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="M">Erkek (M)</option>
                      <option value="F">Kadın (F)</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setEditingPassengers(editingPassengers.filter((_, i) => i !== pIdx))}
                      className="p-1.5 text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingBookingId(null)}
                className="px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit(editingBookingId)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-500"
              >
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
