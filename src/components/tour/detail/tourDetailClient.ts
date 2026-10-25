// Tur detay sayfası istemci betiği — turlar/[id].astro'daki satır içi
// <script> bloğundan birebir taşındı. Sayfadaki <script> bu modülü import
// eder; Astro bundle'ı aynı şekilde üretir.
// Tarayıcı tarafı: sunucu fmtMoney import'u buraya taşınmaz, aynı en-US biçimi yerelde tutulur.
const fmtMoney = (amount: number) => amount.toLocaleString('en-US');

document.addEventListener('astro:page-load', () => {
  // 0. Background Tour View Tracker (Non-blocking)
  const currentTourId = window.location.pathname.split('/').filter(Boolean).pop();
  if (currentTourId) {
    try {
      fetch('/api/tour-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentTourId }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }

  // 1. Dynamic WhatsApp Reservation Generator
  const dateInput = document.getElementById('booking-date-input') as HTMLInputElement | null;
  const guestsSelect = document.getElementById('booking-guests-select') as HTMLSelectElement | null;
  const hotelInput = document.getElementById('booking-hotel-input') as HTMLInputElement | null;
  const desktopBtn = document.getElementById('whatsapp-booking-btn') as HTMLAnchorElement | null;
  const mobileBtn = document.getElementById('mobile-wa-booking-btn') as HTMLAnchorElement | null;

  if (desktopBtn) {
    const tourTitle = desktopBtn.dataset.tourTitle || '';
    const waNumber = desktopBtn.dataset.waNumber || '66828950665';

    // Set date input minimum to today
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }

    const updateWhatsAppUrl = () => {
      const selectedDate = dateInput?.value || '';
      const selectedGuests = guestsSelect?.value || '2 Kişi';
      const hotelVal = (hotelInput?.value || '').trim();

      let dateStr = '';
      if (selectedDate) {
        const parts = selectedDate.split('-');
        if (parts.length === 3) {
          dateStr = `${parts[2]}/${parts[1]}/${parts[0]} tarihinde `;
        }
      }

      const hotelStr = hotelVal ? `(Otel: ${hotelVal}) ` : '';
      const message = `Merhaba, ${tourTitle} için ${dateStr}${selectedGuests} ${hotelStr}uygunluk ve fiyat teklifi almak istiyorum.`;
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

      if (desktopBtn) desktopBtn.href = waUrl;
      if (mobileBtn) mobileBtn.href = waUrl;
    };

    dateInput?.addEventListener('change', updateWhatsAppUrl);
    guestsSelect?.addEventListener('change', updateWhatsAppUrl);
    hotelInput?.addEventListener('input', updateWhatsAppUrl);
  }

  // 2. Gallery Lightbox Functionality
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img') as HTMLImageElement | null;
  const lightboxCounter = document.getElementById('lightbox-counter');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');
  const triggers = document.querySelectorAll<HTMLElement>('.gallery-trigger');

  if (lightbox && lightboxImg && triggers.length > 0) {
    const images: string[] = [];
    triggers.forEach((t) => {
      const src = t.dataset.src;
      if (src && !images.includes(src)) images.push(src);
    });

    let activeIndex = 0;

    const showLightbox = (index: number) => {
      if (images.length === 0) return;
      activeIndex = (index + images.length) % images.length;
      lightboxImg.src = images[activeIndex];
      if (lightboxCounter) {
        lightboxCounter.textContent = `${activeIndex + 1} / ${images.length}`;
      }
      lightbox.classList.remove('hidden');
      lightbox.classList.add('flex');
      document.body.style.overflow = 'hidden';
    };

    const hideLightbox = () => {
      lightbox.classList.add('hidden');
      lightbox.classList.remove('flex');
      document.body.style.overflow = '';
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const src = trigger.dataset.src;
        const idx = src ? images.indexOf(src) : -1;
        showLightbox(idx !== -1 ? idx : 0);
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const src = trigger.dataset.src;
          const idx = src ? images.indexOf(src) : -1;
          showLightbox(idx !== -1 ? idx : 0);
        }
      });
    });

    closeBtn?.addEventListener('click', hideLightbox);
    prevBtn?.addEventListener('click', () => {
      if (images.length === 0) return;
      activeIndex = (activeIndex - 1 + images.length) % images.length;
      lightboxImg.src = images[activeIndex];
      if (lightboxCounter) lightboxCounter.textContent = `${activeIndex + 1} / ${images.length}`;
    });
    nextBtn?.addEventListener('click', () => {
      if (images.length === 0) return;
      activeIndex = (activeIndex + 1 + images.length) % images.length;
      lightboxImg.src = images[activeIndex];
      if (lightboxCounter) lightboxCounter.textContent = `${activeIndex + 1} / ${images.length}`;
    });

    // Click backdrop to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        hideLightbox();
      }
    });

    // Keyboard Controls
    document.addEventListener('keydown', (e) => {
      if (lightbox.classList.contains('hidden')) return;
      if (e.key === 'Escape') hideLightbox();
      if (e.key === 'ArrowLeft') {
        if (images.length === 0) return;
        activeIndex = (activeIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[activeIndex];
        if (lightboxCounter) lightboxCounter.textContent = `${activeIndex + 1} / ${images.length}`;
      }
      if (e.key === 'ArrowRight') {
        if (images.length === 0) return;
        activeIndex = (activeIndex + 1 + images.length) % images.length;
        lightboxImg.src = images[activeIndex];
        if (lightboxCounter) lightboxCounter.textContent = `${activeIndex + 1} / ${images.length}`;
      }
    });
  }

  // 3. Live Currency Converter Pills
  const convertedPriceEl = document.getElementById('sidebar-converted-price') as HTMLElement | null;
  const currencyPills = document.querySelectorAll<HTMLButtonElement>('.currency-pill');
  if (convertedPriceEl && currencyPills.length > 0) {
    const baseThb = parseFloat(convertedPriceEl.dataset.baseThb || '0');
    const updateCurrencyDisplay = (cur: string) => {
      let text = `${fmtMoney(baseThb)} THB`;
      if (cur === 'TRY') {
        text = `${fmtMoney(baseThb)} THB (~${fmtMoney(Math.round(baseThb / 1.2))} ₺)`;
      } else if (cur === 'USD') {
        text = `${fmtMoney(baseThb)} THB (~$${fmtMoney(Math.round(baseThb / 36))})`;
      } else if (cur === 'EUR') {
        text = `${fmtMoney(baseThb)} THB (~€${fmtMoney(Math.round(baseThb / 39))})`;
      }
      convertedPriceEl.textContent = text;

      currencyPills.forEach((p) => {
        if (p.dataset.currency === cur) {
          p.className = 'currency-pill px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-brand-primary text-white shadow-xs';
        } else {
          p.className = 'currency-pill px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
        }
      });
      try {
        localStorage.setItem('ptt_currency', cur);
        window.dispatchEvent(new CustomEvent('ptt:currency-changed', { detail: { currency: cur } }));
      } catch {}
    };

    currencyPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const cur = pill.dataset.currency || 'TRY';
        updateCurrencyDisplay(cur);
      });
    });

    const savedCur = localStorage.getItem('ptt_currency') || 'TRY';
    updateCurrencyDisplay(savedCur);
  }
});
