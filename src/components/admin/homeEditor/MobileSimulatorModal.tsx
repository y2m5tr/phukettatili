import { ExternalLink, RefreshCw, X } from 'lucide-react';

export interface MobileSimulatorModalProps {
  previewKey: number;
  onReload: () => void;
  onClose: () => void;
}

// Canlı Mobil Cihaz Simülatörü Modalı (iPhone çerçevesi içinde anasayfa iframe)
export default function MobileSimulatorModal({ previewKey, onReload, onClose }: MobileSimulatorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative flex flex-col items-center">
        {/* Üst Kontrol Çubuğu */}
        <div className="w-full max-w-[400px] flex items-center justify-between mb-3 px-2 text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wide">iPhone 15 Pro Simülatörü</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReload}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Yeniden Yükle"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Yeni Sekmede Aç"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition cursor-pointer ml-1"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iPhone Kasa Çerçevesi */}
        <div className="relative w-[375px] h-[750px] bg-slate-950 rounded-[55px] p-3.5 shadow-2xl border-[5px] border-slate-700/80 ring-1 ring-white/20 flex flex-col overflow-hidden">
          {/* Dynamic Island / Ahize */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-end pr-2.5 pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
          </div>

          {/* Ekran Alanı (Iframe) */}
          <div className="w-full h-full rounded-[42px] overflow-hidden bg-slate-900 relative">
            <iframe
              key={previewKey}
              src="/"
              title="Anasayfa Canlı Önizleme"
              className="w-full h-full border-0 select-none"
            />
          </div>

          {/* Alt Home Çizgisi */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/50 rounded-full pointer-events-none z-30" />
        </div>
      </div>
    </div>
  );
}
