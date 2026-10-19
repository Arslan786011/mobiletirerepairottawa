/* ===== Tracking: paste your codes here (Google Ads + Google Analytics + Microsoft Clarity) ===== */
window.TRACKING = {
  ADS_ID:     'AW-17930508850',        // Google Ads ID
  CALL_LABEL: 'oYTACJmZ9ocdELK09-VC',  // label for the "Call click" conversion
  BOOKING_LABEL: '7xVECNbm1I0dELK09-VC', // "Online booking" conversion (winter popup request; same label the booking page uses)
  GA4_ID:     'G-T2F1ZE53Q8',          // Google Analytics 4 measurement ID
  CLARITY_ID: 'yp63l2vzfy'             // Microsoft Clarity project ID (paste when ready)
};
(function(){
  var T = window.TRACKING;
  var ok = function(v){ return v && v.indexOf('XXXX') === -1; };
  // Speed: the gtag.js and Clarity files (~350 KB) download after the page has shown,
  // on the visitor's first tap/scroll/key, or once the page is idle, whichever comes first.
  // gtag() and clarity() calls made before that are queued and sent when the files arrive,
  // so page views and the Call conversions are still recorded.
  var first = ok(T.GA4_ID) ? T.GA4_ID : (ok(T.ADS_ID) ? T.ADS_ID : null);
  if (first) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    if (ok(T.GA4_ID)) gtag('config', T.GA4_ID);
    if (ok(T.ADS_ID)) gtag('config', T.ADS_ID);
  }
  if (ok(T.CLARITY_ID)) window.clarity = window.clarity || function(){ (window.clarity.q = window.clarity.q || []).push(arguments); };
  function addScript(src){ var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  var gLoaded = false, cLoaded = false;
  function loadGtag(){ if (gLoaded || !first) return; gLoaded = true; addScript('https://www.googletagmanager.com/gtag/js?id=' + first); }
  function loadClarity(){ if (cLoaded || !ok(T.CLARITY_ID)) return; cLoaded = true; addScript('https://www.clarity.ms/tag/' + T.CLARITY_ID); }
  window.loadTrackingNow = function(){ loadGtag(); loadClarity(); };
  var EV = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
  function onFirst(){ EV.forEach(function(e){ removeEventListener(e, onFirst, true); }); window.loadTrackingNow(); }
  EV.forEach(function(e){ addEventListener(e, onFirst, {capture:true, passive:true}); });
  function whenIdle(fn, ms){
    function go(){ setTimeout(function(){ ('requestIdleCallback' in window) ? requestIdleCallback(fn, {timeout: 2000}) : fn(); }, ms); }
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
  }
  whenIdle(loadGtag, 3500);     // no interaction yet: load gtag a few seconds after the page has loaded
  whenIdle(loadClarity, 8000);  // Clarity later still
})();

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// Scroll reveal
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // Stagger sibling reveals
      const siblings = e.target.closest('.services-grid, .areas-grid, .reviews-grid, .why-features, .faq-grid, .stats-grid');
      let delay = 0;
      if (siblings) {
        const all = Array.from(siblings.querySelectorAll('.reveal'));
        delay = all.indexOf(e.target) * 80;
      }
      setTimeout(() => {
        e.target.classList.add('visible');
      }, delay);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Nav active highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const scrollObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.style.color = 'var(--cyan)';
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(s => scrollObs.observe(s));

// Conversion tracking: fires on every Call (tel:) button. (The site has no text/SMS buttons.)
window.trackConversion = function(kind){
  if (kind !== 'call' || typeof window.gtag !== 'function') return;
  if (window.loadTrackingNow) window.loadTrackingNow();   // make sure gtag.js is on its way
  var T = window.TRACKING;
  var ok = function(v){ return v && v.indexOf('XXXX') === -1; };
  if (ok(T.GA4_ID)) gtag('event', 'call_click', { page_path: location.pathname });
  if (ok(T.ADS_ID) && ok(T.CALL_LABEL)) gtag('event', 'conversion', { send_to: T.ADS_ID + '/' + T.CALL_LABEL });
};
document.addEventListener('click', function(e){
  var link = e.target.closest('a[href^="tel:"]');
  if (link) window.trackConversion('call');
});

// Winter popup: a simple choice, "✅ Book online" (a plain link to /book-tire-swap/) or "📞 Call".
// Opens on tap only (data-open-promo). No form: nothing is sent to the script from here.
(function(){
  const promo = document.getElementById('promo');
  if (!promo) return;
  const card = document.getElementById('promo-card');
  let lastFocus = null;
  function open(){
    lastFocus = document.activeElement;
    promo.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => promo.classList.add('show')));
    card.focus({preventScroll:true});
  }
  function close(){
    promo.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => { promo.hidden = true; }, 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
  }
  window.openWinterPromo = open;
  document.getElementById('promo-close').addEventListener('click', close);
  document.getElementById('promo-later').addEventListener('click', close);
  promo.addEventListener('click', e => { if (e.target === promo) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !promo.hidden) close(); });
  document.querySelectorAll('[data-open-promo]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(); }));
})();

// Snowfall (background layer, behind all content)
(function(){
  const c = document.getElementById('snow');
  if (!c) return;
  // Off on phones/tablets (saves battery and ~2 s of main-thread work) and for reduced motion.
  if (window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 900px), (pointer: coarse)').matches) { c.style.display = 'none'; return; }
  const ctx = c.getContext('2d');
  const mobile = window.innerWidth < 600;
  let w = 0, h = 0, dpr = 1, flakes = [];

  // Pre-draw one soft flake, then stamp it (much lighter than drawing glows every frame)
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const sc = sprite.getContext('2d');
  const grad = sc.createRadialGradient(16,16,0,16,16,16);
  grad.addColorStop(0,'rgba(255,255,255,1)');
  grad.addColorStop(0.35,'rgba(225,245,255,0.85)');
  grad.addColorStop(1,'rgba(0,229,255,0)');
  sc.fillStyle = grad; sc.fillRect(0,0,32,32);

  function make(anywhere){
    const r = Math.random() * 2.2 + 1;
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -12,
      r: r,
      vy: (r * 0.18 + 0.22) * 60,          // px per second
      phase: Math.random() * Math.PI * 2,
      sway: (Math.random() * 0.5 + 0.2) * 20,
      a: Math.random() * 0.45 + 0.3
    };
  }
  function resize(force){
    const nw = window.innerWidth;
    // Phones change height when the address bar hides while scrolling. Ignore that.
    if (!force && nw === w) return;
    const firstRun = w === 0;
    w = nw;
    h = Math.max(window.innerHeight, screen.height || 0) + 120;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    c.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = mobile ? 28 : 60;
    if (firstRun || flakes.length !== count) flakes = Array.from({length: count}, () => make(true));
    else flakes.forEach(f => { if (f.x > w) f.x = Math.random() * w; });
  }

  let last = performance.now(), running = true;
  function tick(now){
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes){
      f.phase += dt * 0.6;
      f.y += f.vy * dt;
      const x = f.x + Math.sin(f.phase) * f.sway;
      if (f.y > h + 12){ Object.assign(f, make(false)); continue; }
      const size = f.r * 4;
      ctx.globalAlpha = f.a;
      ctx.drawImage(sprite, x - size/2, f.y - size/2, size, size);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  resize(true);
  window.addEventListener('resize', () => resize(false), {passive:true});
  window.addEventListener('orientationchange', () => setTimeout(() => resize(true), 250));
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running){ last = performance.now(); requestAnimationFrame(tick); }
  });
  requestAnimationFrame(tick);
})();
