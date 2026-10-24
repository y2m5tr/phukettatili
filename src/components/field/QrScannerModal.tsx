import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  AlertTriangle,
  Flashlight,
  Search,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (bookingId: string, tourIndex: number) => void;
}

export default function QrScannerModal({ isOpen, onClose, onScanResult }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraError, setHasCameraError] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Sesli Geribildirim (Web Audio API Synthesizer)
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }

    try {
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // ignore
    }
  };

  // Kamerayı Başlat
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    setHasCameraError(false);
    setCameraErrorMessage('');
    setIsProcessing(false);

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Tarayıcınız kamera erişimini desteklemiyor.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          requestScanFrame();
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        const msg = err instanceof Error ? err.message : 'Kamera açılamadı.';
        setHasCameraError(true);
        setCameraErrorMessage(msg);
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  // Kareleri jsQR ile tara
  const requestScanFrame = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    const scan = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleParsedQr(code.data);
            return;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(scan);
    };

    animationFrameId.current = requestAnimationFrame(scan);
  };

  // QR Kod Çözümleyici
  const handleParsedQr = (rawData: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    let bookingId = '';
    let tourIndex = 0;

    // Format 1: PT-VOUCHER:BK-1001:0
    if (rawData.startsWith('PT-VOUCHER:')) {
      const parts = rawData.split(':');
      bookingId = parts[1] || '';
      tourIndex = parts[2] ? parseInt(parts[2], 10) : 0;
    } else if (rawData.includes('BK-')) {
      // Format 2: İçinde BK-1001 geçen serbest metin veya URL
      const match = rawData.match(/BK-\d+/i);
      if (match) bookingId = match[0].toUpperCase();
    } else {
      bookingId = rawData.trim();
    }

    if (bookingId) {
      playBeep();
      setScanFeedback(`✅ Biniş Kodu Algılandı: ${bookingId}`);
      setTimeout(() => {
        onScanResult(bookingId, tourIndex);
        onClose();
      }, 700);
    } else {
      setIsProcessing(false);
      requestScanFrame();
    }
  };

  // Flaş Işığı Aç/Kapat (Torch)
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = track.getCapabilities?.() as { torch?: boolean };
        if (capabilities && capabilities.torch) {
          const next = !torchOn;
          await track.applyConstraints({
            advanced: [{ torch: next } as unknown as MediaTrackConstraintSet],
          });
          setTorchOn(next);
        } else {
          alert('Bu cihazda el feneri (flaş) donanımı desteklenmiyor.');
        }
      } catch {
        alert('Flaş kontrolü yapılamadı.');
      }
    }
  };

  // Manuel Kod Girişi
  const handleManualSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleParsedQr(manualCode.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 max-w-md mx-auto">
      {/* Üst Bar */}
      <div className="flex items-center justify-between z-10 pt-2 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">QR Biniş Kartı Tarayıcı</h3>
            <p className="text-[11px] text-slate-400">Yolcunun telefonundaki QR kodu okutun</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasCameraError && (
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-xl border transition-all ${
                torchOn
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
              title="Feneri Aç / Kapat"
            >
              <Flashlight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Orta Kamera Alanı */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-4 overflow-hidden rounded-3xl bg-slate-900 border border-slate-800">
        {!hasCameraError ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Hedef Vizör Çerçevesi */}
            <div className="relative z-10 w-64 h-64 border-2 border-amber-400/80 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
              {/* Köşe Vurguları */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

              {/* Kayan Kırmızı / Altın Lazer Çizgisi */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#fbbf24] animate-pulse" />

              {scanFeedback ? (
                <div className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl font-bold text-xs shadow-lg animate-in zoom-in-95">
                  {scanFeedback}
                </div>
              ) : (
                <p className="text-[11px] text-white/80 font-medium px-4 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md">
                  QR Kodu Çerçeveye Hizalayın
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center p-6 space-y-3">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Kamera Erişimi Sağlanamadı</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              {cameraErrorMessage || 'Lütfen tarayıcı ayarlarından kamera iznini onaylayınız veya kodu alttan elle giriniz.'}
            </p>
          </div>
        )}
      </div>

      {/* Alt Bölüm: Manuel Rezervasyon No Girişi */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
        <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
          <Search className="w-3 h-3 text-amber-400" />
          Kamera Açılmıyorsa Rezervasyon No Girin
        </span>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Örn: BK-1001"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 active:scale-95 transition-all"
          >
            Doğrula
          </button>
        </form>
      </div>
    </div>
  );
}
