import React from 'react';
import { AlertTriangle, Heart, MessageCircle, Star } from 'lucide-react';
import { DEFAULT_GOOGLE_REVIEW_URL } from '../../lib/reviewBooster';
import type { GuestBookingView } from './guestPortalTypes';

interface GuestReviewBoosterCardProps {
  booking: GuestBookingView;
  cleanManagerPhone: string;
  reviewRating: number | null;
  setReviewRating: React.Dispatch<React.SetStateAction<number | null>>;
  reviewFeedback: string;
  setReviewFeedback: React.Dispatch<React.SetStateAction<string>>;
}

export const GuestReviewBoosterCard: React.FC<GuestReviewBoosterCardProps> = ({
  booking,
  cleanManagerPhone,
  reviewRating,
  setReviewRating,
  reviewFeedback,
  setReviewFeedback,
}) => {
  return (
    <div id="degerlendir" className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 scroll-mt-6">
      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
        <span>Gününüz Nasıl Geçti? (Tur Değerlendirmesi)</span>
      </div>

      <p className="text-xs text-slate-300">
        {booking.tourTitle} turumuzun ve saha ekibimizin hizmetini değerlendirin:
      </p>

      {/* 1 - 5 Yıldız Seçimi */}
      <div className="flex items-center justify-center gap-3 py-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewRating(star)}
            className={`p-2 sm:p-3 rounded-2xl transition-all transform active:scale-90 ${
              reviewRating !== null && reviewRating >= star
                ? 'bg-amber-400/20 text-amber-400 scale-105'
                : 'bg-slate-950 text-slate-600 hover:text-slate-400 hover:bg-slate-800'
            }`}
            title={`${star} Yıldız`}
          >
            <Star
              className={`w-7 h-7 sm:w-8 sm:h-8 ${
                reviewRating !== null && reviewRating >= star ? 'fill-amber-400' : ''
              }`}
            />
          </button>
        ))}
      </div>

      {/* 4 veya 5 Yıldız: Doğrudan Google Haritalara Yönlendir */}
      {reviewRating !== null && reviewRating >= 4 && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 mb-1">
            <Heart className="w-5 h-5 fill-emerald-400" />
          </div>
          <h4 className="text-sm font-bold text-white">Harika Bir Gün Geçirmenize Çok Sevindik! 🎉</h4>
          <p className="text-xs text-slate-300">
            Ekibimize ve rehberlerimize moral olması, yeni gelecek Türk gezginlere rehberlik etmesi için 1 dakikanızı ayırıp Google Haritalar profilimizde 5 yıldızla değerlendirmek ister misiniz?
          </p>
          <a
            href={DEFAULT_GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
          >
            <Star className="w-4 h-4 fill-slate-950" />
            <span>Google'da 5 Yıldızla Değerlendir (Tek Tıkla)</span>
          </a>
        </div>
      )}

      {/* 1, 2 veya 3 Yıldız: İtibar Filtresi — Google Yerine Ofis Yöneticisine Yönlendir */}
      {reviewRating !== null && reviewRating < 4 && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>Bir Aksaklık Yaşadığınız İçin Çok Üzgünüz</span>
          </div>
          <p className="text-xs text-slate-300">
            Memnuniyetiniz bizim için her şeyden önemli. Yaşadığınız sorunu lütfen aşağıya yazınız; Genel Koordinatörümüz derhal sizinle iletişime geçip telafi edecektir:
          </p>
          <textarea
            value={reviewFeedback}
            onChange={(e) => setReviewFeedback(e.target.value)}
            rows={2}
            placeholder="Örn: Transfer aracı gecikti / teknede yemek yetersizdi..."
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
          <a
            href={`https://wa.me/${cleanManagerPhone}?text=${encodeURIComponent(
              `🚨 *MİSAFİR GERİ BİLDİRİMİ / ŞİKAYET* 🚨\n\n👤 Misafir: ${booking.customerName}\n🏨 Otel: ${booking.hotel}\n🏝️ Tur: ${booking.tourTitle}\n⭐ Puan: ${reviewRating}/5 Yıldız\n\n📝 Geri Bildirim: "${reviewFeedback || 'Açıklama belirtilmedi'}"\n\nLütfen en kısa sürede iletişime geçiniz.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Genel Koordinatöre Özel WhatsApp Gönder</span>
          </a>
        </div>
      )}
    </div>
  );
};
