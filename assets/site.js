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

// Winter popup + short request form.
// Opens on tap only. Step 2 sends the request to the booking sheet through the same Apps Script
// web app the booking page uses (window.BOOKING_API from /book-tire-swap/api.js), as action 'lead'
// with the same fields as the short booking form. No prices are shown or sent.
(function(){
  const promo = document.getElementById('promo');
  if (!promo) return;
  const $ = id => document.getElementById(id);
  const steps = [$('promo-step-1'), $('promo-step-2'), $('promo-step-3')];
  const form  = $('book-form');
  const errEl = $('book-error');
  const sendBtn = $('book-send');
  const FR = (document.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;
  const TX = FR ? {
    nameBad: 'Entrez votre nom.', phoneBad: 'Entrez un numéro à 10 chiffres.',
    carBad: 'Entrez la marque et le modèle du véhicule, ou la taille des pneus.', areaBad: 'Entrez votre ville ou quartier.',
    sending: 'Envoi…', send: 'Envoyer ma demande', chosen: 'On vous appelle :', clear: 'Effacer',
    today: "Aujourd'hui", tomorrow: 'Demain', asap: 'Maintenant / dès que possible', morning: 'Matin (9 h–12 h)', afternoon: 'Après-midi (12 h–17 h)', evening: 'Soir (17 h–20 h)',
    reqNo: 'Demande n° ', err: "Ça n'a pas fonctionné. Réessayez, ou appelez-nous au (613) 601-6471.",
    limit: "Ce numéro a déjà des demandes aujourd'hui. Appelez-nous au (613) 601-6471.",
    outside: "Ce secteur est hors de notre zone de service. Appelez-nous au (613) 601-6471.",
    address: 'Secteur introuvable. Ajoutez la ville (ex. Gatineau, Kanata) et réessayez.',
    exotic: 'Ce véhicule demande une soumission personnalisée. Appelez-nous au (613) 601-6471.'
  } : {
    nameBad: 'Please enter your name.', phoneBad: 'Please enter a 10-digit phone number.',
    carBad: "Please enter your car's make and model, or your tire size.", areaBad: 'Please enter your city or neighbourhood.',
    sending: 'Sending…', send: 'Send My Request', chosen: "We'll call:", clear: 'Clear',
    today: 'Today', tomorrow: 'Tomorrow', asap: 'Now / ASAP', morning: 'Morning (9–12)', afternoon: 'Afternoon (12–5)', evening: 'Evening (5–8)',
    reqNo: 'Request #', err: "That didn't go through. Please try again, or call us at (613) 601-6471.",
    limit: 'This phone number already sent requests today. Please call us at (613) 601-6471.',
    outside: "That area is outside our service area. Please call us at (613) 601-6471.",
    address: "We couldn't find that area. Add the city (e.g. Kanata, Gatineau) and try again.",
    exotic: 'This vehicle needs a custom quote. Please call us at (613) 601-6471.'
  };
  // English labels for the owner's alert (same text the booking form sends).
  const PART_EN = { asap: 'Now / ASAP', morning: 'Morning (9–12)', afternoon: 'Afternoon (12–5)', evening: 'Evening (5–8)' };
  let lastFocus = null, busy = false;
  const ct = { part: '', day: '', date: '' };

  function pad2(n){ return (n < 10 ? '0' : '') + n; }
  function isoDay(d){ return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function ymd(s){ const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function dateWords(iso, fr){ return ymd(iso).toLocaleDateString(fr ? 'fr-CA' : 'en-CA', { weekday: 'short', month: 'short', day: 'numeric' }).replace(/,/g, ''); }
  $('f-ct-date').min = isoDay(new Date());

  function show(step){
    steps.forEach((s, i) => { s.hidden = i !== step - 1; });
    $('promo-card').scrollTop = 0;
    promo.setAttribute('aria-labelledby', step === 1 ? 'promo-title' : step === 2 ? 'book-title' : 'done-title');
  }
  function open(step){
    lastFocus = document.activeElement;
    show(step || 1);
    promo.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => promo.classList.add('show')));
    $('promo-card').focus({preventScroll:true});
  }
  function close(){
    promo.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => { promo.hidden = true; }, 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus({preventScroll:true});
  }
  window.openWinterBooking = () => open(2);
  window.openWinterPromo = () => open(1);

  $('promo-close').addEventListener('click', close);
  $('promo-later').addEventListener('click', close);
  $('promo-done-close').addEventListener('click', close);
  $('promo-book').addEventListener('click', () => { show(2); $('f-name').focus(); });
  $('book-back').addEventListener('click', () => show(1));
  promo.addEventListener('click', e => { if (e.target === promo) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !promo.hidden) close(); });

  // Tap-to-open only (the popup never opens by itself: it used to cover the Call buttons).
  // "Request a Call Back" buttons (data-callback) open the call-back form.
  document.querySelectorAll('[data-open-promo]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(1); }));
  document.querySelectorAll('[data-callback]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(2); }));

  // ---------------- "Best time to call" quick picks (same choices as the booking form; nothing picked by default)
  function callTime(){   // English text for the owner's alert
    if (ct.part === 'asap') return 'Now / ASAP';
    const day = ct.day === 'today' ? 'Today' : ct.day === 'tomorrow' ? 'Tomorrow' : (ct.day === 'date' && ct.date ? dateWords(ct.date, false) : '');
    return [day, PART_EN[ct.part] || ''].filter(Boolean).join(', ');
  }
  function callTimeShown(){
    if (ct.part === 'asap') return TX.asap;
    const day = ct.day === 'today' ? TX.today : ct.day === 'tomorrow' ? TX.tomorrow : (ct.day === 'date' && ct.date ? dateWords(ct.date, FR) : '');
    return [day, ct.part ? TX[ct.part] : ''].filter(Boolean).join(', ');
  }
  function paintCt(){
    const asap = ct.part === 'asap';
    form.querySelectorAll('[data-ctpart]').forEach(b => { const on = b.dataset.ctpart === ct.part; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
    form.querySelectorAll('[data-ctday]').forEach(b => {
      const on = b.dataset.ctday === ct.day; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on);
      if (asap) b.setAttribute('aria-disabled', 'true'); else b.removeAttribute('aria-disabled');
    });
    $('f-ct-day').classList.toggle('dim', asap);
    $('f-ct-date-wrap').hidden = !(ct.day === 'date' && !asap);
    const shown = callTimeShown(), out = $('f-ct-chosen');
    out.hidden = !shown;
    out.innerHTML = '';
    if (shown) {
      out.append(TX.chosen + ' ');
      const b = document.createElement('b'); b.textContent = shown; out.append(b, ' ');
      const c = document.createElement('button'); c.type = 'button'; c.className = 'promo-ct-clear'; c.textContent = TX.clear; c.dataset.ctclear = '1'; out.append(c);
    }
  }
  form.addEventListener('click', e => {
    const b = e.target.closest('button[data-ctpart], button[data-ctday], button[data-ctclear]');
    if (!b) return;
    if (b.dataset.ctpart) { ct.part = ct.part === b.dataset.ctpart ? '' : b.dataset.ctpart; if (ct.part === 'asap') { ct.day = ''; ct.date = ''; $('f-ct-date').value = ''; } }
    else if (b.dataset.ctday) { if (b.getAttribute('aria-disabled') === 'true') return; ct.day = ct.day === b.dataset.ctday ? '' : b.dataset.ctday; if (ct.part === 'asap') ct.part = ''; if (ct.day !== 'date') { ct.date = ''; $('f-ct-date').value = ''; } }
    else { ct.part = ct.day = ct.date = ''; $('f-ct-date').value = ''; }
    paintCt();
  });
  $('f-ct-date').addEventListener('change', e => { const v = e.target.value; ct.date = v && v >= isoDay(new Date()) ? v : ''; if (!ct.date) e.target.value = ''; paintCt(); });

  // ---------------- send
  function cleanPhone(p){ let d = String(p || '').replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); return /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? d : ''; }
  const SIZE_RE = /\b(P|LT)?\s?(\d{3})\s?\/\s?(\d{2})\s?Z?R\s?(\d{2}(?:\.\d)?)\b/i;
  function splitCar(txt){   // "Honda Civic 215/55R16" -> size '215/55R16', make 'Honda', model 'Civic'
    let s = String(txt || '').trim(), size = '';
    const m = s.match(SIZE_RE);
    if (m) { size = ((m[1] || '').toUpperCase() === 'LT' ? 'LT' : '') + m[2] + '/' + m[3] + 'R' + m[4]; s = (s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length)).replace(/\s+/g, ' ').trim(); }
    let w = s ? s.split(/\s+/) : [];
    if (w.length > 1 && /^(land|alfa|aston|mercedes)$/i.test(w[0])) w = [w[0] + ' ' + w[1]].concat(w.slice(2));
    return { size: size, car: s, make: w[0] || '', model: w.slice(1).join(' ') };
  }
  function session(){
    let s = ''; try { s = localStorage.getItem('bk_session') || ''; } catch (e) {}
    if (!s) { s = 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); try { localStorage.setItem('bk_session', s); } catch (e) {} }
    return s;
  }
  function apiUrl(){
    if (window.BOOKING_API) return Promise.resolve(window.BOOKING_API);
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = '/book-tire-swap/api.js';
      s.onload = () => window.BOOKING_API ? res(window.BOOKING_API) : rej(new Error('no_api'));
      s.onerror = () => rej(new Error('no_api'));
      document.head.appendChild(s);
    });
  }
  function post(url, body){
    // Same as the booking form: text/plain JSON (no CORS preflight). Resend once after 1 s only when
    // Google answered with an error status (the script did not run), never after a timeout.
    const once = () => Promise.race([
      fetch(url, { method: 'POST', body: JSON.stringify(body) }).then(r => { if (!r.ok) { const e = new Error('http_' + r.status); e.notRun = true; throw e; } return r.json(); }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 30000))
    ]);
    return once().catch(e => { if (e.notRun) return new Promise(r => setTimeout(r, 1000)).then(once); throw e; });
  }
  function mark(id, bad){ $(id).classList.toggle('err', bad); }
  function fail(msg, focusId){ errEl.textContent = msg; if (focusId) $(focusId).focus(); }
  function setBusy(b){ busy = b; sendBtn.disabled = b; sendBtn.innerHTML = '<span class="btn-icon">' + (b ? '⏳' : '✓') + '</span> ' + (b ? TX.sending : TX.send); }
  form.addEventListener('input', e => {
    const wrap = e.target.closest('.book-field');
    if (wrap) wrap.classList.remove('err');
    if (!form.querySelector('.err')) errEl.textContent = '';
  });

  function buildPayload(){
    const name = $('f-name').value.trim(), phone = $('f-phone').value.trim(), area = $('f-area').value.trim();
    const c = splitCar($('f-car').value), t = callTime();
    const notes = [t ? 'Best time to call: ' + t : '', 'Source: winter popup'].filter(Boolean).join(' · ');
    return {
      action: 'lead', source: 'winter-popup', session: session(), lang: FR ? 'fr' : 'en', hp: $('f-hp').value,
      vehicleId: '', year: '', make: c.make, model: c.model, trim: '', trimUnsure: true, vehicleClass: 'car',
      sizeTyped: c.size, photoUrl: '', service: 'off', tires: 4,
      // The script rejects place names under 6 letters (e.g. "Hull"), so short ones get the region added.
      address: area.length < 6 ? area + ', Ottawa-Gatineau' : area, addressFormatted: area,
      name: name, phone: phone, email: '', notes: notes, offerId: '', expectedSubtotal: null, ref: '', multiCar: false,
      area: area, streetAddress: '', preferredTime: '', callTime: t, vehicleText: $('f-car').value.trim(), zone: '', price: 'Call for a quote',
      page: location.pathname
    };
  }
  function fireConversion(r){   // a request in the booking sheet = the "Online booking" conversion (same as the booking page)
    try {
      if (r.testMode || typeof window.gtag !== 'function' || !window.TRACKING) return;
      if (window.loadTrackingNow) window.loadTrackingNow();
      const T = window.TRACKING;
      if (T.BOOKING_LABEL) window.gtag('event', 'conversion', { send_to: T.ADS_ID + '/' + T.BOOKING_LABEL, value: 1, currency: 'CAD', transaction_id: r.bookingNo });
      window.gtag('event', 'winter_popup_lead', { booking_no: r.bookingNo, page_path: location.pathname });
    } catch (e) {}
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (busy) return;
    const name = $('f-name').value.trim(), phoneOk = !!cleanPhone($('f-phone').value), c = splitCar($('f-car').value), area = $('f-area').value.trim();
    const carOk = !!(c.car || c.size);
    mark('f-name-wrap', !name); mark('f-phone-wrap', !phoneOk); mark('f-car-wrap', !carOk); mark('f-area-wrap', !area);
    if (!name) return fail(TX.nameBad, 'f-name');
    if (!phoneOk) return fail(TX.phoneBad, 'f-phone');
    if (!carOk) return fail(TX.carBad, 'f-car');
    if (!area) return fail(TX.areaBad, 'f-area');
    errEl.textContent = '';
    const payload = buildPayload();
    window.lastPopupPayload = payload;   // for automated tests
    setBusy(true);
    apiUrl().then(u => post(u, payload)).then(r => {
      setBusy(false);
      if (r && r.ok) {
        try { localStorage.setItem('bk_booked', '1'); } catch (x) {}
        fireConversion(r);
        $('done-no').textContent = r.bookingNo ? TX.reqNo + r.bookingNo : '';
        show(3); $('done-title').focus({preventScroll:true});
        form.reset(); ct.part = ct.day = ct.date = ''; paintCt();
        return;
      }
      const er = r && r.error;
      if (er === 'name') return fail(TX.nameBad, 'f-name');
      if (er === 'phone') return fail(TX.phoneBad, 'f-phone');
      if (er === 'address') return fail(TX.address, 'f-area');
      fail(TX[er] || TX.err);
    }).catch(() => { setBusy(false); fail(TX.err); });
  });
  paintCt();
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
