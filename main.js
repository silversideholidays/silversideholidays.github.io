(function () {
  'use strict';

  /* ── Language init ── */
  var LANGS = ['en', 'pt', 'es', 'zh'];
  var currentLang = 'en';
  try {
    var stored = localStorage.getItem('silverside-lang');
    if (stored && LANGS.indexOf(stored) !== -1) currentLang = stored;
  } catch (e) {}

  function setActiveLangBtn(lang) {
    document.querySelectorAll('.lang-menu button').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    var cur = document.getElementById('currentLangLabel');
    if (cur) cur.textContent = lang.toUpperCase();
  }

  function switchLang(lang) {
    currentLang = lang;
    applyLanguage(lang);
    setActiveLangBtn(lang);
    updateGalleryFilterLabels();
    document.querySelectorAll('.lang-dropdown').forEach(function (d) { d.classList.remove('open'); });
  }

  /* ── Nav scroll ── */
  var header = document.getElementById('header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    var btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', window.scrollY > 400);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuToggle.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Language dropdown ── */
  document.querySelectorAll('.lang-dropdown').forEach(function (dropdown) {
    var btn = dropdown.querySelector('.lang-btn');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    dropdown.querySelectorAll('.lang-menu button').forEach(function (lb) {
      lb.addEventListener('click', function () { switchLang(lb.dataset.lang); });
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.lang-dropdown').forEach(function (d) { d.classList.remove('open'); });
  });

  /* ── Reveal on scroll ── */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ── Gallery filter ── */
  var filterBtns = document.querySelectorAll('.gallery-filter-btn');
  var galleryItems = document.querySelectorAll('.gallery-item');

  function updateGalleryFilterLabels() {
    var t = window.translations && window.translations[currentLang];
    if (!t) return;
    filterBtns.forEach(function (btn) {
      var keyMap = { all: 'gallery.all', suites: 'gallery.suites', apartments: 'gallery.apts', pool: 'gallery.pool', breakfast: 'gallery.bkf', exterior: 'gallery.ext' };
      var key = keyMap[btn.dataset.filter];
      if (key && t[key]) btn.textContent = t[key];
    });
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      galleryItems.forEach(function (item) {
        item.classList.toggle('hidden', filter !== 'all' && item.dataset.category !== filter);
      });
    });
  });

  /* ── Lightbox ── */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbCount = document.getElementById('lbCount');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbItems = [];
  var lbIndex = 0;

  function openLightbox(items, idx) {
    lbItems = items; lbIndex = idx;
    showLbSlide();
    if (lightbox) { lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function closeLightbox() {
    if (lightbox) { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
  }
  function showLbSlide() {
    var item = lbItems[lbIndex];
    if (!item) return;
    if (lbImg) { lbImg.src = item.src; lbImg.alt = item.caption || ''; }
    if (lbCaption) lbCaption.textContent = item.caption || '';
    if (lbCount) lbCount.textContent = (lbIndex + 1) + ' / ' + lbItems.length;
  }

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', function () { lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLbSlide(); });
  if (lbNext) lbNext.addEventListener('click', function () { lbIndex = (lbIndex + 1) % lbItems.length; showLbSlide(); });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lbPrev) lbPrev.click();
      if (e.key === 'ArrowRight' && lbNext) lbNext.click();
    });
  }

  /* Room card thumbnails + main visual → lightbox */
  document.querySelectorAll('.room-card').forEach(function (card) {
    var items = [];
    card.querySelectorAll('[data-lb-src]').forEach(function (el) {
      items.push({ src: el.dataset.lbSrc, caption: el.dataset.lbCaption || '' });
    });
    card.querySelectorAll('[data-lb-src]').forEach(function (el, idx) {
      el.addEventListener('click', function (e) { e.preventDefault(); openLightbox(items, idx); });
    });
  });

  /* Gallery items → lightbox */
  document.querySelectorAll('.gallery-item[data-lb-src]').forEach(function (el) {
    el.addEventListener('click', function () {
      var visible = Array.from(document.querySelectorAll('.gallery-item[data-lb-src]')).filter(function (g) { return !g.classList.contains('hidden'); });
      var items = visible.map(function (g) { return { src: g.dataset.lbSrc, caption: g.dataset.lbCaption || '' }; });
      var idx = visible.indexOf(el);
      openLightbox(items, idx >= 0 ? idx : 0);
    });
  });

  /* Breakfast gallery → lightbox */
  var bkfImgs = document.querySelectorAll('.bkf-img[data-lb-src]');
  bkfImgs.forEach(function (el, idx) {
    el.addEventListener('click', function () {
      var items = Array.from(bkfImgs).map(function (g) { return { src: g.dataset.lbSrc, caption: g.dataset.lbCaption || '' }; });
      openLightbox(items, idx);
    });
  });

  /* ── Contact form → Formspree ── */
  var contactForm   = document.getElementById('contactForm');
  var formSuccess   = document.getElementById('formSuccess');
  var formUrgent    = document.getElementById('formUrgent');
  var formSubmitBtn = document.getElementById('formSubmitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic required-field validation
      var allValid = true;
      contactForm.querySelectorAll('[required]').forEach(function (el) {
        el.classList.remove('input-error');
        if (!el.value.trim()) { el.classList.add('input-error'); allValid = false; }
      });
      if (!allValid) return;

      // Disable button while sending
      if (formSubmitBtn) { formSubmitBtn.disabled = true; formSubmitBtn.textContent = '…'; }

      fetch('https://formspree.io/f/mnjkneva', {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
      .then(function (result) {
        if (result.ok) {
          // Hide form, show both success messages
          contactForm.style.display = 'none';
          if (formSuccess) formSuccess.style.display = 'flex';
          if (formUrgent)  formUrgent.style.display  = 'block';
        } else {
          throw new Error((result.body.errors || []).map(function (e) { return e.message; }).join(', ') || 'Error');
        }
      })
      .catch(function () {
        if (formSubmitBtn) {
          formSubmitBtn.disabled = false;
          var t = window.translations && window.translations[currentLang];
          formSubmitBtn.textContent = (t && t['form.submit']) || 'Send Enquiry';
        }
        alert('Sorry, your message could not be sent. Please email us directly at info@silverside.pt');
      });
    });
  }

  /* ── Room carousels ── */
  document.querySelectorAll('.room-carousel').forEach(function (carousel) {
    var track = carousel.querySelector('.room-carousel-track');
    var imgs = track.querySelectorAll('img');
    var total = imgs.length;
    var cur = carousel.querySelector('.room-carousel-cur');
    var idx = 0;

    function goTo(n) {
      idx = (n + total) % total;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      if (cur) cur.textContent = idx + 1;
    }

    var prev = carousel.querySelector('.room-carousel-prev');
    var next = carousel.querySelector('.room-carousel-next');
    if (prev) prev.addEventListener('click', function (e) { e.stopPropagation(); goTo(idx - 1); });
    if (next) next.addEventListener('click', function (e) { e.stopPropagation(); goTo(idx + 1); });

    /* touch swipe */
    var startX = 0;
    carousel.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? idx + 1 : idx - 1);
    }, { passive: true });
  });

  /* ── Back to top ── */
  var btt = document.getElementById('backToTop');
  if (btt) btt.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ── Init language ── */
  applyLanguage(currentLang);
  setActiveLangBtn(currentLang);
  updateGalleryFilterLabels();

})();
