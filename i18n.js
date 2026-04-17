// ===== Internationalization (i18n) Module =====
// Supports English and Hindi with extensible architecture for future languages.

const I18N = (() => {
  const translations = {
    en: {
      // Header / Nav
      logo_subtitle: "Wholesale FMCG Catalog",
      search_placeholder: "Search products, brands, categories…",

      // Hero
      hero_badge: "Wholesale Prices",
      hero_title: "Premium FMCG Products at Wholesale Prices",
      hero_subtitle: "India's trusted platform for retailers — real brands, bulk ordering, doorstep delivery.",

      // Sidebar
      categories_title: "Categories",
      cat_all: "All Products",
      
      cat_baby_care: "Baby Care",
      cat_bc_newborn: "0M+ / Newborn kit",
      cat_skin_face_care: "Skin/Face Care",
      cat_sfc_cream: "Creams & Lotions",
      cat_sfc_soap: "Soaps",
      cat_sfc_wash: "Face Wash & Hand Wash",
      cat_sfc_mens: "Men's Care",
      cat_hair_care: "Hair Care",
      cat_hc_oil: "Hair Oil",
      cat_hc_shampoo: "Shampoo",
      cat_hc_color: "Hair Color / Dye",
      cat_hc_gel: "Hair Gel / Cream",
      cat_hc_mehndi: "Mehndi",
      cat_dental_care: "Dental Care",
      cat_dc_paste: "Toothpaste / Powder",
      cat_dc_brush: "Toothbrush",
      cat_sanitary_pad: "Sanitary Pad",
      cat_toiletries: "Toiletries",
      cat_fabric_utensil_care: "Fabric / Utensil Care",
      cat_fuc_fabric: "Fabric Care (Clothes)",
      cat_fuc_utensil: "Utensil Care",
      cat_fragrance: "Fragrance (Perfume/Ittar)",
      cat_mosquito_killer: "Mosquito / Insect Killer",
      cat_chocolate_wafers: "Chocolate / Wafers",
      cat_noodles_pasta: "Noodles / Pasta / Ketchup",
      cat_health_drink: "Health Drink",
      cat_edible_oil_ghee: "Edible Oil / Ghee",
      cat_spice: "Spice",

      // Existing kept categories
      cat_beverages: "Beverages",
      cat_snacks: "Snacks & Confectionery",
      cat_personal_care: "Personal Care",
      cat_household: "Household & Cleaning",
      cat_dairy: "Dairy & Frozen",
      cat_packaged: "Packaged Foods",

      // Toolbar
      showing: "Showing",
      products: "products",
      product: "product",
      sort_name_asc: "Name A-Z",
      sort_name_desc: "Name Z-A",
      sort_price_asc: "Price: Low to High",
      sort_price_desc: "Price: High to Low",
      sort_discount: "Best Discount",

      // Product card
      wholesale_price: "Wholesale Price",
      add_to_cart: "Add to Cart",
      add_to_cart_short: "+ Add to Cart",
      out_of_stock: "Out of Stock",
      low_stock: "Low Stock",
      in_stock: "In Stock",
      off: "off",
      units: "units",

      // Badges
      badge_new: "New",
      badge_sale: "Sale",
      badge_bestseller: "Bestseller",
      badge_organic: "Organic",

      // Modal
      label_weight: "Weight",
      label_brand: "Brand",
      label_sku: "SKU",
      label_stock: "Stock",

      // Cart
      cart_title: "🛒 Your Cart",
      cart_items: "Items",
      cart_total: "Total",
      cart_empty: "Your cart is empty",
      cart_empty_desc: "Add products from the catalog to get started.",
      checkout_btn: "Place Order",
      remove: "Remove",

      // Empty state
      empty_title: "No products found",
      empty_desc: "Try adjusting your search or filter to find what you're looking for.",

      // Toast
      toast_added: "added to cart",

      // Print
      print_catalog: "Print Catalog",
      print_order: "Print Order",

      // Footer
      footer_text: "Wholesale FMCG Distribution",
    },

    hi: {
      // Header / Nav
      logo_subtitle: "थोक FMCG कैटलॉग",
      search_placeholder: "उत्पाद, ब्रांड, श्रेणी खोजें…",

      // Hero
      hero_badge: "थोक मूल्य",
      hero_title: "प्रीमियम FMCG उत्पाद थोक मूल्य पर",
      hero_subtitle: "भारत का भरोसेमंद प्लेटफ़ॉर्म खुदरा विक्रेताओं के लिए — असली ब्रांड, बल्क ऑर्डर, डोरस्टेप डिलीवरी।",

      // Sidebar
      categories_title: "श्रेणियाँ",
      cat_all: "सभी उत्पाद",

      cat_baby_care: "बेबी केयर (Baby Care)",
      cat_bc_newborn: "बेबी किट / नवजात (0M+)",
      cat_skin_face_care: "स्किन/फेस केयर (Skin/Face Care)",
      cat_sfc_cream: "क्रीम, पाउडर, लोशन",
      cat_sfc_soap: "साबुन",
      cat_sfc_wash: "फेस वॉश और हैंड वॉश",
      cat_sfc_mens: "मेंस केयर",
      cat_hair_care: "हेयर केयर (Hair Care)",
      cat_hc_oil: "हेयर ऑयल (तेल)",
      cat_hc_shampoo: "शैम्पू",
      cat_hc_color: "हेयर कलर/डाई",
      cat_hc_gel: "हेयर जेल/क्रीम",
      cat_hc_mehndi: "मेहंदी",
      cat_dental_care: "डेंटल केयर (Dental Care)",
      cat_dc_paste: "टूथपेस्ट/पाउडर",
      cat_dc_brush: "टूथब्रश",
      cat_sanitary_pad: "सेनेटरी पैड (Sanitary Pad)",
      cat_toiletries: "टायलेटरीज (Toiletries)",
      cat_fabric_utensil_care: "फैब्रिक/बर्तन केयर",
      cat_fuc_fabric: "कपड़ों की सफाई",
      cat_fuc_utensil: "बर्तनों की सफाई",
      cat_fragrance: "फ्रैग्रेंस (इत्र/परफ्यूम)",
      cat_mosquito_killer: "मॉस्किटो/इन्सेक्ट किलर",
      cat_chocolate_wafers: "चाकलेट / Wafers",
      cat_noodles_pasta: "नूडल्स / पास्ता / केचप",
      cat_health_drink: "हेल्थ ड्रिंक (Health Drink)",
      cat_edible_oil_ghee: "Edible Oil / घी",
      cat_spice: "स्पाइस (मसाले)",

      // Existing kept categories
      cat_beverages: "पेय पदार्थ",
      cat_snacks: "स्नैक्स और मिठाइयाँ",
      cat_personal_care: "व्यक्तिगत देखभाल",
      cat_household: "घरेलू और सफ़ाई",
      cat_dairy: "डेयरी और फ्रोज़न",
      cat_packaged: "पैकेज्ड फ़ूड",

      // Toolbar
      showing: "दिखा रहे हैं",
      products: "उत्पाद",
      product: "उत्पाद",
      sort_name_asc: "नाम A-Z",
      sort_name_desc: "नाम Z-A",
      sort_price_asc: "मूल्य: कम से ज़्यादा",
      sort_price_desc: "मूल्य: ज़्यादा से कम",
      sort_discount: "सर्वश्रेष्ठ छूट",

      // Product card
      wholesale_price: "थोक मूल्य",
      add_to_cart: "कार्ट में डालें",
      add_to_cart_short: "+ कार्ट में डालें",
      out_of_stock: "स्टॉक में नहीं",
      low_stock: "कम स्टॉक",
      in_stock: "स्टॉक में है",
      off: "छूट",
      units: "इकाइयाँ",

      // Badges
      badge_new: "नया",
      badge_sale: "सेल",
      badge_bestseller: "बेस्टसेलर",
      badge_organic: "ऑर्गेनिक",

      // Modal
      label_weight: "वज़न",
      label_brand: "ब्रांड",
      label_sku: "SKU",
      label_stock: "स्टॉक",

      // Cart
      cart_title: "🛒 आपका कार्ट",
      cart_items: "आइटम",
      cart_total: "कुल",
      cart_empty: "आपका कार्ट खाली है",
      cart_empty_desc: "शुरू करने के लिए कैटलॉग से उत्पाद जोड़ें।",
      checkout_btn: "ऑर्डर करें",
      remove: "हटाएं",

      // Empty state
      empty_title: "कोई उत्पाद नहीं मिला",
      empty_desc: "जो आप ढूंढ रहे हैं उसे खोजने के लिए अपनी खोज या फ़िल्टर बदलें।",

      // Toast
      toast_added: "कार्ट में जोड़ा गया",

      // Print
      print_catalog: "कैटलॉग प्रिंट करें",
      print_order: "ऑर्डर प्रिंट करें",

      // Footer
      footer_text: "थोक FMCG वितरण",
    }
  };

  let currentLang = "en";

  function setLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute("data-lang", lang);

    // Update all elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Update placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });

    // Update option elements
    document.querySelectorAll("[data-i18n-option]").forEach(el => {
      const key = el.getAttribute("data-i18n-option");
      if (translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
  }

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) || key;
  }

  function getLang() {
    return currentLang;
  }

  function toggle() {
    const newLang = currentLang === "en" ? "hi" : "en";
    setLanguage(newLang);
    return newLang;
  }

  return { setLanguage, t, getLang, toggle };
})();
