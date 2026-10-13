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
      pay: 'Pay the tech when done: cash, card or e-transfer.',
      confirm: '✓ Send my request', booking: 'Sending…',
      priceChanged: 'Please review your request and confirm again.', offerGone: "That offer couldn't be applied (it may have expired or already been used). Call for a quote.",
      limit: 'This phone number already has bookings today. Please call or text us.',
      doneT: "You're booked!", doneR: 'Request received!', doneRsub: "We'll call you shortly to confirm the time and give you your price.", bookingNo: 'Request #',
      emailSent: 'A copy of your request is in your email.', change: 'Need us sooner? Call or text (613) 601-6471.', addCal: '📅 Add to my calendar', addIcs: 'Download calendar file (.ics)',
      testDone: '🧪 Test booking saved. Check the Winter Swaps calendar, your email and the WhatsApp groups.',
      fbTitle: 'Online booking is having trouble right now', fbSub: "No problem: text us your booking and we'll confirm it fast.",
      fbBtn: '💬 Text us my booking', offerTitle: 'Call for a quote', offerSub: 'We will call you to confirm the time.', offerYes: 'Call for a quote', offerNo: 'No thanks',
      offerBar: '', loading: 'Loading…', err: 'Something went wrong. Please try again.',
      callPrice: "We'll call you shortly to confirm the time and give you your price.",
      prevWeek: 'Previous week', nextWeek: 'Next week', pickDay: 'Pick a day above to see open times.',
      fTitle: 'Your details', req: 'required',
      car: 'Car make & model or tire size — whichever you know', carHint: "Fill in one or both. Not sure? Make and model is enough.",
      carMM: 'Make & model', carPh: 'e.g. Toyota RAV4', or: 'or', sizeOnly: 'Tire size', 
      area: 'City or neighbourhood', areaPh: 'e.g. Kanata, Orleans, Gatineau',
      more: '+ More details (optional)', fAddr: 'Full street address (optional)', fAddrPh: 'e.g. 123 Greenbank Rd',
      yearTrim: 'Year / trim (optional)', yearPh: 'Year', trimPh: 'Trim, e.g. LE', when2: 'Preferred time (optional)', anyT: 'Any time',
      svcQ: 'Service', send: '✓ Send my request', needCar: "Please enter your car's make and model, or your tire size.",
      needArea: 'Please enter your city or neighbourhood.', fNote: "We'll call you to confirm the time and give you your price. Pay the tech when done.",
      ctQ: 'Best time to call you?', ctOpt: 'optional', ctDay: 'Which day?', ctToday: 'Today', ctTomorrow: 'Tomorrow', ctPick: 'Pick a date', ctDate: 'Date',
      ctAsap: 'Now / ASAP', ctMorning: 'Morning (9–12)', ctAfternoon: 'Afternoon (12–5)', ctEvening: 'Evening (5–8)', ctChosen: 'We\'ll call:', ctClear: 'Clear'
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
      pay: 'Paiement au technicien à la fin : comptant, carte ou virement Interac.',
      confirm: '✓ Envoyer ma demande', booking: 'Envoi…',
      priceChanged: 'Vérifiez votre demande et confirmez de nouveau.', offerGone: "Cette offre n'a pas pu être appliquée (expirée ou déjà utilisée). Appelez pour une soumission.",
      limit: "Ce numéro a déjà des réservations aujourd'hui. Texte-nous en français ou en anglais.",
      doneT: 'Réservation confirmée!', doneR: 'Demande reçue!', doneRsub: "On vous appelle bientôt pour confirmer l'heure et vous donner le prix.", bookingNo: 'Demande n°',
      emailSent: 'Une copie de votre demande est dans vos courriels.', change: 'Besoin de nous plus vite? Textez le (613) 601-6471.', addCal: '📅 Ajouter à mon calendrier', addIcs: 'Télécharger le fichier calendrier (.ics)',
      testDone: '🧪 Réservation test enregistrée. Vérifiez le calendrier, votre courriel et les groupes WhatsApp.',
      fbTitle: 'La réservation en ligne a un problème', fbSub: 'Textez-nous votre réservation et on confirme rapidement.',
      fbBtn: '💬 Texte-nous en français ou en anglais', offerTitle: 'Appelez pour une soumission', offerSub: 'On vous appelle pour confirmer l\'heure.', offerYes: 'Appelez pour une soumission', offerNo: 'Non merci',
      offerBar: '', loading: 'Chargement…', err: 'Une erreur est survenue. Réessayez.',
      callPrice: "On vous appelle bientôt pour confirmer l'heure et vous donner le prix.", prevWeek: 'Semaine précédente', nextWeek: 'Semaine suivante', pickDay: 'Choisissez un jour ci-dessus pour voir les plages libres.', quebec: "Au Québec, les pneus d'hiver sont obligatoires du 1er décembre au 15 mars.",
      fTitle: 'Vos informations', req: 'obligatoire',
      car: 'Marque et modèle du véhicule ou taille des pneus — ce que vous savez', carHint: "Remplissez l'un ou les deux. Pas sûr? La marque et le modèle suffisent.",
      carMM: 'Marque et modèle', carPh: 'ex. Toyota RAV4', or: 'ou', sizeOnly: 'Taille des pneus',
      area: 'Ville ou quartier', areaPh: 'ex. Gatineau, Aylmer, Orléans',
      more: '+ Plus de détails (facultatif)', fAddr: 'Adresse complète (facultatif)', fAddrPh: 'ex. 123 rue Principale',
      yearTrim: 'Année / version (facultatif)', yearPh: 'Année', trimPh: 'Version, ex. LE', when2: 'Heure préférée (facultatif)', anyT: "N'importe quand",
      svcQ: 'Service', send: '✓ Envoyer ma demande', needCar: 'Entrez la marque et le modèle du véhicule, ou la taille des pneus.',
      needArea: 'Entrez votre ville ou quartier.', fNote: "On vous appelle pour confirmer l'heure et vous donner le prix. Paiement au technicien à la fin.",
      ctQ: 'Meilleur moment pour vous appeler?', ctOpt: 'facultatif', ctDay: 'Quel jour?', ctToday: "Aujourd'hui", ctTomorrow: 'Demain', ctPick: 'Choisir une date', ctDate: 'Date',
      ctAsap: 'Maintenant / dès que possible', ctMorning: 'Matin (9 h–12 h)', ctAfternoon: 'Après-midi (12 h–17 h)', ctEvening: 'Soir (17 h–20 h)', ctChosen: 'On vous appelle :', ctClear: 'Effacer'
    }
  };
  // Summer mode (SETTINGS.SEASON = 'summer' in the script): only these lines change.
  var TS = {
    en: {
      kicker: '☀ Summer swap booking', title: 'Book your summer tire swap',
      headline: 'Summer tire swaps · mounting & balancing included · we come to you. We call to confirm your price.',
      onD: 'Your summer tires are already on their own rims. We swap the wheels.', offerTitle: 'Call for a quote'
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
    veh: { mode: 'other', year: '', make: '', model: '', trim: '', unsure: false, id: '', cls: 'car', tier: 'STANDARD', size: '', verified: false,
           oYear: '', oMake: '', oModel: '', typed: '', photoUrl: '', car: '', oTrim: '' },
    service: 'off', tires: 4, zone: null, addrText: '', days: [], date: '', dateLabel: '', slot: '', slotLabel: '', hold: 0,
    c: { name: '', phone: '', email: '', notes: '' }, area: '', pref: '', more: false, callDay: '', callDate: '', callPart: '', offer: null, done: null, busy: false, waitDay: null, draftSent: ''
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
    return v;
  }
  function seasonWord() { return S.season === 'summer' ? 'summer' : 'winter'; }
  function rid() { return 'S' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

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
  function stepsBar() { return ''; }   // one screen now: no progress bar
  function offerBar() {
    return '';   // no prices or discounts shown
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
    else h = step1();
    root.innerHTML = S.fatal ? h : shell(h);
    document.documentElement.lang = S.lang === 'fr' ? 'fr-CA' : 'en-CA';
    relabelFloatBar();
    bindAfterRender();
  }

  // ---------------------------------------------------------------- the one-screen form
  // Required: name, phone, area, and EITHER make & model OR tire size. Everything else is optional.
  var AREAS = ['Ottawa', 'Kanata', 'Nepean', 'Orleans', 'Barrhaven', 'Gloucester', 'Stittsville', 'Riverside South', 'Vanier', 'Manotick', 'Gatineau', 'Aylmer', 'Hull'];
  function splitCar(txt) {   // "Toyota RAV4 Hybrid" -> make 'Toyota', model 'RAV4 Hybrid'
    var w = String(txt || '').trim().split(/\s+/);
    if (w.length > 1 && /^(land|alfa|aston|mercedes)$/i.test(w[0])) w = [w[0] + ' ' + w[1]].concat(w.slice(2));
    return { make: w[0] || '', model: w.slice(1).join(' ') };
  }
  function syncCar() { var v = S.veh, c = splitCar(v.car); v.mode = 'other'; v.oMake = c.make; v.oModel = c.model; }
  function hasCar() { return !!S.veh.car; }
  function hasSize() { return !!parseSize(S.veh.typed); }
  function step1Basics() { return hasCar() || hasSize(); }   // enough to send the "almost booked" alert (with a phone)
  function step1Ready() { return step1Basics(); }
  function isExoticSafe() { if (S.forceExotic) return true; try { return !!(S.cfg && S.cfg.rules && isExotic()); } catch (e) { return false; } }
  function chipHtml() { return isExoticSafe() ? exoticHtml() : ''; }
  function exoticHtml() {
    if (S.exoticDone) return '<div class="bk-exotic"><p class="bk-ok" style="font-size:16px">' + t('exDone') + '</p></div>';
    var textOnly = S.lang === 'fr' && !FR_CALLS;
    return '<div class="bk-exotic"><div style="font-size:30px">🏎️</div><h3>' + t('exT') + '</h3><p class="bk-sub">' + t('exSub') + '</p>' +
      '<a class="bk-btn green" href="' + PHONE_SMS + '">💬 ' + (S.lang === 'fr' ? 'Texto' : 'Text us') + '</a>' +
      (textOnly ? '' : '<a class="bk-btn ghost" href="tel:+16136016471">📞 ' + (S.lang === 'fr' ? 'Appeler' : 'Call') + ' (613) 601-6471</a>') +
      '<button class="bk-btn" type="button" data-act="exotic">' + (S.busy ? '<span class="bk-spin"></span>' : t('exSend')) + '</button></div>';
  }
  function refreshStep1() {
    var w = document.getElementById('bk-chip-wrap'); if (w) w.innerHTML = chipHtml();
    var e = document.getElementById('bk-size-err'); if (e) e.textContent = S.veh.typed && !parseSize(S.veh.typed) ? t('sizeBad') : '';
    var sb = root.querySelector('[data-act="book"]'); if (sb) sb.style.display = isExoticSafe() && !S.exoticDone ? 'none' : '';
  }
  function markStarted() {   // entered a car or size, then left before sending (assets/offer.js)
    if (S.cfg && !S.done && step1Basics() && !isExoticSafe() && !lsGet('bk_started')) lsSet('bk_started', String(Date.now()));
  }
  function inp(id, f, label, val, extra) {
    return (label ? '<label class="bk-label" for="' + id + '">' + label + '</label>' : '') + '<input class="bk-input" id="' + id + '" data-f="' + f + '" value="' + esc(val) + '"' + (extra || '') + '>';
  }
  function zoneHtml() {
    var z = S.zone; if (!z || z.error || z.zone !== 0) return '';
    var textOnly = S.lang === 'fr' && !FR_CALLS;
    return '<div class="bk-zone z0">' + t('z0') + '<br><small>' + esc(z.formatted || '') + '</small>' +
      '<a class="bk-btn ' + (textOnly ? 'green' : '') + '" href="' + (textOnly ? PHONE_SMS : 'tel:+16136016471') + '">' + (textOnly ? '💬 Texto' : '📞 (613) 601-6471') + '</a></div>';
  }
  function slotOpts() {
    var sl = (S.cfg && S.cfg.slots) || [];
    return opt('', t('anyT'), !S.pref) + sl.map(function (x) { var l = x.start + '–' + x.end; return opt(l, l, S.pref === l); }).join('');
  }
  function step1() {
    var v = S.veh, r = ' <span class="bk-req">*</span>';
    var h = '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('fTitle') + '</h2>' +
      inp('bk-name', 'name', t('name') + r, S.c.name, ' autocomplete="name"') +
      inp('bk-phone', 'phone', t('phone') + r, S.c.phone, ' type="tel" inputmode="tel" autocomplete="tel"') +
      '<fieldset class="bk-either"><legend class="bk-label">' + t('car') + r + '</legend>' +
      inp('bk-car', 'car', t('carMM'), v.car, ' placeholder="' + t('carPh') + '" autocomplete="off"') +
      '<div class="bk-or">' + t('or') + '</div>' +
      inp('bk-size', 'typed', t('sizeOnly'), v.typed, ' placeholder="' + t('sizePh') + '" autocomplete="off"') +
      '<div class="bk-err" id="bk-size-err">' + (v.typed && !parseSize(v.typed) ? t('sizeBad') : '') + '</div>' +
      '<p class="bk-hint">💡 ' + t('sizeTip') + '</p></fieldset>' +
      inp('bk-area', 'area', t('area') + r, S.area, ' list="bk-areas" placeholder="' + t('areaPh') + '" autocomplete="address-level2"') +
      callTimeHtml() +
      '<datalist id="bk-areas">' + AREAS.map(function (x) { return '<option value="' + x + '">'; }).join('') + '</datalist>' + zoneHtml() +
      '<details class="bk-more"' + (S.more ? ' open' : '') + '><summary>' + t('more') + '</summary>' +
      inp('bk-addr', 'addr', t('fAddr'), S.addrText, ' autocomplete="street-address" placeholder="' + t('fAddrPh') + '"') +
      inp('bk-email', 'email', t('email'), S.c.email, ' type="email" autocomplete="email"') +
      '<label class="bk-label" for="bk-oy">' + t('yearTrim') + '</label><div class="bk-row">' + inp('bk-oy', 'oYear', '', v.oYear, ' inputmode="numeric" maxlength="4" placeholder="' + t('yearPh') + '"') +
      inp('bk-trim', 'oTrim', '', v.oTrim, ' placeholder="' + t('trimPh') + '"') + '</div>' +
      '<label class="bk-label" for="bk-pref">' + t('when2') + '</label><select class="bk-select" id="bk-pref" data-f="pref">' + slotOpts() + '</select>' +
      '<label class="bk-label">' + t('svcQ') + '</label><div class="bk-toggle"><button type="button" data-act="svc" data-v="off" class="' + (S.service === 'off' ? 'sel' : '') + '">' + t('off').split(':')[0] + '</button>' +
      '<button type="button" data-act="svc" data-v="on" class="' + (S.service === 'on' ? 'sel' : '') + '">' + t('on') + '</button></div>' +
      '<div class="bk-toggle"><button type="button" data-act="tires" data-v="4" class="' + (S.tires === 4 ? 'sel' : '') + '">' + t('t4') + '</button>' +
      '<button type="button" data-act="tires" data-v="2" class="' + (S.tires === 2 ? 'sel' : '') + '">' + t('t2') + '</button></div>' +
      inp('bk-notes', 'notes', t('notes'), S.c.notes, ' placeholder="' + t('notesPh') + '"') + '</details>' +
      '<div class="bk-hp" aria-hidden="true"><label>Website<input id="bk-hp" tabindex="-1" autocomplete="off"></label></div>' +
      '<div id="bk-chip-wrap">' + chipHtml() + '</div>' +
      '<div class="bk-err" id="bk-book-err" role="alert">' + (S.bookErr || '') + '</div>' +
      '<button class="bk-btn green" type="button" data-act="book"' + (S.busy ? ' disabled' : '') + (isExoticSafe() && !S.exoticDone ? ' style="display:none"' : '') + '>' +
        (S.busy ? '<span class="bk-spin"></span> ' + t('booking') : t('send')) + '</button>' +
      '<p class="bk-note">' + t('fNote') + '</p><p class="bk-hint">' + t('mayContact') + '</p></div>';
    return h;
  }
  function vehicleLabel() {
    var v = S.veh; return [v.oYear, v.car, v.oTrim].filter(Boolean).join(' ');
  }
  function sizeLabel() {
    var p = parseSize(S.veh.typed);
    return p ? p.text + ' (' + t('sizeCust') + ')' : t('sizeUnk');
  }
  // ---------------------------------------------------------------- "Best time to call you?" (optional; nothing picked by default)
  var CT_PARTS = [['asap', 'ctAsap', 'Now / ASAP'], ['morning', 'ctMorning', 'Morning (9–12)'], ['afternoon', 'ctAfternoon', 'Afternoon (12–5)'], ['evening', 'ctEvening', 'Evening (5–8)']];
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function isoDay(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function todayIso() { return isoDay(new Date()); }
  function ymd(ds) { var p = ds.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function dateWords(iso, lang) {   // '2026-10-15' -> 'Thu Oct 15' (EN) / 'jeu. 15 oct.' (FR)
    var d = ymd(iso); return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'short', month: 'short', day: 'numeric' }).replace(/,/g, '');
  }
  // The text the owner sees. Always English so the alert emails read the same for EN and FR customers.
  function callTime() {
    if (S.callPart === 'asap') return 'Now / ASAP';
    var day = S.callDay === 'today' ? 'Today' : S.callDay === 'tomorrow' ? 'Tomorrow' : (S.callDay === 'date' && S.callDate ? dateWords(S.callDate, 'en') : '');
    var part = (CT_PARTS.filter(function (x) { return x[0] === S.callPart; })[0] || [])[2] || '';
    return [day, part].filter(Boolean).join(', ');
  }
  function callTimeShown() {   // same choice, in the page language
    if (S.callPart === 'asap') return t('ctAsap');
    var day = S.callDay === 'today' ? t('ctToday') : S.callDay === 'tomorrow' ? t('ctTomorrow') : (S.callDay === 'date' && S.callDate ? dateWords(S.callDate, S.lang) : '');
    var part = S.callPart ? t('ct' + S.callPart.charAt(0).toUpperCase() + S.callPart.slice(1)) : '';
    return [day, part].filter(Boolean).join(', ');
  }
  function ctBtn(act, v, label, on, dis) {
    return '<button type="button" class="bk-ct' + (on ? ' sel' : '') + '" data-act="' + act + '" data-v="' + v + '" aria-pressed="' + (on ? 'true' : 'false') + '"' + (dis ? ' aria-disabled="true"' : '') + '>' + esc(label) + '</button>';
  }
  function callTimeHtml() {
    var asap = S.callPart === 'asap', shown = callTimeShown();
    return '<fieldset class="bk-calltime"><legend class="bk-ct-q">📞 ' + t('ctQ') + ' <small>(' + t('ctOpt') + ')</small></legend>' +
      '<div class="bk-ct-grid" role="group" aria-label="' + esc(t('ctQ')) + '">' +
        CT_PARTS.map(function (x) { return ctBtn('ctpart', x[0], t(x[1]), S.callPart === x[0]); }).join('') + '</div>' +
      '<div class="bk-ct-day' + (asap ? ' dim' : '') + '"><div class="bk-ct-sub" id="bk-ct-day-l">' + t('ctDay') + '</div>' +
      '<div class="bk-ct-grid three" role="group" aria-labelledby="bk-ct-day-l">' +
        ctBtn('ctday', 'today', t('ctToday'), S.callDay === 'today', asap) + ctBtn('ctday', 'tomorrow', t('ctTomorrow'), S.callDay === 'tomorrow', asap) +
        ctBtn('ctday', 'date', t('ctPick'), S.callDay === 'date', asap) + '</div>' +
      (S.callDay === 'date' && !asap ? '<label class="bk-label" for="bk-ct-date">' + t('ctDate') + '</label><input class="bk-input" type="date" id="bk-ct-date" data-f="callDate" min="' + todayIso() + '" value="' + esc(S.callDate) + '">' : '') +
      '</div>' +
      (shown ? '<p class="bk-ct-chosen" aria-live="polite">' + t('ctChosen') + ' <b>' + esc(shown) + '</b> <button type="button" class="bk-link" data-act="ctclear">' + t('ctClear') + '</button></p>' : '') +
      '</fieldset>';
  }
  function areaLabel() { return (S.zone && !S.zone.error && S.zone.formatted) || [S.addrText, S.area].filter(Boolean).join(', '); }

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
    if (S.area) lines.push('Area: ' + S.area);
    if (S.addrText) lines.push('Address: ' + S.addrText);
    if (S.pref) lines.push('Preferred: ' + S.pref);
    if (callTime()) lines.push('Best time to call: ' + callTime());
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
    var m = root.querySelector('.bk-more'); if (m) m.addEventListener('toggle', function () { S.more = m.open; });
  }
  var draftTimer = 0;
  function draftSoon() { clearTimeout(draftTimer); draftTimer = setTimeout(sendDraft, 700); }
  function readField(el) {
    var f = el.getAttribute('data-f'), val = el.value.trim(), v = S.veh; if (!f) return '';
    if (f === 'car') { v.car = val; syncCar(); S.exoticDone = false; }
    else if (f === 'typed' || f === 'oYear' || f === 'oTrim') { v[f] = val; if (f !== 'oYear') S.exoticDone = false; }
    else if (f === 'area') { S.area = val; S.zone = null; }
    else if (f === 'addr') { S.addrText = val; S.zone = null; }
    else if (f === 'pref') S.pref = val;
    else if (f === 'callDate') { S.callDate = val && val >= todayIso() ? val : ''; if (val && !S.callDate) el.value = ''; }
    else if (f === 'name' || f === 'phone' || f === 'email' || f === 'notes') S.c[f] = val;
    return f;
  }
  function onEdit(e) {
    var f = readField(e.target); if (!f) return;
    if (f === 'car' || f === 'typed' || f === 'oYear' || f === 'oTrim') { refreshStep1(); markStarted(); }
    if (f === 'area' || f === 'addr') { var z = root.querySelector('.bk-zone'); if (z) z.remove(); }
    if (f === 'callDate' && e.type === 'change') { render(); return draftSoon(); }
    if (f === 'phone' || f === 'car' || f === 'typed' || f === 'name' || f === 'pref') draftSoon();
  }
  root.addEventListener('input', onEdit);
  root.addEventListener('change', onEdit);
  function focusAct(a, v) { var b = root.querySelector('[data-act="' + a + '"][data-v="' + v + '"]'); if (b) b.focus(); }
  function readAll() { Array.prototype.forEach.call(root.querySelectorAll('[data-f]'), readField); }

  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]'); if (!el) return;
    var act = el.getAttribute('data-act'), val = el.getAttribute('data-v');
    if (act === 'exotic') return sendExotic();
    if (act === 'lang') { readAll(); S.lang = S.lang === 'fr' ? 'en' : 'fr'; lsSet('bk_lang', S.lang); return render(); }
    if (act === 'svc') { readAll(); S.service = val; return render(); }
    if (act === 'tires') { readAll(); S.tires = +val; return render(); }
    if (act === 'ctpart') { readAll(); S.callPart = S.callPart === val ? '' : val; if (val === 'asap' && S.callPart) { S.callDay = ''; S.callDate = ''; } render(); focusAct(act, val); return draftSoon(); }
    if (act === 'ctday') { if (el.getAttribute('aria-disabled') === 'true') return; readAll(); S.callDay = S.callDay === val ? '' : val; if (S.callPart === 'asap') S.callPart = '';
      if (val !== 'date') S.callDate = ''; render(); focusAct(act, val); return draftSoon(); }
    if (act === 'ctclear') { readAll(); S.callPart = S.callDay = S.callDate = ''; render(); return draftSoon(); }
    if (act === 'book') return book();
  });

  // Checks the required fields. Returns an error message, or '' when OK.
  function formError() {
    readAll();
    if (!S.c.name) return { msg: t('nameBad'), el: 'bk-name' };
    if (!cleanPhone(S.c.phone)) return { msg: t('phoneBad'), el: 'bk-phone' };
    if (S.veh.typed && !parseSize(S.veh.typed) && !hasCar()) return { msg: t('sizeBad'), el: 'bk-size' };
    if (!step1Basics()) return { msg: t('needCar'), el: 'bk-car' };
    if (!S.area && !S.addrText) return { msg: t('needArea'), el: 'bk-area' };
    return null;
  }
  function cleanPhone(p) { var d = String(p || '').replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); return /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? d : ''; }

  // Zone from the full address if given, otherwise from the city/neighbourhood. Never blocks the request
  // unless the script says the place is outside our area (zone 0).
  function checkZone() {
    if (S.zone) return Promise.resolve(S.zone);
    var q = S.addrText ? S.addrText + (S.area ? ', ' + S.area : '') : S.area;
    return apiPost({ action: 'zone', address: q, session: S.session }).then(function (r) {
      S.zone = r.ok ? r : { error: r.error || 'not_found' }; return S.zone;
    }).catch(function () { S.zone = { error: 'unreachable' }; return S.zone; });
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
    return { name: S.c.name, email: S.c.email, size: sizeLabel(), service: (S.service === 'on' ? 'On-rim' : 'Off-rim') + ' x' + S.tires,
             address: areaLabel(), zone: S.zone && !S.zone.error ? S.zone.zone : '', area: S.area, callTime: callTime(), lang: S.lang, price: 'Call for a quote', ref: S.ref };
  }
  function sendDraft() {
    if (S.done) return;
    readAll();
    var phone = cleanPhone(S.c.phone); if (!phone || !S.cfg || !step1Basics()) return;   // fires once phone + (car or size) are in
    var payload = { action: 'draft', session: S.session, firstName: (S.c.name || '').split(' ')[0], phone: phone, vehicle: vehicleLabel(),
                    slot: S.pref || '', callTime: callTime(), price: 'Call for a quote', details: draftDetails() };
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
    var fe = formError(), err = document.getElementById('bk-book-err');
    if (fe && fe.el !== 'bk-area') { err.textContent = fe.msg; var x = document.getElementById(fe.el); if (x) x.focus(); return; }
    S.busy = true; refreshStep1();
    var typed = parseSize(S.veh.typed);
    apiPost({ action: 'exotic', name: S.c.name, phone: S.c.phone, address: areaLabel(), vehicle: vehicleLabel(), size: typed ? typed.text : '',
              service: S.service, tires: S.tires, lang: S.lang, ref: S.ref, hp: '' }).then(function (r) {
      S.busy = false; if (r.ok) { S.exoticDone = true; refreshStep1(); } else { refreshStep1(); var e = document.getElementById('bk-book-err'); if (e) e.textContent = t('err'); }
    }).catch(function () { S.busy = false; goFallback(); });
  }

  function book() {
    if (S.busy) return;
    var fe = formError();
    if (fe) { S.bookErr = fe.msg; render(); var x = document.getElementById(fe.el); if (x) x.focus(); return; }
    if (isExoticSafe()) return;   // custom-quote box is showing instead
    var hp = document.getElementById('bk-hp'), hpv = hp ? hp.value : '';
    S.busy = true; S.bookErr = ''; render();
    checkZone().then(function (z) {
      if (z && !z.error && z.zone === 0) { S.busy = false; return render(); }   // outside our area: show Call/Text box
      sendDraft();
      var v = S.veh, typed = parseSize(v.typed);
      var ct = callTime();
      var notes = [S.c.notes, ct ? 'Best time to call: ' + ct : '', S.pref ? (S.lang === 'fr' ? 'Heure préférée : ' : 'Preferred time: ') + S.pref : ''].filter(Boolean).join(' · ');
      var payload = {
        action: 'lead', session: S.session, lang: S.lang, hp: hpv,
        vehicleId: '', year: v.oYear, make: v.oMake, model: v.oModel, trim: v.oTrim, trimUnsure: !v.oTrim, vehicleClass: 'car',
        sizeTyped: typed ? typed.text : '', photoUrl: v.photoUrl, service: S.service, tires: S.tires,
        address: S.addrText || S.area, addressFormatted: areaLabel(),
        name: S.c.name, phone: S.c.phone, email: S.c.email, notes: notes, offerId: S.offer ? S.offer.offerId : '', expectedSubtotal: null, ref: S.ref, multiCar: !!S.multiCar,
        // new, informational fields (the script can ignore them):
        area: S.area, streetAddress: S.addrText, preferredTime: S.pref, callTime: ct, vehicleText: v.car, zone: z && !z.error ? z.zone : '', price: 'Call for a quote'
      };
      return apiPost(payload).then(function (r) {
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
        if (r.error === 'exotic') { S.forceExotic = true; return render(); }
        if (r.error === 'phone') { S.bookErr = t('phoneBad'); return render(); }
        if (r.error === 'name') { S.bookErr = t('nameBad'); return render(); }
        if (r.error === 'outside') { S.zone = { zone: 0, formatted: areaLabel() }; return render(); }
        if (r.error === 'address') { S.more = true; S.bookErr = t('notFound'); return render(); }
        goFallback();
      });
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

  // ---------------------------------------------------------------- leaving popup (turned off: no prices or discounts shown)
  // The popup + triggers live in /assets/offer.js (shared with the homepage and winter page).
  // Here we only tell it when it may show, whether a car is picked, and how to apply the offer.
  window.MTRO_OFFER = {
    canShow: function () { return !!S.cfg && !S.fatal && !S.done && !S.offer && !S.busy; },
    started: function () { return !!S.cfg && !S.done && step1Basics() && !isExoticSafe(); },
    text: function () { return { title: t('offerTitle'), sub: t('offerSub'), yes: t('offerYes'), no: t('offerNo') }; },
    claim: function () {
      apiPost({ action: 'offer', session: S.session }).then(function (r) {
        if (r.ok) { S.offer = { offerId: r.offerId, expires: r.expires, percent: r.percent }; lsSet('bk_offer', JSON.stringify(S.offer)); render(); }
      }).catch(function () {});
    }
  };

  // ---------------------------------------------------------------- start
  render();
  Promise.all([apiGet('config')]).then(function (res) {   // vehicle list no longer needed (free-text make & model)
    if (!res[0].ok) return goFallback();
    S.cfg = res[0]; S.rows = [];
    S.season = S.cfg.season === 'summer' ? 'summer' : 'winter';
    if (S.cfg.testMode && qsSeason) S.season = qsSeason;   // ?season=summer preview while in TEST MODE
    document.title = t('title') + ' | Mobile Tire Repair Ottawa';
    if (S.season === 'summer') { var sn = document.getElementById('snow'); if (sn) sn.style.display = 'none'; }   // no snowfall in summer
    render();
  }).catch(function () { goFallback(); });
  window.__bk = S; // for testing
})();
