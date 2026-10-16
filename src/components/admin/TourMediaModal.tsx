import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Send,
  MessageCircle,
  FolderPlus,
  Sparkles,
  Camera,
} from 'lucide-react';
import {
  generateMediaVaultUrl,
  generateMediaVaultWhatsApp,
  getMediaVaultWhatsAppUrl,
  DEFAULT_INSTAGRAM_HANDLE,
} from '../../lib/tourMediaVault';
import type { Booking } from '../../data/adminInitialData';

interface TourMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings?: Booking[];
  initialBooking?: Booking | null;
  showToast: (msg: string) => void;
}

export default function TourMediaModal({
  isOpen,
  onClose,
  bookings = [],
  initialBooking,
  showToast,
}: TourMediaModalProps) {
  if (!isOpen) return null;

  const [selectedBookingId, setSelectedBookingId] = useState<string>(initialBooking?.id || bookings[0]?.id || '');
  const [cloudAlbumUrl, setCloudAlbumUrl] = useState<string>('https://drive.google.com/drive/folders/demo-phuket-tatili');
  const [copied, setCopied] = useState<boolean>(false);

  const activeBooking = bookings.find((b) => b.id === selectedBookingId) || initialBooking;
  const guestName = activeBooking?.customerName || 'Misafirimiz';
  const tourTitle = activeBooking?.tourTitle || 'Phi Phi Adaları Sürat Teknesi Turu';
  const phone = activeBooking?.phone || '';

  const vaultPath = generateMediaVaultUrl(activeBooking?.ticketCode || activeBooking?.id || 'demo');
  const vaultFullUrl = typeof window !== 'undefined' ? `${window.location.origin}${vaultPath}` : `https://phukettatili.com${vaultPath}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(vaultFullUrl);
    setCopied(true);
    showToast('Fotoğraf portal linki panoya kopyalandı! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWhatsApp = () => {
    const text = generateMediaVaultWhatsApp(guestName, tourTitle, vaultPath, cloudAlbumUrl);
    navigator.clipboard.writeText(text);
    showToast('Misafir WhatsApp fotoğraf bildirim metni kopyalandı! 📋');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Misafir Fotoğraf & Video Teslim Masası</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                  Media Vault
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Tur fotoğraflarını Google Drive linkiyle misafirin dijital kütüphanesine bağlayın ve WhatsApp'la iletin.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">
              Rezervasyon & Misafir Seçimi
            </label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.customerName} - {b.tourTitle} ({b.tourDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">
              Bulut Albüm Linki (Google Drive / iCloud / Dropbox)
            </label>
            <div className="relative">
              <input
                type="url"
                value={cloudAlbumUrl}
                onChange={(e) => setCloudAlbumUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Rehberinizin veya fotoğrafçınızın yüklediği Google Drive albüm linkini buraya yapıştırın.
            </p>
          </div>

          {/* Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Misafirin Göreceği Sayfa
            </span>
            <div className="flex items-center justify-between text-xs">
              <div className="truncate max-w-[320px]">
                <strong className="text-white block">{guestName}</strong>
                <span className="text-slate-400 truncate block">🏝️ {tourTitle}</span>
              </div>
              <a
                href={vaultPath}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 transition"
              >
                <span>Önizle</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Kopyalandı' : 'Fotoğraf Linkini Kopyala'}</span>
          </button>

          <div className="flex items-center gap-2">
            {phone ? (
              <a
                href={getMediaVaultWhatsAppUrl(phone, guestName, tourTitle, vaultPath, cloudAlbumUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Misafire WhatsApp'la Gönder</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>WhatsApp Metnini Kopyala</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
