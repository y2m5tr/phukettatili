/**
 * WhatsApp Şablon Merkezi sekmesi — AdminDashboard'tan ayrıldı.
 * Tamamen statik içerik: dışarıdan prop almaz.
 */
import { MessageCircle } from 'lucide-react';

export default function WhatsAppTab() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-[#25D366]/10 text-[#25D366]">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              WhatsApp Otomatik Şablon Merkezi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Misafirlerinize tur öncesi ve sonrası gönderebileceğiniz profesyonel Türkçe mesaj şablonları
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>1. Tur Öncesi Otel Alınış Hatırlatması</span>
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed border border-slate-100 dark:border-slate-800">
              {`Merhaba [İsim] Bey/Hanım! 🌴 Phuket Tatili ekibinden yazıyoruz.

📅 Yarınki turunuz: [Tur Adı]
⏰ Otelden Alınış Saati: [07:30]
📍 Otel: [Otel Adı] (Oda: [304])
👥 Kişi Sayısı: [2 Yetişkin]
💰 Kalan Ödeme: [4.000 THB]

Lütfen belirtilen saatte otelinizin ana lobisinde hazır bulununuz. Harika bir gün dileriz! 🇹🇭`}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            👉 Müşteriler sekmesindeki her satırın yanındaki yeşil WhatsApp butonuna basınca bu mesaj otomatik dolar.
          </p>
        </div>

        <div className="bg-white dark:bg-surface-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>2. Tur Sonrası Yorum & Memnuniyet Talebi</span>
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed border border-slate-100 dark:border-slate-800">
              {`Merhaba [İsim] Bey/Hanım! Umarız bugünkü turunuz harika geçmiştir. 🏝️✨

Sizlerin memnuniyeti bizim için çok değerli. Deneyiminizi birkaç cümleyle değerlendirmek ister misiniz?

Görüşlerinizi web sitemizde ve Google haritalarda diğer Türk tatilcilerle paylaşmaktan mutluluk duyarız. İyi tatiller! 🙏`}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            👉 Tur bittikten sonra misafirden Google yorumu almak için idealdir.
          </p>
        </div>
      </div>
    </div>
  );
}
