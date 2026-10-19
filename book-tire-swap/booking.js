/* Winter swap online booking – front end. Talks to the Google Apps Script web app in window.BOOKING_API. */
(function () {
  'use strict';
  var API = window.BOOKING_API || '';
  var TEL = 'tel:+16136016471';   // every contact tap is a phone call (no text/SMS links on the site)
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
      headline: 'Winter tire swaps · mounting & balancing included · we come to you. Your price is shown before you send.',
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
      multiNote: "Book one time window for all of them. We'll call you to confirm the other car(s).",
      whyQ: 'Why does this cost more?',
      whyA: 'Low-profile tires have short, very stiff sidewalls. They take more time and special equipment to mount without scratching or bending your rims, and many are run-flats with sensitive tire pressure sensors.',
      exT: 'This vehicle needs a custom quote — call us',
      exSub: "Exotic and high-performance tires need special handling, so we price them one by one. Leave your details and we'll get back to you fast.",
      exSend: 'Send my quote request', exDone: "✅ Got it! We'll call you with your quote.", exAddr: 'Address or area',
      zoneWord: 'zone',
      notFound: "We couldn't find that address. Add the city (e.g. Ottawa, Kanata, Gatineau) and try again.",
      unchecked: "✅ Got it. We'll confirm your area by phone.",
      s4: 'Pick a day and time', s4sub: 'Only open times are shown. Our tech arrives within your window and calls before coming.',
      full: 'Full', open1: 'open', held: "✓ We're holding this time for 10 minutes while you finish.", taken: 'Sorry, that time was just taken. Pick another.',
      waitTitle: 'This day is full', waitSub: "Join the waitlist. If a time opens up, we'll call you first.", anyTime: 'Any time',
      joinWait: 'Join waitlist', waitDone: "✅ You're on the waitlist. We'll call you if a time opens.", otherDay: '← Pick another day',
      s5: 'How do we reach you?', name: 'Name', phone: 'Mobile phone', email: 'Email (optional, for your confirmation)', notes: 'Parking notes (optional)',
      notesPh: 'Driveway, underground, visitor spot…', mayContact: 'We may contact you about this booking.',
      phoneBad: 'Please enter a 10-digit phone number.', nameBad: 'Please enter your name.',
      s6: 'Check your details', when: 'When', service: 'Service', where: 'Where', vehicle: 'Vehicle', contact: 'Contact', tsize: 'Tire size',
      sizeEst: 'estimated from vehicle', sizeCust: 'entered by you', sizeUnk: "we'll confirm by phone",
      pay: 'Pay the tech when done: cash, card or e-transfer.',
      confirm: '✓ Send my request', booking: 'Sending…',
      priceChanged: 'Please review your request and confirm again.', offerGone: "That offer couldn't be applied (it may have expired or already been used). Call for a quote.",
      limit: 'This phone number already has bookings today. Please call us.',
      doneT: "You're booked!", doneR: 'Request received!', doneRsub: "We'll call you shortly to confirm the time.", bookingNo: 'Request #',
      emailSent: 'A copy of your request is in your email.', change: 'Need us sooner? Call (613) 601-6471.', addCal: '📅 Add to my calendar', addIcs: 'Download calendar file (.ics)',
      testDone: '🧪 Test booking saved. Check the Winter Swaps calendar, your email and the WhatsApp groups.',
      fbTitle: 'Online booking is having trouble right now', fbSub: "No problem: call us and we'll book you in on the phone.",
      fbBtn: '📞 Call (613) 601-6471', offerTitle: 'Call for a quote', offerSub: 'We will call you to confirm the time.', offerYes: 'Call for a quote', offerNo: 'No thanks',
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
      ctAsap: 'Now / ASAP', ctMorning: 'Morning (9–12)', ctAfternoon: 'Afternoon (12–5)', ctEvening: 'Evening (5–8)', ctChosen: 'We\'ll call:', ctClear: 'Clear',
      callBtn: '📞 Call (613) 601-6471',
      pTitle: 'Your price', pBefore: 'before tax', pType: 'Vehicle type',
      pAutoSize: 'Picked from your tire size ({S}). Not right? Tap another type.', pAutoCar: 'Picked from your vehicle ({C}). Not right? Tap another type.',
      pAutoRunflat: 'Picked because you have run-flat tires. Not right? Tap another type.', pPicked: 'You picked this type.',
      pNoTier: "Enter your car or tire size above and we'll pick the type for you, or tap yours here.",
      pRunflat: 'Run-flat tires', pSvc: 'Winter tire swap',
      pLow: 'Low-profile and run-flat tires take more time and care to mount, so they cost more.',
      pRimsQ: 'Are your winter tires already on rims?', rYes: 'Yes', rNo: 'No', rUnsure: 'Not sure',
      rimsYes: 'tires already on rims', rimsNo: 'tires not on rims (mount & balance)', rimsUnsure: 'not sure if on rims',
      pRimsHint: 'On rims = each winter tire is already mounted on its own wheel, so we just swap the wheels.',
      pUnsureNote: "Not sure? We've used the off-rims price. We'll confirm on the call.",
      pNeedRims: 'Please tell us if your winter tires are already on rims.',
      pAreaEmpty: 'Add your city or neighbourhood above to see your total.',
      pAreaQ: "We couldn't tell the service call fee for \"{A}\". Pick the closest area:", pAreaPick: 'Choose…',
      pAreaNone: 'No service call fee', pAreaFee: '+{F} service call', pAreaOther: 'Other (not listed)',
      pAreaOtherNote: "We'll confirm any service call fee for your area when we call.",
      pNeedArea: 'Please pick the closest area to see your total.',
      bSwap: 'Swap', bFee: 'service call ({A})', bOffer: 'offer', bAsap: 'same-day / ASAP urgency', bAfter: 'after-hours service call',
      pAfter: '🌙 After-hours visit ({W}): {F} service call instead of the area fee.', pAfterVisitAsap: 'ASAP, now {T}', pAfterVisitPref: 'preferred time {T}',
      pAsap: '⚡ ASAP: send the next available tech now (same-day / ASAP urgency +{F}).', pSameDay: '⚡ Same-day visit: same-day / ASAP urgency +{F} included.',
      vQ: 'When should we come?', vOpt: 'optional', vTime: 'Visit time', vAny: 'Any time (we set it on the call)', vAsap: '⚡ ASAP is ticked below: we come as soon as possible.', vDate: 'Visit date', pAsapOff: 'ASAP not available right now. Pick a time or call us.', rimsAsap: 'same-day / ASAP',
      pOfferOn: '🏷️ {D} off applied.', pOfferOnFees: '🏷️ {NC} waived ({D} off).', pOfferOnFeesPart: '🏷️ {D} off {X} applied.', oSvc: 'your service call', oSvcN: 'service call', oSvcMy: 'my service call', oUrg: 'the rush fee', oUrgN: 'rush fee', oUrgMy: 'my rush fee', pPlusTax: 'Plus tax. Pay the tech when the job is done.',
      pAccept: 'I accept this total: {P} ({TIER}, {RIMS}).', pAreaOtherShort: 'Service call fee: we confirm it on the call.',
      pNeedTier: 'Please pick your vehicle type to see your price.',
      xoT: 'Finish booking now: {D} off', xoS: 'One time only: send your request now and pay {P} instead of {F}, before tax.',
      xoYes: 'Take {D} off', xoNo: 'No thanks',
      xoTFees: "Book now and we'll waive {X}", xoYesFees: 'Waive {Y}', xoTFeesPart: 'Book now: {D} off {X}', xoYesFeesPart: 'Take {D} off',
      pTotalT: 'Your total',
      calT: 'Mobile Tire Repair Ottawa: tire swap', calTAsap: 'Mobile Tire Repair Ottawa: tire swap (ASAP)', calReq: "Requested time: we'll call to confirm",
      calAddr: 'Address', calTotal: 'Total', calNoPrice: "Price: we'll confirm it on the call", calQ: 'Questions? Call', calReqNo: 'Request #',
      calH: '📅 Add to my calendar', calWhen: 'Saved as {W} (1 hour). Requested time: we\'ll call to confirm.', calWhenGuess: 'Saved as {W} (1 hour), around your best time to call. The visit time is set on the call.',
      calGoogle: 'Google Calendar', calIcs: 'Apple / Outlook (.ics)'
    },
    fr: {
      kicker: "❄ Réservation pneus d'hiver", title: "Réservez votre changement de pneus d'hiver", sub: 'On se déplace chez vous. Envoyez votre demande en 2 minutes et on vous appelle.',
      headline: "Changement de pneus d'hiver · montage et équilibrage inclus · on se déplace chez vous. Votre prix est affiché avant l'envoi.",
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
      z0: 'Hors de notre zone de service — appelez-nous.',
      multi: "J'ai 2 véhicules ou plus à cette adresse", multiWaived: 'Frais de déplacement annulés (2+ véhicules)',
      multiNote: 'Réservez une seule plage pour tous. On vous appelle pour confirmer les autres véhicules.',
      whyQ: 'Pourquoi est-ce plus cher?',
      whyA: "Les pneus à profil bas ont des flancs courts et très rigides. Ils demandent plus de temps et un équipement spécial pour être montés sans égratigner ni plier vos jantes, et plusieurs sont des pneus à affaissement limité avec des capteurs de pression sensibles.",
      exT: 'Ce véhicule demande une soumission personnalisée — appelez-nous',
      exSub: 'Les pneus de véhicules exotiques et haute performance demandent une manipulation spéciale; on les évalue un par un. Laissez vos coordonnées et on vous répond rapidement.',
      exSend: 'Envoyer ma demande', exDone: '✅ Reçu! On vous appelle avec votre prix.', exAddr: 'Adresse ou secteur',
      zoneWord: 'zone',
      notFound: "Adresse introuvable. Ajoutez la ville (ex. Gatineau, Aylmer, Ottawa) et réessayez.",
      unchecked: '✅ Reçu. On confirmera votre secteur par téléphone.',
      s4: 'Choisissez le jour et la plage horaire', s4sub: 'Seules les plages libres sont affichées. Le technicien arrive dans votre plage et vous appelle avant.',
      full: 'Complet', open1: 'libre(s)', held: '✓ On vous garde cette plage 10 minutes.', taken: "Désolé, cette plage vient d'être prise. Choisissez-en une autre.",
      waitTitle: 'Cette journée est complète', waitSub: "Inscrivez-vous sur la liste d'attente. Si une plage se libère, on vous appelle en premier.", anyTime: "N'importe quand",
      joinWait: "M'inscrire", waitDone: "✅ Vous êtes sur la liste d'attente.", otherDay: '← Choisir un autre jour',
      s5: 'Comment vous joindre?', name: 'Nom', phone: 'Cellulaire', email: 'Courriel (facultatif, pour la confirmation)', notes: 'Stationnement (facultatif)',
      notesPh: 'Entrée, garage souterrain, visiteurs…', mayContact: 'Nous pourrions vous contacter au sujet de cette réservation.',
      phoneBad: 'Entrez un numéro à 10 chiffres.', nameBad: 'Entrez votre nom.',
      s6: 'Vérifiez vos informations', when: 'Quand', service: 'Service', where: 'Adresse', vehicle: 'Véhicule', contact: 'Contact', tsize: 'Taille',
      sizeEst: 'estimée selon le véhicule', sizeCust: 'entrée par vous', sizeUnk: 'à confirmer par téléphone',
      pay: 'Paiement au technicien à la fin : comptant, carte ou virement Interac.',
      confirm: '✓ Envoyer ma demande', booking: 'Envoi…',
      priceChanged: 'Vérifiez votre demande et confirmez de nouveau.', offerGone: "Cette offre n'a pas pu être appliquée (expirée ou déjà utilisée). Appelez pour une soumission.",
      limit: "Ce numéro a déjà des réservations aujourd'hui. Appelez-nous.",
      doneT: 'Réservation confirmée!', doneR: 'Demande reçue!', doneRsub: "On vous appelle bientôt pour confirmer l'heure.", bookingNo: 'Demande n°',
      emailSent: 'Une copie de votre demande est dans vos courriels.', change: 'Besoin de nous plus vite? Appelez le (613) 601-6471 (service en anglais).', addCal: '📅 Ajouter à mon calendrier', addIcs: 'Télécharger le fichier calendrier (.ics)',
      testDone: '🧪 Réservation test enregistrée. Vérifiez le calendrier, votre courriel et les groupes WhatsApp.',
      fbTitle: 'La réservation en ligne a un problème', fbSub: 'Appelez-nous et on vous réserve par téléphone (service en anglais).',
      fbBtn: '📞 Appeler le (613) 601-6471', offerTitle: 'Appelez pour une soumission', offerSub: 'On vous appelle pour confirmer l\'heure.', offerYes: 'Appelez pour une soumission', offerNo: 'Non merci',
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
      ctAsap: 'Maintenant / dès que possible', ctMorning: 'Matin (9 h–12 h)', ctAfternoon: 'Après-midi (12 h–17 h)', ctEvening: 'Soir (17 h–20 h)', ctChosen: 'On vous appelle :', ctClear: 'Effacer',
      callBtn: '📞 Appeler (613) 601-6471 (en anglais)',
      pTitle: 'Votre prix', pBefore: 'avant taxes', pType: 'Type de véhicule',
      pAutoSize: "Choisi selon la taille de vos pneus ({S}). Ce n'est pas ça? Touchez un autre type.", pAutoCar: "Choisi selon votre véhicule ({C}). Ce n'est pas ça? Touchez un autre type.",
      pAutoRunflat: "Choisi parce que vous avez des pneus à affaissement limité. Ce n'est pas ça? Touchez un autre type.", pPicked: 'Vous avez choisi ce type.',
      pNoTier: 'Entrez votre véhicule ou la taille des pneus ci-dessus et on choisit le type pour vous, ou touchez le vôtre ici.',
      pRunflat: 'Pneus à affaissement limité (run-flat)', pSvc: "Changement de pneus d'hiver",
      pLow: 'Les pneus à profil bas ou à affaissement limité demandent plus de temps et de soin au montage, donc ils coûtent plus cher.',
      pRimsQ: "Vos pneus d'hiver sont-ils déjà sur des jantes?", rYes: 'Oui', rNo: 'Non', rUnsure: 'Je ne sais pas',
      rimsYes: 'pneus déjà sur jantes', rimsNo: 'pneus pas sur jantes (montage et équilibrage)', rimsUnsure: 'pas sûr pour les jantes',
      pRimsHint: "Sur jantes = chaque pneu d'hiver est déjà monté sur sa propre roue; on change seulement les roues.",
      pUnsureNote: 'Pas sûr? On a utilisé le prix hors jantes. On confirmera au téléphone.',
      pNeedRims: "Dites-nous si vos pneus d'hiver sont déjà sur des jantes.",
      pAreaEmpty: 'Ajoutez votre ville ou quartier ci-dessus pour voir votre total.',
      pAreaQ: "On n'a pas pu déterminer les frais de déplacement pour « {A} ». Choisissez le secteur le plus proche :", pAreaPick: 'Choisir…',
      pAreaNone: 'Aucuns frais de déplacement', pAreaFee: '+{F} frais de déplacement', pAreaOther: 'Autre (pas dans la liste)',
      pAreaOtherNote: 'On confirmera les frais de déplacement pour votre secteur au téléphone.',
      pNeedArea: 'Choisissez le secteur le plus proche pour voir votre total.',
      bSwap: 'Changement', bFee: 'frais de déplacement ({A})', bOffer: 'rabais', bAsap: 'urgence même jour / service rapide', bAfter: 'frais de déplacement en dehors des heures',
      pAfter: '🌙 Visite en dehors des heures ({W}) : {F} de frais de déplacement au lieu des frais du secteur.', pAfterVisitAsap: 'service rapide, maintenant {T}', pAfterVisitPref: 'heure préférée {T}',
      pAsap: '⚡ Service rapide : le prochain technicien libre, maintenant (urgence même jour / service rapide +{F}).', pSameDay: '⚡ Visite le jour même : urgence même jour / service rapide +{F} incluse.',
      vQ: 'Quand voulez-vous la visite?', vOpt: 'facultatif', vTime: 'Heure de la visite', vAny: "N'importe quand (fixée au téléphone)", vAsap: '⚡ Service rapide coché plus bas : on arrive le plus tôt possible.', vDate: 'Date de la visite', pAsapOff: "Le service rapide n'est pas offert en ce moment. Choisissez une heure ou appelez-nous.", rimsAsap: 'même jour / service rapide',
      pOfferOn: '🏷️ Rabais de {D} appliqué.', pOfferOnFees: '🏷️ {NC} annulés ({D} de rabais).', pOfferOnFeesPart: '🏷️ Rabais de {D} sur {X} appliqué.', oSvc: 'vos frais de déplacement', oSvcN: 'frais de déplacement', oSvcMy: 'mes frais de déplacement', oUrg: "les frais d'urgence", oUrgN: "frais d'urgence", oUrgMy: "mes frais d'urgence", pPlusTax: 'Taxes en sus. Paiement au technicien à la fin du travail.',
      pAccept: "J'accepte ce total : {P} ({TIER}, {RIMS}).", pAreaOtherShort: 'Frais de déplacement : confirmés au téléphone.',
      pNeedTier: 'Choisissez votre type de véhicule pour voir votre prix.',
      xoT: 'Réservez maintenant : {D} de rabais', xoS: 'Une seule fois : envoyez votre demande maintenant et payez {P} au lieu de {F}, avant taxes.',
      xoYes: 'Prendre {D} de rabais', xoNo: 'Non merci',
      xoTFees: 'Réservez maintenant et on annule {X}', xoYesFees: 'Annuler {Y}', xoTFeesPart: 'Réservez maintenant : {D} de rabais sur {X}', xoYesFeesPart: 'Prendre {D} de rabais',
      pTotalT: 'Votre total',
      calT: 'Mobile Tire Repair Ottawa : changement de pneus', calTAsap: 'Mobile Tire Repair Ottawa : changement de pneus (service rapide)', calReq: 'Heure demandée : on vous appelle pour confirmer',
      calAddr: 'Adresse', calTotal: 'Total', calNoPrice: 'Prix : confirmé au téléphone', calQ: 'Questions? Appelez le', calReqNo: 'Demande n°',
      calH: '📅 Ajouter à mon calendrier', calWhen: 'Enregistré pour {W} (1 heure). Heure demandée : on vous appelle pour confirmer.', calWhenGuess: "Enregistré pour {W} (1 heure), selon votre moment préféré pour l'appel. L'heure de la visite est fixée au téléphone.",
      calGoogle: 'Google Agenda', calIcs: 'Apple / Outlook (.ics)'
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
    c: { name: '', phone: '', email: '', notes: '' }, area: '', pref: '', more: false, callDay: '', callDate: '', callPart: '', tierPick: '', runflat: false, rims: '', feePick: '', asap: false, asapAt: '', visitDay: '', visitDate: '', visitTime: '', offerApplied: lsGet('bk_swap_offer') === '1' && !lsGet('bk_booked'), offer: null, done: null, busy: false, waitDay: null, draftSent: ''
  };
  lsSet('bk_session', S.session);
  // ?r=Emma (dispatcher who sent a /book link). Kept for this visit.
  (function () {
    var m = location.search.match(/[?&]r=([^&#]*)/);
    var r = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')).replace(/[^\w .-]/g, '').slice(0, 20) : '';
    try { if (r) sessionStorage.setItem('bk_ref', r); else r = sessionStorage.getItem('bk_ref') || ''; } catch (e) {}
    S.ref = r;
  })();
  // The old 15% config offer is ignored (S.offer stays null). The exit offer lives in prices.js (S.offerApplied).
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
    return m ? { lt: m[1] === 'LT', width: +m[2], aspect: +m[3], rim: +m[4], text: (m[1] === 'LT' ? 'LT' : '') + m[2] + '/' + m[3] + 'R' + m[4] } : null;
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

  // ---------------------------------------------------------------- price shown on the booking form (owner's exception to "no prices")
  // Every amount comes from window.SWAP_PRICES in /book-tire-swap/prices.js (one object, easy to edit).
  // Nothing is hard-coded here. If prices.js is missing, the form falls back to "Call for a quote".
  var PR = window.SWAP_PRICES || null;
  function money(n, lang) { n = Math.round(n * 100) / 100; var x = n % 1 ? n.toFixed(2) : String(n); return (lang || S.lang) === 'fr' ? x.replace('.', ',') + ' $' : '$' + x; }
  function hasPrices() { return !!(PR && PR.tiers && PR.order && PR.order.length) && S.season !== 'summer'; }   // winter swap prices only
  function words(x) { return ' ' + nrm(x).replace(/[^a-z0-9.\- ]+/g, ' ').replace(/\s+/g, ' ') + ' '; }
  function listHas(list, txt) { var w = words(txt); return (list || []).some(function (k) { return w.indexOf(' ' + k + ' ') >= 0; }); }
  // Picks the tier from make/model + tire size (+ run-flat box). Returns { tier, why } or null when we can't tell.
  function autoTier() {
    var v = S.veh, p = parseSize(v.typed), car = v.car, base = '', why = 'car';
    if (listHas(PR.pickupModels, car)) base = 'pickup';
    else if (listHas(PR.suvModels, car)) base = 'suv';
    else if (car) base = 'small';
    if (!base && p) {   // size only: LT or big/tall truck sizes = pickup, tall 17"+ = SUV, else small car
      why = 'size';
      base = (p.lt || (p.width >= 255 && p.aspect >= 65 && p.rim >= 17)) ? 'pickup' : (p.rim >= 17 && p.aspect >= 55) ? 'suv' : 'small';
    }
    var lowSize = !!(p && p.aspect <= (+PR.lowProfileMaxAspect || 35));
    if ((lowSize || S.runflat) && base !== 'pickup') return { tier: 'low', why: lowSize ? 'size' : 'runflat' };   // pickup price stays (it's higher)
    return base ? { tier: base, why: why } : null;
  }
  function tierLabel(k, lang) { var x = PR.tiers[k] || {}; return (lang || S.lang) === 'fr' ? (x.fr || x.en || k) : (x.en || k); }
  // ---- service call fee by area (lists + fees in prices.js). Area field first, then the street address.
  var ROAD = /^(rd|road|st|street|ave|avenue|dr|drive|blvd|boulevard|way|cres|crescent|ct|court|pl|place|ln|lane|line|sideroad|side|pkwy|parkway|hwy|highway|ch|chemin|cir|circle|terr|terrace)\b/;
  function flat(x) { return nrm(x).replace(/[^a-z0-9]+/g, ' ').trim(); }
  function areaIn(text) {   // -> { fee, name } or null
    var w = ' ' + flat(text) + ' ', groups = (PR.serviceCall || []).slice().sort(function (a, b) { return b.fee - a.fee; });
    for (var g = 0; g < groups.length; g++) for (var k = 0; k < groups[g].areas.length; k++) {
      var nm = flat(groups[g].areas[k]), at = 0, ix;
      while ((ix = w.indexOf(' ' + nm + ' ', at)) >= 0) {
        if (!ROAD.test(w.slice(ix + nm.length + 2))) return { fee: +groups[g].fee || 0, name: groups[g].areas[k] };   // "Richmond Rd" is a street, not Richmond
        at = ix + 1;
      }
    }
    return null;
  }
  function areaByName(n) { var hit = null; (PR.serviceCall || []).forEach(function (g) { g.areas.forEach(function (a) { if (a === n) hit = { fee: +g.fee || 0, name: a }; }); }); return hit; }
  function feeArea() {
    if (S.feePick === '__other') return { other: true, typed: S.area || S.addrText };
    if (S.feePick) { var p = areaByName(S.feePick); if (p) return Object.assign({ picked: true }, p); }
    if (!S.area && !S.addrText) return { empty: true };
    var a = (S.area && areaIn(S.area)) || (S.addrText && areaIn(S.addrText));
    return a || { unknown: true, typed: S.area || S.addrText };
  }
  // ---- ASAP (+fee, prices.js). hours null = always (24/7); otherwise checked in Ottawa time when the form is shown.
  function asapCfg() { return (PR && PR.asap && +PR.asap.fee > 0) ? PR.asap : null; }
  function torontoHHMM(d) {
    try { var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
          var h = '', m = ''; p.forEach(function (x) { if (x.type === 'hour') h = x.value; if (x.type === 'minute') m = x.value; }); return (h === '24' ? '00' : h) + ':' + m; }
    catch (e) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  }
  function asapOpen() {
    var a = asapCfg(); if (!a) return false;
    var h = a.hours; if (!h || !h.start || !h.end) return true;
    var now = torontoHHMM(new Date());
    return h.start <= h.end ? (now >= h.start && now < h.end) : (now >= h.start || now < h.end);
  }
  function asapOn() { return !!S.asap && asapOpen(); }
  // ---- visit day/time the customer picks ("When should we come?"). Day resolved in Ottawa time at form time.
  function torToday() { return torParts(Date.now()).day; }
  function visitDateIso() { var d = torToday(); return S.visitDay === 'today' ? d : S.visitDay === 'tomorrow' ? wall(d, 0, 0, 1440).day : S.visitDay === 'date' ? S.visitDate : ''; }
  function urgencyOf(asap) { var a = asapCfg(); if (!a) return ''; if (asap) return 'asap'; return a.sameDay !== false && visitDateIso() && visitDateIso() === torToday() ? 'same-day' : ''; }
  // ---- after-hours service call (prices.js afterHours). Replaces the area fee; based on the visit time:
  //      ASAP = the time they book; otherwise the start of the "Preferred time" window; none picked = not after hours.
  function inWindow(hhmm, st, en) { return st <= en ? (hhmm >= st && hhmm < en) : (hhmm >= st || hhmm < en); }
  function visitInfo(asap) {
    if (asap) { var n = torontoHHMM(new Date()); return { hhmm: n, label: 'ASAP, booked ' + n + ' ET', src: 'asap-booking-time', shown: t('pAfterVisitAsap').replace('{T}', n) }; }
    var vd = visitDateIso();
    if (S.visitTime) return { hhmm: S.visitTime, label: 'visit ' + (vd || 'date not given') + ' ' + S.visitTime, src: 'visit-time', shown: (vd ? dateWords(vd, S.lang) + ' ' : '') + hourWord(S.visitTime) };
    var m = String(S.pref || '').match(/^(\d{2}:\d{2})/);
    if (m) return { hhmm: m[1], label: 'preferred time ' + S.pref, src: 'preferred-time', shown: t('pAfterVisitPref').replace('{T}', S.pref) };
    return { hhmm: '', label: '', src: 'none', shown: '' };
  }
  function afterHoursOf(v) { var a = PR && PR.afterHours; return !!(a && +a.fee > 0 && v.hhmm && inWindow(v.hhmm, a.start, a.end)); }
  function rimsKey() { return S.rims === 'yes' ? 'on' : 'off'; }   // "Not sure" = off-rims price
  function priceInfo() {
    if (!hasPrices() || S.forceExotic) return null;
    if (isExoticSafe()) return { exotic: true };
    var a = autoTier(), tier = (S.tierPick && PR.tiers[S.tierPick]) ? S.tierPick : (a && a.tier);
    if (!tier || !PR.tiers[tier]) return { none: true };
    var x = PR.tiers[tier], rk = rimsKey(), swap = +x[rk];
    if (!(swap > 0)) return { none: true };
    var dd = x.discount, dmax = Math.max(0, +(dd && typeof dd === 'object' ? dd[rk] : dd) || 0);
    var q = { tier: tier, auto: a, picked: !!S.tierPick, rims: S.rims, rk: rk, swap: swap, low: tier === 'low', offerable: dmax > 0, dmax: dmax };
    if (!S.rims) { q.needRims = true; return q; }
    q.asap = asapOn(); q.urg = urgencyOf(q.asap); q.asapFee = q.urg ? +asapCfg().fee : 0;   // asapFee = the same-day / ASAP urgency fee
    q.visit = visitInfo(q.asap); q.after = afterHoursOf(q.visit);
    var fa = feeArea(); q.area = fa;
    if (q.after) {   // after-hours fee replaces the area fee (never both); the area is still asked for the address
      q.fee = +PR.afterHours.fee; q.feeType = 'after-hours'; q.areaName = fa.name || '';
    } else {
      if (fa.empty || fa.unknown) { q.needArea = true; return q; }
      q.fee = fa.other ? null : fa.fee; q.areaName = fa.other ? '' : fa.name; q.feeType = q.fee ? 'area' : 'none';
    }
    q.full = swap + (q.fee || 0) + q.asapFee;
    var o = offerCalc(q); q.offerType = o.type; q.offerAmt = o.d; q.offerFull = o.full; q.offerable = o.d > 0; q.offerFloor = o.floor;
    q.disc = S.offerApplied ? o.d : 0;   // the exit offer comes off the total (prices.js exitOffer)
    q.amount = q.full - q.disc;   // total shown right above Send
    q.ready = true;
    return q;
  }
  // Exit offer (owner, Oct 19, FINAL two-step rule; never waives both):
  //   1) service call (area or after-hours): min(service call, total - floor)  -> "we'll waive your service call"
  //   2) else urgency fee:                    min(urgency fee, total - floor)   -> "we'll waive the rush fee"
  //   3) else flat: min($15 off rims / "Not sure", $10 on rims, total - floor).
  //   NEVER below the floor: if the discount is $0 or less, there is no exit popup at all.
  function offerCalc(q) {
    var floor = +((PR.exitOffer && PR.exitOffer.floor) || 0), room = q.full - floor, svc = q.fee || 0, urg = q.asapFee || 0, d;
    if (svc > 0) { d = Math.min(svc, room); if (d > 0) return { type: 'waive-service-call', d: d, full: d === svc, floor: floor }; }
    else if (urg > 0) { d = Math.min(urg, room); if (d > 0) return { type: 'waive-urgency', d: d, full: d === urg, floor: floor }; }
    d = Math.min(q.dmax, q.swap, room); return d > 0 ? { type: 'flat', d: d, full: false, floor: floor } : { type: '', d: 0, full: false, floor: floor };
  }
  function offerWords(q, lang) { var L = T[lang || S.lang] || T.en, k = q.offerType === 'waive-urgency' ? 'Urg' : 'Svc'; return { x: L['o' + k], n: L['o' + k + 'N'], my: L['o' + k + 'My'] }; }
  function offerKey(q) { return q.offerType === 'waive-service-call' || q.offerType === 'waive-urgency' ? (q.offerFull ? 'Fees' : 'FeesPart') : ''; }
  function offerFill(str, q) { var w = offerWords(q); return str.replace('{X}', w.x).replace('{Y}', w.my).replace('{NC}', w.n.charAt(0).toUpperCase() + w.n.slice(1)); }
  function priceText(q, lang) { var L = T[lang] || T.en; return money(q.amount, lang) + ' ' + L.pBefore; }   // "$180 before tax" / "180 $ avant taxes"
  function rimsWord(q, lang) { var L = T[lang] || T.en; return (q.rims === 'yes' ? L.rimsYes : q.rims === 'no' ? L.rimsNo : L.rimsUnsure) + (q.asapFee ? ', ' + L.rimsAsap : ''); }
  function breakdown(q, lang) {   // "Swap $130 + $50 service call (Orléans) − $15 offer = $165 before tax"
    var L = T[lang] || T.en;
    return L.bSwap + ' ' + money(q.swap, lang) + (q.after ? ' + ' + money(q.fee, lang) + ' ' + L.bAfter : q.fee ? ' + ' + money(q.fee, lang) + ' ' + L.bFee.replace('{A}', q.areaName) : '') +
      (q.asapFee ? ' + ' + money(q.asapFee, lang) + ' ' + L.bAsap : '') + (q.disc ? ' − ' + money(q.disc, lang) + ' ' + L.bOffer : '') + ' = ' + priceText(q, lang);
  }
  function priceForOwner(q) {     // English, for the alert emails
    var r = q.rims === 'yes' ? 'on rims' : q.rims === 'no' ? 'off rims' : 'not sure, off-rims price';
    return priceText(q, 'en') + ' (' + tierLabel(q.tier, 'en') + ', ' + r + ' ' + money(q.swap, 'en') +
      (q.after ? ' + ' + money(q.fee, 'en') + ' after-hours service call (' + q.visit.label + ')' : q.fee ? ' + ' + money(q.fee, 'en') + ' service call ' + q.areaName : q.fee === null ? ', service call fee to confirm' : ', no service call fee' + (q.areaName ? ' (' + q.areaName + ')' : '')) +
      (q.asapFee ? ' + ' + money(q.asapFee, 'en') + (q.urg === 'asap' ? ' ASAP' : ' same-day') + ' urgency' : '') +
      (q.disc ? ' − ' + money(q.disc, 'en') + ' exit offer (' + (q.offerType === 'flat' ? 'flat' : (q.offerFull ? offerWords(q, 'en').n + ' waived' : 'off the ' + offerWords(q, 'en').n)) + '); regular ' + money(q.full, 'en') : '') + ')';
  }
  function tierSource(q) { return q.picked ? 'picked by customer' : q.auto ? 'auto from ' + (q.auto.why === 'size' ? 'tire size' : q.auto.why === 'runflat' ? 'run-flat box' : 'make/model') : ''; }
  function svcToggles() {   // on/off rims is asked in the price box; only the number of tires stays here
    return '<label class="bk-label">' + t('howMany') + '</label>' +
      '<div class="bk-toggle"><button type="button" data-act="tires" data-v="4" class="' + (S.tires === 4 ? 'sel' : '') + '">' + t('t4') + '</button>' +
      '<button type="button" data-act="tires" data-v="2" class="' + (S.tires === 2 ? 'sel' : '') + '">' + t('t2') + '</button></div>';
  }
  function autoNote(q) {
    if (q.none) return t('pNoTier');
    if (q.picked) return t('pPicked');
    if (q.auto.why === 'runflat') return t('pAutoRunflat');
    if (q.auto.why === 'size') return t('pAutoSize').replace('{S}', parseSize(S.veh.typed).text);
    return t('pAutoCar').replace('{C}', S.veh.car);
  }
  function areaSelect(q) {
    var o = '<option value="">' + esc(t('pAreaPick')) + '</option>';
    (PR.serviceCall || []).slice().sort(function (a, b) { return a.fee - b.fee; }).forEach(function (g) {
      o += '<optgroup label="' + esc(g.fee ? t('pAreaFee').replace('{F}', money(g.fee)) : t('pAreaNone')) + '">' +
        g.areas.slice().sort(function (a, b) { return a.localeCompare(b); }).map(function (a) { return '<option value="' + esc(a) + '"' + (S.feePick === a ? ' selected' : '') + '>' + esc(a) + '</option>'; }).join('') + '</optgroup>';
    });
    o += '<option value="__other"' + (S.feePick === '__other' ? ' selected' : '') + '>' + esc(t('pAreaOther')) + '</option>';
    return '<label class="bk-label" for="bk-feearea">' + esc(t('pAreaQ').replace('{A}', q.area.typed || '')) + '</label>' +
      '<select class="bk-select" id="bk-feearea" data-act="feearea">' + o + '</select>';
  }
  function priceHtml() {
    var q = priceInfo(); if (!q || q.exotic) return '';
    var sel = q.none ? '' : q.tier;
    var h = '<div class="bk-price" id="bk-price"><div class="bk-price-h">💲 ' + t('pTitle') + '</div>' +
      '<div class="bk-label" id="bk-tier-l">' + t('pType') + ' <span class="bk-req">*</span></div>' +
      '<div class="bk-tiers" role="group" aria-labelledby="bk-tier-l">' + PR.order.map(function (k) {
        var x = PR.tiers[k]; if (!x) return '';
        return '<button type="button" class="bk-tier' + (sel === k ? ' sel' : '') + '" id="bk-tier-' + k + '" data-act="tier" data-v="' + k + '" aria-pressed="' + (sel === k) + '">' +
          '<b>' + esc(tierLabel(k)) + '</b><small>' + esc(S.lang === 'fr' ? (x.egFr || x.egEn || '') : (x.egEn || '')) + '</small></button>';
      }).join('') + '</div>' +
      '<p class="bk-tier-note" id="bk-tier-note">' + (q.none ? '' : '✓ ') + esc(autoNote(q)) + '</p>' +
      '<label class="bk-check bk-runflat"><input type="checkbox" data-act="runflat"' + (S.runflat ? ' checked' : '') + '> ' + t('pRunflat') + '</label>' +
      '<div class="bk-label" id="bk-rims-l">' + t('pRimsQ') + ' <span class="bk-req">*</span></div>' +
      '<div class="bk-ct-grid three bk-rims" role="group" aria-labelledby="bk-rims-l">' +
        [['yes', 'rYes'], ['no', 'rNo'], ['unsure', 'rUnsure']].map(function (r) {
          return '<button type="button" class="bk-ct' + (S.rims === r[0] ? ' sel' : '') + '" id="bk-rims-' + r[0] + '" data-act="rims" data-v="' + r[0] + '" aria-pressed="' + (S.rims === r[0]) + '">' + t(r[1]) + '</button>';
        }).join('') + '</div>' +
      '<p class="bk-tier-note">' + t('pRimsHint') + '</p>';
    if (q.none || q.needRims) return h + '</div>';
    if (q.needArea) return h + (q.area.empty ? '<p class="bk-price-note bk-area-need">📍 ' + t('pAreaEmpty') + '</p>' : areaSelect(q)) + '</div>';
    var shown = priceText(q, S.lang), ac = asapCfg();
    var asapHtml = !ac ? '' : asapOpen()
      ? '<label class="bk-check bk-asap"><input type="checkbox" id="bk-asap" data-act="asap"' + (S.asap ? ' checked' : '') + '> <span>' + esc(t('pAsap').replace('{F}', money(+ac.fee))) + '</span></label>'
      : '<p class="bk-price-note bk-asap-off" id="bk-asap-off">' + esc(t('pAsapOff')) + ' <a href="' + TEL + '">' + esc(t('callBtn')) + '</a></p>';
    return h + (q.area.picked || q.area.other ? areaSelect({ area: { typed: S.area || S.addrText } }) : '') + asapHtml +
      (q.urg === 'same-day' ? '<p class="bk-price-note bk-sameday" id="bk-sameday">' + esc(t('pSameDay').replace('{F}', money(q.asapFee))) + '</p>' : '') +
      (q.after ? '<p class="bk-price-note bk-after" id="bk-after">' + esc(t('pAfter').replace('{W}', q.visit.shown).replace('{F}', money(q.fee))) + '</p>' : '') +
      (q.rims === 'unsure' ? '<p class="bk-price-note">' + t('pUnsureNote') + '</p>' : '') +
      (q.low ? '<p class="bk-price-note">' + t('pLow') + '</p>' : '') +
      (q.fee === null ? '<p class="bk-price-note">' + t('pAreaOtherNote') + '</p>' : '') +
      '<div class="bk-total" id="bk-total"><div class="bk-total-l">' + t('pTotalT') + '</div>' +
        '<div class="bk-price-amt" id="bk-price-amt" aria-live="polite">' + esc(shown) + '</div>' +
        (q.fee || q.disc || q.asapFee ? '<div class="bk-price-break" id="bk-price-break">' + esc(breakdown(q, S.lang)) + '</div>' : '') +
        (q.disc ? '<div class="bk-offer-on" id="bk-offer-on">' + esc(offerFill(t('pOfferOn' + offerKey(q)).replace('{D}', money(q.disc)), q)) + '</div>' : '') +
        '<div class="bk-price-svc">' + t('pSvc') + ' · ' + esc(tierLabel(q.tier)) + ' · ' + esc(rimsWord(q, S.lang)) + '</div>' +
        (q.fee === null ? '<div class="bk-price-svc">' + esc(t('pAreaOtherShort')) + '</div>' : '') +
        '<p class="bk-price-note">' + t('pPlusTax') + '</p></div></div>';
  }
  function refreshPrice() {
    var w = document.getElementById('bk-price-wrap'); if (!w) return;
    var a = document.activeElement && document.activeElement.getAttribute('data-act'), av = document.activeElement && document.activeElement.getAttribute('data-v');
    var h = priceHtml(); if (h === w.__h) return;   // unchanged: keep the same nodes (a tap that blurs a text field must not be lost)
    w.innerHTML = h; w.__h = h;
    var mo = document.getElementById('mo-offer');   // exit-offer popup open while the total changes: keep its numbers current
    if (mo && !mo.hidden && mo.querySelector('.mo-yes') && !S.offerApplied && window.MTRO_OFFER) {
      var x = window.MTRO_OFFER.text(), mt = mo.querySelector('#mo-t'), mp = mo.querySelector('.mo-box p'), my = mo.querySelector('.mo-yes');
      if (x && mt && mp && my) { mt.textContent = x.title; mp.textContent = x.sub; my.textContent = x.yes; }
    }
    if (a === 'runflat' || a === 'tier' || a === 'rims' || a === 'feearea' || a === 'asap') { var el = w.querySelector('[data-act="' + a + '"]' + (av ? '[data-v="' + av + '"]' : '')); if (el) el.focus(); }
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
    bindAfterRender();
  }

  // ---------------------------------------------------------------- the one-screen form
  // Required: name, phone, area, and EITHER make & model OR tire size. Everything else is optional.
  var AREAS = ['Ottawa', 'Kanata', 'Nepean', 'Orléans', 'Barrhaven', 'Gloucester', 'Stittsville', 'Riverside South', 'Vanier', 'Manotick', 'Gatineau', 'Aylmer', 'Hull',
               'Rockland', 'Cumberland', 'Greely', 'Richmond', 'Carp', 'Navan', 'Metcalfe', 'Osgoode', 'North Gower', 'Constance Bay', 'Dunrobin', 'Kinburn', 'Kemptville', 'Arnprior', 'Russell', 'Embrun'];
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
    return '<div class="bk-exotic"><div style="font-size:30px">🏎️</div><h3>' + t('exT') + '</h3><p class="bk-sub">' + t('exSub') + '</p>' +
      '<a class="bk-btn green" href="' + TEL + '">' + t('callBtn') + '</a>' +
      '<button class="bk-btn" type="button" data-act="exotic">' + (S.busy ? '<span class="bk-spin"></span>' : t('exSend')) + '</button></div>';
  }
  function refreshStep1() {
    var w = document.getElementById('bk-chip-wrap'); if (w) w.innerHTML = chipHtml();
    var e = document.getElementById('bk-size-err'); if (e) e.textContent = S.veh.typed && !parseSize(S.veh.typed) ? t('sizeBad') : '';
    var sb = root.querySelector('[data-act="book"]'); if (sb) sb.style.display = isExoticSafe() && !S.exoticDone ? 'none' : '';
    refreshPrice();
  }
  function markStarted() {   // entered a car or size, then left before sending (assets/offer.js)
    if (S.cfg && !S.done && step1Basics() && !isExoticSafe() && !lsGet('bk_started')) lsSet('bk_started', String(Date.now()));
  }
  function inp(id, f, label, val, extra) {
    return (label ? '<label class="bk-label" for="' + id + '">' + label + '</label>' : '') + '<input class="bk-input" id="' + id + '" data-f="' + f + '" value="' + esc(val) + '"' + (extra || '') + '>';
  }
  function zoneHtml() {
    var z = S.zone; if (!z || z.error || z.zone !== 0) return '';
    return '<div class="bk-zone z0">' + t('z0') + '<br><small>' + esc(z.formatted || '') + '</small>' +
      '<a class="bk-btn" href="' + TEL + '">' + t('callBtn') + '</a></div>';
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
      visitHtml() + callTimeHtml() +
      '<datalist id="bk-areas">' + AREAS.map(function (x) { return '<option value="' + x + '">'; }).join('') + '</datalist>' + zoneHtml() +
      '<details class="bk-more"' + (S.more ? ' open' : '') + '><summary>' + t('more') + '</summary>' +
      inp('bk-addr', 'addr', t('fAddr'), S.addrText, ' autocomplete="street-address" placeholder="' + t('fAddrPh') + '"') +
      inp('bk-email', 'email', t('email'), S.c.email, ' type="email" autocomplete="email"') +
      '<label class="bk-label" for="bk-oy">' + t('yearTrim') + '</label><div class="bk-row">' + inp('bk-oy', 'oYear', '', v.oYear, ' inputmode="numeric" maxlength="4" placeholder="' + t('yearPh') + '"') +
      inp('bk-trim', 'oTrim', '', v.oTrim, ' placeholder="' + t('trimPh') + '"') + '</div>' +
      svcToggles() +
      inp('bk-notes', 'notes', t('notes'), S.c.notes, ' placeholder="' + t('notesPh') + '"') + '</details>' +
      '<div class="bk-hp" aria-hidden="true"><label>Website<input id="bk-hp" tabindex="-1" autocomplete="off"></label></div>' +
      '<div id="bk-chip-wrap">' + chipHtml() + '</div>' +
      '<div id="bk-price-wrap">' + priceHtml() + '</div>' +
      '<div class="bk-err" id="bk-book-err" role="alert">' + (S.bookErr || '') + '</div>' +
      '<button class="bk-btn green" type="button" data-act="book"' + (S.busy ? ' disabled' : '') + (isExoticSafe() && !S.exoticDone ? ' style="display:none"' : '') + '>' +
        (S.busy ? '<span class="bk-spin"></span> ' + t('booking') : t('send')) + '</button>' +
      '<p class="bk-note">' + (hasPrices() ? t('pay') : t('fNote')) + '</p><p class="bk-hint">' + t('mayContact') + '</p></div>';
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
  function hourWord(hm) { var h = +hm.slice(0, 2); return S.lang === 'fr' ? h + ' h' : ((h % 12) || 12) + ':00 ' + (h < 12 ? 'AM' : 'PM'); }
  function visitHtml() {
    var asap = !!S.asap, hrs = '';
    for (var h = 0; h < 24; h++) { var v = pad2(h) + ':00'; hrs += opt(v, hourWord(v), S.visitTime === v); }
    return '<fieldset class="bk-calltime bk-visit"><legend class="bk-ct-q">🚐 ' + t('vQ') + ' <small>(' + t('vOpt') + ')</small></legend>' +
      (asap ? '<p class="bk-note" id="bk-visit-asap">' + t('vAsap') + '</p>' :
      '<div class="bk-ct-grid three" role="group" aria-label="' + esc(t('vDate')) + '">' +
        ctBtn('vday', 'today', t('ctToday'), S.visitDay === 'today') + ctBtn('vday', 'tomorrow', t('ctTomorrow'), S.visitDay === 'tomorrow') + ctBtn('vday', 'date', t('ctPick'), S.visitDay === 'date') + '</div>' +
      (S.visitDay === 'date' ? '<label class="bk-label" for="bk-visit-date">' + t('vDate') + '</label><input class="bk-input" type="date" id="bk-visit-date" data-f="visitDate" min="' + torToday() + '" value="' + esc(S.visitDate) + '">' : '') +
      '<label class="bk-label" for="bk-visit-time">' + t('vTime') + '</label><select class="bk-select" id="bk-visit-time" data-f="visitTime">' + opt('', t('vAny'), !S.visitTime) + hrs + '</select>') +
      '</fieldset>';
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
  // Street address + city without repeating the city ("123 Rue Exemple, Orléans" + "orleans" -> "123 Rue Exemple, Orléans").
  // Case- and accent-insensitive, whole words only (so "Hull" is not found inside "Hullmar Dr").
  function joinAddr(street, city) {
    street = String(street || '').trim(); city = String(city || '').trim();
    if (!street || !city) return street || city;
    var ns = ' ' + nrm(street).replace(/[^a-z0-9]+/g, ' ') + ' ', nc = nrm(city).replace(/[^a-z0-9]+/g, ' ').trim();
    if (!nc || ns.indexOf(' ' + nc + ' ') >= 0) return street;
    var nsT = ns.trim(); if (nsT && (' ' + nc + ' ').indexOf(' ' + nsT + ' ') >= 0) return city;   // the "street" is just the city again
    return street + ', ' + city;
  }
  function areaLabel() { return (S.zone && !S.zone.error && S.zone.formatted) || joinAddr(S.addrText, S.area); }

  function doneHtml() {
    var d = S.done;
    return '<div class="bk-card bk-done"><div class="big">✅</div><h2 class="bk-title">' + t('doneR') + '</h2>' +
      '<p class="bk-sub" style="font-size:17px"><b>' + t('doneRsub') + '</b></p>' +
      '<div class="bk-sum" style="text-align:left"><div><span>' + t('bookingNo') + '</span><span>' + esc(d.bookingNo) + '</span></div></div>' +
      calHtml(d) +
      (d.emailed ? '<p class="bk-note">' + t('emailSent') + '</p>' : '') + '<p class="bk-note">' + t('change') + '</p>' +
      (d.testMode ? '<p class="bk-note" style="color:#ffd27a">' + t('testDone') + '</p>' : '') + '</div>';
  }

  // ---- "Add to my calendar" (customer). Ottawa wall-clock times with TZID America/Toronto.
  //   ASAP: from the moment they send, 1 hour, title "(ASAP)".  Preferred time picked: its start, 1 hour, on the
  //   call day they chose (else today if still ahead, else tomorrow).  Neither (only a call window, or nothing):
  //   the start of their best-time-to-call window (Morning 09:00, Afternoon 12:00, Evening 17:00) or the next full
  //   hour, flagged as "around your best time to call". Always "Requested time: we'll call to confirm".
  var PHONE_SHOWN = '(613) 601-6471', CT_START = { morning: '09:00', afternoon: '12:00', evening: '17:00' };
  function torParts(ms) {
    var o = {}; new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
    return { day: o.year + '-' + o.month + '-' + o.day, hh: +o.hour % 24, mm: +o.minute };
  }
  function wall(day, hh, mm, addMin) {   // calendar math on a wall-clock time (no time zone involved)
    var p = day.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2], hh, mm + (addMin || 0)));
    return { day: d.toISOString().slice(0, 10), hh: d.getUTCHours(), mm: d.getUTCMinutes() };
  }
  function wstr(w) { return w.day.replace(/-/g, '') + 'T' + pad2(w.hh) + pad2(w.mm) + '00'; }
  function calInfo(q, now) {
    var tp = torParts(now), nowHM = pad2(tp.hh) + ':' + pad2(tp.mm), start, guess = false, asap = !!(q && q.asap);
    var dayOf = function (hm) { return S.callDay === 'today' ? tp.day : S.callDay === 'tomorrow' ? wall(tp.day, 0, 0, 1440).day : S.callDay === 'date' && S.callDate ? S.callDate : hm > nowHM ? tp.day : wall(tp.day, 0, 0, 1440).day; };
    var pm = String(S.pref || '').match(/^(\d{2}):(\d{2})/);
    var vd = visitDateIso();
    if (asap) start = { day: tp.day, hh: tp.hh, mm: tp.mm };
    else if (S.visitTime) start = { day: vd || dayOf(S.visitTime), hh: +S.visitTime.slice(0, 2), mm: 0 };
    else if (vd) { var c0 = (CT_START[S.callPart] || '09:00').split(':'); start = { day: vd, hh: +c0[0], mm: +c0[1] }; guess = true; }
    else if (pm) start = { day: dayOf(pm[1] + ':' + pm[2]), hh: +pm[1], mm: +pm[2] };
    else if (CT_START[S.callPart]) { var c = CT_START[S.callPart].split(':'); start = { day: dayOf(CT_START[S.callPart]), hh: +c[0], mm: +c[1] }; guess = true; }
    else { start = wall(tp.day, tp.hh, 0, 60); guess = true; }
    var end = wall(start.day, start.hh, start.mm, 60), L = T[S.lang] || T.en;
    var total = q ? (q.fee || q.disc || q.asapFee ? breakdown(q, S.lang) : priceText(q, S.lang)) + ' (' + tierLabel(q.tier) + ', ' + rimsWord(q, S.lang) + ')' : L.calNoPrice;
    if (q && q.fee === null) total += ' · ' + L.pAreaOtherShort;
    return { asap: asap, guess: guess, start: start, end: end, title: asap ? L.calTAsap : L.calT, address: areaLabel() || S.area || S.addrText || '',
             desc: [L.calReq, L.calAddr + ': ' + (areaLabel() || S.area || S.addrText || '—'), L.calTotal + ': ' + (q ? total : L.calNoPrice), L.calQ + ' ' + PHONE_SHOWN + '. Mobile Tire Repair Ottawa'] };
  }
  function calWhenText(c) {
    var p = c.start.day.split('-').map(Number), d = new Date(p[0], p[1] - 1, p[2]);
    return d.toLocaleDateString(S.lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'long', month: 'long', day: 'numeric' }) + (S.lang === 'fr' ? ', ' + c.start.hh + ' h ' + pad2(c.start.mm) : ', ' + ((c.start.hh % 12) || 12) + ':' + pad2(c.start.mm) + (c.start.hh < 12 ? ' a.m.' : ' p.m.'));
  }
  function gcalLink(c, no) {
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(c.title) + '&dates=' + wstr(c.start) + '/' + wstr(c.end) +
      '&ctz=America%2FToronto&details=' + encodeURIComponent(c.desc.concat(no ? [T[S.lang].calReqNo + ' ' + no] : []).join('\n')) + '&location=' + encodeURIComponent(c.address);
  }
  function icsEsc(v) { return String(v).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function icsFold(line) {   // RFC 5545: lines of at most 75 octets, continued with CRLF + space
    var out = [], cur = '', n = 0;
    for (var ch of line) { var b = unescape(encodeURIComponent(ch)).length; if (n + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; n = 0; } cur += ch; n += b; }
    out.push(cur); return out.join('\r\n ');
  }
  function icsText(c, no, now) {
    var tp = new Date(now).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mobile Tire Repair Ottawa//Booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE', 'TZID:America/Toronto',
      'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
      'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
      'END:VTIMEZONE', 'BEGIN:VEVENT', 'UID:' + (no || tp) + '@mobiletirerepairottawa.ca', 'DTSTAMP:' + tp,
      'DTSTART;TZID=America/Toronto:' + wstr(c.start), 'DTEND;TZID=America/Toronto:' + wstr(c.end),
      'SUMMARY:' + icsEsc(c.title), 'LOCATION:' + icsEsc(c.address), 'DESCRIPTION:' + icsEsc(c.desc.concat(no ? [T[S.lang].calReqNo + ' ' + no] : []).join('\n')),
      'STATUS:TENTATIVE', 'TRANSP:OPAQUE', 'END:VEVENT', 'END:VCALENDAR'].map(icsFold).join('\r\n') + '\r\n';
  }
  function calHtml(d) {
    var c = S.cal; if (!c) return '';
    return '<div class="bk-cal" id="bk-cal"><h3 class="bk-cal-h">' + t('calH') + '</h3>' +
      '<p class="bk-note">' + esc(t(c.guess ? 'calWhenGuess' : 'calWhen').replace('{W}', calWhenText(c))) + '</p>' +
      '<div class="bk-cal-btns"><a class="bk-btn" id="bk-cal-google" target="_blank" rel="noopener" href="' + esc(gcalLink(c, d.bookingNo)) + '">' + t('calGoogle') + '</a>' +
      '<a class="bk-btn" id="bk-cal-ics" download="mobile-tire-repair-ottawa.ics" href="data:text/calendar;charset=utf-8,' + encodeURIComponent(icsText(c, d.bookingNo, Date.now())) + '">' + t('calIcs') + '</a></div></div>';
  }

  // ---------------------------------------------------------------- fallback (script down)
  function fallbackHtml(full) {
    return '<div class="bk-fallback"><h2 class="bk-title" style="font-size:20px">' + t('fbTitle') + '</h2><p class="bk-sub">' + t('fbSub') + '</p>' +
      '<a class="bk-btn green" href="' + TEL + '">' + t('fbBtn') + '</a></div>';
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
    if (f === 'car') { if (v.car !== val) S.tierPick = ''; v.car = val; syncCar(); S.exoticDone = false; }
    else if (f === 'typed' || f === 'oYear' || f === 'oTrim') { if (f === 'typed' && v.typed !== val) S.tierPick = ''; v[f] = val; if (f !== 'oYear') S.exoticDone = false; }
    else if (f === 'area') { if (S.area !== val) S.feePick = ''; S.area = val; S.zone = null; }
    else if (f === 'addr') { if (S.addrText !== val && !S.area) S.feePick = ''; S.addrText = val; S.zone = null; }
    else if (f === 'pref') S.pref = val;
    else if (f === 'visitTime') S.visitTime = val;
    else if (f === 'visitDate') S.visitDate = val && val >= torToday() ? val : '';
    else if (f === 'callDate') { S.callDate = val && val >= todayIso() ? val : ''; if (val && !S.callDate) el.value = ''; }
    else if (f === 'name' || f === 'phone' || f === 'email' || f === 'notes') S.c[f] = val;
    return f;
  }
  function onEdit(e) {
    if (e.target && e.target.getAttribute && e.target.getAttribute('data-act') === 'feearea') { if (e.type !== 'change') return; S.feePick = e.target.value; refreshPrice(); return draftSoon(); }
    var f = readField(e.target); if (!f) return;
    if (f === 'car' || f === 'typed' || f === 'oYear' || f === 'oTrim') { refreshStep1(); markStarted(); }
    if (f === 'area' || f === 'addr') { var z = root.querySelector('.bk-zone'); if (z) z.remove(); refreshPrice(); }
    if (f === 'callDate' && e.type === 'change') { render(); return draftSoon(); }
    if (f === 'pref' || f === 'visitTime' || f === 'visitDate') { refreshPrice(); draftSoon(); }
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
    if (act === 'tires') { readAll(); S.tires = +val; return render(); }
    if (act === 'runflat') { S.runflat = el.checked; S.tierPick = ''; refreshStep1(); markStarted(); return draftSoon(); }
    if (act === 'tier') { readAll(); S.tierPick = val; refreshStep1(); markStarted(); return draftSoon(); }
    if (act === 'asap') { S.asap = el.checked; S.asapAt = el.checked ? new Date().toISOString() : ''; readAll(); render(); var ab = document.getElementById('bk-asap'); if (ab) ab.focus(); return draftSoon(); }
    if (act === 'vday') { readAll(); S.visitDay = S.visitDay === val ? '' : val; if (val !== 'date') S.visitDate = ''; render(); focusAct(act, val); return draftSoon(); }
    if (act === 'rims') { readAll(); S.rims = val; S.service = val === 'yes' ? 'on' : 'off'; refreshStep1(); return draftSoon(); }
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
    var q = priceInfo();
    if (q && q.none) return { msg: t('pNeedTier'), el: 'bk-tier-' + PR.order[0] };
    if (q && q.needRims) return { msg: t('pNeedRims'), el: 'bk-rims-yes' };
    if (q && q.needArea) return { msg: t('pNeedArea'), el: 'bk-feearea' };
    return null;
  }
  function cleanPhone(p) { var d = String(p || '').replace(/\D/g, ''); if (d.length === 11 && d[0] === '1') d = d.slice(1); return /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? d : ''; }

  // Zone from the full address if given, otherwise from the city/neighbourhood. Never blocks the request
  // unless the script says the place is outside our area (zone 0).
  function checkZone() {
    if (S.zone) return Promise.resolve(S.zone);
    var q = S.addrText ? S.addrText + (S.area ? ', ' + S.area : '') : S.area;
    if (q.length < 6) q += ', Ottawa-Gatineau';   // the script rejects place names under 6 letters (Carp, Hull, Navan)
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
             address: areaLabel(), zone: S.zone && !S.zone.error ? S.zone.zone : '', area: S.area, callTime: callTime(), lang: S.lang, price: shownPriceForOwner(), ref: S.ref, onRims: S.rims, asap: asapOn(), serviceArea: (function () { var q = priceInfo(); return q && q.ready ? (q.areaName || 'Other') : ''; })() };
  }
  function shownPriceForOwner() { var q = priceInfo(); return q && q.ready ? priceForOwner(q) : 'Call for a quote'; }
  function sendDraft() {
    if (S.done) return;
    readAll();
    var phone = cleanPhone(S.c.phone); if (!phone || !S.cfg || !step1Basics()) return;   // fires once phone + (car or size) are in
    var payload = { action: 'draft', session: S.session, firstName: (S.c.name || '').split(' ')[0], phone: phone, vehicle: vehicleLabel(),
                    slot: S.pref || '', callTime: callTime(), price: shownPriceForOwner(), details: draftDetails() };
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
      if (z && !z.error && z.zone === 0) { S.busy = false; return render(); }   // outside our area: show the Call box
      sendDraft();
      var v = S.veh, typed = parseSize(v.typed);
      var ct = callTime();
      var notes = [S.c.notes, ct ? 'Best time to call: ' + ct : '', S.pref ? (S.lang === 'fr' ? 'Heure préférée : ' : 'Preferred time: ') + S.pref : ''].filter(Boolean).join(' · ');
      var payload = {
        action: 'lead', session: S.session, lang: S.lang, hp: hpv,
        vehicleId: '', year: v.oYear, make: v.oMake, model: v.oModel, trim: v.oTrim, trimUnsure: !v.oTrim, vehicleClass: (priceInfo() || {}).tier === 'pickup' ? 'pickup' : 'car',
        sizeTyped: typed ? typed.text : '', photoUrl: v.photoUrl, service: S.service, tires: S.tires,
        address: (S.addrText || S.area).length < 6 ? (S.addrText || S.area) + ', Ottawa-Gatineau' : (S.addrText || S.area), addressFormatted: areaLabel(),
        name: S.c.name, phone: S.c.phone, email: S.c.email, notes: notes, offerId: '', expectedSubtotal: null, ref: S.ref, multiCar: !!S.multiCar,
        // new, informational fields (the script can ignore them):
        area: S.area, streetAddress: S.addrText, preferredTime: S.pref, callTime: ct, vehicleText: v.car, zone: z && !z.error ? z.zone : '', price: 'Call for a quote'
      };
      var q = priceInfo();
      if (q && q.ready) {   // itemized total shown to the customer right above Send (no accept checkbox: owner, Oct 18)
        payload.price = priceForOwner(q); payload.totalShown = true; payload.priceAmount = q.amount; payload.total = q.amount; payload.regularPrice = q.full;
        payload.swapPrice = q.swap; payload.onRims = q.rims === 'yes' ? 'yes' : q.rims === 'no' ? 'no' : 'not sure';
        payload.serviceFee = q.fee; payload.serviceArea = q.fee === null ? 'Other: ' + (S.area || S.addrText) : (q.areaName || S.area || S.addrText);
        payload.offerApplied = !!q.disc; payload.offerAmount = q.disc; payload.offerType = q.disc ? q.offerType : ''; payload.offerFloor = q.offerFloor; payload.tier = q.tier; payload.tierLabel = tierLabel(q.tier, 'en');
        payload.tierSource = tierSource(q); payload.runFlat = !!S.runflat; payload.beforeTax = true; payload.priceShown = priceText(q, S.lang);
        payload.afterHours = !!q.after; payload.serviceFeeType = q.after ? 'after-hours' : q.fee === null ? 'to confirm' : q.fee ? 'area' : 'none';
        payload.visitTime = q.visit.label; payload.visitTimeSource = q.visit.src;
        payload.urgency = !!q.urg; payload.urgencyReason = q.urg; payload.urgencyFee = q.asapFee;
        payload.visitDate = q.asap ? torToday() : visitDateIso(); payload.visitHour = q.asap ? '' : S.visitTime;
        payload.asap = !!q.asap; payload.asapFee = q.asap ? q.asapFee : 0; payload.asapRequestedAt = q.asap ? S.asapAt : '';
        payload.asapRequestedLocal = q.asap && S.asapAt ? new Date(S.asapAt).toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' }) + ' ET' : '';
        if (q.urg) payload.notes = ['⚡ ' + (q.urg === 'asap' ? 'ASAP' : 'SAME-DAY') + ' urgency (+' + money(q.asapFee, 'en') + ')', payload.notes].filter(Boolean).join(' · ');
        payload.notes = [payload.notes, 'Total shown: ' + payload.price, 'Tier: ' + payload.tierLabel + ' (' + payload.tierSource + ')'].filter(Boolean).join(' · ');
      }
      var cal = calInfo(q && q.ready ? q : null, Date.now());
      return apiPost(payload).then(function (r) {
        S.busy = false;
        if (r.ok) {
          S.done = r; S.cal = cal;
          if (S.offer) { S.offer.used = true; lsSet('bk_offer', JSON.stringify(S.offer)); S.offer = null; }
          if (S.offerApplied) lsSet('bk_swap_offer', 'used');
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

  // ---------------------------------------------------------------- exit offer (one-time $ off, amounts in prices.js)
  // The popup + its triggers live in /assets/offer.js (leaving the tab, idle, fast scroll up, mouse to the tab bar).
  // It only shows here, once per visitor, when the form is started (car or size + a price) but not sent.
  function offerQuote() { var q = priceInfo(); return q && q.ready && q.offerable ? q : null; }
  window.MTRO_OFFER = {
    priceOffer: true,
    canShow: function () { return hasPrices() && !!S.cfg && !S.fatal && !S.done && !S.busy && !S.offerApplied && lsGet('bk_swap_offer') !== 'used' && step1Basics() && !!offerQuote(); },
    started: function () { return !!S.cfg && !S.done && step1Basics() && !isExoticSafe(); },
    text: function () {
      var q = offerQuote(); if (!q) return null;
      var d = q.offerAmt, D = money(d), full = money(q.full), now = money(q.full - d), k = offerKey(q);
      function f(x) { return t(x).replace(/\{D\}/g, D).replace('{F}', full).replace('{P}', now).replace('{X}', offerWords(q).x).replace('{Y}', offerWords(q).my); }
      return { title: f('xoT' + k), sub: f('xoS'), yes: f('xoYes' + k), no: f('xoNo'), type: q.offerType };
    },
    claim: function () {
      S.offerApplied = true; lsSet('bk_swap_offer', '1');
      refreshPrice(); draftSoon();
      var amt = document.getElementById('bk-price'); if (amt && amt.scrollIntoView) amt.scrollIntoView({ block: 'center' });
    }
  };

  // ---------------------------------------------------------------- start
  // The page only uses these config fields. It never reads prices, fees, taxes or offers, so the
  // script's config action can (and should) stop sending them: see CONFIG-PRICE-REMOVAL steps.
  // (Anything the script sends is still public in the network tab; this just keeps it out of the page.)
  var CFG_KEYS = ['ok', 'testMode', 'season', 'slots', 'rules', 'adsBookingLabel', 'phone'];   // prices come from prices.js, not the script
  function publicPart(c) { var o = {}; CFG_KEYS.forEach(function (k) { if (c && c[k] !== undefined) o[k] = c[k]; }); return o; }
  render();
  Promise.all([apiGet('config')]).then(function (res) {   // vehicle list no longer needed (free-text make & model)
    if (!res[0].ok) return goFallback();
    S.cfg = publicPart(res[0]); S.rows = [];
    S.season = S.cfg.season === 'summer' ? 'summer' : 'winter';
    if (S.cfg.testMode && qsSeason) S.season = qsSeason;   // ?season=summer preview while in TEST MODE
    document.title = t('title') + ' | Mobile Tire Repair Ottawa';
    if (S.season === 'summer') { var sn = document.getElementById('snow'); if (sn) sn.style.display = 'none'; }   // no snowfall in summer
    render();
  }).catch(function () { goFallback(); });
  window.__bk = S; // for testing
})();
