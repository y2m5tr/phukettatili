import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Send,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  Hotel,
  Luggage,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Phone,
  User,
  Car,
} from 'lucide-react';
import {
  type LuggageTransferRecord,
  type LuggageStatus,
  LUGGAGE_STATUS_LABELS,
  INITIAL_LUGGAGE_RECORDS,
  generateLuggageTagNumber,
  generateLuggageCollectedWhatsApp,
  generateLuggageDeliveredWhatsApp,
  getLuggageWhatsAppUrl,
} from '../../lib/luggageExpress';
import type { Booking, DriverItem } from '../../data/adminInitialData';

interface LuggageExpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings?: Booking[];
  drivers?: DriverItem[];
  showToast: (msg: string) => void;
}

const STORAGE_KEY = 'phuket_tatili_luggage_records_v1';

export default function LuggageExpressModal({
  isOpen,
  onClose,
  bookings = [],
  drivers = [],
  showToast,
}: LuggageExpressModalProps) {
  if (!isOpen) return null;

  const [records, setRecords] = useState<LuggageTransferRecord[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_LUGGAGE_RECORDS;
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form State
  const [formGuestName, setFormGuestName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formPickupHotel, setFormPickupHotel] = useState<string>('');
  const [formDeliveryHotel, setFormDeliveryHotel] = useState<string>('');
  const [formLargeBags, setFormLargeBags] = useState<number>(2);
  const [formCabinBags, setFormCabinBags] = useState<number>(1);
  const [formDriverId, setFormDriverId] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  const saveRecords = (next: LuggageTransferRecord[]) => {
    setRecords(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const handleStatusChange = (id: string, nextStatus: LuggageStatus) => {
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const updated = records.map((r) => {
      if (r.id !== id) return r;
      return {
        ...r,
        status: nextStatus,
        collectedAt: nextStatus === 'collected_from_hotel' || nextStatus === 'in_transit' ? r.collectedAt || nowTime : r.collectedAt,
        deliveredAt: nextStatus === 'delivered_to_hotel' ? nowTime : r.deliveredAt,
      };
    });
    saveRecords(updated);
    showToast(`Bagaj durumu güncellendi: ${LUGGAGE_STATUS_LABELS[nextStatus].label}`);
  };

  const handleDeleteRecord = (id: string) => {
    saveRecords(records.filter((r) => r.id !== id));
    showToast('Bagaj transfer kaydı silindi.');
  };

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGuestName || !formPickupHotel || !formDeliveryHotel) {
      showToast('Lütfen misafir adı, çıkış ve varış otellerini girin.');
      return;
    }

    const assignedDriver = drivers.find((d) => d.id === formDriverId);
    const newRecord: LuggageTransferRecord = {
      id: `LUG-${Date.now().toString().slice(-4)}`,
      guestName: formGuestName,
      phone: formPhone || '+90 532 000 0000',
      date: new Date().toISOString().split('T')[0],
      pickupHotel: formPickupHotel,
      deliveryHotel: formDeliveryHotel,
      largeBagsCount: Number(formLargeBags) || 1,
      cabinBagsCount: Number(formCabinBags) || 0,
      assignedDriverId: formDriverId || undefined,
      assignedDriverName: assignedDriver?.fullName || 'Atanmadı',
      status: 'pending',
      tagNumber: generateLuggageTagNumber(formGuestName),
      notes: formNotes,
      createdAt: new Date().toISOString(),
    };

    saveRecords([newRecord, ...records]);
    showToast(`✅ ${newRecord.tagNumber} bagaj transfer görevi oluşturuldu!`);
    setIsAddingNew(false);
    // Reset form
    setFormGuestName('');
    setFormPhone('');
    setFormPickupHotel('');
    setFormDeliveryHotel('');
    setFormNotes('');
  };

  const filteredRecords = records.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Oteller Arası Bagaj Transfer Masası</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  Luggage Express
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Gündüz turdayken otel değiştiren misafirlerin valizlerini eski otelden yeni otele güvenle taşıyın ve bildirin.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Filtre:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none"
            >
              <option value="all">Tüm Durumlar ({records.length})</option>
              <option value="pending">⏳ Alınış Bekleyenler</option>
              <option value="collected_from_hotel">🧳 Otelden Alınanlar</option>
              <option value="in_transit">🚐 Yolda Olanlar</option>
              <option value="delivered_to_hotel">✅ Teslim Edilenler</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingNew ? 'Listeye Dön' : 'Yeni Bagaj Transferi Ekle'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* New Record Form */}
          {isAddingNew && (
            <form onSubmit={handleCreateRecord} className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>🧳</span>
                  <span>Yeni Otelden Otele Bagaj Teslim Emri</span>
                </h4>
                {bookings.length > 0 && (
                  <select
                    onChange={(e) => {
                      const b = bookings.find((bk) => bk.id === e.target.value);
                      if (b) {
                        setFormGuestName(b.customerName);
                        setFormPhone(b.phone);
                        setFormPickupHotel(b.hotel);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 focus:outline-none"
                  >
                    <option value="">Rezervasyondan Doldur...</option>
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.customerName} ({b.hotel})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Misafir Adı *</label>
                  <input
                    type="text"
                    required
                    value={formGuestName}
                    onChange={(e) => setFormGuestName(e.target.value)}
                    placeholder="Örn: Ahmet Kaya"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">WhatsApp Telefonu *</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Örn: +90 532 123 4567"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Eski Otel (Alınacak Otel) *</label>
                  <input
                    type="text"
                    required
                    value={formPickupHotel}
                    onChange={(e) => setFormPickupHotel(e.target.value)}
                    placeholder="Örn: Amari Phuket (Patong)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Yeni Otel (Teslim Edilecek Otel) *</label>
                  <input
                    type="text"
                    required
                    value={formDeliveryHotel}
                    onChange={(e) => setFormDeliveryHotel(e.target.value)}
                    placeholder="Örn: The Shore at Katathani (Kata Noi)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Büyük Valiz Sayısı</label>
                  <input
                    type="number"
                    min="0"
                    value={formLargeBags}
                    onChange={(e) => setFormLargeBags(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Kabin Boy / Çanta Sayısı</label>
                  <input
                    type="number"
                    min="0"
                    value={formCabinBags}
                    onChange={(e) => setFormCabinBags(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Görevli Şoför</label>
                  <select
                    value={formDriverId}
                    onChange={(e) => setFormDriverId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                  >
                    <option value="">Şoför Seç...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                >
                  Görevi Kaydet & Başlat
                </button>
              </div>
            </form>
          )}

          {/* List of Luggage Records */}
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-slate-950/50 rounded-2xl border border-slate-800">
              Seçilen filtrede bagaj transfer kaydı bulunamadı.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => {
                const totalBags = (record.largeBagsCount || 0) + (record.cabinBagsCount || 0);
                const statusMeta = LUGGAGE_STATUS_LABELS[record.status] || LUGGAGE_STATUS_LABELS.pending;

                return (
                  <div
                    key={record.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                          {record.tagNumber}
                        </span>
                        <strong className="text-sm font-bold text-white">{record.guestName}</strong>
                        <span className="text-xs text-slate-400 font-mono">({record.phone})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${statusMeta.colorClass}`}>
                          <span>{statusMeta.icon}</span>
                          <span>{statusMeta.label}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                          title="Kaydı Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Routing Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                          <span>🏨 Çıkış Oteli:</span>
                        </span>
                        <div className="font-semibold text-white pl-3 border-l-2 border-rose-500/40">
                          {record.pickupHotel}
                          {record.pickupRoomNumber && ` (Oda: ${record.pickupRoomNumber})`}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <span>🏁 Varış (Yeni) Otel:</span>
                        </span>
                        <div className="font-semibold text-white pl-3 border-l-2 border-emerald-500/40">
                          {record.deliveryHotel}
                        </div>
                      </div>
                    </div>

                    {/* Meta info & Action bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800/40">
                      <div className="flex flex-wrap items-center gap-2 text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-bold">
                          🧳 {totalBags} Parça ({record.largeBagsCount} Büyük + {record.cabinBagsCount} Kabin)
                        </span>
                        <span>·</span>
                        <span>🧑‍✈️ {record.assignedDriverName || 'Şoför Atanmadı'}</span>
                      </div>

                      {/* Status Progress Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {record.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(record.id, 'collected_from_hotel')}
                            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <span>🧳 Otelden Alındı</span>
                          </button>
                        )}

                        {record.status === 'collected_from_hotel' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(record.id, 'in_transit')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <span>🚐 Araca Yüklendi (Yolda)</span>
                          </button>
                        )}

                        {(record.status === 'collected_from_hotel' || record.status === 'in_transit') && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(record.id, 'delivered_to_hotel')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <span>✅ Otele Teslim Edildi</span>
                          </button>
                        )}

                        {/* WhatsApp Reassurance link */}
                        <a
                          href={getLuggageWhatsAppUrl(
                            record,
                            record.status === 'delivered_to_hotel' ? 'delivered' : 'collected'
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold transition flex items-center gap-1"
                          title="Misafire WhatsApp Durum Bildirimi Gönder"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Bildir</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <span>💡 Valiz teslim edildikten sonra misafire otomatik teslimat teyidi ve bellboy etiket numarası iletilir.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
