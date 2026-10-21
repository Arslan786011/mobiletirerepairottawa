/* Exit offer popup. Lives at /assets/offer.js. ONE offer per visitor (this browser), shared by every page.
 *
 * Two modes:
 *  - Booking form (the page sets window.MTRO_OFFER.priceOffer): the real offer with dollar amounts, worked out by the
 *    form from /book-tire-swap/prices.js (exitOffer). Shown only when the form is started but not sent.
 *  - Every other page (sitewide, EN + FR): words only, NO dollar amounts (the site shows no prices outside the booking
 *    form): "One-time offer: we'll waive your service call fee when you book online now". "Book online with my offer"
 *    saves the offer in this browser and opens the booking form with ?offer=<token>; the form applies it and shows the
 *    actual discount in the total (or says there is nothing to take off when the total is already at the $175 floor).
 *
 * Never shown twice: 'bk_offer_seen' (shown), 'bk_swap_offer' ('1' taken, 'used' after booking) and 'bk_booked' are the
 * same keys the booking form uses. A second tier ("discount on discount") is a config switch in prices.js
 * (exitOffer.second, OFF); it only ever shows inside the booking form, once, with its own 'bk_offer2_seen' flag.
 *
 * Shows when the visitor:
 *   - (computer) moves the mouse up out of the page, toward the tabs / close button
 *   - switches apps/tabs and comes back, or comes back with the browser Back button (page restored from cache)
 *   - (phone) scrolls back up fast toward the top after reading down the page
 *   - closes the winter popup (✕ / Maybe later / Esc / tap outside): the offer comes first, once; closing it closes all
 *   - (booking form only) sits idle ~30 seconds, or comes back after starting the form on an earlier visit
 *   - (booking form, phone/tablet) has a total showing and the visit picked, and stays ~12 s on that last part of the form
 *     without booking ("final_idle"). Phones fire no event when the tab is closed, so this is the phone's exit offer.
 * Honest and trap-free: no countdown timers, no history.pushState / back-button trapping, "No thanks" and ✕ always close.
 */
