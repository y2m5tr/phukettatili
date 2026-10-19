import { useEffect, useRef, useState } from 'react';
import { resolveAssetUrl } from '../../lib/assets';

interface TourSlide {
  id: string;
  data: { title: string; category_label?: string; cat?: string; excerpt?: string; image?: string; duration?: string; price_thb?: number | null };
}

export default function TourShowcase({ tours }: { tours: TourSlide[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const touchStart = useRef<number | null>(null);
  const current = tours[active];

  useEffect(() => {
    if (playing || tours.length < 2) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % tours.length), 6500);
    return () => window.clearInterval(timer);
  }, [playing, tours.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setActive((index) => (index + 1) % tours.length);
      if (event.key === 'ArrowLeft') setActive((index) => (index - 1 + tours.length) % tours.length);
      if (event.key === 'Escape') setPlaying(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tours.length]);

  if (!current) return null;
  const go = (direction: number) => {
    setPlaying(false);
    setActive((index) => (index + direction + tours.length) % tours.length);
  };

  return (
    <section className="tour-showcase group relative mx-auto mt-10 w-full max-w-7xl overflow-hidden rounded-[1.75rem] border border-white/20 bg-surface-1 text-left shadow-[0_35px_100px_-35px_rgba(0,0,0,.85)] md:rounded-[2.25rem]"
      aria-label="Öne çıkan Phuket turları"
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const delta = event.changedTouches[0].clientX - touchStart.current;
        if (Math.abs(delta) > 55) go(delta < 0 ? 1 : -1);
        touchStart.current = null;
      }}>
      <div className="showcase-backdrop" key={current.id}>
        <img src={resolveAssetUrl(current.data.image)} alt="" loading="eager" decoding="async" />
        <div className="showcase-wash" />
      </div>
      <div className="showcase-grain" aria-hidden="true" />
      <div className="relative z-10 grid min-h-[470px] grid-cols-1 items-end gap-8 p-6 sm:p-9 md:min-h-[560px] md:grid-cols-[1fr_auto] md:p-14 lg:p-16">
        <div className="max-w-2xl pb-2">
          <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.28em] text-white/75 sm:text-xs"><span className="h-px w-9 bg-amber-300" />Phuket'i keşfet · {current.data.category_label || current.data.cat || 'Özel deneyimler'}</div>
          <div className="showcase-copy" key={`copy-${current.id}`}>
            <p className="mb-3 text-xs font-medium uppercase tracking-[.2em] text-amber-200">Sizin için seçtik</p>
            <h2 className="max-w-2xl font-serif text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">{current.data.title}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">{current.data.excerpt || 'Phuket’in en güzel rotalarında size özel, unutulmaz bir deneyim.'}</p>
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href={`/turlar/${current.id}`} className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Turu keşfet <span aria-hidden="true">↗</span></a>
            {current.data.duration && <span className="rounded-full border border-white/25 bg-white/10 px-4 py-3 text-xs text-white/90 backdrop-blur-md">◷ &nbsp;{current.data.duration}</span>}
            {current.data.price_thb != null && current.data.price_thb > 0 && <span className="text-sm font-medium text-white">{current.data.price_thb.toLocaleString()} THB</span>}
          </div>
        </div>

        <div className="flex items-end justify-between gap-5 md:flex-col md:items-end">
          <div className="flex items-center gap-2" aria-label={`Tur ${active + 1} / ${tours.length}`}>
            {tours.map((tour, index) => <button key={tour.id} type="button" onClick={() => { setPlaying(false); setActive(index); }} className={`showcase-dot ${active === index ? 'is-active' : ''}`} aria-label={`${index + 1}. slayt: ${tour.data.title}`} aria-current={active === index ? 'true' : undefined}><span /></button>)}
          </div>
          <div className="flex items-center gap-3"><span className="mr-2 font-serif text-sm tracking-widest text-white/70">0{active + 1}<span className="mx-2 text-white/30">/</span>0{tours.length}</span><button type="button" onClick={() => setPlaying((value) => !value)} className="showcase-control" aria-label="Video oynat">{playing ? 'Ⅱ' : '▶'}</button><button type="button" onClick={() => go(-1)} className="showcase-control" aria-label="Önceki tur">←</button><button type="button" onClick={() => go(1)} className="showcase-control" aria-label="Sonraki tur">→</button></div>
        </div>
      </div>
      {playing && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true"><button type="button" onClick={() => setPlaying(false)} className="absolute right-5 top-5 z-10 rounded-full border border-white/30 px-4 py-2 text-white" aria-label="Videoyu kapat">Kapat ✕</button><video className="max-h-[85vh] w-full max-w-6xl rounded-2xl" src="/assets/tours_video.mp4" controls autoPlay playsInline /></div>}
      <style>{`.showcase-backdrop{position:absolute;inset:0;animation:showcase-zoom 8s ease both}.showcase-backdrop img{width:100%;height:100%;object-fit:cover;object-position:center 52%}.showcase-wash{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,10,18,.88),rgba(3,10,18,.62) 42%,rgba(3,10,18,.08)),linear-gradient(0deg,rgba(3,10,18,.8),transparent 52%)}.showcase-grain{pointer-events:none;position:absolute;inset:0;z-index:1;opacity:.14}.showcase-copy{animation:showcase-rise .65s cubic-bezier(.2,.7,.2,1) both}.showcase-control{display:grid;place-items:center;width:44px;height:44px;border:1px solid rgba(255,255,255,.35);border-radius:50%;color:white;background:rgba(255,255,255,.08);backdrop-filter:blur(12px);transition:background .2s,transform .2s}.showcase-control:hover{background:rgba(255,255,255,.22);transform:scale(1.06)}.showcase-dot{width:24px;height:24px;display:grid;place-items:center}.showcase-dot span{width:6px;height:6px;border-radius:999px;background:rgba(255,255,255,.55);transition:all .35s}.showcase-dot.is-active span{width:24px;background:#f5d99a}@keyframes showcase-zoom{from{transform:scale(1.08)}to{transform:scale(1)}}@keyframes showcase-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){.showcase-backdrop,.showcase-copy{animation:none}.showcase-control{transition:none}}`}</style>
    </section>
  );
}
