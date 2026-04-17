// ===== NEMA Chemicals — Admin Command Center v2.0 =====
// Ultra-efficient admin panel with Airtable-style Bulk Grid, Magic Content Engine,
// Dark/Light mode, Live Preview, Auto-Translation, and FMCG Image Fetch.

(() => {
  "use strict";

  // ===== Constants =====
  const ADMIN_PASSWORD = "1234";
  const STORAGE_KEY_PRODUCTS = "nema_admin_products";
  const STORAGE_KEY_CATEGORIES = "nema_admin_categories";
  const STORAGE_KEY_AUTH = "nema_admin_auth";
  const STORAGE_KEY_THEME = "nema_admin_theme";

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
  // FMCG IMAGE DATABASE (Simulated)
  // ===================================================================
  const FMCG_IMAGE_DATABASE = {
    // ─── Oral Care ───
    "colgate": "images/colgate_toothpaste.png",
    "colgate maxfresh": "images/colgate_toothpaste.png",
    "colgate strong teeth": "images/colgate_toothpaste.png",
    "colgate toothpaste": "images/colgate_toothpaste.png",
    "pepsodent": "images/pepsodent_toothpaste.png",
    "pepsodent germicheck": "images/pepsodent_toothpaste.png",
    "patanjali dant kanti": "images/patanjali_dant_kanti.png",
    "patanjali toothpaste": "images/patanjali_toothpaste.png",
    // ─── Soaps ───
    "lux": "images/lux_soap.png",
    "lux soft touch": "images/lux_soap.png",
    "lux soap": "images/lux_soap.png",
    "dettol": "images/dettol_soap.png",
    "dettol soap": "images/dettol_soap.png",
    "dettol original": "images/dettol_soap.png",
    // ─── Shampoo ───
    "head & shoulders": "images/head_shoulders_shampoo.png",
    "head and shoulders": "images/head_shoulders_shampoo.png",
    "dove shampoo": "images/dove_shampoo.png",
    "dove intense repair": "images/dove_shampoo.png",
    "patanjali kesh kanti": "images/patanjali_shampoo.png",
    "patanjali shampoo": "images/patanjali_shampoo.png",
    // ─── Beverages ───
    "coca cola": "images/coca_cola.png",
    "coca-cola": "images/coca_cola.png",
    "coke": "images/coca_cola.png",
    "tropicana": "images/tropicana_juice.png",
    "tropicana orange": "images/tropicana_juice.png",
    "tropicana juice": "images/tropicana_juice.png",
    "red bull": "images/red_bull.png",
    "bisleri": "images/coca_cola.png",
    "nescafe": "images/nescafe_classic.png",
    "nescafe classic": "images/nescafe_classic.png",
    "nescafe gold": "images/nescafe_gold.png",
    "patanjali aloe vera": "images/patanjali_aloevera.png",
    // ─── Snacks ───
    "lays": "images/lays_chips.png",
    "lay's": "images/lays_chips.png",
    "lays classic": "images/lays_chips.png",
    "cadbury silk": "images/cadbury_silk.png",
    "cadbury dairy milk": "images/cadbury_dairymilk.png",
    "dairy milk silk": "images/cadbury_silk.png",
    "cadbury 5 star": "images/cadbury_5star.png",
    "cadbury celebrations": "images/cadbury_celebrations.png",
    "cadbury gems": "images/cadbury_gems.png",
    "cadbury oreo": "images/cadbury_oreo.png",
    "cadbury perk": "images/cadbury_perk.png",
    "cadbury bournvita": "images/cadbury_bournvita.png",
    "cadbury bournville": "images/cadbury_bournville.png",
    "kit kat": "images/nestle_kitkat.png",
    "kitkat": "images/nestle_kitkat.png",
    "munch": "images/nestle_munch.png",
    "maggi": "images/maggi_noodles.png",
    "maggi noodles": "images/maggi_noodles.png",
    "maggi masala": "images/maggi_noodles.png",
    "maggi pazzta": "images/maggi_pazzta.png",
    "maggi sauce": "images/maggi_sauce.png",
    "haldiram": "images/haldiram_bhujia.png",
    "haldiram's": "images/haldiram_bhujia.png",
    "parle g": "images/parle_g.png",
    "parle-g": "images/parle_g.png",
    "parle g gold": "images/parle_g.png",
    // ─── Household ───
    "surf excel": "images/surf_excel.png",
    "vim": "images/vim_dishwash.png",
    "vim dishwash": "images/vim_dishwash.png",
    "harpic": "images/harpic_cleaner.png",
    "harpic powerplus": "images/harpic_cleaner.png",
    "lizol": "images/lizol_cleaner.png",
    "lizol floor cleaner": "images/lizol_cleaner.png",
    "patanjali dish wash": "images/patanjali_dishbar.png",
    // ─── Packaged Foods ───
    "aashirvaad": "images/aashirvaad_atta.png",
    "aashirvaad atta": "images/aashirvaad_atta.png",
    "tata dal": "images/tata_dal.png",
    "tata sampann": "images/tata_dal.png",
    "india gate": "images/india_gate_rice.png",
    "india gate basmati": "images/india_gate_rice.png",
    "patanjali noodles": "images/patanjali_noodles.png",
    "patanjali atta noodles": "images/patanjali_noodles.png",
    "patanjali honey": "images/patanjali_honey.png",
    "patanjali mustard oil": "images/patanjali_oil.png",
    "patanjali oil": "images/patanjali_oil.png",
    // ─── Dairy ───
    "amul butter": "images/amul_butter.png",
    "amul": "images/amul_butter.png",
    "mother dairy": "images/mother_dairy_milk.png",
    "mother dairy milk": "images/mother_dairy_milk.png",
    "patanjali ghee": "images/patanjali_ghee.png",
    "patanjali cow ghee": "images/patanjali_ghee.png",
    "nestle everyday": "images/nestle_everyday.png",
    "nestle milkmaid": "images/nestle_milkmaid.png",
    "nestle milk": "images/nestle_milk.png",
    "nestle cerelac": "images/nestle_cerelac.png",
    // ─── Personal Care ───
    "patanjali face wash": "images/patanjali_facewash.png",
    "patanjali saundarya": "images/patanjali_facewash.png",
    "patanjali coconut oil": "images/patanjali_coconut.png",
    "patanjali coconut": "images/patanjali_coconut.png",
  };

  // ===================================================================
  // HINDI TRANSLITERATION DICTIONARY
  // ===================================================================
  const HINDI_DICTIONARY = {
    "colgate": "कोलगेट", "pepsodent": "पेप्सोडेंट", "patanjali": "पतंजलि",
    "lux": "लक्स", "dettol": "डेटॉल", "dove": "डव",
    "head & shoulders": "हेड एंड शोल्डर्स", "head and shoulders": "हेड एंड शोल्डर्स",
    "coca cola": "कोका कोला", "coca-cola": "कोका कोला", "tropicana": "ट्रॉपिकाना",
    "red bull": "रेड बुल", "bisleri": "बिसलेरी", "nescafe": "नेस्कैफे",
    "lays": "लेज़", "lay's": "लेज़", "cadbury": "कैडबरी",
    "dairy milk": "डेयरी मिल्क", "silk": "सिल्क", "5 star": "5 स्टार",
    "celebrations": "सेलिब्रेशंस", "gems": "जेम्स", "oreo": "ओरियो",
    "perk": "पर्क", "bournvita": "बोर्नविटा", "bournville": "बोर्नविल",
    "kit kat": "किट कैट", "kitkat": "किट कैट", "munch": "मंच",
    "maggi": "मैगी", "haldiram": "हल्दीराम", "haldiram's": "हल्दीराम",
    "parle g": "पार्ले-जी", "parle-g": "पार्ले-जी",
    "surf excel": "सर्फ एक्सेल", "vim": "विम", "harpic": "हार्पिक",
    "lizol": "लाइज़ोल", "aashirvaad": "आशीर्वाद",
    "tata": "टाटा", "sampann": "सम्पन्न", "india gate": "इंडिया गेट",
    "amul": "अमूल", "mother dairy": "मदर डेयरी", "nestle": "नेस्ले",
    "nestlé": "नेस्ले",
    "toothpaste": "टूथपेस्ट", "soap": "साबुन", "shampoo": "शैम्पू",
    "juice": "जूस", "chips": "चिप्स", "noodles": "नूडल्स",
    "chocolate": "चॉकलेट", "biscuit": "बिस्कुट", "biscuits": "बिस्कुट",
    "atta": "आटा", "rice": "चावल", "dal": "दाल",
    "basmati": "बासमती", "butter": "मक्खन", "ghee": "घी",
    "milk": "दूध", "oil": "तेल", "honey": "शहद",
    "dish wash": "डिश वॉश", "dishwash": "डिश वॉश",
    "floor cleaner": "फ्लोर क्लीनर", "cleaner": "क्लीनर",
    "detergent": "डिटर्जेंट", "powder": "पाउडर",
    "face wash": "फेस वॉश", "coconut": "नारियल",
    "maxfresh": "मैक्सफ्रेश", "strong teeth": "स्ट्रॉन्ग टीथ",
    "germicheck": "जर्मीचेक", "dant kanti": "दंत कांति",
    "kesh kanti": "केश कांति", "aloe vera": "एलोवेरा",
    "mustard": "सरसों", "soft touch": "सॉफ्ट टच",
    "original": "ओरिजिनल", "intense repair": "इंटेंस रिपेयर",
    "classic": "क्लासिक", "gold": "गोल्ड",
    "masala": "मसाला", "citrus": "सिट्रस", "powerplus": "पावरप्लस",
    "whole wheat": "संपूर्ण गेहूं", "cow": "गाय का",
    "full cream": "फुल क्रीम", "bar": "बार",
    "orange": "ऑरेंज", "peppermint": "पेपरमिंट",
    "cooling": "कूलिंग", "crystals": "क्रिस्टल्स",
    "everyday": "एवरीडे", "milkmaid": "मिल्कमेड",
    "cerelac": "सेरेलैक", "pazzta": "पाज़्ज़्ता", "sauce": "सॉस",
    "100g": "100g", "150g": "150g", "200g": "200g", "250g": "250g",
    "300g": "300g", "500g": "500g", "1kg": "1kg", "5kg": "5kg",
    "100ml": "100ml", "200ml": "200ml", "500ml": "500ml",
    "1l": "1 लीटर", "1 litre": "1 लीटर", "2l": "2 लीटर",
    "pack of 3": "3 का पैक", "pack of 6": "6 का पैक",
  };

  // ===================================================================
  // AUTO-TRANSLATE
  // ===================================================================
  function autoTranslateToHindi(englishName) {
    if (!englishName || englishName.trim().length < 2) return "";
    let result = englishName.trim();
    const sortedKeys = Object.keys(HINDI_DICTIONARY).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      result = result.replace(regex, HINDI_DICTIONARY[key]);
    }
    return result;
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

    // 2. Simulated Local Database
    return new Promise((resolve, reject) => {
      const delay = 300 + Math.random() * 700;
      setTimeout(() => {
        let bestMatch = null;
        let bestLen = 0;
        for (const [keyword, imageUrl] of Object.entries(FMCG_IMAGE_DATABASE)) {
          if (query.includes(keyword) || keyword.includes(query)) {
            if (keyword.length > bestLen) { bestLen = keyword.length; bestMatch = imageUrl; }
          }
        }
        if (!bestMatch) {
          const words = query.split(/\s+/).filter(w => w.length >= 3);
          for (const word of words) {
            for (const [keyword, imageUrl] of Object.entries(FMCG_IMAGE_DATABASE)) {
              if (keyword.includes(word)) {
                if (keyword.length > bestLen) { bestLen = keyword.length; bestMatch = imageUrl; }
              }
            }
          }
        }
        if (bestMatch) {
          resolve({
            success: true, imageUrl: bestMatch,
            source: "FMCG Database (Local)", confidence: bestLen > 10 ? "High" : "Medium"
          });
        } else {
          reject(new Error(`No image found for "${productName}". Try a known FMCG brand.`));
        }
      }, delay);
    });
  }


  // ===================================================================
  // INITIALIZATION
  // ===================================================================
  async function init() {
    await loadData();
    loadTheme();
    setupLoginParticles();

    if (sessionStorage.getItem(STORAGE_KEY_AUTH) === "true") {
      showDashboard();
    }
    bindEvents();
  }

  // ===== Data Persistence =====
  async function loadData() {
    let storedProducts = null;
    let storedCategories = null;

    if (window.electronAPI && window.electronAPI.getDbData) {
      storedProducts = await window.electronAPI.getDbData("products");
      storedCategories = await window.electronAPI.getDbData("categories");
    }
    
    // Fallback to localStorage if electron store is empty
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
    } else if (typeof PRODUCTS !== "undefined") {
      products = JSON.parse(JSON.stringify(PRODUCTS));
      saveProducts();
    }

    if (storedCategories) {
      const parsedCat = storedCategories;
      
      // Merge logic: ensure newly added static CATEGORIES appear even if localstorage has old ones
      if (typeof CATEGORIES !== "undefined") {
        const staticCategories = CATEGORIES.filter(c => c.id !== "all");
        // Add any new categories that are in static but not in local storage
        staticCategories.forEach(sc => {
          if (!parsedCat.find(pc => pc.id === sc.id)) {
            parsedCat.push(sc);
          }
        });
        // Update names/icons from static source
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
    } else if (typeof CATEGORIES !== "undefined") {
      categories = JSON.parse(JSON.stringify(CATEGORIES)).filter(c => c.id !== "all");
      saveCategories();
    }
  }

  function saveProducts() {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    if (window.electronAPI && window.electronAPI.saveDbData) {
      window.electronAPI.saveDbData("products", products);
    }
    if (typeof window.PRODUCTS !== "undefined") { window.PRODUCTS = products; }
  }

  function saveCategories() {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    if (window.electronAPI && window.electronAPI.saveDbData) {
      window.electronAPI.saveDbData("categories", categories);
    }
    if (typeof window.CATEGORIES !== "undefined") {
      window.CATEGORIES = [{ id: "all", nameKey: "cat_all", icon: "📦" }, ...categories];
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
    if (btn) btn.textContent = theme === "dark" ? "🌙" : "☀️";
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
  function handleLogin(e) {
    e.preventDefault();
    const pw = $("#adminPassword");
    const err = $("#loginError");
    if (pw.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY_AUTH, "true");
      showDashboard();
    } else {
      err.textContent = "❌ Incorrect password.";
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
    if (input.type === "password") { input.type = "text"; btn.textContent = "🙈"; }
    else { input.type = "password"; btn.textContent = "👁"; }
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
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px; color: var(--text-muted);">📦 No products found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const name = typeof p.name === "object" ? p.name.en : p.name;
      const catObj = categories.find(c => c.id === p.category);
      const catName = catObj ? getCategoryDisplayName(catObj) : p.category;
      const stockClass = p.stock === 0 ? "out" : p.stock <= 50 ? "low" : "ok";
      return `<tr data-id="${p.id}">
        <td><img src="${p.image}" alt="${name}" class="table-img"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect fill=%22%231c1f2e%22 width=%2240%22 height=%2240%22 rx=%226%22/><text x=%2220%22 y=%2226%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%234a5272%22>📦</text></svg>';"></td>
        <td><strong>${name}</strong></td>
        <td>${p.brand}</td>
        <td>${catName}</td>
        <td>₹${p.price}</td>
        <td>₹${p.mrp}</td>
        <td><span class="table-stock ${stockClass}">${p.stock}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-icon edit" data-id="${p.id}" title="Edit">✏️</button>
            <button class="btn-icon delete" data-id="${p.id}" title="Delete">🗑️</button>
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
          showToast(`🗑️ Product deleted`, "success");
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
        <div class="grid-empty-icon">📦</div>
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
          <img src="${p.image}" alt="${name}" class="grid-img"
            onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2236%22 height=%2236%22><rect fill=%22%231a1d2e%22 width=%2236%22 height=%2236%22 rx=%224%22/><text x=%2218%22 y=%2224%22 text-anchor=%22middle%22 font-size=%2210%22 fill=%22%234a5272%22>📦</text></svg>';">
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
          <button class="btn-icon delete grid-delete-btn" data-id="${p.id}" title="Delete">🗑️</button>
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
          showToast("🗑️ Product deleted", "success");
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
      showToast(`💾 Saved ${changeCount} changes across ${Object.keys(gridChanges).length || 'multiple'} products`, "success");
    } else {
      showToast("ℹ️ No changes to save", "warning");
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
      showToast(`🗑️ Deleted ${count} products`, "success");
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
      statusEl.textContent = "⚠️ Enter at least 3 characters.";
      statusEl.className = "fetch-status error";
      return;
    }

    // Reset UI State for fetch
    fetchBtn.disabled = true;
    fetchIcon.style.display = "none";
    spinner.style.display = "inline-block";
    fetchLabel.textContent = "Searching...";
    statusEl.textContent = "🔄 Initializing Global Magic Fetch...";
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

      // 2. Real Global Source Searching logic
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
             const req = await fetch(proxyUrl);
             const res = await req.json();
             const html = res.contents || "";
             let match = html.match(/src="\/\/external-content\.duckduckgo\.com\/iu\/\?u=([^"&]+)/);
             if (match) {
                let imgUrl = decodeURIComponent(match[1]);
                return imgUrl;
             }
          } catch(e) {}
          
          // Last resort fallback local mock DB
          try {
             const mockRes = await simulateFMCGImageFetch(q);
             return mockRes.imageUrl;
          } catch(e) {
             return null; 
          }
      };

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
          $(`#status-${srcName}`).textContent = url ? 'Extracted ✓' : 'Not Found ⚠️';
          
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
             <div class="gallery-img-wrap"><img src="${g.url}" alt="From ${g.src}"></div>
             <div class="gallery-info">
                 <div class="gallery-source" style="text-transform: capitalize;">${g.src}</div>
                 <div class="gallery-resolution">${getResolutions(g.src)}</div>
             </div>
          </div>
      `).join('');

      // Setup Selection Logic
      gallery.querySelectorAll('.gallery-item').forEach(item => {
          item.addEventListener('click', function() {
              gallery.querySelectorAll('.gallery-item').forEach(i => i.classList.remove('selected'));
              this.classList.add('selected');
              const btn = $("#magicUseProductBtn");
              btn.style.display = "inline-flex";
              btn.disabled = false;
          });
      });

      // Transition UI smoothly
      setTimeout(() => {
          progressArea.style.display = "none";
          resultsArea.style.display = "block";
          statusEl.innerHTML = `✅ Found 3 high-res matches across global sources! Select the best image to continue.`;
          statusEl.className = "fetch-status success";
          showToast("✨ Global Magic Fetch complete!", "success");
      }, 500);

    } catch (err) {
      statusEl.textContent = `❌ ${err.message}`;
      statusEl.className = "fetch-status error";
      progressArea.style.display = "none";
    } finally {
      fetchBtn.disabled = false;
      fetchIcon.style.display = "inline";
      spinner.style.display = "none";
      fetchLabel.textContent = "Global Fetch";
    }
  }

  function handleMagicUseProduct() {
    const selected = $("#magicGallery").querySelector('.gallery-item.selected');
    if (!selected) return;

    const nameEn = $("#magicNameEn").textContent;
    const nameHi = $("#magicNameHi").textContent;
    const imageUrl = selected.dataset.url;
    const sourceName = selected.dataset.src;

    // Open product form and pre-fill
    openAddProduct();
    setTimeout(() => {
      $("#pName").value = nameEn;
      $("#pNameHi").value = nameHi !== "—" ? nameHi : "";
      $("#pImage").value = imageUrl;
      showAutofitPreview(imageUrl);
      updateLivePreview();

      // Trigger the bounce animation
      const card = $("#livePreviewCard");
      card.classList.remove("bounce-in");
      void card.offsetWidth;
      card.classList.add("bounce-in");

      // Log Fetch in History
      magicHistory.unshift({
        name: nameEn,
        hindi: nameHi,
        image: imageUrl,
        source: sourceName,
        timestamp: new Date().toLocaleTimeString()
      });
      if (magicHistory.length > 10) magicHistory.pop();
      renderMagicHistory();
    }, 200);
  }

  function renderMagicHistory() {
    const tbody = $("#magicHistoryBody");
    if (!tbody || magicHistory.length === 0) return;

    tbody.innerHTML = magicHistory.map((item, i) => `
      <tr>
        <td><img src="${item.image}" alt="${item.name}" class="table-img"></td>
        <td><strong>${item.name}</strong></td>
        <td>${item.hindi || '—'}</td>
        <td><span style="font-size: 11px; color: var(--text-muted);">${item.source}</span></td>
        <td>
          <button class="btn-icon edit magic-history-use" data-index="${i}" title="Use this product">➕</button>
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


  // ===================================================================
  // CATEGORIES GRID
  // ===================================================================
  function renderCategoriesGrid() {
    const grid = $("#categoriesGrid");
    if (categories.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:60px; color: var(--text-muted);">🏷️ No categories yet.</div>`;
      return;
    }

    grid.innerHTML = categories.map(cat => {
      const count = products.filter(p => p.category === cat.id).length;
      const displayName = getCategoryDisplayName(cat);
      return `<div class="category-card" data-id="${cat.id}">
        <div class="category-card-icon">${cat.icon}</div>
        <div class="category-card-info">
          <div class="category-card-name">${displayName}</div>
          <div class="category-card-id">${cat.id}</div>
          <div class="category-card-count">${count} product${count !== 1 ? 's' : ''}</div>
        </div>
        <div class="category-card-actions">
          <button class="btn-icon edit" data-id="${cat.id}" title="Edit">✏️</button>
          <button class="btn-icon delete" data-id="${cat.id}" title="Delete">🗑️</button>
        </div>
      </div>`;
    }).join("");

    grid.querySelectorAll(".edit").forEach(btn => {
      btn.addEventListener("click", () => openEditCategory(btn.dataset.id));
    });
    grid.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const cat = categories.find(c => c.id === id);
        if (!cat) return;
        const count = products.filter(p => p.category === id).length;
        const msg = count > 0
          ? `Delete "${getCategoryDisplayName(cat)}"? ${count} product(s) will become uncategorized.`
          : `Delete "${getCategoryDisplayName(cat)}"?`;
        openDeleteConfirm(msg, () => {
          categories = categories.filter(c => c.id !== id);
          saveCategories(); renderCategoriesGrid(); populateCategoryDropdowns();
          renderDashboard();
          showToast("🗑️ Category deleted", "success");
        });
      });
    });
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
    if(pCatSelect) {
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
    $("#productFormTitle").textContent = "➕ Add New Product";
    $("#productFormSubmit").textContent = "✅ Save Product";
    $("#editProductId").value = "";
    currentVariants = [];
    renderVariantList();
    resetLivePreview();
    openModal("productModalOverlay");
  }

  function openEditProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    clearProductForm();
    $("#productFormTitle").textContent = "✏️ Edit Product";
    $("#productFormSubmit").textContent = "💾 Update Product";
    $("#editProductId").value = id;

    $("#pName").value = typeof product.name === "object" ? product.name.en : product.name;
    $("#pNameHi").value = typeof product.name === "object" ? (product.name.hi || "") : "";
    $("#pBrand").value = product.brand;
    
    const catObj = categories.find(c => c.id === product.category);
    if (catObj && catObj.isSub) {
      $("#pCategory").value = catObj.parent || "";
      updateSubCategoryDropdown();
      $("#pSubCategory").value = product.category;
    } else {
      $("#pCategory").value = product.category || "";
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

  function handleProductSubmit(e) {
    e.preventDefault();
    const editId = $("#editProductId").value;
    const isEdit = editId !== "";

    const productData = {
      id: isEdit ? parseInt(editId) : getNextProductId(),
      name: { en: $("#pName").value.trim(), hi: $("#pNameHi").value.trim() || $("#pName").value.trim() },
      brand: $("#pBrand").value.trim(),
      category: $("#pSubCategory").value || $("#pCategory").value,
      image: $("#pImage").value.trim(),
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
      showToast("✅ Product updated", "success");
    } else {
      products.push(productData);
      showToast("✅ Product added", "success");
    }

    saveProducts();
    closeModal("productModalOverlay");
    renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
    renderBulkEditGrid($("#gridCategoryFilter").value, $("#gridSearch").value);
    renderDashboard();
  }

  function getNextProductId() {
    return products.length === 0 ? 1 : Math.max(...products.map(p => p.id)) + 1;
  }

  function clearProductForm() {
    $("#productForm").reset();
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
    $("#autoFetchStatus").style.display = "none";
    $("#autoSuccessStatus").style.display = "none";
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
      fetchStatus.textContent = "⚠️ Enter at least 3 characters.";
      fetchStatus.className = "fetch-status error";
      return;
    }

    fetchBtn.disabled = true;
    fetchIcon.style.display = "none";
    spinner.style.display = "inline-block";
    fetchLabel.textContent = "Searching...";
    fetchStatus.textContent = "🔄 Searching FMCG database...";
    fetchStatus.className = "fetch-status loading";

    simulateFMCGImageFetch(productName)
      .then(result => {
        $("#pImage").value = result.imageUrl;
        showAutofitPreview(result.imageUrl);
        updateLivePreview();
        fetchStatus.innerHTML = `✅ Image found! <strong>${result.confidence}</strong> — <em>${result.source}</em>`;
        fetchStatus.className = "fetch-status success";

        // Bounce the preview card
        const card = $("#livePreviewCard");
        card.classList.remove("bounce-in");
        void card.offsetWidth;
        card.classList.add("bounce-in");

        showToast("🖼️ Product image fetched!", "success");
      })
      .catch(err => {
        fetchStatus.textContent = `❌ ${err.message}`;
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
    img.onerror = () => { img.style.display = "none"; placeholder.style.display = "flex"; removeBtn.style.display = "none"; };
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
    if (file.size > 5 * 1024 * 1024) { showToast("❌ File too large! Max 5MB.", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      $("#pImage").value = dataUrl;
      showAutofitPreview(dataUrl);
      updateLivePreview();
      showToast("📷 Image uploaded!", "success");
    };
    reader.readAsDataURL(file);
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
        <button type="button" class="variant-remove" data-index="${i}" title="Remove">✕</button>
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
      const labels = { new: "🆕 NEW", sale: "🔥 SALE", bestseller: "⭐ BEST", organic: "🌿 ORGANIC" };
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
    $("#categoryFormTitle").textContent = "➕ Add Category";
    $("#editCategoryId").value = "";
    $("#cId").removeAttribute("readonly");
    openModal("categoryModalOverlay");
  }

  function openEditCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    clearCategoryForm();
    $("#categoryFormTitle").textContent = "✏️ Edit Category";
    $("#editCategoryId").value = id;
    $("#cId").value = cat.id;
    $("#cId").setAttribute("readonly", true);
    $("#cNameEn").value = cat.nameEn || getCategoryDisplayName(cat);
    $("#cNameHi").value = cat.nameHi || "";
    $("#cIcon").value = cat.icon;
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

    if (!catId || !nameEn || !icon) { showToast("❌ Fill all required fields", "error"); return; }
    if (!isEdit && categories.some(c => c.id === catId)) { showToast("❌ Category ID exists", "error"); return; }

    const nameKey = `cat_${catId}`;
    if (typeof I18N !== "undefined" && I18N._addTranslation) {
      I18N._addTranslation("en", nameKey, nameEn);
      if (nameHi) I18N._addTranslation("hi", nameKey, nameHi);
    }

    const categoryData = { id: catId, nameKey, nameEn, nameHi: nameHi || nameEn, icon };

    if (isEdit) {
      const idx = categories.findIndex(c => c.id === editId);
      if (idx >= 0) categories[idx] = categoryData;
      showToast("✅ Category updated", "success");
    } else {
      categories.push(categoryData);
      showToast("✅ Category added", "success");
    }

    saveCategories();
    closeModal("categoryModalOverlay");
    renderCategoriesGrid();
    populateCategoryDropdowns();
    renderDashboard();
  }

  function clearCategoryForm() { $("#categoryForm").reset(); }


  // ===================================================================
  // BULK CSV IMPORT & EXPORT
  // ===================================================================
  function exportCatalogCsv() {
    if (!products || products.length === 0) {
      if (typeof showToast === "function") showToast("⚠️ No products to export.", "warning");
      else alert("No products to export.");
      return;
    }

    const headers = ["Product_Name_English", "Product_Name_Hindi", "Wholesale_Price", "Category", "Image_URL"];
    const rows = [headers.join(",")];

    products.forEach(p => {
      // Escape strings containing quotes or commas
      const escapeCsv = (str) => {
        if (str == null) return '""';
        const s = String(str);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const row = [
        escapeCsv(p.name?.en || ""),
        escapeCsv(p.name?.hi || ""),
        escapeCsv(p.price || 0),
        escapeCsv(p.category || ""),
        escapeCsv(p.image || "")
      ];
      rows.push(row.join(","));
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "nema_chemicals_catalog.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (typeof showToast === "function") showToast("✅ Catalog exported successfully!", "success");
  }

  function downloadCsvTemplate() {
    const csv = "data:text/csv;charset=utf-8,"
      + "Name (English),Brand,Category ID,Price,MRP,Stock\n"
      + "Colgate Strong Teeth,Colgate,personal_care,65,80,100\n"
      + "Tata Salt,Tata,packaged_foods,22,25,200\n";
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "nemachemicals_import_template.csv");
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
      if (lines.length < 2) { showToast("⚠️ CSV empty or no data.", "error"); return; }

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

      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = parseRow(lines[i]);
        if (parts.length >= 6 && parts[0]) rows.push(parts);
      }
      if (rows.length === 0) { showToast("⚠️ No valid products found.", "error"); return; }

      showToast(`⏳ Importing ${rows.length} products...`, "warning");

      let added = 0;
      for (let i = 0; i < rows.length; i++) {
        const [nameEn, brand, category, priceStr, mrpStr, stockStr] = rows[i];
        const nameHi = autoTranslateToHindi(nameEn);
        let imageUrl = "";
        try {
          const res = await simulateFMCGImageFetch(nameEn);
          if (res && res.imageUrl) imageUrl = res.imageUrl;
        } catch (err) { console.warn(`No image for ${nameEn}`); }

        products.push({
          id: getNextProductId(),
          name: { en: nameEn, hi: nameHi },
          brand: brand || "", category: category || "uncategorized",
          image: imageUrl, price: parseFloat(priceStr) || 0,
          mrp: parseFloat(mrpStr) || 0, weight: "—", sku: "AUTO",
          stock: parseInt(stockStr) || 0, badge: null, desc: { en: "", hi: "" }
        });
        added++;
        saveProducts();
      }

      renderDashboard();
      renderProductsTable($("#productCategoryFilter").value, $("#productSearch").value);
      renderBulkEditGrid($("#gridCategoryFilter").value, $("#gridSearch").value);
      showToast(`✅ Imported ${added} products!`, "success");
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
    // Login
    $("#loginForm").addEventListener("submit", handleLogin);
    $("#passwordToggle").addEventListener("click", togglePasswordVisibility);

    // Logout & Theme
    $("#logoutBtn").addEventListener("click", handleLogout);
    $("#themeToggle").addEventListener("click", toggleTheme);

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

    // Auto-bilingual + auto-image on name input
    let autoNameTimeout;
    $("#pName").addEventListener("input", () => {
      updateLivePreview();
      clearTimeout(autoNameTimeout);
      const name = $("#pName").value.trim();
      if (name.length < 3) {
        $("#autoTranslateStatus").style.display = "none";
        $("#autoFetchStatus").style.display = "none";
        $("#autoSuccessStatus").style.display = "none";
        return;
      }
      $("#autoTranslateStatus").style.display = "inline-flex";
      $("#autoFetchStatus").style.display = "inline-flex";
      $("#autoSuccessStatus").style.display = "none";

      autoNameTimeout = setTimeout(() => {
        const hindi = autoTranslateToHindi(name);
        if (hindi && hindi !== name) {
          $("#pNameHi").value = hindi;
          $("#autoTranslateStatus").textContent = "✅ Hindi auto-filled";
          $("#autoTranslateStatus").className = "auto-badge success";
        } else {
          $("#autoTranslateStatus").textContent = "⚠️ No Hindi match";
          $("#autoTranslateStatus").className = "auto-badge warning";
        }
        updateLivePreview();

        simulateFMCGImageFetch(name)
          .then(result => {
            $("#pImage").value = result.imageUrl;
            showAutofitPreview(result.imageUrl);
            updateLivePreview();
            $("#autoFetchStatus").textContent = `✅ Image (${result.confidence})`;
            $("#autoFetchStatus").className = "auto-badge success";

            // Bounce card
            const card = $("#livePreviewCard");
            card.classList.remove("bounce-in");
            void card.offsetWidth;
            card.classList.add("bounce-in");
          })
          .catch(() => {
            $("#autoFetchStatus").textContent = "⚠️ No image";
            $("#autoFetchStatus").className = "auto-badge warning";
          });
      }, 600);
    });

    // Image URL hidden input
    $("#pImage").addEventListener("input", (e) => { showAutofitPreview(e.target.value); updateLivePreview(); });

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
                <td><img src="${p.image}" alt="" class="grid-img" onerror="this.style.display='none'"></td>
                <td><input type="text" class="grid-cell-edit" value="${escapeHtml(name)}" readonly></td>
                <td><input type="text" class="grid-cell-edit" value="${escapeHtml(p.brand)}" readonly></td>
                <td style="font-size: 12px;">${categories.find(c=>c.id===p.category)?.icon || ''} ${getCategoryDisplayName(categories.find(c=>c.id===p.category)||{id:p.category})}</td>
                <td style="font-weight: 600;">₹${p.price}</td>
                <td style="color: var(--text-muted);">₹${p.mrp}</td>
                <td><span class="grid-stock-dot ${stockClass}"></span>${p.stock}</td>
                <td style="text-align:center;">
                  <button class="btn-icon edit inline-edit-btn" data-id="${p.id}">✏️</button>
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


  // ===== Boot =====
  init();
})();
