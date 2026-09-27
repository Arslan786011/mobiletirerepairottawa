/* ===== Tracking: paste your codes here (Google Ads + Google Analytics) ===== */
window.TRACKING = {
  ADS_ID:     'AW-XXXXXXXXXX',   // Google Ads ID, e.g. AW-1234567890
  TEXT_LABEL: 'XXXXXXXXXXXX',    // label for the "Text click" conversion
  CALL_LABEL: 'XXXXXXXXXXXX',    // label for the "Call click" conversion
  GA4_ID:     'G-XXXXXXXXXX'     // Google Analytics 4 measurement ID, e.g. G-AB12CD34EF
};
(function(){
  var T = window.TRACKING;
  var ok = function(v){ return v && v.indexOf('XXXX') === -1; };
  var first = ok(T.GA4_ID) ? T.GA4_ID : (ok(T.ADS_ID) ? T.ADS_ID : null);
  if (!first) return;
  var g = document.createElement('script');
  g.async = true;
  g.src = 'https://www.googletagmanager.com/gtag/js?id=' + first;
  document.head.appendChild(g);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  if (ok(T.GA4_ID)) gtag('config', T.GA4_ID);
  if (ok(T.ADS_ID)) gtag('config', T.ADS_ID);
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

// Conversion tracking: fires on every Text (sms:) and Call (tel:) button
window.trackConversion = function(kind){
  if (typeof window.gtag !== 'function') return;
  var T = window.TRACKING;
  var ok = function(v){ return v && v.indexOf('XXXX') === -1; };
  if (ok(T.GA4_ID)) gtag('event', kind === 'call' ? 'call_click' : 'text_click', { page_path: location.pathname });
  var label = kind === 'call' ? T.CALL_LABEL : T.TEXT_LABEL;
  if (ok(T.ADS_ID) && ok(label)) gtag('event', 'conversion', { send_to: T.ADS_ID + '/' + label });
};
document.addEventListener('click', function(e){
  var link = e.target.closest('a[href^="sms:"], a[href^="tel:"]');
  if (!link || link.hasAttribute('data-book-winter')) return;
  window.trackConversion(link.getAttribute('href').indexOf('tel:') === 0 ? 'call' : 'text');
});

// Winter popup + booking form
(function(){
  const promo = document.getElementById('promo');
  if (!promo) return;
  const step1 = document.getElementById('promo-step-1');
  const step2 = document.getElementById('promo-step-2');
  const form  = document.getElementById('book-form');
  const errEl = document.getElementById('book-error');
  const PHONE = '+16136016471';
  const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  let lastFocus = null, autoTimer = null;

  // Earliest pickable day = tomorrow
  const d = new Date(); d.setDate(d.getDate() + 1);
  document.getElementById('f-date').min = d.toISOString().slice(0,10);

  function show(step){
    step1.hidden = step !== 1;
    step2.hidden = step !== 2;
    document.getElementById('promo-card').scrollTop = 0;
    promo.setAttribute('aria-labelledby', step === 1 ? 'promo-title' : 'book-title');
  }
  function open(step){
    clearTimeout(autoTimer);
    lastFocus = document.activeElement;
    show(step || 1);
    promo.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => promo.classList.add('show')));
    document.getElementById('promo-card').focus({preventScroll:true});
  }
  function close(){
    promo.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => { promo.hidden = true; }, 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
  }
  window.openWinterBooking = () => open(2);

  document.getElementById('promo-close').addEventListener('click', close);
  document.getElementById('promo-later').addEventListener('click', close);
  document.getElementById('promo-book').addEventListener('click', () => { show(2); document.getElementById('f-name').focus(); });
  document.getElementById('book-back').addEventListener('click', () => show(1));
  promo.addEventListener('click', e => { if (e.target === promo) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !promo.hidden) close(); });

  // Any "Book a Winter Swap" button on the page opens the form
  document.querySelectorAll('[data-book-winter]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault(); open(2);
  }));

  function fmtDate(v){
    if (!v) return 'Flexible';
    const [y,m,dd] = v.split('-').map(Number);
    return new Date(y, m-1, dd).toLocaleDateString('en-CA', {weekday:'short', month:'short', day:'numeric'});
  }
  function mark(id, bad){ document.getElementById(id).classList.toggle('err', bad); }
  form.addEventListener('input', e => {
    const wrap = e.target.closest('.book-field, .book-chips');
    if (wrap) wrap.classList.remove('err');
    if (!form.querySelector('.err')) errEl.textContent = '';
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const address = form.address.value.trim();
    const rims = (form.querySelector('input[name="rims"]:checked') || {}).value;
    mark('f-name-wrap', !name); mark('f-address-wrap', !address); mark('f-rims-wrap', !rims);
    if (!name || !address || !rims){
      errEl.textContent = 'Please add your name, address, and whether your tires are on rims.';
      return;
    }
    errEl.textContent = '';
    const lines = [
      'WINTER SWAP BOOKING',
      'Name: ' + name,
      form.vehicle.value.trim() ? 'Vehicle: ' + form.vehicle.value.trim() : null,
      'Tires on rims: ' + rims,
      'Tire size: ' + (form.size.value.trim() || 'Not sure (will send photo)'),
      'Address: ' + address,
      'Preferred: ' + fmtDate(form.date.value) + ', ' + form.time.value
    ].filter(Boolean);
    const body = encodeURIComponent(lines.join('\n'));
    window.trackConversion && window.trackConversion('text');
    const href = 'sms:' + PHONE + (isApple ? '&' : '?') + 'body=' + body;
    window.lastBookingText = href;
    window.location.href = href;
    document.getElementById('book-note').innerHTML = 'Text app didn\'t open? Text us at <a href="sms:' + PHONE + '"><b>(613) 601-6471</b></a> or <a href="tel:' + PHONE + '"><b>call</b></a>.';
  });

  // Auto-show the announcement (home page only) on every fresh visit or refresh,
  // but not when someone is just clicking between pages of this site.
  let internal = false;
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    internal = nav && nav.type === 'navigate' && document.referrer &&
               new URL(document.referrer).host === location.host;
  } catch (e) {}
  if (document.body.dataset.promo === 'auto' && !internal) {
    autoTimer = setTimeout(() => { if (promo.hidden) open(1); }, 3000);
  }
})();

// Snowfall (background layer, behind all content)
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.getElementById('snow');
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
