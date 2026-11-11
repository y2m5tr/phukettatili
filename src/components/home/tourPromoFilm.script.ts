// TourPromoFilm — oynatma motoru: perde zamanlaması, duraklat/devam, döngü
const INTRO_MS = 5500;
const SLIDE_MS = 3000;
const OUTRO_MS = 6000;
const HOLD_MS = 2000;
const scenes = [
  { title: 'Lagünde Kano', sub: 'Karst kayaların arasına kürek çek' },
  { title: 'Şnorkelle Şaşkın Balıklar', sub: 'Kristal suda renk cümbüşü' },
  { title: 'Fillerle Tanış', sub: 'Kurtarılmış filler: besleme ve bakım' },
  { title: 'Zipline Havada Uçuş', sub: 'Ormanın tepesinden süzül' },
  { title: 'ATV ile Orman Patisi', sub: 'Çamur, toz, adrenalin' },
  { title: 'Adalar Arası Sürat', sub: 'Sürat teknesiyle lagünden lagüne' },
  { title: 'Akşam Gösterileri', sub: 'Siam Niramit · FantaSea · Carnival Magic' },
  { title: 'Gün Batımı Yat Keyfi', sub: 'Andaman denizi altın rengi' },
  { title: 'Gece Denizde Yıldızlar', sub: 'Kano ve parlayan plankton' },
];
const TOTAL_MS = INTRO_MS + SLIDE_MS * scenes.length + OUTRO_MS + HOLD_MS;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initPromoFilm() {
  document.addEventListener('astro:page-load', () => {
  const stage = document.getElementById('promo-film-stage');
  if (!stage || (stage as HTMLElement).dataset.bound === 'true') return;
  (stage as HTMLElement).dataset.bound = 'true';

  const intro = stage.querySelector<HTMLElement>('[data-act="intro"]');
  const slidesAct = stage.querySelector<HTMLElement>('[data-act="slides"]');
  const outro = stage.querySelector<HTMLElement>('[data-act="outro"]');
  const slideEls = Array.from(stage.querySelectorAll<HTMLElement>('.pf-slide'));
  const progress = document.getElementById('promo-film-progress');
  const toggleBtn = document.getElementById('promo-film-toggle') as HTMLButtonElement | null;
  const icons = {
    pause: toggleBtn?.querySelector('[data-icon="pause"]'),
    play: toggleBtn?.querySelector('[data-icon="play"]'),
    replay: toggleBtn?.querySelector('[data-icon="replay"]'),
  };
  const planeMotion = stage.querySelector<SVGAnimateMotionElement>('.pf-plane-motion');
  if (!intro || !slidesAct || !outro || !progress || !toggleBtn) return;

  let elapsed = 0;
  let playing = false;
  let rafId = 0;
  let lastTs = 0;
  let ended = false;
  let introRestarted = false;

  const setIcon = (name: 'pause' | 'play' | 'replay') => {
    if (!icons.pause || !icons.play || !icons.replay) return;
    icons.pause.classList.toggle('hidden', name !== 'pause');
    icons.play.classList.toggle('hidden', name !== 'play');
    icons.replay.classList.toggle('hidden', name !== 'replay');
  };

  // Ortak sahne altyazısı: 9 sahne tek katmanı paylaşır, metni burada yazılır
  const caption = stage.querySelector<HTMLElement>('.pf-caption');
  const capTitle = caption?.querySelector<HTMLElement>('.pf-cap-title');
  const capSub = caption?.querySelector<HTMLElement>('.pf-cap-sub');
  let shownScene = -1;

  const restartEl = (el: Element | null | undefined) => {
    // sınıf toggle'ı animasyonları sıfırdan başlatır
    el?.classList.remove('is-active');
    void (el as HTMLElement)?.offsetWidth; // reflow
    el?.classList.add('is-active');
  };

  const setCaption = (idx: number) => {
    if (!caption || idx === shownScene) return;
    shownScene = idx;
    if (capTitle) capTitle.textContent = scenes[idx]?.title || '';
    if (capSub) capSub.textContent = scenes[idx]?.sub || '';
    restartEl(caption);
  };

  const hideCaption = () => {
    shownScene = -1;
    caption?.classList.remove('is-active');
  };

  const applyFrame = () => {
    const acts = [intro, slidesAct, outro] as HTMLElement[];
    const t = elapsed;
    let act: HTMLElement;
    if (t < INTRO_MS) act = intro;
    else if (t < INTRO_MS + SLIDE_MS * slideEls.length) act = slidesAct;
    else act = outro;

    acts.forEach((a) => {
      if (a === act) {
        if (!a.classList.contains('is-active')) {
          a.classList.remove('opacity-0');
          restartEl(a);
          if (a === intro && !introRestarted) {
            introRestarted = true;
            try { planeMotion?.beginElement(); } catch { /* SMIL desteklenmiyorsa rota CSS ile çizilir */ }
          }
        }
        if (a === slidesAct) {
          const idx = Math.min(Math.floor((t - INTRO_MS) / SLIDE_MS), slideEls.length - 1);
          setCaption(idx);
          slideEls.forEach((s, i) => {
            if (i === idx) {
              if (!s.classList.contains('is-active')) restartEl(s);
              s.style.opacity = '1';
            } else {
              s.classList.remove('is-active');
              s.style.opacity = '0';
            }
          });
        }
      } else {
        a.classList.add('opacity-0');
        a.classList.remove('is-active');
        if (a === slidesAct) {
          slideEls.forEach((s) => { s.classList.remove('is-active'); s.style.opacity = '0'; });
          hideCaption();
        }
      }
    });

    progress.style.transform = `scaleX(${Math.min(t / TOTAL_MS, 1)})`;

    if (t >= TOTAL_MS) {
      // kapanışta bekle, sonra başa dön (sonsuz döngü)
      elapsed = 0;
      introRestarted = false;
    }
  };

  const tick = (ts: number) => {
    if (!playing) return;
    if (lastTs) elapsed += ts - lastTs;
    lastTs = ts;
    applyFrame();
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (playing) return;
    playing = true;
    ended = false;
    lastTs = 0;
    setIcon('pause');
    toggleBtn!.setAttribute('aria-label', 'Tanıtım filmini duraklat');
    rafId = requestAnimationFrame(tick);
  };

  const pause = () => {
    playing = false;
    setIcon('play');
    toggleBtn!.setAttribute('aria-label', 'Tanıtım filmini devam ettir');
    cancelAnimationFrame(rafId);
  };

  const replay = () => {
    elapsed = 0;
    introRestarted = false;
    [intro, slidesAct, outro].forEach((a) => { a?.classList.remove('is-active'); });
    slideEls.forEach((s) => { s.classList.remove('is-active'); s.style.opacity = '0'; });
    hideCaption();
    start();
  };

  toggleBtn.addEventListener('click', () => {
    if (playing) pause();
    else if (elapsed >= TOTAL_MS || ended) replay();
    else start();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });

  if (reduceMotion) {
    // Hareket azaltma tercihinde: ilk kare durur, kullanıcı isterse oynatır
    elapsed = INTRO_MS + 10;
    applyFrame();
    pause();
    setIcon('play');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !playing && !document.hidden) start();
        else if (!entry.isIntersecting && playing) pause();
      }
    },
    { threshold: 0.35 },
    );
    observer.observe(stage);
  });
}
