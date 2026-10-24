import React from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Phone,
  Trash2,
  CheckCircle2,
  MessageCircle,
  Share2,
  Save,
  FolderOpen,
  Eye,
  Send,
  Mail,
  Minimize2,
} from 'lucide-react';
import {
  convertProposalToBookingFormData,
  type CuratedProposalData,
  type ProposalFinancials,
} from '../../../lib/curatedProposal';
import { fmtMoney } from '../../../lib/moneyFormat';
import type { SavedProposalItem } from './proposalStorageUtils';

export interface ProposalTopToolbarProps {
  proposal: CuratedProposalData;
  financials: ProposalFinancials;
  isSingleTour: boolean;
  isPreviewMode: boolean;
  setIsPreviewMode: (val: boolean) => void;
  copied: boolean;
  savedProposals: SavedProposalItem[];
  showSavedModal: boolean;
  setShowSavedModal: (val: boolean) => void;
  showSendModal: boolean;
  setShowSendModal: (val: boolean) => void;
  sendPhone: string;
  setSendPhone: (val: string) => void;
  sendEmail: string;
  setSendEmail: (val: string) => void;
  handleSaveProposal: () => void;
  handleLoadSavedProposal: (item: SavedProposalItem) => void;
  handleDeleteSavedProposal: (id: string, e: React.MouseEvent) => void;
  handlePrint: () => void;
  handleCopyWhatsApp: () => void;
  handleDirectWhatsAppSend: (targetPhone?: string) => void;
  handleEmailSend: (targetEmail?: string) => void;
  handleNativeShare: () => void;
  onClose?: () => void;
  onConvertToBooking?: (bookingData: any) => void;
}

export function ProposalTopToolbar({
  proposal,
  financials,
  isSingleTour,
  isPreviewMode,
  setIsPreviewMode,
  copied,
  savedProposals,
  showSavedModal,
  setShowSavedModal,
  showSendModal,
  setShowSendModal,
  sendPhone,
  setSendPhone,
  sendEmail,
  setSendEmail,
  handleSaveProposal,
  handleLoadSavedProposal,
  handleDeleteSavedProposal,
  handlePrint,
  handleCopyWhatsApp,
  handleDirectWhatsAppSend,
  handleEmailSend,
  handleNativeShare,
  onClose,
  onConvertToBooking,
}: ProposalTopToolbarProps) {
  return (
    <>
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden bg-slate-50 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-500 flex items-center justify-center shadow-inner">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 id="curated-proposal-modal-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Teklifler · Özel Tur & Paket Teklif Stüdyosu</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {isSingleTour ? '🎯 Tekli VIP Tur' : '🌟 Çok Günlü Paket'}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                A4 Kurumsal · Multi-Currency
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kişiye özel çok günlü tatil paketi veya tekli VIP tur teklifleri hazırlayın, saatlik tur akışı belirleyin ve anında paylaşın.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveProposal}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Teklifi tarayıcı hafızasına kaydet"
          >
            <Save className="w-4 h-4 text-amber-600" />
            <span>Kaydet</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSavedModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Kayıtlı teklifleri görüntüle ve geri yükle"
          >
            <FolderOpen className="w-4 h-4 text-sky-500" />
            <span>Kayıtlılar ({savedProposals.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPreviewMode
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title={isPreviewMode ? 'Düzenleme paneline geri dön' : 'Sol paneli gizle ve A4 teklif belgesini tam sayfa görüntüle'}
          >
            {isPreviewMode ? <Minimize2 className="w-4 h-4" /> : <Eye className="w-4 h-4 text-sky-500" />}
            <span>{isPreviewMode ? '✏️ Düzenleyiciye Dön' : '👁️ PDF Görüntüle'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
            title="A4 PDF indir veya yazıcıya gönder"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ A4 PDF İndir</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSendPhone(proposal.customerPhone || '');
              setSendEmail(proposal.customerEmail || '');
              setShowSendModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
            title="Misafire WhatsApp, E-posta veya sistem paylaşımı ile teklifi yolla"
          >
            <Send className="w-4 h-4" />
            <span>📤 PDF Yolla</span>
          </button>

          {onConvertToBooking && (
            <button
              type="button"
              onClick={() => {
                const converted = convertProposalToBookingFormData(proposal);
                onConvertToBooking(converted);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              title="Teklifi doğrudan yeni rezervasyon formuna aktar ve rezervasyon modalını aç"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>⚡ Rezervasyona Dönüştür</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="hidden sm:flex px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold items-center gap-1.5 transition-all cursor-pointer"
            title="WhatsApp teklif özetini panoya kopyala"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Kopyalandı!' : 'Metni Kopyala'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Kapat"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Kayıtlı Teklifler Modalı */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-sky-500" />
                <span>Kayıtlı Teklif Arşivi ({savedProposals.length})</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {savedProposals.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Henüz kaydedilmiş bir teklif bulunmuyor. Düzenleme yaptıktan sonra üst bardaki "Kaydet" butonuyla saklayabilirsiniz.
                </div>
              ) : (
                savedProposals.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadSavedProposal(item)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-amber-500/5 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400">
                          {item.proposalType === 'single_tour' ? '🎯 Tekli' : '🌟 Paket'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {item.customerName} · {item.savedAt}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSavedProposal(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0 cursor-pointer"
                      title="Bu teklifi sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paylaşım Modalı */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Teklif & PDF Paylaşım Merkezi
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {proposal.proposalNumber} · {proposal.customerName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {proposal.packageTitle}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {proposal.adultCount} Yetişkin {proposal.childCount > 0 ? `+ ${proposal.childCount} Çocuk` : ''} · {isSingleTour ? 'Tek Tur' : `${proposal.days.length} Günlük Paket`}
                </span>
              </div>
              <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                {fmtMoney(financials.totalThb)} THB
              </span>
            </div>

            <div className="space-y-4">
              {/* WhatsApp ile Gönder */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>1. WhatsApp ile Direkt Gönder:</span>
                  </label>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">En Hızlı</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sendPhone}
                    onChange={(e) => setSendPhone(e.target.value)}
                    placeholder="Örn: +90 532 123 4567 veya 082..."
                    className="flex-1 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleDirectWhatsAppSend()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Gönder</span>
                  </button>
                </div>
              </div>

              {/* E-posta ile Gönder */}
              <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-sky-950 dark:text-sky-300 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-sky-600" />
                    <span>2. E-posta ile Gönder:</span>
                  </label>
                  <span className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold">Kurumsal</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    placeholder="Örn: misafir@gmail.com"
                    className="flex-1 px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleEmailSend()}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20 cursor-pointer shrink-0"
                  >
                    <Mail className="w-4 h-4" />
                    <span>E-posta Aç</span>
                  </button>
                </div>
              </div>

              {/* Cihaz Paylaşımı & Panoya Kopyalama */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Share2 className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Cihaz Paylaşımı</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    AirDrop, Telegram veya Diğer Uygulamalar
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-emerald-500" />}
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {copied ? 'Kopyalandı!' : 'Metni Kopyala'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    Teklif metnini panoya kopyalayıp dilediğiniz yere yapıştırın
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
