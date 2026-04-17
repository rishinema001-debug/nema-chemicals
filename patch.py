import os
import json
import re

# 1. Update products.js
with open('products.js', 'r', encoding='utf-8') as f:
    products_js = f.read()

products_js = re.sub(r'icon:\s*"(.*?)"', 'icon: "•"', products_js)

with open('products.js', 'w', encoding='utf-8') as f:
    f.write(products_js)

# 2. Update app.js
with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

sync_data_code = """  // ===== Data Source Sync =====
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
"""

if "let APP_PRODUCTS =" not in app_js:
    app_js = app_js.replace("  // ===== State =====", sync_data_code + "\n  // ===== State =====")

accordion_code = """function renderCategories() {
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
  }"""

app_js = re.sub(r'function renderCategories\(\) \{[\s\S]*?\n  // ===== Filter & Sort Products =====', accordion_code + '\n  // ===== Filter & Sort Products =====', app_js)

if "syncData();" not in app_js:
    app_js = app_js.replace('I18N.setLanguage("en");', 'I18N.setLanguage("en");\n    syncData();')

# Replace globals in APP.js
app_js = app_js.replace("let filtered = [...PRODUCTS];", "let filtered = [...APP_PRODUCTS];")
if "filtered = filtered.filter(p => p.category === state.activeCategory);" in app_js:
    app_js = app_js.replace(
        "filtered = filtered.filter(p => p.category === state.activeCategory);",
        """const activeCatObj = APP_CATEGORIES.find(c => c.id === state.activeCategory);
      if (activeCatObj && !activeCatObj.isSub) {
          // If active is Main category, show its products + its children's products
          const childrenIds = APP_CATEGORIES.filter(c => c.isSub && c.parent === state.activeCategory).map(c => c.id);
          filtered = filtered.filter(p => p.category === state.activeCategory || childrenIds.includes(p.category));
      } else {
          filtered = filtered.filter(p => p.category === state.activeCategory);
      }"""
    )
app_js = app_js.replace("const product = PRODUCTS.find(p => p.id === productId);", "const product = APP_PRODUCTS.find(p => p.id === productId);")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)
