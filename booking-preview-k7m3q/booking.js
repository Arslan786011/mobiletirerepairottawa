/* Winter swap online booking – front end. Talks to the Google Apps Script web app in window.BOOKING_API. */
(function () {
  'use strict';
  var API = window.BOOKING_API || '';
  var PHONE_SMS = 'sms:+16136016471';
  var FR_CALLS = window.BOOKING_FR_CALLS === true;   // set in api.js once the owner answers
  var root = document.getElementById('bk');
  if (!root) return;

  // ---------------------------------------------------------------- storage (safe)
  var mem = {};
  function lsGet(k) { try { var v = localStorage.getItem(k); return v == null ? mem[k] : v; } catch (e) { return mem[k]; } }
  function lsSet(k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) {} }

  // ---------------------------------------------------------------- text (EN / FR)
  var T = {
    en: {
      kicker: '❄ Winter swap booking', title: 'Book your winter tire swap', sub: 'We come to your driveway. Pick a time in 2 minutes.',
      headline: 'Winter swaps from $160 · mounting & balancing included · we come to you.',
      test: '🧪 TEST MODE: bookings are marked TEST and emails go to the owner only',
      s1: 'Your vehicle', year: 'Year', make: 'Make', model: 'Model', trim: 'Trim', choose: 'Choose…', notSure: 'Not sure of trim (use most common)',
      notListed: "My vehicle isn't listed", backToList: '← Pick from the list', otherYear: 'Year', otherMake: 'Make', otherModel: 'Model',
      size: 'Tire size (optional)', sizePh: 'e.g. 225/65R17', sizeBad: 'That size doesn\'t look right. Example: 225/65R17',
      sizeTip: "Your tire size is on the sticker inside the driver's door, or on the side of the tire.",
      photo: 'Or upload a sidewall photo (optional)', photoOk: '✓ Photo uploaded', photoUp: 'Uploading photo…', photoErr: "Photo didn't upload. That's OK, you can skip it.",
      otherNote: "Type your size, or leave it blank and we'll confirm by phone.",
      next: 'Next →', back: '← Back',
      s2: 'What do you need?', off: 'Off rims: mount & balance', offD: 'Your tires need to be moved onto your rims and balanced.',
      on: 'On rims', onD: 'Your winter tires are already on their own rims. We swap the wheels.', howMany: 'How many tires?', t4: '4 tires', t2: '2 tires',
      s3: "Where's the car?", addr: 'Street address + city', addrPh: 'e.g. 123 Greenbank Rd, Nepean', check: 'Check address',
      z1: "✅ You're in our free zone: no travel fee.", z2: '🚐 Travel fee +$FEE (outside our core area).',
      z0: "Sorry, that's outside our service area. Call or text us and we'll see what we can do.",
      notFound: "We couldn't find that address. Add the city (e.g. Ottawa, Kanata, Gatineau) and try again.",
      unchecked: "✅ Got it. We'll confirm your area by text.",
      s4: 'Pick a day and time', s4sub: 'Only open times are shown. Our tech arrives within your window and texts before coming.',
      full: 'Full', open1: 'open', held: "✓ We're holding this time for 10 minutes while you finish.", taken: 'Sorry, that time was just taken. Pick another.',
      waitTitle: 'This day is full', waitSub: "Join the waitlist. If a time opens up, we'll text you first.", anyTime: 'Any time',
      joinWait: 'Join waitlist', waitDone: "✅ You're on the waitlist. We'll text you if a time opens.", otherDay: '← Pick another day',
      s5: 'How do we reach you?', name: 'Name', phone: 'Mobile phone', email: 'Email (optional, for your confirmation)', notes: 'Parking notes (optional)',
      notesPh: 'Driveway, underground, visitor spot…', mayContact: 'We may contact you about this booking.',
      phoneBad: 'Please enter a 10-digit phone number.', nameBad: 'Please enter your name.',
      s6: 'Confirm your booking', when: 'When', service: 'Service', where: 'Where', vehicle: 'Vehicle', contact: 'Contact', tsize: 'Tire size',
      sizeEst: 'estimated from vehicle', sizeCust: 'entered by you', sizeUnk: "we'll confirm by phone",
      price: 'Service', off15: '15% off', zoneFee: 'Travel fee', subtotal: 'Subtotal', tax: 'Tax', total: 'Total',
      pay: 'Pay the tech when done: cash, card or e-transfer.', locked: "Price is locked based on your vehicle. If your tires turn out to be a different size, we'll let you know before we start.",
      noHidden: 'No hidden fees.', confirm: '✓ Confirm booking', booking: 'Booking…',
      priceChanged: 'The price was updated. Please review and confirm again.', offerGone: "Your 15% offer couldn't be applied (it may have expired or already been used). Please review the price.",
      limit: 'This phone number already has bookings today. Please call or text us.',
      doneT: "You're booked!", doneR: 'Request received', doneRsub: "We'll text you to confirm your time.", bookingNo: 'Booking #',
      emailSent: 'A confirmation email is on its way.', change: 'Need to change it? Text (613) 601-6471.', addCal: '📅 Add to my calendar', addIcs: 'Download calendar file (.ics)',
      testDone: '🧪 Test booking saved. Check the Winter Swaps calendar, your email and the WhatsApp groups.',
      fbTitle: 'Online booking is having trouble right now', fbSub: "No problem: text us your booking and we'll confirm it fast.",
      fbBtn: '💬 Text us my booking', offerTitle: '15% off your first winter swap', offerSub: 'Valid 48 hours.', offerYes: 'Claim 15% off', offerNo: 'No thanks',
      offerBar: '🏷️ 15% off applied. Valid until ', loading: 'Loading…', err: 'Something went wrong. Please try again.',
      tierFrom: 'Your price: ', plusTax: ' + tax'
    },
    fr: {
      kicker: "❄ Réservation pneus d'hiver", title: "Réservez votre changement de pneus d'hiver", sub: 'On se déplace chez vous. Réservez en 2 minutes.',
      headline: "Changement de pneus d'hiver à partir de 160 $ · montage et équilibrage inclus · on se déplace chez vous.",
      test: '🧪 MODE TEST : réservations marquées TEST, courriels au propriétaire seulement',
      s1: 'Votre véhicule', year: 'Année', make: 'Marque', model: 'Modèle', trim: 'Version', choose: 'Choisir…', notSure: 'Version inconnue (la plus courante)',
      notListed: "Mon véhicule n'est pas dans la liste", backToList: '← Choisir dans la liste', otherYear: 'Année', otherMake: 'Marque', otherModel: 'Modèle',
      size: 'Taille des pneus (facultatif)', sizePh: 'ex. 225/65R17', sizeBad: 'Cette taille semble incorrecte. Exemple : 225/65R17',
      sizeTip: "La taille est sur l'autocollant dans le cadre de la portière du conducteur, ou sur le flanc du pneu.",
      photo: 'Ou téléversez une photo du flanc (facultatif)', photoOk: '✓ Photo envoyée', photoUp: 'Envoi de la photo…', photoErr: "La photo n'a pas été envoyée. Pas grave, vous pouvez continuer.",
      otherNote: 'Entrez la taille, ou laissez vide et on confirmera par téléphone.',
      next: 'Suivant →', back: '← Retour',
      s2: 'De quoi avez-vous besoin?', off: 'Hors jantes : montage et équilibrage', offD: 'Les pneus doivent être montés sur vos jantes et équilibrés.',
      on: 'Sur jantes', onD: "Vos pneus d'hiver sont déjà sur leurs jantes. On change les roues.", howMany: 'Combien de pneus?', t4: '4 pneus', t2: '2 pneus',
      s3: 'Où est le véhicule?', addr: 'Adresse + ville', addrPh: 'ex. 123 rue Principale, Gatineau', check: "Vérifier l'adresse",
      z1: '✅ Vous êtes dans notre zone gratuite : aucuns frais de déplacement.', z2: '🚐 Frais de déplacement +FEE $ (hors de la zone principale).',
      z0: 'Désolé, cette adresse est hors de notre zone. Texte-nous en français ou en anglais.',
      notFound: "Adresse introuvable. Ajoutez la ville (ex. Gatineau, Aylmer, Ottawa) et réessayez.",
      unchecked: '✅ Reçu. On confirmera votre secteur par texto.',
      s4: 'Choisissez le jour et la plage horaire', s4sub: 'Seules les plages libres sont affichées. Le technicien arrive dans votre plage et vous texte avant.',
      full: 'Complet', open1: 'libre(s)', held: '✓ On vous garde cette plage 10 minutes.', taken: "Désolé, cette plage vient d'être prise. Choisissez-en une autre.",
      waitTitle: 'Cette journée est complète', waitSub: "Inscrivez-vous sur la liste d'attente. Si une plage se libère, on vous texte en premier.", anyTime: "N'importe quand",
      joinWait: "M'inscrire", waitDone: "✅ Vous êtes sur la liste d'attente.", otherDay: '← Choisir un autre jour',
      s5: 'Comment vous joindre?', name: 'Nom', phone: 'Cellulaire', email: 'Courriel (facultatif, pour la confirmation)', notes: 'Stationnement (facultatif)',
      notesPh: 'Entrée, garage souterrain, visiteurs…', mayContact: 'Nous pourrions vous contacter au sujet de cette réservation.',
      phoneBad: 'Entrez un numéro à 10 chiffres.', nameBad: 'Entrez votre nom.',
      s6: 'Confirmez votre réservation', when: 'Quand', service: 'Service', where: 'Adresse', vehicle: 'Véhicule', contact: 'Contact', tsize: 'Taille',
      sizeEst: 'estimée selon le véhicule', sizeCust: 'entrée par vous', sizeUnk: 'à confirmer par téléphone',
      price: 'Service', off15: 'Rabais 15 %', zoneFee: 'Déplacement', subtotal: 'Sous-total', tax: 'Taxes', total: 'Total',
      pay: 'Paiement au technicien à la fin : comptant, carte ou virement Interac.', locked: "Le prix est basé sur votre véhicule. Si vos pneus sont d'une autre taille, on vous le dira avant de commencer.",
      noHidden: 'Aucuns frais cachés.', confirm: '✓ Confirmer', booking: 'Réservation…',
      priceChanged: 'Le prix a été mis à jour. Vérifiez et confirmez de nouveau.', offerGone: "Le rabais de 15 % n'a pas pu être appliqué (expiré ou déjà utilisé). Vérifiez le prix.",
      limit: "Ce numéro a déjà des réservations aujourd'hui. Texte-nous en français ou en anglais.",
      doneT: 'Réservation confirmée!', doneR: 'Demande reçue', doneRsub: 'On vous texte pour confirmer.', bookingNo: 'Réservation n°',
      emailSent: 'Un courriel de confirmation est en route.', change: 'Pour modifier : textez le (613) 601-6471.', addCal: '📅 Ajouter à mon calendrier', addIcs: 'Télécharger le fichier calendrier (.ics)',
      testDone: '🧪 Réservation test enregistrée. Vérifiez le calendrier, votre courriel et les groupes WhatsApp.',
      fbTitle: 'La réservation en ligne a un problème', fbSub: 'Textez-nous votre réservation et on confirme rapidement.',
      fbBtn: '💬 Texte-nous en français ou en anglais', offerTitle: 'Rabais de 15 % sur votre premier changement de pneus', offerSub: 'Valide 48 heures.', offerYes: 'Obtenir 15 %', offerNo: 'Non merci',
      offerBar: '🏷️ Rabais de 15 % appliqué. Valide jusqu\'au ', loading: 'Chargement…', err: 'Une erreur est survenue. Réessayez.',
      tierFrom: 'Votre prix : ', plusTax: ' + taxes', quebec: "Au Québec, les pneus d'hiver sont obligatoires du 1er décembre au 15 mars."
    }
  };
  var qsLang = (location.search.match(/[?&]lang=(fr|en)/) || [])[1];
  var S = {
    lang: qsLang || lsGet('bk_lang') || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en'),
    step: 1, cfg: null, rows: [], session: lsGet('bk_session') || rid(),
    veh: { mode: 'list', year: '', make: '', model: '', trim: '', unsure: false, id: '', cls: 'car', tier: 'STANDARD', size: '', verified: false,
           oYear: '', oMake: '', oModel: '', typed: '', photoUrl: '' },
    service: 'off', tires: 4, zone: null, addrText: '', days: [], date: '', dateLabel: '', slot: '', slotLabel: '', hold: 0,
    c: { name: '', phone: '', email: '', notes: '' }, offer: null, done: null, busy: false, waitDay: null, draftSent: ''
  };
  lsSet('bk_session', S.session);
  // ?r=Emma (dispatcher who sent a /book link). Kept for this visit.
  (function () {
    var m = location.search.match(/[?&]r=([^&#]*)/);
    var r = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')).replace(/[^\w .-]/g, '').slice(0, 20) : '';
    try { if (r) sessionStorage.setItem('bk_ref', r); else r = sessionStorage.getItem('bk_ref') || ''; } catch (e) {}
    S.ref = r;
  })();
  try { var of = JSON.parse(lsGet('bk_offer') || 'null'); if (of && of.expires > Date.now() && !of.used) S.offer = of; } catch (e) {}
  function t(k) { return (T[S.lang] && T[S.lang][k]) || T.en[k] || k; }
  function rid() { return 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { n = Math.round(n * 100) / 100; var s = n % 1 ? n.toFixed(2) : String(n); return S.lang === 'fr' ? s.replace('.', ',') + ' $' : '$' + s; }

  // ---------------------------------------------------------------- API
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]); }
  function apiGet(action, params) {
    if (!API || API.indexOf('PASTE') >= 0) return Promise.reject(new Error('no_api'));
    var q = '?action=' + encodeURIComponent(action);
    Object.keys(params || {}).forEach(function (k) { q += '&' + k + '=' + encodeURIComponent(params[k]); });
    return withTimeout(fetch(API + q, { method: 'GET' }).then(function (r) { return r.json(); }), 20000);
  }
  function apiPost(obj) {
    if (!API || API.indexOf('PASTE') >= 0) return Promise.reject(new Error('no_api'));
    return withTimeout(fetch(API, { method: 'POST', body: JSON.stringify(obj) }).then(function (r) { return r.json(); }), 30000);
  }

  // ---------------------------------------------------------------- pricing (preview; the server has the final say)
  function parseSize(s) {
    var m = String(s || '').toUpperCase().replace(/\s+/g, '').match(/^(P|LT)?(\d{3})\/(\d{2})Z?R(\d{2}(?:\.\d)?)/);
    return m ? { lt: m[1] === 'LT', aspect: +m[3], rim: +m[4], text: (m[1] === 'LT' ? 'LT' : '') + m[2] + '/' + m[3] + 'R' + m[4] } : null;
  }
  function tierFor(size, cls) {
    var c = S.cfg, p = parseSize(size);
    if (cls === 'pickup' || cls === 'large_suv') return (p && (p.rim >= c.pickupLowMinRim || p.aspect <= c.pickupLowMaxAspect)) ? 'PICKUP_LOW' : 'PICKUP';
 if (!p) return cls === 'perf' ? 'LOW' : 'STANDARD';
    if (cls === 'suv' || cls === 'van') {
      if (p.rim >= 19) return p.aspect <= c.suv19MaxAspect ? 'HARD_LOW' : 'LOW';
      if (p.aspect <= 40) return 'HARD_LOW';
      if (p.rim >= 18) return p.aspect >= c.suv18MinAspect ? 'R17' : 'LOW';
      if (p.aspect <= 45) return 'LOW';
      return p.rim >= 17 ? 'R17' : 'STANDARD';
    }
    var x = (p.rim >= 19 || p.aspect <= 40) ? 'HARD_LOW' : (p.rim >= 18 || p.aspect <= 45) ? 'LOW' : p.rim >= 17 ? 'R17' : 'STANDARD';
    if (cls === 'perf' && (x === 'STANDARD' || x === 'R17')) x = 'LOW';
    return x;
  }
  function currentTier() {
    var typed = parseSize(S.veh.typed);
    if (S.veh.mode === 'other') return typed ? tierFor(typed.text, 'car') : 'STANDARD';
    if (typed) return tierFor(typed.text, S.veh.cls);
    return S.veh.tier || 'STANDARD';
  }
  function basePrice(service, tires, tier) {
    var c = S.cfg;
    if (service === 'on') return +c.onRim[tires];
    return tires === 4 ? +c.prices[tier] : +c.twoTireOffRim[tier];
  }
  function quote() {
    var tier = currentTier(), base = basePrice(S.service, S.tires, tier);
    var pct = S.offer ? (+S.cfg.offerPercent || 0) : 0;
    var disc = Math.round(base * pct) / 100, fee = S.zone ? (+S.zone.fee || 0) : 0;
    var sub = Math.round((base - disc + fee) * 100) / 100;
    var rate = S.cfg.taxRates[(S.zone && S.zone.province) || 'ON']; if (rate == null) rate = S.cfg.taxRates.ON;
    var tax = Math.round(sub * rate * 100) / 100;
    return { tier: tier, base: base, pct: pct, disc: disc, fee: fee, sub: sub, tax: tax, total: Math.round((sub + tax) * 100) / 100 };
  }

  // ---------------------------------------------------------------- vehicles
  function rowsFor(year) { return S.rows.filter(function (r) { return r[1] <= year && year <= r[2]; }); }
  function uniq(a) { var o = {}, out = []; a.forEach(function (x) { if (!o[x]) { o[x] = 1; out.push(x); } }); return out; }
  function years() { var y = []; for (var i = 2026; i >= 2010; i--) y.push(i); return y; }
  function makesFor(year) { return uniq(rowsFor(year).map(function (r) { return r[3]; })).sort(); }
  function modelsFor(year, make) { return uniq(rowsFor(year).filter(function (r) { return r[3] === make; }).map(function (r) { return r[4]; })).sort(); }
  function trimRows(year, make, model) { return rowsFor(year).filter(function (r) { return r[3] === make && r[4] === model; }); }
  function commonRow(list) { for (var i = 0; i < list.length; i++) if (list[i][8]) return list[i]; return list[0]; }
  function applyRow(r) {
    if (!r) { S.veh.id = ''; return; }
    S.veh.id = r[0]; S.veh.cls = r[7]; S.veh.size = r[6]; S.veh.verified = !!r[9]; S.veh.tier = r[10];
  }

  // ---------------------------------------------------------------- render helpers
  function opt(v, label, sel) { return '<option value="' + esc(v) + '"' + (sel ? ' selected' : '') + '>' + esc(label) + '</option>'; }
  function stepsBar() { var h = '<div class="bk-steps" aria-hidden="true">'; for (var i = 1; i <= 6; i++) h += '<i class="' + (i <= S.step ? 'on' : '') + '"></i>'; return h + '</div>'; }
  function offerBar() {
    if (!S.offer) return '';
    var d = new Date(S.offer.expires);
    var when = d.toLocaleString(S.lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    return '<div class="bk-offer-bar">' + t('offerBar') + esc(when) + '</div>';
  }
  function shell(inner) {
    var c = S.cfg;
    return (c && c.testMode ? '<div class="bk-test">' + t('test') + '</div>' : '') +
      '<div class="bk-head"><span class="bk-kicker">' + t('kicker') + '</span><button class="bk-lang" data-act="lang" type="button">' + (S.lang === 'fr' ? 'EN' : 'FR') + '</button></div>' +
      (S.step === 1 ? '<h1 class="bk-title">' + t('title') + '</h1><p class="bk-sub">' + t('sub') + '</p><div class="bk-headline">' + t('headline') + '</div>' +
        (S.lang === 'fr' ? '<p class="bk-hint">' + t('quebec') + '</p>' : '') : '') +
      (S.step <= 6 ? stepsBar() : '') + offerBar() + inner;
  }
  function render() {
    var h = '';
    if (S.fatal) h = fallbackHtml(true);
    else if (!S.cfg) h = '<div class="bk-card">' + t('loading') + '</div>';
    else if (S.done) h = doneHtml();
    else if (S.waitDay) h = waitHtml();
    else h = [null, step1, step2, step3, step4, step5, step6][S.step]();
    root.innerHTML = S.fatal ? h : shell(h);
    document.documentElement.lang = S.lang === 'fr' ? 'fr-CA' : 'en-CA';
    relabelFloatBar();
    bindAfterRender();
  }

  // ---------------------------------------------------------------- steps
  function step1() {
    var v = S.veh, h = '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s1') + '</h2>';
    if (v.mode === 'list') {
      var yr = +v.year;
      h += '<div class="bk-row"><div><label class="bk-label" for="bk-year">' + t('year') + '</label><select class="bk-select" id="bk-year" data-f="year">' + opt('', t('choose')) +
        years().map(function (y) { return opt(y, y, String(y) === String(v.year)); }).join('') + '</select></div>';
      h += '<div><label class="bk-label" for="bk-make">' + t('make') + '</label><select class="bk-select" id="bk-make" data-f="make"' + (yr ? '' : ' disabled') + '>' + opt('', t('choose')) +
        (yr ? makesFor(yr).map(function (m) { return opt(m, m, m === v.make); }).join('') : '') + '</select></div></div>';
      h += '<div class="bk-row"><div><label class="bk-label" for="bk-model">' + t('model') + '</label><select class="bk-select" id="bk-model" data-f="model"' + (v.make ? '' : ' disabled') + '>' + opt('', t('choose')) +
        (v.make ? modelsFor(yr, v.make).map(function (m) { return opt(m, m, m === v.model); }).join('') : '') + '</select></div>';
      var trims = v.model ? trimRows(yr, v.make, v.model) : [];
      h += '<div><label class="bk-label" for="bk-trim">' + t('trim') + '</label><select class="bk-select" id="bk-trim" data-f="trim"' + (v.model ? '' : ' disabled') + '>' + opt('', t('choose')) +
        (v.model ? opt('__unsure', t('notSure'), v.unsure) + uniq(trims.map(function (r) { return r[5]; })).map(function (tr) { return opt(tr, tr, !v.unsure && tr === v.trim); }).join('') : '') + '</select></div></div>';
      h += '<button class="bk-link" type="button" data-act="other">' + t('notListed') + '</button>';
    } else {
      h += '<div class="bk-row"><div><label class="bk-label" for="bk-oy">' + t('otherYear') + '</label><input class="bk-input" id="bk-oy" data-f="oYear" inputmode="numeric" maxlength="4" value="' + esc(v.oYear) + '"></div>' +
        '<div><label class="bk-label" for="bk-om">' + t('otherMake') + '</label><input class="bk-input" id="bk-om" data-f="oMake" value="' + esc(v.oMake) + '"></div></div>' +
        '<label class="bk-label" for="bk-omo">' + t('otherModel') + '</label><input class="bk-input" id="bk-omo" data-f="oModel" value="' + esc(v.oModel) + '">' +
        '<p class="bk-hint">' + t('otherNote') + '</p><button class="bk-link" type="button" data-act="list">' + t('backToList') + '</button>';
    }
    h += '<label class="bk-label" for="bk-size">' + t('size') + '</label><input class="bk-input" id="bk-size" data-f="typed" placeholder="' + t('sizePh') + '" value="' + esc(v.typed) + '" autocomplete="off">' +
      '<div class="bk-err" id="bk-size-err">' + (v.typed && !parseSize(v.typed) ? t('sizeBad') : '') + '</div>' +
      '<p class="bk-hint">💡 ' + t('sizeTip') + '</p>' +
      '<label class="bk-label" for="bk-photo">' + t('photo') + '</label><input class="bk-input" id="bk-photo" type="file" accept="image/*" data-act="photo">' +
      '<div class="bk-ok" id="bk-photo-st">' + (v.photoUrl ? t('photoOk') : '') + '</div>';
    h += '<div id="bk-chip-wrap">' + chipHtml() + '</div>';
    h += '<button class="bk-btn" type="button" data-act="next"' + (step1Ready() ? '' : ' disabled') + '>' + t('next') + '</button></div>';
    return h;
  }
  function chipHtml() {
    if (!step1Ready()) return '';
    var q = quote();
    return '<span class="bk-chip">' + t('tierFrom') + money(basePrice('off', 4, q.tier)) + t('plusTax') + ' · ' + esc(S.cfg.tierLabels[q.tier] || '') + '</span>';
  }
  function refreshStep1() {
    var w = document.getElementById('bk-chip-wrap'); if (w) w.innerHTML = chipHtml();
    var b = root.querySelector('[data-act="next"]'); if (b) b.disabled = !step1Ready();
    var e = document.getElementById('bk-size-err'); if (e) e.textContent = S.veh.typed && !parseSize(S.veh.typed) ? t('sizeBad') : '';
  }
  function step1Ready() {
    var v = S.veh;
    if (v.typed && !parseSize(v.typed)) return false;
    if (v.mode === 'other') return !!(v.oMake && v.oModel);
    return !!(v.year && v.make && v.model && (v.trim || v.unsure) && v.id);
  }

  function step2() {
    var tier = currentTier();
    function card(key, desc, service) {
      var p = basePrice(service, S.tires, tier);
      return '<button type="button" class="bk-opt' + (S.service === service ? ' sel' : '') + '" data-act="svc" data-v="' + service + '"><span class="p">' + money(p) + '</span><b>' + t(key) + '</b><small>' + t(desc) + '</small></button>';
    }
    return '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s2') + '</h2>' + card('off', 'offD', 'off') + card('on', 'onD', 'on') +
      '<label class="bk-label">' + t('howMany') + '</label><div class="bk-toggle"><button type="button" data-act="tires" data-v="4" class="' + (S.tires === 4 ? 'sel' : '') + '">' + t('t4') + '</button>' +
      '<button type="button" data-act="tires" data-v="2" class="' + (S.tires === 2 ? 'sel' : '') + '">' + t('t2') + '</button></div>' +
      '<button class="bk-btn" type="button" data-act="next">' + t('next') + '</button><button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
  }

  function zoneHtml() {
    var z = S.zone; if (!z) return '';
    if (z.error) return '<div class="bk-zone z0">' + t(z.error === 'not_found' || z.error === 'address_short' ? 'notFound' : 'err') + '</div>';
    if (!z.checked) return '<div class="bk-zone z1">' + t('unchecked') + '</div>';
    if (z.zone === 1) return '<div class="bk-zone z1">' + t('z1') + '<br><small>' + esc(z.formatted) + '</small></div>';
    if (z.zone === 2) return '<div class="bk-zone z2">' + t('z2').replace('FEE', z.fee) + '<br><small>' + esc(z.formatted) + '</small></div>';
    return '<div class="bk-zone z0">' + t('z0') + '</div>';
  }
  function step3() {
    var ok = S.zone && !S.zone.error && (S.zone.zone === 1 || S.zone.zone === 2);
    return '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s3') + '</h2>' +
      '<label class="bk-label" for="bk-addr">' + t('addr') + '</label><input class="bk-input" id="bk-addr" data-f="addr" autocomplete="street-address" placeholder="' + t('addrPh') + '" value="' + esc(S.addrText) + '">' +
      '<button class="bk-btn ghost" type="button" data-act="zone">' + (S.busy ? '<span class="bk-spin"></span>' : t('check')) + '</button>' + zoneHtml() +
      '<button class="bk-btn" type="button" data-act="next"' + (ok ? '' : ' disabled') + '>' + t('next') + '</button><button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
  }

  function step4() {
    var h = '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s4') + '</h2><p class="bk-sub">' + t('s4sub') + '</p>';
    if (!S.days.length) return h + '<p>' + (S.busy ? t('loading') : t('err')) + '</p><button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
    h += '<div class="bk-days">' + S.days.map(function (d) {
      var p = (S.lang === 'fr' ? d.labelFr : d.label).split(' ');
      var full = d.open === 0;
      return '<button type="button" class="bk-day' + (full ? ' full' : '') + (S.date === d.date ? ' sel' : '') + '" data-act="day" data-v="' + d.date + '"><small>' + esc(p[0]) + '</small><b>' + esc(S.lang === 'fr' ? p[1] : p[2]) + '</b><small>' + esc(S.lang === 'fr' ? p[2] : p[1]) + '</small><em>' + (full ? t('full') : d.open + ' ' + t('open1')) + '</em></button>';
    }).join('') + '</div>';
    var day = S.days.filter(function (d) { return d.date === S.date; })[0];
    if (day) {
      h += '<label class="bk-label">' + esc(S.lang === 'fr' ? day.labelFr : day.label) + '</label>';
      day.slots.filter(function (s) { return s.state === 'open'; }).forEach(function (s) {
        h += '<button type="button" class="bk-slot' + (S.slot === s.id ? ' sel' : '') + '" data-act="slot" data-v="' + s.id + '">' + esc(S.lang === 'fr' ? s.labelFr : s.label) + '<span>' + (S.slot === s.id ? '✓' : '') + '</span></button>';
      });
      if (S.slot && S.hold > Date.now()) h += '<div class="bk-ok">' + t('held') + '</div>';
    }
    h += '<div class="bk-err" id="bk-slot-err">' + (S.slotErr || '') + '</div>';
    return h + '<button class="bk-btn" type="button" data-act="next"' + (S.slot && S.date ? '' : ' disabled') + '>' + t('next') + '</button><button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
  }

  function waitHtml() {
    var d = S.waitDay;
    if (d.done) return '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('waitDone') + '</h2><button class="bk-btn ghost" type="button" data-act="unwait">' + t('otherDay') + '</button></div>';
    return '<div class="bk-card"><div class="bk-kicker">' + esc(S.lang === 'fr' ? d.labelFr : d.label) + '</div><h2 class="bk-title" style="font-size:22px">' + t('waitTitle') + '</h2><p class="bk-sub">' + t('waitSub') + '</p>' +
      '<label class="bk-label" for="bk-wn">' + t('name') + '</label><input class="bk-input" id="bk-wn" value="' + esc(S.c.name) + '">' +
      '<label class="bk-label" for="bk-wp">' + t('phone') + '</label><input class="bk-input" id="bk-wp" type="tel" inputmode="tel" value="' + esc(S.c.phone) + '">' +
      '<label class="bk-label" for="bk-wt">' + t('when') + '</label><select class="bk-select" id="bk-wt">' + opt('any', t('anyTime')) + S.cfg.slots.map(function (s) { return opt(s.id, s.start + '–' + s.end); }).join('') + '</select>' +
      '<div class="bk-err" id="bk-w-err"></div><button class="bk-btn" type="button" data-act="wait">' + (S.busy ? '<span class="bk-spin"></span>' : t('joinWait')) + '</button><button class="bk-btn ghost" type="button" data-act="unwait">' + t('otherDay') + '</button></div>';
  }

  function step5() {
    return '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s5') + '</h2>' +
      '<label class="bk-label" for="bk-name">' + t('name') + '</label><input class="bk-input" id="bk-name" data-f="name" autocomplete="name" value="' + esc(S.c.name) + '">' +
      '<label class="bk-label" for="bk-phone">' + t('phone') + ' *</label><input class="bk-input" id="bk-phone" data-f="phone" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(S.c.phone) + '">' +
      '<label class="bk-label" for="bk-email">' + t('email') + '</label><input class="bk-input" id="bk-email" data-f="email" type="email" autocomplete="email" value="' + esc(S.c.email) + '">' +
      '<label class="bk-label" for="bk-notes">' + t('notes') + '</label><input class="bk-input" id="bk-notes" data-f="notes" placeholder="' + t('notesPh') + '" value="' + esc(S.c.notes) + '">' +
      '<div class="bk-hp" aria-hidden="true"><label>Website<input id="bk-hp" tabindex="-1" autocomplete="off"></label></div>' +
      '<p class="bk-hint">' + t('mayContact') + '</p><div class="bk-err" id="bk-c-err"></div>' +
      '<button class="bk-btn" type="button" data-act="next">' + t('next') + '</button><button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
  }

  function vehicleLabel() {
    var v = S.veh;
    if (v.mode === 'other') return [v.oYear, v.oMake, v.oModel].filter(String).join(' ');
    return v.year + ' ' + v.make + ' ' + v.model + ' ' + (v.unsure ? '(' + (S.lang === 'fr' ? 'version courante' : 'most common trim') + ')' : v.trim);
  }
  function sizeLabel() {
    var v = S.veh, p = parseSize(v.typed);
    if (p) return p.text + ' (' + t('sizeCust') + ')';
    if (v.mode === 'list' && v.size) return v.size + ' (' + t('sizeEst') + ')';
    return t('sizeUnk');
  }
  function step6() {
    var q = quote();
    var svc = (S.service === 'on' ? t('on') : t('off')) + ' · ' + (S.tires === 4 ? t('t4') : t('t2'));
    var h = '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s6') + '</h2><div class="bk-sum">' +
      '<div><span>' + t('when') + '</span><span>' + esc(S.dateLabel + ' · ' + S.slotLabel) + '</span></div>' +
      '<div><span>' + t('service') + '</span><span>' + esc(svc) + '</span></div>' +
      '<div><span>' + t('vehicle') + '</span><span>' + esc(vehicleLabel()) + '</span></div>' +
      '<div><span>' + t('tsize') + '</span><span>' + esc(sizeLabel()) + '</span></div>' +
      '<div><span>' + t('where') + '</span><span>' + esc(S.zone.formatted) + '</span></div>' +
      '<div><span>' + t('contact') + '</span><span>' + esc(S.c.name + ' · ' + S.c.phone) + '</span></div></div>' +
      '<div class="bk-price"><div><span>' + t('price') + '</span><span>' + money(q.base) + '</span></div>' +
      (q.pct ? '<div><span>' + t('off15') + '</span><span>−' + money(q.disc) + '</span></div>' : '') +
      (q.fee ? '<div><span>' + t('zoneFee') + '</span><span>' + money(q.fee) + '</span></div>' : '') +
      '<div><span>' + t('subtotal') + '</span><span>' + money(q.sub) + '</span></div>' +
      '<div><span>' + t('tax') + '</span><span>' + money(q.tax) + '</span></div>' +
      '<div class="tot"><span>' + t('total') + '</span><span>' + money(q.total) + '</span></div></div>' +
      '<p class="bk-note">' + t('noHidden') + ' ' + t('pay') + '</p><p class="bk-note">' + t('locked') + '</p>' +
      '<div class="bk-err" id="bk-book-err">' + (S.bookErr || '') + '</div>' +
      '<button class="bk-btn green" type="button" data-act="book"' + (S.busy ? ' disabled' : '') + '>' + (S.busy ? '<span class="bk-spin"></span> ' + t('booking') : t('confirm')) + '</button>' +
      '<button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
    return h;
  }

  function doneHtml() {
    var d = S.done, booked = d.status === 'booked';
    var h = '<div class="bk-card bk-done"><div class="big">' + (booked ? '✅' : '📩') + '</div><h2 class="bk-title">' + (booked ? t('doneT') : t('doneR')) + '</h2>' +
      (booked ? '' : '<p class="bk-sub">' + t('doneRsub') + '</p>') +
      '<div class="bk-sum" style="text-align:left"><div><span>' + t('bookingNo') + '</span><span>' + esc(d.bookingNo) + '</span></div>' +
      '<div><span>' + t('when') + '</span><span>' + esc(d.dateLabel + ' · ' + d.slotLabel) + '</span></div>' +
      '<div><span>' + t('total') + '</span><span>' + money(d.price.subtotal) + t('plusTax') + '</span></div></div>' +
      (d.emailed ? '<p class="bk-note">' + t('emailSent') + '</p>' : '') + '<p class="bk-note">' + t('change') + '</p>' +
      (d.testMode ? '<p class="bk-note" style="color:#ffd27a">' + t('testDone') + '</p>' : '') +
      '<a class="bk-btn ghost" target="_blank" rel="noopener" href="' + gcalLink(d) + '">' + t('addCal') + '</a>' +
      '<a class="bk-link" download="winter-tire-swap.ics" href="' + icsHref(d) + '">' + t('addIcs') + '</a></div>';
    return h;
  }
  function calDates(d) {
    function f(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    return f(d.start) + '/' + f(d.end);
  }
  function gcalLink(d) {
    var title = S.lang === 'fr' ? "Changement de pneus d'hiver (Mobile Tire Repair Ottawa)" : 'Winter tire swap (Mobile Tire Repair Ottawa)';
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + calDates(d) +
      '&details=' + encodeURIComponent(d.bookingNo + ' · ' + t('change')) + '&location=' + encodeURIComponent(d.address || '');
  }
  function icsHref(d) {
    var dt = calDates(d).split('/');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MTRO//Booking//EN', 'BEGIN:VEVENT', 'UID:' + d.bookingNo + '@mobiletirerepairottawa.ca',
      'DTSTAMP:' + dt[0], 'DTSTART:' + dt[0], 'DTEND:' + dt[1], 'SUMMARY:Winter tire swap (Mobile Tire Repair Ottawa)',
      'LOCATION:' + String(d.address || '').replace(/,/g, '\\,'), 'DESCRIPTION:' + d.bookingNo, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  }

  // ---------------------------------------------------------------- fallback (script down)
  function smsBody() {
    var v = S.veh;
    var lines = ['WINTER SWAP BOOKING'];
    var veh = vehicleLabel(); if (veh.trim()) lines.push('Vehicle: ' + veh);
    if (v.typed) lines.push('Tire size: ' + v.typed);
    lines.push('Service: ' + (S.service === 'on' ? 'On rims' : 'Off rims (mount & balance)') + ' x' + S.tires);
    if (S.addrText) lines.push('Address: ' + S.addrText);
    if (S.dateLabel) lines.push('Preferred: ' + S.dateLabel + ' ' + (S.slotLabel || ''));
    if (S.c.name) lines.push('Name: ' + S.c.name);
    if (S.lang === 'fr') lines.push('(français)');
    return lines.join('\n');
  }
  function smsHref() {
    var sep = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
    return PHONE_SMS + sep + 'body=' + encodeURIComponent(smsBody());
  }
  function fallbackHtml(full) {
    return '<div class="bk-fallback"><h2 class="bk-title" style="font-size:20px">' + t('fbTitle') + '</h2><p class="bk-sub">' + t('fbSub') + '</p>' +
      '<a class="bk-btn green" href="' + smsHref() + '">' + t('fbBtn') + '</a>' + (S.lang === 'fr' && !FR_CALLS ? '' : '<a class="bk-btn ghost" href="tel:+16136016471">📞 (613) 601-6471</a>') + '</div>';
  }
  function goFallback() { S.fatal = true; render(); }

  // ---------------------------------------------------------------- events
  function bindAfterRender() {
    var ph = document.getElementById('bk-phone');
    if (ph) ph.addEventListener('blur', sendDraft);
    var addr = document.getElementById('bk-addr');
    if (addr) addr.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkZone(); } });
  }

  root.addEventListener('change', function (e) {
    var f = e.target.getAttribute('data-f');
    if (e.target.getAttribute('data-act') === 'photo') return uploadPhoto(e.target);
    if (!f) return;
    var v = S.veh, val = e.target.value;
    if (f === 'year') { v.year = val; v.make = v.model = v.trim = ''; v.unsure = false; applyRow(null); }
    else if (f === 'make') { v.make = val; v.model = v.trim = ''; v.unsure = false; applyRow(null); }
    else if (f === 'model') {
      v.model = val; v.trim = ''; v.unsure = false; applyRow(null);
      var tr = trimRows(+v.year, v.make, v.model);
      if (tr.length === 1) { v.trim = tr[0][5]; applyRow(tr[0]); }
    }
    else if (f === 'trim') {
      var list = trimRows(+v.year, v.make, v.model);
      if (val === '__unsure') { v.unsure = true; v.trim = ''; applyRow(commonRow(list)); }
      else { v.unsure = false; v.trim = val; applyRow(list.filter(function (r) { return r[5] === val; })[0]); }
    }
    else if (f === 'typed' || f === 'oYear' || f === 'oMake' || f === 'oModel') { v[f] = val.trim(); return refreshStep1(); }
    else if (f === 'addr') { S.addrText = val.trim(); return; }
    else if (f === 'name' || f === 'phone' || f === 'email' || f === 'notes') { S.c[f] = val.trim(); return; }
    render();
  });
  root.addEventListener('input', function (e) {
    var f = e.target.getAttribute('data-f');
    if (f === 'typed' || f === 'oYear' || f === 'oMake' || f === 'oModel') { S.veh[f] = e.target.value.trim(); refreshStep1(); }
    if (f === 'addr') S.addrText = e.target.value.trim();
    if (f === 'name' || f === 'phone' || f === 'email' || f === 'notes') S.c[f] = e.target.value.trim();
  });

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var act = el.getAttribute('data-act'), val = el.getAttribute('data-v');
    if (act === 'photo') return;
    if (act === 'lang') { S.lang = S.lang === 'fr' ? 'en' : 'fr'; lsSet('bk_lang', S.lang); return render(); }
    if (act === 'other') { S.veh.mode = 'other'; applyRow(null); return render(); }
    if (act === 'list') { S.veh.mode = 'list'; return render(); }
    if (act === 'svc') { S.service = val; return render(); }
    if (act === 'tires') { S.tires = +val; return render(); }
    if (act === 'back') { S.bookErr = ''; S.step = Math.max(1, S.step - 1); return render(); }
    if (act === 'next') return next();
    if (act === 'zone') return checkZone();
    if (act === 'day') return pickDay(val);
    if (act === 'slot') return pickSlot(val);
    if (act === 'wait') return joinWait();
    if (act === 'unwait') { S.waitDay = null; return render(); }
    if (act === 'book') return book();
  });

  function next() {
    if (S.step === 1 && !step1Ready()) return;
    if (S.step === 3 && !(S.zone && !S.zone.error && S.zone.zone)) return;
    if (S.step === 5) {
      var err = document.getElementById('bk-c-err');
      ['name', 'phone', 'email', 'notes'].forEach(function (k) { var i = document.getElementById('bk-' + k); if (i) S.c[k] = i.value.trim(); });
      if (!S.c.name) { err.textContent = t('nameBad'); return; }
      if (!cleanPhone(S.c.phone)) { err.textContent = t('phoneBad'); return; }
      sendDraft();
    }
    S.step++;
    render();
    window.scrollTo({ top: root.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
    if (S.step === 4) loadDays();
  }
  function cleanPhone(p) { var d = String(p || '').replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); return /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? d : ''; }

  function checkZone() {
    var i = document.getElementById('bk-addr'); if (i) S.addrText = i.value.trim();
    if (S.addrText.length < 6) { S.zone = { error: 'address_short' }; return render(); }
    S.busy = true; render();
    apiPost({ action: 'zone', address: S.addrText, session: S.session }).then(function (r) {
      S.busy = false; S.zone = r.ok ? r : { error: r.error || 'not_found' }; render();
    }).catch(function () { S.busy = false; goFallback(); });
  }

  function loadDays() {
    S.busy = true; S.days = []; render();
    apiGet('availability', { session: S.session }).then(function (r) {
      S.busy = false;
      if (!r.ok) return goFallback();
      S.days = r.days;
      if (S.date && !S.days.some(function (d) { return d.date === S.date && d.open; })) { S.date = ''; S.slot = ''; }
      if (!S.date) { var f = S.days.filter(function (d) { return d.open; })[0]; if (f) S.date = f.date; }
      render();
    }).catch(function () { S.busy = false; goFallback(); });
  }
  function dayObj(ds) { return S.days.filter(function (d) { return d.date === ds; })[0]; }
  function pickDay(ds) {
    var d = dayObj(ds); if (!d) return;
    if (d.open === 0) { S.waitDay = { date: d.date, label: d.label, labelFr: d.labelFr }; return render(); }
    S.date = ds; S.slot = ''; S.slotErr = ''; render();
  }
  function pickSlot(id) {
    var d = dayObj(S.date); if (!d) return;
    var s = d.slots.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    S.slotErr = '';
    apiPost({ action: 'hold', session: S.session, date: S.date, slot: id }).then(function (r) {
      if (r.ok) {
        S.slot = id; S.hold = r.expires; S.dateLabel = S.lang === 'fr' ? d.labelFr : d.label; S.slotLabel = S.lang === 'fr' ? s.labelFr : s.label; render(); sendDraft();
      } else { S.slot = ''; S.slotErr = t('taken'); loadDays(); }
    }).catch(function () { goFallback(); });
  }

  function joinWait() {
    var n = document.getElementById('bk-wn').value.trim(), p = document.getElementById('bk-wp').value.trim(), pref = document.getElementById('bk-wt').value;
    var err = document.getElementById('bk-w-err');
    if (!n) { err.textContent = t('nameBad'); return; }
    if (!cleanPhone(p)) { err.textContent = t('phoneBad'); return; }
    S.c.name = n; S.c.phone = p; S.busy = true; render();
    apiPost({ action: 'waitlist', date: S.waitDay.date, dateLabel: S.waitDay.label, pref: pref, name: n, phone: p, vehicle: vehicleLabel(),
              area: S.zone && S.zone.area, lang: S.lang, hp: '', ref: S.ref }).then(function (r) {
      S.busy = false; if (r.ok) { S.waitDay.done = true; render(); } else { render(); document.getElementById('bk-w-err').textContent = t('err'); }
    }).catch(function () { S.busy = false; goFallback(); });
  }

  function draftDetails() {
    var q = S.cfg ? quote() : null;
    return { name: S.c.name, email: S.c.email, size: sizeLabel(), service: (S.service === 'on' ? 'On-rim' : 'Off-rim') + ' x' + S.tires,
             address: S.zone && S.zone.formatted, zone: S.zone && S.zone.zone, lang: S.lang, price: q && money(q.sub), ref: S.ref };
  }
  function sendDraft() {
    var ph = document.getElementById('bk-phone'); if (ph) S.c.phone = ph.value.trim();
    var nm = document.getElementById('bk-name'); if (nm) S.c.name = nm.value.trim();
    var phone = cleanPhone(S.c.phone); if (!phone || !S.cfg) return;
    var q = quote();
    var payload = { action: 'draft', session: S.session, firstName: (S.c.name || '').split(' ')[0], phone: phone, vehicle: vehicleLabel(),
                    slot: S.dateLabel ? S.dateLabel + ' ' + S.slotLabel : '', price: money(q.sub) + '+tax', details: draftDetails() };
    var sig = JSON.stringify(payload); if (sig === S.draftSent) return; S.draftSent = sig;
    apiPost(payload).catch(function () {});
  }

  function uploadPhoto(input) {
    var f = input.files && input.files[0]; if (!f) return;
    var st = document.getElementById('bk-photo-st'); st.textContent = t('photoUp');
    var img = new Image(), url = URL.createObjectURL(f);
    img.onload = function () {
      var max = 1600, w = img.width, h = img.height, k = Math.min(1, max / Math.max(w, h));
      var c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      var data = c.toDataURL('image/jpeg', 0.82); URL.revokeObjectURL(url);
      apiPost({ action: 'photo', session: S.session, dataUrl: data }).then(function (r) {
        if (r.ok) { S.veh.photoUrl = r.url; st.textContent = t('photoOk'); } else st.textContent = t('photoErr');
      }).catch(function () { st.textContent = t('photoErr'); });
    };
    img.onerror = function () { st.textContent = t('photoErr'); };
    img.src = url;
  }

  function book() {
    if (S.busy) return;
    var hp = document.getElementById('bk-hp');
    var q = quote(), v = S.veh;
    S.busy = true; S.bookErr = ''; render();
    var payload = {
      action: 'book', session: S.session, lang: S.lang, hp: hp ? hp.value : '',
      vehicleId: v.mode === 'list' ? v.id : '', year: v.mode === 'list' ? v.year : v.oYear, make: v.mode === 'list' ? v.make : v.oMake,
      model: v.mode === 'list' ? v.model : v.oModel, trim: v.trim, trimUnsure: v.unsure, vehicleClass: v.mode === 'list' ? v.cls : 'car',
      sizeTyped: parseSize(v.typed) ? v.typed : '', photoUrl: v.photoUrl, service: S.service, tires: S.tires,
      address: S.addrText, addressFormatted: S.zone.formatted, date: S.date, slot: S.slot,
      name: S.c.name, phone: S.c.phone, email: S.c.email, notes: S.c.notes, offerId: S.offer ? S.offer.offerId : '', expectedSubtotal: q.sub, ref: S.ref
    };
    apiPost(payload).then(function (r) {
      S.busy = false;
      if (r.ok) {
        S.done = r;
        if (S.offer) { S.offer.used = true; lsSet('bk_offer', JSON.stringify(S.offer)); S.offer = null; }
        lsSet('bk_booked', '1');
        fireConversion(r);
        return render();
      }
      if (r.error === 'taken') { S.step = 4; S.slot = ''; S.slotErr = t('taken'); render(); return loadDays(); }
      if (r.error === 'offer_invalid') { S.offer = null; lsSet('bk_offer', 'null'); S.bookErr = t('offerGone'); return render(); }
      if (r.error === 'price_changed') { S.bookErr = t('priceChanged'); return render(); }
      if (r.error === 'limit') { S.bookErr = t('limit'); return render(); }
      if (r.error === 'phone' || r.error === 'name') { S.step = 5; return render(); }
      if (r.error === 'outside' || r.error === 'address') { S.step = 3; return render(); }
      goFallback();
    }).catch(function () { S.busy = false; goFallback(); });
  }

  function fireConversion(r) {
    try {
      if (r.testMode || !S.cfg.adsBookingLabel || !window.gtag || !window.TRACKING) return;
      window.gtag('event', 'conversion', { send_to: window.TRACKING.ADS_ID + '/' + S.cfg.adsBookingLabel, value: r.price.subtotal, currency: 'CAD', transaction_id: r.bookingNo });
      window.gtag('event', 'booking_confirmed', { value: r.price.subtotal, currency: 'CAD', booking_no: r.bookingNo });
    } catch (e) {}
  }

  // ---------------------------------------------------------------- floating bar labels (links unchanged: tracking keeps working)
  function relabelFloatBar() {
    // French + nobody speaks French on the phone: replace "Call" with "Texte-nous en français ou en anglais".
    // Links stay normal sms:/tel: links, so the existing Text/Call tracking keeps working.
    var fr = S.lang === 'fr', textOnly = fr && !FR_CALLS;
    [['.float-btn-text', '💬 Texte-nous en français ou en anglais'], ['.btn-nav-text', '💬 Texte-nous']].forEach(function (x) {
      var el = document.querySelector(x[0]); if (!el) return;
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.innerHTML);
      el.innerHTML = fr ? x[1] : el.getAttribute('data-en');
    });
    ['.float-btn-emergency', '.btn-nav-callnow'].forEach(function (sel) {
      var el = document.querySelector(sel); if (el) el.style.display = textOnly ? 'none' : '';
    });
    document.body.classList.toggle('bk-fr-textonly', textOnly);
  }

  // ---------------------------------------------------------------- 15% leaving offer (once per visitor, no fake timers)
  var offerModal = document.getElementById('bk-offer');
  var offerArmedAt = Date.now() + 8000, idleTimer = null, wasHidden = false;
  function offerEligible() {
    return S.cfg && !S.fatal && !S.done && !S.offer && !lsGet('bk_offer_seen') && !lsGet('bk_booked') && Date.now() > offerArmedAt && offerModal;
  }
  function showOffer() {
    if (!offerEligible()) return;
    lsSet('bk_offer_seen', '1');
    offerModal.querySelector('h3').textContent = t('offerTitle');
    offerModal.querySelector('p').textContent = t('offerSub');
    offerModal.querySelector('[data-o="yes"]').textContent = t('offerYes');
    offerModal.querySelector('[data-o="no"]').textContent = t('offerNo');
    offerModal.hidden = false;
  }
  if (offerModal) {
    offerModal.addEventListener('click', function (e) {
      var b = e.target.closest('[data-o]'); if (!b && e.target !== offerModal) return;
      offerModal.hidden = true;
      if (b && b.getAttribute('data-o') === 'yes') {
        apiPost({ action: 'offer', session: S.session }).then(function (r) {
          if (r.ok) { S.offer = { offerId: r.offerId, expires: r.expires, percent: r.percent }; lsSet('bk_offer', JSON.stringify(S.offer)); render(); }
        }).catch(function () {});
      }
    });
    // Desktop: exit intent
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 0 && window.matchMedia('(pointer:fine)').matches) showOffer(); });
    // Mobile: tab switch (show when they come back)
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') wasHidden = true;
      else if (wasHidden) { wasHidden = false; showOffer(); }
    });
    // Idle ~30s
    function resetIdle() { clearTimeout(idleTimer); idleTimer = setTimeout(showOffer, 30000); }
    ['touchstart', 'scroll', 'keydown', 'mousemove', 'click'].forEach(function (ev) { document.addEventListener(ev, resetIdle, { passive: true }); });
    resetIdle();
  }

  // ---------------------------------------------------------------- start
  render();
  Promise.all([apiGet('config'), apiGet('vehicles')]).then(function (res) {
    if (!res[0].ok || !res[1].ok) return goFallback();
    S.cfg = res[0]; S.rows = res[1].rows;
    render();
  }).catch(function () { goFallback(); });
  window.__bk = S; // for testing
})();
