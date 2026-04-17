// ===== NEMA Chemicals — FMCG Catalog Application =====
// Modular vanilla JS app with bilingual support, print catalog, and product catalog.
// Cart functionality removed — this is a view-only catalog.

(() => {
  "use strict";

  // ===== DOM Helpers =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ===== Data Source Sync =====
  let APP_PRODUCTS = [];
  let APP_CATEGORIES = [];
  
  function syncData() {
    const rawProducts = localStorage.getItem("nema_admin_products");
    if(rawProducts) {
      APP_PRODUCTS = JSON.parse(rawProducts);
    } else {
      APP_PRODUCTS = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
    }
    
    if(!Array.isArray(APP_PRODUCTS)) APP_PRODUCTS = [];

    const rawCats = localStorage.getItem("nema_admin_categories");
    let storedCategories = [];
    if(rawCats) {
      storedCategories = JSON.parse(rawCats);
    }
    
    if(!Array.isArray(storedCategories)) storedCategories = [];
    
    // Auto-merge logic for static categories
    if (typeof CATEGORIES !== "undefined") {
      const staticCategories = CATEGORIES;
      staticCategories.forEach(sc => {
        if (!storedCategories.find(pc => pc.id === sc.id)) {
          storedCategories.push(sc);
        }
      });
      storedCategories.forEach(pc => {
         const sc = staticCategories.find(s => s.id === pc.id);
         if (sc) {
            pc.nameKey = sc.nameKey;
            pc.icon = sc.icon;
            pc.isSub = sc.isSub;
            pc.parent = sc.parent;
         }
      });
    }
    APP_CATEGORIES = storedCategories;
  }

  // ===== State =====
  const state = {
    activeCategory: "all",
    searchQuery: "",
    sortBy: "name-asc",
  };

  // ===== DOM References =====
  const categoryListEl = $("#categoryList");
  const productGridEl = $("#productGrid");
  const resultCountEl = $("#resultCount");
  const searchBarEl = $("#searchBar");
  const sortSelectEl = $("#sortSelect");
  const emptyStateEl = $("#emptyState");
  const toastContainer = $("#toastContainer");
  const mobileMenuToggle = $("#mobileMenuToggle");
  const sidebarEl = $("#sidebar");
  const langToggle = $("#langToggle");
  const langLabel = $("#langLabel");
  const printCatalogBtn = $("#printCatalogBtn");

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

  // ===== Render Categories =====
  function renderCategories() {
    const lang = I18N.getLang();

    // Build hierarchy
    const mainCategories = APP_CATEGORIES.filter(c => !c.isSub);
    
    categoryListEl.innerHTML = mainCategories.map(cat => {
      // Find children
      const children = APP_CATEGORIES.filter(c => c.isSub && c.parent === cat.id);
      
      const count = cat.id === "all"
        ? APP_PRODUCTS.length
        : APP_PRODUCTS.filter(p => p.category === cat.id || children.some(ch => ch.id === p.category)).length;
        
      const isExpanded = state.expandedCategory === cat.id;

      let subHtml = "";
      if(children.length > 0) {
          subHtml = `<ul class="sub-category-list" style="display: ${isExpanded ? 'block' : 'none'}; padding-left: 0; list-style: none; margin: 0; background: var(--bg-card); border-radius: 4px; border: 1px solid var(--border-light); overflow: hidden; margin-top: 4px; transition: all 0.3s ease;">` +
            children.map(sub => {
                const subCount = APP_PRODUCTS.filter(p => p.category === sub.id).length;
                return `
                    <li>
                        <div class="category-item ${state.activeCategory === sub.id ? 'active' : ''}"
                             data-category="${sub.id}"
                             data-is-sub="true"
                             style="padding: 10px 16px; padding-left: 32px; font-size: 13px; border-bottom: 1px solid var(--border-light); box-shadow: none; margin: 0; border-radius: 0;">
                            <div class="category-icon" style="width: 16px; height: 16px; font-size: 14px; background: transparent;">${sub.icon}</div>
                            <span class="category-name">${I18N.t(sub.nameKey)}</span>
                            <span class="category-count">${subCount}</span>
                        </div>
                    </li>
                `;
            }).join('') + 
          `</ul>`;
      }

      return `
        <li>
          <div class="category-item main-cat-item ${state.activeCategory === cat.id ? 'active' : ''}"
               data-category="${cat.id}"
               data-has-children="${children.length > 0}">
            <div class="category-icon" style="background: transparent;">${cat.icon}</div>
            <span class="category-name">${I18N.t(cat.nameKey)}</span>
            <span class="category-count">${count}</span>
            ${children.length > 0 ? `<span style="margin-left:auto; font-size: 10px; opacity:0.5; transform: rotate(${isExpanded ? '180deg' : '0'}); transition: transform 0.2s;">▼</span>` : ''}
          </div>
          ${subHtml}
        </li>
      `;
    }).join('');

    // Bind click events
    $$(".category-item").forEach(item => {
      item.addEventListener("click", (e) => {
        const catId = item.dataset.category;
        const hasChildren = item.dataset.hasChildren === "true";
        const isSub = item.dataset.isSub === "true";
        
        if (hasChildren && !isSub) {
            // Toggle accordion
            if (state.expandedCategory === catId) {
                state.expandedCategory = null; 
            } else {
                state.expandedCategory = catId;
            }
            state.activeCategory = catId; // Still filter by main category when clicked
            renderCategories();
            renderProducts();
        } else {
            // Simple selection
            state.activeCategory = catId;
            renderCategories();
            renderProducts();
            if(window.innerWidth <= 768) {
               sidebarEl.classList.remove("open");
            }
        }
      });
    });
  }
  // ===== Filter & Sort Products =====
  function getFilteredProducts() {
    let filtered = [...APP_PRODUCTS];

    // Category filter
    if (state.activeCategory !== "all") {
      const activeCatObj = APP_CATEGORIES.find(c => c.id === state.activeCategory);
      if (activeCatObj && !activeCatObj.isSub) {
          // If active is Main category, show its products + its children's products
          const childrenIds = APP_CATEGORIES.filter(c => c.isSub && c.parent === state.activeCategory).map(c => c.id);
          filtered = filtered.filter(p => p.category === state.activeCategory || childrenIds.includes(p.category));
      } else {
          filtered = filtered.filter(p => p.category === state.activeCategory);
      }
    }

    // Search filter
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        pName(p).toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
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
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        filtered.sort((a, b) => {
          const discA = a.mrp > a.price ? ((a.mrp - a.price) / a.mrp) : 0;
          const discB = b.mrp > b.price ? ((b.mrp - b.price) / b.mrp) : 0;
          return discB - discA;
        });
        break;
    }

    return filtered;
  }

  // ===== Render Products =====
  function renderProducts() {
    const filtered = getFilteredProducts();
    const t = I18N.t;

    resultCountEl.innerHTML = `${t('showing')} <strong>${filtered.length}</strong> ${filtered.length !== 1 ? t('products') : t('product')}`;

    if (filtered.length === 0) {
      productGridEl.style.display = "none";
      emptyStateEl.style.display = "flex";
      return;
    }

    productGridEl.style.display = "";
    emptyStateEl.style.display = "none";

    productGridEl.innerHTML = filtered.map((product, i) => {
      const discount = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

      const badgeMap = {
        new: `<span class="product-badge badge-new">${t('badge_new')}</span>`,
        sale: `<span class="product-badge badge-sale">${t('badge_sale')}</span>`,
        bestseller: `<span class="product-badge badge-bestseller">${t('badge_bestseller')}</span>`,
        organic: `<span class="product-badge badge-organic">${t('badge_organic')}</span>`,
      };

      return `
        <div class="product-card" data-id="${product.id}" id="product-${product.id}" style="animation-delay: ${i * 0.05}s;">
          <div class="product-image-container">
            ${product.badge ? `<div class="product-badges">${badgeMap[product.badge] || ''}</div>` : ''}
            <img src="${product.image}" alt="${pName(product)}" class="product-image" loading="lazy"
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
              <div class="variant-selector" style="display:flex;gap:4px;margin-top:4px;">
                ${product.variants.map((v, idx) => `
                  <button class="variant-pill" style="font-size:9px;padding:2px 6px;border:1px solid #ccc;border-radius:12px;background:#f9f9f9;cursor:pointer;" data-id="${product.id}" data-idx="${idx}" data-price="${v.price}" data-mrp="${v.mrp}" data-val="${v.label||parseFloat(v.weight)||v}">
                    ${v.label || v.weight || v}
                  </button>
                `).join('')}
              </div>
            ` : ''}
            <div class="product-pricing">
              <span class="product-price">₹${product.price}</span>
              ${product.mrp > product.price ? `<span class="product-mrp">₹${product.mrp}</span>` : ''}
              ${discount > 0 ? `<span class="product-discount">${discount}% ${t('off')}</span>` : ''}
            </div>
            <div class="product-stock-label ${product.stock === 0 ? 'out' : product.stock <= 50 ? 'low' : 'ok'}">
              ${product.stock === 0 ? t('out_of_stock') : product.stock <= 50 ? `${t('low_stock')} (${product.stock})` : `${t('in_stock')}`}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind product card click (open modal)
    $$(".product-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if(e.target.classList.contains("variant-pill")) return;
        openModal(parseInt(card.dataset.id));
      });
    });

    // Bind variant pills in cards
    $$(".variant-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        // Update price and mrp on the card
        const card = pill.closest(".product-card");
        const newPrice = pill.dataset.price;
        const newMrp = pill.dataset.mrp;
        const newVal = pill.dataset.val;

        if (newPrice) card.querySelector(".product-price").textContent = `₹${newPrice}`;
        const mrpEl = card.querySelector(".product-mrp");
        if (newMrp && mrpEl) {
          mrpEl.textContent = `₹${newMrp}`;
          mrpEl.style.display = "";
        } else if (mrpEl) {
          mrpEl.style.display = "none";
        }
        card.querySelector(".product-weight").textContent = newVal;
        
        // highlight active
        card.querySelectorAll(".variant-pill").forEach(p => p.style.border="1px solid #ccc");
        pill.style.border = "1px solid var(--accent-primary)";
      });
    });
  }

  // ===== Product Modal =====
  function openModal(productId) {
    const product = APP_PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const t = I18N.t;

    $("#modalImage").src = product.image;
    $("#modalImage").alt = pName(product);
    $("#modalCategory").textContent = t(`cat_${product.category === 'personal_care' ? 'personal_care' : product.category}`);
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

    const discount = product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

    $("#modalPrice").textContent = `₹${product.price}`;
    $("#modalMrp").textContent = product.mrp > product.price ? `₹${product.mrp}` : '';
    $("#modalMrp").style.display = product.mrp > product.price ? '' : 'none';
    $("#modalDiscount").textContent = discount > 0 ? `${discount}% ${t('off')}` : '';
    $("#modalDiscount").style.display = discount > 0 ? '' : 'none';

    // Variant selector — show if product has variants
    const variantsEl = $("#modalVariants");
    if (product.variants && product.variants.length > 0) {
      variantsEl.style.display = "flex";
      variantsEl.innerHTML = product.variants.map((v, i) => `
        <button class="variant-chip ${i === 0 ? 'active' : ''}" data-variant-index="${i}">
          ${v.label || v.weight || v}
        </button>
      `).join('');

      // Bind variant clicks
      variantsEl.querySelectorAll(".variant-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          variantsEl.querySelectorAll(".variant-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          const variant = product.variants[parseInt(chip.dataset.variantIndex)];
          if (variant.price) $("#modalPrice").textContent = `₹${variant.price}`;
          if (variant.mrp) {
            $("#modalMrp").textContent = `₹${variant.mrp}`;
            $("#modalMrp").style.display = '';
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
    // Build a clean print view of the currently filtered products
    const filtered = getFilteredProducts();
    const lang = I18N.getLang();
    const t = I18N.t;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast("⚠️ Please allow popups to print the catalog.");
      return;
    }

    const categoryName = state.activeCategory === "all"
      ? t("cat_all")
      : t(`cat_${state.activeCategory}`);

    const productRows = filtered.map(product => {
      const discount = product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e9f0;">
            <strong>${pName(product)}</strong><br>
            <span style="color: #5a6a7e; font-size: 12px;">${product.brand} · ${product.weight} · ${product.sku}</span>
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e9f0; text-align: center;">
            ${I18N.t(`cat_${product.category}`)}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e9f0; text-align: right; font-weight: 700;">
            ₹${product.price}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e9f0; text-align: right; color: #8b96a8; text-decoration: line-through;">
            ₹${product.mrp}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e9f0; text-align: center; color: ${discount > 0 ? '#16a34a' : '#8b96a8'}; font-weight: 600;">
            ${discount > 0 ? discount + '%' : '—'}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e9f0; text-align: center;">
            ${product.stock}
          </td>
        </tr>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <title>NEMA Chemicals — Product Catalog</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            color: #1a2332;
            padding: 40px;
            background: white;
          }
          .print-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .print-logo {
            font-size: 24px;
            font-weight: 800;
            color: #2563eb;
          }
          .print-logo-sub {
            font-size: 12px;
            color: #5a6a7e;
            font-weight: 500;
          }
          .print-meta {
            text-align: right;
            font-size: 12px;
            color: #5a6a7e;
          }
          .print-category-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #2563eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          thead th {
            background: #2563eb;
            color: white;
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
          }
          thead th:nth-child(3),
          thead th:nth-child(4),
          thead th:nth-child(5),
          thead th:nth-child(6) {
            text-align: center;
          }
          tbody tr:nth-child(even) {
            background: #f7f9fc;
          }
          .print-footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e5e9f0;
            font-size: 11px;
            color: #8b96a8;
            text-align: center;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div>
            <div class="print-logo">🧪 NEMA Chemicals</div>
            <div class="print-logo-sub">Wholesale FMCG Product Catalog</div>
          </div>
          <div class="print-meta">
            <div>Category: <strong>${categoryName}</strong></div>
            <div>${filtered.length} products</div>
            <div>Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:center;">Category</th>
              <th style="text-align:right;">Price</th>
              <th style="text-align:right;">MRP</th>
              <th style="text-align:center;">Discount</th>
              <th style="text-align:center;">Stock</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <div class="print-footer">
          © 2026 NEMA Chemicals — Wholesale FMCG Distribution · This catalog is auto-generated and subject to change.
        </div>

        <div class="no-print" style="text-align:center; margin-top: 24px;">
          <button onclick="window.print()" style="padding: 10px 32px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <script>
          // Auto-trigger print dialog
          setTimeout(() => window.print(), 500);
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

  // ===== Initialize =====
  async function init() {
    I18N.setLanguage("en");
    syncData();

    // Fetch from native app database if available
    if (window.electronAPI && window.electronAPI.getDbData) {
      const dbProducts = await window.electronAPI.getDbData("products");
      const dbCategories = await window.electronAPI.getDbData("categories");
      if (dbProducts) window.PRODUCTS = dbProducts;
      
      if (dbCategories) {
        // Merge strategy for categories (maintain hierarchical UI logic)
        const parsedCat = dbCategories;
        if (typeof window.CATEGORIES !== "undefined") {
          const staticCategories = window.CATEGORIES.filter(c => c.id !== "all");
          staticCategories.forEach(sc => {
            if (!parsedCat.find(pc => pc.id === sc.id)) parsedCat.push(sc);
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
        window.CATEGORIES = [{ id: "all", nameKey: "cat_all", icon: "📦" }, ...parsedCat];
      }
    } else {
       // local storage fallback
       const lsP = localStorage.getItem("nema_admin_products");
       if(lsP) window.PRODUCTS = JSON.parse(lsP);
       const lsC = localStorage.getItem("nema_admin_categories");
       if(lsC) {
          const parsedCat = JSON.parse(lsC);
          const staticCategories = window.CATEGORIES.filter(c => c.id !== "all");
          staticCategories.forEach(sc => {
            if (!parsedCat.find(pc => pc.id === sc.id)) parsedCat.push(sc);
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
          window.CATEGORIES = [{ id: "all", nameKey: "cat_all", icon: "📦" }, ...parsedCat];
       }
    }

    renderCategories();
    renderProducts();
  }

  init();
})();
