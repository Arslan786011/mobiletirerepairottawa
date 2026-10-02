/* 15% first-swap offer: homepage, winter page and booking page. Lives at /assets/offer.js.
 * Shows ONCE per visitor (this browser), never after they've booked here, never twice.
 * Shows when the visitor:
 *   - switches apps/tabs and comes back
 *   - sits idle ~30 seconds
 *   - (phone) scrolls back up fast toward the top after reading down the page
 *   - (computer) moves the mouse up to close/leave the tab
 *   - picked a car in the booking form, then left before confirming (shows on their next page view)
 * Honest: no countdown timers, no back-button trapping. The 48-hour limit and "first-time customers only"
 * are checked by the booking script when they book.
 * The booking page passes hooks in window.MTRO_OFFER (claim straight into the form, its own wording).
 */
(function () {
  'use strict';
  var W = window, D = document, H = W.MTRO_OFFER || {};
  var ARM_MS = 8000;          // never in the first 8 seconds of a page view
  var IDLE_MS = 30000;        // ~30 s with no taps, scrolls, keys or mouse moves
  var AFTER_PROMO_MS = 5000;  // wait 5 s after the winter popup closes
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function rid() { return 'S' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
  var fr = (D.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;
  var TX = fr ? {
    title: 'Rabais de 15 % sur votre premier changement de pneus', sub: 'Réservez en ligne dans les 48 heures. Nouveaux clients seulement.',
    yes: 'Obtenir 15 %', no: 'Non merci', saving: 'Un instant…',
    okT: '✓ Votre rabais de 15 % est gardé', okS: "Il s'applique tout seul quand vous réservez en ligne d'ici 48 heures.", book: '📅 Réserver en ligne', later: 'Plus tard',
    err: "Ça n'a pas fonctionné. Réessayez.", bookUrl: '/fr/reserver-changement-pneus/'
  } : {
    title: '15% off your first tire swap', sub: 'Book online within 48 hours. New customers only.',
    yes: 'Claim 15% off', no: 'No thanks', saving: 'Saving…',
    okT: '✓ Your 15% off is saved', okS: "It's applied automatically when you book online in the next 48 hours.", book: '📅 Book Online Now', later: 'Later',
    err: "That didn't work. Please try again.", bookUrl: '/book-tire-swap/'
  };
  function useHookText() {   // booking page passes its own wording (season + language)
    var ht = typeof H.text === 'function' ? H.text() : H.text;
    if (ht) for (var k in ht) if (ht[k]) TX[k] = ht[k];
  }

  var loadedAt = Date.now(), promoClosedAt = 0, promoSeenThisView = false, shown = false;
  var startedBefore = !!lsGet('bk_started') && !lsGet('bk_booked');   // picked a car on an earlier page view, didn't book

  function hasOffer() {
    try { var o = JSON.parse(lsGet('bk_offer') || 'null'); return !!(o && o.expires > Date.now() && !o.used); } catch (e) { return false; }
  }
  function promoOpen() { var p = D.getElementById('promo'); return !!(p && !p.hidden); }
  function otherDialogOpen() {   // never cover another popup (winter popup, booking dialogs)
    if (promoOpen()) return true;
    var m = D.querySelectorAll('[role="dialog"]:not([hidden]):not(#mo-offer), .bk-modal:not([hidden])');
    for (var i = 0; i < m.length; i++) {
      var cs = getComputedStyle(m[i]);
      if (m[i].getClientRects().length && cs.display !== 'none' && cs.visibility !== 'hidden') return true;
    }
    return false;
  }
  function eligible(skipArm) {
    if (shown || lsGet('bk_offer_seen') || lsGet('bk_booked') || hasOffer()) return false;
    if (D.visibilityState === 'hidden' || otherDialogOpen()) return false;
    if (H.canShow && !H.canShow()) return false;
    if (!skipArm) {
      if (Date.now() < loadedAt + ARM_MS) return false;
      if (promoClosedAt && Date.now() < promoClosedAt + AFTER_PROMO_MS) return false;
    }
    return true;
  }

  // ------------------------------------------------------------ the popup (built here so pages only need one <script> line)
  var css = '.mo-ov{position:fixed;inset:0;background:rgba(3,5,15,.8);display:flex;align-items:center;justify-content:center;z-index:10000;padding:16px;opacity:0;transition:opacity .25s}' +
    '.mo-ov.show{opacity:1}.mo-ov[hidden]{display:none!important}' +
    '.mo-box{position:relative;max-width:380px;width:100%;background:var(--bg-surface,#0d1426);border:1px solid rgba(29,255,142,.45);border-radius:18px;padding:24px 20px 20px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.6);transform:translateY(14px);transition:transform .25s;font-family:var(--font-body,Barlow,sans-serif);color:var(--white,#eef4ff)}' +
    '.mo-ov.show .mo-box{transform:none}.mo-box:focus{outline:none}.mo-box::before{content:"";position:absolute;top:0;left:18px;right:18px;height:3px;border-radius:0 0 3px 3px;background:linear-gradient(90deg,var(--cyan,#00e5ff),var(--green,#1dff8e))}' +
    '.mo-tag{font-size:40px;line-height:1}.mo-box h3{font-family:var(--font-cond,"Barlow Condensed",sans-serif);font-size:27px;line-height:1.1;margin:10px 0 6px;color:var(--white,#eef4ff);text-transform:none}' +
    '.mo-box p{color:var(--muted,#8899bb);margin:0 0 16px;font-size:15.5px;line-height:1.4}' +
    '.mo-btn{display:block;width:100%;box-sizing:border-box;border:0;border-radius:12px;padding:15px 14px;font:800 17px/1.1 var(--font-body,Barlow,sans-serif);cursor:pointer;text-decoration:none;text-align:center;min-height:50px}' +
    '.mo-yes{background:var(--green,#1dff8e);color:#021018}.mo-yes[disabled]{opacity:.7}' +
    '.mo-no{background:transparent;color:var(--muted,#8899bb);margin-top:8px;font-weight:600;font-size:15px}' +
    '.mo-x{position:absolute;top:8px;right:8px;width:40px;height:40px;border:0;background:transparent;color:var(--muted,#8899bb);font-size:24px;cursor:pointer;border-radius:50%}' +
    '.mo-err{color:#ff8c8c;font-size:14px;min-height:0;margin-top:8px}';
  var ov = null;
  function build() {
    if (ov) return ov;
    var st = D.createElement('style'); st.textContent = css; D.head.appendChild(st);
    ov = D.createElement('div'); ov.className = 'mo-ov'; ov.id = 'mo-offer'; ov.hidden = true;
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'mo-t');
    D.body.appendChild(ov);
    ov.addEventListener('click', function (e) {
      if (e.target === ov) return close('backdrop');
      var b = e.target.closest('[data-mo]'); if (!b) return;
      var a = b.getAttribute('data-mo');
      if (a === 'yes') claim(); else if (a === 'no' || a === 'x' || a === 'later') close(a);
    });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov && !ov.hidden) close('esc'); });
    return ov;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function paintAsk(err) {
    ov.innerHTML = '<div class="mo-box" tabindex="-1"><button class="mo-x" type="button" data-mo="x" aria-label="Close">×</button>' +
      '<div class="mo-tag">🏷️</div><h3 id="mo-t">' + esc(TX.title) + '</h3><p>' + esc(TX.sub) + '</p>' +
      '<button class="mo-btn mo-yes" type="button" data-mo="yes">' + esc(TX.yes) + '</button>' +
      '<button class="mo-btn mo-no" type="button" data-mo="no">' + esc(TX.no) + '</button>' +
      (err ? '<div class="mo-err" role="alert">' + esc(TX.err) + '</div>' : '') + '</div>';
  }
  function paintSaved() {
    ov.innerHTML = '<div class="mo-box" tabindex="-1"><button class="mo-x" type="button" data-mo="x" aria-label="Close">×</button>' +
      '<div class="mo-tag">🏷️</div><h3 id="mo-t">' + esc(TX.okT) + '</h3><p>' + esc(TX.okS) + '</p>' +
      '<a class="mo-btn mo-yes" href="' + TX.bookUrl + '" data-mo="book">' + esc(TX.book) + '</a>' +
      '<button class="mo-btn mo-no" type="button" data-mo="later">' + esc(TX.later) + '</button></div>';
  }
  function track(name, why) { try { if (typeof W.gtag === 'function') W.gtag('event', name, { offer_trigger: why || '' }); } catch (e) {} }

  var lastWhy = '';
  function show(why, skipArm) {
    if (!eligible(skipArm)) return false;
    shown = true; lastWhy = why;
    lsSet('bk_offer_seen', '1');                 // once per visitor, even if they ignore it
    useHookText(); build(); paintAsk(false); ov.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { ov.classList.add('show'); }); });
    var bx = ov.querySelector('.mo-box'); if (bx) bx.focus({ preventScroll: true });
    track('offer_shown', why);
    return true;
  }
  function close(how) {
    if (!ov) return;
    ov.classList.remove('show'); setTimeout(function () { ov.hidden = true; }, 250);
    if (how === 'no' || how === 'x' || how === 'backdrop' || how === 'esc') track('offer_declined', lastWhy);
  }

  // ------------------------------------------------------------ claim (server creates the 48-hour offer)
  function api() {
    if (W.BOOKING_API) return Promise.resolve(W.BOOKING_API);
    return new Promise(function (res, rej) {
      var s = D.createElement('script'); s.src = '/book-tire-swap/api.js';
      s.onload = function () { W.BOOKING_API ? res(W.BOOKING_API) : rej(new Error('no_api')); };
      s.onerror = function () { rej(new Error('no_api')); }; D.head.appendChild(s);
    });
  }
  function claim() {
    track('offer_claimed', lastWhy);
    if (H.claim) { close('yes'); H.claim(); return; }   // booking page: applies straight into the form
    var b = ov.querySelector('.mo-yes'); if (b) { b.disabled = true; b.textContent = TX.saving; }
    var session = lsGet('bk_session'); if (!session) { session = rid(); lsSet('bk_session', session); }
    var t = new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, 20000); });
    Promise.race([api().then(function (u) {
      var go = function () { return fetch(u, { method: 'POST', body: JSON.stringify({ action: 'offer', session: session }) }).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); }); };
      return go().catch(function () { return new Promise(function (r) { setTimeout(r, 1000); }).then(go); });   // one retry after 1 s (Google's one-off 404s)
    }), t]).then(function (r) {
      if (!r || !r.ok) throw new Error('bad');
      lsSet('bk_offer', JSON.stringify({ offerId: r.offerId, expires: r.expires, percent: r.percent }));
      paintSaved();
    }).catch(function () { paintAsk(true); });
  }

  // ------------------------------------------------------------ triggers
  // Winter popup: never on top of it; give people 5 s after they close it.
  (function watchPromo() {
    var p = D.getElementById('promo'); if (!p || !W.MutationObserver) return;
    new MutationObserver(function () {
      if (!p.hidden) promoSeenThisView = true; else if (promoSeenThisView) promoClosedAt = Date.now();
    }).observe(p, { attributes: true, attributeFilter: ['hidden'] });
  })();

  // 1) Switched apps/tabs and came back (also: came back with the browser Back button from another site)
  var wasHidden = false;
  D.addEventListener('visibilitychange', function () {
    if (D.visibilityState === 'hidden') { wasHidden = true; return; }
    if (wasHidden) { wasHidden = false; setTimeout(function () { show('tab_return', H.started && H.started()); }, 400); }
  });
  W.addEventListener('pageshow', function (e) { if (e.persisted) setTimeout(function () { show('came_back'); }, 400); });

  // 2) Idle ~30 s
  var idleT = null;
  function resetIdle() { clearTimeout(idleT); idleT = setTimeout(function () { if (!show('idle')) resetIdle(); }, IDLE_MS); }
  ['touchstart', 'pointerdown', 'scroll', 'keydown', 'mousemove', 'click', 'input'].forEach(function (ev) { D.addEventListener(ev, resetIdle, { passive: true, capture: true }); });
  resetIdle();

  // 3) Phone: fast scroll back up toward the top after reading down the page
  var coarse = W.matchMedia && W.matchMedia('(pointer:coarse)').matches;
  if (coarse) {
    var maxY = 0, samples = [];
    W.addEventListener('scroll', function () {
      var y = W.scrollY || D.documentElement.scrollTop || 0, now = Date.now(), vh = W.innerHeight || 700;
      if (y > maxY) maxY = y;
      samples.push([now, y]); while (samples.length && now - samples[0][0] > 350) samples.shift();
      var top = samples[0][1];
      // went at least ~1.5 screens down, then flicked up at least half a screen within 0.35 s, heading for the top half
      if (maxY > vh * 1.5 && top - y > vh * 0.5 && y < maxY * 0.7) { if (show('scroll_up', H.started && H.started())) samples = []; }
    }, { passive: true });
  }

  // 4) Computer: mouse heads for the close button / tab bar
  if (W.matchMedia && W.matchMedia('(pointer:fine)').matches) {
    D.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) show('exit_intent', H.started && H.started());
    });
  }

  // 5) Picked a car in the booking form on an earlier page view but didn't book → show soon after they land
  //    (skipped if the winter popup opens on this page view; the other triggers still work)
  if (startedBefore) {
    setTimeout(function () { if (!promoSeenThisView) show('left_booking', true); }, 3500);
  }

  // test hook (used by automated tests only; harmless for visitors)
  W.MTRO_OFFER_DEBUG = { show: show, eligible: eligible };
})();
