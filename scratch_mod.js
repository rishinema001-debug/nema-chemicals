const fs = require('fs');

// 1. Modifying products.js to replace all emojis with •
let productsJs = fs.readFileSync('products.js', 'utf8');
productsJs = productsJs.replace(/icon:\s*"[^"]+"/g, 'icon: "•"');
fs.writeFileSync('products.js', productsJs);

// 2. Modifying app.js to support localstorage bindings and accordion UI
let appJs = fs.readFileSync('app.js', 'utf8');

// Insert global APP_PRODUCTS and APP_CATEGORIES
if (!appJs.includes('let APP_PRODUCTS = [];')) {
    appJs = appJs.replace('// ===== State =====', `// ===== Data Source Sync =====
  let APP_PRODUCTS = [];
  let APP_CATEGORIES = [];
  
  function syncData() {
    const rawProducts = localStorage.getItem("nema_admin_products");
    if(rawProducts) APP_PRODUCTS = JSON.parse(rawProducts);
    else APP_PRODUCTS = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
    
    // Ensure APP_PRODUCTS is array
    if(!Array.isArray(APP_PRODUCTS)) APP_PRODUCTS = [];

    const rawCats = localStorage.getItem("nema_admin_categories");
    if(rawCats) APP_CATEGORIES = JSON.parse(rawCats);
    else APP_CATEGORIES = typeof CATEGORIES !== "undefined" ? CATEGORIES : [];
    
    if(!Array.isArray(APP_CATEGORIES)) APP_CATEGORIES = [];
    
    // Auto-merge logic for static categories
    if (typeof CATEGORIES !== "undefined") {
      const staticCategories = CATEGORIES;
      staticCategories.forEach(sc => {
        if (!APP_CATEGORIES.find(pc => pc.id === sc.id)) {
          APP_CATEGORIES.push(sc);
        }
      });
      APP_CATEGORIES.forEach(pc => {
         const sc = staticCategories.find(s => s.id === pc.id);
         if (sc) {
            pc.nameKey = sc.nameKey;
            pc.icon = sc.icon;
            pc.isSub = sc.isSub;
            pc.parent = sc.parent;
         }
      });
    }
  }

  // ===== State =====`);
}

// Replace PRODUCTS with APP_PRODUCTS and CATEGORIES with APP_CATEGORIES inside getFilteredProducts and renderCategories
appJs = appJs.replace(/PRODUCTS/g, 'APP_PRODUCTS');
appJs = appJs.replace(/CATEGORIES/g, 'APP_CATEGORIES');

// Except we replaced the typeof PRODUCTS !== "undefined" check with APP_PRODUCTS which is wrong, let's fix it:
appJs = appJs.replace(/typeof APP_PRODUCTS/g, 'typeof PRODUCTS');
appJs = appJs.replace(/typeof APP_CATEGORIES/g, 'typeof CATEGORIES');

// Replace renderCategories function body to handle Accordion 
const accordionCode = `
  function renderCategories() {
    const lang = I18N.getLang();

    // Build hierarchy
    const mainCategories = APP_CATEGORIES.filter(c => !c.isSub);
    
    categoryListEl.innerHTML = mainCategories.map(cat => {
      const count = cat.id === "all"
        ? APP_PRODUCTS.length
        : APP_PRODUCTS.filter(p => p.category === cat.id).length;
        
      const children = APP_CATEGORIES.filter(c => c.isSub && c.parent === cat.id);
      
      const isExpanded = state.expandedCategory === cat.id;

      let subHtml = "";
      if(children.length > 0) {
          subHtml = \`<ul class="sub-category-list" style="display: \${isExpanded ? 'block' : 'none'}; padding-left: 0; list-style: none; margin: 0; background: var(--bg-card); border-radius: 4px; border: 1px solid var(--border-light); overflow: hidden; margin-top: 4px;">\` +
            children.map(sub => {
                const subCount = APP_PRODUCTS.filter(p => p.category === sub.id).length;
                return \`
                    <li>
                        <div class="category-item \${state.activeCategory === sub.id ? 'active' : ''}"
                             data-category="\${sub.id}"
                             data-is-sub="true"
                             style="padding: 10px 16px; padding-left: 32px; font-size: 13px; border-bottom: 1px solid var(--border-light); margin: 0; border-radius: 0;">
                            <div class="category-icon" style="width: 16px; height: 16px; font-size: 14px; background: transparent;">\${sub.icon}</div>
                            <span class="category-name">\${I18N.t(sub.nameKey)}</span>
                            <span class="category-count">\${subCount}</span>
                        </div>
                    </li>
                \`;
            }).join('') + 
          \`</ul>\`;
      }

      return \`
        <li>
          <div class="category-item main-cat-item \${state.activeCategory === cat.id ? 'active' : ''}"
               data-category="\${cat.id}"
               data-has-children="\${children.length > 0}">
            <div class="category-icon" style="background: transparent;">\${cat.icon}</div>
            <span class="category-name">\${I18N.t(cat.nameKey)}</span>
            <span class="category-count">\${count}</span>
            \${children.length > 0 ? \`<span style="margin-left:auto; font-size: 10px; opacity:0.5; transform: rotate(\${isExpanded ? '180deg' : '0'}); transition: transform 0.2s;">▼</span>\` : ''}
          </div>
          \${subHtml}
        </li>
      \`;
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
`;

appJs = appJs.replace(/function renderCategories\(\) \{[\s\S]*?\/\/ ===== Filter & Sort Products =====/, accordionCode + '\n  // ===== Filter & Sort Products =====');

// Add syncData() inside init() before renderCategories()
if (!appJs.includes('syncData();')) {
    appJs = appJs.replace('I18N.setLanguage("en");', 'I18N.setLanguage("en");\n    syncData();');
}

fs.writeFileSync('app.js', appJs);
console.log("Modifications complete.");
