import React from 'react';
import { Copy, Check, Send } from 'lucide-react';
import { CANNED_RESPONSES, type CannedResponseItem } from './cannedResponses';

export interface WhatsAppQuickRepliesProps {
  copiedId: string | null;
  onCopyText: (text: string, id: string) => void;
}

export function WhatsAppQuickReplies({
  copiedId,
  onCopyText,
}: WhatsAppQuickRepliesProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Saha & Müşteri Temsilcisi Hızlı Yanıt Kütüphanesi
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            WhatsApp'ta misafirlere en sık iletilen bilgileri tek tıkla kopyalayın veya doğrudan WhatsApp'ta açın.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {CANNED_RESPONSES.map((item: CannedResponseItem) => (
          <div
            key={item.id}
            className="bg-white dark:bg-surface-2 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {item.badge}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onCopyText(item.text, item.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Metni Kopyala</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(item.text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-whatsapp hover:bg-whatsapp-dark text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>WhatsApp'a Aktar</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#efeae2] dark:bg-[#0b141a] border border-[#d1d7db] dark:border-[#222e35]">
              <pre className="font-sans text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed select-all">
                {item.text}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
