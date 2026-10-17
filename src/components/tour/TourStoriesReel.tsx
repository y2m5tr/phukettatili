import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, Sparkles, MapPin } from 'lucide-react';

export interface TourStory {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  location: string;
  tourSlug: string;
  highlights: string[];
  duration: string;
}

export const POPULAR_TOUR_STORIES: TourStory[] = [
  {
    id: 'story-maya-bay',
    title: 'Maya Bay & Pileh Lagoon',
    subtitle: 'Kristal berrak turkuaz lagünde yüzme ve şnorkel',
    badge: '🔥 En Popüler',
    image: '/images/pileh.webp',
    location: 'Phi Phi Leh',
    tourSlug: '/turlar/phi-phi-maya-ve-bamboo-adasi',
    highlights: ['Viking Mağarası ve Maymun Plajı', 'Açık deniz şnorkeli', 'Bamboo Adası kumsalı'],
    duration: 'Tam Gün (07:30 - 17:00)',
  },
  {
    id: 'story-similan',
    title: 'Similan Adaları Cenneti',
    subtitle: 'Yılda sadece 6 ay açık olan dünyanın en iyi dalış noktası',
    badge: '⭐ VIP Rota',
    image: '/images/underwater.webp',
    location: 'Similan National Park',
    tourSlug: '/turlar/similan-adalari-surat-teknesi-turu',
    highlights: ['Yelken Kayası (Sail Rock)', 'Deniz kaplumbağaları', 'Un gibi pudra beyaz kum'],
    duration: 'Erken Çıkış (06:00 - 18:00)',
  },
  {
    id: 'story-james-bond',
    title: 'James Bond & Phang Nga',
    subtitle: 'Zümrüt yeşili lagünlerde kano ile sarkıt mağara keşfi',
    badge: '🛶 Kano Keyfi',
    image: '/images/railay.webp',
    location: 'Phang Nga Bay',
    tourSlug: '/turlar/james-bond-adasi-ve-kano-turu',
    highlights: ['Ko Tapu iğne kayası', 'Hong Adası kano turu', 'Yüzen Müslüman Köyü Panyee'],
    duration: 'Tam Gün (08:30 - 17:30)',
  },
  {
    id: 'story-elephant',
    title: 'Etik Fil Koruma Parkı',
    subtitle: 'Kafessiz ve binmesiz, doğal ortamda fil besleme ve çamur banyosu',
    badge: '🐘 Etik Deneyim',
    image: '/images/elephant.webp',
    location: 'Kathu / Chalong',
    tourSlug: '/turlar/fil-besleme-ve-bakim-deneyimi',
    highlights: ['Kurtarılmış filleri besleme', 'Doğal çamur spa', 'Eğitmen eşliğinde nehir banyosu'],
    duration: 'Yarım Gün (Sabah / Öğle)',
  },
  {
    id: 'story-sunset-catamaran',
    title: 'Moonlight Sunset Katamaran',
    subtitle: 'Promthep Cape açıklarında müzik eşliğinde gün batımı yelkeni',
    badge: '🥂 Romantik VIP',
    image: '/images/yacht.webp',
    location: 'Chalong / Promthep Cape',
    tourSlug: '/turlar/moonlight-luks-yat-turu',
    highlights: ['Geniş güneşlenme ağları', 'Meyve ve içecek ikramı', 'Altın saat fotoğraf çekimi'],
    duration: 'Öğleden Sonra (14:00 - 19:00)',
  },
];

export default function TourStoriesReel() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeStory = activeStoryIndex !== null ? POPULAR_TOUR_STORIES[activeStoryIndex] : null;

  // Otomatik ilerleme efekti (5 saniye)
  useEffect(() => {
    if (activeStoryIndex === null) {
      setProgress(0);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    setProgress(0);
    const interval = 50; // her 50ms'de %1
    const step = 100 / (5000 / interval);

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Sonraki hikayeye geç
          if (activeStoryIndex < POPULAR_TOUR_STORIES.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
          } else {
            setActiveStoryIndex(null); // Bittiğinde kapat
          }
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [activeStoryIndex]);

  const handleNext = () => {
    if (activeStoryIndex !== null && activeStoryIndex < POPULAR_TOUR_STORIES.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Canlı Ada Hikayeleri & Deneyimler
            </h3>
          </div>
          <span className="text-xs text-slate-400">İzlemek için dokunun</span>
        </div>

        {/* HİKAYE BALONCUKLARI / REEL CAROUSEL */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
          {POPULAR_TOUR_STORIES.map((story, idx) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setActiveStoryIndex(idx)}
              className="flex flex-col items-center gap-2 group shrink-0 focus:outline-none"
            >
              <div className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <div className="w-full h-full rounded-[14px] overflow-hidden relative">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero-bg.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                    {story.badge}
                  </span>
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-left">
                    <p className="text-[10px] font-bold text-white line-clamp-2 leading-tight">
                      {story.title}
                    </p>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 max-w-[80px] sm:max-w-[96px] truncate text-center">
                {story.location}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* FULLSCREEN STORY MODAL */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full h-full sm:h-auto sm:max-w-md sm:aspect-[9/16] bg-slate-900 sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
            {/* ARKA PLAN GÖRSELİ */}
            <img
              src={activeStory.image}
              alt={activeStory.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hero-bg.webp';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />

            {/* ÜST İLERLEME ÇUBUĞU & HEADER */}
            <div className="relative z-10 p-4 space-y-3">
              {/* Story Progress Bars */}
              <div className="flex items-center gap-1.5">
                {POPULAR_TOUR_STORIES.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width:
                          idx === activeStoryIndex
                            ? `${progress}%`
                            : idx < activeStoryIndex!
                            ? '100%'
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-white/40 overflow-hidden">
                    <img
                      src={activeStory.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {activeStory.title}
                      <span className="text-[10px] text-amber-300 font-normal">
                        {activeStory.badge}
                      </span>
                    </h4>
                    <span className="text-[10px] text-white/70 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {activeStory.location}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* NAVİGASYON DOKUNMA ALANLARI (SOL VE SAĞ) */}
            <div className="absolute inset-y-16 inset-x-0 z-10 flex">
              <div
                className="w-1/2 h-full cursor-pointer"
                onClick={handlePrev}
                title="Önceki Hikaye"
              />
              <div
                className="w-1/2 h-full cursor-pointer"
                onClick={handleNext}
                title="Sonraki Hikaye"
              />
            </div>

            {/* ALT BİLGİ & CTA KARTI */}
            <div className="relative z-10 p-5 space-y-3 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  {activeStory.duration}
                </span>
                <p className="text-sm font-medium text-white/90 mt-1">
                  {activeStory.subtitle}
                </p>
              </div>

              {/* Öne Çıkan Özellikler */}
              <div className="space-y-1">
                {activeStory.highlights.map((h, i) => (
                  <div key={i} className="text-xs text-white/80 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Rezervasyon / Tur Detayı Butonu */}
              <a
                href={activeStory.tourSlug}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-primary to-amber-500 hover:from-brand-primary/90 hover:to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <span>Turu ve Fiyatları İncele</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
