/* ============================================================================================
 * WINTER SWAP PRICES: the ONE place to edit them.
 * Only the booking form (/book-tire-swap/ and /fr/reserver-changement-pneus/) loads this file.
 * No other page shows prices. All amounts are in CAD, BEFORE tax.
 *
 *   off      = price when the winter tires are NOT on rims (mount & balance). "Not sure" also uses this.
 *   on       = price when the winter tires are already on their own rims (wheel swap)
 *   discount = FALLBACK exit offer (see exitOffer below), dollars off, for off / on rims, never below the floor
 *              (owner, Oct 18: $15 off rims or "Not sure", $10 on rims).
 *              Set to 0 to never offer it for that case.
 * ============================================================================================ */
window.SWAP_PRICES = {
  tiers: {
    small:  { off: 160, on: 120, discount: { off: 15, on: 10 }, en: 'Small car', fr: 'Petite voiture',
              egEn: 'e.g. Chevy Spark, Hyundai Accent', egFr: 'ex. Chevy Spark, Hyundai Accent' },
    suv:    { off: 180, on: 130, discount: { off: 15, on: 10 }, en: 'SUV / crossover / minivan', fr: 'VUS / multisegment / fourgonnette',
              egEn: 'e.g. Honda CR-V, Toyota Sienna', egFr: 'ex. Honda CR-V, Toyota Sienna' },
    low:    { off: 260, on: 180, discount: { off: 15, on: 10 }, en: 'Low-profile or run-flat tires', fr: 'Pneus à profil bas ou à affaissement limité',
              egEn: '30–35 series sidewall, e.g. 245/35R19', egFr: 'flanc série 30–35, ex. 245/35R19' },
    pickup: { off: 280, on: 150, discount: { off: 15, on: 10 }, en: 'Pickup truck', fr: 'Camionnette',
              egEn: 'e.g. F-150, Silverado, Ram 1500', egFr: 'ex. F-150, Silverado, Ram 1500' }
  },
  order: ['small', 'suv', 'low', 'pickup'],   // order of the buttons on the form

  // SERVICE CALL FEE by town/area, added to the swap as its own line. Matched from the
  // "City or neighbourhood" field (accents and capitals don't matter: Orleans = Orléans).
  // Checked from the highest fee down, so "Manotick, Ottawa" = Manotick.
  // A place not listed anywhere: the form asks the customer to pick the closest area.
  serviceCall: [
    { fee: 100, areas: ['Rockland', 'Cumberland', 'Greely', 'Manotick', 'Richmond', 'Carp', 'Navan', 'Metcalfe', 'Osgoode', 'North Gower',
                        'Constance Bay', 'Dunrobin', 'Kinburn', 'Kemptville', 'Arnprior', 'Russell', 'Embrun'] },
    { fee: 50,  areas: ['Gatineau', 'Hull', 'Aylmer', 'Buckingham', 'Masson-Angers', 'Orléans', 'Convent Glen', 'Fallingbrook', 'Avalon',
                        'Chapel Hill', 'Queenswood Heights', 'Cardinal Creek', 'Chatelaine Village', 'Orleans Wood'] },
    { fee: 0,   areas: ['Ottawa', 'Kanata', 'Nepean', 'Barrhaven', 'Gloucester', 'Stittsville', 'Riverside South', 'Vanier', 'Centretown',
                        'Downtown', 'ByWard Market', 'Lowertown', 'Sandy Hill', 'The Glebe', 'Glebe', 'Westboro', 'Hintonburg', 'Little Italy',
                        'Old Ottawa South', 'Old Ottawa East', 'New Edinburgh', 'Rockcliffe', 'Manor Park', 'Overbrook', 'Beacon Hill', 'Alta Vista',
                        'Elmvale Acres', 'Riverview', 'Billings Bridge', 'Hunt Club', 'South Keys', 'Heron Gate', 'Findlay Creek', 'Leitrim',
                        'Bells Corners', 'Carlington', 'Carlingwood', 'Britannia', 'Bayshore', 'Centrepointe', 'Craig Henry', 'Merivale',
                        'Kanata Lakes', 'Bridlewood', "Morgan's Grant", 'Beaverbrook', 'Katimavik', 'Hazeldean', 'Half Moon Bay', 'Longfields',
                        'Chapman Mills', 'Stonebridge', 'Emerald Woods', 'Greenboro', 'Blossom Park', 'Riverside Park', 'Civic Hospital',
                        'Chinatown', 'Tunney\'s Pasture', 'Blackburn Hamlet'] }
  ],

  // EXIT OFFER (one time per visitor, when the form is started but not sent). Owner rule, Oct 19 (final, never waives both):
  //   1) there is a service call (area fee or after-hours): min(service call, total - floor) off -> "we'll waive your service call"
  //   2) else there is a same-day / ASAP urgency fee:        min(urgency fee, total - floor) off  -> "we'll waive the rush fee"
  //   3) else: the tier's flat discount above ($15 off rims / "Not sure", $10 on rims), also capped at total - floor.
  //   NEVER below the floor: if the discount would be $0 or less (total already at/below the floor), no exit popup at all.
  exitOffer: { floor: 175 },

  // SAME-DAY / ASAP URGENCY: added to the total as its own line when the customer ticks ASAP (next available tech)
  // OR picks a visit date that is today (Ottawa time). Stacks on top of the service call (area or after-hours).
  //   sameDay: false = charge it for ASAP only.
  //   hours: null = always available (the business runs 24/7). To limit it later, use e.g.
  //   hours: { start: '07:00', end: '21:00' }   (Ottawa time, checked when the form is shown; end before start = overnight)
  asap: { fee: 45, sameDay: true, hours: null },

  // AFTER-HOURS SERVICE CALL: a visit between start and end (Ottawa time) pays this fee INSTEAD of the area fee
  // (never both). ASAP still adds on top. Visit time = the time they book (ASAP) or the "Preferred time" they pick.
  afterHours: { fee: 100, start: '20:00', end: '08:00' },

  // VEHICLE TYPE IS SET AUTOMATICALLY (owner, Oct 19): customers can't pick it. Make & model are required; the tire
  // size is optional. Highest tier wins (small < SUV < low-profile < pickup), and a pickup ALWAYS stays at the pickup
  // price, even on low-profile tires.
  //   Low-profile / run-flat tier when ANY of these is true:
  //     - the make is in lowMakes (run-flat brands) or the make/model/trim text has a word in lowModels
  //       (performance / run-flat models and trims: GT, AMG, M3, Type R, N, SRT, Scat Pack, TRD Pro, RS, S line…)
  //     - a tire size is given with aspect ratio (the "35" in 295/35R20) at or below lowProfileMaxAspect,
  //       or rim (the "20") at or above lowProfileMinRim inches. A size can only move the type UP, never down.
  //   Make & model not in any list (e.g. "Lada Niva"): priced as unknownTier (SUV / crossover / minivan) and the
  //   booking is flagged for staff: "Vehicle not recognized: confirm tire type on the call". Never blocked.
  lowProfileMaxAspect: 40,
  lowProfileMinRim: 19,
  unknownTier: 'suv',
  lowMakes: ['bmw', 'mini', 'porsche', 'mercedes-amg', 'maserati', 'alfa romeo'],
  // A word or phrase, or [a, b] = all of them must be in the make/model/trim (lower case, whole words).
  // Plain "Sport" is NOT here on purpose: it is an ordinary trim name on many cars (CR-V Sport, Corolla Sport, Mazda3 Sport).
  lowModels: ['supra', 'gr supra', '86', 'gr86', 'gr 86', 'brz', 'fr-s', 'gr corolla', 'corvette', 'ss', 'zl1', 'camaro ss', 'mustang gt', 'gt', 'shelby', 'gt350', 'gt500', 'mach 1',
              'srt', 'scat pack', 'hellcat', 'trackhawk', 'amg', 's3', 's4', 's5', 's6', 's7', 's8', 'sq5', 'sq7', 'sq8', 'rs', 'rs3', 'rs4', 'rs5', 'rs6', 'rs7', 'rs q8', 'rsq8', 'e-tron gt',
              's-line', 's line', 'sline', 'm2', 'm3', 'm4', 'm5', 'm8', 'm sport', 'f sport', 'trd pro', 'nismo', 'type r', 'type s', 'si',
              ['tesla', 'performance'], ['model 3', 'performance'], ['model y', 'performance'], 'gt-r', 'gtr', ['nissan', 'z'], '370z', '350z',
              ['lexus', 'rc'], ['lexus', 'lc'], 'rc f', 'is f', 'g70', 'stinger', 'golf r', 'gti', 'wrx', 'sti', ['hyundai', 'n'], 'elantra n', 'veloster n', 'kona n', 'abarth'],
  // Ordinary cars (small car price), listed so we know the vehicle.
  smallModels: ['camry', 'accord', 'civic', 'corolla', 'elantra', 'sentra', 'altima', 'maxima', 'versa', 'micra', 'mazda3', 'mazda 3', 'mazda6', 'mazda 6', 'jetta', 'golf',
                'passat', 'arteon', 'beetle', 'accent', 'spark', 'malibu', 'cruze', 'sonic', 'impala', 'volt', 'bolt', 'fusion', 'focus', 'fiesta', 'taurus', 'mustang', 'camaro',
                'sonata', 'ioniq', 'veloster', 'optima', 'k5', 'forte', 'rio', 'soul', 'fit', 'insight', 'clarity', 'prius', 'yaris', 'avalon', 'impreza', 'legacy', 'mirage',
                'lancer', 'charger', 'challenger', 'chrysler 300', 'dart', 'leaf', 'model 3', 'model s', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'c-class', 'e-class', 'cla', 'a-class',
                'ilx', 'tlx', 'integra', 'lexus es', 'lexus is', 'g80', 'g90', 'q50', 'q60', 'ct4', 'ct5', 'ats', 'cts', 's60', 's90', 'v60', 'giulia', 'polestar 2', 'niro ev'],

  // Exit offer: shown at most once per visitor (remembered in this browser), only when the
  // booking form was started but not sent.
  exitOfferOncePerVisitor: true,

  // Make/model words used to pick the tier automatically (lower case; matched as whole words). Customers can't change it.
  pickupModels: ['f-150', 'f150', 'f-250', 'f250', 'f-350', 'f350', 'silverado', 'sierra', 'ram', 'tundra', 'tacoma', 'ranger', 'colorado',
                 'canyon', 'frontier', 'titan', 'ridgeline', 'gladiator', 'maverick', 'ram 1500', 'ram 2500', 'ram 3500', 'f-450', 'f450', 'santa cruz', 'cybertruck', 'lightning', 'r1t', 'hilux'],
  suvModels: ['cr-v', 'crv', 'hr-v', 'hrv', 'rav4', 'rav 4', 'rogue', 'murano', 'pathfinder', 'kicks', 'qashqai', 'armada', 'escape', 'edge', 'explorer', 'expedition',
              'bronco', 'equinox', 'traverse', 'blazer', 'trax', 'trailblazer', 'tahoe', 'suburban', 'terrain', 'acadia', 'yukon', 'envision', 'encore', 'enclave',
              'tucson', 'santa fe', 'kona', 'palisade', 'venue', 'ioniq 5', 'sportage', 'sorento', 'telluride', 'seltos', 'niro', 'ev6', 'ev9', 'carnival',
              'cx-3', 'cx-30', 'cx-5', 'cx-50', 'cx-9', 'cx-70', 'cx-90', 'forester', 'outback', 'crosstrek', 'ascent', 'highlander', '4runner', 'sequoia',
              'venza', 'corolla cross', 'sienna', 'pilot', 'passport', 'odyssey', 'compass', 'cherokee', 'grand cherokee', 'wrangler', 'durango', 'journey',
              'pacifica', 'grand caravan', 'caravan', 'atlas', 'tiguan', 'taos', 'id.4', 'outlander', 'rvr', 'eclipse cross', 'model x', 'model y', 'mach-e',
              'q3', 'q5', 'q7', 'q8', 'x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'glc', 'gle', 'gla', 'glb', 'gls', 'rx', 'nx', 'ux', 'gx', 'rdx', 'mdx',
              'xc40', 'xc60', 'xc90', 'macan', 'transit', 'transit connect', 'sprinter', 'promaster', 'express', 'savana', 'metris', 'nv200', 'quest', 'sedona', 'ioniq 9', 'cayenne', 'escalade', 'xt4', 'xt5', 'xt6', 'navigator', 'aviator', 'nautilus', 'corsair', 'range rover', 'discovery', 'defender']
};
