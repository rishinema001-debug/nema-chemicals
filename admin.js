// ===== NEMA Chemicals — Admin Command Center v2.0 =====
// Ultra-efficient admin panel with Airtable-style Bulk Grid, Magic Content Engine,
// Dark/Light mode, Live Preview, Auto-Translation, and FMCG Image Fetch.

(() => {
  "use strict";

  // ===== Constants =====
  const ADMIN_PASS_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; // SHA-256 hash of "1234"
  const STORAGE_KEY_PRODUCTS = "nema_admin_products";
  const STORAGE_KEY_CATEGORIES = "nema_admin_categories";
  const STORAGE_KEY_AUTH = "nema_admin_auth";
  const STORAGE_KEY_THEME = "nema_admin_theme";

  // ===== Firebase Database Reference =====
  let firebaseDb = null;
  try {
    if (typeof firebase !== 'undefined' && typeof FIREBASE_CONFIG !== 'undefined') {
      const app = firebase.initializeApp(FIREBASE_CONFIG);
      firebaseDb = firebase.database();
      console.log('[Admin] Firebase connected successfully');
    }
  } catch (e) {
    console.warn('[Admin] Firebase not available, using local storage only:', e.message);
  }

  // ===== DOM Helpers =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== State =====
  let products = [];
  let categories = [];
  let deleteCallback = null;
  let currentVariants = [];
  let gridChanges = {};       // tracks unsaved grid edits { productId: { field: newValue } }
  let gridSelected = new Set(); // tracks selected row IDs
  let magicHistory = [];      // recent magic fetches
  let currentProductView = "list"; // "list" or "grid"

  // ===================================================================
  // FMCG IMAGE DATABASE — 200+ Products (Studio-Quality Local Images)
  // ===================================================================
  const FMCG_IMAGE_DATABASE = {
    // ─── Oral Care ───
    "colgate": "images/colgate_maxfresh.png",
    "colgate maxfresh": "images/colgate_maxfresh.png",
    "colgate max fresh": "images/colgate_maxfresh.png",
    "colgate strong teeth": "images/colgate_toothpaste.png",
    "colgate toothpaste": "images/colgate_toothpaste.png",
    "colgate active salt": "images/colgate_toothpaste.png",
    "colgate visible white": "images/colgate_toothpaste.png",
    "colgate total": "images/colgate_toothpaste.png",
    "pepsodent": "images/pepsodent_toothpaste.png",
    "pepsodent germicheck": "images/pepsodent_toothpaste.png",
    "pepsodent toothpaste": "images/pepsodent_toothpaste.png",
    "closeup": "images/closeup_toothpaste.png",
    "closeup toothpaste": "images/closeup_toothpaste.png",
    "closeup ever fresh": "images/closeup_toothpaste.png",
    "closeup red hot": "images/closeup_toothpaste.png",
    "close up": "images/closeup_toothpaste.png",
    "patanjali dant kanti": "images/patanjali_dant_kanti.png",
    "dant kanti": "images/patanjali_dant_kanti.png",
    "patanjali toothpaste": "images/patanjali_dant_kanti.png",
    "oral b": "images/colgate_toothpaste.png",
    "sensodyne": "images/colgate_toothpaste.png",
    // ─── Soaps & Body Wash ───
    "lux": "images/lux_soap.png",
    "lux soft touch": "images/lux_soap.png",
    "lux soap": "images/lux_soap.png",
    "lux strawberry": "images/lux_soap.png",
    "lux velvet touch": "images/lux_soap.png",
    "dettol": "images/dettol_soap.png",
    "dettol soap": "images/dettol_soap.png",
    "dettol original": "images/dettol_soap.png",
    "dettol cool": "images/dettol_soap.png",
    "dettol skincare": "images/dettol_soap.png",
    "dettol handwash": "images/dettol_soap.png",
    "dettol hand wash": "images/dettol_soap.png",
    "lifebuoy": "images/dettol_soap.png",
    "lifebuoy soap": "images/dettol_soap.png",
    "dove soap": "images/dove_shampoo.png",
    "dove beauty bar": "images/dove_shampoo.png",
    // ─── Shampoo & Hair Care ───
    "head & shoulders": "images/head_shoulders_shampoo.png",
    "head and shoulders": "images/head_shoulders_shampoo.png",
    "head shoulders": "images/head_shoulders_shampoo.png",
    "h&s shampoo": "images/head_shoulders_shampoo.png",
    "dove shampoo": "images/dove_shampoo.png",
    "dove intense repair": "images/dove_shampoo.png",
    "dove hair": "images/dove_shampoo.png",
    "dove conditioner": "images/dove_shampoo.png",
    "pantene": "images/dove_shampoo.png",
    "pantene shampoo": "images/dove_shampoo.png",
    "sunsilk": "images/dove_shampoo.png",
    "sunsilk shampoo": "images/dove_shampoo.png",
    "clinic plus": "images/dove_shampoo.png",
    "tresemme": "images/dove_shampoo.png",
    "tresemme shampoo": "images/dove_shampoo.png",
    "patanjali kesh kanti": "images/patanjali_shampoo.png",
    "patanjali shampoo": "images/patanjali_shampoo.png",
    "kesh kanti": "images/patanjali_shampoo.png",
    // ─── Skin & Face Care ───
    "boroplus": "images/boroplus_cream.png",
    "boroplus cream": "images/boroplus_cream.png",
    "boro plus": "images/boroplus_cream.png",
    "boroplus antiseptic": "images/boroplus_cream.png",
    "boroline": "images/boroplus_cream.png",
    "nivea": "images/nivea_cream.png",
    "nivea cream": "images/nivea_cream.png",
    "nivea creme": "images/nivea_cream.png",
    "nivea body lotion": "images/nivea_cream.png",
    "nivea soft": "images/nivea_cream.png",
    "nivea men": "images/nivea_cream.png",
    "fair lovely": "images/glow_lovely.png",
    "fair and lovely": "images/glow_lovely.png",
    "glow lovely": "images/glow_lovely.png",
    "glow and lovely": "images/glow_lovely.png",
    "glow & lovely": "images/glow_lovely.png",
    "pond's": "images/glow_lovely.png",
    "ponds cream": "images/glow_lovely.png",
    "vaseline": "images/nivea_cream.png",
    "vaseline lotion": "images/nivea_cream.png",
    "himalaya": "images/boroplus_cream.png",
    "himalaya cream": "images/boroplus_cream.png",
    "himalaya face wash": "images/boroplus_cream.png",
    "patanjali face wash": "images/patanjali_facewash.png",
    "patanjali saundarya": "images/patanjali_facewash.png",
    "patanjali aloe vera": "images/patanjali_aloevera.png",
    "patanjali coconut oil": "images/patanjali_coconut.png",
    "patanjali coconut": "images/patanjali_coconut.png",
    // ─── Deodorant & Mens Care ───
    "denver": "images/denver_deo.png",
    "denver deo": "images/denver_deo.png",
    "denver deodorant": "images/denver_deo.png",
    "denver body spray": "images/denver_deo.png",
    "denver pride": "images/denver_deo.png",
    "denver honour": "images/denver_deo.png",
    "denver caliber": "images/denver_deo.png",
    "fogg": "images/denver_deo.png",
    "fogg deo": "images/denver_deo.png",
    "fogg deodorant": "images/denver_deo.png",
    "wild stone": "images/denver_deo.png",
    "wild stone deo": "images/denver_deo.png",
    "park avenue": "images/denver_deo.png",
    "park avenue deo": "images/denver_deo.png",
    "axe": "images/denver_deo.png",
    "axe deo": "images/denver_deo.png",
    "axe deodorant": "images/denver_deo.png",
    "set wet": "images/denver_deo.png",
    "set wet gel": "images/denver_deo.png",
    "old spice": "images/denver_deo.png",
    "old spice deo": "images/denver_deo.png",
    "engage": "images/denver_deo.png",
    "engage deo": "images/denver_deo.png",
    // ─── Beverages ───
    "coca cola": "images/coca_cola.png",
    "coca-cola": "images/coca_cola.png",
    "coke": "images/coca_cola.png",
    "thums up": "images/coca_cola.png",
    "pepsi": "images/coca_cola.png",
    "sprite": "images/coca_cola.png",
    "fanta": "images/coca_cola.png",
    "limca": "images/coca_cola.png",
    "maaza": "images/tropicana_juice.png",
    "tropicana": "images/tropicana_juice.png",
    "tropicana orange": "images/tropicana_juice.png",
    "tropicana juice": "images/tropicana_juice.png",
    "real juice": "images/tropicana_juice.png",
    "paper boat": "images/tropicana_juice.png",
    "frooti": "images/tropicana_juice.png",
    "red bull": "images/red_bull.png",
    "red bull energy": "images/red_bull.png",
    "monster energy": "images/red_bull.png",
    "sting": "images/red_bull.png",
    "bisleri": "images/coca_cola.png",
    "bisleri water": "images/coca_cola.png",
    "kinley": "images/coca_cola.png",
    "nescafe": "images/nescafe_classic.png",
    "nescafe classic": "images/nescafe_classic.png",
    "nescafe coffee": "images/nescafe_classic.png",
    "nescafe gold": "images/nescafe_classic.png",
    "bru coffee": "images/nescafe_classic.png",
    "bru instant": "images/nescafe_classic.png",
    "tata tea": "images/nescafe_classic.png",
    "tata tea gold": "images/nescafe_classic.png",
    "taj mahal tea": "images/nescafe_classic.png",
    "brooke bond": "images/nescafe_classic.png",
    "red label": "images/nescafe_classic.png",
    // ─── Snacks & Chocolates ───
    "lays": "images/lays_chips.png",
    "lay's": "images/lays_chips.png",
    "lays classic": "images/lays_chips.png",
    "lays magic masala": "images/lays_chips.png",
    "uncle chips": "images/lays_chips.png",
    "kurkure": "images/lays_chips.png",
    "bingo": "images/lays_chips.png",
    "cadbury silk": "images/cadbury_silk.png",
    "cadbury dairy milk": "images/cadbury_dairymilk.png",
    "dairy milk silk": "images/cadbury_silk.png",
    "dairy milk": "images/cadbury_dairymilk.png",
    "cadbury 5 star": "images/cadbury_5star.png",
    "5 star": "images/cadbury_5star.png",
    "cadbury celebrations": "images/cadbury_celebrations.png",
    "cadbury gems": "images/cadbury_gems.png",
    "cadbury oreo": "images/cadbury_oreo.png",
    "oreo": "images/cadbury_oreo.png",
    "cadbury perk": "images/cadbury_perk.png",
    "cadbury bournvita": "images/cadbury_bournvita.png",
    "bournvita": "images/cadbury_bournvita.png",
    "cadbury bournville": "images/cadbury_bournville.png",
    "kit kat": "images/nestle_kitkat.png",
    "kitkat": "images/nestle_kitkat.png",
    "munch": "images/nestle_munch.png",
    "maggi": "images/maggi_noodles.png",
    "maggi noodles": "images/maggi_noodles.png",
    "maggi masala": "images/maggi_noodles.png",
    "maggi 2 minute": "images/maggi_noodles.png",
    "maggi pazzta": "images/maggi_pazzta.png",
    "maggi sauce": "images/maggi_sauce.png",
    "yippee": "images/maggi_noodles.png",
    "yippee noodles": "images/maggi_noodles.png",
    "top ramen": "images/maggi_noodles.png",
    "haldiram": "images/haldiram_bhujia.png",
    "haldiram's": "images/haldiram_bhujia.png",
    "haldiram bhujia": "images/haldiram_bhujia.png",
    "haldiram namkeen": "images/haldiram_bhujia.png",
    "bikaner": "images/haldiram_bhujia.png",
    "parle g": "images/parle_g.png",
    "parle-g": "images/parle_g.png",
    "parle g gold": "images/parle_g.png",
    "parle hide seek": "images/parle_g.png",
    "britannia": "images/parle_g.png",
    "britannia good day": "images/parle_g.png",
    "good day": "images/parle_g.png",
    // ─── Household & Cleaning ───
    "surf excel": "images/surf_excel.png",
    "surf excel easy wash": "images/surf_excel.png",
    "surf excel matic": "images/surf_excel.png",
    "tide": "images/surf_excel.png",
    "tide detergent": "images/surf_excel.png",
    "ariel": "images/surf_excel.png",
    "ariel detergent": "images/surf_excel.png",
    "rin": "images/surf_excel.png",
    "nirma": "images/surf_excel.png",
    "vim": "images/vim_dishwash.png",
    "vim dishwash": "images/vim_dishwash.png",
    "vim bar": "images/vim_dishwash.png",
    "vim liquid": "images/vim_dishwash.png",
    "exo dishwash": "images/vim_dishwash.png",
    "pril": "images/vim_dishwash.png",
    "harpic": "images/harpic_cleaner.png",
    "harpic powerplus": "images/harpic_cleaner.png",
    "harpic toilet cleaner": "images/harpic_cleaner.png",
    "harpic power plus": "images/harpic_cleaner.png",
    "lizol": "images/lizol_cleaner.png",
    "lizol floor cleaner": "images/lizol_cleaner.png",
    "lizol cleaner": "images/lizol_cleaner.png",
    "domex": "images/harpic_cleaner.png",
    "colin": "images/lizol_cleaner.png",
    "patanjali dish wash": "images/patanjali_dishbar.png",
    "odonil": "images/lizol_cleaner.png",
    "goodknight": "images/lizol_cleaner.png",
    "good knight": "images/lizol_cleaner.png",
    "all out": "images/lizol_cleaner.png",
    "mortein": "images/lizol_cleaner.png",
    "hit": "images/lizol_cleaner.png",
    // ─── Packaged Foods ───
    "aashirvaad": "images/aashirvaad_atta.png",
    "aashirvaad atta": "images/aashirvaad_atta.png",
    "aashirvaad whole wheat": "images/aashirvaad_atta.png",
    "pillsbury atta": "images/aashirvaad_atta.png",
    "fortune atta": "images/aashirvaad_atta.png",
    "tata dal": "images/tata_dal.png",
    "tata sampann": "images/tata_dal.png",
    "tata salt": "images/tata_dal.png",
    "india gate": "images/india_gate_rice.png",
    "india gate basmati": "images/india_gate_rice.png",
    "daawat rice": "images/india_gate_rice.png",
    "fortune oil": "images/patanjali_oil.png",
    "fortune rice bran": "images/patanjali_oil.png",
    "saffola": "images/patanjali_oil.png",
    "saffola oil": "images/patanjali_oil.png",
    "mdh masala": "images/haldiram_bhujia.png",
    "everest masala": "images/haldiram_bhujia.png",
    "patanjali noodles": "images/patanjali_noodles.png",
    "patanjali atta noodles": "images/patanjali_noodles.png",
    "patanjali honey": "images/patanjali_honey.png",
    "dabur honey": "images/patanjali_honey.png",
    "patanjali mustard oil": "images/patanjali_oil.png",
    "patanjali oil": "images/patanjali_oil.png",
    // ─── Dairy ───
    "amul butter": "images/amul_butter.png",
    "amul": "images/amul_butter.png",
    "amul cheese": "images/amul_butter.png",
    "amul milk": "images/amul_butter.png",
    "amul ghee": "images/amul_butter.png",
    "mother dairy": "images/mother_dairy_milk.png",
    "mother dairy milk": "images/mother_dairy_milk.png",
    "patanjali ghee": "images/patanjali_ghee.png",
    "patanjali cow ghee": "images/patanjali_ghee.png",
    "nestle everyday": "images/nestle_everyday.png",
    "nestle milkmaid": "images/nestle_milkmaid.png",
    "nestle milk": "images/nestle_milk.png",
    "nestle cerelac": "images/nestle_cerelac.png",
    "cerelac": "images/nestle_cerelac.png",
    "horlicks": "images/cadbury_bournvita.png",
    "complan": "images/cadbury_bournvita.png",
  };

  // ===================================================================
  // HINDI TRANSLITERATION DICTIONARY
  // ===================================================================
  const HINDI_DICTIONARY = {
    // ══════════════════════════════════════════════════════════════
    // ─── BRANDS: Oral Care ───
    // ══════════════════════════════════════════════════════════════
    "colgate": "कोलगेट", "pepsodent": "पेप्सोडेंट", "patanjali": "पतंजलि",
    "closeup": "क्लोज़अप", "close up": "क्लोज़ अप",
    "sensodyne": "सेंसोडाइन", "oral b": "ओरल बी", "oral-b": "ओरल-बी",
    "babool": "बबूल", "meswak": "मेसवाक", "vicco": "विक्को",
    "ajay": "अजय", "anchor": "एंकर", "aquafresh": "एक्वाफ्रेश",
    // ─── BRANDS: Soap & Body ───
    "lux": "लक्स", "dettol": "डेटॉल", "dove": "डव",
    "lifebuoy": "लाइफबॉय", "pears": "पियर्स", "santoor": "संतूर",
    "cinthol": "सिंथोल", "medimix": "मेडिमिक्स", "fiama": "फिआमा",
    "godrej no 1": "गोदरेज नंबर 1", "godrej": "गोदरेज",
    "hamam": "हमाम", "margo": "मार्गो", "mysore sandal": "मैसूर सैंडल",
    // ─── BRANDS: Skin / Face / Body / Deo ───
    "boroplus": "बोरोप्लस", "boro plus": "बोरो प्लस", "boroline": "बोरोलीन",
    "borolin": "बोरोलीन",
    "nivea": "निवेआ", "nivea cream": "निवेआ क्रीम", "nivea creme": "निवेआ क्रीम",
    "fair lovely": "फेयर एंड लवली", "fair and lovely": "फेयर एंड लवली",
    "glow lovely": "ग्लो एंड लवली", "glow and lovely": "ग्लो एंड लवली",
    "glow & lovely": "ग्लो एंड लवली",
    "pond's": "पॉन्ड्स", "ponds": "पॉन्ड्स",
    "vaseline": "वैसलीन", "himalaya": "हिमालया",
    "lakme": "लक्मे", "lakmé": "लक्मे", "biotique": "बायोटिक",
    "lotus": "लोटस", "lotus herbals": "लोटस हर्बल्स",
    "garnier": "गार्नियर", "maybelline": "मेबेलिन",
    "clean and clear": "क्लीन एंड क्लियर", "clean & clear": "क्लीन एंड क्लियर",
    "nair": "नेयर", "veet": "वीट",
    "denver": "डेनवर", "denver deo": "डेनवर डियो",
    "fogg": "फॉग", "fogg deo": "फॉग डियो",
    "wild stone": "वाइल्ड स्टोन", "park avenue": "पार्क एवेन्यू",
    "axe": "एक्स", "axe deo": "एक्स डियो",
    "set wet": "सेट वेट", "old spice": "ओल्ड स्पाइस",
    "engage": "इंगेज", "engage deo": "इंगेज डियो",
    "yardley": "यार्डले", "brut": "ब्रुट", "rexona": "रेक्सोना",
    // ─── BRANDS: Shampoo / Hair ───
    "head & shoulders": "हेड एंड शोल्डर्स", "head and shoulders": "हेड एंड शोल्डर्स",
    "head shoulders": "हेड एंड शोल्डर्स",
    "pantene": "पैंटीन", "sunsilk": "सनसिल्क",
    "clinic plus": "क्लिनिक प्लस", "tresemme": "ट्रेसेमी",
    "l'oreal": "लोरियल", "loreal": "लोरियल",
    "parachute": "पैराशूट", "dabur amla": "डाबर आंवला",
    "bajaj almond drops": "बजाज आलमंड ड्रॉप्स", "bajaj": "बजाज",
    "navratna": "नवरत्ना", "keo karpin": "कीओ कार्पिन",
    "hair & care": "हेयर एंड केयर", "hair and care": "हेयर एंड केयर",
    "indulekha": "इंदुलेखा", "mamaearth": "मामाअर्थ",
    "yutika": "युतिका", "whitetone": "व्हाइटटोन",
    "nyle": "नाइल", "chik": "चिक",
    // ─── BRANDS: Beverages / Tea / Coffee ───
    "coca cola": "कोका कोला", "coca-cola": "कोका कोला", "tropicana": "ट्रॉपिकाना",
    "red bull": "रेड बुल", "bisleri": "बिसलेरी", "nescafe": "नेस्कैफे",
    "thums up": "थम्स अप", "pepsi": "पेप्सी", "sprite": "स्प्राइट",
    "fanta": "फैंटा", "limca": "लिम्का", "maaza": "माज़ा",
    "frooti": "फ्रूटी", "paper boat": "पेपर बोट", "real juice": "रियल जूस",
    "sting": "स्टिंग", "monster energy": "मॉन्स्टर एनर्जी",
    "bru": "ब्रू", "bru coffee": "ब्रू कॉफी",
    "tata tea": "टाटा चाय", "taj mahal": "ताज महल",
    "brooke bond": "ब्रुक बॉन्ड", "red label": "रेड लेबल",
    "kinley": "किनले", "aquafina": "एक्वाफिना",
    "tang": "टैंग", "rasna": "रसना",
    // ─── BRANDS: Snacks / Biscuits / Chocolates ───
    "lays": "लेज़", "lay's": "लेज़", "cadbury": "कैडबरी",
    "dairy milk": "डेयरी मिल्क", "silk": "सिल्क", "5 star": "5 स्टार",
    "celebrations": "सेलिब्रेशंस", "gems": "जेम्स", "oreo": "ओरियो",
    "perk": "पर्क", "bournvita": "बोर्नविटा", "bournville": "बोर्नविल",
    "kit kat": "किट कैट", "kitkat": "किट कैट", "munch": "मंच",
    "maggi": "मैगी", "haldiram": "हल्दीराम", "haldiram's": "हल्दीराम",
    "parle g": "पार्ले-जी", "parle-g": "पार्ले-जी",
    "parle hide seek": "पार्ले हाइड एंड सीक",
    "kurkure": "कुरकुरे", "uncle chips": "अंकल चिप्स", "bingo": "बिंगो",
    "britannia": "ब्रिटानिया", "good day": "गुड डे",
    "yippee": "यिप्पी", "top ramen": "टॉप रामन",
    "bikaner": "बीकानेर",
    "ferrero rocher": "फेरेरो रोशे", "snickers": "स्निकर्स",
    "milky bar": "मिल्की बार", "bar one": "बार वन",
    "hide & seek": "हाइड एंड सीक", "marie gold": "मैरी गोल्ड",
    "50-50": "50-50", "krack jack": "क्रैक जैक", "monaco": "मोनैको",
    // ─── BRANDS: Household / Cleaning ───
    "surf excel": "सर्फ एक्सेल", "vim": "विम", "harpic": "हार्पिक",
    "lizol": "लाइज़ोल", "aashirvaad": "आशीर्वाद",
    "tide": "टाइड", "ariel": "एरियल", "rin": "रिन", "nirma": "निरमा",
    "exo": "एक्सो", "pril": "प्रिल", "domex": "डोमेक्स", "colin": "कॉलिन",
    "odonil": "ओडोनिल", "goodknight": "गुडनाइट", "good knight": "गुड नाइट",
    "all out": "ऑल आउट", "mortein": "मॉर्टीन", "hit": "हिट",
    "comfort": "कम्फ़र्ट", "downy": "डाउनी", "ujala": "उजाला",
    "robin": "रॉबिन", "ezee": "ईज़ी", "gentle": "जेंटल",
    "mr muscle": "मिस्टर मसल", "scotch brite": "स्कॉच ब्राइट",
    // ─── BRANDS: Food / Cooking / Grocery ───
    "pillsbury": "पिल्सबरी", "fortune": "फॉर्च्यून",
    "saffola": "सैफोला", "daawat": "दावत",
    "mdh": "एमडीएच", "everest": "एवरेस्ट",
    "dabur": "डाबर", "dabur honey": "डाबर शहद",
    "tata salt": "टाटा नमक", "tata": "टाटा", "sampann": "सम्पन्न",
    "india gate": "इंडिया गेट",
    "catch": "कैच", "sakthi": "शक्ति", "badshah": "बादशाह",
    "eastern": "ईस्टर्न", "priya": "प्रिया",
    "sundrop": "सनड्रॉप", "dhara": "धारा", "gemini": "जेमिनी",
    "nature fresh": "नेचर फ्रेश", "president": "प्रेसिडेंट",
    "kissan": "किसान", "smith & jones": "स्मिथ एंड जोन्स",
    "ching's": "चिंग्स", "chings": "चिंग्स", "knorr": "नॉर",
    "heinz": "हेंज", "del monte": "डेल मोंटे",
    // ─── BRANDS: Dairy / Health Drinks ───
    "amul": "अमूल", "mother dairy": "मदर डेयरी", "nestle": "नेस्ले", "nestlé": "नेस्ले",
    "horlicks": "हॉर्लिक्स", "complan": "कॉम्प्लान",
    "cerelac": "सेरेलैक", "boost": "बूस्ट",
    "protinex": "प्रोटीनेक्स", "ensure": "एनश्योर",
    "pediasure": "पीडियाश्योर",
    // ─── BRANDS: Baby Care ───
    "johnson": "जॉनसन", "johnson's": "जॉनसन", "johnsons": "जॉनसन",
    "pampers": "पैम्पर्स", "huggies": "हगीज", "mamy poko": "मैमी पोको",
    "himalaya baby": "हिमालया बेबी", "sebamed": "सेबामेड",
    "chicco": "चिक्को", "pigeon": "पिजन",
    "babylois": "बेबीलॉइस", "auto flow": "ऑटो फ्लो",
    // ─── BRANDS: Mosquito / Pest ───
    "kala hit": "काला हिट", "baygon": "बेगॉन",
    "lal hit": "लाल हिट", "maxo": "मैक्सो",
    "odomos": "ओडोमॉस",
    // ─── BRANDS: Air Freshener ───
    "aer": "एयर", "aer matic": "एयर मैटिक", "ambi pur": "एम्बी पर",
    "air wick": "एयर विक", "odonil room": "ओडोनिल रूम",
    // ─── BRANDS: Ayurvedic / Herbal ───
    "baidyanath": "बैद्यनाथ", "zandu": "झंडू", "hamdard": "हमदर्द",
    "chyawanprash": "च्यवनप्राश", "baba ramdev": "बाबा रामदेव",
    "baba ratan": "बाबा रतन", "divya": "दिव्य",
    "sri sri": "श्री श्री", "unjha": "ऊंझा",
    "agro": "एग्रो", "vaidya": "वैद्य",
    "nema": "नेमा", "blue cip": "ब्लू सिप",
    "yograj guggulu": "योगराज गुग्गुलु", "yögraj gugglu": "योगराज गुग्गुलु",
    "benadryl": "बेनाड्रिल", "whisper": "विस्पर",
    "bc": "बीसी", "ap": "एपी",
    // ─── BRANDS: Misc ───
    "anmol": "अनमोल", "jasmine": "जैस्मिन",

    // ══════════════════════════════════════════════════════════════
    // ─── AYURVEDIC MEDICINE WORDS ───
    // ══════════════════════════════════════════════════════════════
    "abhyarishta": "अभ्यारिष्ट", "amritarishta": "अमृतारिष्ट",
    "arjunarishta": "अर्जुनारिष्ट", "ashokarishta": "अशोकारिष्ट",
    "ashwagandharishta": "अश्वगंधारिष्ट", "ashwagandha": "अश्वगंधा",
    "arvindasava": "अर्विन्दासव", "drakshasava": "द्राक्षासव",
    "dashmularishta": "दशमूलारिष्ट", "lohasava": "लोहासव",
    "saraswatarishta": "सारस्वतारिष्ट", "kumaryasava": "कुमार्यासव",
    "anandbhairav ras": "आनंदभैरव रस", "arsh kuthar ras": "अर्शकुठार रस",
    "arogyawardhini wati": "आरोग्यवर्धिनी वटी", "arogyawardhni wati": "आरोग्यवर्धनी वटी",
    "arshodhni wati": "अर्शोधनी वटी",
    "churna": "चूर्ण", "wati": "वटी", "ras": "रस",
    "arishta": "अरिष्ट", "asava": "आसव", "guggulu": "गुग्गुलु",
    "bhasma": "भस्म", "kwath": "क्वाथ", "avaleha": "अवलेह",
    "taila": "तैल", "ghrita": "घृत", "lepa": "लेप",
    "vati": "वटी", "gutika": "गुटिका", "pishti": "पिष्टी",
    "triphala": "त्रिफला", "trikatu": "त्रिकटु",
    "shatavari": "शतावरी", "brahmi": "ब्राह्मी",
    "giloy": "गिलोय", "tulsi": "तुलसी", "neem": "नीम",
    "haldi": "हल्दी", "turmeric": "हल्दी",
    "adulsa": "अडूसा", "ablari": "अबलारी",
    "syrup": "सिरप", "tablet": "टैबलेट", "capsule": "कैप्सूल",
    "tonic": "टॉनिक", "drops": "ड्रॉप्स",
    "balm": "बाम", "pain balm": "पेन बाम",
    "manjan": "मंजन",

    // ══════════════════════════════════════════════════════════════
    // ─── PRODUCT TYPES ───
    // ══════════════════════════════════════════════════════════════
    "toothpaste": "टूथपेस्ट", "toothbrush": "टूथब्रश",
    "tooth brush": "टूथ ब्रश", "tb": "टूथब्रश",
    "brush": "ब्रश", "shaving brush": "शेविंग ब्रश",
    "baby brush": "बेबी ब्रश",
    "soap": "साबुन", "shampoo": "शैम्पू", "conditioner": "कंडीशनर",
    "juice": "जूस", "chips": "चिप्स", "noodles": "नूडल्स",
    "pasta": "पास्ता", "pazzta": "पाज़्ज़्ता",
    "chocolate": "चॉकलेट", "biscuit": "बिस्कुट", "biscuits": "बिस्कुट",
    "wafer": "वेफर", "wafers": "वेफर्स", "candy": "कैंडी",
    "toffee": "टॉफी", "gum": "गम", "chewing gum": "च्यूइंग गम",
    "atta": "आटा", "rice": "चावल", "dal": "दाल",
    "basmati": "बासमती", "butter": "मक्खन", "ghee": "घी",
    "paneer": "पनीर", "curd": "दही", "yogurt": "दही",
    "cheese": "चीज़", "milkshake": "मिल्कशेक",
    "milk": "दूध", "oil": "तेल", "honey": "शहद",
    "sugar": "चीनी", "salt": "नमक", "flour": "आटा",
    "vinegar": "सिरका", "ketchup": "कैचप", "sauce": "सॉस",
    "pickle": "अचार", "papad": "पापड़", "achaar": "अचार",
    "murabba": "मुरब्बा", "jam": "जैम", "jelly": "जेली",
    "cream": "क्रीम", "lotion": "लोशन", "body spray": "बॉडी स्प्रे",
    "deodorant": "डिओडोरेंट", "deo": "डियो", "perfume": "परफ्यूम",
    "cologne": "कोलोन", "attar": "इत्र", "ittar": "इत्र",
    "face wash": "फेस वॉश", "hand wash": "हैंड वॉश", "handwash": "हैंड वॉश",
    "body wash": "बॉडी वॉश", "beauty bar": "ब्यूटी बार",
    "dish wash": "डिश वॉश", "dishwash": "डिश वॉश",
    "floor cleaner": "फ्लोर क्लीनर", "cleaner": "क्लीनर",
    "toilet cleaner": "टॉयलेट क्लीनर", "glass cleaner": "ग्लास क्लीनर",
    "detergent": "डिटर्जेंट", "powder": "पाउडर", "liquid": "लिक्विड",
    "coconut": "नारियल", "coffee": "कॉफी", "tea": "चाय",
    "energy drink": "एनर्जी ड्रिंक", "energy": "एनर्जी",
    "spray": "स्प्रे", "refill": "रिफिल", "refll": "रिफिल",
    "room spray": "रूम स्प्रे", "matic": "मैटिक",
    "diaper": "डायपर", "diapers": "डायपर",
    "wipes": "वाइप्स", "wet wipes": "वेट वाइप्स",
    "lip balm": "लिप बाम", "lip gloss": "लिप ग्लॉस",
    "sunscreen": "सनस्क्रीन", "moisturizer": "मॉइस्चराइज़र",
    "serum": "सीरम", "gel": "जेल", "hair gel": "हेयर जेल",
    "hair color": "हेयर कलर", "hair dye": "हेयर डाई",
    "mehndi": "मेहंदी", "henna": "हिना",
    "hair oil": "हेयर ऑयल", "tel": "तेल",
    "almond oil": "बादाम तेल", "amla tel": "आंवला तेल",
    "coconut oil": "नारियल तेल", "mustard oil": "सरसों का तेल",
    "sanitary pad": "सैनिटरी पैड", "sanitary napkin": "सैनिटरी नैपकिन",
    "incense": "अगरबत्ती", "agarbatti": "अगरबत्ती",
    "dhoop": "धूप", "camphor": "कपूर",
    "mosquito coil": "मच्छर कॉइल", "mosquito": "मच्छर",
    "repellent": "रिपेलेंट",
    "tissue": "टिशू", "napkin": "नैपकिन", "tissue paper": "टिशू पेपर",
    "bandage": "बैंडेज", "cotton": "रुई",
    "razor": "रेज़र", "blade": "ब्लेड", "shaving": "शेविंग",
    "shaving cream": "शेविंग क्रीम", "after shave": "आफ्टर शेव",

    // ══════════════════════════════════════════════════════════════
    // ─── COMMON DESCRIPTIVE WORDS ───
    // ══════════════════════════════════════════════════════════════
    "maxfresh": "मैक्सफ्रेश", "strong teeth": "स्ट्रॉन्ग टीथ",
    "germicheck": "जर्मीचेक", "dant kanti": "दंत कांति",
    "kesh kanti": "केश कांति", "aloe vera": "एलोवेरा",
    "aloevera": "एलोवेरा", "aloe": "एलो",
    "mustard": "सरसों", "soft touch": "सॉफ्ट टच",
    "original": "ओरिजिनल", "intense repair": "इंटेंस रिपेयर",
    "classic": "क्लासिक", "gold": "गोल्ड", "silver": "सिल्वर",
    "platinum": "प्लैटिनम", "diamond": "डायमंड",
    "masala": "मसाला", "citrus": "सिट्रस", "powerplus": "पावरप्लस",
    "whole wheat": "संपूर्ण गेहूं", "cow": "गाय का",
    "full cream": "फुल क्रीम", "bar": "बार",
    "orange": "ऑरेंज", "peppermint": "पेपरमिंट",
    "cooling": "कूलिंग", "crystals": "क्रिस्टल्स",
    "everyday": "एवरीडे", "milkmaid": "मिल्कमेड",
    "antiseptic": "एंटीसेप्टिक", "antibacterial": "एंटीबैक्टीरियल",
    "anti-dandruff": "एंटी-डैंड्रफ", "anti dandruff": "एंटी डैंड्रफ",
    "cool menthol": "कूल मेंथोल",
    "ever fresh": "एवर फ्रेश", "red hot": "रेड हॉट",
    "skincare": "स्किनकेयर", "multivitamin": "मल्टीविटामिन",
    // ─── Colors ───
    "red": "रेड", "blue": "ब्लू", "green": "ग्रीन",
    "white": "व्हाइट", "black": "ब्लैक", "pink": "पिंक",
    "yellow": "यलो", "purple": "पर्पल", "brown": "ब्राउन",
    // ─── Descriptors ───
    "fresh": "फ्रेश", "natural": "नैचुरल", "pure": "प्योर",
    "herbal": "हर्बल", "organic": "ऑर्गेनिक", "ayurvedic": "आयुर्वेदिक",
    "premium": "प्रीमियम", "royal": "रॉयल", "super": "सुपर",
    "ultra": "अल्ट्रा", "mega": "मेगा", "mini": "मिनी",
    "extra": "एक्स्ट्रा", "plus": "प्लस", "max": "मैक्स",
    "pro": "प्रो", "advanced": "एडवांस्ड", "active": "एक्टिव",
    "total": "टोटल", "complete": "कम्प्लीट",
    "strong": "स्ट्रॉन्ग", "soft": "सॉफ्ट", "smooth": "स्मूथ",
    "gentle": "जेंटल", "intense": "इंटेंस", "deep": "डीप",
    "rich": "रिच", "light": "लाइट", "bright": "ब्राइट",
    "nourishing": "नरिशिंग", "moisturizing": "मॉइस्चराइज़िंग",
    "whitening": "व्हाइटनिंग", "fairness": "फेयरनेस",
    "glow": "ग्लो", "shine": "शाइन", "silky": "सिल्की",
    "long lasting": "लॉन्ग लास्टिंग", "instant": "इंस्टेंट",
    "daily": "डेली", "regular": "रेगुलर",
    "special": "स्पेशल", "magic": "मैजिक",
    "new": "न्यू", "improved": "इम्प्रूव्ड",
    // ─── Body Parts / Targets ───
    "hair": "बाल", "skin": "त्वचा", "face": "चेहरा",
    "body": "बॉडी", "hand": "हाथ", "foot": "पैर",
    "lip": "होंठ", "lips": "होंठ", "eye": "आँख", "eyes": "आँखें",
    "teeth": "दांत", "tooth": "दांत", "gums": "मसूड़े",
    "nail": "नाखून", "nails": "नाखून",
    // ─── Common English Words ───
    "baby": "बेबी", "kids": "किड्स", "child": "चाइल्ड",
    "men": "मेन्स", "women": "वूमेन्स", "family": "फैमिली",
    "pack": "पैक", "combo": "कॉम्बो", "set": "सेट",
    "bottle": "बोतल", "jar": "जार", "tube": "ट्यूब",
    "pouch": "पाउच", "sachet": "सैशे", "box": "बॉक्स",
    "can": "कैन", "tin": "टिन", "carton": "कार्टन",
    "spray": "स्प्रे", "stick": "स्टिक", "roll on": "रोल ऑन",
    "with": "विथ", "and": "एंड", "for": "फॉर", "of": "ऑफ",
    "free": "फ्री", "offer": "ऑफर", "gift": "गिफ्ट",
    "room": "रूम", "kitchen": "किचन", "bathroom": "बाथरूम",
    "wash": "वॉश", "care": "केयर", "protection": "प्रोटेक्शन",
    "repair": "रिपेयर", "control": "कंट्रोल", "defence": "डिफेन्स",
    "germ": "जर्म", "germs": "जर्म्स", "bacteria": "बैक्टीरिया",
    "vitamins": "विटामिन", "vitamin": "विटामिन",
    "protein": "प्रोटीन", "calcium": "कैल्शियम", "iron": "आयरन",
    "zinc": "ज़िंक", "minerals": "मिनरल्स",
    "products": "प्रोडक्ट्स", "product": "प्रोडक्ट",
    "pcs": "पीस", "piece": "पीस", "pieces": "पीस",
    // ─── Spices ───
    "turmeric": "हल्दी", "coriander": "धनिया",
    "cumin": "जीरा", "chili": "मिर्च", "pepper": "काली मिर्च",
    "cardamom": "इलायची", "clove": "लौंग",
    "cinnamon": "दालचीनी", "fennel": "सौंफ",
    "fenugreek": "मेथी", "bay leaf": "तेज पत्ता",
    "ginger": "अदरक", "garlic": "लहसुन",
    "ajwain": "अजवाइन", "hing": "हींग", "asafoetida": "हींग",
    "saffron": "केसर", "nutmeg": "जायफल",
    // ─── Fruits and Flavors ───
    "lemon": "नींबू", "lime": "नीम्बू", "mango": "आम",
    "apple": "सेब", "strawberry": "स्ट्रॉबेरी",
    "banana": "केला", "grape": "अंगूर", "pineapple": "अनानास",
    "coconut": "नारियल", "almond": "बादाम", "cashew": "काजू",
    "walnut": "अखरोट", "pistachio": "पिस्ता", "raisin": "किशमिश",
    "rose": "गुलाब", "lavender": "लैवेंडर", "sandalwood": "चंदन",
    "neem": "नीम", "tulsi": "तुलसी", "amla": "आंवला",
    "vanilla": "वनीला", "chocolate": "चॉकलेट",
    "mint": "पुदीना", "menthol": "मेंथोल",

    // ══════════════════════════════════════════════════════════════
    // ─── SIZES & MEASUREMENTS ───
    // ══════════════════════════════════════════════════════════════
    "10g": "10g", "20g": "20g", "30g": "30g", "40g": "40g", "50g": "50g",
    "75g": "75g", "80g": "80g", "100g": "100g", "125g": "125g",
    "150g": "150g", "200g": "200g", "250g": "250g",
    "300g": "300g", "400g": "400g", "500g": "500g",
    "750g": "750g", "1kg": "1kg", "2kg": "2kg", "5kg": "5kg", "10kg": "10kg",
    "10ml": "10ml", "15ml": "15ml", "20ml": "20ml", "25ml": "25ml",
    "30ml": "30ml", "40ml": "40ml", "50ml": "50ml", "60ml": "60ml",
    "75ml": "75ml", "100ml": "100ml", "125ml": "125ml", "150ml": "150ml",
    "175ml": "175ml", "200ml": "200ml", "225ml": "225ml", "250ml": "250ml",
    "300ml": "300ml", "340ml": "340ml", "400ml": "400ml", "450ml": "450ml",
    "500ml": "500ml", "680ml": "680ml", "750ml": "750ml",
    "1l": "1 लीटर", "1 litre": "1 लीटर", "2l": "2 लीटर", "5l": "5 लीटर",
    "pack of 3": "3 का पैक", "pack of 6": "6 का पैक",
    "pack of 4": "4 का पैक", "pack of 12": "12 का पैक",
    "single": "सिंगल", "double": "डबल", "triple": "ट्रिपल",
    "small": "स्मॉल", "medium": "मीडियम", "large": "लार्ज",
    "big": "बड़ा", "jumbo": "जंबो", "family pack": "फैमिली पैक",
    "value pack": "वैल्यू पैक", "economy": "इकॉनमी",
    "cp": "कॉम्बो पैक", "mf": "एमएफ",
    "id": "आईडी", "quist": "क्विस्ट",
  };

  // ===================================================================
  // AUTO-TRANSLATE & TRANSLITERATION FALLBACK
  // ===================================================================
  const TRANSLIT_MAP = {
    vowelsStart: { "aa": "आ", "a": "अ", "ee": "ई", "ii": "ई", "i": "इ", "oo": "ऊ", "uu": "ऊ", "u": "उ", "ai": "ऐ", "au": "औ", "ou": "औ", "e": "ए", "o": "ओ" },
    vowelsMatra: { "aa": "ा", "a": "", "ee": "ी", "ii": "ी", "i": "ि", "oo": "ू", "uu": "ू", "u": "ु", "ai": "ै", "au": "ौ", "ou": "ौ", "e": "े", "o": "ो" },
    consonants: {
      "ksh": "क्ष", "tra": "त्र", "gya": "ज्ञ", "shr": "श्र", "chh": "छ",
      "bh": "भ", "ch": "च", "dh": "ध", "gh": "घ", "jh": "झ", "kh": "ख", "ph": "फ", "sh": "श", "th": "थ", "zh": "झ",
      "b": "ब", "c": "क", "d": "ड", "f": "फ", "g": "ग", "h": "ह", "j": "ज", "k": "क", "l": "ल", "m": "म", 
      "n": "न", "p": "प", "q": "क", "r": "र", "s": "स", "t": "ट", "v": "व", "w": "व", "x": "क्स", "y": "य", "z": "ज़"
    }
  };

  function transliterateWord(word) {
    if (!word || !/^[a-zA-Z]+$/.test(word)) return word; 
    let result = "";
    word = word.toLowerCase();
    
    let i = 0;
    let isStart = true;
    let lastWasConsonant = false;
    
    while (i < word.length) {
      let matched = false;
      
      // Check for 3-letter consonant
      if (!matched && i + 2 < word.length && TRANSLIT_MAP.consonants[word.substr(i, 3)]) {
        if (lastWasConsonant) result += "्"; // Halant for conjuncts
        result += TRANSLIT_MAP.consonants[word.substr(i, 3)];
        isStart = false; lastWasConsonant = true; i += 3; matched = true;
      }
      // Check for 2-letter consonant
      if (!matched && i + 1 < word.length && TRANSLIT_MAP.consonants[word.substr(i, 2)]) {
        if (lastWasConsonant) result += "्";
        result += TRANSLIT_MAP.consonants[word.substr(i, 2)];
        isStart = false; lastWasConsonant = true; i += 2; matched = true;
      }
      // Check for 1-letter consonant
      if (!matched && TRANSLIT_MAP.consonants[word[i]]) {
        if (lastWasConsonant) result += "्";
        result += TRANSLIT_MAP.consonants[word[i]];
        isStart = false; lastWasConsonant = true; i += 1; matched = true;
      }
      
      // Check for 2-letter vowel
      if (!matched && i + 1 < word.length) {
        let chunk = word.substr(i, 2);
        let map = isStart ? TRANSLIT_MAP.vowelsStart : TRANSLIT_MAP.vowelsMatra;
        if (map[chunk] !== undefined) {
          result += map[chunk];
          isStart = true; lastWasConsonant = false; i += 2; matched = true;
        }
      }
      // Check for 1-letter vowel
      if (!matched) {
        let chunk = word[i];
        let map = isStart ? TRANSLIT_MAP.vowelsStart : TRANSLIT_MAP.vowelsMatra;
        if (map[chunk] !== undefined) {
          result += map[chunk];
          isStart = true; lastWasConsonant = false; i += 1; matched = true;
        }
      }
      
      if (!matched) {
        result += word[i];
        i++;
      }
    }
    
    // Remove trailing halants 
    if (result.endsWith("्")) result = result.slice(0, -1);
    
    return result;
  }

  function autoTranslateToHindi(englishName) {
    if (!englishName || englishName.trim().length < 2) return "";
    let result = englishName.trim();
    
    // 1) Replace perfectly matched known dictionary phrases/words
    const sortedKeys = Object.keys(HINDI_DICTIONARY).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      // Use regex with word boundaries to avoid accidentally replacing substrings like "amla" in "gamla"
      const regex = new RegExp("\\b" + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", 'gi');
      result = result.replace(regex, HINDI_DICTIONARY[key]);
    }

    // 2) Fallback to phonetics for remaining english alphabets
    let finalWords = [];
    result.split(/\s+/).forEach(word => {
      // If the word contains english letters, transliterate it!
      if (/[a-zA-Z]/.test(word)) {
        // Strip numbers/symbols around it if needed, or transliterate the alphabetic part
        let transliterated = word.replace(/[a-zA-Z]+/g, match => transliterateWord(match));
        finalWords.push(transliterated);
      } else {
        finalWords.push(word);
      }
    });

    return finalWords.join(" ");
  }

  function generateImageFilename(productName, source) {
    if (!productName) return "product_image.png";
    let slug = productName.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s-]+/g, '_')
      .replace(/^_+|_+$/g, '');
    if (!slug) slug = "product_" + Date.now();
    
    let ext = ".png";
    if (source && source.startsWith("data:image/")) {
      const match = source.match(/data:image\/(\w+);base64/);
      if (match) ext = "." + match[1].replace("jpeg", "jpg");
    } else if (source && source.startsWith("http")) {
      try {
        const url = new URL(source);
        const pathExt = url.pathname.split('.').pop();
        if (pathExt && pathExt.length <= 4 && /^[a-zA-Z0-9]+$/.test(pathExt)) {
          ext = "." + pathExt.toLowerCase().replace("jpeg", "jpg");
        }
      } catch(e) {}
    }
    return slug + ext;
  }

  // ===================================================================
  // FMCG IMAGE FETCH
  // ===================================================================
  async function simulateFMCGImageFetch(productName) {
    if (!productName || productName.trim().length < 3) {
      throw new Error("Product name too short. Enter at least 3 characters.");
    }
    const query = productName.toLowerCase().trim();

    // 1. Live Fetch via Electron
    if (typeof window.electronAPI !== "undefined" && window.electronAPI.fetchImageOnline) {
      try {
        const liveImageUrl = await window.electronAPI.fetchImageOnline(productName);
        if (liveImageUrl) {
          return { success: true, imageUrl: liveImageUrl, source: "Live Web Search", confidence: "High" };
        }
      } catch (err) {
        console.warn("Live fetch failed, trying local DB...", err);
      }
    }

    // 2. Local Database Fallback (dynamic)
    return new Promise((resolve, reject) => {
      const delay = 300 + Math.random() * 700;
      setTimeout(() => {
        const bestMatch = findBestImageMatch(query);
        if (bestMatch) {
          resolve({
            success: true, imageUrl: bestMatch,
            source: "Local Media Library", confidence: "High"
          });
        } else {
          reject(new Error(`No image found for "${productName}". Try a known FMCG brand or use Global Fetch.`));
        }
      }, delay);
    });
  }


  // ===================================================================
  // INITIALIZATION
  // ===================================================================
  async function init() {
    await loadData();
    await loadLocalLibrary(false); // Preload image cache for auto-resolving
    loadTheme();
    setupLoginParticles();

    if (sessionStorage.getItem(STORAGE_KEY_AUTH) === "true") {
      showDashboard();
    }
    bindEvents();

    if (window.electronAPI && window.electronAPI.onDeployStatus) {
      window.electronAPI.onDeployStatus((status) => {
        if (status === "deploying") {
          showToast("⏳ Syncing updates to App...", "info");
        } else if (status === "success") {
          showToast(" App successfully updated!", "success");
        } else if (status === "error") {
          showToast(" Failed to update App. Check logs.", "error");
        }
      });
    }
  }

  // ===== Image Resolver Helper =====
  function resolveProductImage(product) {
      const fallback = "images/products/grocery-blurred.png";
      const explicitImg = (product.image || "").trim();

      // 1. No image set → placeholder
      if (!explicitImg) return fallback;

      // 2. External URL or data URI → use directly
      if (explicitImg.startsWith("http") || explicitImg.startsWith("data:")) {
          return explicitImg;
      }

      // 3. Verify explicit path exists in our index
      const explicitFilename = decodeURI(explicitImg.split("/").pop()).toLowerCase();
      if (allLibraryImages.some(f => decodeURI(f.split("/").pop()).toLowerCase() === explicitFilename)) {
          return encodeURI(explicitImg);
      }

      // 4. Try matching by cleaned filename (handles old format mismatches)
      const cleanExplicit = explicitFilename.replace(/\.(png|jpe?g|gif|webp|svg)$/i, "").replace(/[-_ ]/g, "");
      const found = allLibraryImages.find(f => {
          const clean = decodeURI(f.split("/").pop()).toLowerCase().replace(/\.(png|jpe?g|gif|webp|svg)$/i, "").replace(/[-_ ]/g, "");
          return clean === cleanExplicit;
      });
      if (found) return encodeURI("images/" + found);

      // 5. Path was set but not found — still try it
      return encodeURI(explicitImg);
  }

  // ===== Data Persistence =====
  async function loadData() {
    let storedProducts = null;
    let storedCategories = null;

    // 1. Try Firebase first (cloud database)
    if (firebaseDb) {
      try {
        const [prodSnap, catSnap] = await Promise.all([
          firebaseDb.ref('products').once('value'),
          firebaseDb.ref('categories').once('value')
        ]);
        if (prodSnap.exists()) storedProducts = prodSnap.val();
        if (catSnap.exists()) storedCategories = catSnap.val();
        if (storedProducts) console.log('[Admin] Loaded ' + storedProducts.length + ' products from Firebase');
      } catch (e) {
        console.warn('[Admin] Firebase read failed:', e.message);
      }
    }

    // 2. Fallback: Electron store
    if (!storedProducts && window.electronAPI && window.electronAPI.getDbData) {
      storedProducts = await window.electronAPI.getDbData("products");
      storedCategories = await window.electronAPI.getDbData("categories");
    }
    
    // 3. Fallback: localStorage
    if (!storedProducts) {
      const lsProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (lsProducts) storedProducts = JSON.parse(lsProducts);
    }
    if (!storedCategories) {
      const lsCats = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (lsCats) storedCategories = JSON.parse(lsCats);
    }

    if (storedProducts) {
      products = storedProducts;
      if (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS)) {
        let added = false;
        PRODUCTS.forEach(p => {
          if (!products.find(ap => ap.id === p.id)) {
            products.unshift(p);
            added = true;
          }
        });
        if (added) saveProducts();
      }
    } else if (typeof PRODUCTS !== "undefined") {
      products = JSON.parse(JSON.stringify(PRODUCTS));
      saveProducts();
    }

    if (storedCategories) {
      const parsedCat = storedCategories;
      
      // Merge logic: ensure newly added static CATEGORIES appear even if localstorage has old ones
      if (typeof CATEGORIES !== "undefined") {
        const staticCategories = CATEGORIES.filter(c => c.id !== "all");
        staticCategories.forEach(sc => {
          if (!parsedCat.find(pc => pc.id === sc.id)) {
            parsedCat.push(sc);
          }
        });
        parsedCat.forEach(pc => {
           const sc = staticCategories.find(s => s.id === pc.id);
           if (sc) {
              pc.nameKey = sc.nameKey;
              pc.icon = sc.icon;
              pc.isSub = sc.isSub;
              pc.parent = sc.parent;
           }
        });
      }
      categories = parsedCat;
    } else if (typeof CATEGORIES !== "undefined" && CATEGORIES.length > 0) {
      categories = JSON.parse(JSON.stringify(CATEGORIES)).filter(c => c.id !== "all");
      saveCategories();
    } else {
      categories = [];
    }
  }

  function saveProducts() {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    // Save to Firebase cloud database
    if (firebaseDb) {
      firebaseDb.ref('products').set(products)
        .then(() => console.log('[Admin] Products saved to Firebase'))
        .catch(e => console.warn('[Admin] Firebase save failed:', e.message));
    }
    if (window.electronAPI && window.electronAPI.saveDbData) {
      window.electronAPI.saveDbData("products", products);
    }
    if (window.electronAPI && window.electronAPI.saveProductsToSource) {
      window.electronAPI.saveProductsToSource(products, categories);
    }
    if (typeof window.PRODUCTS !== "undefined") { window.PRODUCTS = products; }
  }

  function saveCategories() {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    // Save to Firebase cloud database
    if (firebaseDb) {
      firebaseDb.ref('categories').set(categories)
        .then(() => console.log('[Admin] Categories saved to Firebase'))
        .catch(e => console.warn('[Admin] Firebase save failed:', e.message));
    }
    if (window.electronAPI && window.electronAPI.saveDbData) {
      window.electronAPI.saveDbData("categories", categories);
    }
    if (window.electronAPI && window.electronAPI.saveProductsToSource) {
      window.electronAPI.saveProductsToSource(products, categories);
    }
    if (typeof window.CATEGORIES !== "undefined") {
      window.CATEGORIES = [{ id: "all", nameKey: "cat_all", icon: "" }, ...categories];
    }
  }

  // ===== Theme =====
  function loadTheme() {
    const stored = localStorage.getItem(STORAGE_KEY_THEME) || "dark";
    document.documentElement.setAttribute("data-theme", stored);
    updateThemeIcon(stored);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY_THEME, next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    const btn = $("#themeToggle");
    if (btn) btn.textContent = theme === "dark" ? "Dark" : "Light";
  }

  // ===== Particles =====
  function setupLoginParticles() {
    const container = $("#loginParticles");
    if (!container) return;
    for (let i = 0; i < 25; i++) {
      const p = document.createElement("div");
      p.className = "login-particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.animationDelay = Math.random() * 7 + "s";
      p.style.animationDuration = (4 + Math.random() * 5) + "s";
      const size = 2 + Math.random() * 4;
      p.style.width = size + "px";
      p.style.height = size + "px";
      container.appendChild(p);
    }
  }

  // ===== Authentication =====
  async function handleLogin(e) {
    e.preventDefault();
    const pw = $("#adminPassword");
    const err = $("#loginError");
    
    // Hash the entered password securely
    const encoder = new TextEncoder();
    const data = encoder.encode(pw.value);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex === ADMIN_PASS_HASH) {
      sessionStorage.setItem(STORAGE_KEY_AUTH, "true");
      showDashboard();
    } else {
      err.textContent = " Incorrect password.";
      err.classList.add("shake");
      pw.value = ""; pw.focus();
      setTimeout(() => err.classList.remove("shake"), 500);
    }
  }

  function showDashboard() {
    const login = $("#loginOverlay");
    const app = $("#adminApp");
    login.style.opacity = "0";
    login.style.transform = "scale(1.05)";
    login.style.transition = "all 0.4s ease";
    setTimeout(() => {
      login.style.display = "none";
      app.style.display = "block";
      app.style.animation = "sectionIn 0.4s ease";
      renderDashboard();
      renderProductsTable();
      renderCategoriesGrid();
      populateCategoryDropdowns();
      renderBulkEditGrid();
    }, 350);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
    location.reload();
  }

  function togglePasswordVisibility() {
    const input = $("#adminPassword");
    const btn = $("#passwordToggle");
    if (input.type === "password") { input.type = "text"; btn.textContent = "Hide"; }
    else { input.type = "password"; btn.textContent = "View"; }
  }

  // ===== Navigation =====
  function switchSection(name) {
    $$(".nav-item").forEach(i => i.classList.remove("active"));
    const navBtn = $(`.nav-item[data-section="${name}"]`);
    if (navBtn) navBtn.classList.add("active");
    $$(".admin-section").forEach(s => s.classList.remove("active"));
    const section = $(`#section${capitalize(name)}`);
    if (section) section.classList.add("active");
  }

  function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }


  // ===================================================================
  // DASHBOARD
  // ===================================================================
  function renderDashboard() {
    $("#statProducts").textContent = products.length;
    $("#statCategories").textContent = categories.length;
    const avg = products.length > 0
      ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length) : 0;
    $("#statAvgPrice").textContent = `₹${avg}`;
    const lowStock = products.filter(p => p.stock <= 50).length;
    $("#statLowStock").textContent = lowStock;

    const recent = [...products].reverse().slice(0, 5);
    const tbody = $("#recentProductsBody");
    tbody.innerHTML = recent.map(p => {
      const name = typeof p.name === "object" ? p.name.en : p.name;
      const catObj = categories.find(c => c.id === p.category);
      const catName = catObj ? getCategoryDisplayName(catObj) : p.category;
      const stockClass = p.stock === 0 ? "out" : p.stock <= 50 ? "low" : "ok";
      const badge = p.badge || "none";
      const badgeLabel = p.badge || "—";
      return `<tr>
        <td><strong>${name}</strong></td>
        <td>${catName}</td>
        <td>₹${p.price}</td>
        <td><span class="table-stock ${stockClass}">${p.stock}</span></td>
        <td><span class="table-badge ${badge}">${badgeLabel}</span></td>
      </tr>`;
    }).join("");
  }


  // ===================================================================
  // PRODUCTS TABLE (LIST VIEW)
  // ===================================================================
  function renderProductsTable(filter = "all", search = "") {
    let filtered = [...products];
    if (filter !== "all") filtered = filtered.filter(p => p.category === filter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => {
        const name = typeof p.name === "object" ? p.name.en : p.name;
        return name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      });
    }

    const tbody = $("#productsTableBody");
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px; color: var(--text-muted);"> No products found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const name = typeof p.name === "object" ? p.name.en : p.name;
      const catObj = categories.find(c => c.id === p.category);
      const catName = catObj ? getCategoryDisplayName(catObj) : p.category;
      const stockClass = p.stock === 0 ? "out" : p.stock <= 50 ? "low" : "ok";
      return `<tr data-id="${p.id}">
        <td><img src="${resolveProductImage(p)}" alt="${name}" class="table-img"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect fill=%22%231c1f2e%22 width=%2240%22 height=%2240%22 rx=%226%22/><text x=%2220%22 y=%2226%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%234a5272%22></text></svg>';"></td>
        <td><strong>${name}</strong></td>
        <td>${p.brand}</td>
        <td>${catName}</td>
        <td>₹${p.price}</td>
        <td>₹${p.mrp}</td>
        <td><span class="table-stock ${stockClass}">${p.stock}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-icon edit" data-id="${p.id}" title="Edit">Edit</button>
            <button class="btn-icon delete" data-id="${p.id}" title="Delete">Delete</button>
          </div>
        </td>
      </tr>`;
    }).join("");

    tbody.querySelectorAll(".edit").forEach(btn => {
      btn.addEventListener("click", () => openEditProduct(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const p = products.find(x => x.id === id);
        if (!p) return;
        const name = typeof p.name === "object" ? p.name.en : p.name;
        openDeleteConfirm(`Delete product "${name}"?`, () => {
          products = products.filter(x => x.id !== id);
          saveProducts();
          renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
          renderDashboard();
          renderBulkEditGrid();
          showToast(`Delete Product deleted`, "success");
        });
      });
    });
  }


  // ===================================================================
  // AIRTABLE-STYLE BULK EDIT GRID
  // ===================================================================
  function renderBulkEditGrid(filter = "all", search = "") {
    let filtered = [...products];
    if (filter !== "all") filtered = filtered.filter(p => p.category === filter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => {
        const name = typeof p.name === "object" ? p.name.en : p.name;
        return name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      });
    }

    const tbody = $("#bulkEditBody");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="grid-empty">
        <div class="grid-empty-icon"></div>
        <div>No products found. Add your first product!</div>
      </td></tr>`;
      return;
    }

    const catOptions = categories.map(c => {
      const name = getCategoryDisplayName(c);
      const prefix = c.isSub ? "— " : "";
      return `<option value="${c.id}">${prefix}${c.icon} ${name}</option>`;
    }).join("");

    tbody.innerHTML = filtered.map(p => {
      const name = typeof p.name === "object" ? p.name.en : p.name;
      const isSelected = gridSelected.has(p.id);
      const stockClass = p.stock === 0 ? "out" : p.stock <= 50 ? "low" : "ok";

      return `<tr data-id="${p.id}" class="${isSelected ? 'selected' : ''}">
        <td style="text-align:center;">
          <input type="checkbox" class="grid-check grid-row-check" data-id="${p.id}" ${isSelected ? 'checked' : ''}>
        </td>
        <td>
          <img src="${resolveProductImage(p)}" alt="${name}" class="grid-img"
            onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22><rect fill=%22%231a1d2e%22 width=%2236%22 height=%2236%22 rx=%224%22/><text x=%2218%22 y=%2224%22 text-anchor=%22middle%22 font-size=%2210%22 fill=%22%234a5272%22></text></svg>';">
        </td>
        <td>
          <input type="text" class="grid-cell-edit" data-id="${p.id}" data-field="name" value="${escapeHtml(name)}">
        </td>
        <td>
          <input type="text" class="grid-cell-edit" data-id="${p.id}" data-field="brand" value="${escapeHtml(p.brand)}">
        </td>
        <td>
          <select class="grid-cell-select" data-id="${p.id}" data-field="category">
            ${catOptions.replace(`value="${p.category}"`, `value="${p.category}" selected`)}
          </select>
        </td>
        <td>
          <input type="number" class="grid-cell-edit cell-number" data-id="${p.id}" data-field="price" value="${p.price}" min="0" step="0.01">
        </td>
        <td>
          <input type="number" class="grid-cell-edit cell-number" data-id="${p.id}" data-field="mrp" value="${p.mrp}" min="0" step="0.01">
        </td>
        <td>
          <span class="grid-stock-dot ${stockClass}"></span>
          <input type="number" class="grid-cell-edit cell-number" data-id="${p.id}" data-field="stock" value="${p.stock}" min="0" style="width: 50px;">
        </td>
        <td style="text-align:center;">
          <button class="btn-icon delete grid-delete-btn" data-id="${p.id}" title="Delete">Delete</button>
        </td>
      </tr>`;
    }).join("");

    // Bind grid events
    bindGridEvents();
    updateGridSelectedUI();
  }

  function bindGridEvents() {
    const tbody = $("#bulkEditBody");
    if (!tbody) return;

    // Inline edit tracking
    tbody.querySelectorAll(".grid-cell-edit, .grid-cell-select").forEach(input => {
      input.addEventListener("change", (e) => {
        const id = parseInt(e.target.dataset.id);
        const field = e.target.dataset.field;
        let value = e.target.value;
        if (["price", "mrp", "stock"].includes(field)) value = parseFloat(value) || 0;

        if (!gridChanges[id]) gridChanges[id] = {};
        gridChanges[id][field] = value;

        // Visual indicator — mark row as changed
        const row = e.target.closest("tr");
        if (row) row.style.borderLeft = "3px solid var(--accent)";
      });
    });

    // Row selection
    tbody.querySelectorAll(".grid-row-check").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.checked) gridSelected.add(id);
        else gridSelected.delete(id);

        const row = e.target.closest("tr");
        if (row) row.classList.toggle("selected", e.target.checked);
        updateGridSelectedUI();
      });
    });

    // Row delete
    tbody.querySelectorAll(".grid-delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const p = products.find(x => x.id === id);
        if (!p) return;
        const name = typeof p.name === "object" ? p.name.en : p.name;
        openDeleteConfirm(`Delete "${name}" from catalog?`, () => {
          products = products.filter(x => x.id !== id);
          delete gridChanges[id];
          gridSelected.delete(id);
          saveProducts();
          renderBulkEditGrid($("#gridCategoryFilter").value, $("#gridSearch").value);
          renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
          renderDashboard();
          showToast("Delete Product deleted", "success");
        });
      });
    });
  }

  function updateGridSelectedUI() {
    const count = gridSelected.size;
    const countEl = $("#gridSelectedCount");
    const deleteBtn = $("#gridBulkDeleteBtn");

    if (countEl) {
      countEl.textContent = `${count} selected`;
      countEl.classList.toggle("visible", count > 0);
    }
    if (deleteBtn) {
      deleteBtn.style.display = count > 0 ? "inline-flex" : "none";
    }
  }

  function handleGridSaveAll() {
    let changeCount = 0;
    for (const [id, changes] of Object.entries(gridChanges)) {
      const product = products.find(p => p.id === parseInt(id));
      if (!product) continue;

      for (const [field, value] of Object.entries(changes)) {
        if (field === "name") {
          if (typeof product.name === "object") product.name.en = value;
          else product.name = value;
        } else if (field === "price" || field === "mrp" || field === "stock") {
          product[field] = parseFloat(value) || 0;
        } else {
          product[field] = value;
        }
        changeCount++;
      }
    }

    if (changeCount > 0) {
      saveProducts();
      gridChanges = {};
      renderBulkEditGrid($("#gridCategoryFilter").value, $("#gridSearch").value);
      renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
      renderDashboard();
      showToast(`Save Saved ${changeCount} changes across ${Object.keys(gridChanges).length || 'multiple'} products`, "success");
    } else {
      showToast("ℹ No changes to save", "warning");
    }
  }

  function handleGridBulkDelete() {
    if (gridSelected.size === 0) return;
    const count = gridSelected.size;
    openDeleteConfirm(`Delete ${count} selected product(s)?`, () => {
      products = products.filter(p => !gridSelected.has(p.id));
      gridSelected.forEach(id => delete gridChanges[id]);
      gridSelected.clear();
      saveProducts();
      renderBulkEditGrid($("#gridCategoryFilter").value, $("#gridSearch").value);
      renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
      renderDashboard();
      updateGridSelectedUI();
      showToast(`Delete Deleted ${count} products`, "success");
    });
  }

  function handleGridSelectAll(e) {
    const checked = e.target.checked;
    const tbody = $("#bulkEditBody");
    if (!tbody) return;

    tbody.querySelectorAll(".grid-row-check").forEach(cb => {
      const id = parseInt(cb.dataset.id);
      cb.checked = checked;
      if (checked) gridSelected.add(id);
      else gridSelected.delete(id);

      const row = cb.closest("tr");
      if (row) row.classList.toggle("selected", checked);
    });
    updateGridSelectedUI();
  }


  // ===================================================================
  // MAGIC FETCH ENGINE
  // ===================================================================
  function suggestSubCategory(name) {
    const q = name.toLowerCase();
    if (q.includes('oil') || q.includes('shampoo') || q.includes('hair') || q.includes('kesh') || q.includes('head')) return "Hair Care";
    if (q.includes('soap') || q.includes('wash') || q.includes('face') || q.includes('dettol') || q.includes('lux') || q.includes('dove')) return "Personal Care";
    if (q.includes('colgate') || q.includes('paste') || q.includes('teeth') || q.includes('dant') || q.includes('pepsodent')) return "Oral Care";
    if (q.includes('clean') || q.includes('wash') || q.includes('harpic') || q.includes('vim') || q.includes('lizol') || q.includes('surf')) return "Household Care";
    if (q.includes('juice') || q.includes('cola') || q.includes('water') || q.includes('coffee') || q.includes('tea') || q.includes('red bull') || q.includes('tropicana')) return "Beverages";
    if (q.includes('chips') || q.includes('chocolate') || q.includes('biscuit') || q.includes('maggi') || q.includes('noodles') || q.includes('snack') || q.includes('cadbury') || q.includes('parle')) return "Snacks";
    if (q.includes('atta') || q.includes('rice') || q.includes('dal') || q.includes('honey') || q.includes('aashirvaad') || q.includes('tata')) return "Packaged Foods";
    if (q.includes('butter') || q.includes('milk') || q.includes('ghee') || q.includes('dairy') || q.includes('amul') || q.includes('nestle')) return "Dairy";
    return "General / Uncategorized";
  }

  async function handleMagicFetch() {
    const input = $("#magicProductInput");
    const productName = input.value.trim();
    const fetchBtn = $("#magicFetchBtn");
    const spinner = $("#magicSpinner");
    const fetchIcon = $("#magicFetchIcon");
    const fetchLabel = $("#magicFetchLabel");
    const statusEl = $("#magicFetchStatus");
    const resultsArea = $("#magicResultsArea");
    const progressArea = $("#magicDiscoveryProgress");

    if (!productName || productName.length < 3) {
      statusEl.textContent = " Enter at least 3 characters.";
      statusEl.className = "fetch-status error";
      return;
    }

    // Reset UI State for fetch
    fetchBtn.disabled = true;
    fetchIcon.style.display = "none";
    spinner.style.display = "inline-block";
    fetchLabel.textContent = "Searching...";
    statusEl.textContent = "Refresh Initializing Global Magic Fetch...";
    statusEl.className = "fetch-status loading";
    resultsArea.style.display = "none";
    progressArea.style.display = "flex";
    $("#magicUseProductBtn").style.display = "none";
    $("#magicUseProductBtn").disabled = true;

    // Reset progress bars
    const sources = ['amazon', 'flipkart', 'blinkit'];
    sources.forEach(src => {
        $(`#progress-${src}`).style.width = '0%';
        $(`#status-${src}`).textContent = 'Initializing...';
    });

    try {
      // 1. Data Enrichment: Auto-translate + Suggest Category
      const hindiName = autoTranslateToHindi(productName);
      const category = suggestSubCategory(productName);
      $("#magicNameEn").textContent = productName;
      $("#magicNameHi").textContent = hindiName || "—";
      $("#magicSuggestedCat").textContent = category;

      // 2. Smart Multi-Source Search — returns different local variants per source
      const localMatches = await findAllLocalMatches(productName);

      const fetchLiveImage = async (q, srcName) => {
          // Attempt Electron real IPC scraper
          if (typeof window.electronAPI !== "undefined" && window.electronAPI.fetchImageOnline) {
             try {
                const liveUrl = await window.electronAPI.fetchImageOnline(q, srcName);
                if (liveUrl) return liveUrl;
             } catch(e) {}
          }
          // Fallback: CORS Proxy scraping via DuckDuckGo
          try {
             let siteParam = "";
             if (srcName === "amazon") siteParam = "site:amazon.in ";
             else if (srcName === "flipkart") siteParam = "site:flipkart.com ";
             else if (srcName === "blinkit") siteParam = "site:blinkit.com ";
             const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(siteParam + q + " product pack front")}`;
             const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(ddgUrl)}`;
             const req = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
             const res = await req.json();
             const html = res.contents || "";
             let match = html.match(/src="\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^"&]+)/);
             if (match) {
                let imgUrl = decodeURIComponent(match[1]);
                return imgUrl;
             }
          } catch(e) {}
          
          // Smart local fallback — each source returns a different match
          const sourceIndex = srcName === 'amazon' ? 0 : srcName === 'flipkart' ? 1 : 2;
          if (localMatches.length > sourceIndex) {
            return localMatches[sourceIndex];
          } else if (localMatches.length > 0) {
            return localMatches[0];
          }
          return null;
      };

      // Helper: Find multiple distinct local db images for a query
      async function findAllLocalMatches(name) {
        const q = name.toLowerCase().trim();
        const found = new Map(); // imageUrl → score
        
        let localDB = typeof FMCG_IMAGE_DATABASE !== 'undefined' ? { ...FMCG_IMAGE_DATABASE } : {};
        if (typeof window.electronAPI !== "undefined" && window.electronAPI.readImagesDirectory) {
            try {
                const files = await window.electronAPI.readImagesDirectory();
                files.forEach(f => {
                    let keyword = f.replace(/\.(png|jpe?g|gif|webp|svg)$/i, "").replace(/_/g, " ").toLowerCase();
                    localDB[keyword] = `images/${f}`;
                });
            } catch(e) {}
        }

        // Pass 1: exact key match
        for (const [keyword, imageUrl] of Object.entries(localDB)) {
          if (q === keyword) {
            found.set(imageUrl, (found.get(imageUrl) || 0) + 100);
          }
        }
        // Pass 2: substring match & sequence match
        const queryWords = q.split(/\s+/).filter(w => w.length > 0);
        for (const [keyword, imageUrl] of Object.entries(localDB)) {
          if (q.includes(keyword) || keyword.includes(q)) {
            found.set(imageUrl, (found.get(imageUrl) || 0) + 5000 + keyword.length);
          }
          
          const keyWords = keyword.split(/\s+/).filter(w => w.length > 0);
          // If first word matches, give it a big boost and heavily weigh 2nd/3rd words
          if (queryWords.length > 0 && keyWords.length > 0 && queryWords[0] === keyWords[0]) {
              let score = 1000; 
              for (let i = 1; i < queryWords.length; i++) {
                 if (keyWords.includes(queryWords[i])) score += 2000;
              }
              found.set(imageUrl, (found.get(imageUrl) || 0) + score);
          }
        }
        // Pass 3: individual word match
        const words = q.split(/\s+/).filter(w => w.length >= 3);
        for (const word of words) {
          for (const [keyword, imageUrl] of Object.entries(localDB)) {
            if (keyword.includes(word) || word.includes(keyword)) {
              found.set(imageUrl, (found.get(imageUrl) || 0) + Math.min(word.length, keyword.length));
            }
          }
        }
        // Sort by score descending, return up to 3 unique images
        return [...found.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(e => e[0]);
      }

      const runSourceSearch = async (srcName) => {
          const duration = 1200 + Math.random() * 800; // minimum UI duration
          let p = 0;
          $(`#status-${srcName}`).textContent = 'Searching web...';
          const interval = setInterval(() => {
              p += Math.random() * 15;
              if (p > 85) p = 85; 
              $(`#progress-${srcName}`).style.width = `${p}%`;
          }, duration / 10);
            
          const [url] = await Promise.all([
             fetchLiveImage(productName, srcName),
             new Promise(r => setTimeout(r, duration)) // ensure UI looks busy
          ]);
          
          clearInterval(interval);
          $(`#progress-${srcName}`).style.width = '100%';
          $(`#status-${srcName}`).textContent = url ? 'Extracted Yes' : 'Not Found ';
          
          return { src: srcName, url };
      };

      // Concurrently execute real fetches
      const results = await Promise.all([
          runSourceSearch('amazon'),
          runSourceSearch('flipkart'),
          runSourceSearch('blinkit')
      ]);

      // 3. Build & Show Gallery
      const validResults = results.filter(r => r.url);
      if (validResults.length === 0) {
          throw new Error("No high-quality image found for this product across all global retail sources.");
      }

      const getResolutions = (src) => {
          if(src === 'amazon') return 'HD 2000x2000 (Studio White ID)';
          if(src === 'flipkart') return '1500x1500 (Clean Object)';
          return '1000x1000 (Webp Quick Load)';
      };

      const gallery = $("#magicGallery");
      gallery.innerHTML = validResults.map(g => `
          <div class="gallery-item" data-url="${g.url}" data-src="${g.src}">
             <div class="gallery-img-wrap"><img src="${g.url}" alt="From ${g.src}" referrerpolicy="no-referrer"></div>
             <div class="gallery-info">
                 <div class="gallery-source" style="text-transform: capitalize;">${g.src}</div>
                 <div class="gallery-resolution">${getResolutions(g.src)}</div>
             </div>
          </div>
      `).join('');

      // GALLERY SELECTION → populate Quick-Save card
      gallery.querySelectorAll('.gallery-item').forEach(item => {
          item.addEventListener('click', function() {
              gallery.querySelectorAll('.gallery-item').forEach(i => i.classList.remove('selected'));
              this.classList.add('selected');

              const selectedUrl = this.dataset.url;

              // Show Quick-Save card & populate
              const qsCard = $("#magicQuickSaveCard");
              qsCard.style.display = "block";

              // Pre-fill English name from input
              const inputName = $("#magicProductInput").value.trim();
              const hindiName = autoTranslateToHindi(inputName);

              $("#mqsNameEn").value = inputName;
              $("#mqsNameHi").value = hindiName;

              // Auto-extract brand (first word capitalised)
              const brand = inputName.split(/\s+/)[0];
              const brandEl = $("#mqsBrand");
              if (brandEl && !brandEl.value) brandEl.value = brand;

              // Image preview (1:1 white bg object-fit contain)
              const previewImg = $("#mqsPreviewImg");
              const previewHint = $("#mqsPreviewHint");
              if (previewImg) {
                  previewImg.src = selectedUrl;
                  previewImg.style.display = "block";
                  if (previewHint) previewHint.style.display = "none";
              }

              // Ensure at least 1 variant row
              if ($("#mqsVariantList").children.length === 0) {
                  addMqsVariantRow();
              }

              // scroll to card
              setTimeout(() => qsCard.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
          });
      });

      // Transition UI smoothly
      setTimeout(() => {
          progressArea.style.display = "none";
          resultsArea.style.display = "block";
          statusEl.innerHTML = `&#10003; Found ${validResults.length} real product image(s) — select one below.`;
          statusEl.className = "fetch-status success";
          showToast(" Magic Fetch complete — select an image!", "success");
      }, 500);

    } catch (err) {
      statusEl.textContent = `No ${err.message}`;
      statusEl.className = "fetch-status error";
      progressArea.style.display = "none";
    } finally {
      fetchBtn.disabled = false;
      fetchIcon.style.display = "inline";
      spinner.style.display = "none";
      fetchLabel.textContent = "Magic Fetch";
    }
  }

  // ------------------------------------------------------------------
  // MQS: Add a variant row (label / price / mrp)
  // ------------------------------------------------------------------
  function addMqsVariantRow(label = "", price = "", mrp = "") {
    const list = $("#mqsVariantList");
    if (!list) return;
    const row = document.createElement("div");
    row.className = "mqs-variant-row";
    row.innerHTML = `
      <input type="text"   placeholder="Label (e.g. 50g / 6-pack)" value="${label}">
      <input type="number" placeholder="Price ₹" min="0" step="0.01" value="${price}">
      <input type="number" placeholder="MRP ₹"   min="0" step="0.01" value="${mrp}">
      <button type="button" class="mqs-remove-var" title="Remove">Close</button>
    `;
    row.querySelector(".mqs-remove-var").addEventListener("click", () => row.remove());
    list.appendChild(row);
  }

  // ------------------------------------------------------------------
  // MQS: Save product directly to localStorage → storefront instant update
  // ------------------------------------------------------------------
  async function handleMqsSave() {
    const statusEl = $("#mqsSaveStatus");
    const nameEn   = ($("#mqsNameEn").value || "").trim();
    const nameHi   = ($("#mqsNameHi").value || "").trim();
    const brand    = ($("#mqsBrand").value  || "").trim();
    const catId    = ($("#mqsCategory").value || "").trim();
    let imageUrl   = ($("#mqsPreviewImg").src || "");

    // Validation
    if (!nameEn) { statusEl.textContent = " Enter a product name."; statusEl.className = "fetch-status error"; return; }
    if (!brand)  { statusEl.textContent = " Enter a brand.";        statusEl.className = "fetch-status error"; return; }
    if (!catId || catId === "—") { statusEl.textContent = " Select a category."; statusEl.className = "fetch-status error"; return; }
    if (!imageUrl || imageUrl === window.location.href) { statusEl.textContent = " Select an image from the gallery above."; statusEl.className = "fetch-status error"; return; }

    // Commit image to local disk if needed
    if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) {
      statusEl.textContent = "Save Saving image to local disk...";
      const filename = generateImageFilename(nameEn, imageUrl);
      try {
        const res = await window.electronAPI.saveImage(imageUrl, filename);
        if (res.success) {
          imageUrl = res.path;
          const libraryPath = res.path.replace(/^images\//, "");
          if (!allLibraryImages.includes(libraryPath)) {
            allLibraryImages.unshift(libraryPath);
          }
        }
      } catch (err) {
        console.warn("Failed to save image locally, using original source.", err);
      }
    }

    // Collect variants
    const variantRows = $("#mqsVariantList").querySelectorAll(".mqs-variant-row");
    const variants = [];
    let primaryPrice = 0;
    let primaryMrp   = 0;

    variantRows.forEach(row => {
      const inputs = row.querySelectorAll("input");
      const lbl = (inputs[0].value || "").trim();
      const pr  = parseFloat(inputs[1].value) || 0;
      const mr  = parseFloat(inputs[2].value) || 0;
      if (pr > 0) {
        variants.push({ label: lbl || `₹${pr}`, price: pr, mrp: mr || pr, weight: lbl });
        if (!primaryPrice) { primaryPrice = pr; primaryMrp = mr || pr; }
      }
    });

    if (variants.length === 0) { statusEl.textContent = " Add at least one size/price variant."; statusEl.className = "fetch-status error"; return; }

    // Build product object
    const newProduct = {
      id: Date.now(),
      name: { en: nameEn, hi: nameHi || nameEn },
      brand: brand,
      category: catId,
      price: primaryPrice,
      mrp: primaryMrp,
      image: imageUrl,
      weight: variants[0].label || "—",
      sku: `MF-${Date.now().toString(36).toUpperCase()}`,
      stock: 999,
      badge: "new",
      desc: { en: `${nameEn} by ${brand}`, hi: `${nameHi || nameEn} - ${brand}` },
      variants: variants.length > 1 ? variants : []
    };

    // Push to live products array and persist
    products.unshift(newProduct);
    saveProducts();
    renderProductsTable();
    renderDashboard();

    // Record in history
    const selectedGalleryItem = $("#magicGallery").querySelector('.gallery-item.selected');
    magicHistory.unshift({
      name: nameEn,
      hindi: nameHi,
      image: imageUrl,
      source: selectedGalleryItem ? selectedGalleryItem.dataset.src : "Magic Fetch",
      timestamp: new Date().toLocaleTimeString()
    });
    if (magicHistory.length > 10) magicHistory.pop();
    renderMagicHistory();

    // Success feedback
    statusEl.innerHTML = ` <strong>${nameEn}</strong> added to Storefront under <em>${catId}</em>! Open the catalog to see it live.`;
    statusEl.className = "fetch-status success";
    showToast(` "${nameEn}" published to storefront!`, "success");

    // Reset form for next fetch
    setTimeout(() => {
      $("#magicQuickSaveCard").style.display = "none";
      $("#magicResultsArea").style.display = "none";
      $("#magicProductInput").value = "";
      $("#magicFetchStatus").textContent = "";
      $("#mqsVariantList").innerHTML = "";
      $("#mqsNameEn").value = "";
      $("#mqsNameHi").value = "";
      if ($("#mqsBrand")) $("#mqsBrand").value = "";
    }, 3000);
  }

  // ------------------------------------------------------------------
  // handleMagicUseProduct — backward-compat stub (kept for history reuse)
  // ------------------------------------------------------------------
  function handleMagicUseProduct() {
    const selected = $("#magicGallery").querySelector('.gallery-item.selected');
    if (!selected) return;
    const nameEn   = ($("#mqsNameEn").value || $("#magicNameEn").textContent || "").trim();
    const nameHi   = ($("#mqsNameHi").value || $("#magicNameHi").textContent || "").trim();
    const imageUrl = selected.dataset.url;
    const sourceName = selected.dataset.src;

    openAddProduct();
    setTimeout(() => {
      $("#pName").value = nameEn;
      $("#pNameHi").value = nameHi !== "—" ? nameHi : "";
      $("#pImage").value = imageUrl;
      showAutofitPreview(imageUrl);
      updateLivePreview();

      magicHistory.unshift({ name: nameEn, hindi: nameHi, image: imageUrl, source: sourceName, timestamp: new Date().toLocaleTimeString() });
      if (magicHistory.length > 10) magicHistory.pop();
      renderMagicHistory();
    }, 200);
  }

  function renderMagicHistory() {
    const tbody = $("#magicHistoryBody");
    if (!tbody || magicHistory.length === 0) return;

    tbody.innerHTML = magicHistory.map((item, i) => `
      <tr>
        <td><img src="${resolveProductImage(item)}" alt="${item.name}" class="table-img"></td>
        <td><strong>${item.name}</strong></td>
        <td>${item.hindi || '—'}</td>
        <td><span style="font-size: 11px; color: var(--text-muted);">${item.source}</span></td>
        <td>
          <button class="btn-icon edit magic-history-use" data-index="${i}" title="Use this product">+ </button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".magic-history-use").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.index);
        const item = magicHistory[idx];
        if (!item) return;

        openAddProduct();
        setTimeout(() => {
          $("#pName").value = item.name;
          $("#pNameHi").value = item.hindi || "";
          $("#pImage").value = item.image;
          showAutofitPreview(item.image);
          updateLivePreview();
        }, 200);
      });
    });
  }




  let expandedCategoryId = null;
  let expandedSubCategoryId = null;

  function renderCategoriesGrid() {
    const grid = $("#categoriesGrid");
    if (categories.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:60px; color: var(--text-muted);"> No categories yet.</div>`;
      return;
    }

    let mainCats = categories.filter(c => !c.isSub);
    mainCats.sort((a, b) => {
      let aSerial = typeof a.serial === 'number' ? a.serial : 9999;
      let bSerial = typeof b.serial === 'number' ? b.serial : 9999;
      return aSerial - bSerial;
    });

    let html = "";
    mainCats.forEach(cat => {
      const allSubCats = categories.filter(c => c.isSub && c.parent === cat.id);
      let count = products.filter(p => p.category === cat.id).length;
      allSubCats.forEach(sc => {
         count += products.filter(p => p.category === sc.id).length;
      });

      const isExpanded = expandedCategoryId === cat.id;

      html += `<div class="category-card" data-id="${cat.id}" style="cursor: pointer; border: ${isExpanded ? '2px solid var(--accent)' : '1px solid var(--border)'}">
        <div class="category-card-icon">${cat.icon}</div>
        <div class="category-card-info">
          <div class="category-card-name">${getCategoryDisplayName(cat)}</div>
          <div class="category-card-id">${cat.id}</div>
          <div class="category-card-count">${allSubCats.length} sub-categories, ${count} total products</div>
        </div>
        <div class="category-card-actions">
          <button class="btn-icon edit" data-id="${cat.id}" title="Edit">Edit</button>
          <button class="btn-icon delete" data-id="${cat.id}" title="Delete">Delete</button>
        </div>
      </div>`;

      if (isExpanded) {
        allSubCats.sort((a, b) => (typeof a.serial==='number'?a.serial:9999) - (typeof b.serial==='number'?b.serial:9999));
        
        let directProducts = products.filter(p => p.category === cat.id);
        let directProductsHtml = '';
        if (directProducts.length > 0) {
            directProductsHtml = `
            <div style="margin-bottom: 20px;">
                <h4 style="margin:0 0 10px 0; font-size:14px; color:var(--text-secondary);">Direct Products (${directProducts.length})</h4>
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:10px;">
                    ${directProducts.map(p => `
                        <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--bg-secondary); border-radius:4px; font-size:13px; align-items:center; border-left:2px solid var(--accent);">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <img src="${resolveProductImage(p)}" style="width:24px; height:24px; border-radius:4px; object-fit:cover;">
                                <span style="font-weight:600">${p.name.en}</span>
                            </div>
                            <span style="color:var(--text-muted); font-weight:600;">₹${p.mrp}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }
        
        let subCatsHtml = allSubCats.length === 0 ? `<div style="color:var(--text-muted); font-size:13px; margin: 10px 0;">No sub-categories yet.</div>` : 
            `<div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">` +
            allSubCats.map((sc, idx) => {
              const scProducts = products.filter(p => p.category === sc.id);
              const isScExpanded = expandedSubCategoryId === sc.id;
              const ordinal = idx + 1;
              const ordinalSuffix = ordinal === 1 ? 'st' : ordinal === 2 ? 'nd' : ordinal === 3 ? 'rd' : 'th';
              const isFirst = idx === 0;
              const isLast = idx === allSubCats.length - 1;
              
              let scHtml = `<div style="background:var(--bg-secondary); border-radius:8px; border:1px solid ${isScExpanded ? 'var(--accent)' : 'rgba(255,255,255,0.05)'}; overflow:hidden; transition: all 0.2s;">
                <div class="sub-category-row" data-sub-id="${sc.id}" style="display:flex; justify-content:space-between; align-items:center; padding:12px 15px; cursor:pointer; background:${isScExpanded ? 'rgba(255,255,255,0.05)' : 'transparent'}">
                   <div style="display:flex; align-items:center; gap:15px;">
                       <div style="display:flex; flex-direction:column; align-items:center; gap:2px; min-width:36px;">
                         <span style="background:var(--accent); color:#fff; font-size:11px; font-weight:700; padding:3px 8px; border-radius:12px; line-height:1;">#${ordinal}</span>
                         <span style="font-size:9px; color:var(--text-muted); font-weight:600;">${ordinal}${ordinalSuffix}</span>
                       </div>
                       <span style="font-size:24px;">${sc.icon}</span> 
                       <div>
                           <div style="font-weight:600; font-size:15px; display:flex; align-items:center; gap:8px;">${getCategoryDisplayName(sc)} <span style="font-size:10px; opacity:0.6;">${isScExpanded ? '▼' : '▶'}</span></div>
                           <div style="font-size:12px; color:var(--text-muted);">${scProducts.length} products | Order: ${ordinal}${ordinalSuffix} | ID: ${sc.id}</div>
                       </div>
                   </div>
                   <div style="display:flex; justify-content:flex-end; gap:4px; margin:0;">
                       <button class="btn-icon sc-move-up" data-id="${sc.id}" data-parent="${cat.id}" title="Move Up" style="background:var(--bg-primary); opacity:${isFirst ? '0.3' : '1'}; pointer-events:${isFirst ? 'none' : 'auto'}; font-size:12px;">▲</button>
                       <button class="btn-icon sc-move-down" data-id="${sc.id}" data-parent="${cat.id}" title="Move Down" style="background:var(--bg-primary); opacity:${isLast ? '0.3' : '1'}; pointer-events:${isLast ? 'none' : 'auto'}; font-size:12px;">▼</button>
                       <button class="btn-icon edit" data-id="${sc.id}" title="Edit Sub-Category" style="background:var(--bg-primary);">Edit</button>
                       <button class="btn-icon delete" data-id="${sc.id}" title="Delete Sub-Category" style="background:var(--bg-primary);">Delete</button>
                   </div>
                </div>`;
                
              if (isScExpanded) {
                 scHtml += `<div style="padding: 15px; background: rgba(0,0,0,0.2); border-top: 1px dashed rgba(255,255,255,0.1); animation: slideDown 0.2s ease-out;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
                        <h4 style="margin:0; font-size:14px; color:var(--text-muted);">Products inside ${getCategoryDisplayName(sc)}</h4>
                        <button class="btn-secondary view-products" data-id="${sc.id}" style="padding:4px 12px; font-size:11px;"> Go to Product Manager</button>
                    </div>
                    ${scProducts.length === 0 ? '<div style="font-size:13px; color:gray; padding:10px; background:var(--bg-primary); border-radius:4px;">No products found in this sub-category.</div>' : `
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:10px;">
                        ${scProducts.map(p => `
                            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--bg-primary); border-radius:4px; font-size:13px; align-items:center; border-left:2px solid var(--text-muted);">
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <img src="${resolveProductImage(p)}" style="width:24px; height:24px; border-radius:4px; object-fit:cover;">
                                    <span style="font-weight:600">${p.name.en}</span>
                                </div>
                                <span style="color:var(--accent); font-weight:600;">₹${p.mrp}</span>
                            </div>
                        `).join('')}
                    </div>`}
                 </div>`;
              }
              scHtml += `</div>`;
              return scHtml;
            }).join("") + `</div>`;

        html += `<div style="grid-column: 1/-1; background:var(--bg-tertiary); padding:20px; border-radius:8px; border-left:4px solid var(--accent); margin-bottom:15px; animation: slideDown 0.2s ease-out;">
           <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:15px;">
              <h3 style="margin:0; font-size:16px;"> ${getCategoryDisplayName(cat)} Overview</h3>
              <div style="display:flex; gap:10px;">
                  <button class="btn-secondary view-products" data-id="${cat.id}"> View Main Config</button>
                  <button class="btn-primary add-sub-cat" data-parent="${cat.id}">+  Add Sub-Category</button>
              </div>
           </div>
           ${directProductsHtml}
           <div>
               <h4 style="margin:0 0 10px 0; font-size:14px; color:var(--text-secondary);">Sub-Categories</h4>
               ${subCatsHtml}
           </div>
        </div>`;
      }
    });

    grid.innerHTML = html;

    grid.querySelectorAll(".category-card[data-id]").forEach(card => {
       card.addEventListener("click", (e) => {
          if (e.target.closest('.category-card-actions') || e.target.closest('.btn-icon')) return;
          const id = card.dataset.id;
          if (expandedCategoryId === id) {
              expandedCategoryId = null;
              expandedSubCategoryId = null;
          } else {
              expandedCategoryId = id;
              expandedSubCategoryId = null;
          }
          renderCategoriesGrid();
       });
    });

    grid.querySelectorAll(".sub-category-row").forEach(row => {
       row.addEventListener("click", (e) => {
          if (e.target.closest('.btn-icon')) return;
          const id = row.dataset.subId;
          if (expandedSubCategoryId === id) {
              expandedSubCategoryId = null;
          } else {
              expandedSubCategoryId = id;
          }
          renderCategoriesGrid();
       });
    });

    grid.querySelectorAll(".add-sub-cat").forEach(btn => {
        btn.addEventListener("click", () => {
             const parentId = btn.dataset.parent;
             openAddCategory();
             setTimeout(() => {
                 const parentDropdown = $("#cParent");
                 if(parentDropdown) parentDropdown.value = parentId;
             }, 50);
        });
    });

    grid.querySelectorAll(".view-products").forEach(btn => {
        btn.addEventListener("click", () => {
            switchSection('products');
            const filter = $("#productCategoryFilter");
            if (filter) {
               filter.value = btn.dataset.id;
               filter.dispatchEvent(new Event('change'));
            }
        });
    });

    grid.querySelectorAll(".edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openEditCategory(btn.dataset.id);
      });
    });

    grid.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const cat = categories.find(c => c.id === id);
        if (!cat) return;
        const directCount = products.filter(p => p.category === id).length;
        const childSubs = categories.filter(c => c.isSub && c.parent === id);
        let childProductCount = 0;
        childSubs.forEach(sc => { childProductCount += products.filter(p => p.category === sc.id).length; });
        const totalCount = directCount + childProductCount;

        let msg;
        if (cat.isSub) {
          msg = directCount > 0
            ? `Delete sub-category "${getCategoryDisplayName(cat)}"? ${directCount} product(s) will become uncategorized.`
            : `Delete sub-category "${getCategoryDisplayName(cat)}"?`;
        } else {
          msg = `Delete "${getCategoryDisplayName(cat)}"?`;
          if (childSubs.length > 0) msg += ` This will also remove ${childSubs.length} sub-category(ies).`;
          if (totalCount > 0) msg += ` ${totalCount} product(s) will become uncategorized.`;
        }

        openDeleteConfirm(msg, () => {
          if (!cat.isSub) {
            // Also remove all child sub-categories
            const childIds = childSubs.map(sc => sc.id);
            categories = categories.filter(c => c.id !== id && !childIds.includes(c.id));
          } else {
            categories = categories.filter(c => c.id !== id);
          }
          // Re-normalize serial numbers for remaining siblings
          if (cat.isSub && cat.parent) {
            const siblings = categories.filter(c => c.isSub && c.parent === cat.parent)
              .sort((a, b) => (a.serial || 9999) - (b.serial || 9999));
            siblings.forEach((sc, i) => { sc.serial = i + 1; });
          }
          saveCategories(); renderCategoriesGrid(); populateCategoryDropdowns();
          renderDashboard();
          showToast("Delete Category deleted", "success");
        });
      });
    });

    // ── Sub-Category Reorder: Move Up / Down ──
    grid.querySelectorAll(".sc-move-up").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        reorderSubCategory(btn.dataset.id, btn.dataset.parent, -1);
      });
    });
    grid.querySelectorAll(".sc-move-down").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        reorderSubCategory(btn.dataset.id, btn.dataset.parent, 1);
      });
    });
  }

  // Swap serial numbers of a sub-category with its neighbor
  function reorderSubCategory(subId, parentId, direction) {
    const siblings = categories.filter(c => c.isSub && c.parent === parentId)
      .sort((a, b) => (a.serial || 9999) - (b.serial || 9999));
    
    // Normalize serials first
    siblings.forEach((sc, i) => { sc.serial = i + 1; });

    const idx = siblings.findIndex(sc => sc.id === subId);
    if (idx < 0) return;
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= siblings.length) return;

    // Swap serials
    const temp = siblings[idx].serial;
    siblings[idx].serial = siblings[swapIdx].serial;
    siblings[swapIdx].serial = temp;

    saveCategories();
    renderCategoriesGrid();
    populateCategoryDropdowns();
    showToast(`Refresh Moved ${getCategoryDisplayName(categories.find(c => c.id === subId))} ${direction < 0 ? 'up' : 'down'}`, "success");
  }

  function getCategoryDisplayName(cat) {
    if (typeof I18N !== "undefined" && cat.nameKey) {
      const translated = I18N.t(cat.nameKey);
      if (translated !== cat.nameKey) return translated;
    }
    if (cat.nameEn) return cat.nameEn;
    return cat.id.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }

  function populateCategoryDropdowns() {
    const mainCategories = categories.filter(c => !c.isSub);
    const pCatSelect = $("#pCategory");
    if(pCatSelect && pCatSelect.tagName === 'SELECT') {
      pCatSelect.innerHTML = `<option value="">Select Category</option>` + mainCategories.map(cat => {
        const name = getCategoryDisplayName(cat);
        return `<option value="${cat.id}">${cat.icon} ${name}</option>`;
      }).join("");

      pCatSelect.removeEventListener('change', updateSubCategoryDropdown);
      pCatSelect.addEventListener('change', updateSubCategoryDropdown);
    }

    // Product filter
    const filterSelect = $("#productCategoryFilter");
    if(filterSelect) {
      filterSelect.innerHTML = `<option value="all">All Categories</option>` +
        categories.map(cat => {
          const name = getCategoryDisplayName(cat);
          const prefix = cat.isSub ? "&nbsp;&nbsp;— " : "";
          return `<option value="${cat.id}">${prefix}${cat.icon} ${name}</option>`;
        }).join("");
    }

    // Grid filter
    const gridFilter = $("#gridCategoryFilter");
    if (gridFilter) {
      gridFilter.innerHTML = `<option value="all">All Categories</option>` +
        categories.map(cat => {
          const name = getCategoryDisplayName(cat);
          const prefix = cat.isSub ? "— " : "";
          return `<option value="${cat.id}">${prefix}${cat.icon} ${name}</option>`;
        }).join("");
    }

    // Also sync the Magic Quick-Save category dropdown
    populateMqsCategoryDropdown();
  }

  function populateMqsCategoryDropdown() {
    const sel = $("#mqsCategory");
    if (!sel) return;
    // Show all categories (main + sub) in the MQS dropdown with hierarchy prefixes
    sel.innerHTML = `<option value="">— Select Category —</option>` +
      categories.map(cat => {
        const name = getCategoryDisplayName(cat);
        const prefix = cat.isSub ? "  › " : "";
        return `<option value="${cat.id}">${prefix}${name}</option>`;
      }).join("");
  }

  function updateSubCategoryDropdown() {
    const pSubCatSelect = $("#pSubCategory");
    if(!pSubCatSelect) return;
    
    const parentId = $("#pCategory").value;
    const subs = categories.filter(c => c.isSub && c.parent === parentId);
    
    if(subs.length === 0) {
      pSubCatSelect.innerHTML = `<option value="">No sub-categories</option>`;
      pSubCatSelect.disabled = true;
    } else {
      pSubCatSelect.innerHTML = `<option value="">Select Sub-Category</option>` + subs.map(cat => {
        const name = getCategoryDisplayName(cat);
        return `<option value="${cat.id}">${cat.icon} ${name}</option>`;
      }).join("");
      pSubCatSelect.disabled = false;
    }
  }


  // ===================================================================
  // PRODUCT FORM
  // ===================================================================
  function openAddProduct() {
    clearProductForm();
    $("#productFormTitle").textContent = "+  Add New Product";
    $("#productFormSubmit").textContent = " Save Product";
    $("#editProductId").value = "";
    currentVariants = [];
    renderVariantList();
    resetLivePreview();

    // Reset library
    $("#localLibrarySection").style.display = "none";
    loadLocalLibrary();

    openModal("productModalOverlay");
  }

  function openEditProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    clearProductForm();
    $("#productFormTitle").textContent = "Edit Edit Product";
    $("#productFormSubmit").textContent = "Save Update Product";
    $("#editProductId").value = id;

    // Reset library
    $("#localLibrarySection").style.display = "none";
    loadLocalLibrary();

    $("#pName").value = typeof product.name === "object" ? product.name.en : product.name;
    $("#pNameHi").value = typeof product.name === "object" ? (product.name.hi || "") : "";
    $("#pBrand").value = product.brand;
    
    const catObj = categories.find(c => c.id === product.category);
    if (catObj && catObj.isSub) {
      $("#pCategory").value = catObj.parent || "";
      const parentCat = categories.find(c => c.id === catObj.parent);
      if ($("#pCategorySearch")) $("#pCategorySearch").value = parentCat ? getCategoryDisplayName(parentCat) : "";
      updateSubCategoryDropdown();
      $("#pSubCategory").value = product.category;
    } else {
      $("#pCategory").value = product.category || "";
      const mainCat = categories.find(c => c.id === product.category);
      if ($("#pCategorySearch")) $("#pCategorySearch").value = mainCat ? getCategoryDisplayName(mainCat) : "";
      updateSubCategoryDropdown();
      $("#pSubCategory").value = "";
    }

    $("#pPrice").value = product.price;
    $("#pMrp").value = product.mrp;
    $("#pStock").value = product.stock;
    $("#pWeight").value = product.weight;
    $("#pSku").value = product.sku;
    $("#pImage").value = product.image;
    $("#pBadge").value = product.badge || "";
    $("#pDesc").value = typeof product.desc === "object" ? (product.desc.en || "") : (product.desc || "");
    $("#pDescHi").value = typeof product.desc === "object" ? (product.desc.hi || "") : "";

    currentVariants = product.variants ? [...product.variants] : [];
    renderVariantList();
    showAutofitPreview(product.image);
    updateLivePreview();
    openModal("productModalOverlay");
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    const editId = $("#editProductId").value;
    const isEdit = editId !== "";
    
    let imageUrl = $("#pImage").value.trim();
    const nameEn = $("#pName").value.trim();

    const progressContainer = $("#saveProgressBarContainer");
    const progressFill = $("#saveProgressFill");
    const progressText = $("#saveProgressText");
    const saveBtn = $("#productFormSubmit");

    if (progressContainer) progressContainer.style.display = "block";
    if (saveBtn) saveBtn.disabled = true;

    // Commit image to local disk if needed
    if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) {
      if (progressText) progressText.textContent = " Downloading & Localizing Image...";
      if (progressFill) progressFill.style.width = "40%";
      
      const filename = generateImageFilename(nameEn, imageUrl);
      try {
        const res = await window.electronAPI.saveImage(imageUrl, filename);
        if (res.success) {
          imageUrl = res.path;
          const libraryPath = res.path.replace(/^images\//, "");
          if (!allLibraryImages.includes(libraryPath)) {
            allLibraryImages.unshift(libraryPath);
          }
        }
      } catch (err) {
        console.error("Image localization failed:", err);
      }
    }

    if (progressText) progressText.textContent = "Save Syncing Product Data...";
    if (progressFill) progressFill.style.width = "80%";

    const productData = {
      id: isEdit ? parseInt(editId) : getNextProductId(),
      name: { en: nameEn, hi: $("#pNameHi").value.trim() || nameEn },
      brand: $("#pBrand").value.trim(),
      category: $("#pSubCategory").value || $("#pCategory").value,
      image: imageUrl,
      price: parseFloat($("#pPrice").value),
      mrp: parseFloat($("#pMrp").value),
      weight: $("#pWeight").value.trim(),
      sku: $("#pSku").value.trim(),
      stock: parseInt($("#pStock").value),
      badge: $("#pBadge").value || null,
      variants: currentVariants.length > 0 ? [...currentVariants] : undefined,
      desc: { en: $("#pDesc").value.trim(), hi: $("#pDescHi").value.trim() || $("#pDesc").value.trim() }
    };

    if (isEdit) {
      const index = products.findIndex(p => p.id === productData.id);
      if (index >= 0) products[index] = productData;
      showToast(" Product updated", "success");
    } else {
      products.push(productData);
      showToast(" Product added", "success");
    }

    if (progressFill) progressFill.style.width = "100%";
    
    setTimeout(() => {
      saveProducts();
      closeModal("productModalOverlay");
      if (progressContainer) progressContainer.style.display = "none";
      if (saveBtn) saveBtn.disabled = false;
      renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
      renderBulkEditGrid($("#gridCategoryFilter").value, $("#gridSearch").value);
      renderDashboard();
    }, 500);
  }

  function getNextProductId() {
    return products.length === 0 ? 1 : Math.max(...products.map(p => p.id)) + 1;
  }

  function clearProductForm() {
    $("#productForm").reset();
    if ($("#pCategorySearch")) $("#pCategorySearch").value = "";
    if ($("#pCategory")) $("#pCategory").value = "";
    if ($("#pSubCategory")) {
      $("#pSubCategory").innerHTML = `<option value="">None</option>`;
      $("#pSubCategory").disabled = true;
    }
    $("#pSku").value = "AUTO";
    $("#pStock").value = "999";
    $("#pWeight").value = "—";
    $("#pBadge").value = "";
    $("#pDesc").value = "";
    $("#pDescHi").value = "";
    $("#autofitImg").src = "";
    $("#autofitImg").style.display = "none";
    $("#imagePreviewPlaceholder").style.display = "flex";
    $("#autofitRemove").style.display = "none";
    $("#pImage").value = "";
    $("#fetchStatus").textContent = "";
    $("#fetchStatus").className = "fetch-status";
    $("#autoTranslateStatus").style.display = "none";
    if ($("#autoFetchStatus")) $("#autoFetchStatus").style.display = "none";
    if ($("#autoSuccessStatus")) $("#autoSuccessStatus").style.display = "none";
    if ($("#autoImageSuggestions")) $("#autoImageSuggestions").style.display = "none";
    currentVariants = [];
    renderVariantList();
    resetLivePreview();
  }


  // ===================================================================
  // IMAGE FETCH (Form)
  // ===================================================================
  function handleFetchImage() {
    const nameInput = $("#pName");
    const productName = nameInput.value.trim();
    const fetchBtn = $("#fetchImageBtn");
    const spinner = $("#fetchSpinner");
    const fetchIcon = fetchBtn.querySelector(".fetch-icon");
    const fetchLabel = fetchBtn.querySelector(".fetch-label");
    const fetchStatus = $("#fetchStatus");

    if (!productName || productName.length < 3) {
      fetchStatus.textContent = " Enter at least 3 characters.";
      fetchStatus.className = "fetch-status error";
      return;
    }

    fetchBtn.disabled = true;
    fetchIcon.style.display = "none";
    spinner.style.display = "inline-block";
    fetchLabel.textContent = "Searching...";
    fetchStatus.textContent = "Refresh Searching FMCG database...";
    fetchStatus.className = "fetch-status loading";

    simulateFMCGImageFetch(productName)
      .then(async result => {
        let finalUrl = result.imageUrl;

        // Auto-save fetched image to library if it's an external URL
        if (result.source === "Live Web Search" && finalUrl.startsWith("http") && typeof window.electronAPI !== "undefined" && window.electronAPI.saveImage) {
           try {
             const safeName = productName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-") + ".jpg";
             const saveResult = await window.electronAPI.saveImage(finalUrl, "products/" + safeName);
             if (saveResult && saveResult.success) {
               finalUrl = saveResult.path;
               if (!allLibraryImages.includes("products/" + safeName)) {
                 allLibraryImages.unshift("products/" + safeName);
               }
             }
           } catch (e) {
             console.error("Failed to save fetched image:", e);
           }
        }

        $("#pImage").value = finalUrl;
        showAutofitPreview(finalUrl);
        updateLivePreview();
        fetchStatus.innerHTML = ` Image found! <strong>${result.confidence}</strong> — <em>${result.source}</em>`;
        fetchStatus.className = "fetch-status success";

        // Bounce the preview card
        const card = $("#livePreviewCard");
        card.classList.remove("bounce-in");
        void card.offsetWidth;
        card.classList.add("bounce-in");

        showToast(" Product image fetched & added to library!", "success");
      })
      .catch(err => {
        fetchStatus.textContent = ` ${err.message}`;
        fetchStatus.className = "fetch-status error";
      })
      .finally(() => {
        fetchBtn.disabled = false;
        fetchIcon.style.display = "inline";
        spinner.style.display = "none";
        fetchLabel.textContent = "Re-fetch";
      });
  }


  // ===================================================================
  // AUTO-FIT IMAGE PREVIEW
  // ===================================================================
  function showAutofitPreview(url) {
    if (!url) {
      $("#autofitImg").style.display = "none";
      $("#imagePreviewPlaceholder").style.display = "flex";
      $("#autofitRemove").style.display = "none";
      return;
    }
    const img = $("#autofitImg");
    const placeholder = $("#imagePreviewPlaceholder");
    const removeBtn = $("#autofitRemove");
    img.onload = () => { img.style.display = "block"; placeholder.style.display = "none"; removeBtn.style.display = "flex"; };
    img.onerror = (e) => { 
      console.error("Autofit Image failed to load:", url, e);
      img.style.display = "none"; 
      placeholder.style.display = "flex"; 
      removeBtn.style.display = "none"; 
    };
    img.src = url;
  }

  function removeAutofitPreview() {
    $("#autofitImg").src = "";
    $("#autofitImg").style.display = "none";
    $("#imagePreviewPlaceholder").style.display = "flex";
    $("#autofitRemove").style.display = "none";
    $("#pImage").value = "";
    updateLivePreview();
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast(" File too large! Max 5MB.", "error"); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      let finalUrl = dataUrl;

      // Auto-save to local library if running in Electron
      if (typeof window.electronAPI !== "undefined" && window.electronAPI.saveImage) {
        try {
          const result = await window.electronAPI.saveImage(dataUrl, "products/" + file.name);
          if (result && result.success) {
            finalUrl = result.path; // e.g., "images/products/filename.png"
            if (!allLibraryImages.includes("products/" + file.name)) {
              allLibraryImages.unshift("products/" + file.name);
            }
          }
        } catch (err) {
          console.error("Failed to save image to library:", err);
        }
      }

      $("#pImage").value = finalUrl;
      showAutofitPreview(finalUrl);
      updateLivePreview();
      showToast(" Image uploaded & added to library!", "success");
    };
    reader.readAsDataURL(file);
  }

  // ===================================================================
  // LOCAL IMAGE LIBRARY
  // ===================================================================
  let allLibraryImages = (typeof IMAGE_INDEX !== "undefined") ? [...IMAGE_INDEX] : [];

  async function loadLocalLibrary(renderGrid = true) {
    try {
      // Try Electron API first for live filesystem data
      if (typeof window.electronAPI !== "undefined" && window.electronAPI.readImagesDirectory) {
        const files = await window.electronAPI.readImagesDirectory();
        if (files && files.length > 0) {
          // In Electron, completely replace the static list with the live filesystem
          // to instantly reflect both new additions and deletions.
          allLibraryImages = files;
        }
      }
      // If still empty, IMAGE_INDEX was already loaded above
      if (renderGrid) renderLibraryGrid();
    } catch (err) {
      console.error("Library load failed (using static index)", err);
      // allLibraryImages already has IMAGE_INDEX data, so search still works
      if (renderGrid) renderLibraryGrid();
    }
  }
  loadLocalLibrary(false);

  // ===================================================================
  // AUTO IMAGE MATCH ENGINE
  // Fuzzy-matches a product name against all files in images/ and
  // images/products/. Returns the best path like "images/products/foo.png"
  // or null if no reasonable match is found.
  // ===================================================================
  function findBestImageMatch(productName) {
    if (!productName || productName.length < 2 || allLibraryImages.length === 0) return null;

    const query = productName.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const queryWords = query.split(/\s+/).filter(w => w.length >= 2);
    if (queryWords.length === 0) return null;

    let bestScore = 0;
    let bestFile = null;

    for (const file of allLibraryImages) {
      // Normalize filename: "products/patanjali-aloevera.png" → "patanjali aloevera"
      const baseName = file.split("/").pop()                      // remove dir prefix
        .replace(/\.(png|jpe?g|gif|webp|svg)$/i, "")              // remove extension
        .replace(/[-_]/g, " ")                                     // dashes/underscores → space
        .toLowerCase().trim();

      const fileWords = baseName.split(/\s+/).filter(w => w.length >= 2);

      // ── Scoring ──
      let score = 0;

      // 1. Exact full-string match is highest priority
      if (query === baseName || query.replace(/\s+/g, "") === baseName.replace(/\s+/g, "")) {
        score = 1000;
      } else {
        // 2. Word overlap scoring
        for (const qw of queryWords) {
          for (const fw of fileWords) {
            if (qw === fw) {
              score += 20;        // exact word match
            } else if (fw.startsWith(qw) || qw.startsWith(fw)) {
              score += 12;        // prefix match (e.g. "aloe" matches "aloevera")
            } else if (fw.includes(qw) || qw.includes(fw)) {
              score += 6;         // substring match
            }
          }
        }

        // 3. Bonus if the query matches the start of the filename
        if (baseName.startsWith(queryWords[0])) {
          score += 10;
        }

        // 4. Penalize large length difference (avoid "colgate.png" matching "coca cola chips")
        const lenDiff = Math.abs(queryWords.length - fileWords.length);
        score -= lenDiff * 2;
      }

      if (score > bestScore) {
        bestScore = score;
        bestFile = file;
      }
    }

    // Require a minimum score to avoid false positives
    // At least one full word match (score >= 20) required
    if (bestScore >= 18 && bestFile) {
      return encodeURI("images/" + bestFile);
    }
    return null;
  }

  // Returns an array of top matched images (for suggestion dropdown)
  function findTopImageMatches(productName, limit = 5) {
    if (!productName || productName.length < 2 || allLibraryImages.length === 0) return [];

    const query = productName.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const queryWords = query.split(/\s+/).filter(w => w.length >= 2);
    if (queryWords.length === 0) return [];

    const scored = [];

    for (const file of allLibraryImages) {
      const baseName = file.split("/").pop()
        .replace(/\.(png|jpe?g|gif|webp|svg)$/i, "")
        .replace(/[-_]/g, " ")
        .toLowerCase().trim();

      const fileWords = baseName.split(/\s+/).filter(w => w.length >= 2);
      let score = 0;

      if (query === baseName || query.replace(/\s+/g, "") === baseName.replace(/\s+/g, "")) {
        score = 1000;
      } else {
        for (const qw of queryWords) {
          for (const fw of fileWords) {
            if (qw === fw) score += 20;
            else if (fw.startsWith(qw) || qw.startsWith(fw)) score += 12;
            else if (fw.includes(qw) || qw.includes(fw)) score += 6;
          }
        }
        if (baseName.startsWith(queryWords[0])) score += 10;
        const lenDiff = Math.abs(queryWords.length - fileWords.length);
        score -= lenDiff * 2;
      }

      if (score >= 10) {
        scored.push({ file: encodeURI("images/" + file), score, name: baseName });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  // Renders a visual strip of matching images below the preview box
  function renderAutoImageSuggestions(productName) {
    const container = $("#autoImageSuggestions");
    const grid = $("#autoImageSuggestionsGrid");
    if (!container || !grid) return;

    const matches = findTopImageMatches(productName, 6);
    if (matches.length === 0) {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";
    grid.innerHTML = matches.map(m => `
      <div class="auto-img-suggestion" data-path="${m.file}" title="${m.name} (score: ${m.score})"
           style="flex: 0 0 60px; width:60px; height:60px; border-radius:8px; overflow:hidden;
                  border:2px solid ${$("#pImage").value === m.file ? 'var(--accent)' : 'var(--border)'};
                  cursor:pointer; background:var(--bg-secondary); transition: border-color 0.15s, transform 0.15s;">
        <img src="${m.file}" style="width:100%; height:100%; object-fit:contain; padding:4px;"
             onerror="this.parentElement.style.display='none'">
      </div>
    `).join("");

    grid.querySelectorAll(".auto-img-suggestion").forEach(item => {
      item.addEventListener("click", () => {
        const path = item.dataset.path;
        $("#pImage").value = path;
        showAutofitPreview(path);
        updateLivePreview();
        
        // Highlight selected
        grid.querySelectorAll(".auto-img-suggestion").forEach(i => i.style.borderColor = "var(--border)");
        item.style.borderColor = "var(--accent)";
        
        const autoStatus = $("#autoFetchStatus");
        if (autoStatus) {
          autoStatus.style.display = "inline-flex";
          autoStatus.textContent = " Image selected";
          autoStatus.className = "auto-badge success";
        }
        showToast(" Image auto-matched!", "success");
      });

      // Hover effect
      item.addEventListener("mouseenter", () => { item.style.transform = "scale(1.08)"; });
      item.addEventListener("mouseleave", () => { item.style.transform = "scale(1)"; });
    });
  }

  function renderLibraryGrid(filter = "") {
    const grid = $("#libraryGrid");
    if (!grid) return;
    
    const term = filter.toLowerCase();
    const filtered = allLibraryImages.filter(f => f.toLowerCase().includes(term));
    
    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 11px; padding: 20px;">No images found.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(filename => `
      <div class="library-item" data-filename="${filename}" title="${filename}">
        <img src="images/${encodeURI(filename)}" alt="${filename}">
      </div>
    `).join("");

    grid.querySelectorAll(".library-item").forEach(item => {
      item.addEventListener("click", () => {
        const path = "images/" + item.dataset.filename;
        $("#pImage").value = path;
        showAutofitPreview(path);
        updateLivePreview();
        $("#localLibrarySection").style.display = "none";
        showToast(" Selected from library", "success");
      });
    });
  }

  function setupFileUploadDragDrop() {
    const previewBox = $("#imagePreviewBox");
    if (!previewBox) return;
    ["dragenter", "dragover"].forEach(ev => {
      previewBox.addEventListener(ev, (e) => { e.preventDefault(); previewBox.classList.add("dragover"); });
    });
    ["dragleave", "drop"].forEach(ev => {
      previewBox.addEventListener(ev, (e) => { e.preventDefault(); previewBox.classList.remove("dragover"); });
    });
    previewBox.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        const fileInput = $("#pImageFile");
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        handleFileUpload({ target: fileInput });
      }
    });
  }


  // ===================================================================
  // VARIANT BUILDER
  // ===================================================================
  function addVariantRow(variant = null) {
    currentVariants.push(variant || { label: "", price: 0, mrp: 0 });
    renderVariantList();
    updateLivePreview();
  }

  function removeVariantRow(index) {
    currentVariants.splice(index, 1);
    renderVariantList();
    updateLivePreview();
  }

  function renderVariantList() {
    const list = $("#variantList");
    if (!list) return;
    if (currentVariants.length === 0) { list.innerHTML = ""; return; }
    list.innerHTML = currentVariants.map((v, i) => `
      <div class="variant-row" data-index="${i}">
        <input type="text" value="${v.label}" placeholder="Size" class="variant-label" data-index="${i}">
        <input type="number" value="${v.price || ''}" placeholder="Price ₹" class="variant-price" data-index="${i}" min="0" step="0.01">
        <input type="number" value="${v.mrp || ''}" placeholder="MRP ₹" class="variant-mrp" data-index="${i}" min="0" step="0.01">
        <button type="button" class="variant-remove" data-index="${i}" title="Remove">Close</button>
      </div>
    `).join("");

    list.querySelectorAll(".variant-label").forEach(input => {
      input.addEventListener("input", (e) => { currentVariants[parseInt(e.target.dataset.index)].label = e.target.value; updateLivePreview(); });
    });
    list.querySelectorAll(".variant-price").forEach(input => {
      input.addEventListener("input", (e) => { currentVariants[parseInt(e.target.dataset.index)].price = parseFloat(e.target.value) || 0; updateLivePreview(); });
    });
    list.querySelectorAll(".variant-mrp").forEach(input => {
      input.addEventListener("input", (e) => { currentVariants[parseInt(e.target.dataset.index)].mrp = parseFloat(e.target.value) || 0; updateLivePreview(); });
    });
    list.querySelectorAll(".variant-remove").forEach(btn => {
      btn.addEventListener("click", () => removeVariantRow(parseInt(btn.dataset.index)));
    });
  }


  // ===================================================================
  // LIVE PREVIEW CARD
  // ===================================================================
  function updateLivePreview() {
    const name = $("#pName").value.trim() || "Product Name";
    const nameHi = $("#pNameHi").value.trim() || "उत्पाद का नाम";
    const brand = $("#pBrand").value.trim() || "Brand";
    const price = parseFloat($("#pPrice").value) || 0;
    const mrp = parseFloat($("#pMrp").value) || 0;
    const stock = parseInt($("#pStock").value) || 0;
    const weight = $("#pWeight").value.trim() || "—";
    const badge = $("#pBadge").value;
    const imageUrl = $("#pImage").value.trim();

    $("#lpName").textContent = name;
    $("#lpNameHi").textContent = nameHi;
    $("#lpBrand").textContent = brand;
    $("#lpWeight").textContent = weight;

    $("#lpPrice").textContent = price > 0 ? `₹${price}` : "₹—";

    if (mrp > 0 && price > 0 && mrp > price) {
      $("#lpMrp").textContent = `₹${mrp}`;
      const disc = Math.round(((mrp - price) / mrp) * 100);
      $("#lpDiscount").textContent = `${disc}% OFF`;
      $("#lpDiscount").style.display = "inline";
    } else {
      $("#lpMrp").textContent = "";
      $("#lpDiscount").textContent = "";
      $("#lpDiscount").style.display = "none";
    }

    if (stock > 0) {
      $("#lpStock").textContent = `Stock: ${stock}`;
      $("#lpStock").style.color = stock <= 50 ? "var(--warning)" : "var(--text-muted)";
    } else {
      $("#lpStock").textContent = "Stock: —";
    }

    const badgeEl = $("#lpBadge");
    if (badge) {
      const labels = { new: "New NEW", sale: "Hot SALE", bestseller: "⭐ BEST", organic: "Bio ORGANIC" };
      badgeEl.textContent = labels[badge] || badge;
      badgeEl.className = `lp-badge ${badge}`;
      badgeEl.style.display = "block";
    } else {
      badgeEl.style.display = "none";
    }

    const lpImg = $("#lpImage");
    const lpPlaceholder = $("#lpImagePlaceholder");
    if (imageUrl) {
      lpImg.src = imageUrl;
      lpImg.style.display = "block";
      lpPlaceholder.style.display = "none";
      lpImg.onerror = () => { lpImg.style.display = "none"; lpPlaceholder.style.display = "flex"; };
    } else {
      lpImg.style.display = "none";
      lpPlaceholder.style.display = "flex";
    }

    const variantsEl = $("#lpVariants");
    if (currentVariants.length > 0) {
      variantsEl.innerHTML = currentVariants.map((v, i) => {
        const label = v.label || `Var ${i + 1}`;
        return `<span class="lp-variant-pill ${i === 0 ? 'active' : ''}">${label}</span>`;
      }).join("");
      variantsEl.style.display = "flex";
    } else {
      variantsEl.style.display = "none";
    }
  }

  function resetLivePreview() {
    $("#lpName").textContent = "Product Name";
    $("#lpNameHi").textContent = "उत्पाद का नाम";
    $("#lpBrand").textContent = "Brand";
    $("#lpWeight").textContent = "—";
    $("#lpPrice").textContent = "₹—";
    $("#lpMrp").textContent = "";
    $("#lpDiscount").textContent = "";
    $("#lpDiscount").style.display = "none";
    $("#lpStock").textContent = "Stock: —";
    $("#lpBadge").style.display = "none";
    const lpImg = $("#lpImage");
    lpImg.src = ""; lpImg.style.display = "none";
    $("#lpImagePlaceholder").style.display = "flex";
    $("#lpVariants").style.display = "none";
    $("#lpVariants").innerHTML = "";
  }


  // ===================================================================
  // CATEGORY FORM
  // ===================================================================
  function openAddCategory() {
    clearCategoryForm();
    populateParentCategoryDropdown();
    $("#categoryFormTitle").textContent = "+  Add Category";
    $("#editCategoryId").value = "";
    $("#cId").removeAttribute("readonly");
    openModal("categoryModalOverlay");
  }

  function populateParentCategoryDropdown(excludeId = null) {
    const select = $("#cParent");
    if (!select) return;
    const mainCats = categories.filter(c => !c.isSub && c.id !== excludeId);
    select.innerHTML = '<option value="">None (Main Category)</option>' + 
      mainCats.map(c => `<option value="${c.id}">${getCategoryDisplayName(c)}</option>`).join('');
  }

  function openEditCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    clearCategoryForm();
    populateParentCategoryDropdown(id);
    $("#categoryFormTitle").textContent = "Edit Edit Category";
    $("#editCategoryId").value = id;
    $("#cId").value = cat.id;
    $("#cId").setAttribute("readonly", true);
    $("#cNameEn").value = cat.nameEn || getCategoryDisplayName(cat);
    $("#cNameHi").value = cat.nameHi || "";
    $("#cIcon").value = cat.icon;
    if ($("#cSerial")) $("#cSerial").value = cat.serial || "";
    if ($("#cParent")) {
      if (cat.isSub) $("#cParent").value = cat.parent || "";
      else $("#cParent").value = "";
    }
    openModal("categoryModalOverlay");
  }

  function handleCategorySubmit(e) {
    e.preventDefault();
    const editId = $("#editCategoryId").value;
    const isEdit = editId !== "";
    const catId = $("#cId").value.trim().toLowerCase().replace(/\s+/g, "_");
    const nameEn = $("#cNameEn").value.trim();
    const nameHi = $("#cNameHi").value.trim();
    const icon = $("#cIcon").value.trim();
    const parentVal = $("#cParent") ? $("#cParent").value : "";
    const serialVal = $("#cSerial") ? $("#cSerial").value : "";
    const serial = serialVal !== "" ? parseInt(serialVal) : 9999;

    if (!catId || !nameEn || !icon) { showToast(" Fill all required fields", "error"); return; }
    if (!isEdit && categories.some(c => c.id === catId)) { showToast(" Category ID exists", "error"); return; }

    const nameKey = `cat_${catId}`;
    if (typeof I18N !== "undefined" && I18N._addTranslation) {
      I18N._addTranslation("en", nameKey, nameEn);
      if (nameHi) I18N._addTranslation("hi", nameKey, nameHi);
    }

    const categoryData = { 
      id: catId, 
      nameKey, 
      nameEn, 
      nameHi: nameHi || nameEn, 
      icon,
      serial,
      isSub: parentVal !== "",
      parent: parentVal !== "" ? parentVal : undefined
    };

    if (isEdit) {
      const idx = categories.findIndex(c => c.id === editId);
      if (idx >= 0) categories[idx] = categoryData;
      showToast(" Category updated", "success");
    } else {
      categories.push(categoryData);
      showToast(" Category added", "success");
    }

    saveCategories();
    closeModal("categoryModalOverlay");
    renderCategoriesGrid();
    populateCategoryDropdowns();
    renderDashboard();
  }

  function clearCategoryForm() { $("#categoryForm").reset(); }


  // ===================================================================
  // CATALOG PDF GENERATION (MRP ONLY)
  // ===================================================================
  function generatePdfCatalog() {
    if (!products || products.length === 0) {
      showToast(" No products to export.", "warning");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const t = (key) => key; // placeholder if i18n not fully used in admin

    // Header
    doc.setFontSize(22);
    doc.setTextColor(26, 35, 50); // --text-primary
    doc.text("NEMA Chemicals — FMCG Catalog", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | MRP-only Price List`, 105, 26, { align: 'center' });

    // Table Data
    const tableRows = [];
    const filteredProducts = products.filter(p => {
       const catFilter = $("#productCategoryFilter").value;
       const search = $("#productSearch").value.toLowerCase();
       const name = typeof p.name === "object" ? p.name.en : p.name;
       return (catFilter === "all" || p.category === catFilter) && 
              (name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search));
    });

    filteredProducts.forEach((p, index) => {
      const name = typeof p.name === "object" ? p.name.en : p.name;
      const hindi = typeof p.name === "object" ? (p.name.hi || "") : "";
      
      let mrpDisplay = "";
      if (p.variants && p.variants.length > 0) {
        mrpDisplay = p.variants.map(v => `${v.label || v.weight}: Rs. ${v.mrp}`).join("\n");
      } else {
        mrpDisplay = `Rs. ${p.mrp}`;
      }

      tableRows.push([
        index + 1,
        { content: `${name}\n${hindi}\n(${p.brand})`, styles: { fontStyle: 'bold' } },
        p.category,
        mrpDisplay
      ]);
    });

    doc.autoTable({
      startY: 35,
      head: [['#', 'Product Description', 'Category', 'MRP (Price on Pack)']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 10, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 35, halign: 'center' },
        3: { cellWidth: 50, halign: 'right', fontStyle: 'bold', fontSize: 11 }
      },
      styles: { fontSize: 9, cellPadding: 4, valign: 'middle' },
      didDrawPage: function (data) {
        // Footer
        const str = "Page " + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`NEMA_Chemicals_MRP_Catalog_${new Date().toISOString().slice(0,10)}.pdf`);
    showToast(" PDF Generated successfully!", "success");
  }


  // ===================================================================
  // BULK CSV IMPORT & EXPORT
  // ===================================================================
  function exportCatalogCsv() {
    if (!products || products.length === 0) {
      showToast(" No products to export.", "warning");
      return;
    }

    const headers = ["Name (English)", "Brand", "Category ID", "Price", "MRP", "Stock", "Image URL/Path"];
    const rows = [headers.join(",")];

    products.forEach(p => {
      const escapeCsv = (str) => {
        if (str == null) return '""';
        const s = String(str);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const nameEn = typeof p.name === "object" ? p.name.en : p.name;
      const row = [
        escapeCsv(nameEn),
        escapeCsv(p.brand),
        escapeCsv(p.category),
        p.price,
        p.mrp,
        p.stock,
        escapeCsv(p.image)
      ];
      rows.push(row.join(","));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `nema_catalog_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(" Catalog exported successfully!", "success");
  }

  function downloadCsvTemplate() {
    const csv = "data:text/csv;charset=utf-8,"
      + "Name (English),Brand,Category ID,Price,MRP,Stock,Image URL/Path\n"
      + "Colgate Strong Teeth,Colgate,personal_care,65,80,100,images/colgate_toothpaste.png\n"
      + "Tata Salt,Tata,packaged_foods,22,25,200,\n";
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "nemachemicals_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleBulkImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function (evt) {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
      if (lines.length < 2) { 
        showToast(" CSV empty or no data.", "error"); 
        e.target.value = "";
        return; 
      }

      const parseRow = (str) => {
        let arr = [], quote = false;
        for (let col = 0, c = 0; c < str.length; c++) {
          let cc = str[c], nc = str[c + 1];
          arr[col] = arr[col] || '';
          if (cc === '"' && quote && nc === '"') { arr[col] += cc; ++c; continue; }
          if (cc === '"') { quote = !quote; continue; }
          if (cc === ',' && !quote) { ++col; continue; }
          arr[col] += cc;
        }
        return arr.map(x => x.trim());
      };

      let rows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = parseRow(lines[i]);
        if (parts.length >= 6 && parts[0]) rows.push(parts);
      }
      
      if (rows.length === 0) { 
        showToast(" No valid products found.", "error"); 
        e.target.value = "";
        return; 
      }

      showToast(` Magic Fetching images for ${rows.length} products...`, "info");

      let added = 0;
      for (let i = 0; i < rows.length; i++) {
        const [nameEn, brand, category, priceStr, mrpStr, stockStr, csvImageUrl] = rows[i];
        const nameHi = autoTranslateToHindi(nameEn);
        let imageUrl = csvImageUrl || "";
        
        // If no image in CSV, use the Magic Fetch engine
        if (!imageUrl) {
          try {
            const res = await simulateFMCGImageFetch(nameEn);
            if (res && res.imageUrl) imageUrl = res.imageUrl;
          } catch (err) { console.warn(`No image found for ${nameEn}`); }
        }

        products.unshift({
          id: Date.now() + i,
          name: { en: nameEn, hi: nameHi },
          brand: brand || "Generic", 
          category: category || "uncategorized",
          image: imageUrl, 
          price: parseFloat(priceStr) || 0,
          mrp: parseFloat(mrpStr) || 0, 
          weight: "—", 
          sku: `AUTO-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          stock: parseInt(stockStr) || 0, 
          badge: "new", 
          desc: { en: "", hi: "" }
        });
        added++;
        
        // Incremental save
        if (added % 5 === 0) saveProducts();
      }

      saveProducts();
      renderDashboard();
      renderProductsTable();
      showToast(` Successfully imported ${added} products!`, "success");
      e.target.value = "";
    };
    reader.readAsText(file);
  }


  // ===================================================================
  // DELETE CONFIRMATION & MODALS
  // ===================================================================
  function openDeleteConfirm(message, callback) {
    $("#deleteModalMessage").textContent = message;
    deleteCallback = callback;
    openModal("deleteModalOverlay");
  }

  function handleDeleteConfirm() {
    if (deleteCallback) { deleteCallback(); deleteCallback = null; }
    closeModal("deleteModalOverlay");
  }

  function openModal(overlayId) {
    $(`#${overlayId}`).classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal(overlayId) {
    $(`#${overlayId}`).classList.remove("active");
    document.body.style.overflow = "";
  }


  // ===================================================================
  // TOAST
  // ===================================================================
  function showToast(message, type = "success") {
    const container = $("#adminToastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("exit");
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }


  // ===================================================================
  // UTILITY
  // ===================================================================
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }


  // ===================================================================
  // EVENT BINDINGS
  // ===================================================================
  function bindEvents() {
    // Keyboard shortcut to return to storefront
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "1") {
        e.preventDefault();
        window.location.href = "index.html";
      }
    });

    // Login
    $("#loginForm").addEventListener("submit", handleLogin);
    $("#passwordToggle").addEventListener("click", togglePasswordVisibility);

    // Logout & Theme
    $("#logoutBtn").addEventListener("click", handleLogout);
    $("#themeToggle").addEventListener("click", toggleTheme);

    // Deploy to Web
    if ($("#checkUpdateBtn")) {
      $("#checkUpdateBtn").addEventListener("click", () => {
        if (window.electronAPI && window.electronAPI.deployWebsite) {
          showToast("⏳ Preparing to update website...", "info");
          window.electronAPI.deployWebsite();
        } else {
          showToast(" Deploy feature not available in this environment.", "warning");
        }
      });
    }

    // Navigation
    $$(".nav-item").forEach(item => {
      item.addEventListener("click", () => switchSection(item.dataset.section));
    });

    // Quick actions on dashboard
    if ($("#quickAddProduct")) {
      $("#quickAddProduct").addEventListener("click", () => {
        switchSection("products");
        openAddProduct();
      });
    }
    if ($("#quickMagicFetch")) {
      $("#quickMagicFetch").addEventListener("click", () => switchSection("magic"));
    }
    if ($("#quickBulkEdit")) {
      $("#quickBulkEdit").addEventListener("click", () => switchSection("bulkEdit"));
    }

    // Products Management
    $("#addProductBtn").addEventListener("click", openAddProduct);
    if ($("#generatePdfCatalogBtn")) {
      $("#generatePdfCatalogBtn").addEventListener("click", generatePdfCatalog);
    }
    if ($("#exportCatalogCsvBtn")) {
      $("#exportCatalogCsvBtn").addEventListener("click", exportCatalogCsv);
    }
    if ($("#downloadCsvTemplateBtn")) {
      $("#downloadCsvTemplateBtn").addEventListener("click", downloadCsvTemplate);
    }
    if ($("#bulkImportCsv")) {
      $("#bulkImportCsv").addEventListener("change", handleBulkImport);
    }

    // View toggle (list/grid)
    $$(".view-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        $$(".view-toggle-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const view = btn.dataset.view;
        currentProductView = view;
        if (view === "list") {
          $("#productsListView").style.display = "block";
          $("#productsGridView").style.display = "none";
        } else {
          $("#productsListView").style.display = "none";
          $("#productsGridView").style.display = "block";
          // Render inline grid in products section
          renderProductsInlineGrid();
        }
      });
    });

    // Product Form
    $("#productForm").addEventListener("submit", handleProductSubmit);
    $("#productFormClose").addEventListener("click", () => closeModal("productModalOverlay"));
    $("#productFormCancel").addEventListener("click", () => closeModal("productModalOverlay"));

    // Image Fetch
    $("#fetchImageBtn").addEventListener("click", handleFetchImage);

    // ── AUTO-BILINGUAL + AUTO-IMAGE Global Agent on Name Input ──
    let autoNameTimeout;
    let autoImageTimeout;
    $("#pName").addEventListener("input", () => {
      updateLivePreview();
      clearTimeout(autoNameTimeout);
      clearTimeout(autoImageTimeout);
      const name = $("#pName").value.trim();
      
      if (name.length < 3) {
        $("#autoTranslateStatus").style.display = "none";
        // Hide image suggestions
        const sugBox = $("#autoImageSuggestions");
        if (sugBox) sugBox.style.display = "none";
        return;
      }

      $("#autoTranslateStatus").style.display = "inline-flex";
      $("#autoTranslateStatus").textContent = "Refresh Translating...";

      autoNameTimeout = setTimeout(() => {
        // 1) Auto-translate to Hindi (Instant)
        const hindi = autoTranslateToHindi(name);
        if (hindi && hindi !== name) {
          $("#pNameHi").value = hindi;
          $("#autoTranslateStatus").textContent = " Hindi auto-filled";
          $("#autoTranslateStatus").className = "auto-badge success";
        }
      }, 400);

      // 2) Auto-Image Match — only if no image is already set
      autoImageTimeout = setTimeout(() => {
        const currentImage = ($("#pImage").value || "").trim();
        // Skip if user already has an image set (don't overwrite manual choice)
        if (currentImage && !currentImage.startsWith("data:image/svg")) return;

        const bestMatch = findBestImageMatch(name);
        if (bestMatch) {
          $("#pImage").value = bestMatch;
          showAutofitPreview(bestMatch);
          updateLivePreview();
          
          const autoStatus = $("#autoFetchStatus");
          if (autoStatus) {
            autoStatus.style.display = "inline-flex";
            autoStatus.textContent = " Auto-matched from library";
            autoStatus.className = "auto-badge success";
          }
        }

        // Also show suggestion strip with top matches
        renderAutoImageSuggestions(name);
      }, 500);
    });

    // Manual Magic Fetch button logic
    if ($("#magicFetchBtn")) {
      $("#magicFetchBtn").addEventListener("click", async () => {
        const name = $("#pName").value.trim();
        if (name.length < 3) return showToast(" Enter at least 3 chars first", "warning");

        const btn = $("#magicFetchBtn");
        const status = $("#autoFetchStatus");
        
        btn.disabled = true;
        btn.textContent = "⏳";
        if (status) {
          status.style.display = "inline-flex";
          status.textContent = " Searching...";
          status.className = "auto-badge fetching";
        }

        try {
          const result = await simulateFMCGImageFetch(name);
          if (result && result.imageUrl) {
            $("#pImage").value = result.imageUrl;
            showAutofitPreview(result.imageUrl);
            updateLivePreview();
            
            if (status) {
              status.textContent = ` Found Photo (${result.source})`;
              status.className = "auto-badge success";
            }
            showToast(" Magic Fetch successful!", "success");
          } else {
            throw new Error("No photo found");
          }
        } catch (err) {
          if (status) {
            status.textContent = " No high-res match";
            status.className = "auto-badge warning";
          }
          showToast(" Could not find a high-quality photo.", "warning");
        } finally {
          btn.disabled = false;
          btn.textContent = "";
        }
      });
    }

    // Image URL hidden input
    $("#pImage").addEventListener("input", (e) => { showAutofitPreview(e.target.value); updateLivePreview(); });
    
    // Local Library Events
    if ($("#openLibraryBtn")) {
      $("#openLibraryBtn").addEventListener("click", () => {
        const section = $("#localLibrarySection");
        section.style.display = (section.style.display === "none") ? "block" : "none";
        if (section.style.display === "block") loadLocalLibrary();
      });
    }
    if ($("#closeLibraryBtn")) {
      $("#closeLibraryBtn").addEventListener("click", () => $("#localLibrarySection").style.display = "none");
    }
    if ($("#librarySearch")) {
      $("#librarySearch").addEventListener("input", (e) => renderLibraryGrid(e.target.value));
    }

    // File upload
    $("#pImageFile").addEventListener("change", handleFileUpload);
    setupFileUploadDragDrop();
    $("#autofitRemove").addEventListener("click", removeAutofitPreview);

    // Variants
    $("#addVariantBtn").addEventListener("click", () => addVariantRow());

    // Live preview fields
    ["pNameHi", "pBrand", "pPrice", "pMrp"].forEach(id => {
      const el = $(`#${id}`);
      if (el) el.addEventListener("input", updateLivePreview);
    });
    $("#pBadge").addEventListener("change", updateLivePreview);

    // Category
    $("#addCategoryBtn").addEventListener("click", openAddCategory);
    $("#categoryForm").addEventListener("submit", handleCategorySubmit);
    $("#categoryFormClose").addEventListener("click", () => closeModal("categoryModalOverlay"));
    $("#categoryFormCancel").addEventListener("click", () => closeModal("categoryModalOverlay"));

    // Delete modal
    $("#deleteModalClose").addEventListener("click", () => closeModal("deleteModalOverlay"));
    $("#deleteCancelBtn").addEventListener("click", () => closeModal("deleteModalOverlay"));
    $("#deleteConfirmBtn").addEventListener("click", handleDeleteConfirm);

    // Close modals on overlay click
    ["productModalOverlay", "categoryModalOverlay", "deleteModalOverlay"].forEach(id => {
      $(`#${id}`).addEventListener("click", (e) => {
        if (e.target.id === id) closeModal(id);
      });
    });

    // Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal("productModalOverlay");
        closeModal("categoryModalOverlay");
        closeModal("deleteModalOverlay");
      }
    });

    // Product Search
    let searchTimeout;
    $("#productSearch").addEventListener("input", () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
      }, 200);
    });
    $("#productCategoryFilter").addEventListener("change", () => {
      renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
    });

    // Grid Search & Filter
    let gridSearchTimeout;
    if ($("#gridSearch")) {
      $("#gridSearch").addEventListener("input", () => {
        clearTimeout(gridSearchTimeout);
        gridSearchTimeout = setTimeout(() => {
          renderBulkEditGrid($("#gridCategoryFilter").value, $("#gridSearch").value);
        }, 200);
      });
    }
    if ($("#gridCategoryFilter")) {
      $("#gridCategoryFilter").addEventListener("change", () => {
        renderBulkEditGrid($("#gridCategoryFilter").value, $("#gridSearch").value);
      });
    }

    // Grid actions
    if ($("#gridSelectAll")) {
      $("#gridSelectAll").addEventListener("change", handleGridSelectAll);
    }
    if ($("#gridSaveAllBtn")) {
      $("#gridSaveAllBtn").addEventListener("click", handleGridSaveAll);
    }
    if ($("#gridBulkDeleteBtn")) {
      $("#gridBulkDeleteBtn").addEventListener("click", handleGridBulkDelete);
    }

    // Magic Fetch
    if ($("#magicFetchBtn")) {
      $("#magicFetchBtn").addEventListener("click", handleMagicFetch);
    }
    if ($("#magicProductInput")) {
      $("#magicProductInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); handleMagicFetch(); }
      });
    }
    if ($("#magicUseProductBtn")) {
      $("#magicUseProductBtn").addEventListener("click", handleMagicUseProduct);
    }
    // MQS Quick-Save form bindings
    if ($("#mqsAddVariantBtn")) {
      $("#mqsAddVariantBtn").addEventListener("click", () => addMqsVariantRow());
    }
    if ($("#mqsSaveBtn")) {
      $("#mqsSaveBtn").addEventListener("click", handleMqsSave);
    }
    // Populate mqsCategory dropdown whenever Magic section is opened
    populateMqsCategoryDropdown();

    // ─── Electron Auto-Update Integration ───
    if (typeof window.electronAPI !== 'undefined') {
      const updateBar = document.getElementById('updateBar');
      const updateMessage = document.getElementById('updateMessage');
      const updateActionBtn = document.getElementById('updateActionBtn');
      const updateDismiss = document.getElementById('updateDismiss');
      const updateProgressBar = document.getElementById('updateProgressBar');

      const showUpdateBar = (msg, showBtn = false, progress = 0) => {
        if (!updateBar) return;
        updateMessage.textContent = msg;
        updateActionBtn.style.display = showBtn ? 'inline-block' : 'none';
        updateProgressBar.style.width = progress + '%';
        updateBar.style.top = '0';
      };

      const hideUpdateBar = () => {
        if (!updateBar) return;
        updateBar.style.top = '-60px';
      };

      window.electronAPI.onUpdateStatus((data) => {
        switch (data.status) {
          case 'checking': break;
          case 'available': showUpdateBar(`⬇ ${data.message}`, false, 0); break;
          case 'downloading': showUpdateBar(`⬇ Downloading update: ${data.percent}%`, false, data.percent); break;
          case 'downloaded': showUpdateBar(` ${data.message}`, true, 100); break;
          case 'error':
            showUpdateBar(` ${data.message}`, false, 0);
            setTimeout(hideUpdateBar, 5000);
            break;
        }
      });

      if (updateActionBtn) updateActionBtn.addEventListener('click', () => window.electronAPI.installUpdate());
      if (updateDismiss) updateDismiss.addEventListener('click', hideUpdateBar);
    }
  }

  // ===== Inline grid for Products section view toggle =====
  function renderProductsInlineGrid() {
    const container = $("#productsGridView");
    if (!container) return;

    const filter = $("#productCategoryFilter").value;
    const search = $("#productSearch").value;
    let filtered = [...products];
    if (filter !== "all") filtered = filtered.filter(p => p.category === filter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => {
        const name = typeof p.name === "object" ? p.name.en : p.name;
        return name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      });
    }

    const catOptions = categories.map(c => `<option value="${c.id}">${c.icon} ${getCategoryDisplayName(c)}</option>`).join("");

    container.innerHTML = `<div class="grid-container">
      <div class="grid-wrap">
        <table class="grid-table">
          <thead>
            <tr>
              <th class="col-image">Image</th>
              <th class="col-name">Product Name</th>
              <th class="col-brand">Brand</th>
              <th class="col-category">Category</th>
              <th class="col-price">Price (₹)</th>
              <th class="col-mrp">MRP (₹)</th>
              <th class="col-stock">Stock</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => {
              const name = typeof p.name === "object" ? p.name.en : p.name;
              const stockClass = p.stock === 0 ? "out" : p.stock <= 50 ? "low" : "ok";
              return `<tr data-id="${p.id}">
                <td><img src="${resolveProductImage(p)}" alt="${name}" class="grid-img" onerror="this.style.display='none'"></td>
                <td><input type="text" class="grid-cell-edit" value="${escapeHtml(name)}" readonly></td>
                <td><input type="text" class="grid-cell-edit" value="${escapeHtml(p.brand)}" readonly></td>
                <td style="font-size: 12px;">${categories.find(c=>c.id===p.category)?.icon || ''} ${getCategoryDisplayName(categories.find(c=>c.id===p.category)||{id:p.category})}</td>
                <td style="font-weight: 600;">₹${p.price}</td>
                <td style="color: var(--text-muted);">₹${p.mrp}</td>
                <td><span class="grid-stock-dot ${stockClass}"></span>${p.stock}</td>
                <td style="text-align:center;">
                  <button class="btn-icon edit inline-edit-btn" data-id="${p.id}">Edit</button>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>`;

    container.querySelectorAll(".inline-edit-btn").forEach(btn => {
      btn.addEventListener("click", () => openEditProduct(parseInt(btn.dataset.id)));
    });
  }


  // ===================================================================
  // BRANDS MANAGEMENT
  // ===================================================================
  const STORAGE_KEY_BRANDS = "nema_admin_brands";
  let brands = [];
  
  function saveBrands() {
    localStorage.setItem(STORAGE_KEY_BRANDS, JSON.stringify(brands));
  }

  function loadBrands() {
    const ls = localStorage.getItem(STORAGE_KEY_BRANDS);
    if (ls) brands = JSON.parse(ls);
    else {
      // Initialize from products if empty
      const uniqueBrands = [...new Set(products.map(p => p.brand))].filter(b => b);
      brands = uniqueBrands.map(name => ({ id: "brand_" + Date.now() + Math.random(), name, image: "" }));
      saveBrands();
    }
  }

  function renderBrandsGrid(search = "") {
    const grid = $("#brandsGrid");
    if (!grid) return;
    
    let filtered = brands;
    const q = search.toLowerCase();
    if (q) {
      filtered = filtered.filter(b => b.name.toLowerCase().includes(q));
    }
    
    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:60px; color: var(--text-muted);"> No brands found.</div>`;
      return;
    }
    
    grid.innerHTML = filtered.map(b => {
      const bProducts = products.filter(p => p.brand.toLowerCase() === b.name.toLowerCase());
      return `<div class="brand-card" data-id="${b.id}">
        <div class="brand-image-wrap">
          ${b.image ? `<img src="${b.image}" alt="${b.name}">` : `<span class="brand-image-placeholder">${b.name.charAt(0).toUpperCase()}</span>`}
        </div>
        <div class="brand-name">${b.name}</div>
        <div class="brand-stats">${bProducts.length} products</div>
      </div>`;
    }).join("");
    
    grid.querySelectorAll(".brand-card").forEach(card => {
      card.addEventListener("click", () => openBrandModal(card.dataset.id));
    });
  }

  // Helper: process a dropped/selected brand image file
  function handleBrandImageFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast(" Please select a valid image file.", "warning");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast(" Image too large! Max 2MB allowed.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(evt) {
      const base64 = evt.target.result; // data:image/png;base64,...
      
      // Set the hidden field
      $("#bImage").value = base64;
      
      // Update preview area
      const previewImg = $("#brandImagePreviewImg");
      previewImg.src = base64;
      previewImg.style.display = "block";
      $("#brandImagePreviewPlaceholder").style.display = "none";
      $("#brandImageRemoveBtn").style.display = "block";
      
      // Also update the header icon in the modal title
      const headerImg = $("#brandModalImg");
      headerImg.src = base64;
      headerImg.style.display = "block";
      $("#brandModalImgPlaceholder").style.display = "none";
      
      showToast(" Brand logo uploaded!", "success");
    };
    reader.readAsDataURL(file);
  }

  function openBrandModal(id) {
    const brand = brands.find(b => b.id === id);
    let isNew = !brand;
    $("#editBrandId").value = isNew ? "" : brand.id;
    $("#bName").value = isNew ? "" : brand.name;
    $("#bImage").value = isNew ? "" : (brand.image || "");
    
    $("#brandFormTitleText").textContent = isNew ? "Add New Brand" : "Edit Brand";
    const imgEL = $("#brandModalImg");
    const placeholder = $("#brandModalImgPlaceholder");
    
    if (!isNew && brand.image) {
      imgEL.src = brand.image;
      imgEL.style.display = "block";
      placeholder.style.display = "none";
    } else {
      imgEL.style.display = "none";
      placeholder.style.display = "block";
      placeholder.textContent = isNew ? "B" : brand.name.charAt(0).toUpperCase();
    }

    // Update the image upload preview area
    const previewImg = $("#brandImagePreviewImg");
    const previewPlaceholder = $("#brandImagePreviewPlaceholder");
    const removeBtn = $("#brandImageRemoveBtn");
    const fileInput = $("#brandImageFileInput");
    
    if (fileInput) fileInput.value = ""; // Reset file input
    
    if (!isNew && brand.image) {
      previewImg.src = brand.image;
      previewImg.style.display = "block";
      previewPlaceholder.style.display = "none";
      removeBtn.style.display = "block";
    } else {
      previewImg.style.display = "none";
      previewImg.src = "";
      previewPlaceholder.style.display = "block";
      removeBtn.style.display = "none";
    }
    
    if (!isNew) {
      $("#brandProductsSection").style.display = "block";
      renderBrandProductsTable(brand.name);
    } else {
      $("#brandProductsSection").style.display = "none";
    }
    
    $("#brandModalOverlay").classList.add("active");
  }

  function renderBrandProductsTable(brandName, search = "") {
    const tbody = $("#brandProductsTableBody");
    if (!tbody) return;
    const q = search.toLowerCase();
    
    const bProducts = products.filter(p => p.brand.toLowerCase() === brandName.toLowerCase() && ((typeof p.name === 'object' ? p.name.en : p.name).toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
    
    if (bProducts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No products in this brand.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = bProducts.map(p => `<tr>
      <td><img src="${p.image}" class="table-img"></td>
      <td><strong>${typeof p.name === 'object' ? p.name.en : p.name}</strong></td>
      <td>${p.category}</td>
      <td><button type="button" class="btn-danger btn-sm remove-product-brand" data-id="${p.id}" style="padding: 4px 8px; font-size: 11px;">Remove</button></td>
    </tr>`).join("");
    
    tbody.querySelectorAll(".remove-product-brand").forEach(btn => {
      btn.addEventListener("click", () => {
        const pId = parseInt(btn.dataset.id);
        const p = products.find(x => x.id === pId);
        if (p) {
           p.brand = "Unbranded";
           saveProducts();
           renderBrandProductsTable(brandName, $("#brandProductSearch").value);
           renderBrandsGrid();
        }
      });
    });
  }

  function openAssignProductModal() {
    $("#assignProductModalOverlay").classList.add("active");
    renderAssignProductsTable();
  }

  function renderAssignProductsTable(search = "") {
    const tbody = $("#assignProductsTableBody");
    const q = search.toLowerCase();
    const brandName = $("#bName").value.trim() || "";
    
    // show products NOT presently in this brand
    const available = products.filter(p => (p.brand || "Unbranded").toLowerCase() !== brandName.toLowerCase() && 
      ((typeof p.name === 'object' ? p.name.en : p.name).toLowerCase().includes(q) || (p.brand||"").toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    );
    
    if (available.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px;">No other products available.</td></tr>`;
      return;
    }
    
    tbody.innerHTML = available.map(p => `<tr>
      <td style="text-align:center;"><input type="checkbox" class="assign-product-check" data-id="${p.id}"></td>
      <td><img src="${p.image}" class="table-img"></td>
      <td>${typeof p.name === 'object' ? p.name.en : p.name}</td>
      <td>${p.brand || "Unbranded"}</td>
    </tr>`).join("");
    
    // reset select all
    $("#assignSelectAll").checked = false;
  }

  // Bind Brand Events inside init chain
  function bindBrandEvents() {
    if ($("#addBrandBtn")) {
      $("#addBrandBtn").addEventListener("click", () => openBrandModal(""));
    }
    if ($("#brandModalOverlay")) {
      $("#brandFormClose").addEventListener("click", () => $("#brandModalOverlay").classList.remove("active"));
      $("#brandFormCancel").addEventListener("click", () => $("#brandModalOverlay").classList.remove("active"));
    }

    // ── Brand Image Upload Handlers ──
    const brandFileInput = $("#brandImageFileInput");
    const brandPreviewArea = $("#brandImagePreviewArea");
    
    if (brandFileInput) {
      // File input change → read & preview
      brandFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        handleBrandImageFile(file);
      });
    }
    
    if (brandPreviewArea) {
      // Drag & Drop
      brandPreviewArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        brandPreviewArea.style.borderColor = "#2563eb";
        brandPreviewArea.style.background = "rgba(37,99,235,0.05)";
      });
      brandPreviewArea.addEventListener("dragleave", () => {
        brandPreviewArea.style.borderColor = "";
        brandPreviewArea.style.background = "";
      });
      brandPreviewArea.addEventListener("drop", (e) => {
        e.preventDefault();
        brandPreviewArea.style.borderColor = "";
        brandPreviewArea.style.background = "";
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
          handleBrandImageFile(file);
        }
      });
    }
    
    // Remove button
    if ($("#brandImageRemoveBtn")) {
      $("#brandImageRemoveBtn").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        $("#bImage").value = "";
        $("#brandImagePreviewImg").style.display = "none";
        $("#brandImagePreviewImg").src = "";
        $("#brandImagePreviewPlaceholder").style.display = "block";
        $("#brandImageRemoveBtn").style.display = "none";
        if (brandFileInput) brandFileInput.value = "";
        // Also update header preview
        $("#brandModalImg").style.display = "none";
        $("#brandModalImgPlaceholder").style.display = "block";
      });
    }
    if ($("#brandForm")) {
      $("#brandForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const id = $("#editBrandId").value;
        const name = $("#bName").value.trim();
        const image = $("#bImage").value.trim();
        
        if (!name) return;
        
        if (id) {
          const b = brands.find(x => x.id === id);
          if (b) {
            const oldName = b.name;
            b.name = name;
            b.image = image;
            
            // update products
            products.forEach(p => {
               if (p.brand.toLowerCase() === oldName.toLowerCase()) {
                  p.brand = name;
               }
            });
            saveProducts();
          }
        } else {
          brands.push({ id: "brand_" + Date.now(), name, image });
        }
        saveBrands();
        $("#brandModalOverlay").classList.remove("active");
        renderBrandsGrid();
      });
    }
    if ($("#brandSearch")) {
      $("#brandSearch").addEventListener("input", (e) => renderBrandsGrid(e.target.value));
    }
    if ($("#brandProductSearch")) {
      $("#brandProductSearch").addEventListener("input", (e) => {
        const name = $("#bName").value.trim();
        if (name) renderBrandProductsTable(name, e.target.value);
      });
    }
    if ($("#assignProductToBrandBtn")) {
      $("#assignProductToBrandBtn").addEventListener("click", (e) => {
         e.preventDefault();
         openAssignProductModal();
      });
    }
    if ($("#assignProductModalOverlay")) {
      $("#assignProductFormClose").addEventListener("click", () => $("#assignProductModalOverlay").classList.remove("active"));
      $("#assignProductCancelBtn").addEventListener("click", () => $("#assignProductModalOverlay").classList.remove("active"));
    }
    if ($("#assignProductSearch")) {
      $("#assignProductSearch").addEventListener("input", (e) => renderAssignProductsTable(e.target.value));
    }
    if ($("#assignSelectAll")) {
      $("#assignSelectAll").addEventListener("change", (e) => {
        const checked = e.target.checked;
        $$(".assign-product-check").forEach(cb => cb.checked = checked);
      });
    }
    if ($("#assignProductSaveBtn")) {
      $("#assignProductSaveBtn").addEventListener("click", () => {
        const brandName = $("#bName").value.trim();
        if (!brandName) return;
        let count = 0;
        $$(".assign-product-check:checked").forEach(cb => {
           const pId = parseInt(cb.dataset.id);
           const p = products.find(x => x.id === pId);
           if (p) { p.brand = brandName; count++; }
        });
        if (count > 0) {
          saveProducts();
          renderBrandProductsTable(brandName, $("#brandProductSearch").value);
          renderBrandsGrid();
          showToast("Products added to brand", "success");
        }
        $("#assignProductModalOverlay").classList.remove("active");
      });
    }
  }

  function setupBrandDropdown() {
    const input = $("#pBrand");
    const dropdown = $("#brandDropdownList");
    if (!input || !dropdown) return;

    const style = document.createElement("style");
    style.innerHTML = `
      .brand-dd-item { padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--border); font-size: 14px; color: var(--text); display: flex; align-items: center; gap: 8px; }
      .brand-dd-item:hover, .brand-dd-item.keyboard-focused { background: var(--bg-primary); }
      .brand-dd-item:last-child { border-bottom: none; }
      .brand-dd-img { width: 24px; height: 24px; object-fit: contain; border-radius: 4px; background: white; }
    `;
    document.head.appendChild(style);
    
    let currentFocus = -1;

    function renderDropdown(forceShowAll = false) {
      const term = input.value.trim().toLowerCase();
      let filterTerm = forceShowAll ? "" : term;
      let matches = brands.filter(b => b.name.toLowerCase().includes(filterTerm));
      
      let html = "";
      
      const exactMatch = brands.find(b => b.name.toLowerCase() === term);
      if (term && !exactMatch && !forceShowAll) {
         html += `<div class="brand-dd-item" data-action="create" data-name="${term.replace(/"/g, '&quot;')}">
                    <span style="font-size:16px;">+ </span>
                    <span>Create new brand: <strong>${term}</strong></span>
                  </div>`;
      }

      matches.forEach(b => {
         const imgSrc = b.image ? b.image : 'build/icon.png';
         html += `<div class="brand-dd-item" data-action="select" data-name="${b.name.replace(/"/g, '&quot;')}">
                    <img src="${imgSrc}" class="brand-dd-img">
                    <span>${b.name}</span>
                  </div>`;
      });

      if (!term && matches.length === 0) {
         html += `<div class="brand-dd-item" style="color:var(--text-muted); cursor:default;">No brands available. Type to create one.</div>`;
      }

      dropdown.innerHTML = html;
      dropdown.style.display = "flex";
      currentFocus = -1;

      dropdown.querySelectorAll(".brand-dd-item[data-action]").forEach(item => {
         item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            const action = item.dataset.action;
            const name = item.dataset.name;
            input.value = name;
            dropdown.style.display = "none";
            
            if (action === "create") {
               brands.push({ id: "brand_" + Date.now(), name, image: "" });
               saveBrands();
               renderBrandsGrid();
               showToast("Brand '" + name + "' created!", "success");
            }
         });
      });
    }

    input.addEventListener("focus", () => { renderDropdown(true); input.select(); });
    input.addEventListener("input", () => renderDropdown(false));
    input.addEventListener("blur", () => {
       setTimeout(() => { dropdown.style.display = "none"; }, 150);
    });
    
    input.addEventListener("keydown", (e) => {
       const items = dropdown.querySelectorAll(".brand-dd-item[data-action]");
       if (items.length === 0) return;
       
       if (e.key === "ArrowDown") {
          e.preventDefault();
          currentFocus++;
          if (currentFocus >= items.length) currentFocus = 0;
          addActive(items);
       } else if (e.key === "ArrowUp") {
          e.preventDefault();
          currentFocus--;
          if (currentFocus < 0) currentFocus = items.length - 1;
          addActive(items);
       } else if (e.key === "Enter") {
          e.preventDefault();
          if (dropdown.style.display === "flex") {
              if (currentFocus > -1) {
                 items[currentFocus].dispatchEvent(new MouseEvent('mousedown'));
              } else {
                 items[0].dispatchEvent(new MouseEvent('mousedown'));
              }
          }
       }
    });

    function addActive(items) {
       items.forEach(item => item.classList.remove("keyboard-focused"));
       items[currentFocus].classList.add("keyboard-focused");
       items[currentFocus].scrollIntoView({ block: "nearest" });
    }
  }

  function setupCategoryDropdown() {
    const input = $("#pCategorySearch");
    const hidden = $("#pCategory");
    const dropdown = $("#categoryDropdownList");
    if (!input || !hidden || !dropdown) return;

    let currentFocus = -1;

    function renderDropdown(forceShowAll = false) {
      let term = input.value.trim().toLowerCase();
      const currentCat = categories.find(c => c.id === hidden.value);
      if (currentCat && getCategoryDisplayName(currentCat).toLowerCase() === term) {
          term = ""; 
      }
      if (forceShowAll) term = "";

      const mainCategories = categories.filter(c => !c.isSub);
      
      let matches = mainCategories.filter(c => {
         const name = getCategoryDisplayName(c).toLowerCase();
         return name.includes(term);
      });
      
      let html = "";
      matches.forEach(c => {
         html += `<div class="brand-dd-item" data-action="select" data-id="${c.id}" data-name="${getCategoryDisplayName(c).replace(/"/g, '&quot;')}">
                    <span>${c.icon}</span>
                    <span>${getCategoryDisplayName(c)}</span>
                  </div>`;
      });

      if (matches.length === 0) {
         html += `<div class="brand-dd-item" style="color:var(--text-muted); cursor:default;">No categories found.</div>`;
      }

      dropdown.innerHTML = html;
      dropdown.style.display = "flex";
      currentFocus = -1;

      dropdown.querySelectorAll(".brand-dd-item[data-action]").forEach(item => {
         item.addEventListener("mousedown", (e) => {
            e.preventDefault();
            hidden.value = item.dataset.id;
            input.value = item.dataset.name;
            dropdown.style.display = "none";
            updateSubCategoryDropdown();
         });
      });
    }

    input.addEventListener("focus", () => { renderDropdown(true); input.select(); });
    input.addEventListener("input", () => renderDropdown(false));
    input.addEventListener("blur", () => {
       setTimeout(() => { 
          dropdown.style.display = "none";
          const cat = categories.find(c => c.id === hidden.value);
          if (cat) input.value = getCategoryDisplayName(cat);
          else input.value = '';
       }, 150);
    });

    input.addEventListener("keydown", (e) => {
       const items = dropdown.querySelectorAll(".brand-dd-item[data-action]");
       if (items.length === 0) return;
       
       if (e.key === "ArrowDown") {
          e.preventDefault();
          currentFocus++;
          if (currentFocus >= items.length) currentFocus = 0;
          addActive(items);
       } else if (e.key === "ArrowUp") {
          e.preventDefault();
          currentFocus--;
          if (currentFocus < 0) currentFocus = items.length - 1;
          addActive(items);
       } else if (e.key === "Enter") {
          e.preventDefault();
          if (dropdown.style.display === "flex") {
              if (currentFocus > -1) {
                 items[currentFocus].dispatchEvent(new MouseEvent('mousedown'));
              }
          }
       }
    });

    function addActive(items) {
       items.forEach(item => item.classList.remove("keyboard-focused"));
       items[currentFocus].classList.add("keyboard-focused");
       items[currentFocus].scrollIntoView({ block: "nearest" });
    }
  }

  // ===== Boot =====
  init().then(() => {
     loadBrands();
     renderBrandsGrid();
     bindBrandEvents();
     setupBrandDropdown();
     setupCategoryDropdown();
  });
})();
