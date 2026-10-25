import { useState } from 'react';
import { Check, Copy, Printer, Receipt, X } from 'lucide-react';
import { fmtMoney } from '../../../lib/moneyFormat';
import { buildSupplierStatementText } from './statementText';
import type { SettlementItem } from './types';

export interface SettlementStatementModalProps {
  statementSupplier: string;
  statementItems: SettlementItem[];
  statementTotalPax: number;
  statementTotalCost: number;
  dateFilter: string;
  startDate: string;
  endDate: string;
  managerPhone: string;
  onClose: () => void;
}

// TEDARİKÇİ MUTABAKAT FİŞİ MODALI (A4 YAZDIR / WHATSAPP) — birebir taşındı.
// copied durumu bu bileşende tutulur; WhatsApp metni statementText'ten gelir.
export default function SettlementStatementModal({
  statementSupplier,
  statementItems,
  statementTotalPax,
  statementTotalCost,
  dateFilter,
  startDate,
  endDate,
  managerPhone,
  onClose,
}: SettlementStatementModalProps) {
  const [copied, setCopied] = useState<boolean>(false);

  // Tedarikçiye WhatsApp Mutabakat Mesajı Kopyalama (İngilizce / Tayca format)
  const handleCopySupplierWhatsApp = () => {
    const text = buildSupplierStatementText({
      statementSupplier,
      statementItems,
      statementTotalPax,
      statementTotalCost,
      dateFilter,
      startDate,
      endDate,
      managerPhone,
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none max-h-[95vh] flex flex-col">
        {/* Modal Kontrol Çubuğu (Yazdırmada Gizli) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="font-bold text-sm leading-tight">
                Tedarikçi Mutabakat Fişi (Supplier Statement)
              </h4>
              <p className="text-[11px] text-slate-400">
                Firma: <span className="font-bold text-white">{statementSupplier}</span> · Toplam {statementTotalPax} PAX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySupplierWhatsApp}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp Metni Kopyala</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 Yazdır / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* A4 Yazdırılabilir Belge Gövdesi */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-white" id="supplierStatementDoc">
          {/* Belge Başlığı */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl font-serif">
                🇹🇭
              </div>
              <div>
                <h1 className="font-serif font-black text-lg sm:text-xl text-slate-950 tracking-tight">
                  TOUR OPERATOR SETTLEMENT & RECONCILIATION STATEMENT
                </h1>
                <p className="text-xs font-bold text-slate-600 tracking-wider uppercase">
                  OFFICIAL PAYMENT STATEMENT FOR INBOUND SERVICES
                </p>
                <p className="text-[10px] text-slate-500">
                  Phuket Tatili Co., Ltd. · Licensed Inbound DMC · TAT License No: 34/02819
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs">
              <div className="font-bold text-slate-900">
                Tarih: <span className="font-mono text-base">{new Date().toISOString().split('T')[0]}</span>
              </div>
              <div className="text-slate-600">
                Ref: <span className="font-mono font-bold">PT-SETTLE-{new Date().getTime().toString().slice(-6)}</span>
              </div>
            </div>
          </div>

          {/* Tedarikçi Bilgi Şeridi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tedarikçi Firma</span>
              <span className="font-bold text-slate-900 truncate block text-sm">{statementSupplier}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Toplam Hizmet</span>
              <span className="font-bold text-slate-900 block">{statementItems.length} Tur Kaydı</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Yolcu Sayısı</span>
              <span className="font-bold text-emerald-800 block">{statementTotalPax} PAX</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Toplam Ödenecek</span>
              <span className="font-black text-rose-700 block text-sm font-mono">
                {fmtMoney(statementTotalCost)} THB
              </span>
            </div>
          </div>

          {/* Kalem Kalem Mutabakat Tablosu */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-700">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Tur Tarihi</th>
                  <th className="py-2.5 px-3">Misafir Adı</th>
                  <th className="py-2.5 px-3">Tur Başlığı</th>
                  <th className="py-2.5 px-3 text-center">PAX</th>
                  <th className="py-2.5 px-3 text-right">Birim Hakediş</th>
                  <th className="py-2.5 px-3 text-right">Toplam Tutar (THB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {statementItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono font-medium">{item.tourDate}</td>
                    <td className="py-2 px-3 font-bold">{item.customerName}</td>
                    <td className="py-2 px-3 text-slate-700">{item.tourTitle}</td>
                    <td className="py-2 px-3 text-center font-bold font-mono">{item.totalPax}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">
                      {item.totalPax > 0 ? fmtMoney(Math.round(item.costThb / item.totalPax)) : item.costThb} ฿
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-black text-slate-900">
                      {fmtMoney(item.costThb)} ฿
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-900 font-bold">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right uppercase text-xs">
                    Genel Toplam Hakediş Tutarı:
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-sm">
                    {statementTotalPax}
                  </td>
                  <td></td>
                  <td className="py-3 px-3 text-right font-mono font-black text-base text-rose-700">
                    {fmtMoney(statementTotalCost)} THB
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Kaşe & İmza Alanı */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-xs border-t border-slate-200">
            <div>
              <span className="font-bold text-slate-900 block">Hazırlayan (DMC Operasyon):</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Phuket Tatili Co., Ltd.</span>
              <div className="h-16 border-b border-dashed border-slate-300 mt-4"></div>
              <span className="text-[10px] text-slate-400 block mt-1">İmza & Kaşe</span>
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Tedarikçi Onayı:</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">{statementSupplier}</span>
              <div className="h-16 border-b border-dashed border-slate-300 mt-4"></div>
              <span className="text-[10px] text-slate-400 block mt-1">Teslim Alan / Kaşe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
