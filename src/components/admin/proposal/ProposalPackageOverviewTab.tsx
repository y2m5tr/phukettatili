import React from 'react';
import { Phone, Mail, Hotel, Plus, Trash2 } from 'lucide-react';
import type {
  CuratedProposalData,
  CuratedProposalHotelStay,
} from '../../../lib/curatedProposal';
import type { TravelStyle, PackageDuration } from '../../../lib/holidayPlanner';
import { HOTEL_ZONES } from '../../../data/adminInitialData';

export interface ProposalPackageOverviewTabProps {
  proposal: CuratedProposalData;
  setProposal: React.Dispatch<React.SetStateAction<CuratedProposalData>>;
  proposalHotels: CuratedProposalHotelStay[];
  handleApplyPreset: (style: TravelStyle, duration: PackageDuration) => void;
  handleApplyBlank: () => void;
  handleAddProposalHotel: () => void;
  handleUpdateProposalHotel: (hotelId: string, patch: Partial<CuratedProposalHotelStay>) => void;
  handleRemoveProposalHotel: (hotelId: string) => void;
  setSendPhone: (val: string) => void;
  setSendEmail: (val: string) => void;
}

export function ProposalPackageOverviewTab({
  proposal,
  setProposal,
  proposalHotels,
  handleApplyPreset,
  handleApplyBlank,
  handleAddProposalHotel,
  handleUpdateProposalHotel,
  handleRemoveProposalHotel,
  setSendPhone,
  setSendEmail,
}: ProposalPackageOverviewTabProps) {
  return (
    <div className="space-y-4">
      {/* Hızlı Şablonlar */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
          Hızlı Paket Şablonları:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('honeymoon', 5)}
            className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all text-xs cursor-pointer"
          >
            <span className="font-bold text-slate-900 dark:text-white block">💑 5G Balayı Rüyası</span>
            <span className="text-[10px] text-slate-500">Romantik & Konfor</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('vip_luxury', 5)}
            className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-xs cursor-pointer"
          >
            <span className="font-bold text-slate-900 dark:text-white block">👑 5G VIP Özel Yat</span>
            <span className="text-[10px] text-slate-500">Lüks Katamaran & Araç</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('family', 5)}
            className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-xs cursor-pointer"
          >
            <span className="font-bold text-slate-900 dark:text-white block">👨‍👩‍👧‍👦 5G Aile Paketi</span>
            <span className="text-[10px] text-slate-500">Güvenli & Çocuk Dostu</span>
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('adventure', 3)}
            className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs cursor-pointer"
          >
            <span className="font-bold text-slate-900 dark:text-white block">⚡ 3G Doğa & Macera</span>
            <span className="text-[10px] text-slate-500">Zipline & Kano</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleApplyBlank}
          className="w-full mt-2 py-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
        >
          ✏️ Sıfırdan Boş Özel Program Oluştur
        </button>
      </div>

      {/* Misafir Detayları */}
      <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Misafir Adı / Hitap:
          </label>
          <input
            type="text"
            value={proposal.customerName}
            onChange={(e) => setProposal({ ...proposal, customerName: e.target.value })}
            placeholder="Örn: Begüm & Canberk Özkan"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1 text-[11px]">
              <Phone className="w-3 h-3 text-emerald-500" />
              <span>Telefon (WhatsApp):</span>
            </label>
            <input
              type="text"
              value={proposal.customerPhone || ''}
              onChange={(e) => {
                const val = e.target.value;
                setProposal((prev) => ({ ...prev, customerPhone: val }));
                setSendPhone(val);
              }}
              placeholder="Örn: +90 532 123 4567"
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1 text-[11px]">
              <Mail className="w-3 h-3 text-sky-500" />
              <span>E-posta:</span>
            </label>
            <input
              type="email"
              value={proposal.customerEmail || ''}
              onChange={(e) => {
                const val = e.target.value;
                setProposal((prev) => ({ ...prev, customerEmail: val }));
                setSendEmail(val);
              }}
              placeholder="Örn: misafir@gmail.com"
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
            />
          </div>
        </div>

        {/* Konaklama Otelleri (Çoklu Otel Destekli) */}
        <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
              <Hotel className="w-3.5 h-3.5 text-amber-500" />
              <span>Konaklama Oteli / Otelleri ({proposalHotels.length})</span>
            </label>
            <button
              type="button"
              onClick={handleAddProposalHotel}
              className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Başka Otel Ekle</span>
            </button>
          </div>

          <div className="space-y-2">
            {proposalHotels.map((h, hIdx) => (
              <div
                key={h.id || hIdx}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    #{hIdx + 1} {hIdx === 0 ? 'Ana Konaklama' : `${hIdx + 1}. Otel`}
                  </span>
                  {proposalHotels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProposalHotel(h.id)}
                      className="text-slate-400 hover:text-rose-500 p-0.5 text-xs transition cursor-pointer"
                      title="Bu oteli kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                      Otel Adı *
                    </label>
                    <input
                      type="text"
                      value={h.hotelName}
                      onChange={(e) =>
                        handleUpdateProposalHotel(h.id, { hotelName: e.target.value })
                      }
                      placeholder="Örn: The Shore at Katathani"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                      Bölge *
                    </label>
                    <select
                      value={h.hotelZone || 'Patong & Kalim'}
                      onChange={(e) =>
                        handleUpdateProposalHotel(h.id, { hotelZone: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
                    >
                      {HOTEL_ZONES.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="text-slate-500 block mb-0.5">Tarih Aralığı (Opsiyonel):</label>
                    <input
                      type="text"
                      value={h.notes || (h.checkInDate && h.checkOutDate ? `${h.checkInDate} - ${h.checkOutDate}` : '')}
                      onChange={(e) => handleUpdateProposalHotel(h.id, { notes: e.target.value })}
                      placeholder="Örn: 20-23 Ekim (3 Gece)"
                      className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 block mb-0.5">Oda Tipi / Not:</label>
                    <input
                      type="text"
                      value={h.roomType || ''}
                      onChange={(e) => handleUpdateProposalHotel(h.id, { roomType: e.target.value })}
                      placeholder="Örn: Seaview Pool Villa"
                      className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Yetişkin Sayısı:
            </label>
            <input
              type="number"
              min={1}
              value={proposal.adultCount}
              onChange={(e) => setProposal({ ...proposal, adultCount: Math.max(1, parseInt(e.target.value) || 1) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Çocuk Sayısı:
            </label>
            <input
              type="number"
              min={0}
              value={proposal.childCount}
              onChange={(e) => setProposal({ ...proposal, childCount: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Paket Başlığı:
          </label>
          <input
            type="text"
            value={proposal.packageTitle}
            onChange={(e) => setProposal({ ...proposal, packageTitle: e.target.value })}
            placeholder="Örn: 5 Günlük Klasik Balayı & Ada Rüyası"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Özel Karşılama Mektubu / Notu:
          </label>
          <textarea
            rows={3}
            value={proposal.welcomeMessage || ''}
            onChange={(e) => setProposal({ ...proposal, welcomeMessage: e.target.value })}
            placeholder="Misafire hitaben yazılan özel tatil karşılama mesajı..."
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
          />
        </div>

        {/* Danışman Bilgileri */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
            👨‍💼 Teklifi Hazırlayan Danışman:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={proposal.agentInfo.name}
              onChange={(e) =>
                setProposal({
                  ...proposal,
                  agentInfo: { ...proposal.agentInfo, name: e.target.value },
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-white dark:bg-slate-900 text-xs font-bold"
            />
            <input
              type="text"
              value={proposal.agentInfo.phone}
              onChange={(e) =>
                setProposal({
                  ...proposal,
                  agentInfo: { ...proposal.agentInfo, phone: e.target.value },
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-white dark:bg-slate-900 text-xs font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
