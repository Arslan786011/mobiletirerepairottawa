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
      kicker: '❄ Winter swap booking', title: 'Book your winter tire swap', sub: 'We come to your driveway. Book in 2 minutes: pick your time, see your total, done.',
      headline: 'Winter tire swaps · mounting & balancing included · we come to you. Your price is shown before you book.',
      test: '🧪 TEST MODE: bookings are marked TEST and emails go to the owner only',
      s1: 'Your vehicle', year: 'Year', make: 'Make', model: 'Model', trim: 'Trim', choose: 'Choose…', notSure: 'Not sure of trim (use most common)',
      notListed: "My vehicle isn't listed", backToList: '← Pick from the list', otherYear: 'Year', otherMake: 'Make', otherModel: 'Model',
      size: 'Tire size (optional)', sizePh: 'e.g. 225/65R17', sizeBad: 'That size doesn\'t look right. Example: 225/65R17',
      sizeTip: "Your tire size is on the sticker inside the driver's door, or on the side of the tire.",
      photo: 'Or upload a sidewall photo (optional)', photoOk: '✓ Photo uploaded', photoUp: 'Uploading photo…', photoErr: "Photo didn't upload. That's OK, you can skip it.",
            next: 'Next →', back: '← Back',
      s2: 'What do you need?', off: 'Off rims: mount & balance', offD: 'Your tires need to be moved onto your rims and balanced.',
      on: 'On rims', onD: 'Your winter tires are already on their own rims. We swap the wheels.', howMany: 'How many tires?', t4: '4 tires', t2: '2 tires',
      s3: "Where's the car?", addr: 'Street address + city', addrPh: 'e.g. 123 Greenbank Rd, Nepean', check: 'Check address',
      z1: "✅ Good news, we cover your area.", z2: '✅ Good news, we cover your area.', z3: '✅ Good news, we cover your area.',
      z0: 'Outside our service area — call us.',
      multi: 'I have 2 or more cars at this address', multiWaived: 'Travel fee waived for 2+ cars',
            whyQ: 'Why does this cost more?',
      whyA: 'Low-profile tires have short, very stiff sidewalls. They take more time and special equipment to mount without scratching or bending your rims, and many are run-flats with sensitive tire pressure sensors.',
      exT: 'This vehicle needs a custom quote — call us',
      exSub: "Exotic and high-performance tires need special handling, so we price them one by one. Leave your details and we'll get back to you fast.",
      exSend: 'Send my quote request', exDone: "✅ Got it! We'll call you with your quote.", exAddr: 'Address or area',
      zoneWord: 'zone',
      notFound: "We couldn't find that address. Add the city (e.g. Ottawa, Kanata, Gatineau) and try again.",
            s4: 'Pick a day and time', s4sub: 'Only open times are shown. Our tech arrives within your window and calls before coming.',
      full: 'Full', open1: 'open', held: "✓ We're holding this time for 10 minutes while you finish.", taken: 'Sorry, that time was just taken. Pick another.',
      waitTitle: 'This day is full', waitSub: "Join the waitlist. If a time opens up, we'll call you first.", anyTime: 'Any time',
      joinWait: 'Join waitlist', waitDone: "✅ You're on the waitlist. We'll call you if a time opens.", otherDay: '← Pick another day',
      s5: 'How do we reach you?', name: 'Name', phone: 'Mobile phone', email: 'Email (optional): for your confirmation and reminder', notes: 'Parking notes (optional)',
      notesPh: 'Driveway, underground, visitor spot…',       phoneBad: 'Please enter a 10-digit phone number.', nameBad: 'Please enter your name.',
      s6: 'Check your details', when: 'When', service: 'Service', where: 'Where', vehicle: 'Vehicle', contact: 'Contact', tsize: 'Tire size',
      sizeEst: 'estimated from vehicle', sizeCust: 'entered by you', sizeUnk: 'not given',
      pay: 'Pay the tech when done: cash, card or e-transfer.',
      booking: 'Booking…',
      priceChanged: 'Please check your booking and tap Book again.', offerGone: "That offer couldn't be applied (it may have expired or already been used). Call for a quote.",
      limit: 'This phone number already has bookings today. Please call us.',
      doneT: '🎉 You\'re booked!', doneR: '🎉 You\'re booked!', doneRsub: 'We\'ll call you if anything changes. Questions? Call (613) 601-6471', bookingNo: 'Booking #',
      emailSent: 'A copy of your booking is in your email.', addCal: '📅 Add to my calendar', addIcs: 'Download calendar file (.ics)',
      testDone: '🧪 Test booking saved. Check the Winter Swaps calendar, your email and the WhatsApp groups.',
      fbTitle: 'Online booking is having trouble right now', fbSub: "No problem: call us and we'll book you in on the phone.",
      fbBtn: '📞 Call (613) 601-6471', offerTitle: 'Call for a quote', offerYes: 'Call for a quote', offerNo: 'No thanks',
      offerBar: '', loading: 'Loading…', err: 'Something went wrong. Please try again.',
            prevWeek: 'Previous week', nextWeek: 'Next week', pickDay: 'Pick a day above to see open times.',
      fTitle: 'Your details', req: 'required',
      car: 'Car make & model or tire size — whichever you know', carHint: "Fill in one or both. Not sure? Make and model is enough.",
      carMM: 'Car make & model', carPh: 'e.g. Toyota RAV4', or: 'or', sizeOnly: 'Tire size (optional)', sizeHint: "Find it on the tire's side, e.g. 225/65R17 — skip if you don't know.",
      needModel: 'Please add the model too, e.g. Toyota RAV4.',
      street: 'Street address (number + street)', streetPh: 'e.g. 123 Greenbank Rd', addrBad: 'Please enter your full street address with the house number, e.g. 123 Greenbank Rd.',
      vBusy: 'booked', vChecking: 'Checking open times…', vTaken: 'That hour was just taken, please pick another.', vTakenSel: 'That hour is already booked. Please pick another.',
      noTotal: "We couldn't show your total, so this can't be booked online. Please call (613) 601-6471.",
      dWhen: 'When', dAsap: 'ASAP: the next available tech is on the way', dAddr: 'Address', dVeh: 'Vehicle', dTotal: 'Total',
      area: 'City or neighbourhood', areaPh: 'e.g. Kanata, Orleans, Gatineau',
      more: '+ More details (optional)', fAddr: 'Full street address (optional)', fAddrPh: 'e.g. 123 Greenbank Rd',
      yearTrim: 'Year / trim (optional)', yearPh: 'Year', trimPh: 'Trim, e.g. LE',
      svcQ: 'Service', send: '✅ Book my appointment', needCar: 'Please enter your car\'s make and model, e.g. Toyota RAV4.',
      needArea: 'Please enter your city or neighbourhood.',       callBtn: '📞 Call (613) 601-6471',
      pTitle: 'Your price', pBefore: 'before tax',
      pNoTier: "Enter your car's make & model above to see your price.", pSvc: 'Winter tire swap',
      pRimsQ: 'Are your winter tires already on rims?', rYes: 'Yes', rNo: 'No', rUnsure: 'Not sure',
      rimsYes: 'tires already on rims', rimsNo: 'tires not on rims (mount & balance)', rimsUnsure: 'not sure if on rims',
      pRimsHint: 'On rims = each winter tire is already mounted on its own wheel, so we just swap the wheels.',
      pUnsureNote: 'Not sure? We\'ve used the off-rims price.',
      pNeedRims: 'Please tell us if your winter tires are already on rims.',
      pAreaEmpty: 'Add your city or neighbourhood above to see your total.',
      pAreaQ: "We couldn't tell the service call fee for \"{A}\". Pick the closest area:", pAreaPick: 'Choose…',
      pAreaNone: 'No service call fee', pAreaFee: '+{F} service call', pAreaOther: 'Other (not listed)',
      pAreaOtherNote: 'Your area isn\'t on our list, so any service call fee isn\'t in this total yet. We\'ll call you if it changes your total.',
      pNeedArea: 'Please pick the closest area to see your total.',
      bSwap: 'Swap', bFee: 'service call ({A})', bOffer: 'one-time offer', bAsap: 'same-day / ASAP urgency', bAfter: 'after-hours service call',
      pAfter: '🌙 After-hours visit ({W}): {F} service call instead of the area fee.', pAfterVisitAsap: 'ASAP, now {T}',
      pAsap: '⚡ ASAP: we send the next available tech now (same-day / ASAP urgency +{F} included).', pSameDay: '⚡ Same-day visit: same-day / ASAP urgency +{F} included.',
      pVisitFirst: 'Pick "When should we come?" above. ASAP and same-day visits add the urgency fee; visits from 8 PM to 8 AM use the after-hours service call.',
      vQ: 'When should we come?', vAsapBtn: '⚡ ASAP / Now', vToday: 'Today', vTomorrow: 'Tomorrow', vPick: 'Pick a date', vChoice: 'Visit day',
      vTime: 'Visit time (1-hour window)', vPickHour: 'Choose a time…', vDate: 'Visit date', vHint: 'Pick the 1-hour window that suits you. Need us right now? Choose ⚡ ASAP / Now (24/7).',
      vAsap: '⚡ ASAP: we send the next available tech now. No time to pick.', vNoneLeft: 'No visit times left today. Choose ASAP / Now or Tomorrow.',
      vNeed: 'Please choose when we should come: ASAP / Now, Today, Tomorrow or a date.', vNeedDate: 'Please pick the visit date.', vNeedHour: 'Please pick a visit time.',
      vPast: 'That time has already passed. Please pick a later time.', vChosen: 'Your visit:',
      pAsapOff: 'ASAP not available right now. Pick a time or call us.', rimsAsap: 'same-day / ASAP',
      oLine: '🏷️ One-time offer: {W} −{D}', oLnArea: 'service call fee waived', oLnAfter: 'after-hours fee waived', oLnSame: 'same-day fee waived', oLnAsap: 'ASAP fee waived', oLnFlat: 'discount', oSvc: 'your service call', oSvcN: 'service call', oSvcMy: 'my service call', oUrg: 'the rush fee', oUrgN: 'rush fee', oUrgMy: 'my rush fee', pPlusTax: 'Plus tax. Pay the tech when the job is done.',
      pAccept: 'I accept this total: {P} ({TIER}, {RIMS}).', pAreaOtherShort: 'Service call fee for your area: not included yet.',
      xoT: 'Finish booking now: {D} off', xoS: 'One time only: book now and pay {P} instead of {F}, before tax.',
      xoYes: 'Take {D} off', xoNo: 'No thanks',
      xoTFees: "Book now and we'll waive {X}", xoYesFees: 'Waive {Y}',
      xo2T: 'Still deciding? {D} more off', xo2S: 'One more time only: book now and pay {P} instead of {F}, before tax.', xo2Yes: 'Take {D} more off',
      pOfferSaved: '🏷️ Your one-time online offer is saved. It comes off your total below.',
      pTotalT: 'Your total',
      calT: 'Mobile Tire Repair Ottawa: tire swap', calTAsap: 'Mobile Tire Repair Ottawa: tire swap (ASAP)', calReq: 'Booked', calReqAsap: 'Booked: ASAP, next available tech',
      calAddr: 'Address', calTotal: 'Total', calNoPrice: 'Price: pay the tech when done', calQ: 'Questions? Call', calReqNo: 'Booking #',
      calH: '📅 Add to my calendar', calWhen: 'Your visit: {W} (1 hour).', calWhenAsap: 'Your visit: ASAP, the next available tech (saved as {W}, 1 hour).',
      calGoogle: 'Google Calendar', calIcs: 'Apple / Outlook (.ics)'
    },
    fr: {
      kicker: "❄ Réservation pneus d'hiver", title: "Réservez votre changement de pneus d'hiver", sub: 'On se déplace chez vous. Réservez en 2 minutes : choisissez l\'heure, voyez votre total, c\'est fait.',
      headline: "Changement de pneus d'hiver · montage et équilibrage inclus · on se déplace chez vous. Votre prix est affiché avant de réserver.",
      test: '🧪 MODE TEST : réservations marquées TEST, courriels au propriétaire seulement',
      s1: 'Votre véhicule', year: 'Année', make: 'Marque', model: 'Modèle', trim: 'Version', choose: 'Choisir…', notSure: 'Version inconnue (la plus courante)',
      notListed: "Mon véhicule n'est pas dans la liste", backToList: '← Choisir dans la liste', otherYear: 'Année', otherMake: 'Marque', otherModel: 'Modèle',
      size: 'Taille des pneus (facultatif)', sizePh: 'ex. 225/65R17', sizeBad: 'Cette taille semble incorrecte. Exemple : 225/65R17',
      sizeTip: "La taille est sur l'autocollant dans le cadre de la portière du conducteur, ou sur le flanc du pneu.",
      photo: 'Ou téléversez une photo du flanc (facultatif)', photoOk: '✓ Photo envoyée', photoUp: 'Envoi de la photo…', photoErr: "La photo n'a pas été envoyée. Pas grave, vous pouvez continuer.",
            next: 'Suivant →', back: '← Retour',
      s2: 'De quoi avez-vous besoin?', off: 'Hors jantes : montage et équilibrage', offD: 'Les pneus doivent être montés sur vos jantes et équilibrés.',
      on: 'Sur jantes', onD: "Vos pneus d'hiver sont déjà sur leurs jantes. On change les roues.", howMany: 'Combien de pneus?', t4: '4 pneus', t2: '2 pneus',
      s3: 'Où est le véhicule?', addr: 'Adresse + ville', addrPh: 'ex. 123 rue Principale, Gatineau', check: "Vérifier l'adresse",
      z1: '✅ Bonne nouvelle, on dessert votre secteur.', z2: '✅ Bonne nouvelle, on dessert votre secteur.', z3: '✅ Bonne nouvelle, on dessert votre secteur.',
      z0: 'Hors de notre zone de service — appelez-nous.',
      multi: "J'ai 2 véhicules ou plus à cette adresse", multiWaived: 'Frais de déplacement annulés (2+ véhicules)',
            whyQ: 'Pourquoi est-ce plus cher?',
      whyA: "Les pneus à profil bas ont des flancs courts et très rigides. Ils demandent plus de temps et un équipement spécial pour être montés sans égratigner ni plier vos jantes, et plusieurs sont des pneus à affaissement limité avec des capteurs de pression sensibles.",
      exT: 'Ce véhicule demande une soumission personnalisée — appelez-nous',
      exSub: 'Les pneus de véhicules exotiques et haute performance demandent une manipulation spéciale; on les évalue un par un. Laissez vos coordonnées et on vous répond rapidement.',
      exSend: 'Envoyer ma demande', exDone: '✅ Reçu! On vous appelle avec votre prix.', exAddr: 'Adresse ou secteur',
      zoneWord: 'zone',
      notFound: "Adresse introuvable. Ajoutez la ville (ex. Gatineau, Aylmer, Ottawa) et réessayez.",
            s4: 'Choisissez le jour et la plage horaire', s4sub: 'Seules les plages libres sont affichées. Le technicien arrive dans votre plage et vous appelle avant.',
      full: 'Complet', open1: 'libre(s)', held: '✓ On vous garde cette plage 10 minutes.', taken: "Désolé, cette plage vient d'être prise. Choisissez-en une autre.",
      waitTitle: 'Cette journée est complète', waitSub: "Inscrivez-vous sur la liste d'attente. Si une plage se libère, on vous appelle en premier.", anyTime: "N'importe quand",
      joinWait: "M'inscrire", waitDone: "✅ Vous êtes sur la liste d'attente.", otherDay: '← Choisir un autre jour',
      s5: 'Comment vous joindre?', name: 'Nom', phone: 'Cellulaire', email: 'Courriel (facultatif) : pour votre confirmation et votre rappel', notes: 'Stationnement (facultatif)',
      notesPh: 'Entrée, garage souterrain, visiteurs…',       phoneBad: 'Entrez un numéro à 10 chiffres.', nameBad: 'Entrez votre nom.',
      s6: 'Vérifiez vos informations', when: 'Quand', service: 'Service', where: 'Adresse', vehicle: 'Véhicule', contact: 'Contact', tsize: 'Taille',
      sizeEst: 'estimée selon le véhicule', sizeCust: 'entrée par vous', sizeUnk: 'non indiquée',
      pay: 'Paiement au technicien à la fin : comptant, carte ou virement Interac.',
      booking: 'Réservation…',
      priceChanged: 'Vérifiez votre réservation et touchez Réserver de nouveau.', offerGone: "Cette offre n'a pas pu être appliquée (expirée ou déjà utilisée). Appelez pour une soumission.",
      limit: "Ce numéro a déjà des réservations aujourd'hui. Appelez-nous.",
      doneT: '🎉 Vous êtes réservé!', doneR: '🎉 Vous êtes réservé!', doneRsub: 'On vous appelle seulement si quelque chose change. Questions? Appelez le (613) 601-6471 (service en anglais)', bookingNo: 'Réservation n°',
      emailSent: 'Une copie de votre réservation est dans vos courriels.', addCal: '📅 Ajouter à mon calendrier', addIcs: 'Télécharger le fichier calendrier (.ics)',
      testDone: '🧪 Réservation test enregistrée. Vérifiez le calendrier, votre courriel et les groupes WhatsApp.',
      fbTitle: 'La réservation en ligne a un problème', fbSub: 'Appelez-nous et on vous réserve par téléphone (service en anglais).',
      fbBtn: '📞 Appeler le (613) 601-6471', offerTitle: 'Appelez pour une soumission', offerYes: 'Appelez pour une soumission', offerNo: 'Non merci',
      offerBar: '', loading: 'Chargement…', err: 'Une erreur est survenue. Réessayez.',
      prevWeek: 'Semaine précédente', nextWeek: 'Semaine suivante', pickDay: 'Choisissez un jour ci-dessus pour voir les plages libres.', quebec: "Au Québec, les pneus d'hiver sont obligatoires du 1er décembre au 15 mars.",
      fTitle: 'Vos informations', req: 'obligatoire',
      car: 'Marque et modèle du véhicule ou taille des pneus — ce que vous savez', carHint: "Remplissez l'un ou les deux. Pas sûr? La marque et le modèle suffisent.",
      carMM: 'Marque et modèle du véhicule', carPh: 'ex. Toyota RAV4', or: 'ou', sizeOnly: 'Taille des pneus (facultatif)', sizeHint: 'Inscrite sur le flanc du pneu, ex. 225/65R17 — laissez vide si vous ne savez pas.',
      needModel: 'Ajoutez aussi le modèle, ex. Toyota RAV4.',
      street: 'Adresse (numéro + rue)', streetPh: 'ex. 123 rue Principale', addrBad: 'Entrez votre adresse complète avec le numéro civique, ex. 123 rue Principale.',
      vBusy: 'réservé', vChecking: 'Vérification des heures libres…', vTaken: 'Cette heure vient d’être prise, choisissez-en une autre.', vTakenSel: 'Cette heure est déjà réservée. Choisissez-en une autre.',
      noTotal: "On n'a pas pu afficher votre total, donc la réservation en ligne n'est pas possible. Appelez le (613) 601-6471.",
      dWhen: 'Quand', dAsap: 'Service rapide : le prochain technicien libre arrive', dAddr: 'Adresse', dVeh: 'Véhicule', dTotal: 'Total',
      area: 'Ville ou quartier', areaPh: 'ex. Gatineau, Aylmer, Orléans',
      more: '+ Plus de détails (facultatif)', fAddr: 'Adresse complète (facultatif)', fAddrPh: 'ex. 123 rue Principale',
      yearTrim: 'Année / version (facultatif)', yearPh: 'Année', trimPh: 'Version, ex. LE',
      svcQ: 'Service', send: '✅ Réserver mon rendez-vous', needCar: 'Entrez la marque et le modèle du véhicule, ex. Toyota RAV4.',
      needArea: 'Entrez votre ville ou quartier.',       callBtn: '📞 Appeler (613) 601-6471 (en anglais)',
      pTitle: 'Votre prix', pBefore: 'avant taxes',
      pNoTier: 'Entrez la marque et le modèle du véhicule ci-dessus pour voir votre prix.', pSvc: "Changement de pneus d'hiver",
      pRimsQ: "Vos pneus d'hiver sont-ils déjà sur des jantes?", rYes: 'Oui', rNo: 'Non', rUnsure: 'Je ne sais pas',
      rimsYes: 'pneus déjà sur jantes', rimsNo: 'pneus pas sur jantes (montage et équilibrage)', rimsUnsure: 'pas sûr pour les jantes',
      pRimsHint: "Sur jantes = chaque pneu d'hiver est déjà monté sur sa propre roue; on change seulement les roues.",
      pUnsureNote: 'Pas sûr? On a utilisé le prix hors jantes.',
      pNeedRims: "Dites-nous si vos pneus d'hiver sont déjà sur des jantes.",
      pAreaEmpty: 'Ajoutez votre ville ou quartier ci-dessus pour voir votre total.',
      pAreaQ: "On n'a pas pu déterminer les frais de déplacement pour « {A} ». Choisissez le secteur le plus proche :", pAreaPick: 'Choisir…',
      pAreaNone: 'Aucuns frais de déplacement', pAreaFee: '+{F} frais de déplacement', pAreaOther: 'Autre (pas dans la liste)',
      pAreaOtherNote: 'Votre secteur n\'est pas dans la liste : les frais de déplacement éventuels ne sont pas encore inclus. On vous appelle si cela change votre total.',
      pNeedArea: 'Choisissez le secteur le plus proche pour voir votre total.',
      bSwap: 'Changement', bFee: 'frais de déplacement ({A})', bOffer: 'offre unique', bAsap: 'urgence même jour / service rapide', bAfter: 'frais de déplacement en dehors des heures',
      pAfter: '🌙 Visite en dehors des heures ({W}) : {F} de frais de déplacement au lieu des frais du secteur.', pAfterVisitAsap: 'service rapide, maintenant {T}',
      pAsap: '⚡ Service rapide : on envoie le prochain technicien libre, maintenant (urgence même jour / service rapide +{F} incluse).', pSameDay: '⚡ Visite le jour même : urgence même jour / service rapide +{F} incluse.',
      pVisitFirst: "Choisissez « Quand voulez-vous la visite? » plus haut. Le service rapide et les visites le jour même ajoutent les frais d'urgence; de 20 h à 8 h, ce sont les frais de déplacement en dehors des heures.",
      vQ: 'Quand voulez-vous la visite?', vAsapBtn: '⚡ Dès que possible / maintenant', vToday: "Aujourd'hui", vTomorrow: 'Demain', vPick: 'Choisir une date', vChoice: 'Jour de la visite',
      vTime: "Heure de la visite (plage d'une heure)", vPickHour: 'Choisir une heure…', vDate: 'Date de la visite', vHint: "Choisissez la plage d'une heure qui vous convient. Besoin de nous tout de suite? Choisissez ⚡ Dès que possible (24 h/24).",
      vAsap: "⚡ Service rapide : on envoie le prochain technicien libre, maintenant. Pas d'heure à choisir.", vNoneLeft: "Plus de plages libres aujourd'hui. Choisissez « Dès que possible » ou Demain.",
      vNeed: 'Choisissez quand on doit venir : dès que possible, aujourd’hui, demain ou une date.', vNeedDate: 'Choisissez la date de la visite.', vNeedHour: "Choisissez l'heure de la visite.",
      vPast: "Cette heure est déjà passée. Choisissez une heure plus tard.", vChosen: 'Votre visite :',
      pAsapOff: "Le service rapide n'est pas offert en ce moment. Choisissez une heure ou appelez-nous.", rimsAsap: 'même jour / service rapide',
      oLine: '🏷️ Offre unique : {W} −{D}', oLnArea: 'frais de déplacement annulés', oLnAfter: 'frais en dehors des heures annulés', oLnSame: "frais d'urgence même jour annulés", oLnAsap: 'frais de service rapide annulés', oLnFlat: 'rabais', oSvc: 'vos frais de déplacement', oSvcN: 'frais de déplacement', oSvcMy: 'mes frais de déplacement', oUrg: "les frais d'urgence", oUrgN: "frais d'urgence", oUrgMy: "mes frais d'urgence", pPlusTax: 'Taxes en sus. Paiement au technicien à la fin du travail.',
      pAccept: "J'accepte ce total : {P} ({TIER}, {RIMS}).", pAreaOtherShort: 'Frais de déplacement pour votre secteur : pas encore inclus.',
      xoT: 'Réservez maintenant : {D} de rabais', xoS: 'Une seule fois : réservez maintenant et payez {P} au lieu de {F}, avant taxes.',
      xoYes: 'Prendre {D} de rabais', xoNo: 'Non merci',
      xoTFees: 'Réservez maintenant et on annule {X}', xoYesFees: 'Annuler {Y}',
      xo2T: 'Vous hésitez encore? {D} de plus en rabais', xo2S: 'Une dernière fois : réservez maintenant et payez {P} au lieu de {F}, avant taxes.', xo2Yes: 'Prendre {D} de plus',
      pOfferSaved: '🏷️ Votre offre unique en ligne est enregistrée. Elle est déduite de votre total ci-dessous.',
      pTotalT: 'Votre total',
      calT: 'Mobile Tire Repair Ottawa : changement de pneus', calTAsap: 'Mobile Tire Repair Ottawa : changement de pneus (service rapide)', calReq: 'Réservé', calReqAsap: 'Réservé : service rapide, le prochain technicien libre',
      calAddr: 'Adresse', calTotal: 'Total', calNoPrice: 'Prix : paiement au technicien à la fin', calQ: 'Questions? Appelez le', calReqNo: 'Réservation n°',
      calH: '📅 Ajouter à mon calendrier', calWhen: 'Votre visite : {W} (1 heure).', calWhenAsap: 'Votre visite : service rapide, le prochain technicien libre (enregistré pour {W}, 1 heure).',
      calGoogle: 'Google Agenda', calIcs: 'Apple / Outlook (.ics)'
    }
  };
  // Summer mode (SETTINGS.SEASON = 'summer' in the script): only these lines change.
  var TS = {
    en: {
      kicker: '☀ Summer swap booking', title: 'Book your summer tire swap',
      headline: 'Summer tire swaps · mounting & balancing included · we come to you. Your price is shown before you book.',
      onD: 'Your summer tires are already on their own rims. We swap the wheels.', offerTitle: 'Call for a quote'
    },
    fr: {
      kicker: "☀ Réservation pneus d'été", title: "Réservez votre changement de pneus d'été",
      headline: "Changement de pneus d'été · montage et équilibrage inclus · on se déplace chez vous. Votre prix est affiché avant de réserver.",
      onD: "Vos pneus d'été sont déjà sur leurs jantes. On change les roues.",
      quebec: "Au Québec, les pneus d'hiver peuvent être retirés après le 15 mars."
    }
  };
  // Sitewide exit offer (assets/offer.js) sends visitors here with ?offer=<token> (prices.js exitOffer.token) and also saves
  // 'bk_swap_offer' = '1' in this browser. Either one turns the offer on; the form then shows the real amount in the total.
  (function () {
    var tok = (location.search.match(/[?&]offer=([a-z0-9]+)/i) || [])[1], want = window.SWAP_PRICES && window.SWAP_PRICES.exitOffer && window.SWAP_PRICES.exitOffer.token;
    if (tok && want && tok === want && lsGet('bk_swap_offer') !== 'used' && !lsGet('bk_booked')) { lsSet('bk_swap_offer', '1'); lsSet('bk_offer_seen', '1'); }
  })();
  var qsLang = (location.search.match(/[?&]lang=(fr|en)/) || [])[1] || window.BOOKING_LANG;   // French page sets BOOKING_LANG='fr'
  var qsSeason = (location.search.match(/[?&]season=(summer|winter)/) || [])[1];   // preview only (works in TEST MODE)
  var S = {
    lang: qsLang || lsGet('bk_lang') || ((navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en'),
    season: 'winter', week: 0, step: 1, cfg: null, rows: [], session: lsGet('bk_session') || rid(),
    veh: { mode: 'other', year: '', make: '', model: '', trim: '', unsure: false, id: '', cls: 'car', tier: 'STANDARD', size: '', verified: false,
           oYear: '', oMake: '', oModel: '', typed: '', photoUrl: '', car: '', oTrim: '' },
    service: 'off', tires: 4, zone: null, addrText: '', days: [], date: '', dateLabel: '', slot: '', slotLabel: '', hold: 0,
    c: { name: '', phone: '', email: '', notes: '' }, area: '', pref: '', more: false, rims: '', feePick: '', asapAt: '', visitDay: '', visitDate: '', visitTime: '', visitErr: '', addrErr: '', taken: {}, slotState: {}, offerApplied: lsGet('bk_swap_offer') === '1' && !lsGet('bk_booked'), offerTier2: lsGet('bk_swap_offer2') === '1' && lsGet('bk_swap_offer') === '1' && !lsGet('bk_booked'), offer: null, done: null, busy: false, waitDay: null, draftSent: ''
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
    if (v.mode === 'other') return tierFor(typed ? typed.text : '', PR && listHit(PR.pickupModels, tierText()) ? 'pickup' : 'car', v.oMake, v.oModel, v.oTrim);   // a pickup on 22" stays a pickup (not a custom quote)
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
  // ---- vehicle type, set AUTOMATICALLY (owner, Oct 19): no tiles, no run-flat box, the customer can't pick a cheaper type.
  //      Lists + thresholds in prices.js. Highest wins (small < suv < low < pickup); a pickup always stays at the pickup price.
  //      Returns { tier, reason (English, for staff), recognized, lowWhy[], base } or null when no make & model yet.
  function listHit(list, txt) {   // first entry found; an entry is a phrase or [phrase, phrase…] (all needed)
    var w = words(txt);
    for (var i = 0; i < (list || []).length; i++) {
      var e = list[i], ks = Array.isArray(e) ? e : [e];
      if (ks.every(function (k) { return w.indexOf(' ' + k + ' ') >= 0; })) return e;
    }
    return null;
  }
  function nice(e) {   // 'type r' -> 'Type R', 'gr86' -> 'GR86', 'cr-v' -> 'CR-V', ['nissan','z'] -> 'Nissan Z'
    return (Array.isArray(e) ? e.join(' ') : e).split(' ').map(function (w) {
      return w.split('-').map(function (x) { return /\d/.test(x) || x.length <= 3 ? x.toUpperCase() : x.charAt(0).toUpperCase() + x.slice(1); }).join('-');
    }).join(' ');
  }
  function tierText() { return [S.veh.car, S.veh.oTrim].filter(Boolean).join(' '); }
  function rankOf(k) { var i = (PR.order || []).indexOf(k); return i < 0 ? 0 : i; }
  function autoTier() {
    var txt = tierText(), p = parseSize(S.veh.typed), e, base = '', why = '', rec = true, lowWhy = [];
    if (!hasCar()) return null;
    var st = stockFor(txt), pf = perfOf(txt);   // factory tire size + performance list (stock-sizes.js; loads in the background)
    if ((e = listHit(PR.pickupModels, txt))) { base = 'pickup'; why = 'pickup model (' + nice(e) + ')'; }
    else {
      var lm = listHit(PR.lowModels, txt), mk = listHit(PR.lowMakes, txt);
      if (lm) lowWhy.push('performance model/trim (' + nice(lm) + ')'); else if (pf) lowWhy.push('performance model (' + pf + ')'); else if (mk) lowWhy.push('run-flat make (' + nice(mk) + ')');
      if ((e = listHit(PR.suvModels, txt))) { base = 'suv'; why = 'SUV/crossover/minivan model (' + nice(e) + ')'; }
      else if ((e = listHit(PR.smallModels, txt))) { base = 'small'; why = 'car model (' + nice(e) + ')'; }
      else if (lowWhy.length) { base = 'small'; why = ''; }
      else if (st) { base = PR.tiers[PR.unknownTier] ? PR.unknownTier : 'suv'; why = 'in the stock-size table (' + st.model + '), type not listed'; }
      else { base = PR.tiers[PR.unknownTier] ? PR.unknownTier : 'suv'; rec = false; why = 'default: vehicle not recognized'; }
      // the car's factory size runs through the same size rules (never lowers the type)
      if (st && lowSize(parseSize(st.size)).length) lowWhy.push('stock size ' + st.size + ' (' + st.label + ')');
    }
    var tier = base;
    if (p) {   // a tire size can only move the type UP
      var sl = lowSize(p);
      if (base === 'pickup') { if (sl.length) why += '; low-profile size ' + p.text + ' stays at the pickup price'; }
      else {
        if (sl.length) lowWhy.push(sl.join(' / '));
        if (!rec && (p.lt || (p.width >= 255 && p.aspect >= 65 && p.rim >= 17)) && rankOf('pickup') > rankOf(tier)) { tier = 'pickup'; why += '; pickup-size tires (' + p.text + ')'; lowWhy = []; }
      }
    }
    if (tier !== 'pickup' && lowWhy.length && rankOf('low') > rankOf(tier)) tier = 'low';
    var reason = tier === 'low' ? 'low-profile: ' + lowWhy.join(' + ') + (rec ? '' : '; vehicle not recognized') : (tier === 'pickup' ? 'pickup: ' : tier === 'suv' && rec ? 'suv: ' : tier === 'small' ? 'small: ' : '') + why;
    return { tier: tier, reason: reason, recognized: rec, lowWhy: lowWhy, base: base, why: rec ? 'car' : 'default', stock: st, perf: pf };
  }
  function lowSize(p) {   // ['35 series', '20in'] when a size counts as low-profile (prices.js thresholds), else []
    var sl = []; if (!p) return sl;
    if (p.aspect <= (+PR.lowProfileMaxAspect || 40)) sl.push(p.aspect + ' series');
    if (p.rim >= (+PR.lowProfileMinRim || 19)) sl.push(p.rim + 'in');
    return sl;
  }
  // ---- factory (OEM) tire size + performance names: /book-tire-swap/stock-sizes.js (window.STOCK_SIZES). Optional: if that file
  //      is missing or still loading, the lists in prices.js decide alone. Staff see "Assumed stock size 245/30R20 (Honda Civic Type R)".
  function stockFor(txt) {
    var SS = window.STOCK_SIZES, r = null;
    try { r = SS && SS.lookup ? SS.lookup(txt) : null; } catch (e) { r = null; }
    if (!r || !parseSize(r.size)) return null;
    r.label = r.model + (r.trim ? ' ' + nice(r.trim) : r.how === 'largest' ? ', performance model' : ', base trim');
    return r;
  }
  function perfOf(txt) { var SS = window.STOCK_SIZES; try { return SS && SS.perf ? SS.perf(txt) : ''; } catch (e) { return ''; } }
  function stockNote(a, typed) {
    if (!a || !a.stock) return '';
    return (typed ? 'Stock size for ' + a.stock.label + ': ' + a.stock.size + ' (customer typed ' + typed.text + ')' : 'Assumed stock size ' + a.stock.size + ' (' + a.stock.label + ')');
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
  // ---- ASAP (+fee, prices.js). "ASAP / Now" is one of the choices under "When should we come?" (the only place ASAP lives).
  //      hours null = always (24/7); otherwise checked in Ottawa time. Fee 0 (or prices.js missing) = ASAP still offered, no urgency fee.
  function asapCfg() { return (PR && PR.asap && +PR.asap.fee > 0) ? PR.asap : null; }
  function torontoHHMM(d) {
    try { var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d);
          var h = '', m = ''; p.forEach(function (x) { if (x.type === 'hour') h = x.value; if (x.type === 'minute') m = x.value; }); return (h === '24' ? '00' : h) + ':' + m; }
    catch (e) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
  }
  function asapOpen() {
    var h = PR && PR.asap && PR.asap.hours; if (!h || !h.start || !h.end) return true;
    var now = torontoHHMM(new Date());
    return h.start <= h.end ? (now >= h.start && now < h.end) : (now >= h.start || now < h.end);
  }
  function asapOn() { return S.visitDay === 'asap' && asapOpen(); }
  // ---- visit day/time the customer picks ("When should we come?", REQUIRED). Day resolved in Ottawa time at form time.
  //      ASAP / Now: no hour. Today / Tomorrow / a date: a one-hour visit slot is required (prices.js slots: 10:30 AM ... 10:30 PM; ASAP is 24/7).
  function torToday() { return torParts(Date.now()).day; }
  function visitDateIso() { var d = torToday(); return S.visitDay === 'today' ? d : S.visitDay === 'tomorrow' ? wall(d, 0, 0, 1440).day : S.visitDay === 'date' ? S.visitDate : ''; }
  function hm2min(hm) { return +hm.slice(0, 2) * 60 + +hm.slice(3, 5); }
  function min2hm(m) { m = ((m % 1440) + 1440) % 1440; return pad2(Math.floor(m / 60)) + ':' + pad2(m % 60); }
  function hoursFor(day) {   // 1-hour slot starts ('HH:MM') still bookable that day: prices.js slots (10:30 AM ... 10:30 PM);
    var c = (PR && PR.slots) || {}, first = hm2min(c.first || '10:30'), last = hm2min(c.last || '22:30'), step = +c.minutes || 60;
    var out = [], now = -1;                     // today = only slots that have not started yet (Ottawa time)
    if (day && day === torToday()) { var tp = torParts(Date.now()); now = tp.hh * 60 + tp.mm; }
    for (var m = first; m <= last; m += step) if (m > now) out.push(min2hm(m));
    return out;
  }
  function isTaken(day, hm) { return (S.taken[day] || []).indexOf(hm) >= 0; }
  function visitDone() { var vd = visitDateIso(); return asapOn() || (!!S.visitTime && !!vd && hoursFor(vd).indexOf(S.visitTime) >= 0 && !isTaken(vd, S.visitTime)); }
  // ---- no double-booking: busy hours for a date from the script (?action=slots&date=YYYY-MM-DD -> { ok, busy: ['14:00', …] }).
  //      Max 1 job per hour. If the check fails or is slow, every hour stays open and the booking is flagged
  //      "slot check unavailable" for staff (the script re-checks the hour before saving anyway). Bookings are never lost.
  function loadSlots(day, force) {
    if (!day || (!force && S.slotState[day])) return;
    S.slotState[day] = 'loading';
    var url = API && API.indexOf('PASTE') < 0 ? API + '?action=slots&date=' + encodeURIComponent(day) : '';
    (url ? callApi(url, { method: 'GET' }, 0, 4000, false) : Promise.reject(new Error('no_api'))).then(function (r) {
      if (r && r.ok && Array.isArray(r.busy)) {
        S.taken[day] = uniq((S.taken[day] || []).concat(r.busy.filter(function (h) { return /^\d{2}:\d{2}$/.test(h); })));
        S.slotState[day] = 'ok';
      } else S.slotState[day] = 'down';
    }).catch(function () { S.slotState[day] = 'down'; }).then(function () {
      if (visitDateIso() === day && S.visitTime && isTaken(day, S.visitTime)) { S.visitTime = ''; S.visitErr = t('vTakenSel'); }
      if (!S.done && visitDateIso() === day) renderKeepFocus();
    });
  }
  function slotCheckState() { if (asapOn()) return 'asap'; var st = S.slotState[visitDateIso()]; return st === 'ok' ? 'ok' : 'unavailable'; }
  function renderKeepFocus() {
    var a = document.activeElement, id = a && a.id; readAll(); render();
    if (id) { var el = document.getElementById(id); if (el) el.focus(); }
  }
  function urgencyOf(asap) { var a = asapCfg(); if (!a) return ''; if (asap) return 'asap'; return a.sameDay !== false && visitDateIso() && visitDateIso() === torToday() ? 'same-day' : ''; }
  // ---- after-hours service call (prices.js afterHours). Replaces the area fee; based on the visit time:
  //      ASAP = the current Ottawa time; otherwise the start of the visit hour they pick; none picked yet = not after hours.
  function inWindow(hhmm, st, en) { return st <= en ? (hhmm >= st && hhmm < en) : (hhmm >= st || hhmm < en); }
  function visitInfo(asap) {
    if (asap) { var n = torontoHHMM(new Date()); return { hhmm: n, label: 'ASAP, booked ' + n + ' ET', src: 'asap-booking-time', shown: t('pAfterVisitAsap').replace('{T}', n) }; }
    var vd = visitDateIso();
    if (S.visitTime && vd) return { hhmm: S.visitTime, label: 'visit ' + vd + ' ' + S.visitTime, src: 'visit-time', shown: dateWords(vd, S.lang) + ' ' + hourWord(S.visitTime) };
    return { hhmm: '', label: '', src: 'none', shown: '' };
  }
  function afterHoursOf(v) { var a = PR && PR.afterHours; return !!(a && +a.fee > 0 && v.hhmm && inWindow(v.hhmm, a.start, a.end)); }
  function rimsKey() { return S.rims === 'yes' ? 'on' : 'off'; }   // "Not sure" = off-rims price
  function priceInfo() {
    if (!hasPrices() || S.forceExotic) return null;
    if (isExoticSafe()) return { exotic: true };
    var a = autoTier(), tier = a && a.tier;
    if (!tier || !PR.tiers[tier]) return { none: true };
    var x = PR.tiers[tier], rk = rimsKey(), swap = +x[rk];
    if (!(swap > 0)) return { none: true };
    var dd = x.discount, dmax = Math.max(0, +(dd && typeof dd === 'object' ? dd[rk] : dd) || 0);
    var q = { tier: tier, auto: a, rims: S.rims, rk: rk, swap: swap, low: tier === 'low', offerable: dmax > 0, dmax: dmax };
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
    var o = offerCalc(q); q.offerType = o.type; q.offerAmt = o.d; q.offerFull = o.full; q.offerable = o.d > 0; q.offer2Amt = o.d2;
    q.offerTier = S.offerApplied ? (S.offerTier2 && second() ? 2 : 1) : 0;
    q.disc = q.offerTier === 2 ? o.d2 : q.offerTier === 1 ? o.d : 0;   // the exit offer comes off the total (prices.js exitOffer)
    q.amount = q.full - q.disc;   // total shown right above Send
    q.ready = true;
    return q;
  }
  // Exit offer (owner, Oct 20: NO floor, the offer ALWAYS takes something off; one item only, never two):
  //   1) service call (area fee or after-hours fee): waived in full    -> "we'll waive your service call"
  //   2) else same-day / ASAP urgency fee:             waived in full    -> "we'll waive the rush fee"
  //   3) else flat: $15 off rims / "Not sure", $10 on rims (prices.js tiers[..].discount).
  function offerCalc1(q) {
    var svc = q.fee || 0, urg = q.asapFee || 0, d;
    if (svc > 0) return { type: 'waive-service-call', d: svc, full: true };
    if (urg > 0) return { type: 'waive-urgency', d: urg, full: true };
    d = Math.min(q.dmax, q.swap); return d > 0 ? { type: 'flat', d: d, full: false } : { type: '', d: 0, full: false };
  }
  // Second tier ("discount on discount"), OFF unless prices.js exitOffer.second.enabled is true: shown once more to a visitor
  // who already took the first offer and is leaving again; `extra` dollars on top (never more than the whole total).
  function second() { var s2 = PR.exitOffer && PR.exitOffer.second; return s2 && s2.enabled ? s2 : null; }
  function offerCalc(q) {
    var o = offerCalc1(q), s2 = second(); o.d2 = o.d;
    if (s2 && o.d > 0) { var ex = +((s2.extra || {})[q.rims === 'yes' ? 'on' : 'off'] || 0); o.d2 = Math.max(o.d, Math.min(o.d + ex, q.full)); }
    return o;
  }
  function offerWords(q, lang) { var L = T[lang || S.lang] || T.en, k = q.offerType === 'waive-urgency' ? 'Urg' : 'Svc'; return { x: L['o' + k], n: L['o' + k + 'N'], my: L['o' + k + 'My'] }; }
  function offerKey(q) { return q.offerType === 'waive-service-call' || q.offerType === 'waive-urgency' ? 'Fees' : ''; }
  // The offer as its own line under the total: "One-time offer: same-day fee waived −$45" / "Offre unique : … −45 $"
  function offerLine(q, lang) {
    var L = T[lang] || T.en, k = q.offerType === 'waive-service-call' ? (q.after ? 'After' : 'Area') : q.offerType === 'waive-urgency' ? (q.urg === 'asap' ? 'Asap' : 'Same') : 'Flat';
    return L.oLine.replace('{W}', L['oLn' + k]).replace(' −{D}', '\u00a0−' + money(q.disc, lang).replace(' ', '\u00a0'));   // the amount never wraps away from its words
  }
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
      (q.disc ? ' − ' + money(q.disc, 'en') + ' exit offer (' + (q.offerType === 'flat' ? 'flat' : (q.offerFull ? offerWords(q, 'en').n + ' waived' : 'off the ' + offerWords(q, 'en').n)) + (q.offerTier === 2 ? ' + 2nd offer' : '') + '); regular ' + money(q.full, 'en') : '') + ')';
  }
  function tierSource(q) { return q.auto ? 'auto (' + q.auto.reason + ')' : ''; }
  function svcToggles() {   // on/off rims is asked in the price box; only the number of tires stays here
    return '<label class="bk-label">' + t('howMany') + '</label>' +
      '<div class="bk-toggle"><button type="button" data-act="tires" data-v="4" class="' + (S.tires === 4 ? 'sel' : '') + '">' + t('t4') + '</button>' +
      '<button type="button" data-act="tires" data-v="2" class="' + (S.tires === 2 ? 'sel' : '') + '">' + t('t2') + '</button></div>';
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
    var h = '<div class="bk-price" id="bk-price"' + (q.none ? '' : ' data-tier="' + q.tier + '"') + '><div class="bk-price-h">💲 ' + t('pTitle') + '</div>' +
      // the vehicle type is worked out automatically (autoTier) and only goes to staff (payload tier + tierReason);
      // the customer just sees the total
      (q.none ? '<p class="bk-tier-note" id="bk-tier-note">' + esc(t('pNoTier')) + '</p>' : '') +
      '<div class="bk-label" id="bk-rims-l">' + t('pRimsQ') + ' <span class="bk-req">*</span></div>' +
      '<div class="bk-ct-grid three bk-rims" role="group" aria-labelledby="bk-rims-l">' +
        [['yes', 'rYes'], ['no', 'rNo'], ['unsure', 'rUnsure']].map(function (r) {
          return '<button type="button" class="bk-ct' + (S.rims === r[0] ? ' sel' : '') + '" id="bk-rims-' + r[0] + '" data-act="rims" data-v="' + r[0] + '" aria-pressed="' + (S.rims === r[0]) + '">' + t(r[1]) + '</button>';
        }).join('') + '</div>' +
      '<p class="bk-tier-note">' + t('pRimsHint') + '</p>';
    if (q.none || q.needRims) return h + '</div>';
    if (q.needArea) return h + (q.area.empty ? '<p class="bk-price-note bk-area-need">📍 ' + t('pAreaEmpty') + '</p>' : areaSelect(q)) + '</div>';
    var shown = priceText(q, S.lang);
    return h + (q.area.picked || q.area.other ? areaSelect({ area: { typed: S.area || S.addrText } }) : '') +
      (!visitDone() ? '<p class="bk-price-note bk-visit-first" id="bk-visit-first">🚐 ' + esc(t('pVisitFirst')) + '</p>' : '') +
      (q.urg === 'asap' ? '<p class="bk-price-note bk-sameday bk-asap-note" id="bk-asap-note">' + esc(t('pAsap').replace('{F}', money(q.asapFee))) + '</p>' : '') +
      (q.urg === 'same-day' ? '<p class="bk-price-note bk-sameday" id="bk-sameday">' + esc(t('pSameDay').replace('{F}', money(q.asapFee))) + '</p>' : '') +
      (q.after ? '<p class="bk-price-note bk-after" id="bk-after">' + esc(t('pAfter').replace('{W}', q.visit.shown).replace('{F}', money(q.fee))) + '</p>' : '') +
      (q.rims === 'unsure' ? '<p class="bk-price-note">' + t('pUnsureNote') + '</p>' : '') +
      (q.fee === null ? '<p class="bk-price-note">' + t('pAreaOtherNote') + '</p>' : '') +
      '<div class="bk-total" id="bk-total"><div class="bk-total-l">' + t('pTotalT') + '</div>' +
        '<div class="bk-price-amt" id="bk-price-amt" aria-live="polite">' + esc(shown) + '</div>' +
        (q.fee || q.disc || q.asapFee ? '<div class="bk-price-break" id="bk-price-break">' + esc(breakdown(q, S.lang)) + '</div>' : '') +
        (q.disc ? '<div class="bk-offer-on" id="bk-offer-on">' + esc(offerLine(q, S.lang)) + '</div>' : '') +
        '<div class="bk-price-svc">' + t('pSvc') + ' · ' + esc(rimsWord(q, S.lang)) + '</div>' +
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
    if (a === 'rims' || a === 'feearea') { var el = w.querySelector('[data-act="' + a + '"]' + (av ? '[data-v="' + av + '"]' : '')); if (el) el.focus(); }
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
  // Make & model required: two words ("Toyota RAV4"), or one word we know ("F-150", "Supra").
  function hasCar() { var c = String(S.veh.car || '').trim(); if (!c) return false; if (c.split(/\s+/).length >= 2) return true;
    return !!(PR && (listHit(PR.pickupModels, c) || listHit(PR.suvModels, c) || listHit(PR.smallModels, c) || listHit(PR.lowModels, c) || perfOf(c))); }
  function hasSize() { return !!parseSize(S.veh.typed); }
  function step1Basics() { return hasCar(); }   // enough to send the "almost booked" alert (with a phone)
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
  function step1() {
    var v = S.veh, r = ' <span class="bk-req">*</span>';
    var h = '<div class="bk-card"><h2 class="bk-title" style="font-size:22px">' + t('fTitle') + '</h2>' +
      (S.offerApplied ? '<p class="bk-offer-saved" id="bk-offer-saved">' + esc(t('pOfferSaved')) + '</p>' : '') +
      inp('bk-name', 'name', t('name') + r, S.c.name, ' autocomplete="name"') +
      inp('bk-phone', 'phone', t('phone') + r, S.c.phone, ' type="tel" inputmode="tel" autocomplete="tel"') +
      inp('bk-email', 'email', t('email'), S.c.email, ' type="email" autocomplete="email" inputmode="email"') +
      inp('bk-car', 'car', t('carMM') + r, v.car, ' placeholder="' + t('carPh') + '" autocomplete="off" required') +
      inp('bk-size', 'typed', t('sizeOnly'), v.typed, ' placeholder="' + t('sizePh') + '" autocomplete="off" aria-describedby="bk-size-hint"') +
      '<div class="bk-err" id="bk-size-err">' + (v.typed && !parseSize(v.typed) ? t('sizeBad') : '') + '</div>' +
      '<p class="bk-hint" id="bk-size-hint">💡 ' + t('sizeHint') + '</p>' +
      inp('bk-addr', 'addr', t('street') + r, S.addrText, ' autocomplete="address-line1" placeholder="' + t('streetPh') + '" required aria-describedby="bk-addr-err"' + (S.addrErr ? ' aria-invalid="true"' : '')) +
      '<div class="bk-err" id="bk-addr-err" role="alert">' + esc(S.addrErr || '') + '</div>' +
      inp('bk-area', 'area', t('area') + r, S.area, ' list="bk-areas" placeholder="' + t('areaPh') + '" autocomplete="address-level2" required') +
      visitHtml() +
      '<datalist id="bk-areas">' + AREAS.map(function (x) { return '<option value="' + x + '">'; }).join('') + '</datalist>' + zoneHtml() +
      '<details class="bk-more"' + (S.more ? ' open' : '') + '><summary>' + t('more') + '</summary>' +
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
      '<p class="bk-note">' + t('pay') + '</p></div>';
    return h;
  }
  function vehicleLabel() {
    var v = S.veh; return [v.oYear, v.car, v.oTrim].filter(Boolean).join(' ');
  }
  function sizeLabel() {
    var p = parseSize(S.veh.typed);
    return p ? p.text + ' (' + t('sizeCust') + ')' : t('sizeUnk');
  }
  // ---------------------------------------------------------------- "When should we come?" (REQUIRED)
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function isoDay(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function ymd(ds) { var p = ds.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function dateWords(iso, lang) {   // '2026-10-15' -> 'Thu Oct 15' (EN) / 'jeu. 15 oct.' (FR)
    var d = ymd(iso); return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { weekday: 'short', month: 'short', day: 'numeric' }).replace(/,/g, '');
  }
  function ctBtn(act, v, label, on, dis) {
    return '<button type="button" class="bk-ct' + (on ? ' sel' : '') + '" id="bk-' + act + '-' + v + '" data-act="' + act + '" data-v="' + v + '" aria-pressed="' + (on ? 'true' : 'false') + '"' + (dis ? ' aria-disabled="true"' : '') + '>' + esc(label) + '</button>';
  }
  function hourWord(hm, lang) { var h = +hm.slice(0, 2), m = hm.slice(3, 5); return (lang || S.lang) === 'fr' ? h + ' h' + (m !== '00' ? ' ' + m : '') : ((h % 12) || 12) + ':' + m + ' ' + (h < 12 ? 'AM' : 'PM'); }
  function slotWord(hm, lang) { var e = min2hm(hm2min(hm) + ((PR && PR.slots && +PR.slots.minutes) || 60)); return hourWord(hm, lang) + ' – ' + hourWord(e, lang); }   // "8:30 PM – 9:30 PM" / "20 h 30 – 21 h 30"
  // The visit the customer asked for, as text. lang 'en' = for staff (alert emails read the same for EN and FR customers).
  function visitWhen(lang) {
    var L = T[lang || S.lang] || T.en;
    if (asapOn()) return lang === 'en' ? 'ASAP / Now' : L.vAsapBtn.replace('⚡ ', '');
    var vd = visitDateIso(); if (!vd || !S.visitTime) return '';
    var day = S.visitDay === 'today' ? L.vToday + ' ' : S.visitDay === 'tomorrow' ? L.vTomorrow + ' ' : '';
    return day + dateWords(vd, lang || S.lang) + ', ' + slotWord(S.visitTime, lang || S.lang);
  }
  function visitHtml() {
    var d = S.visitDay, ao = asapOpen(), vd = visitDateIso(), hrs = hoursFor(vd), err = S.visitErr || '', shown = visitWhen(S.lang), r = ' <span class="bk-req">*</span>';
    var body = '';
    if (d === 'asap' && ao) body = '<p class="bk-note bk-visit-asap" id="bk-visit-asap">' + esc(t('vAsap')) + '</p>';
    else if (d === 'today' || d === 'tomorrow' || d === 'date') {
      if (d === 'date') body += '<label class="bk-label" for="bk-visit-date">' + t('vDate') + r + '</label><input class="bk-input" type="date" id="bk-visit-date" data-f="visitDate" min="' + torToday() + '" value="' + esc(S.visitDate) + '" required>';
      if (d === 'date' && !S.visitDate) {}
      else if (!hrs.length) body += '<p class="bk-note bk-visit-none" id="bk-visit-none">' + esc(t('vNoneLeft')) + '</p>';
      else {
        if (!S.slotState[vd]) setTimeout(function () { loadSlots(vd); }, 0);
        body += '<label class="bk-label" for="bk-visit-time">' + t('vTime') + r + '</label><select class="bk-select" id="bk-visit-time" data-f="visitTime" required' + (err && !S.visitTime ? ' aria-invalid="true"' : '') + ' aria-describedby="bk-visit-err">' +
          opt('', t('vPickHour'), !S.visitTime) + hrs.map(function (v) {
            return isTaken(vd, v) ? '<option value="' + v + '" disabled class="bk-busy">' + esc(slotWord(v) + ' (' + t('vBusy') + ')') + '</option>' : opt(v, slotWord(v), S.visitTime === v);
          }).join('') + '</select>' +
          (S.slotState[vd] === 'loading' ? '<p class="bk-hint bk-visit-checking" id="bk-visit-checking">' + esc(t('vChecking')) + '</p>' : '') +
          '<p class="bk-hint bk-visit-hint">' + esc(t('vHint')) + '</p>';
      }
    }
    return '<fieldset class="bk-calltime bk-visit' + (err ? ' bk-invalid' : '') + '" id="bk-visit"><legend class="bk-ct-q">🚐 ' + t('vQ') + r + '</legend>' +
      '<div class="bk-ct-grid' + (ao ? ' bk-visit-grid' : ' three') + '" role="group" aria-label="' + esc(t('vChoice')) + '">' +
        (ao ? ctBtn('vday', 'asap', t('vAsapBtn'), d === 'asap') : '') +
        ctBtn('vday', 'today', t('vToday'), d === 'today') + ctBtn('vday', 'tomorrow', t('vTomorrow'), d === 'tomorrow') + ctBtn('vday', 'date', t('vPick'), d === 'date') + '</div>' +
      (!ao ? '<p class="bk-note bk-asap-off" id="bk-asap-off">' + esc(t('pAsapOff')) + ' <a href="' + TEL + '">' + esc(t('callBtn')) + '</a></p>' : '') +
      body +
      '<div class="bk-err bk-visit-err" id="bk-visit-err" role="alert">' + esc(err) + '</div>' +
      '<p class="bk-ct-chosen" id="bk-visit-chosen" aria-live="polite"' + (shown && visitDone() ? '' : ' hidden') + '>' + t('vChosen') + ' <b>' + esc(shown) + '</b></p>' +
      '</fieldset>';
  }
  function refreshVisitBits() {   // after an hour is picked: update the chosen line + clear the error without re-rendering the select
    var shown = visitWhen(S.lang), ch = document.getElementById('bk-visit-chosen');
    if (ch) { ch.hidden = !(shown && visitDone()); ch.innerHTML = t('vChosen') + ' <b>' + esc(shown) + '</b>'; }
    if (S.visitErr && visitDone()) {
      S.visitErr = ''; if (S.bookErrVisit) { S.bookErr = ''; S.bookErrVisit = false; var be = document.getElementById('bk-book-err'); if (be) be.textContent = ''; }
      var ve = document.getElementById('bk-visit-err'); if (ve) ve.textContent = '';
      var fs = document.getElementById('bk-visit'); if (fs) fs.classList.remove('bk-invalid');
      var sel = document.getElementById('bk-visit-time'); if (sel) sel.removeAttribute('aria-invalid');
    }
  }
  function visitError() {   // -> { msg, el } or null
    var d = S.visitDay, first = asapOpen() ? 'bk-vday-asap' : 'bk-vday-today';
    if (d === 'asap') return asapOpen() ? null : { msg: t('vNeed'), el: 'bk-vday-today' };
    if (d !== 'today' && d !== 'tomorrow' && d !== 'date') return { msg: t('vNeed'), el: first };
    if (d === 'date' && (!S.visitDate || S.visitDate < torToday())) { S.visitDate = ''; return { msg: t('vNeedDate'), el: 'bk-visit-date' }; }
    var hrs = hoursFor(visitDateIso());
    if (!hrs.length) { S.visitTime = ''; return { msg: t('vNoneLeft'), el: 'bk-vday-tomorrow' }; }
    if (!S.visitTime) return { msg: t('vNeedHour'), el: 'bk-visit-time' };
    if (hrs.indexOf(S.visitTime) < 0) { S.visitTime = ''; return { msg: t('vPast'), el: 'bk-visit-time' }; }
    if (isTaken(visitDateIso(), S.visitTime)) { S.visitTime = ''; return { msg: t('vTakenSel'), el: 'bk-visit-time' }; }
    return null;
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
    var x = S.doneInfo || {}, row = function (k, v) { return v ? '<div><span>' + t(k) + '</span><span>' + esc(v) + '</span></div>' : ''; };
    return '<div class="bk-card bk-done"><h2 class="bk-title" id="bk-done-h">' + t('doneR') + '</h2>' +
      '<div class="bk-sum" id="bk-done-sum" style="text-align:left">' + row('dWhen', x.when) + row('dAddr', x.addr) + row('dVeh', x.veh) + row('dTotal', x.total) +
        row('bookingNo', d.bookingNo) + '</div>' +
      calHtml(d) +
      '<p class="bk-note" id="bk-done-note">' + t('doneRsub') + '</p>' +
      (d.emailed ? '<p class="bk-note">' + t('emailSent') + '</p>' : '') +
      (d.testMode ? '<p class="bk-note" style="color:#ffd27a">' + t('testDone') + '</p>' : '') + '</div>';
  }

  // ---- "Add to my calendar" (customer). Ottawa wall-clock times with TZID America/Toronto.
  //   ASAP / Now: from the moment they send, 1 hour, title "(ASAP)".  Today / Tomorrow / a date: the visit hour they
  //   picked, 1 hour.  Business name + public phone only (never the owner's name or email).
  var PHONE_SHOWN = '(613) 601-6471';
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
    var tp = torParts(now), start, asap = asapOn(), vd = visitDateIso();
    if (asap) start = wall(tp.day, tp.hh, 0, Math.ceil(tp.mm / 15) * 15);   // ASAP: now, rounded up to the next 15 minutes (same as the staff calendar event)
    else if (S.visitTime && vd) start = { day: vd, hh: +S.visitTime.slice(0, 2), mm: +S.visitTime.slice(3, 5) };
    else start = wall(tp.day, tp.hh, 0, 60);   // not reachable (a visit choice is required); next full hour
    var end = wall(start.day, start.hh, start.mm, 60), L = T[S.lang] || T.en;
    var total = q ? (q.fee || q.disc || q.asapFee ? breakdown(q, S.lang) : priceText(q, S.lang)) + ' (' + rimsWord(q, S.lang) + ')' : L.calNoPrice;
    if (q && q.fee === null) total += ' · ' + L.pAreaOtherShort;
    return { asap: asap, start: start, end: end, title: asap ? L.calTAsap : L.calT, address: areaLabel() || S.area || S.addrText || '',
             desc: [asap ? L.calReqAsap : L.calReq + ': ' + visitWhen(S.lang), L.calAddr + ': ' + (areaLabel() || S.area || S.addrText || '—'), L.calTotal + ': ' + (q ? total : L.calNoPrice), L.calQ + ' ' + PHONE_SHOWN + '. Mobile Tire Repair Ottawa'] };
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
      'STATUS:CONFIRMED', 'TRANSP:OPAQUE', 'END:VEVENT', 'END:VCALENDAR'].map(icsFold).join('\r\n') + '\r\n';
  }
  function calHtml(d) {
    var c = S.cal; if (!c) return '';
    return '<div class="bk-cal" id="bk-cal"><h3 class="bk-cal-h">' + t('calH') + '</h3>' +
      '<p class="bk-note">' + esc(t(c.asap ? 'calWhenAsap' : 'calWhen').replace('{W}', calWhenText(c))) + '</p>' +
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
    if (f === 'car') { v.car = val; syncCar(); S.exoticDone = false; }
    else if (f === 'typed' || f === 'oYear' || f === 'oTrim') { v[f] = val; if (f !== 'oYear') S.exoticDone = false; }
    else if (f === 'area') { if (S.area !== val) S.feePick = ''; S.area = val; S.zone = null; }
    else if (f === 'addr') { if (S.addrText !== val && !S.area) S.feePick = ''; S.addrText = val; S.zone = null;
      if (S.addrErr && streetOk(val)) { S.addrErr = ''; var ae = document.getElementById('bk-addr-err'); if (ae) ae.textContent = ''; el.removeAttribute('aria-invalid'); } }
    else if (f === 'pref') S.pref = val;
    else if (f === 'visitTime') S.visitTime = val;
    else if (f === 'visitDate') { S.visitDate = val && val >= torToday() ? val : ''; if (val && !S.visitDate) el.value = '';
      if (S.visitTime && hoursFor(S.visitDate).indexOf(S.visitTime) < 0) S.visitTime = ''; }   // e.g. date changed to today: an hour already past is dropped
    else if (f === 'name' || f === 'phone' || f === 'email' || f === 'notes') S.c[f] = val;
    return f;
  }
  function onEdit(e) {
    if (e.target && e.target.getAttribute && e.target.getAttribute('data-act') === 'feearea') { if (e.type !== 'change') return; S.feePick = e.target.value; refreshPrice(); return draftSoon(); }
    var f = readField(e.target); if (!f) return;
    if (f === 'car' || f === 'typed' || f === 'oYear' || f === 'oTrim') { refreshStep1(); markStarted(); }
    if (f === 'area' || f === 'addr') { var z = root.querySelector('.bk-zone'); if (z) z.remove(); refreshPrice(); }
    if (f === 'visitDate' && e.type === 'change') { S.visitErr = ''; render(); var vt = document.getElementById('bk-visit-time') || document.getElementById('bk-visit-date'); if (vt) vt.focus(); return draftSoon(); }
    if (f === 'visitTime') refreshVisitBits();
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
    if (act === 'vday') {   // required choice: tapping the selected one again keeps it
      readAll(); S.visitDay = val; S.asapAt = val === 'asap' ? new Date().toISOString() : '';
      if (val !== 'date') S.visitDate = '';
      if (val === 'asap' || (S.visitTime && hoursFor(visitDateIso()).indexOf(S.visitTime) < 0)) S.visitTime = '';
      S.visitErr = ''; if (S.bookErrVisit) { S.bookErr = ''; S.bookErrVisit = false; }
      render(); focusAct(act, val); return draftSoon();
    }
    if (act === 'rims') { readAll(); S.rims = val; S.service = val === 'yes' ? 'on' : 'off'; refreshStep1(); return draftSoon(); }
    if (act === 'book') return book();
  });

  // Checks the required fields. Returns an error message, or '' when OK.
  function formError() {
    readAll();
    if (!S.c.name) return { msg: t('nameBad'), el: 'bk-name' };
    if (!cleanPhone(S.c.phone)) return { msg: t('phoneBad'), el: 'bk-phone' };
    if (!hasCar()) return { msg: t(S.veh.car ? 'needModel' : 'needCar'), el: 'bk-car' };   // make & model required; tire size optional
    if (!streetOk(S.addrText)) return { msg: t('addrBad'), el: 'bk-addr', addr: true };   // full street address required
    if (!S.area) return { msg: t('needArea'), el: 'bk-area' };
    var ve = visitError(); if (ve) { ve.visit = true; return ve; }   // "When should we come?" is required
    var q = priceInfo();
    if (q && q.needRims) return { msg: t('pNeedRims'), el: 'bk-rims-yes' };
    if (q && q.needArea) return { msg: t('pNeedArea'), el: 'bk-feearea' };
    if (!q || !q.ready) return { msg: t('noTotal'), el: 'bk-book-err' };   // instant booking needs the total shown above Book
    return null;
  }
  // Full street address: a house number followed by a street name ("123 Greenbank Rd", "12-345 Main St", "Apt 4, 55 Rue Laurier").
  function streetOk(x) { return /(^|[\s,#])\d+[a-z]?(-\d+[a-z]?)?\s+[a-zà-ÿ'’.-]{2,}/i.test(String(x || '')); }
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
             address: areaLabel(), zone: S.zone && !S.zone.error ? S.zone.zone : '', area: S.area, visitWhen: visitWhen('en'), visitDate: asapOn() ? torToday() : visitDateIso(), visitHour: asapOn() ? '' : S.visitTime, lang: S.lang, price: shownPriceForOwner(), ref: S.ref, onRims: S.rims, asap: asapOn(), serviceArea: (function () { var q = priceInfo(); return q && q.ready ? (q.areaName || 'Other') : ''; })() };
  }
  function shownPriceForOwner() { var q = priceInfo(); return q && q.ready ? priceForOwner(q) : 'Call for a quote'; }
  function sendDraft() {
    if (S.done) return;
    readAll();
    var phone = cleanPhone(S.c.phone); if (!phone || !S.cfg || !step1Basics()) return;   // fires once phone + (car or size) are in
    var payload = { action: 'draft', session: S.session, firstName: (S.c.name || '').split(' ')[0], phone: phone, vehicle: vehicleLabel(),
                    slot: visitWhen('en'), price: shownPriceForOwner(), details: draftDetails() };   // slot = the visit asked for (shows as "Slot picked" in the alert)
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
    if (fe && fe.el !== 'bk-area' && !fe.visit && !fe.addr && fe.el !== 'bk-book-err') { err.textContent = fe.msg; var x = document.getElementById(fe.el); if (x) x.focus(); return; }
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
    if (fe) { S.bookErr = fe.msg; S.bookErrVisit = !!fe.visit; S.visitErr = fe.visit ? fe.msg : ''; S.addrErr = fe.addr ? fe.msg : ''; render(); var x = document.getElementById(fe.el); if (x) { x.focus(); if (fe.visit && x.scrollIntoView) x.scrollIntoView({ block: 'center' }); } return; }
    if (isExoticSafe()) return;   // custom-quote box is showing instead
    var hp = document.getElementById('bk-hp'), hpv = hp ? hp.value : '';
    S.busy = true; S.bookErr = ''; S.visitErr = ''; S.addrErr = ''; S.bookErrVisit = false; render();
    checkZone().then(function (z) {
      if (z && !z.error && z.zone === 0) { S.busy = false; return render(); }   // outside our area: show the Call box
      sendDraft();
      var v = S.veh, typed = parseSize(v.typed);
      var vw = visitWhen('en'), vasap = asapOn(), vi = visitInfo(vasap);
      var notes = [S.c.notes, vw ? 'Visit booked: ' + vw : ''].filter(Boolean).join(' · ');
      var payload = {
        action: 'lead', session: S.session, lang: S.lang, hp: hpv,
        vehicleId: '', year: v.oYear, make: v.oMake, model: v.oModel, trim: v.oTrim, trimUnsure: !v.oTrim, vehicleClass: (priceInfo() || {}).tier === 'pickup' ? 'pickup' : 'car',
        sizeTyped: typed ? typed.text : '', photoUrl: v.photoUrl, service: S.service, tires: S.tires,
        address: (S.addrText || S.area).length < 6 ? (S.addrText || S.area) + ', Ottawa-Gatineau' : (S.addrText || S.area), addressFormatted: areaLabel(),
        name: S.c.name, phone: S.c.phone, email: S.c.email, notes: notes, offerId: '', expectedSubtotal: null, ref: S.ref, multiCar: !!S.multiCar,
        // new, informational fields (the script can ignore them):
        area: S.area, streetAddress: S.addrText, preferredTime: '', vehicleText: v.car, zone: z && !z.error ? z.zone : '', price: 'Call for a quote',
        // "When should we come?" (required): always sent, with or without a price
        visitChoice: S.visitDay, visitWhen: vw, visitDate: vasap ? torToday() : visitDateIso(), visitHour: vasap ? '' : S.visitTime,
        visitTime: vi.label, visitTimeSource: vi.src, slotCheck: slotCheckState(), asap: vasap, asapRequestedAt: vasap ? S.asapAt : '',
        asapRequestedLocal: vasap && S.asapAt ? new Date(S.asapAt).toLocaleString('en-CA', { timeZone: 'America/Toronto', dateStyle: 'medium', timeStyle: 'short' }) + ' ET' : ''
      };
      var q = priceInfo();
      // offerFloor 0 = no floor on the exit offer (owner, Oct 20); also stops the script's old $175 default from flagging it
      if (q && q.ready) {   // itemized total shown to the customer right above Send (no accept checkbox: owner, Oct 18)
        payload.price = priceForOwner(q); payload.totalShown = true; payload.priceAmount = q.amount; payload.total = q.amount; payload.regularPrice = q.full;
        payload.swapPrice = q.swap; payload.onRims = q.rims === 'yes' ? 'yes' : q.rims === 'no' ? 'no' : 'not sure';
        payload.serviceFee = q.fee; payload.serviceArea = q.fee === null ? 'Other: ' + (S.area || S.addrText) : (q.areaName || S.area || S.addrText);
        payload.offerApplied = !!q.disc; payload.offerAmount = q.disc; payload.offerType = q.disc ? q.offerType : ''; payload.offerTier = q.disc ? q.offerTier : 0; payload.offerFloor = 0; payload.tier = q.tier; payload.tierLabel = tierLabel(q.tier, 'en');
        payload.tierSource = tierSource(q); payload.tierReason = q.auto.reason; payload.vehicleRecognized = !!q.auto.recognized;
        payload.vehicleFlag = q.auto.recognized ? '' : '⚠️ Vehicle not recognized: confirm tire type on the call';
        payload.stockSize = q.auto.stock ? q.auto.stock.size : ''; payload.stockSizeNote = stockNote(q.auto, typed);
        payload.stockSizeSource = q.auto.stock ? q.auto.stock.src + ' (' + (q.auto.stock.how === 'trim' ? 'trim match' : q.auto.stock.how === 'largest' ? 'performance model, no trim: biggest standard size' : 'no trim given: base size') + ')' : '';
        payload.performanceModel = q.auto.perf || '';
        payload.runFlat = /run-flat|performance/.test(q.auto.reason); payload.beforeTax = true; payload.priceShown = priceText(q, S.lang);
        payload.afterHours = !!q.after; payload.serviceFeeType = q.after ? 'after-hours' : q.fee === null ? 'to confirm' : q.fee ? 'area' : 'none';
        payload.urgency = !!q.urg; payload.urgencyReason = q.urg; payload.urgencyFee = q.asapFee;
        payload.asapFee = q.asap ? q.asapFee : 0;
        if (q.urg) payload.notes = ['⚡ ' + (q.urg === 'asap' ? 'ASAP' : 'SAME-DAY') + ' urgency (+' + money(q.asapFee, 'en') + ')', payload.notes].filter(Boolean).join(' · ');
        payload.notes = [payload.vehicleFlag, payload.notes, 'Tier: ' + payload.tierLabel + ' (' + q.auto.reason + ')', payload.stockSizeNote, 'Total shown: ' + payload.price].filter(Boolean).join(' · ');   // the script keeps 300 chars: flag first
      }
      var cal = calInfo(q && q.ready ? q : null, Date.now());
      return apiPost(payload).then(function (r) {
        S.busy = false;
        if (r.ok) {
          S.done = r; S.cal = cal;
          S.doneInfo = { when: asapOn() ? t('dAsap') : visitWhen(S.lang), addr: areaLabel(), veh: vehicleLabel() + (typed ? ' · ' + typed.text : ''),
                         total: q && q.ready ? (q.fee || q.disc || q.asapFee ? breakdown(q, S.lang) : priceText(q, S.lang)) : '' };
          if (S.offer) { S.offer.used = true; lsSet('bk_offer', JSON.stringify(S.offer)); S.offer = null; }
          if (S.offerApplied) { lsSet('bk_swap_offer', 'used'); lsSet('bk_swap_offer2', ''); }
          lsSet('bk_booked', '1'); lsSet('bk_started', '');
          fireConversion(r);
          return render();
        }
        if (r.error === 'slot_taken') {   // someone booked that hour a moment ago (the script re-checks before saving)
          var td = r.date || visitDateIso(), th = r.hour || S.visitTime; S.taken[td] = (S.taken[td] || []).concat([th]);
          S.visitTime = ''; S.visitErr = t('vTaken'); S.bookErr = t('vTaken'); S.bookErrVisit = true; render();
          var vt = document.getElementById('bk-visit-time'); if (vt) { vt.focus(); if (vt.scrollIntoView) vt.scrollIntoView({ block: 'center' }); }
          loadSlots(td, true); return;
        }
        if (r.error === 'slot_invalid') {   // the script refused the time (not a bookable slot, or it already started)
          S.visitTime = ''; S.visitErr = t('vPast'); S.bookErr = t('vPast'); S.bookErrVisit = true; return render();
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
    canShow: function () {
      if (!hasPrices() || !S.cfg || S.fatal || S.done || S.busy || lsGet('bk_swap_offer') === 'used' || !step1Basics() || !offerQuote()) return false;
      if (!S.offerApplied) return true;
      var q = offerQuote(); return !!second() && !S.offerTier2 && q.offer2Amt > q.offerAmt;   // tier 2 (off by default)
    },
    tier: function () { return S.offerApplied ? 2 : 1; },   // which offer would show now (offer.js keeps one "seen" flag per tier)
    started: function () { return !!S.cfg && !S.done && step1Basics() && !isExoticSafe(); },
    text: function () {
      var q = offerQuote(); if (!q) return null;
      var two = S.offerApplied, d = two ? q.offer2Amt - q.offerAmt : q.offerAmt, D = money(d), full = money(two ? q.full - q.offerAmt : q.full), now = money(q.full - (two ? q.offer2Amt : d)), k = offerKey(q);
      function f(x) { return t(x).replace(/\{D\}/g, D).replace('{F}', full).replace('{P}', now).replace('{X}', offerWords(q).x).replace('{Y}', offerWords(q).my); }
      if (two) return { title: f('xo2T'), sub: f('xo2S'), yes: f('xo2Yes'), no: f('xoNo'), type: q.offerType, tier: 2 };
      return { title: f('xoT' + k), sub: f('xoS'), yes: f('xoYes' + k), no: f('xoNo'), type: q.offerType, tier: 1 };
    },
    claim: function () {
      if (S.offerApplied && second()) { S.offerTier2 = true; lsSet('bk_swap_offer2', '1'); }
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
  // Built-in config = what the live script's ?action=config returned on Oct 19 2026 (public fields only).
  // The form renders from this INSTANTLY; the script's config is fetched in the background (4 s, no retry)
  // and only re-renders if something that matters changed. If it is slow or fails, the defaults stay, silently.
  var DEFAULT_CFG = { ok: true, testMode: false, season: 'winter', phone: '(613) 601-6471', adsBookingLabel: '7xVECNbm1I0dELK09-VC',
    rules: {"standardMaxRim": 16, "lowMaxAspect": 40, "bigRimMin": 19, "bigRimLowMaxAspect": 45, "ultraLowMaxAspect": 30, "pickupLowMinRim": 22, "pickupLowMaxAspect": 50, "exoticMinRim": 22, "premiumBrands": ["Mercedes-Benz", "Mercedes", "BMW", "Audi", "Lexus", "Acura", "Genesis", "Volvo", "Tesla", "Infiniti", "Cadillac", "Lincoln", "Porsche", "Land Rover", "Jaguar", "Maserati", "Alfa Romeo"], "exoticMakes": ["Lamborghini", "Ferrari", "McLaren", "Bentley", "Rolls-Royce", "Rolls Royce", "Aston Martin", "Bugatti", "Koenigsegg", "Pagani", "Lotus"], "exoticModels": [["Audi", "R8"], ["Porsche", "911 GT"], ["Porsche", "911 Turbo"], ["Porsche", "GT2"], ["Porsche", "GT3"], ["Porsche", "GT4"], ["Nissan", "GT-R"], ["Nissan", "GTR"], ["Chevrolet", "Corvette Z06"], ["Chevrolet", "Corvette ZR1"], ["Dodge", "Viper"]]} };
  function applyCfg(c) {
    S.cfg = c;
    S.season = c.season === 'summer' ? 'summer' : 'winter';
    if (c.testMode && qsSeason) S.season = qsSeason;   // ?season=summer preview while in TEST MODE
    document.title = t('title') + ' | Mobile Tire Repair Ottawa';
    var sn = document.getElementById('snow'); if (sn) sn.style.display = S.season === 'summer' ? 'none' : '';   // no snowfall in summer
  }
  function cfgSig(c) { return JSON.stringify([c.season, !!c.testMode, c.rules || null, c.phone || '', c.adsBookingLabel || '']); }
  applyCfg(publicPart(DEFAULT_CFG));
  render();
  S.cfgSource = 'default';
  (API && API.indexOf('PASTE') < 0 ? callApi(API + '?action=config', { method: 'GET' }, 0, 4000, false) : Promise.reject(new Error('no_api'))).then(function (r) {
    if (!r || !r.ok || !r.rules) { S.cfgSource = 'default (bad reply)'; return; }
    var c = publicPart(r); if (!c.season) c.season = DEFAULT_CFG.season; if (!c.phone) c.phone = DEFAULT_CFG.phone;
    var changed = cfgSig(c) !== cfgSig(S.cfg); S.cfgSource = changed ? 'script (changed)' : 'script (same)';
    if (!changed) { S.cfg = c; return; }
    var seasonBefore = S.season, testBefore = !!S.cfg.testMode;
    applyCfg(c);
    if (S.done) return;
    if (S.season !== seasonBefore || !!c.testMode !== testBefore) {   // visible change: re-render, keeping everything typed / picked + focus + scroll
      var y = window.scrollY; renderKeepFocus(); window.scrollTo(0, y);
    } else if (S.veh.car) refreshStep1();   // rules changed (exotic list etc.): refresh the price part only
  }).catch(function () { S.cfgSource = 'default (config unavailable)'; });
  window.BK_JS_BUILD = '20261020offer';   // must match the ?v= on the booking pages (stale-cache guard there)
  // stock-sizes.js loads after this file (async): re-price once it arrives, keeping everything typed
  window.BK_STOCK_READY = function () { try { if (S.veh && S.veh.car) refreshStep1(); } catch (e) {} };
  // load it only AFTER the form is on screen (never competes with first paint); same ?v= as this file
  (function () {
    function go() {
      if (window.STOCK_SIZES || document.getElementById('bk-stock-js')) return;
      var sc = document.createElement('script'); sc.id = 'bk-stock-js'; sc.async = true;
      sc.src = '/book-tire-swap/stock-sizes.js?v=' + window.BK_JS_BUILD; sc.onload = window.BK_STOCK_READY;
      document.body.appendChild(sc);
    }
    if (document.readyState === 'complete') setTimeout(go, 0); else window.addEventListener('load', function () { setTimeout(go, 0); });
  })();
  window.__bk = S; // for testing
})();
