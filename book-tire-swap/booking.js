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
      kicker: '❄ Winter swap booking', title: 'Book your winter tire swap', sub: "We come to your driveway. Send your request in 2 minutes and we'll call you.",
      headline: 'Winter tire swaps · mounting & balancing included · we come to you. We call to confirm your price.',
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
      z1: "✅ Good news, we cover your area.", z2: '✅ Good news, we cover your area.', z3: '✅ Good news, we cover your area.',
      z0: 'Outside our service area — call us.',
      multi: 'I have 2 or more cars at this address', multiWaived: 'Travel fee waived for 2+ cars',
      multiNote: "Book one time window for all of them. We'll text you to confirm the other car(s).",
      whyQ: 'Why does this cost more?',
      whyA: 'Low-profile tires have short, very stiff sidewalls. They take more time and special equipment to mount without scratching or bending your rims, and many are run-flats with sensitive tire pressure sensors.',
      exT: 'This vehicle needs a custom quote — text or call us',
      exSub: "Exotic and high-performance tires need special handling, so we price them one by one. Leave your details and we'll get back to you fast.",
      exSend: 'Send my quote request', exDone: "✅ Got it! We'll text or call you with your quote.", exAddr: 'Address or area',
      zoneWord: 'zone',
      notFound: "We couldn't find that address. Add the city (e.g. Ottawa, Kanata, Gatineau) and try again.",
      unchecked: "✅ Got it. We'll confirm your area by text.",
      s4: 'Pick a day and time', s4sub: 'Only open times are shown. Our tech arrives within your window and texts before coming.',
      full: 'Full', open1: 'open', held: "✓ We're holding this time for 10 minutes while you finish.", taken: 'Sorry, that time was just taken. Pick another.',
      waitTitle: 'This day is full', waitSub: "Join the waitlist. If a time opens up, we'll text you first.", anyTime: 'Any time',
      joinWait: 'Join waitlist', waitDone: "✅ You're on the waitlist. We'll text you if a time opens.", otherDay: '← Pick another day',
      s5: 'How do we reach you?', name: 'Name', phone: 'Mobile phone', email: 'Email (optional, for your confirmation)', notes: 'Parking notes (optional)',
      notesPh: 'Driveway, underground, visitor spot…', mayContact: 'We may contact you about this booking.',
      phoneBad: 'Please enter a 10-digit phone number.', nameBad: 'Please enter your name.',
      s6: 'Check your details', when: 'When', service: 'Service', where: 'Where', vehicle: 'Vehicle', contact: 'Contact', tsize: 'Tire size',
      sizeEst: 'estimated from vehicle', sizeCust: 'entered by you', sizeUnk: "we'll confirm by phone",
      price: 'Service', off15: '15% off', zoneFee: 'Travel fee', subtotal: 'Subtotal', tax: 'Tax', total: 'Total',
      pay: 'Pay the tech when done: cash, card or e-transfer.', locked: "Price is locked based on your vehicle. If your tires turn out to be a different size, we'll let you know before we start.",
      noHidden: 'No hidden fees.', confirm: '✓ Send my request', booking: 'Sending…',
      priceChanged: 'The price was updated. Please review and confirm again.', offerGone: "Your 15% offer couldn't be applied (it may have expired or already been used). Please review the price.",
      limit: 'This phone number already has bookings today. Please call or text us.',
      doneT: "You're booked!", doneR: 'Request received!', doneRsub: "We'll call you shortly to confirm the time and give you your price.", bookingNo: 'Request #',
      emailSent: 'A copy of your request is in your email.', change: 'Need us sooner? Call or text (613) 601-6471.', addCal: '📅 Add to my calendar', addIcs: 'Download calendar file (.ics)',
      testDone: '🧪 Test booking saved. Check the Winter Swaps calendar, your email and the WhatsApp groups.',
      fbTitle: 'Online booking is having trouble right now', fbSub: "No problem: text us your booking and we'll confirm it fast.",
      fbBtn: '💬 Text us my booking', offerTitle: '15% off your first winter swap', offerSub: 'Valid 48 hours. New customers only.', offerYes: 'Claim 15% off', offerNo: 'No thanks',
      offerBar: '🏷️ 15% off applied. Valid until ', loading: 'Loading…', err: 'Something went wrong. Please try again.',
      tierFrom: 'Your price: ', plusTax: ' + tax', callPrice: "We'll call you shortly to confirm the time and give you your price.",
      prevWeek: 'Previous week', nextWeek: 'Next week', pickDay: 'Pick a day above to see open times.'
    },
    fr: {
      kicker: "❄ Réservation pneus d'hiver", title: "Réservez votre changement de pneus d'hiver", sub: 'On se déplace chez vous. Envoyez votre demande en 2 minutes et on vous appelle.',
      headline: "Changement de pneus d'hiver · montage et équilibrage inclus · on se déplace chez vous. On vous appelle pour confirmer le prix.",
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
      z1: '✅ Bonne nouvelle, on dessert votre secteur.', z2: '✅ Bonne nouvelle, on dessert votre secteur.', z3: '✅ Bonne nouvelle, on dessert votre secteur.',
      z0: 'Hors de notre zone de service — texte-nous en français ou en anglais.',
      multi: "J'ai 2 véhicules ou plus à cette adresse", multiWaived: 'Frais de déplacement annulés (2+ véhicules)',
      multiNote: 'Réservez une seule plage pour tous. On vous texte pour confirmer les autres véhicules.',
      whyQ: 'Pourquoi est-ce plus cher?',
      whyA: "Les pneus à profil bas ont des flancs courts et très rigides. Ils demandent plus de temps et un équipement spécial pour être montés sans égratigner ni plier vos jantes, et plusieurs sont des pneus à affaissement limité avec des capteurs de pression sensibles.",
      exT: 'Ce véhicule demande une soumission personnalisée — texte-nous en français ou en anglais',
      exSub: 'Les pneus de véhicules exotiques et haute performance demandent une manipulation spéciale; on les évalue un par un. Laissez vos coordonnées et on vous répond rapidement.',
      exSend: 'Envoyer ma demande', exDone: '✅ Reçu! On vous texte avec votre prix.', exAddr: 'Adresse ou secteur',
      zoneWord: 'zone',
      notFound: "Adresse introuvable. Ajoutez la ville (ex. Gatineau, Aylmer, Ottawa) et réessayez.",
      unchecked: '✅ Reçu. On confirmera votre secteur par texto.',
      s4: 'Choisissez le jour et la plage horaire', s4sub: 'Seules les plages libres sont affichées. Le technicien arrive dans votre plage et vous texte avant.',
      full: 'Complet', open1: 'libre(s)', held: '✓ On vous garde cette plage 10 minutes.', taken: "Désolé, cette plage vient d'être prise. Choisissez-en une autre.",
      waitTitle: 'Cette journée est complète', waitSub: "Inscrivez-vous sur la liste d'attente. Si une plage se libère, on vous texte en premier.", anyTime: "N'importe quand",
      joinWait: "M'inscrire", waitDone: "✅ Vous êtes sur la liste d'attente.", otherDay: '← Choisir un autre jour',
      s5: 'Comment vous joindre?', name: 'Nom', phone: 'Cellulaire', email: 'Courriel (facultatif, pour la confirmation)', notes: 'Stationnement (facultatif)',
      notesPh: 'Entrée, garage souterrain, visiteurs…', mayContact: 'Nous pourrions vous contacter au sujet de cette réservation.',
      phoneBad: 'Entrez un numéro à 10 chiffres.', nameBad: 'Entrez votre nom.',
      s6: 'Vérifiez vos informations', when: 'Quand', service: 'Service', where: 'Adresse', vehicle: 'Véhicule', contact: 'Contact', tsize: 'Taille',
      sizeEst: 'estimée selon le véhicule', sizeCust: 'entrée par vous', sizeUnk: 'à confirmer par téléphone',
      price: 'Service', off15: 'Rabais 15 %', zoneFee: 'Déplacement', subtotal: 'Sous-total', tax: 'Taxes', total: 'Total',
      pay: 'Paiement au technicien à la fin : comptant, carte ou virement Interac.', locked: "Le prix est basé sur votre véhicule. Si vos pneus sont d'une autre taille, on vous le dira avant de commencer.",
      noHidden: 'Aucuns frais cachés.', confirm: '✓ Envoyer ma demande', booking: 'Envoi…',
      priceChanged: 'Le prix a été mis à jour. Vérifiez et confirmez de nouveau.', offerGone: "Le rabais de 15 % n'a pas pu être appliqué (expiré ou déjà utilisé). Vérifiez le prix.",
      limit: "Ce numéro a déjà des réservations aujourd'hui. Texte-nous en français ou en anglais.",
      doneT: 'Réservation confirmée!', doneR: 'Demande reçue!', doneRsub: "On vous appelle bientôt pour confirmer l'heure et vous donner le prix.", bookingNo: 'Demande n°',
      emailSent: 'Une copie de votre demande est dans vos courriels.', change: 'Besoin de nous plus vite? Textez le (613) 601-6471.', addCal: '📅 Ajouter à mon calendrier', addIcs: 'Télécharger le fichier calendrier (.ics)',
      testDone: '🧪 Réservation test enregistrée. Vérifiez le calendrier, votre courriel et les groupes WhatsApp.',
      fbTitle: 'La réservation en ligne a un problème', fbSub: 'Textez-nous votre réservation et on confirme rapidement.',
      fbBtn: '💬 Texte-nous en français ou en anglais', offerTitle: 'Rabais de 15 % sur votre premier changement de pneus', offerSub: 'Valide 48 heures. Nouveaux clients seulement.', offerYes: 'Obtenir 15 %', offerNo: 'Non merci',
      offerBar: '🏷️ Rabais de 15 % appliqué. Valide jusqu\'au ', loading: 'Chargement…', err: 'Une erreur est survenue. Réessayez.',
      tierFrom: 'Votre prix : ', plusTax: ' + taxes', callPrice: "On vous appelle bientôt pour confirmer l'heure et vous donner le prix.", prevWeek: 'Semaine précédente', nextWeek: 'Semaine suivante', pickDay: 'Choisissez un jour ci-dessus pour voir les plages libres.', quebec: "Au Québec, les pneus d'hiver sont obligatoires du 1er décembre au 15 mars."
    }
  };
  // Summer mode (SETTINGS.SEASON = 'summer' in the script): only these lines change.
  var TS = {
    en: {
      kicker: '☀ Summer swap booking', title: 'Book your summer tire swap',
      headline: 'Summer tire swaps · mounting & balancing included · we come to you. We call to confirm your price.',
      onD: 'Your summer tires are already on their own rims. We swap the wheels.', offerTitle: '15% off your first summer swap'
    },
    fr: {
      kicker: "☀ Réservation pneus d'été", title: "Réservez votre changement de pneus d'été",
      headline: "Changement de pneus d'été · montage et équilibrage inclus · on se déplace chez vous. On vous appelle pour confirmer le prix.",
      onD: "Vos pneus d'été sont déjà sur leurs jantes. On change les roues.",
      quebec: "Au Québec, les pneus d'hiver peuvent être retirés après le 15 mars."
    }
  };
  var qsLang = (location.search.match(/[?&]lang=(fr|en)/) || [])[1] || window.BOOKING_LANG;   // French page sets BOOKING_LANG='fr'
  var qsSeason = (location.search.match(/[?&]season=(summer|winter)/) || [])[1];   // preview only (works in TEST MODE)
  var S = {
    lang: qsLang || lsGet('bk_lang') || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en'),
    season: 'winter', week: 0, step: 1, cfg: null, rows: [], session: lsGet('bk_session') || rid(),
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
  function t(k) {
    var v = (S.season === 'summer' && TS[S.lang] && TS[S.lang][k]) || (T[S.lang] && T[S.lang][k]) || T.en[k] || k;
    return v.indexOf('{MIN}') >= 0 ? v.replace('{MIN}', minPrice()) : v;
  }
  function minPrice() {
    var p = S.cfg && S.cfg.prices, m = 160;
    if (p) { m = Infinity; Object.keys(p).forEach(function (k) { if (+p[k] < m) m = +p[k]; }); }
    return money(m);
  }
  function seasonWord() { return S.season === 'summer' ? 'summer' : 'winter'; }
  function rid() { return 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { n = Math.round(n * 100) / 100; var s = n % 1 ? n.toFixed(2) : String(n); return S.lang === 'fr' ? s.replace('.', ',') + ' $' : '$' + s; }

  // ---------------------------------------------------------------- API
  function withTimeout(p, ms) { return Promise.race([p, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('timeout')); }, ms); })]); }
  // Google sometimes answers with a one-off 404 (~1 in 22 calls). Wait 1 s and try again before giving up.
  // Bookings, waitlist and custom-quote requests are only resent when Google clearly did NOT run the script
  // (an error status like 404), never after a timeout, so nobody gets booked or posted twice.
  var SAFE_TO_RESEND = { zone: 1, hold: 1, offer: 1, draft: 1, photo: 1 };
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function callApi(url, opts, retries, ms, anyError) {
    return withTimeout(fetch(url, opts), ms).then(function (r) {
      if (!r.ok) { var e = new Error('http_' + r.status); e.notRun = true; throw e; }
      return r.json();
    }).catch(function (e) {
      if (retries > 0 && (e.notRun || anyError)) return sleep(1000).then(function () { return callApi(url, opts, retries - 1, ms, anyError); });
      throw e;
    });
  }
  function apiGet(action, params) {
    if (!API || API.indexOf('PASTE') >= 0) return Promise.reject(new Error('no_api'));
    var q = '?action=' + encodeURIComponent(action);
    Object.keys(params || {}).forEach(function (k) { q += '&' + k + '=' + encodeURIComponent(params[k]); });
    return callApi(API + q, { method: 'GET' }, action === 'vehicles' ? 2 : 1, 20000, true);
  }
  function apiPost(obj) {
    if (!API || API.indexOf('PASTE') >= 0) return Promise.reject(new Error('no_api'));
    return callApi(API, { method: 'POST', body: JSON.stringify(obj) }, 1, 30000, !!SAFE_TO_RESEND[obj.action]);
  }

  // ---------------------------------------------------------------- pricing (preview; the server has the final say)
  function parseSize(s) {
    var m = String(s || '').toUpperCase().replace(/\s+/g, '').match(/^(P|LT)?(\d{3})\/(\d{2})Z?R(\d{2}(?:\.\d)?)/);
    return m ? { lt: m[1] === 'LT', aspect: +m[3], rim: +m[4], text: (m[1] === 'LT' ? 'LT' : '') + m[2] + '/' + m[3] + 'R' + m[4] } : null;
  }
  function nrm(x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(); }
  function isExoticModel(make, model, trim) {
    var R = S.cfg.rules;
    if (R.exoticMakes.some(function (b) { return nrm(b) === nrm(make); })) return true;
    var mt = nrm(model + ' ' + (trim || ''));
    return R.exoticModels.some(function (x) { return nrm(x[0]) === nrm(make) && mt.indexOf(nrm(x[1])) >= 0; });
  }
  // Mirrors tierFor_ in the script (the script has the final say).
  function tierFor(size, cls, make, model, trim) {
    var R = S.cfg.rules, p = parseSize(size);
    var prem = R.premiumBrands.some(function (b) { return nrm(b) === nrm(make); });
    if (isExoticModel(make, model, trim)) return 'EXOTIC';
    if (cls === 'pickup' || cls === 'large_suv') {
      if (p && p.rim >= 24) return 'EXOTIC';
      return (p && (p.rim >= R.pickupLowMinRim || p.aspect <= R.pickupLowMaxAspect)) ? 'PICKUP_LOW' : 'PICKUP';
    }
    if (!p) return prem ? 'PREMIUM' : 'STANDARD';
    if (p.rim >= R.exoticMinRim) return 'EXOTIC';
    if (p.aspect <= R.ultraLowMaxAspect) return 'ULTRA_LOW';
    if (p.rim >= 21) return 'LOW';
    if (p.rim >= R.bigRimMin) return p.aspect <= R.bigRimLowMaxAspect ? 'LOW' : 'LARGE19';
    if (p.aspect <= R.lowMaxAspect) return 'LOW';
    if (prem) return 'PREMIUM';
    return p.rim <= R.standardMaxRim ? 'STANDARD' : 'R17';
  }
  function currentTier() {
    var v = S.veh, typed = parseSize(v.typed);
    if (v.mode === 'other') return tierFor(typed ? typed.text : '', 'car', v.oMake, v.oModel, '');
    if (typed) return tierFor(typed.text, v.cls, v.make, v.model, v.trim);
    return v.tier || 'STANDARD';
  }
  function isExotic() { return S.cfg && currentTier() === 'EXOTIC'; }
  function isLowProfile(tier) { return (S.cfg.lowProfileTiers || []).indexOf(tier) >= 0; }
  function whyHtml(tier) {
    return isLowProfile(tier) ? '<details class="bk-why"><summary>' + t('whyQ') + '</summary><p>' + t('whyA') + '</p></details>' : '';
  }
  function basePrice(service, tires, tier) {
    var c = S.cfg;
    if (service === 'on') {   // on-rim: one price for cars/SUVs, one for pickups/large SUVs (settings in the script)
      var grp = c.onRim[(tier === 'PICKUP' || tier === 'PICKUP_LOW') ? 'PICKUP' : 'CAR'];
      return +(grp ? grp[tires] : c.onRim[tires]);
    }
    return tires === 4 ? +c.prices[tier] : +c.twoTireOffRim[tier];
  }
  function quote() {
    var tier = currentTier(), base = basePrice(S.service, S.tires, tier);
    var pct = S.offer ? (+S.cfg.offerPercent || 0) : 0;
    var full = S.zone ? (+S.zone.fee || 0) : 0, waived = S.multiCar && S.cfg.multiCarWaivesFee ? full : 0;
    var disc = Math.round(base * pct) / 100, fee = full - waived;
    var sub = Math.round((base - disc + fee) * 100) / 100;
    var rate = S.cfg.taxRates[(S.zone && S.zone.province) || 'ON']; if (rate == null) rate = S.cfg.taxRates.ON;
    var tax = Math.round(sub * rate * 100) / 100;
    return { tier: tier, base: base, pct: pct, disc: disc, fee: fee, waived: waived, sub: sub, tax: tax, total: Math.round((sub + tax) * 100) / 100 };
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
  function stepsBar() { var h = '<div class="bk-steps" aria-hidden="true">'; for (var i = 1; i <= 5; i++) h += '<i class="' + (i <= (S.step >= 4 ? S.step - 1 : S.step) ? 'on' : '') + '"></i>'; return h + '</div>'; }
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
    if (!step1Basics()) return '';
    if (isExotic()) return exoticHtml();
    var q = quote();
    return '';   // prices hidden: we call to confirm the price
  }
  function exoticHtml() {
    if (S.exoticDone) return '<div class="bk-exotic"><p class="bk-ok" style="font-size:16px">' + t('exDone') + '</p></div>';
    var textOnly = S.lang === 'fr' && !FR_CALLS;
    return '<div class="bk-exotic"><div style="font-size:30px">🏎️</div><h3>' + t('exT') + '</h3><p class="bk-sub">' + t('exSub') + '</p>' +
      '<a class="bk-btn green" href="' + PHONE_SMS + '">💬 ' + (S.lang === 'fr' ? 'Texto' : 'Text us') + '</a>' +
      (textOnly ? '' : '<a class="bk-btn ghost" href="tel:+16136016471">📞 ' + (S.lang === 'fr' ? 'Appeler' : 'Call') + ' (613) 601-6471</a>') +
      '<label class="bk-label" for="bk-xn">' + t('name') + '</label><input class="bk-input" id="bk-xn" value="' + esc(S.c.name) + '">' +
      '<label class="bk-label" for="bk-xp">' + t('phone') + ' *</label><input class="bk-input" id="bk-xp" type="tel" inputmode="tel" value="' + esc(S.c.phone) + '">' +
      '<label class="bk-label" for="bk-xa">' + t('exAddr') + '</label><input class="bk-input" id="bk-xa" value="' + esc(S.addrText) + '">' +
      '<div class="bk-err" id="bk-x-err"></div><button class="bk-btn" type="button" data-act="exotic">' + (S.busy ? '<span class="bk-spin"></span>' : t('exSend')) + '</button></div>';
  }
  function refreshStep1(force) {
    var w = document.getElementById('bk-chip-wrap');
    // keep the custom-quote form (and what the customer typed) if it's already showing
    var keep = !force && w && w.querySelector('.bk-exotic') && step1Basics() && isExotic();
    if (w && !keep) w.innerHTML = chipHtml();
    var b = root.querySelector('[data-act="next"]'); if (b) b.disabled = !step1Ready();
    var e = document.getElementById('bk-size-err'); if (e) e.textContent = S.veh.typed && !parseSize(S.veh.typed) ? t('sizeBad') : '';
  }
  function markStarted() {   // picked a car → if they leave before confirming, the 15% offer can show (assets/offer.js)
    if (S.cfg && !S.done && step1Basics() && !isExotic() && !lsGet('bk_started')) lsSet('bk_started', String(Date.now()));
  }
  function step1Basics() {
    var v = S.veh;
    if (v.typed && !parseSize(v.typed)) return false;
    if (v.mode === 'other') return !!(v.oMake && v.oModel);
    return !!(v.year && v.make && v.model && (v.trim || v.unsure) && v.id);
  }
  function step1Ready() {
    if (S.cfg && step1Basics() && isExotic()) return false;
    var v = S.veh;
    if (v.typed && !parseSize(v.typed)) return false;
    if (v.mode === 'other') return !!(v.oMake && v.oModel);
    return !!(v.year && v.make && v.model && (v.trim || v.unsure) && v.id);
  }

  function step2() {
    var tier = currentTier();
    function card(key, desc, service) {
      var p = basePrice(service, S.tires, tier);
      return '<button type="button" class="bk-opt' + (S.service === service ? ' sel' : '') + '" data-act="svc" data-v="' + service + '"><b>' + t(key) + '</b><small>' + t(desc) + '</small></button>';
    }
    return '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s2') + '</h2>' + card('off', 'offD', 'off') + card('on', 'onD', 'on') +
      '<label class="bk-label">' + t('howMany') + '</label><div class="bk-toggle"><button type="button" data-act="tires" data-v="4" class="' + (S.tires === 4 ? 'sel' : '') + '">' + t('t4') + '</button>' +
      '<button type="button" data-act="tires" data-v="2" class="' + (S.tires === 2 ? 'sel' : '') + '">' + t('t2') + '</button></div>' +
      '<button class="bk-btn" type="button" data-act="next">' + t('next') + '</button><button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
  }

  function zoneOk() { return S.zone && !S.zone.error && S.zone.zone >= 1 && S.zone.zone <= 3; }
  function zoneHtml() {
    var z = S.zone; if (!z) return '';
    if (z.error) return '<div class="bk-zone z0">' + t(z.error === 'not_found' || z.error === 'address_short' ? 'notFound' : 'err') + '</div>';
    if (!z.checked) return '<div class="bk-zone z1">' + t('unchecked') + '</div>';
    if (z.zone === 0) {
      var textOnly = S.lang === 'fr' && !FR_CALLS;
      return '<div class="bk-zone z0">' + t('z0') + '<br><small>' + esc(z.formatted) + '</small>' +
        '<a class="bk-btn ' + (textOnly ? 'green' : '') + '" href="' + (textOnly ? PHONE_SMS : 'tel:+16136016471') + '">' + (textOnly ? '💬 Texto' : '📞 (613) 601-6471') + '</a></div>';
    }
    var cls = z.zone === 1 ? 'z1' : 'z2';
    var msg = z.zone === 1 ? t('z1') : t(z.zone === 2 ? 'z2' : 'z3').replace('FEE', z.fee);
    var h = '<div class="bk-zone ' + cls + '">' + msg + '<br><small>' + esc(z.formatted) + '</small></div>';
    h += '<label class="bk-check"><input type="checkbox" data-act="multi"' + (S.multiCar ? ' checked' : '') + '> ' + t('multi') + '</label>';
    if (S.multiCar) h += '<p class="bk-hint">' + t('multiNote') + '</p>';
    return h;
  }
  function step3() {
    var ok = zoneOk();
    return '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s3') + '</h2>' +
      '<label class="bk-label" for="bk-addr">' + t('addr') + '</label><input class="bk-input" id="bk-addr" data-f="addr" autocomplete="street-address" placeholder="' + t('addrPh') + '" value="' + esc(S.addrText) + '">' +
      '<button class="bk-btn ghost" type="button" data-act="zone">' + (S.busy ? '<span class="bk-spin"></span>' : t('check')) + '</button>' + zoneHtml() +
      '<button class="bk-btn" type="button" data-act="next"' + (ok ? '' : ' disabled') + '>' + t('next') + '</button><button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
  }

  function step4() {
    var h = '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('s4') + '</h2><p class="bk-sub">' + t('s4sub') + '</p>';
    if (!S.days.length) return h + '<p>' + (S.busy ? t('loading') : t('err')) + '</p><button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
    var wk = Math.min(S.week || 0, weekCount() - 1), vis = S.days.slice(wk * WK, wk * WK + WK);
    h += '<div class="bk-week"><button type="button" class="bk-wk-nav" data-act="wk" data-v="-1" aria-label="' + t('prevWeek') + '"' + (wk === 0 ? ' disabled' : '') + '>←</button>' +
      '<div class="bk-month">' + esc(monthLabel(vis)) + '</div>' +
      '<button type="button" class="bk-wk-nav" data-act="wk" data-v="1" aria-label="' + t('nextWeek') + '"' + (wk >= weekCount() - 1 ? ' disabled' : '') + '>→</button></div>';
    h += '<div class="bk-days">' + vis.map(function (d) {
      var p = (S.lang === 'fr' ? d.labelFr : d.label).split(' ');
      var full = d.open === 0;
      return '<button type="button" class="bk-day' + (full ? ' full' : '') + (S.date === d.date ? ' sel' : '') + '" data-act="day" data-v="' + d.date + '"><small>' + esc(p[0]) + '</small><b>' + esc(S.lang === 'fr' ? p[1] : p[2]) + '</b><small>' + esc(S.lang === 'fr' ? p[2] : p[1]) + '</small><em>' + (full ? t('full') : d.open + ' ' + t('open1')) + '</em></button>';
    }).join('') + '</div>';
    var day = vis.filter(function (d) { return d.date === S.date; })[0];
    if (!day) h += '<p class="bk-hint">' + t('pickDay') + '</p>';
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

  var WK = 7;
  function weekCount() { return Math.max(1, Math.ceil(S.days.length / WK)); }
  function weekOf(ds) { for (var i = 0; i < S.days.length; i++) if (S.days[i].date === ds) return Math.floor(i / WK); return 0; }
  function ymd(ds) { var p = ds.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function monthLabel(vis) {
    if (!vis.length) return '';
    var loc = S.lang === 'fr' ? 'fr-CA' : 'en-CA', a = ymd(vis[0].date), b = ymd(vis[vis.length - 1].date);
    function m(d, yr, cap) { var x = d.toLocaleDateString(loc, yr ? { month: 'long', year: 'numeric' } : { month: 'long' }); return cap ? x.charAt(0).toUpperCase() + x.slice(1) : x; }
    var cap2 = S.lang !== 'fr';   // French: only the first word is capitalised
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) return m(a, true, true);
    return a.getFullYear() === b.getFullYear() ? m(a, false, true) + ' – ' + m(b, true, cap2) : m(a, true, true) + ' – ' + m(b, true, cap2);
  }
  function goWeek(dir) {
    S.week = Math.max(0, Math.min(weekCount() - 1, (S.week || 0) + dir));
    var vis = S.days.slice(S.week * WK, S.week * WK + WK), f = vis.filter(function (d) { return d.open; })[0];
    S.date = f ? f.date : ''; S.slot = ''; S.slotErr = ''; render();
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
      '<div><span>' + t('service') + '</span><span>' + esc(svc) + '</span></div>' +
      '<div><span>' + t('vehicle') + '</span><span>' + esc(vehicleLabel()) + '</span></div>' +
      '<div><span>' + t('tsize') + '</span><span>' + esc(sizeLabel()) + '</span></div>' +
      '<div><span>' + t('where') + '</span><span>' + esc(S.zone.formatted) + '</span></div>' +
      '<div><span>' + t('contact') + '</span><span>' + esc(S.c.name + ' · ' + S.c.phone) + '</span></div></div>' +
      '<p class="bk-note" style="font-size:16px"><b>' + t('callPrice') + '</b></p><p class="bk-note">' + t('pay') + '</p>' +
      '<div class="bk-err" id="bk-book-err">' + (S.bookErr || '') + '</div>' +
      '<button class="bk-btn green" type="button" data-act="book"' + (S.busy ? ' disabled' : '') + '>' + (S.busy ? '<span class="bk-spin"></span> ' + t('booking') : t('confirm')) + '</button>' +
      '<button class="bk-btn ghost" type="button" data-act="back">' + t('back') + '</button></div>';
    return h;
  }

  function doneHtml() {
    var d = S.done;
    return '<div class="bk-card bk-done"><div class="big">✅</div><h2 class="bk-title">' + t('doneR') + '</h2>' +
      '<p class="bk-sub" style="font-size:17px"><b>' + t('doneRsub') + '</b></p>' +
      '<div class="bk-sum" style="text-align:left"><div><span>' + t('bookingNo') + '</span><span>' + esc(d.bookingNo) + '</span></div></div>' +
      (d.emailed ? '<p class="bk-note">' + t('emailSent') + '</p>' : '') + '<p class="bk-note">' + t('change') + '</p>' +
      (d.testMode ? '<p class="bk-note" style="color:#ffd27a">' + t('testDone') + '</p>' : '') + '</div>';
  }

  function calDates(d) {
    function f(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    return f(d.start) + '/' + f(d.end);
  }
  function gcalLink(d) {
    var title = S.lang === 'fr' ? 'Changement de pneus ' + (S.season === 'summer' ? "d'été" : "d'hiver") + ' (Mobile Tire Repair Ottawa)' : (S.season === 'summer' ? 'Summer' : 'Winter') + ' tire swap (Mobile Tire Repair Ottawa)';
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + calDates(d) +
      '&details=' + encodeURIComponent(d.bookingNo + ' · ' + t('change')) + '&location=' + encodeURIComponent(d.address || '');
  }
  function icsHref(d) {
    var dt = calDates(d).split('/');
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MTRO//Booking//EN', 'BEGIN:VEVENT', 'UID:' + d.bookingNo + '@mobiletirerepairottawa.ca',
      'DTSTAMP:' + dt[0], 'DTSTART:' + dt[0], 'DTEND:' + dt[1], 'SUMMARY:' + (S.season === 'summer' ? 'Summer' : 'Winter') + ' tire swap (Mobile Tire Repair Ottawa)',
      'LOCATION:' + String(d.address || '').replace(/,/g, '\\,'), 'DESCRIPTION:' + d.bookingNo, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  }

  // ---------------------------------------------------------------- fallback (script down)
  function smsBody() {
    var v = S.veh;
    var lines = [seasonWord().toUpperCase() + ' SWAP BOOKING'];
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
    if (['year', 'make', 'model', 'trim', 'typed', 'oYear', 'oMake', 'oModel'].indexOf(f) >= 0) S.exoticDone = false;
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
    else if (f === 'typed' || f === 'oYear' || f === 'oMake' || f === 'oModel') { v[f] = val.trim(); refreshStep1(); return markStarted(); }
    else if (f === 'addr') { S.addrText = val.trim(); return; }
    else if (f === 'name' || f === 'phone' || f === 'email' || f === 'notes') { S.c[f] = val.trim(); return; }
    render(); markStarted();
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
    if (act === 'multi') { S.multiCar = el.checked; return render(); }
    if (act === 'exotic') return sendExotic();
    if (act === 'lang') { S.lang = S.lang === 'fr' ? 'en' : 'fr'; lsSet('bk_lang', S.lang); return render(); }
    if (act === 'other') { S.veh.mode = 'other'; applyRow(null); return render(); }
    if (act === 'list') { S.veh.mode = 'list'; return render(); }
    if (act === 'svc') { S.service = val; return render(); }
    if (act === 'tires') { S.tires = +val; return render(); }
    if (act === 'back') { S.bookErr = ''; S.step = Math.max(1, S.step === 5 ? 3 : S.step - 1); return render(); }
    if (act === 'next') return next();
    if (act === 'zone') return checkZone();
    if (act === 'wk') return goWeek(+val);
    if (act === 'day') return pickDay(val);
    if (act === 'slot') return pickSlot(val);
    if (act === 'wait') return joinWait();
    if (act === 'unwait') { S.waitDay = null; return render(); }
    if (act === 'book') return book();
  });

  function next() {
    if (S.step === 1 && !step1Ready()) return;
    if (S.step === 3 && !zoneOk()) return;
    if (S.step === 5) {
      var err = document.getElementById('bk-c-err');
      ['name', 'phone', 'email', 'notes'].forEach(function (k) { var i = document.getElementById('bk-' + k); if (i) S.c[k] = i.value.trim(); });
      if (!S.c.name) { err.textContent = t('nameBad'); return; }
      if (!cleanPhone(S.c.phone)) { err.textContent = t('phoneBad'); return; }
      sendDraft();
    }
    S.step = S.step === 3 ? 5 : S.step + 1;   // no time step: we call to confirm the time
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
      S.week = S.date ? weekOf(S.date) : 0;
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

  function sendExotic() {
    var n = document.getElementById('bk-xn').value.trim(), p = document.getElementById('bk-xp').value.trim(), a = document.getElementById('bk-xa').value.trim();
    var err = document.getElementById('bk-x-err');
    if (!cleanPhone(p)) { err.textContent = t('phoneBad'); return; }
    S.c.name = n; S.c.phone = p; S.addrText = a; S.busy = true; refreshStep1(true);
    var v = S.veh, typed = parseSize(v.typed);
    apiPost({ action: 'exotic', name: n, phone: p, address: a, vehicle: vehicleLabel(), size: typed ? typed.text : (v.mode === 'list' ? v.size : ''),
              service: S.service, tires: S.tires, lang: S.lang, ref: S.ref, hp: '' }).then(function (r) {
      S.busy = false; if (r.ok) { S.exoticDone = true; refreshStep1(true); } else { refreshStep1(true); var e = document.getElementById('bk-x-err'); if (e) e.textContent = t('err'); }
    }).catch(function () { S.busy = false; goFallback(); });
  }

  function book() {
    if (S.busy) return;
    var hp = document.getElementById('bk-hp');
    var q = quote(), v = S.veh;
    S.busy = true; S.bookErr = ''; render();
    var payload = {
      action: 'lead', session: S.session, lang: S.lang, hp: hp ? hp.value : '',
      vehicleId: v.mode === 'list' ? v.id : '', year: v.mode === 'list' ? v.year : v.oYear, make: v.mode === 'list' ? v.make : v.oMake,
      model: v.mode === 'list' ? v.model : v.oModel, trim: v.trim, trimUnsure: v.unsure, vehicleClass: v.mode === 'list' ? v.cls : 'car',
      sizeTyped: parseSize(v.typed) ? v.typed : '', photoUrl: v.photoUrl, service: S.service, tires: S.tires,
      address: S.addrText, addressFormatted: S.zone.formatted,
      name: S.c.name, phone: S.c.phone, email: S.c.email, notes: S.c.notes, offerId: S.offer ? S.offer.offerId : '', expectedSubtotal: null, ref: S.ref, multiCar: !!S.multiCar
    };
    apiPost(payload).then(function (r) {
      S.busy = false;
      if (r.ok) {
        S.done = r;
        if (S.offer) { S.offer.used = true; lsSet('bk_offer', JSON.stringify(S.offer)); S.offer = null; }
        lsSet('bk_booked', '1'); lsSet('bk_started', '');
        fireConversion(r);
        return render();
      }
      
      if (r.error === 'offer_invalid') { S.offer = null; lsSet('bk_offer', 'null'); S.bookErr = t('offerGone'); return render(); }
      if (r.error === 'price_changed') { S.bookErr = t('priceChanged'); return render(); }
      if (r.error === 'limit') { S.bookErr = t('limit'); return render(); }
      if (r.error === 'exotic') { S.step = 1; return render(); }
      if (r.error === 'phone' || r.error === 'name') { S.step = 5; return render(); }
      if (r.error === 'outside' || r.error === 'address') { S.step = 3; return render(); }
      goFallback();
    }).catch(function () { S.busy = false; goFallback(); });
  }

  function fireConversion(r) {
    try {
      if (r.testMode || !S.cfg.adsBookingLabel || !window.gtag || !window.TRACKING) return;
      window.gtag('event', 'conversion', { send_to: window.TRACKING.ADS_ID + '/' + S.cfg.adsBookingLabel, value: 1, currency: 'CAD', transaction_id: r.bookingNo });
      window.gtag('event', 'booking_confirmed', { value: 1, currency: 'CAD', booking_no: r.bookingNo });
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

  // ---------------------------------------------------------------- 15% leaving offer
  // The popup + triggers live in /assets/offer.js (shared with the homepage and winter page).
  // Here we only tell it when it may show, whether a car is picked, and how to apply the offer.
  window.MTRO_OFFER = {
    canShow: function () { return !!S.cfg && !S.fatal && !S.done && !S.offer && !S.busy; },
    started: function () { return !!S.cfg && !S.done && step1Basics() && !isExotic(); },
    text: function () { return { title: t('offerTitle'), sub: t('offerSub'), yes: t('offerYes'), no: t('offerNo') }; },
    claim: function () {
      apiPost({ action: 'offer', session: S.session }).then(function (r) {
        if (r.ok) { S.offer = { offerId: r.offerId, expires: r.expires, percent: r.percent }; lsSet('bk_offer', JSON.stringify(S.offer)); render(); }
      }).catch(function () {});
    }
  };

  // ---------------------------------------------------------------- start
  render();
  Promise.all([apiGet('config'), apiGet('vehicles')]).then(function (res) {
    if (!res[0].ok || !res[1].ok) return goFallback();
    S.cfg = res[0]; S.rows = res[1].rows;
    S.season = S.cfg.season === 'summer' ? 'summer' : 'winter';
    if (S.cfg.testMode && qsSeason) S.season = qsSeason;   // ?season=summer preview while in TEST MODE
    document.title = t('title') + ' | Mobile Tire Repair Ottawa';
    if (S.season === 'summer') { var sn = document.getElementById('snow'); if (sn) sn.style.display = 'none'; }   // no snowfall in summer
    render();
  }).catch(function () { goFallback(); });
  window.__bk = S; // for testing
})();
