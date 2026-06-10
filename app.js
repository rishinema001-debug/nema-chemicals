// ===== NEMA Chemicals — FMCG Catalog Application =====
// Modular vanilla JS app with bilingual support, print catalog, and product catalog.
// Cart functionality removed — this is a view-only catalog.

(() => {
  "use strict";

  // ===== DOM Helpers =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== Firebase Database Reference =====
  let firebaseDb = null;
  try {
    if (typeof firebase !== 'undefined' && typeof FIREBASE_CONFIG !== 'undefined') {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      firebaseDb = firebase.database();
      console.log('[Store] Firebase connected');
    }
  } catch (e) {
    console.warn('[Store] Firebase not available:', e.message);
  }

  // ===== Data Source Sync =====
  // Priority: Firebase Cloud DB > localStorage > static products.js
  let APP_PRODUCTS = [];
  let APP_CATEGORIES = [];
  let APP_BRANDS = [];

  function syncData() {
    // ---------- Products ----------
    const rawProducts = localStorage.getItem("nema_admin_products");
    if (rawProducts) {
      try { APP_PRODUCTS = JSON.parse(rawProducts); } catch (_) { APP_PRODUCTS = []; }
      if (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS)) {
        let added = false;
      }
    } else {
      APP_PRODUCTS = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
      localStorage.setItem("nema_admin_products", JSON.stringify(APP_PRODUCTS));
    }
    if (!Array.isArray(APP_PRODUCTS)) APP_PRODUCTS = [];

    // ---------- Categories ----------
    const rawCats = localStorage.getItem("nema_admin_categories");
    let stored = [];
    if (rawCats) {
      try { stored = JSON.parse(rawCats); } catch (_) { stored = []; }
    }
    if (!Array.isArray(stored)) stored = [];

    if (typeof CATEGORIES !== "undefined") {
      CATEGORIES.forEach(sc => {
        if (!stored.find(pc => pc.id === sc.id)) {
          stored.push(sc);
        }
      });
      stored.forEach(pc => {
        const sc = CATEGORIES.find(s => s.id === pc.id);
        if (sc) {
          pc.nameKey = sc.nameKey;
          pc.icon    = sc.icon;
          pc.isSub   = sc.isSub;
          pc.parent  = sc.parent;
        }
      });
    }

    if (!stored.find(c => c.id === "all")) {
      stored.unshift({ id: "all", nameKey: "cat_all", icon: "•" });
    }
    APP_CATEGORIES = stored;

    // Register custom category translations
    if (typeof I18N !== "undefined" && I18N._addTranslation) {
      APP_CATEGORIES.forEach(cat => {
        if (cat.nameEn) I18N._addTranslation("en", cat.nameKey, cat.nameEn);
        if (cat.nameHi) I18N._addTranslation("hi", cat.nameKey, cat.nameHi);
      });
    }

    // ---------- Brands ----------
    const rawBrands = localStorage.getItem("nema_admin_brands");
    if (rawBrands) {
      try { APP_BRANDS = JSON.parse(rawBrands); } catch (_) { APP_BRANDS = []; }
    } else {
      APP_BRANDS = [];
    }
    
    if (!Array.isArray(APP_BRANDS) || APP_BRANDS.length === 0) {
      const uniqueBrands = [...new Set(APP_PRODUCTS.map(p => p.brand))].filter(b => b);
      APP_BRANDS = uniqueBrands.map(name => ({ id: "brand_" + Date.now() + Math.random(), name, image: "" }));
    }

  }

  // ===== Firebase Real-Time Sync =====
  // Listen for cloud changes and auto-refresh the storefront
  function startFirebaseSync() {
    if (!firebaseDb) return;

    firebaseDb.ref('products').on('value', (snap) => {
      if (snap.exists()) {
        const cloudProducts = snap.val();
        if (Array.isArray(cloudProducts) && cloudProducts.length > 0) {
          APP_PRODUCTS = cloudProducts;
          localStorage.setItem("nema_admin_products", JSON.stringify(APP_PRODUCTS));
          renderCategories();
          renderStoreBrands();
          renderProducts();
          console.log('[Store] Products updated from Firebase: ' + cloudProducts.length);
        }
      }
    });

    firebaseDb.ref('categories').on('value', (snap) => {
      if (snap.exists()) {
        const cloudCats = snap.val();
        if (Array.isArray(cloudCats) && cloudCats.length > 0) {
          // Ensure "all" entry
          if (!cloudCats.find(c => c.id === "all")) {
            cloudCats.unshift({ id: "all", nameKey: "cat_all", icon: "•" });
          }
          APP_CATEGORIES = cloudCats;
          localStorage.setItem("nema_admin_categories", JSON.stringify(cloudCats));
          // Register translations
          if (typeof I18N !== "undefined" && I18N._addTranslation) {
            APP_CATEGORIES.forEach(cat => {
              if (cat.nameEn) I18N._addTranslation("en", cat.nameKey, cat.nameEn);
              if (cat.nameHi) I18N._addTranslation("hi", cat.nameKey, cat.nameHi);
            });
          }
          renderCategories();
          renderProducts();
          console.log('[Store] Categories updated from Firebase: ' + cloudCats.length);
        }
      }
    });

    firebaseDb.ref('brands').on('value', (snap) => {
      if (snap.exists()) {
        const cloudBrands = snap.val();
        if (Array.isArray(cloudBrands) && cloudBrands.length > 0) {
          APP_BRANDS = cloudBrands;
          localStorage.setItem("nema_admin_brands", JSON.stringify(APP_BRANDS));
          renderStoreBrands();
          console.log('[Store] Brands updated from Firebase: ' + cloudBrands.length);
        }
      }
    });
  }

  // ===== Image Resolver (uses static IMAGE_INDEX from image-index.js) =====
  // IMAGE_INDEX is loaded globally from image-index.js before this file.
  // If Electron is available, we also try to refresh from filesystem.
  let APP_IMAGES_CACHE = [];

  async function loadImagesCache() {
      // First, try loading from static IMAGE_INDEX (works in both web and Electron)
      if (typeof IMAGE_INDEX !== 'undefined' && Array.isArray(IMAGE_INDEX)) {
          APP_IMAGES_CACHE = [...IMAGE_INDEX];
      }

      // In Electron, also try reading from filesystem for the freshest list
      if (typeof window.electronAPI !== 'undefined' && window.electronAPI.readImagesDirectory) {
          try {
              const files = await window.electronAPI.readImagesDirectory();
              if (files && files.length > 0) {
                  files.forEach(f => {
                      if (!APP_IMAGES_CACHE.includes(f)) APP_IMAGES_CACHE.push(f);
                  });
              }
          } catch(e) {}
      }

      if (APP_IMAGES_CACHE.length > 0) {
          renderProducts(); // re-render once images are found
      }
  }

  function resolveProductImage(product) {
      const fallback = "images/products/grocery-blurred.png";
      const explicitImg = (product.image || "").trim();

      // 1. No image set at all → placeholder
      if (!explicitImg) return fallback;

      // 2. External URL or data URI → use directly
      if (explicitImg.startsWith("http") || explicitImg.startsWith("data:")) {
          return explicitImg;
      }

      // 3. Explicit local path — verify it exists in our index
      const explicitFilename = decodeURI(explicitImg.split("/").pop()).toLowerCase();
      if (APP_IMAGES_CACHE.some(f => decodeURI(f.split("/").pop()).toLowerCase() === explicitFilename)) {
          return encodeURI(explicitImg);
      }

      // 4. The path might be set but not matching index exactly (old format like images/colgate_toothpaste.png vs products/colgate-toothpaste.png)
      //    Try to find the file by just the base name
      const cleanExplicit = explicitFilename.replace(/\.(png|jpe?g|gif|webp|svg)$/i, "").replace(/[-_ ]/g, "");
      const found = APP_IMAGES_CACHE.find(f => {
          const clean = decodeURI(f.split("/").pop()).toLowerCase().replace(/\.(png|jpe?g|gif|webp|svg)$/i, "").replace(/[-_ ]/g, "");
          return clean === cleanExplicit;
      });
      if (found) return encodeURI("images/" + found);

      // 5. If explicit path was set but file not found in index, still try it (might be valid)
      return encodeURI(explicitImg);
  }

  // ===== State =====
  const state = {
    activeCategory: "all",
    expandedCategory: null,
    activeBrand: null,
    searchQuery: "",
    categorySearchQuery: "",
    sortBy: "name-asc",
  };

  // ===== DOM References =====
  const categoryListEl   = $("#categoryList");
  const categorySearchEl = $("#categorySearch");
  const productGridEl    = $("#productGrid");
  const resultCountEl    = $("#resultCount");
  const searchBarEl      = $("#searchBar");
  const sortSelectEl     = $("#sortSelect");
  const emptyStateEl     = $("#emptyState");
  const toastContainer   = $("#toastContainer");
  const mobileMenuToggle = $("#mobileMenuToggle");
  const sidebarEl        = $("#sidebar");
  const langToggle       = $("#langToggle");
  const langLabel        = $("#langLabel");
  const printCatalogBtn  = $("#printCatalogBtn");

  // Modal DOM
  const modalOverlay = $("#modalOverlay");

  // ===== Utility: Get localised text from product =====
  function pName(product) {
    const lang = I18N.getLang();
    return typeof product.name === "object" ? (product.name[lang] || product.name.en) : product.name;
  }

  function pDesc(product) {
    const lang = I18N.getLang();
    return typeof product.desc === "object" ? (product.desc[lang] || product.desc.en) : product.desc;
  }

  window.clearActiveBrand = function() {
    state.activeBrand = null;
    renderStoreBrands($("#storeBrandSearch") ? $("#storeBrandSearch").value : "");
    renderCategories();
    renderProducts();
    const hero = $("#heroBanner");
    if (hero) hero.style.display = "flex";
    const storeBrandsSection = $("#storeBrandsSection");
    if (storeBrandsSection) storeBrandsSection.style.display = "block";
  };

  // ===== Render Categories (Accordion) =====
  function renderCategories() {
    // Only show main (top-level) categories; subs appear via accordion
    let mainCategories = APP_CATEGORIES.filter(c => !c.isSub);
    
    // Sort so "all" is always 1st, then by serial
    mainCategories.sort((a, b) => {
       if (a.id === "all") return -1;
       if (b.id === "all") return 1;
       let serialA = typeof a.serial === 'number' ? a.serial : 9999;
       let serialB = typeof b.serial === 'number' ? b.serial : 9999;
       return serialA - serialB;
    });

    let baseProducts = APP_PRODUCTS;
    if (state.activeBrand) {
      const bObj = APP_BRANDS.find(b => b.id === state.activeBrand);
      if (bObj) {
        baseProducts = APP_PRODUCTS.filter(p => p.brand.toLowerCase() === bObj.name.toLowerCase());
      }
    }

    categoryListEl.innerHTML = mainCategories.map(cat => {
      let children = APP_CATEGORIES.filter(c => c.isSub && c.parent === cat.id);

      if (state.activeBrand && cat.id !== "all") {
         children = children.filter(sub => baseProducts.some(p => p.category === sub.id));
      }

      // If category search is active, filter groups
      if (state.categorySearchQuery) {
        const query = state.categorySearchQuery.toLowerCase();
        const catName = I18N.t(cat.nameKey).toLowerCase();
        
        let childMatches = children.filter(c => I18N.t(c.nameKey).toLowerCase().includes(query));
        let matches = catName.includes(query) || childMatches.length > 0;
        
        if (!matches && cat.id !== "all") {
          return ""; // Hide this main category group
        }
        
        if (childMatches.length > 0 && !catName.includes(query)) {
           // if only children match, only show matching children
           children = childMatches;
        }
      }

      // Count includes children's products
      const count = cat.id === "all"
        ? baseProducts.length
        : baseProducts.filter(p =>
            p.category === cat.id || children.some(ch => ch.id === p.category)
          ).length;

      // Hide category if it has 0 products and a brand is active
      if (state.activeBrand && cat.id !== "all" && count === 0) {
        return "";
      }

      let isExpanded = state.expandedCategory === cat.id;
      if (state.categorySearchQuery && cat.id !== "all") isExpanded = true; 
      
      const isActive   = state.activeCategory === cat.id;
      const showingKids = children.length > 0;

      // Build sub-list HTML
      let subHtml = "";
      if (showingKids) {
        const subItems = children.map(sub => {
          const subCount  = baseProducts.filter(p => p.category === sub.id).length;
          const subActive = state.activeCategory === sub.id;
          return `
            <li>
              <div class="category-item category-sub ${subActive ? 'active' : ''}"
                   data-category="${sub.id}"
                   data-is-sub="true">
                <span class="sub-dot">›</span>
                <span class="category-name">${I18N.t(sub.nameKey)}</span>
                <span class="category-count">${subCount}</span>
              </div>
            </li>`;
        }).join("");

        subHtml = `<ul class="sub-category-list ${isExpanded ? 'expanded' : ''}">${subItems}</ul>`;
      }

      return `
        <li class="cat-group">
          <div class="category-item main-cat-item ${isActive ? 'active' : ''}"
               data-category="${cat.id}"
               data-has-children="${showingKids}">
            <span class="cat-bullet">•</span>
            <span class="category-name">${I18N.t(cat.nameKey)}</span>
            <span class="category-count">${count}</span>
            ${showingKids ? `<span class="cat-chevron ${isExpanded ? 'open' : ''}">‹</span>` : ''}
          </div>
          ${subHtml}
        </li>`;
    }).join("");

    // Bind click events
    $$(".category-item").forEach(item => {
      item.addEventListener("click", () => {
        const catId      = item.dataset.category;
        const hasChildren = item.dataset.hasChildren === "true";
        const isSub      = item.dataset.isSub === "true";

        if (hasChildren && !isSub) {
          // Toggle accordion open/close
          state.expandedCategory = state.expandedCategory === catId ? null : catId;
          state.activeCategory = catId;
        } else {
          state.activeCategory = catId;
          if (window.innerWidth <= 768) sidebarEl.classList.remove("open");
        }
        renderCategories();
        renderProducts();
      });
    });
  }

  // ===== Filter & Sort Products =====
  function getFilteredProducts() {
    let filtered = [...APP_PRODUCTS];

    if (state.searchQuery) {
      // Global search ignores category filter
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        pName(p).toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    } else if (state.activeCategory !== "all") {
      const activeCatObj = APP_CATEGORIES.find(c => c.id === state.activeCategory);
      if (activeCatObj && !activeCatObj.isSub) {
        // Main category → include its own + children products
        const childrenIds = APP_CATEGORIES
          .filter(c => c.isSub && c.parent === state.activeCategory)
          .map(c => c.id);
        filtered = filtered.filter(p =>
          p.category === state.activeCategory || childrenIds.includes(p.category)
        );
      } else {
        filtered = filtered.filter(p => p.category === state.activeCategory);
      }
    }

    if (state.activeBrand) {
      const bObj = APP_BRANDS.find(b => b.id === state.activeBrand);
      if (bObj) {
        filtered = filtered.filter(p => p.brand.toLowerCase() === bObj.name.toLowerCase());
      }
    }

    // Sort
    switch (state.sortBy) {
      case "name-asc":
        filtered.sort((a, b) => pName(a).localeCompare(pName(b)));
        break;
      case "name-desc":
        filtered.sort((a, b) => pName(b).localeCompare(pName(a)));
        break;
      case "price-asc":
        filtered.sort((a, b) => a.mrp - b.mrp);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.mrp - a.mrp);
        break;
    }

    return filtered;
  }

  // ===== Render Brands Carousel =====
  function renderStoreBrands(query = "") {
    const carouselEl = $("#storeBrandsCarousel");
    if (!carouselEl) return;
    const q = query.toLowerCase();
    
    let filteredBrands = APP_BRANDS;
    if (q) {
       filteredBrands = filteredBrands.filter(b => b.name.toLowerCase().includes(q));
    }

    if (filteredBrands.length === 0) {
       carouselEl.innerHTML = `<div style="font-size:13px; color:#64748b; padding:10px;">No brands found matching "${query}"</div>`;
       return;
    }

    carouselEl.innerHTML = filteredBrands.map(b => {
      const isActive = state.activeBrand === b.id;
      return `
        <div class="store-brand-circle ${isActive ? 'active' : ''}" data-id="${b.id}" style="flex: 0 0 80px; display:flex; flex-direction:column; align-items:center; cursor:pointer;">
           <div style="width:70px; height:70px; border-radius:50%; background:#fff; border:${isActive ? '3px solid #2563eb' : '1px solid #e2e8f0'}; display:flex; align-items:center; justify-content:center; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.05); transition:transform 0.2s; transform:${isActive ? 'scale(1.05)' : 'scale(1)'}">
             ${b.image ? `<img src="${b.image}" style="width:100%; height:100%; object-fit:contain; padding:5px;">` : `<span style="font-size:24px; font-weight:800; color:#cbd5e1;">${b.name.charAt(0).toUpperCase()}</span>`}
           </div>
           <span style="font-size:11px; font-weight:600; color:#334155; margin-top:8px; text-align:center; max-width:80px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.name}</span>
        </div>
      `;
    }).join("");

    $$(".store-brand-circle").forEach(el => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        state.activeBrand = state.activeBrand === id ? null : id;
        renderStoreBrands($("#storeBrandSearch").value);
        renderCategories();
        renderProducts();
        
        // Hide/show hero banner and brands section based on brand selection
        const hero = $("#heroBanner");
        if (hero) hero.style.display = state.activeBrand ? "none" : "flex";
        const storeBrandsSection = $("#storeBrandsSection");
        if (storeBrandsSection) storeBrandsSection.style.display = state.activeBrand ? "none" : "block";
      });
    });
  }

  function renderProductCardHTML(product, i, t, badgeMap) {
      return `
        <div class="product-card" data-id="${product.id}" id="product-${product.id}" style="animation-delay: ${i * 0.05}s;">
          <div class="product-image-container">
            ${product.badge ? `<div class="product-badges">${badgeMap[product.badge] || ''}</div>` : ''}
            <img src="${resolveProductImage(product)}" alt="${pName(product)}" class="product-image" loading="lazy"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22%23999%22>Image</text></svg>';">
          </div>
          <div class="product-info">
            <span class="product-brand">${product.brand}</span>
            <h3 class="product-name">${pName(product)}</h3>
            <div class="product-meta">
              <span class="product-weight">${product.weight}</span>
              <span class="product-sku">${product.sku}</span>
            </div>
            ${product.variants && product.variants.length > 0 ? `
              <div class="variant-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(60px, 1fr)); gap:4px; margin-top:8px;">
                ${product.variants.map(v => `
                  <div style="border:1px solid #e5e9f0; border-radius:4px; padding:4px; text-align:center; background:#f8fafc;">
                    <div style="font-size:10px; color:#64748b; margin-bottom:2px;">${v.label || v.weight || '-'}</div>
                    <div style="font-size:11px; font-weight:700; color:#0f172a;">₹${v.mrp}</div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="display:inline-block; border:1px solid #e5e9f0; border-radius:4px; padding:4px 10px; text-align:center; background:#f8fafc; margin-top:8px;">
                <div style="font-size:10px; color:#64748b; margin-bottom:2px;">MRP</div>
                <div style="font-size:13px; font-weight:700; color:#0f172a;">₹${product.mrp}</div>
              </div>
            `}
            <div class="product-stock-label ${product.stock === 0 ? 'out' : product.stock <= 50 ? 'low' : 'ok'}">
              ${product.stock === 0 ? t('out_of_stock') : product.stock <= 50 ? `${t('low_stock')} (${product.stock})` : `${t('in_stock')}`}
            </div>
          </div>
        </div>
      `;
  }

  // ===== Render Products =====
  function renderProducts() {
    const filtered = getFilteredProducts();
    const t = I18N.t;

    resultCountEl.innerHTML = `${t('showing')} <strong>${filtered.length}</strong> ${filtered.length !== 1 ? t('products') : t('product')}`;

    if (filtered.length === 0) {
      if (state.activeBrand) {
        productGridEl.style.display = "";
        emptyStateEl.style.display = "flex";
        const bObj = APP_BRANDS.find(b => b.id === state.activeBrand);
        if (bObj) {
          productGridEl.innerHTML = `
          <div style="grid-column: 1/-1; margin-bottom: 15px;">
            <button onclick="window.clearActiveBrand()" style="background:none; border:none; color:#2563eb; font-weight:600; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:6px; padding:0; font-family: inherit;">
              <span style="font-size:18px;">←</span> Back to Main Page
            </button>
          </div>
          <div style="grid-column: 1/-1; display:flex; justify-content:space-between; align-items:center; background:#1e293b; color:white; padding:20px; border-radius:12px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; gap:15px;">
               <div style="width:50px; height:50px; border-radius:50%; background:white; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                 ${bObj.image ? `<img src="${bObj.image}" style="width:100%;height:100%;object-fit:contain;padding:4px;">` : `<span style="color:#1e293b;font-weight:700;font-size:20px;">${bObj.name.charAt(0).toUpperCase()}</span>`}
               </div>
               <div>
                 <h2 style="margin:0; font-size:22px; font-weight:800;">${bObj.name} Store</h2>
                 <p style="margin:4px 0 0 0; font-size:13px; color:#cbd5e1;">All products matching this brand.</p>
               </div>
            </div>
            <button onclick="window.clearActiveBrand()" style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2); padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px;">
              Home
            </button>
          </div>`;
        } else {
          productGridEl.style.display = "none";
        }
      } else {
        productGridEl.style.display = "none";
        emptyStateEl.style.display = "flex";
      }
      return;
    }

    productGridEl.style.display = "";
    emptyStateEl.style.display = "none";

    const badgeMap = {
      new: `<span class="product-badge badge-new">${t('badge_new')}</span>`,
      sale: `<span class="product-badge badge-sale">${t('badge_sale')}</span>`,
      bestseller: `<span class="product-badge badge-bestseller">${t('badge_bestseller')}</span>`,
      organic: `<span class="product-badge badge-organic">${t('badge_organic')}</span>`,
    };

    if (state.activeBrand) {
      // Render Category Wise
      const categoriesFound = new Set(filtered.map(p => p.category));
      let groupedHtml = "";
      
      const bObj = APP_BRANDS.find(b => b.id === state.activeBrand);
      
      groupedHtml += `
      <div style="grid-column: 1/-1; margin-bottom: 15px;">
        <button onclick="window.clearActiveBrand()" style="background:none; border:none; color:#2563eb; font-weight:600; font-size:14px; cursor:pointer; display:flex; align-items:center; gap:6px; padding:0; font-family: inherit;">
          <span style="font-size:18px;">←</span> Back to Main Page
        </button>
      </div>
      <div style="grid-column: 1/-1; display:flex; justify-content:space-between; align-items:center; background:#1e293b; color:white; padding:20px; border-radius:12px; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:15px;">
           <div style="width:50px; height:50px; border-radius:50%; background:white; display:flex; align-items:center; justify-content:center; overflow:hidden;">
             ${bObj.image ? `<img src="${bObj.image}" style="width:100%;height:100%;object-fit:contain;padding:4px;">` : `<span style="color:#1e293b;font-weight:700;font-size:20px;">${bObj.name.charAt(0).toUpperCase()}</span>`}
           </div>
           <div>
             <h2 style="margin:0; font-size:22px; font-weight:800;">${bObj.name} Store</h2>
             <p style="margin:4px 0 0 0; font-size:13px; color:#cbd5e1;">All products matching this brand.</p>
           </div>
        </div>
        <button onclick="window.clearActiveBrand()" style="background:rgba(255,255,255,0.1); color:white; border:1px solid rgba(255,255,255,0.2); padding:8px 16px; border-radius:8px; cursor:pointer; font-weight:600; display:flex; align-items:center; gap:6px;">
          Home
        </button>
      </div>`;

      for (const catId of Array.from(categoriesFound).sort()) {
         const productsInCat = filtered.filter(p => p.category === catId);
         const cObj = APP_CATEGORIES.find(c => c.id === catId);
         const catName = cObj ? I18N.t(cObj.nameKey) : catId;
         
         groupedHtml += `
            <div style="grid-column: 1/-1; border-bottom: 2px solid #e2e8f0; margin-top:20px; margin-bottom:10px; padding-bottom:10px;">
               <h3 style="margin:0; font-size:1.2rem; font-weight:700; color:#0f172a; text-transform:uppercase;">${catName}</h3>
            </div>
            ${productsInCat.map((p, i) => renderProductCardHTML(p, i, t, badgeMap)).join('')}
         `;
      }
      productGridEl.innerHTML = groupedHtml;
    } else {
      let categoryHeaderHtml = '';
      if (state.activeCategory && state.activeCategory !== 'all') {
        const currentCat = APP_CATEGORIES.find(c => c.id === state.activeCategory);
        if (currentCat) {
          let titleHtml = '';
          if (currentCat.isSub && currentCat.parent) {
            const parentCat = APP_CATEGORIES.find(c => c.id === currentCat.parent);
            if (parentCat) {
               const pName = I18N.t(parentCat.nameKey) || parentCat.nameEn;
               const cName = I18N.t(currentCat.nameKey) || currentCat.nameEn;
               titleHtml = `
                 <div style="display: flex; flex-direction: column;">
                   <span style="font-family: 'Pacifico', cursive; font-size: 1.8rem; font-weight: normal; color: #2563eb; letter-spacing: 1px;">${pName}</span>
                   <span style="font-size: 0.95rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: -5px;">${cName}</span>
                 </div>
               `;
            }
          }
          if (!titleHtml) {
             const cName = I18N.t(currentCat.nameKey) || currentCat.nameEn;
             titleHtml = `
               <div style="display: flex; flex-direction: column;">
                 <span style="font-family: 'Pacifico', cursive; font-size: 1.8rem; font-weight: normal; color: #2563eb; letter-spacing: 1px;">${cName}</span>
               </div>
             `;
          }
          categoryHeaderHtml = `
            <div style="grid-column: 1/-1; border-bottom: 2px dashed #e2e8f0; margin-bottom:20px; padding-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
              ${titleHtml}
              <button onclick="document.querySelector('.sidebar-menu-item[data-id=\\'all\\']')?.click()" style="background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:6px 14px; border-radius:20px; cursor:pointer; font-size:13px; font-weight:600; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                📦 All Products
              </button>
            </div>
          `;
        }
      }
      productGridEl.innerHTML = categoryHeaderHtml + filtered.map((product, i) => renderProductCardHTML(product, i, t, badgeMap)).join('');
    }

    // Bind product card click (open modal)
    $$(".product-card").forEach(card => {
      card.addEventListener("click", (e) => {
        // Prevent if we clicked inside a button or similar in future
        openModal(parseInt(card.dataset.id));
      });
    });
  }

  // ===== Product Modal =====
  function openModal(productId) {
    const product = APP_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const t = I18N.t;

    $("#modalImage").src = resolveProductImage(product);
    $("#modalImage").onerror = function() {
      this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2216%22 fill=%22%23999%22>Image</text></svg>';
    };
    $("#modalImage").alt = pName(product);

    // Look up category name safely
    const catObj = APP_CATEGORIES.find(c => c.id === product.category);
    $("#modalCategory").textContent = catObj ? I18N.t(catObj.nameKey) : product.category;

    $("#modalName").textContent = pName(product);
    $("#modalDesc").textContent = pDesc(product);
    $("#modalWeight").textContent = product.weight;
    $("#modalSku").textContent = product.sku;
    $("#modalBrand").textContent = product.brand;

    const stockText = product.stock === 0
      ? t('out_of_stock')
      : product.stock <= 50
        ? `${t('low_stock')} (${product.stock} ${t('units')})`
        : `${t('in_stock')} (${product.stock} ${t('units')})`;
    $("#modalStock").textContent = stockText;

    $("#modalPrice").textContent = `MRP: ₹${product.mrp}`;
    $("#modalMrp").style.display = 'none';
    $("#modalDiscount").style.display = 'none';

    // Variant selector — show if product has variants
    const variantsEl = $("#modalVariants");
    if (product.variants && product.variants.length > 0) {
      variantsEl.style.display = "flex";
      variantsEl.innerHTML = product.variants.map((v, i) => `
        <button class="variant-chip ${i === 0 ? 'active' : ''}" data-variant-index="${i}">
          ${v.label || v.weight || v}
        </button>
      `).join('');

      variantsEl.querySelectorAll(".variant-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          variantsEl.querySelectorAll(".variant-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          const variant = product.variants[parseInt(chip.dataset.variantIndex)];
          if (variant.mrp) $("#modalPrice").textContent = `MRP: ₹${variant.mrp}`;
          if (false) {
            $("#modalMrp").textContent = '';
            $("#modalMrp").style.display = 'none';
          }
          if (variant.weight) $("#modalWeight").textContent = variant.weight;
        });
      });
    } else {
      variantsEl.style.display = "none";
      variantsEl.innerHTML = "";
    }

    $("#productModal").dataset.productId = productId;

    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // ===== Toast =====
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span class="toast-message">${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("exit");
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ===== Print Catalog =====
  function handlePrintCatalog() {
    const filtered = getFilteredProducts();
    const lang = I18N.getLang();
    const t = I18N.t;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("Please allow popups to print the catalog.");
      return;
    }

    const catObj = APP_CATEGORIES.find(c => c.id === state.activeCategory);
    const categoryName = catObj ? I18N.t(catObj.nameKey) : t("cat_all");

    // Group products by category
    const grouped = {};
    filtered.forEach(p => {
       const catId = p.category;
       if (!grouped[catId]) grouped[catId] = [];
       grouped[catId].push(p);
    });

    let groupedHtml = "";
    Object.keys(grouped).forEach(catId => {
       const cObj = APP_CATEGORIES.find(c => c.id === catId);
       const catDisplayName = cObj ? I18N.t(cObj.nameKey) : catId;
       const productsInCat = grouped[catId];
       
       const productRows = productsInCat.map(product => {
         // Determine if we show a single MRP or multiple
         let mrpContent = "";
         if (product.variants && product.variants.length > 0) {
             mrpContent = `<div class="mrp-grid">` + 
               product.variants.map(v => `
                 <div class="mrp-item">
                   <span class="mrp-label">${v.label || v.weight || '-'}</span>
                   <span class="mrp-value">₹${v.mrp}</span>
                 </div>
               `).join("") + 
             `</div>`;
         } else {
             mrpContent = `<div class="mrp-single">₹${product.mrp}</div>`;
         }

         return `
           <tr>
             <td class="product-cell">
               <div class="prod-name">${pName(product)}</div>
               <div class="prod-meta">${product.brand}</div>
             </td>
             <td class="mrp-cell-main">
               ${mrpContent}
             </td>
           </tr>
         `;
       }).join('');

       groupedHtml += `
         <div class="category-block">
            <div class="category-title">${catDisplayName}</div>
            <table class="catalog-table">
               <thead>
                  <tr>
                     <th class="col-prod">Product Item</th>
                     <th class="col-mrp">MRP Options / Columns</th>
                   </tr>
               </thead>
               <tbody>
                  ${productRows}
               </tbody>
            </table>
         </div>
       `;
    });

    const html = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>NEMA Chemicals — Wholesale Catalog</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            color: #1a1a1a;
            padding: 20mm;
            background: white;
            line-height: 1.4;
          }
          .print-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2pt solid #000;
            padding-bottom: 15px;
            margin-bottom: 30px;
          }
          .print-logo {
            font-size: 28px;
            font-weight: 800;
            color: #000;
          }
          .print-logo-sub {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .print-meta {
            text-align: right;
            font-size: 11px;
          }
          .category-block {
             margin-bottom: 30px;
             page-break-inside: avoid;
          }
          .category-title {
             font-size: 16px;
             font-weight: 800;
             background: #f0f0f0;
             padding: 6px 12px;
             margin-bottom: 10px;
             text-transform: uppercase;
             border-left: 5px solid #000;
          }
          .catalog-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          .catalog-table th {
            font-size: 10px;
            text-transform: uppercase;
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #000;
            color: #666;
          }
          .col-prod { width: 50%; }
          .col-mrp { width: 50%; }
          .product-cell {
            padding: 10px 8px;
            border-bottom: 0.5pt solid #eee;
            vertical-align: top;
          }
          .prod-name {
            font-weight: 700;
            font-size: 13px;
          }
          .prod-meta {
            font-size: 10px;
            color: #666;
          }
          .mrp-cell-main {
            padding: 8px;
            border-bottom: 0.5pt solid #eee;
            vertical-align: top;
          }
          .mrp-single {
            font-size: 18px;
            font-weight: 800;
            text-align: right;
          }
          .mrp-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
          .mrp-item {
            border: 0.5pt solid #ddd;
            padding: 4px 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #fafafa;
          }
          .mrp-label {
            font-size: 8px;
            color: #666;
            font-weight: 600;
          }
          .mrp-value {
            font-size: 14px;
            font-weight: 800;
          }
          .print-footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #999;
          }
          @media print {
            body { padding: 0mm; }
            .no-print { display: none !important; }
            @page { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div>
            <div class="print-logo">NEMA Chemicals</div>
            <div class="print-logo-sub">Wholesale FMCG Price List (MRP)</div>
          </div>
          <div class="print-meta">
            <div>Category: <strong>${categoryName}</strong></div>
            <div>Date: <strong>${new Date().toLocaleDateString('en-IN')}</strong></div>
          </div>
        </div>

        ${groupedHtml}

        <div class="print-footer">
          Prices shown are Maximum Retail Prices (MRP). For wholesale rates, please contact our sales office.
        </div>
          @media print {
            body { padding: 15px; }
            .no-print { display: none !important; }
            .category-block { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div>
            <div class="print-logo">NEMA Chemicals</div>
            <div class="print-logo-sub">FMCG Master Catalog</div>
          </div>
          <div class="print-meta">
            <div style="font-size:14px; margin-bottom:4px;">Filter applied: <strong>${categoryName}</strong></div>
            <div>Total Items: <strong>${filtered.length}</strong></div>
            <div>Generated: <strong>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
          </div>
        </div>

        ${groupedHtml}

        <div class="print-footer">
          © ${new Date().getFullYear()} NEMA Chemicals — Wholesale Distribution. All prices are MRP. Contact for wholesale discounts.
        </div>

        <div class="no-print" style="text-align:center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 12px 32px; background: #1e3a8a; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
            🖨️ Print / Save PDF
          </button>
        </div>

        <script>
          setTimeout(() => window.print(), 800);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  // ===== Language Toggle =====
  function handleLangToggle() {
    const newLang = I18N.toggle();
    langLabel.textContent = newLang === "en" ? "हिंदी" : "English";

    // Re-render everything with new language
    renderCategories();
    renderProducts();
  }

  // ===== Event Listeners =====

  // Search
  let searchTimeout;
  searchBarEl.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = searchBarEl.value.trim();
      renderProducts();
    }, 250);
  });

  // Category Search
  let catSearchTimeout;
  if (categorySearchEl) {
    categorySearchEl.addEventListener("input", () => {
      clearTimeout(catSearchTimeout);
      catSearchTimeout = setTimeout(() => {
        state.categorySearchQuery = categorySearchEl.value.trim();
        renderCategories();
      }, 200);
    });
  }

  // Sort
  sortSelectEl.addEventListener("change", () => {
    state.sortBy = sortSelectEl.value;
    renderProducts();
  });

  // Language toggle
  langToggle.addEventListener("click", handleLangToggle);

  // Print catalog
  if (printCatalogBtn) {
    printCatalogBtn.addEventListener("click", handlePrintCatalog);
  }

  // Modal close
  $("#modalClose").addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
    
    // Switch to admin panel
    if ((e.ctrlKey || e.metaKey) && e.key === "1") {
      e.preventDefault();
      window.location.href = "admin.html";
    }
  });

  // Mobile menu
  mobileMenuToggle.addEventListener("click", () => {
    sidebarEl.classList.toggle("open");
  });

  // Close sidebar on outside click (mobile)
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 &&
      sidebarEl.classList.contains("open") &&
      !sidebarEl.contains(e.target) &&
      !mobileMenuToggle.contains(e.target)) {
      sidebarEl.classList.remove("open");
    }
  });

  // Search Brands
  const storeBrandSearchEl = $("#storeBrandSearch");
  if (storeBrandSearchEl) {
    storeBrandSearchEl.addEventListener("input", (e) => {
      renderStoreBrands(e.target.value);
    });
  }

  // Toggle Brands Layout (Show All / Show Less)
  let brandsShowingAll = false;
  const toggleBrandsLayoutEl = $("#toggleBrandsLayout");
  if (toggleBrandsLayoutEl) {
    toggleBrandsLayoutEl.addEventListener("click", () => {
      brandsShowingAll = !brandsShowingAll;
      const carouselEl = $("#storeBrandsCarousel");
      if (carouselEl) {
        if (brandsShowingAll) {
          carouselEl.style.flexWrap = "wrap";
          carouselEl.style.overflowX = "visible";
          carouselEl.style.paddingBottom = "0px";
          toggleBrandsLayoutEl.setAttribute("data-i18n", "show_less_brands");
          toggleBrandsLayoutEl.textContent = I18N.t("show_less_brands");
        } else {
          carouselEl.style.flexWrap = "nowrap";
          carouselEl.style.overflowX = "auto";
          carouselEl.style.paddingBottom = "10px";
          toggleBrandsLayoutEl.setAttribute("data-i18n", "show_all_brands");
          toggleBrandsLayoutEl.textContent = I18N.t("show_all_brands");
        }
      }
    });
  }

  // ===== Initialize =====
  function init() {
    I18N.setLanguage("en");
    syncData();
    renderCategories();
    renderStoreBrands();
    renderProducts();

    // Load available images for auto-resolution
    loadImagesCache();

    // Start real-time sync with Firebase cloud database
    startFirebaseSync();
  }

  init();
})();
