(() => {
  'use strict';

  const qs = (selector, context = document) => context.querySelector(selector);
  const qsa = (selector, context = document) => [...context.querySelectorAll(selector)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealTargets = qsa('.pt-reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    revealTargets.forEach((node) => observer.observe(node));
  } else {
    revealTargets.forEach((node) => node.classList.add('is-visible'));
  }

  const menuButton = qs('.pt-mobile-menu-btn');
  const mobileNav = qs('#pt-mobile-nav');
  if (menuButton && mobileNav) {
    const menuTargets = () => qsa('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])', mobileNav);
    const setMenu = (open, restoreFocus = false) => {
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
      menuButton.setAttribute('aria-controls', 'pt-mobile-nav');
      mobileNav.hidden = !open;
      mobileNav.classList.toggle('is-open', open);
      mobileNav.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) menuTargets()[0]?.focus();
      if (!open && restoreFocus) menuButton.focus();
    };
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    qsa('a', mobileNav).forEach((link) => link.addEventListener('click', () => setMenu(false)));
    mobileNav.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false, true);
        return;
      }
      if (event.key !== 'Tab') return;
      const targets = menuTargets();
      if (!targets.length) return;
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  const sceneTrack = qs('.pt-scene-track');
  const sceneTabs = qsa('.pt-scene-tab');
  if (sceneTrack && sceneTabs.length) {
    const scenes = qsa('.pt-scene', sceneTrack);
    const progress = qs('.pt-scene-progress');
    const showScene = (index, focus = false) => {
      const safeIndex = Math.max(0, Math.min(index, scenes.length - 1));
      const target = scenes[safeIndex];
      if (!target) return;
      sceneTabs.forEach((tab, i) => {
        const active = i === safeIndex;
        tab.setAttribute('aria-selected', String(active));
        tab.setAttribute('tabindex', active ? '0' : '-1');
        tab.setAttribute('aria-controls', `pt-scene-panel-${i + 1}`);
        if (active && focus) tab.focus();
      });
      scenes.forEach((scene, i) => {
        const active = i === safeIndex;
        scene.id = `pt-scene-panel-${i + 1}`;
        scene.setAttribute('role', 'group');
        scene.setAttribute('aria-label', `${i + 1} / ${scenes.length}`);
        scene.removeAttribute('aria-hidden');
        scene.querySelectorAll('a, button').forEach((control) => {
          control.tabIndex = 0;
        });
        scene.classList.toggle('is-active', active);
      });
      if (progress) progress.style.width = `${((safeIndex + 1) / scenes.length) * 100}%`;
      sceneTrack.scrollTo({ left: target.offsetLeft, behavior: reduced ? 'auto' : 'smooth' });
    };
    sceneTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => showScene(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowLeft') next = (index - 1 + sceneTabs.length) % sceneTabs.length;
        if (event.key === 'ArrowRight') next = (index + 1) % sceneTabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = sceneTabs.length - 1;
        showScene(next, true);
      });
    });
    qs('.pt-scene-prev')?.addEventListener('click', () => {
      const current = sceneTabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
      showScene((current - 1 + scenes.length) % scenes.length);
    });
    qs('.pt-scene-next')?.addEventListener('click', () => {
      const current = sceneTabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
      showScene((current + 1) % scenes.length);
    });
    showScene(0);
  }

  const planner = qs('#pt-intent-planner');
  if (planner) {
    const intents = qsa('.pt-intent', planner);
    const date = qs('#pt-date', planner);
    const duration = qs('#pt-duration', planner);
    const people = qs('#pt-people', planner);
    const summary = qs('#pt-plan-summary', planner);
    const whatsapp = qs('#pt-whatsapp-plan', planner);
    const slides = qsa('.pt-hero-slide');
    const dots = qsa('.pt-hero-dot');
    const caption = qs('#pt-image-caption');
    let selected = 'Ada';
    let slideIndex = 0;

    const readableDate = (value) => {
      if (!value) return 'tarih esnek';
      return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
    };
    const showSlide = (index) => {
      if (!slides.length) return;
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === slideIndex;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.querySelectorAll('img').forEach((image) => image.setAttribute('aria-hidden', String(!active)));
      });
      dots.forEach((dot, i) => {
        const active = i === slideIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', String(active));
        dot.tabIndex = active ? 0 : -1;
        dot.setAttribute('aria-controls', `pt-planner-slide-${i + 1}`);
        if (slides[i]) slides[i].id = `pt-planner-slide-${i + 1}`;
      });
    };
    const updatePlanner = () => {
      const when = readableDate(date?.value || '');
      const text = `${selected} odaklı · ${duration?.value || '7 gün'} · ${people?.value || '2 kişi'} · ${when}`;
      if (summary) summary.textContent = text;
      if (whatsapp) {
        const phone = document.body.dataset.ptWhatsapp || '66828950665';
        whatsapp.href = `https://wa.me/${phone}?text=${encodeURIComponent(`Merhaba, ${text} için Phuket tatil planı istiyorum.`)}`;
      }
    };
    const chooseIntent = (button, index) => {
      selected = button.dataset.intent || 'Ada';
      intents.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      showSlide(index);
      if (caption) caption.textContent = button.dataset.caption || `${selected} modu`;
      updatePlanner();
    };

    intents.forEach((button, index) => button.addEventListener('click', () => chooseIntent(button, index)));
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
      dot.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowLeft') next = (index - 1 + dots.length) % dots.length;
        if (event.key === 'ArrowRight') next = (index + 1) % dots.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = dots.length - 1;
        showSlide(next);
        dots[next]?.focus();
      });
    });
    qsa('.pt-hero-arrow').forEach((arrow) => arrow.addEventListener('click', () => showSlide(slideIndex + Number(arrow.dataset.dir || 1))));
    [date, duration, people].filter(Boolean).forEach((field) => field.addEventListener('change', updatePlanner));
    if (date) {
      const today = new Date();
      const yyyy = String(today.getFullYear());
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      date.min = `${yyyy}-${mm}-${dd}`;
    }
    showSlide(0);
    updatePlanner();
  }
})();
