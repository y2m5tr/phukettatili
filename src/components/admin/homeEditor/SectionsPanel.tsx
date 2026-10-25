import { Eye } from 'lucide-react';
import type { HomeEditorPanelProps } from './types';

// SEKME 1: BÖLÜM GÖRÜNÜRLÜK YÖNETİCİSİ (MASTER SWITCHER)
export default function SectionsPanel({ homeSettings, setHomeSettings }: HomeEditorPanelProps) {
  const sections = homeSettings?.sections || {};

  const toggleSection = (key: string) => {
    const nextVal = sections[key] === false ? true : false;
    setHomeSettings((prev: any) => ({
      ...prev,
      sections: {
        ...(prev.sections || {}),
        [key]: nextVal,
      },
    }));
  };

  return (
    <div className="bg-white dark:bg-surface-2 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-brand-accent" />
          <span>Anasayfa Bölüm Görünürlük Anahtarları</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          İstediğiniz bölümü tek tıkla gizleyebilir veya yayına alabilirsiniz. Gizlenen bölümler anasayfada hiç yüklenmez.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 'topBar' burada BİLİNÇLİ olarak yok: üst duyuru barı Settings
            sekmesindeki topBarEnabled ile yönetilir (TopAnnouncementBar
            site.json'u okur). Buradaki anahtar hiçbir sayfaya bağlı
            değildi ve iki yerden yönetiliyor izlenimi veriyordu. */}
        {[
          { key: 'hero', label: 'Hero Karşılama Alanı', desc: 'Büyük başlık, slider görselleri ve çağrı butonları', icon: '🖼️' },
          { key: 'quickSearch', label: 'Hızlı Tur Arama & Filtre', desc: 'Hero altındaki kategori, süre ve tarz arama çubuğu', icon: '🔍' },
          { key: 'trustBadges', label: '4 Güven & Kalite Rozeti', desc: 'Türkçe rehberlik, TAT lisansı, 4.9/5 puan rozetleri', icon: '🛡️' },
          { key: 'stories', label: 'Tur Hikayeleri (Stories Reel)', desc: 'Instagram formatında yuvarlak ada hikaye daireleri', icon: '📱' },
          { key: 'marineRadar', label: 'Canlı Deniz Güvenlik Radarı', desc: 'Dalga boyu, meteoroloji ve günlük ada güvenlik paneli', icon: '🌊' },
          { key: 'bentoGrid', label: 'Deneyimler Bento Grid', desc: 'Ada turları, VIP yat, fil koruma ve macera rotaları', icon: '🍱' },
          { key: 'featuredTours', label: 'Öne Çıkan Rotalar Vitrini', desc: 'En çok tercih edilen 3 popüler turun kartları', icon: '⭐' },
          { key: 'holidayAssistant', label: 'Akıllı Tatil & Tur Asistanı', desc: 'Çok günlü paket planlayıcı ve hızlı tur sihirbazı', icon: '🌴' },
          { key: 'videoShowcase', label: 'Tanıtım Filmi & Video', desc: 'Phuket tanıtım videosu ve oynatıcı kapak kartı', icon: '🎬' },
          { key: 'marquee', label: 'Kayan Slogan Bandı', desc: 'Hızlı güven rozetleri ve avantajlar kayan şeridi', icon: '🏷️' },
          { key: 'whyUs', label: 'Neden Phuket Tatili?', desc: 'Güvenli seyahat, Türkçe rehberlik ve VIP standart kartları', icon: '🌟' },
          { key: 'testimonials', label: 'Misafir Değerlendirmeleri', desc: 'Gerçek misafirlerin yorumları ve Google yıldızları', icon: '💬' },
          { key: 'guestMoments', label: 'Misafirlerimizin Phuket Anıları', desc: 'Instagram fotoğrafları ve sosyal kanıt galerisi', icon: '📸' },
          { key: 'blogSection', label: 'Phuket Gezi Rehberi & Blog', desc: 'En çok okunan 3 gezi makalesi ve SEO vitrini', icon: '📚' },
          { key: 'faq', label: 'Sıkça Sorulan Sorular', desc: 'Phuket tatili ve turlar hakkında accordion SSS', icon: '❓' },
        ].map((item) => {
          const isVisible = sections[item.key] !== false;
          return (
            <div
              key={item.key}
              onClick={() => toggleSection(item.key)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isVisible
                  ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-brand-accent/50 shadow-xs'
                  : 'bg-slate-100/50 dark:bg-slate-900/20 border-dashed border-slate-300 dark:border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0">
                  {item.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {item.label}
                    </h4>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                        isVisible
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {isVisible ? 'Yayında' : 'Gizli'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                <div
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    isVisible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isVisible ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
