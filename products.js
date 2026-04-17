// ===== Product Data Module =====
// Uses REAL product image URLs from public CDN sources for authentic FMCG catalog display.
// Architecture: Modular — each business category can be added as a new data module.
// Multi-MRP / Variant support: products with `variants` array get pill-toggle selectors.

const PRODUCTS = [
  // ─── Oral Care ───
  {
    id: 1,
    name: { en: "Colgate MaxFresh Toothpaste", hi: "कोलगेट मैक्सफ्रेश टूथपेस्ट" },
    brand: "Colgate",
    category: "personal_care",
    image: "images/colgate_toothpaste.png",
    price: 95,
    mrp: 112,
    weight: "150g",
    sku: "PC-001",
    stock: 320,
    badge: "bestseller",
    variants: [
      { label: "80g", price: 55, mrp: 65 },
      { label: "150g", price: 95, mrp: 112 },
      { label: "300g", price: 175, mrp: 210 }
    ],
    desc: {
      en: "Colgate MaxFresh toothpaste with cooling crystals for a burst of freshness. India's most trusted oral care brand.",
      hi: "कोलगेट मैक्सफ्रेश टूथपेस्ट कूलिंग क्रिस्टल के साथ ताज़गी का अहसास। भारत का सबसे भरोसेमंद ओरल केयर ब्रांड।"
    }
  },
  {
    id: 2,
    name: { en: "Pepsodent Germicheck Toothpaste", hi: "पेप्सोडेंट जर्मीचेक टूथपेस्ट" },
    brand: "Pepsodent",
    category: "personal_care",
    image: "images/pepsodent_toothpaste.png",
    price: 82,
    mrp: 99,
    weight: "200g",
    sku: "PC-002",
    stock: 250,
    badge: null,
    variants: [
      { label: "100g", price: 45, mrp: 55 },
      { label: "200g", price: 82, mrp: 99 }
    ],
    desc: {
      en: "Pepsodent Germicheck for 12-hour germ protection. Fights cavities and keeps teeth strong.",
      hi: "पेप्सोडेंट जर्मीचेक 12 घंटे की जर्म प्रोटेक्शन। कैविटी से लड़ता है और दांतों को मजबूत रखता है।"
    }
  },

  // ─── Soaps & Body Care ───
  {
    id: 3,
    name: { en: "Lux Soft Touch Bar Soap", hi: "लक्स सॉफ्ट टच बार साबुन" },
    brand: "Lux",
    category: "personal_care",
    image: "images/lux_soap.png",
    price: 42,
    mrp: 52,
    weight: "150g",
    sku: "PC-003",
    stock: 480,
    badge: "sale",
    variants: [
      { label: "75g", price: 25, mrp: 30 },
      { label: "150g", price: 42, mrp: 52 },
      { label: "150g×3", price: 115, mrp: 145 }
    ],
    desc: {
      en: "Lux Soft Touch with French Rose & Almond Oil for silky smooth skin. Luxurious bathing experience.",
      hi: "लक्स सॉफ्ट टच फ्रेंच रोज़ और बादाम तेल के साथ रेशमी मुलायम त्वचा के लिए।"
    }
  },
  {
    id: 4,
    name: { en: "Dettol Original Bar Soap", hi: "डेटॉल ओरिजिनल बार साबुन" },
    brand: "Dettol",
    category: "personal_care",
    image: "images/dettol_soap.png",
    price: 145,
    mrp: 177,
    weight: "3 × 125g",
    sku: "PC-004",
    stock: 300,
    badge: "bestseller",
    variants: [
      { label: "75g", price: 35, mrp: 42 },
      { label: "125g", price: 55, mrp: 65 },
      { label: "125g×3", price: 145, mrp: 177 }
    ],
    desc: {
      en: "Dettol Original antibacterial soap — trusted germ protection for the whole family. Pack of 3.",
      hi: "डेटॉल ओरिजिनल एंटीबैक्टीरियल साबुन — पूरे परिवार के लिए भरोसेमंद जर्म प्रोटेक्शन। 3 का पैक।"
    }
  },

  // ─── Shampoo & Hair Care ───
  {
    id: 5,
    name: { en: "Head & Shoulders Anti-Dandruff Shampoo", hi: "हेड एंड शोल्डर्स एंटी-डैंड्रफ शैम्पू" },
    brand: "Head & Shoulders",
    category: "personal_care",
    image: "images/head_shoulders_shampoo.png",
    price: 299,
    mrp: 360,
    weight: "340ml",
    sku: "PC-005",
    stock: 120,
    badge: "sale",
    variants: [
      { label: "72ml", price: 75, mrp: 90 },
      { label: "180ml", price: 170, mrp: 200 },
      { label: "340ml", price: 299, mrp: 360 },
      { label: "650ml", price: 520, mrp: 625 }
    ],
    desc: {
      en: "Head & Shoulders anti-dandruff shampoo with ZPT formula. Clinically proven dandruff protection up to 72 hours.",
      hi: "हेड एंड शोल्डर्स एंटी-डैंड्रफ शैम्पू ZPT फ़ॉर्मूला के साथ। 72 घंटे तक डैंड्रफ प्रोटेक्शन।"
    }
  },
  {
    id: 6,
    name: { en: "Dove Intense Repair Shampoo", hi: "डव इंटेंस रिपेयर शैम्पू" },
    brand: "Dove",
    category: "personal_care",
    image: "images/dove_shampoo.png",
    price: 265,
    mrp: 320,
    weight: "340ml",
    sku: "PC-006",
    stock: 90,
    badge: null,
    variants: [
      { label: "180ml", price: 155, mrp: 185 },
      { label: "340ml", price: 265, mrp: 320 },
      { label: "650ml", price: 470, mrp: 560 }
    ],
    desc: {
      en: "Dove Intense Repair Shampoo with fiber actives for damaged hair repair. Gentle daily care.",
      hi: "डव इंटेंस रिपेयर शैम्पू फाइबर एक्टिव्स के साथ  खराब बालों की मरम्मत के लिए।"
    }
  },

  // ─── Beverages ───
  {
    id: 7,
    name: { en: "Coca-Cola Original", hi: "कोका-कोला ओरिजिनल" },
    brand: "Coca-Cola",
    category: "beverages",
    image: "images/coca_cola.png",
    price: 38,
    mrp: 40,
    weight: "750ml",
    sku: "BEV-001",
    stock: 500,
    badge: "bestseller",
    variants: [
      { label: "250ml", price: 20, mrp: 20 },
      { label: "750ml", price: 38, mrp: 40 },
      { label: "1.25L", price: 65, mrp: 70 },
      { label: "2L", price: 90, mrp: 96 }
    ],
    desc: {
      en: "The original Coca-Cola — world's favourite refreshing beverage. Classic taste in a 750ml bottle.",
      hi: "ओरिजिनल कोका-कोला — दुनिया का पसंदीदा रिफ्रेशिंग पेय। 750ml बोतल में क्लासिक स्वाद।"
    }
  },
  {
    id: 8,
    name: { en: "Tropicana Orange Juice", hi: "ट्रॉपिकाना ऑरेंज जूस" },
    brand: "Tropicana",
    category: "beverages",
    image: "images/tropicana_juice.png",
    price: 99,
    mrp: 120,
    weight: "1 Litre",
    sku: "BEV-002",
    stock: 200,
    badge: "sale",
    variants: [
      { label: "200ml", price: 30, mrp: 35 },
      { label: "1L", price: 99, mrp: 120 }
    ],
    desc: {
      en: "Tropicana 100% pure orange juice — no added sugar, no preservatives. Rich in Vitamin C.",
      hi: "ट्रॉपिकाना 100% शुद्ध संतरे का रस — कोई अतिरिक्त चीनी नहीं, कोई प्रिज़र्वेटिव नहीं। विटामिन C से भरपूर।"
    }
  },
  {
    id: 9,
    name: { en: "Red Bull Energy Drink", hi: "रेड बुल एनर्जी ड्रिंक" },
    brand: "Red Bull",
    category: "beverages",
    image: "images/red_bull.png",
    price: 115,
    mrp: 125,
    weight: "250ml",
    sku: "BEV-003",
    stock: 60,
    badge: "new",
    desc: {
      en: "Red Bull Energy Drink — gives you wings! Vitalizes body and mind.",
      hi: "रेड बुल एनर्जी ड्रिंक — आपको पंख देता है! शरीर और दिमाग को ऊर्जा देता है।"
    }
  },
  {
    id: 10,
    name: { en: "Bisleri Mineral Water", hi: "बिसलेरी मिनरल वॉटर" },
    brand: "Bisleri",
    category: "beverages",
    image: "images/coca_cola.png",
    price: 180,
    mrp: 240,
    weight: "12 × 1L",
    sku: "BEV-004",
    stock: 500,
    badge: null,
    variants: [
      { label: "500ml", price: 10, mrp: 10 },
      { label: "1L", price: 20, mrp: 20 },
      { label: "1L×12", price: 180, mrp: 240 },
      { label: "2L", price: 30, mrp: 35 }
    ],
    desc: {
      en: "Bisleri mineral water — India's most trusted water brand. 10-stage purification, BIS certified.",
      hi: "बिसलेरी मिनरल वॉटर — भारत का सबसे भरोसेमंद पानी ब्रांड। 10-स्टेज प्यूरिफिकेशन, BIS प्रमाणित।"
    }
  },

  // ─── Snacks & Confectionery ───
  {
    id: 11,
    name: { en: "Lay's Classic Salted Chips", hi: "लेज़ क्लासिक सॉल्टेड चिप्स" },
    brand: "Lay's",
    category: "snacks",
    image: "images/lays_chips.png",
    price: 48,
    mrp: 50,
    weight: "130g",
    sku: "SNK-001",
    stock: 400,
    badge: "bestseller",
    variants: [
      { label: "28g", price: 10, mrp: 10 },
      { label: "52g", price: 20, mrp: 20 },
      { label: "130g", price: 48, mrp: 50 },
      { label: "177g", price: 80, mrp: 85 }
    ],
    desc: {
      en: "Lay's Classic Salted — India's favourite potato chips. Perfectly crispy and lightly salted.",
      hi: "लेज़ क्लासिक सॉल्टेड — भारत के पसंदीदा आलू के चिप्स। बिल्कुल क्रिस्पी और हल्के नमकीन।"
    }
  },
  {
    id: 12,
    name: { en: "Cadbury Dairy Milk Silk", hi: "कैडबरी डेयरी मिल्क सिल्क" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_silk.png",
    price: 160,
    mrp: 185,
    weight: "150g",
    sku: "SNK-002",
    stock: 150,
    badge: "sale",
    variants: [
      { label: "60g", price: 72, mrp: 85 },
      { label: "150g", price: 160, mrp: 185 }
    ],
    desc: {
      en: "Cadbury Dairy Milk Silk — the smoothest, creamiest chocolate experience. A premium treat loved by millions.",
      hi: "कैडबरी डेयरी मिल्क सिल्क — सबसे स्मूथ, क्रीमी चॉकलेट अनुभव। करोड़ों का पसंदीदा प्रीमियम ट्रीट।"
    }
  },
  {
    id: 13,
    name: { en: "Maggi 2-Minute Noodles Masala", hi: "मैगी 2-मिनट नूडल्स मसाला" },
    brand: "Maggi",
    category: "packaged_foods",
    image: "images/maggi_noodles.png",
    price: 144,
    mrp: 168,
    weight: "12 × 70g",
    sku: "PF-001",
    stock: 600,
    badge: "bestseller",
    variants: [
      { label: "70g×4", price: 48, mrp: 56 },
      { label: "70g×12", price: 144, mrp: 168 }
    ],
    desc: {
      en: "Maggi 2-Minute Masala Noodles — India's most loved instant noodles. Quick, tasty, and ready in 2 minutes.",
      hi: "मैगी 2-मिनट मसाला नूडल्स — भारत के सबसे पसंदीदा इंस्टेंट नूडल्स। जल्दी, स्वादिष्ट, 2 मिनट में तैयार।"
    }
  },
  {
    id: 14,
    name: { en: "Haldiram's Aloo Bhujia", hi: "हल्दीराम आलू भुजिया" },
    brand: "Haldiram's",
    category: "snacks",
    image: "images/haldiram_bhujia.png",
    price: 99,
    mrp: 115,
    weight: "400g",
    sku: "SNK-003",
    stock: 280,
    badge: null,
    variants: [
      { label: "200g", price: 55, mrp: 65 },
      { label: "400g", price: 99, mrp: 115 },
      { label: "1kg", price: 220, mrp: 260 }
    ],
    desc: {
      en: "Haldiram's Aloo Bhujia — the authentic Indian snack. Crispy, spicy, and irresistible with chai.",
      hi: "हल्दीराम आलू भुजिया — असली भारतीय स्नैक। क्रिस्पी, मसालेदार, और चाय के साथ बेमिसाल।"
    }
  },
  {
    id: 15,
    name: { en: "Parle-G Gold Biscuits", hi: "पारले-जी गोल्ड बिस्कुट" },
    brand: "Parle",
    category: "snacks",
    image: "images/parle_g.png",
    price: 85,
    mrp: 100,
    weight: "1kg",
    sku: "SNK-004",
    stock: 350,
    badge: "sale",
    variants: [
      { label: "100g", price: 10, mrp: 10 },
      { label: "500g", price: 45, mrp: 55 },
      { label: "1kg", price: 85, mrp: 100 }
    ],
    desc: {
      en: "Parle-G Gold — premium glucose biscuits with the classic taste. India's beloved teatime companion.",
      hi: "पारले-जी गोल्ड — क्लासिक स्वाद वाले प्रीमियम ग्लूकोज़ बिस्कुट। भारत का पसंदीदा चाय-टाइम साथी।"
    }
  },

  // ─── Household & Cleaning ───
  {
    id: 16,
    name: { en: "Surf Excel Matic Liquid Detergent", hi: "सर्फ़ एक्सेल मैटिक लिक्विड डिटर्जेंट" },
    brand: "Surf Excel",
    category: "household",
    image: "images/surf_excel.png",
    price: 225,
    mrp: 275,
    weight: "1 Litre",
    sku: "HH-001",
    stock: 160,
    badge: "bestseller",
    variants: [
      { label: "500ml", price: 125, mrp: 150 },
      { label: "1L", price: 225, mrp: 275 },
      { label: "2L", price: 420, mrp: 510 }
    ],
    desc: {
      en: "Surf Excel Matic Liquid — top-load washing machine detergent. Superior stain removal with easy dissolve formula.",
      hi: "सर्फ़ एक्सेल मैटिक लिक्विड — टॉप-लोड वॉशिंग मशीन डिटर्जेंट। बेहतरीन दाग हटाने की क्षमता।"
    }
  },
  {
    id: 17,
    name: { en: "Vim Dishwash Bar", hi: "विम डिशवॉश बार" },
    brand: "Vim",
    category: "household",
    image: "images/vim_dishwash.png",
    price: 95,
    mrp: 120,
    weight: "3 × 500g",
    sku: "HH-002",
    stock: 400,
    badge: null,
    variants: [
      { label: "200g", price: 22, mrp: 28 },
      { label: "500g", price: 42, mrp: 50 },
      { label: "500g×3", price: 95, mrp: 120 }
    ],
    desc: {
      en: "Vim Dishwash Bar with lemon power — cuts through grease 2X better. Long-lasting bar for sparkling dishes.",
      hi: "विम डिशवॉश बार नींबू  पावर के साथ — 2X बेहतर ग्रीस हटाता है। चमचमाते बर्तनों के लिए।"
    }
  },
  {
    id: 18,
    name: { en: "Harpic Powerplus Toilet Cleaner", hi: "हार्पिक पावरप्लस टॉयलेट क्लीनर" },
    brand: "Harpic",
    category: "household",
    image: "images/harpic_cleaner.png",
    price: 109,
    mrp: 132,
    weight: "1 Litre",
    sku: "HH-003",
    stock: 220,
    badge: "sale",
    variants: [
      { label: "500ml", price: 62, mrp: 75 },
      { label: "1L", price: 109, mrp: 132 }
    ],
    desc: {
      en: "Harpic Powerplus — 10X better cleaning power. Kills 99.9% germs, removes tough stains from the toilet bowl.",
      hi: "हार्पिक पावरप्लस — 10X बेहतर सफ़ाई। 99.9% कीटाणुओं को मारता है, टॉयलेट बाउल से कठिन दागों को हटाता है।"
    }
  },
  {
    id: 19,
    name: { en: "Lizol Floor Cleaner Citrus", hi: "लाइज़ोल फ्लोर क्लीनर सिट्रस" },
    brand: "Lizol",
    category: "household",
    image: "images/lizol_cleaner.png",
    price: 159,
    mrp: 199,
    weight: "975ml",
    sku: "HH-004",
    stock: 180,
    badge: null,
    variants: [
      { label: "500ml", price: 95, mrp: 115 },
      { label: "975ml", price: 159, mrp: 199 },
      { label: "2L", price: 289, mrp: 355 }
    ],
    desc: {
      en: "Lizol Citrus Floor Cleaner — kills 99.9% germs and bacteria. Fresh citrus fragrance for a healthier home.",
      hi: "लाइज़ोल सिट्रस फ्लोर क्लीनर — 99.9% कीटाणुओं और बैक्टीरिया को मारता है। ताज़ा सिट्रस खुशबू।"
    }
  },

  // ─── Packaged Foods ───
  {
    id: 20,
    name: { en: "Aashirvaad Whole Wheat Atta", hi: "आशीर्वाद संपूर्ण गेहूं आटा" },
    brand: "Aashirvaad",
    category: "packaged_foods",
    image: "images/aashirvaad_atta.png",
    price: 265,
    mrp: 310,
    weight: "5kg",
    sku: "PF-002",
    stock: 300,
    badge: "bestseller",
    variants: [
      { label: "1kg", price: 58, mrp: 68 },
      { label: "5kg", price: 265, mrp: 310 },
      { label: "10kg", price: 495, mrp: 580 }
    ],
    desc: {
      en: "Aashirvaad Whole Wheat Atta — India's No.1 atta brand. Made from MP Sharbati wheat for soft rotis.",
      hi: "आशीर्वाद संपूर्ण गेहूं आटा — भारत का नंबर 1 आटा ब्रांड। मुलायम रोटियों के लिए MP शरबती गेहूं से बना।"
    }
  },
  {
    id: 21,
    name: { en: "Tata Sampann Toor Dal", hi: "टाटा सम्पन्न तूर दाल" },
    brand: "Tata",
    category: "packaged_foods",
    image: "images/tata_dal.png",
    price: 145,
    mrp: 170,
    weight: "1kg",
    sku: "PF-003",
    stock: 200,
    badge: null,
    variants: [
      { label: "500g", price: 78, mrp: 90 },
      { label: "1kg", price: 145, mrp: 170 }
    ],
    desc: {
      en: "Tata Sampann Unpolished Toor Dal — naturally rich in protein and fiber. Premium quality, chemical-free processing.",
      hi: "टाटा सम्पन्न अनपॉलिश्ड तूर दाल — प्राकृतिक रूप से प्रोटीन और फाइबर से भरपूर। प्रीमियम गुणवत्ता।"
    }
  },
  {
    id: 22,
    name: { en: "India Gate Basmati Rice", hi: "इंडिया गेट बासमती चावल" },
    brand: "India Gate",
    category: "packaged_foods",
    image: "images/india_gate_rice.png",
    price: 425,
    mrp: 499,
    weight: "5kg",
    sku: "PF-004",
    stock: 150,
    badge: "organic",
    variants: [
      { label: "1kg", price: 95, mrp: 110 },
      { label: "5kg", price: 425, mrp: 499 }
    ],
    desc: {
      en: "India Gate Basmati Rice — extra-long grain, aged naturally. Perfect for biryani and pulao.",
      hi: "इंडिया गेट बासमती चावल — एक्स्ट्रा-लॉन्ग ग्रेन, प्राकृतिक रूप से एजेड। बिरयानी और पुलाव के लिए बिल्कुल सही।"
    }
  },

  // ─── Dairy & Frozen ───
  {
    id: 23,
    name: { en: "Amul Butter", hi: "अमूल मक्खन" },
    brand: "Amul",
    category: "dairy",
    image: "images/amul_butter.png",
    price: 270,
    mrp: 290,
    weight: "500g",
    sku: "DF-001",
    stock: 80,
    badge: "bestseller",
    variants: [
      { label: "100g", price: 57, mrp: 62 },
      { label: "200g", price: 110, mrp: 120 },
      { label: "500g", price: 270, mrp: 290 }
    ],
    desc: {
      en: "Amul Pasteurised Butter — the taste of India. Made from pure cream, perfect for cooking and spreading.",
      hi: "अमूल  पाश्चराइज़्ड मक्खन — भारत का स्वाद। शुद्ध क्रीम से बना, खाना पकाने और लगाने के लिए उत्तम।"
    }
  },
  {
    id: 24,
    name: { en: "Mother Dairy Full Cream Milk", hi: "मदर डेयरी फुल क्रीम दूध" },
    brand: "Mother Dairy",
    category: "dairy",
    image: "images/mother_dairy_milk.png",
    price: 66,
    mrp: 72,
    weight: "1 Litre",
    sku: "DF-002",
    stock: 45,
    badge: "new",
    variants: [
      { label: "500ml", price: 35, mrp: 38 },
      { label: "1L", price: 66, mrp: 72 }
    ],
    desc: {
      en: "Mother Dairy Full Cream Milk — fresh, pure, and pasteurised. Rich and creamy for all dairy needs.",
      hi: "मदर डेयरी फुल क्रीम दूध — ताज़ा, शुद्ध, और पाश्चराइज़्ड। सभी डेयरी ज़रूरतों के लिए।"
    }
  },

  // ═══════════════════════════════════════════════════════════
  // ─── PATANJALI Products ───
  // ═══════════════════════════════════════════════════════════
  {
    id: 25,
    name: { en: "Patanjali Dant Kanti Toothpaste", hi: "पतंजलि दंत कांति टूथपेस्ट" },
    brand: "Patanjali",
    category: "personal_care",
    image: "images/patanjali_dant_kanti.png",
    price: 70,
    mrp: 85,
    weight: "200g",
    sku: "PAT-001",
    stock: 400,
    badge: "bestseller",
    variants: [
      { label: "100g", price: 40, mrp: 48 },
      { label: "200g", price: 70, mrp: 85 }
    ],
    desc: {
      en: "Patanjali Dant Kanti — Ayurvedic herbal toothpaste with 26 herbs. Complete dental care for strong teeth and healthy gums.",
      hi: "पतंजलि दंत कांति — 26 जड़ी-बूटियों वाली आयुर्वेदिक हर्बल टूथपेस्ट। मजबूत दांतों और स्वस्थ मसूड़ों के लिए।"
    }
  },
  {
    id: 26,
    name: { en: "Patanjali Cow Ghee", hi: "पतंजलि गाय का घी" },
    brand: "Patanjali",
    category: "dairy",
    image: "images/patanjali_ghee.png",
    price: 490,
    mrp: 560,
    weight: "1 Litre",
    sku: "PAT-002",
    stock: 120,
    badge: "organic",
    variants: [
      { label: "200ml", price: 110, mrp: 130 },
      { label: "500ml", price: 260, mrp: 300 },
      { label: "1L", price: 490, mrp: 560 }
    ],
    desc: {
      en: "Patanjali Pure Cow Ghee — made from desi cow milk using traditional bilona method. Rich aroma and golden texture.",
      hi: "पतंजलि शुद्ध गाय का घी — देसी गाय के दूध से पारंपरिक बिलोना विधि से बना। समृद्ध सुगंध और सुनहरी बनावट।"
    }
  },
  {
    id: 27,
    name: { en: "Patanjali Aloe Vera Juice", hi: "पतंजलि एलोवेरा जूस" },
    brand: "Patanjali",
    category: "beverages",
    image: "images/patanjali_aloevera.png",
    price: 155,
    mrp: 180,
    weight: "1 Litre",
    sku: "PAT-003",
    stock: 200,
    badge: "organic",
    variants: [
      { label: "500ml", price: 85, mrp: 100 },
      { label: "1L", price: 155, mrp: 180 }
    ],
    desc: {
      en: "Patanjali Aloe Vera Juice with fibre — 100% natural, no added sugar. Boosts immunity and aids digestion.",
      hi: "पतंजलि एलोवेरा जूस फाइबर के साथ — 100% प्राकृतिक, बिना चीनी। इम्यूनिटी बढ़ाता है और पाचन में सहायक।"
    }
  },
  {
    id: 28,
    name: { en: "Patanjali Kesh Kanti Shampoo", hi: "पतंजलि केश कांति शैम्पू" },
    brand: "Patanjali",
    category: "personal_care",
    image: "images/patanjali_shampoo.png",
    price: 140,
    mrp: 170,
    weight: "300ml",
    sku: "PAT-004",
    stock: 250,
    badge: null,
    variants: [
      { label: "100ml", price: 55, mrp: 65 },
      { label: "300ml", price: 140, mrp: 170 },
      { label: "600ml", price: 260, mrp: 310 }
    ],
    desc: {
      en: "Patanjali Kesh Kanti Natural Hair Cleanser — herbal shampoo for strong, shiny hair. Reduces hair fall naturally.",
      hi: "पतंजलि केश कांति नैचुरल हेयर क्लींज़र — मजबूत, चमकदार बालों के लिए हर्बल शैम्पू। बालों का झड़ना प्राकृतिक रूप से कम करता है।"
    }
  },
  {
    id: 29,
    name: { en: "Patanjali Atta Noodles", hi: "पतंजलि आटा नूडल्स" },
    brand: "Patanjali",
    category: "packaged_foods",
    image: "images/patanjali_noodles.png",
    price: 52,
    mrp: 60,
    weight: "4 × 60g",
    sku: "PAT-005",
    stock: 350,
    badge: "new",
    desc: {
      en: "Patanjali Atta Noodles — made with whole wheat flour, no maida. Healthy and tasty instant noodles for the family.",
      hi: "पतंजलि आटा नूडल्स — साबुत गेहूं के आटे से बना, बिना मैदा। परिवार के लिए स्वस्थ और स्वादिष्ट।"
    }
  },
  {
    id: 30,
    name: { en: "Patanjali Saundarya Face Wash", hi: "पतंजलि सौंदर्य फेस वॉश" },
    brand: "Patanjali",
    category: "personal_care",
    image: "images/patanjali_facewash.png",
    price: 60,
    mrp: 75,
    weight: "100ml",
    sku: "PAT-006",
    stock: 180,
    badge: null,
    variants: [
      { label: "60ml", price: 40, mrp: 48 },
      { label: "100ml", price: 60, mrp: 75 }
    ],
    desc: {
      en: "Patanjali Saundarya Aloe Vera Face Wash — gentle cleansing with natural ingredients. For clear, glowing skin.",
      hi: "पतंजलि सौंदर्य एलोवेरा फेस वॉश — प्राकृतिक सामग्री के साथ सौम्य सफ़ाई। साफ़, चमकती त्वचा के लिए।"
    }
  },
  {
    id: 31,
    name: { en: "Patanjali Honey", hi: "पतंजलि शहद" },
    brand: "Patanjali",
    category: "packaged_foods",
    image: "images/patanjali_honey.png",
    price: 175,
    mrp: 210,
    weight: "500g",
    sku: "PAT-007",
    stock: 300,
    badge: "organic",
    variants: [
      { label: "250g", price: 95, mrp: 115 },
      { label: "500g", price: 175, mrp: 210 },
      { label: "1kg", price: 330, mrp: 395 }
    ],
    desc: {
      en: "Patanjali Pure Honey — 100% natural, unpasteurised. Rich in antioxidants and perfect for daily wellness.",
      hi: "पतंजलि शुद्ध शहद — 100% प्राकृतिक, बिना पाश्चराइज़्ड। एंटीऑक्सीडेंट से भरपूर, दैनिक स्वास्थ्य के लिए।"
    }
  },
  {
    id: 32,
    name: { en: "Patanjali Mustard Oil", hi: "पतंजलि सरसों का तेल" },
    brand: "Patanjali",
    category: "packaged_foods",
    image: "images/patanjali_oil.png",
    price: 165,
    mrp: 195,
    weight: "1 Litre",
    sku: "PAT-008",
    stock: 220,
    badge: "sale",
    variants: [
      { label: "500ml", price: 90, mrp: 105 },
      { label: "1L", price: 165, mrp: 195 },
      { label: "5L", price: 780, mrp: 920 }
    ],
    desc: {
      en: "Patanjali Kachi Ghani Mustard Oil — cold-pressed, pure and pungent. Traditional Indian cooking oil for authentic flavour.",
      hi: "पतंजलि कच्ची घानी सरसों का तेल — कोल्ड-प्रेस्ड, शुद्ध और तीखा। प्रामाणिक स्वाद के लिए पारंपरिक भारतीय खाना पकाने का तेल।"
    }
  },
  {
    id: 33,
    name: { en: "Patanjali Dish Wash Bar", hi: "पतंजलि डिश वॉश बार" },
    brand: "Patanjali",
    category: "household",
    image: "images/patanjali_dishbar.png",
    price: 45,
    mrp: 55,
    weight: "3 × 280g",
    sku: "PAT-009",
    stock: 380,
    badge: null,
    desc: {
      en: "Patanjali Dish Wash Bar — lemon fragrance with herbal formula. Cuts grease effectively and gentle on hands.",
      hi: "पतंजलि डिश वॉश बार — हर्बल फ़ॉर्मूले के साथ नींबू की खुशबू। ग्रीस को प्रभावी ढंग से हटाता है।"
    }
  },
  {
    id: 34,
    name: { en: "Patanjali Coconut Oil", hi: "पतंजलि नारियल तेल" },
    brand: "Patanjali",
    category: "personal_care",
    image: "images/patanjali_coconut.png",
    price: 75,
    mrp: 90,
    weight: "200ml",
    sku: "PAT-010",
    stock: 290,
    badge: "sale",
    variants: [
      { label: "100ml", price: 42, mrp: 50 },
      { label: "200ml", price: 75, mrp: 90 },
      { label: "500ml", price: 170, mrp: 200 }
    ],
    desc: {
      en: "Patanjali Virgin Coconut Oil — 100% pure, cold-pressed. For strong hair, glowing skin and healthy cooking.",
      hi: "पतंजलि वर्जिन नारियल तेल — 100% शुद्ध, कोल्ड-प्रेस्ड। मजबूत बालों, चमकती त्वचा और स्वस्थ खाना पकाने के लिए।"
    }
  },

  // ═══════════════════════════════════════════════════════════
  // ─── NESTLE Products ───
  // ═══════════════════════════════════════════════════════════
  {
    id: 35,
    name: { en: "Nescafé Classic Instant Coffee", hi: "नेस्कैफ़े क्लासिक इंस्टेंट कॉफ़ी" },
    brand: "Nestlé",
    category: "beverages",
    image: "images/nescafe_classic.png",
    price: 450,
    mrp: 525,
    weight: "200g",
    sku: "NES-001",
    stock: 180,
    badge: "bestseller",
    variants: [
      { label: "50g", price: 130, mrp: 150 },
      { label: "100g", price: 240, mrp: 280 },
      { label: "200g", price: 450, mrp: 525 }
    ],
    desc: {
      en: "Nescafé Classic — 100% pure instant coffee with rich aroma and smooth taste. India's favourite coffee brand.",
      hi: "नेस्कैफ़े क्लासिक — 100% शुद्ध इंस्टेंट कॉफ़ी, समृद्ध सुगंध और स्मूथ स्वाद। भारत का पसंदीदा कॉफ़ी ब्रांड।"
    }
  },
  {
    id: 36,
    name: { en: "Nestlé Everyday Dairy Whitener", hi: "नेस्ले एवरीडे डेयरी व्हाइटनर" },
    brand: "Nestlé",
    category: "dairy",
    image: "images/nestle_everyday.png",
    price: 325,
    mrp: 390,
    weight: "1kg",
    sku: "NES-002",
    stock: 140,
    badge: null,
    variants: [
      { label: "200g", price: 75, mrp: 88 },
      { label: "1kg", price: 325, mrp: 390 }
    ],
    desc: {
      en: "Nestlé Everyday Dairy Whitener — made from cow milk. Perfect for tea with rich, creamy taste.",
      hi: "नेस्ले एवरीडे डेयरी व्हाइटनर — गाय के दूध से बना। समृद्ध, क्रीमी स्वाद के साथ चाय के लिए उत्तम।"
    }
  },
  {
    id: 37,
    name: { en: "Nestlé Cerelac Baby Cereal", hi: "नेस्ले सेरेलैक बेबी सीरियल" },
    brand: "Nestlé",
    category: "packaged_foods",
    image: "images/nestle_cerelac.png",
    price: 225,
    mrp: 270,
    weight: "300g",
    sku: "NES-003",
    stock: 200,
    badge: "new",
    desc: {
      en: "Nestlé Cerelac — iron fortified baby cereal with milk, wheat, rice and mixed fruit. For babies 10 months+.",
      hi: "नेस्ले सेरेलैक — आयरन फोर्टिफाइड बेबी सीरियल दूध, गेहूं, चावल और मिक्स्ड फ्रूट के साथ। 10 महीने+ के बच्चों के लिए।"
    }
  },
  {
    id: 38,
    name: { en: "Nestlé KitKat 4-Finger", hi: "नेस्ले किटकैट 4-फिंगर" },
    brand: "Nestlé",
    category: "snacks",
    image: "images/nestle_kitkat.png",
    price: 240,
    mrp: 288,
    weight: "12 × 46g",
    sku: "NES-004",
    stock: 320,
    badge: "sale",
    variants: [
      { label: "46g", price: 22, mrp: 25 },
      { label: "46g×12", price: 240, mrp: 288 }
    ],
    desc: {
      en: "Nestlé KitKat — have a break, have a KitKat! Crispy wafer covered with smooth chocolate. Pack of 12.",
      hi: "नेस्ले किटकैट — ब्रेक लो, किटकैट खाओ! स्मूथ चॉकलेट से ढकी क्रिस्पी वेफ़र। 12 का पैक।"
    }
  },
  {
    id: 39,
    name: { en: "Maggi Hot & Sweet Tomato Chilli Sauce", hi: "मैगी हॉट एंड स्वीट टोमैटो चिली सॉस" },
    brand: "Nestlé",
    category: "packaged_foods",
    image: "images/maggi_sauce.png",
    price: 135,
    mrp: 159,
    weight: "1kg",
    sku: "NES-005",
    stock: 250,
    badge: "bestseller",
    variants: [
      { label: "200g", price: 40, mrp: 48 },
      { label: "500g", price: 80, mrp: 95 },
      { label: "1kg", price: 135, mrp: 159 }
    ],
    desc: {
      en: "Maggi Hot & Sweet Chilli Sauce — the perfect blend of tomato, chilli and spices. India's favourite dipping sauce.",
      hi: "मैगी हॉट एंड स्वीट चिली सॉस — टमाटर, मिर्च और मसालों का सही मिश्रण। भारत की पसंदीदा डिपिंग सॉस।"
    }
  },
  {
    id: 40,
    name: { en: "Nescafé Gold Blend", hi: "नेस्कैफ़े गोल्ड ब्लेंड" },
    brand: "Nestlé",
    category: "beverages",
    image: "images/nescafe_gold.png",
    price: 495,
    mrp: 575,
    weight: "100g",
    sku: "NES-006",
    stock: 90,
    badge: "new",
    variants: [
      { label: "50g", price: 275, mrp: 320 },
      { label: "100g", price: 495, mrp: 575 }
    ],
    desc: {
      en: "Nescafé Gold — premium freeze-dried coffee with a smooth, refined taste. A golden coffee experience.",
      hi: "नेस्कैफ़े गोल्ड — प्रीमियम फ़्रीज़-ड्राइड कॉफ़ी, स्मूथ और परिष्कृत स्वाद। एक सुनहरा कॉफ़ी अनुभव।"
    }
  },
  {
    id: 41,
    name: { en: "Nestlé Milkmaid", hi: "नेस्ले मिल्कमेड" },
    brand: "Nestlé",
    category: "dairy",
    image: "images/nestle_milkmaid.png",
    price: 135,
    mrp: 155,
    weight: "400g",
    sku: "NES-007",
    stock: 160,
    badge: null,
    variants: [
      { label: "200g", price: 72, mrp: 82 },
      { label: "400g", price: 135, mrp: 155 }
    ],
    desc: {
      en: "Nestlé Milkmaid — sweetened condensed milk for making desserts, sweets, and shakes. Rich and creamy.",
      hi: "नेस्ले मिल्कमेड — मिठाई, डेज़र्ट और शेक बनाने के लिए स्वीटेंड कंडेंस्ड मिल्क। रिच और क्रीमी।"
    }
  },
  {
    id: 42,
    name: { en: "Nestlé Munch Crunch", hi: "नेस्ले मंच क्रंच" },
    brand: "Nestlé",
    category: "snacks",
    image: "images/nestle_munch.png",
    price: 100,
    mrp: 120,
    weight: "10 × 24g",
    sku: "NES-008",
    stock: 400,
    badge: "sale",
    variants: [
      { label: "24g", price: 10, mrp: 10 },
      { label: "24g×10", price: 100, mrp: 120 }
    ],
    desc: {
      en: "Nestlé Munch Crunch — crispy, wafer coated with chocolate. India's favourite pocket snack. Pack of 10.",
      hi: "नेस्ले मंच क्रंच — क्रिस्पी वेफ़र चॉकलेट कोटेड। भारत का पसंदीदा पॉकेट स्नैक। 10 का पैक।"
    }
  },
  {
    id: 43,
    name: { en: "Nestlé a+ Toned Milk", hi: "नेस्ले a+ टोंड दूध" },
    brand: "Nestlé",
    category: "dairy",
    image: "images/nestle_milk.png",
    price: 330,
    mrp: 396,
    weight: "6 × 1L",
    sku: "NES-009",
    stock: 70,
    badge: null,
    desc: {
      en: "Nestlé a+ Toned Milk — UHT processed for longer freshness, no preservatives. Rich in calcium and protein.",
      hi: "नेस्ले a+ टोंड दूध — लंबी ताज़गी के लिए UHT प्रोसेस्ड, कोई प्रिज़र्वेटिव नहीं। कैल्शियम और प्रोटीन से भरपूर।"
    }
  },
  {
    id: 44,
    name: { en: "Maggi Pazzta Cheesy Tomato", hi: "मैगी पाज़्ज़्टा चीज़ी टोमैटो" },
    brand: "Nestlé",
    category: "packaged_foods",
    image: "images/maggi_pazzta.png",
    price: 192,
    mrp: 228,
    weight: "12 × 64g",
    sku: "NES-010",
    stock: 180,
    badge: null,
    desc: {
      en: "Maggi Pazzta Cheesy Tomato — instant pasta with real cheese flavour. Ready in just 5 minutes.",
      hi: "मैगी पाज़्ज़्टा चीज़ी टोमैटो — असली चीज़ फ़्लेवर वाला इंस्टेंट पास्ता। सिर्फ 5 मिनट में तैयार।"
    }
  },

  // ═══════════════════════════════════════════════════════════
  // ─── CADBURY Products ───
  // ═══════════════════════════════════════════════════════════
  {
    id: 45,
    name: { en: "Cadbury 5 Star Chocolate", hi: "कैडबरी 5 स्टार चॉकलेट" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_5star.png",
    price: 140,
    mrp: 168,
    weight: "14 × 40g",
    sku: "CAD-001",
    stock: 280,
    badge: "sale",
    variants: [
      { label: "40g", price: 10, mrp: 10 },
      { label: "40g×14", price: 140, mrp: 168 }
    ],
    desc: {
      en: "Cadbury 5 Star — soft caramel and chocolate nougat. Irresistible chewy chocolate bar loved by all.",
      hi: "कैडबरी 5 स्टार — सॉफ्ट कैरामेल और चॉकलेट नूगा। सबका पसंदीदा चबाने वाला चॉकलेट बार।"
    }
  },
  {
    id: 46,
    name: { en: "Cadbury Gems", hi: "कैडबरी जेम्स" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_gems.png",
    price: 240,
    mrp: 288,
    weight: "24 × 17.8g",
    sku: "CAD-002",
    stock: 350,
    badge: "bestseller",
    desc: {
      en: "Cadbury Gems — colourful, crunchy, chocolate buttons that kids love. Fun in every bite! Pack of 24.",
      hi: "कैडबरी जेम्स — रंगीन, क्रंची, चॉकलेट बटन जो बच्चों को बहुत पसंद। हर बाइट में मज़ा! 24 का पैक।"
    }
  },
  {
    id: 47,
    name: { en: "Cadbury Perk", hi: "कैडबरी पर्क" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_perk.png",
    price: 160,
    mrp: 192,
    weight: "16 × 28g",
    sku: "CAD-003",
    stock: 300,
    badge: null,
    desc: {
      en: "Cadbury Perk — light, crispy wafer layers coated with delicious Cadbury chocolate. A quick snack anytime.",
      hi: "कैडबरी पर्क — हल्की, क्रिस्पी वेफ़र लेयर्स कैडबरी चॉकलेट से कोटेड। कभी भी एक क्विक स्नैक।"
    }
  },
  {
    id: 48,
    name: { en: "Cadbury Dairy Milk", hi: "कैडबरी डेयरी मिल्क" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_dairymilk.png",
    price: 300,
    mrp: 375,
    weight: "15 × 50g",
    sku: "CAD-004",
    stock: 200,
    badge: "bestseller",
    variants: [
      { label: "24g", price: 20, mrp: 20 },
      { label: "50g", price: 40, mrp: 50 },
      { label: "50g×15", price: 300, mrp: 375 }
    ],
    desc: {
      en: "Cadbury Dairy Milk — the classic chocolate loved by generations. Smooth, creamy and irresistible. Pack of 15.",
      hi: "कैडबरी डेयरी मिल्क — पीढ़ियों का पसंदीदा क्लासिक चॉकलेट। स्मूथ, क्रीमी और अनूठा। 15 का पैक।"
    }
  },
  {
    id: 49,
    name: { en: "Cadbury Bournville Dark Chocolate", hi: "कैडबरी बॉर्नविल डार्क चॉकलेट" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_bournville.png",
    price: 220,
    mrp: 260,
    weight: "150g",
    sku: "CAD-005",
    stock: 120,
    badge: "new",
    desc: {
      en: "Cadbury Bournville — premium dark chocolate with rich cocoa flavour. For sophisticated chocolate lovers.",
      hi: "कैडबरी बॉर्नविल — रिच कोको फ़्लेवर वाली प्रीमियम डार्क चॉकलेट। परिष्कृत चॉकलेट प्रेमियों के लिए।"
    }
  },
  {
    id: 50,
    name: { en: "Cadbury Dairy Milk Fruit & Nut", hi: "कैडबरी डेयरी मिल्क फ्रूट एंड नट" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_fruitnut.png",
    price: 110,
    mrp: 130,
    weight: "80g",
    sku: "CAD-006",
    stock: 190,
    badge: null,
    desc: {
      en: "Cadbury Dairy Milk Fruit & Nut — smooth milk chocolate loaded with raisins and almonds. A classic combination.",
      hi: "कैडबरी डेयरी मिल्क फ्रूट एंड नट — किशमिश और बादाम से भरी स्मूथ मिल्क चॉकलेट। एक क्लासिक मिश्रण।"
    }
  },
  {
    id: 51,
    name: { en: "Cadbury Oreo Biscuits", hi: "कैडबरी ओरियो बिस्कुट" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_oreo.png",
    price: 120,
    mrp: 150,
    weight: "3 × 300g",
    sku: "CAD-007",
    stock: 340,
    badge: "sale",
    variants: [
      { label: "120g", price: 30, mrp: 35 },
      { label: "300g", price: 55, mrp: 65 },
      { label: "300g×3", price: 120, mrp: 150 }
    ],
    desc: {
      en: "Cadbury Oreo — chocolate sandwich biscuits with vanilla creme. Twist, lick, dunk! Pack of 3.",
      hi: "कैडबरी ओरियो — वनीला क्रीम के साथ चॉकलेट सैंडविच बिस्कुट। घुमाओ, चाटो, डुबोओ! 3 का पैक।"
    }
  },
  {
    id: 52,
    name: { en: "Cadbury Celebrations Gift Pack", hi: "कैडबरी सेलिब्रेशन्स गिफ्ट पैक" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_celebrations.png",
    price: 140,
    mrp: 162,
    weight: "130g",
    sku: "CAD-008",
    stock: 250,
    badge: "bestseller",
    desc: {
      en: "Cadbury Celebrations — assorted chocolates gift pack. Perfect for gifting on festivals and special occasions.",
      hi: "कैडबरी सेलिब्रेशन्स — असॉर्टेड चॉकलेट गिफ्ट पैक। त्योहारों और खास मौकों पर गिफ्टिंग के लिए उत्तम।"
    }
  },
  {
    id: 53,
    name: { en: "Cadbury Silk Oreo", hi: "कैडबरी सिल्क ओरियो" },
    brand: "Cadbury",
    category: "snacks",
    image: "images/cadbury_silkoreo.png",
    price: 175,
    mrp: 200,
    weight: "130g",
    sku: "CAD-009",
    stock: 160,
    badge: "new",
    desc: {
      en: "Cadbury Silk Oreo — the creamiest Silk chocolate with Oreo biscuit pieces. An ultimate indulgent treat.",
      hi: "कैडबरी सिल्क ओरियो — ओरियो बिस्कुट के टुकड़ों के साथ सबसे क्रीमी सिल्क चॉकलेट। परम पसंदीदा ट्रीट।"
    }
  },
  {
    id: 54,
    name: { en: "Cadbury Bournvita", hi: "कैडबरी बॉर्नविटा" },
    brand: "Cadbury",
    category: "beverages",
    image: "images/cadbury_bournvita.png",
    price: 380,
    mrp: 445,
    weight: "1kg",
    sku: "CAD-010",
    stock: 200,
    badge: "bestseller",
    variants: [
      { label: "200g", price: 95, mrp: 110 },
      { label: "500g", price: 210, mrp: 245 },
      { label: "1kg", price: 380, mrp: 445 }
    ],
    desc: {
      en: "Cadbury Bournvita — chocolate health drink with vitamins and minerals. Trusted by mothers for growing children.",
      hi: "कैडबरी बॉर्नविटा — विटामिन और मिनरल्स के साथ चॉकलेट हेल्थ ड्रिंक। बढ़ते बच्चों के लिए माँओं का भरोसा।"
    }
  },
  {
    id: 55,
    name: { en: "Keo Karpin Hair Oil", hi: "केओ कर्पिन हेयर ऑयल" },
    brand: "Dey's",
    category: "personal_care",
    image: "images/keo_karpin_oil.png",
    price: 199,
    mrp: 240,
    weight: "Multiple",
    sku: "DEY-001",
    stock: 500,
    badge: "bestseller",
    variants: [
      { label: "MRP 23", price: 19, mrp: 23 },
      { label: "MRP 25", price: 21, mrp: 25 },
      { label: "MRP 50", price: 42, mrp: 50 },
      { label: "MRP 55", price: 46, mrp: 55 },
      { label: "MRP 90", price: 75, mrp: 90 },
      { label: "MRP 100", price: 83, mrp: 100 },
      { label: "MRP 135", price: 113, mrp: 135 },
      { label: "MRP 150", price: 125, mrp: 150 },
      { label: "MRP 200", price: 166, mrp: 200 },
      { label: "MRP 215", price: 179, mrp: 215 },
      { label: "MRP 240", price: 199, mrp: 240 }
    ],
    desc: {
      en: "Keo Karpin light non-sticky hair oil. Nourishes hair from roots to tips.",
      hi: "केओ कर्पिन लाइट नॉन-स्टिकी हेयर ऑयल। बालों को जड़ों से सिरों तक पोषण देता है।"
    }
  },
  {
    id: 56,
    name: { en: "Dey's Almond Hair Oil", hi: "डेज़ आलमंड हेयर ऑयल" },
    brand: "Dey's",
    category: "personal_care",
    image: "images/deys_almond_oil.png",
    price: 118,
    mrp: 140,
    weight: "Multiple",
    sku: "DEY-002",
    stock: 300,
    badge: null,
    variants: [
      { label: "MRP 35", price: 29, mrp: 35 },
      { label: "MRP 70", price: 59, mrp: 70 },
      { label: "MRP 140", price: 118, mrp: 140 }
    ],
    desc: {
      en: "Dey's Almond Hair Oil for strong, shiny, and nourished hair.",
      hi: "मजबूत, चमकदार और पोषित बालों के लिए डेज़ आलमंड हेयर ऑयल।"
    }
  },
  {
    id: 57,
    name: { en: "Dey's Sarso Amla Hair Oil", hi: "डेज़ सरसों आंवला हेयर ऑयल" },
    brand: "Dey's",
    category: "personal_care",
    image: "images/deys_sarso_amla.png",
    price: 42,
    mrp: 50,
    weight: "Multiple",
    sku: "DEY-003",
    stock: 450,
    badge: null,
    variants: [
      { label: "MRP 10", price: 8, mrp: 10 },
      { label: "MRP 20", price: 17, mrp: 20 },
      { label: "MRP 50", price: 42, mrp: 50 }
    ],
    desc: {
      en: "Dey's Sarso Amla hair oil with the goodness of mustard and amla to promote hair growth.",
      hi: "बालों के विकास को बढ़ावा देने के लिए सरसों और आंवले के गुणों के साथ डेज़ सरसों आंवला हेयर ऑयल।"
    }
  }
];

// ===== Category Definitions =====
const CATEGORIES = [
  { id: "all", nameKey: "cat_all", icon: "•" },

  // --- NEW CATEGORIES ---
  { id: "baby_care", nameKey: "cat_baby_care", icon: "•" },
  { id: "bc_newborn", nameKey: "cat_bc_newborn", icon: "•", isSub: true, parent: "baby_care" },

  { id: "skin_face_care", nameKey: "cat_skin_face_care", icon: "•" },
  { id: "sfc_cream", nameKey: "cat_sfc_cream", icon: "•", isSub: true, parent: "skin_face_care" },
  { id: "sfc_soap", nameKey: "cat_sfc_soap", icon: "•", isSub: true, parent: "skin_face_care" },
  { id: "sfc_wash", nameKey: "cat_sfc_wash", icon: "•", isSub: true, parent: "skin_face_care" },
  { id: "sfc_mens", nameKey: "cat_sfc_mens", icon: "•", isSub: true, parent: "skin_face_care" },

  { id: "hair_care", nameKey: "cat_hair_care", icon: "•" },
  { id: "hc_oil", nameKey: "cat_hc_oil", icon: "•", isSub: true, parent: "hair_care" },
  { id: "hc_shampoo", nameKey: "cat_hc_shampoo", icon: "•", isSub: true, parent: "hair_care" },
  { id: "hc_color", nameKey: "cat_hc_color", icon: "•", isSub: true, parent: "hair_care" },
  { id: "hc_gel", nameKey: "cat_hc_gel", icon: "•", isSub: true, parent: "hair_care" },
  { id: "hc_mehndi", nameKey: "cat_hc_mehndi", icon: "•", isSub: true, parent: "hair_care" },

  { id: "dental_care", nameKey: "cat_dental_care", icon: "•" },
  { id: "dc_paste", nameKey: "cat_dc_paste", icon: "•", isSub: true, parent: "dental_care" },
  { id: "dc_brush", nameKey: "cat_dc_brush", icon: "•", isSub: true, parent: "dental_care" },

  { id: "sanitary_pad", nameKey: "cat_sanitary_pad", icon: "•" },
  
  { id: "toiletries", nameKey: "cat_toiletries", icon: "•" },

  { id: "fabric_utensil_care", nameKey: "cat_fabric_utensil_care", icon: "•" },
  { id: "fuc_fabric", nameKey: "cat_fuc_fabric", icon: "•", isSub: true, parent: "fabric_utensil_care" },
  { id: "fuc_utensil", nameKey: "cat_fuc_utensil", icon: "•", isSub: true, parent: "fabric_utensil_care" },

  { id: "fragrance", nameKey: "cat_fragrance", icon: "•" },
  
  { id: "mosquito_killer", nameKey: "cat_mosquito_killer", icon: "•" },
  
  { id: "chocolate_wafers", nameKey: "cat_chocolate_wafers", icon: "•" },
  
  { id: "noodles_pasta", nameKey: "cat_noodles_pasta", icon: "•" },
  
  { id: "health_drink", nameKey: "cat_health_drink", icon: "•" },
  
  { id: "edible_oil_ghee", nameKey: "cat_edible_oil_ghee", icon: "•" },
  
  { id: "spice", nameKey: "cat_spice", icon: "•" },

  // --- EXISTING CATEGORY PRESERVATION (For old items compatibility) ---
  { id: "beverages",      nameKey: "cat_beverages",      icon: "•" },
  { id: "snacks",         nameKey: "cat_snacks",         icon: "•" },
  { id: "personal_care",  nameKey: "cat_personal_care",  icon: "•" },
  { id: "household",      nameKey: "cat_household",      icon: "•" },
  { id: "dairy",          nameKey: "cat_dairy",          icon: "•" },
  { id: "packaged_foods", nameKey: "cat_packaged",       icon: "•" }
];
