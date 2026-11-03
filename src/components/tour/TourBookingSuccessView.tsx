interface TourBookingSuccessViewProps {
  ticketCode: string;
  ticketUrl: string;
  whatsAppUrl: string;
  onOpenPromptPay: () => void;
  onReset: () => void;
}

export default function TourBookingSuccessView({
  ticketCode,
  ticketUrl,
  whatsAppUrl,
  onOpenPromptPay,
  onReset,
}: TourBookingSuccessViewProps) {
  return (
    <div className="space-y-5 py-2 text-center animate-fadeIn">
      <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center text-2xl border border-emerald-500/30">
        ✓
      </div>

      <div>
        <h4 className="text-lg font-bold text-white mb-1">
          Rezervasyon Talebiniz Alındı!
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Talebiniz operasyon sistemimize kaydedildi. Canlı bilet ve transfer takibiniz için referans kodunuz oluşturuldu:
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 inline-block w-full">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
          Misafir Takip & Bilet Kodunuz
        </div>
        <div className="text-2xl font-mono font-black text-amber-400 tracking-wider">
          {ticketCode}
        </div>
        <a
          href={ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-accent hover:underline block pt-1 font-semibold"
        >
          🎟️ Bilet Portalı ve Canlı Alınış Takibini Aç →
        </a>
      </div>

      <div className="pt-2 flex flex-col gap-2.5">
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-2xl bg-whatsapp hover:bg-whatsapp-dark text-white font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>💬</span>
          <span>WhatsApp Görüşmesini Başlat</span>
        </a>

        <button
          type="button"
          onClick={onOpenPromptPay}
          className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>📱</span>
          <span>PromptPay Canlı QR ile Öde</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 underline pt-2 cursor-pointer"
        >
          Yeni Bir Rezervasyon Talebi Oluştur
        </button>
      </div>
    </div>
  );
}