(function () {
  'use strict';
  var W = window, D = document, H = W.MTRO_OFFER || {};
  var SITE_TOKEN = 'exit1';   // keep the same as exitOffer.token in /book-tire-swap/prices.js
  var ARM_MS = 8000;          // never in the first 8 seconds of a page view (except right after the winter popup closes)
  var IDLE_MS = 30000;        // booking form only: ~30 s with no taps, scrolls, keys or mouse moves
  var FINAL_IDLE_MS = 12000;  // booking form, touch screens: ~12 s on the last part of the form (total + visit time showing) without booking
  var FINAL_IDLE_TOUCH_ONLY = true;   // computers keep exit-intent + the 30 s idle; set false to use the 12 s rule there too
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var fr = (D.documentElement.lang || '').toLowerCase().indexOf('fr') === 0;
  var bookUrl = fr ? '/fr/reserver-changement-pneus/' : '/book-tire-swap/';
  var TX = fr ? {
    title: 'Offre unique', sub: "Réservez en ligne maintenant et on annule vos frais de déplacement (ou un rabais sur votre total, s'il s'applique). Vous verrez exactement le montant déduit dans votre total avant de réserver.",
    yes: '✅ Réserver en ligne avec mon offre', no: 'Non merci'
  } : {
    title: 'One-time offer', sub: "Book online now and we'll waive your service call fee (or take a discount off your total where it applies). You'll see exactly what comes off in your total before you book.",
    yes: '✅ Book online with my offer', no: 'No thanks'
  };
  var priceMode = !!H.priceOffer;
  function useHookText() {   // booking page passes its own wording with the real amounts
    var ht = typeof H.text === 'function' ? H.text() : H.text;
    if (ht) for (var k in ht) if (ht[k]) TX[k] = ht[k];
  }

  var loadedAt = Date.now(), shownNow = {}, open = false;
  var startedBefore = !!lsGet('bk_started') && !lsGet('bk_booked');   // picked a car on an earlier page view, didn't book

  function tier() { return priceMode && H.tier ? H.tier() : 1; }
  function seenKey(t) { return t === 2 ? 'bk_offer2_seen' : 'bk_offer_seen'; }
  function otherDialogOpen() {   // never cover another popup (winter popup, booking dialogs)
    var m = D.querySelectorAll('[role="dialog"]:not([hidden]):not(#mo-offer), .bk-modal:not([hidden])');
    for (var i = 0; i < m.length; i++) {
      var cs = getComputedStyle(m[i]);
      if (m[i].getClientRects().length && cs.display !== 'none' && cs.visibility !== 'hidden') return true;
    }
    return false;
  }
  function eligible(skipArm) {
    var t = tier();
    if (open || shownNow[t] || lsGet(seenKey(t)) || lsGet('bk_booked')) return false;
    if (t === 1 && lsGet('bk_swap_offer')) return false;   // already taken (here or on another page), or used
    if (D.visibilityState === 'hidden' || otherDialogOpen()) return false;
    if (priceMode && H.canShow && !H.canShow()) return false;
    if (!skipArm && Date.now() < loadedAt + ARM_MS) return false;
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
    '.mo-x{position:absolute;top:8px;right:8px;width:40px;height:40px;border:0;background:transparent;color:var(--muted,#8899bb);font-size:24px;cursor:pointer;border-radius:50%}';
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
      if (a === 'yes') claim(e); else if (a === 'no' || a === 'x') close(a);
    });
    D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov && !ov.hidden) close('esc'); });
    return ov;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function paint() {
    // booking form: a button that applies the $ off right there; elsewhere: a link into the booking form carrying the token
    var yes = priceMode ? '<button class="mo-btn mo-yes" type="button" data-mo="yes">' + esc(TX.yes) + '</button>'
                        : '<a class="mo-btn mo-yes" href="' + bookUrl + '?offer=' + SITE_TOKEN + '" data-mo="yes">' + esc(TX.yes) + '</a>';
    ov.innerHTML = '<div class="mo-box" tabindex="-1"><button class="mo-x" type="button" data-mo="x" aria-label="Close">×</button>' +
      '<div class="mo-tag">🏷️</div><h3 id="mo-t">' + esc(TX.title) + '</h3><p>' + esc(TX.sub) + '</p>' + yes +
      '<button class="mo-btn mo-no" type="button" data-mo="no">' + esc(TX.no) + '</button></div>';
  }
  function track(name, why) { try { if (typeof W.gtag === 'function') W.gtag('event', name, { offer_trigger: why || '', offer_mode: priceMode ? 'form' : 'site' }); } catch (e) {} }

  var lastWhy = '', lastTier = 1;
  function show(why, skipArm) {
    if (!eligible(skipArm)) return false;
    lastTier = tier(); shownNow[lastTier] = true; lastWhy = why; open = true;
    lsSet(seenKey(lastTier), '1');   // once per visitor, even if they ignore it
    if (priceMode) useHookText();
    build(); paint(); ov.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { ov.classList.add('show'); }); });
    var bx = ov.querySelector('.mo-box'); if (bx) bx.focus({ preventScroll: true });
    lsSet('bk_offer_trigger', why); lsSet('bk_offer_answer', '');   // offer status for the staff emails (booking form reads these)
    if (priceMode && H.onShown) try { H.onShown(why, lastTier); } catch (e) {}
    track('offer_shown', why);
    return true;
  }
  function close(how) {
    if (!ov) return;
    open = false;
    ov.classList.remove('show'); setTimeout(function () { ov.hidden = true; }, 250);
    if (how === 'no' || how === 'x' || how === 'backdrop' || how === 'esc') {
      track('offer_declined', lastWhy);
      lsSet('bk_offer_answer', 'declined');
      if (priceMode && H.onDeclined) try { H.onDeclined(how, lastWhy); } catch (e) {}
    }
  }
  function claim(e) {
    track('offer_claimed', lastWhy);
    lsSet('bk_offer_answer', 'taken');
    if (priceMode) { if (H.claim) H.claim(); close('yes'); return; }
    lsSet('bk_swap_offer', '1');   // the booking form reads this (and ?offer=) and applies the offer to the total
    open = false;                  // the link itself opens the booking form
  }

  // ------------------------------------------------------------ triggers
  // Winter popup closed (site.js fires 'mtro:promo-closed'): the offer comes first, once. Closing the offer closes everything.
  D.addEventListener('mtro:promo-closed', function () { setTimeout(function () { show('popup_close', true); }, 380); });

  // 1) Switched apps/tabs and came back; or came back with the browser Back button (page restored from the back/forward cache)
  var wasHidden = false;
  D.addEventListener('visibilitychange', function () {
    if (D.visibilityState === 'hidden') { wasHidden = true; return; }
    if (wasHidden) { wasHidden = false; setTimeout(function () { show('tab_return', priceMode && H.started && H.started()); }, 400); }
  });
  W.addEventListener('pageshow', function (e) { if (e.persisted) setTimeout(function () { show('came_back', true); }, 400); });

  // 2) Booking form only: idle ~30 s
  if (priceMode) {
    var idleT = null;
    var resetIdle = function () { clearTimeout(idleT); idleT = setTimeout(function () { if (!show('idle')) resetIdle(); }, IDLE_MS); };
    ['touchstart', 'pointerdown', 'scroll', 'keydown', 'mousemove', 'click', 'input'].forEach(function (ev) { D.addEventListener(ev, resetIdle, { passive: true, capture: true }); });
    resetIdle();
  }

  // 2b) Booking form, phone/tablet: the "final step" idle trigger (FINAL_IDLE_MS, ~12 s).
  //     Counts while H.finalStep() is true: a total is showing, a visit time is picked (or ASAP), the last part of the form
  //     (visit time / total / Book button) is on screen, no booking is being sent or done, and the offer was never shown,
  //     taken or declined. A tap, key press or typed character restarts the 12 s; scrolling does NOT (scrolling up and down
  //     over the total without booking is exactly the hesitation this is for). Leaving that state (e.g. clearing the hour)
  //     also restarts it. Fires once, then never again for this visitor (same 'bk_offer_seen' flag as every other trigger).
  if (priceMode && H.finalStep && (!FINAL_IDLE_TOUCH_ONLY || (W.matchMedia && (W.matchMedia('(pointer:coarse)').matches || W.matchMedia('(hover:none)').matches)))) {
    var finalMs = -1, finalDone = false, finalTick = null, TICK = 500;   // counts ticks (not clock time), so a changed device clock can't skip it
    var finalReset = function () { finalMs = -1; };
    ['touchstart', 'pointerdown', 'keydown', 'input', 'change'].forEach(function (ev) { D.addEventListener(ev, finalReset, { passive: true, capture: true }); });
    finalTick = setInterval(function () {
      if (finalDone) return;
      var ok = false; try { ok = !!H.finalStep(); } catch (e) { ok = false; }
      if (!ok || D.visibilityState === 'hidden') { finalMs = -1; return; }
      if (finalMs < 0) { finalMs = 0; return; }
      finalMs += TICK;
      if (finalMs >= FINAL_IDLE_MS) {
        if (show('final_idle', true)) { finalDone = true; clearInterval(finalTick); }
        else finalMs = -1;   // e.g. another dialog was open: count again
      }
    }, TICK);
  }

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
      if (maxY > vh * 1.5 && top - y > vh * 0.5 && y < maxY * 0.7) { if (show('scroll_up', priceMode && H.started && H.started())) samples = []; }
    }, { passive: true });
  }

  // 4) Computer: mouse heads for the close button / tab bar
  if (W.matchMedia && W.matchMedia('(pointer:fine)').matches) {
    D.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0) show('exit_intent', priceMode && H.started && H.started());
    });
  }

  // 5) Booking form: picked a car on an earlier page view but didn't book -> show soon after they land
  if (priceMode && startedBefore) setTimeout(function () { show('left_booking', true); }, 3500);

  // test hook (used by automated tests only; harmless for visitors)
  W.MTRO_OFFER_DEBUG = { show: show, eligible: eligible, mode: priceMode ? 'form' : 'site', finalIdleMs: FINAL_IDLE_MS };
})();
