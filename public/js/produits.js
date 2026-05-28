document.addEventListener("DOMContentLoaded", async () => {
  if (window.kepacProductsReady) {
    await window.kepacProductsReady;
  }

  const grid = document.querySelector("[data-catalog-products]");
  const search = document.querySelector("[data-search]");
  const category = document.querySelector("[data-category]");
  const sort = document.querySelector("[data-sort]");
  const count = document.querySelector("[data-result-count]");
  const detail = document.querySelector("[data-product-detail]");
  const segmentTabs = document.querySelector("[data-segment-tabs]");
  let activeSegment = "Tous";

  function clean(value = "") {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function familyOf(product) {
    if (typeof productFamilyStrict === "function") {
      return productFamilyStrict(product);
    }

    const categoryName = clean(product.category);
    if (categoryName.includes("topographie")) return "Topographie";
    if (categoryName.includes("vetement") || categoryName.includes("chaussure")) return "Mode";
    return "Autres";
  }

  function matchesCategory(product, selectedCategory) {
    const selected = clean(selectedCategory);
    const productCategory = clean(product.category);

    if (selected.includes("vetement")) return productCategory.includes("vetement");
    if (selected.includes("chaussure")) return productCategory.includes("chaussure");
    if (selected.includes("topographie")) return familyOf(product) === "Topographie";
    return product.category === selectedCategory;
  }

  function catalogDisplayKey(product) {
    if (product.image && typeof imageDisplayKey === "function") {
      return imageDisplayKey(product.image);
    }

    return product.image
      ? String(product.image).replace(/^\/+/, "").replace(/\\/g, "/").toLowerCase()
      : clean(`${product.name || "produit"}-${product.id || ""}`);
  }

  function uniqueCatalogProducts(products) {
    const seen = new Set();

    return products.filter((product) => {
      const key = catalogDisplayKey(product);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function removeDuplicateImageCards() {
    if (!grid) return;

    const seenImages = new Set();
    grid.querySelectorAll(".product-card").forEach((card) => {
      const image = card.querySelector("img");
      const rawSource = image?.getAttribute("src") || "";
      const source = typeof imageDisplayKey === "function"
        ? imageDisplayKey(rawSource)
        : rawSource.replace(/^\/+/, "").replace(/\\/g, "/").toLowerCase();

      if (!source) return;
      if (seenImages.has(source)) {
        card.remove();
        return;
      }

      seenImages.add(source);
    });

    grid.querySelectorAll(".catalog-group").forEach((group) => {
      if (!group.querySelector(".product-card")) {
        group.remove();
      }
    });
  }

  function filteredProducts() {
    let list = [...PRODUCTS];
    const term = clean(search?.value.trim());
    const selectedCategory = category?.value;

    if (term) {
      list = list.filter((product) =>
        clean(`${product.name} ${product.category} ${product.description}`).includes(term)
      );
    }

    if (selectedCategory && selectedCategory !== "Tous") {
      list = list.filter((product) => matchesCategory(product, selectedCategory));
    }

    if (activeSegment !== "Tous") {
      list = list.filter((product) => familyOf(product) === activeSegment);
    }

    if (sort?.value === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }

  function groupedProducts(products) {
    return [
      { title: "Vêtements", segment: "Mode", products: products.filter((product) => clean(product.category).includes("vetement")) },
      { title: "Chaussures", segment: "Mode", products: products.filter((product) => clean(product.category).includes("chaussure")) },
      { title: "Topographie", segment: "Topographie", products: products.filter((product) => familyOf(product) === "Topographie") }
    ].filter((group) => group.products.length);
  }

  function groupSection(group) {
    return `
      <section class="catalog-group">
        <div class="catalog-group-head">
          <div>
            <span class="eyebrow">${group.segment}</span>
            <h2>${group.title}</h2>
          </div>
          <span class="tag">${group.products.length} produit${group.products.length > 1 ? "s" : ""}</span>
        </div>
        <div class="product-grid">${group.products.map(productCard).join("")}</div>
      </section>
    `;
  }

  function renderCatalog() {
    if (!grid) return;
    const list = uniqueCatalogProducts(filteredProducts());

    if (!list.length) {
      grid.innerHTML = `<div class="empty-state"><h3>Aucun produit trouvé</h3><p class="muted">Essayez une autre recherche ou catégorie.</p></div>`;
    } else if (activeSegment === "Tous" && !search?.value.trim() && (!category?.value || category.value === "Tous")) {
      grid.innerHTML = groupedProducts(list).map(groupSection).join("");
    } else {
      grid.innerHTML = list.map(productCard).join("");
    }

    if (count) {
      count.textContent = `${list.length} produit${list.length > 1 ? "s" : ""}`;
    }

    removeDuplicateImageCards();
  }

  function renderDetail() {
    if (!detail) return;
    const id = Number(new URLSearchParams(location.search).get("id")) || 1;
    const product = PRODUCTS.find((item) => Number(item.id) === id) || PRODUCTS[0];
    detail.innerHTML = `
      <div class="hero-media">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='${fallbackImage(product.id)}'">
      </div>
      <div>
        <span class="eyebrow">${displayCategoryName(product.category)}</span>
        <h1>${product.name}</h1>
        <div class="product-price product-detail-price">${formatPrice(product.price)}</div>
        <p class="lead">${product.description} Sélection contrôlée, préparation rapide et accompagnement client avant la livraison.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${orderLink(product)}">Commander en ligne</a>
          <a class="btn btn-secondary" href="${whatsappLink(product)}" target="_blank" rel="noopener">Commander sur WhatsApp</a>
          <a class="btn btn-ghost" href="catalogue.html">Voir le catalogue</a>
        </div>
      </div>
    `;
  }

  [search, category, sort].forEach((control) => {
    control?.addEventListener("input", renderCatalog);
  });

  segmentTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-segment]");
    if (!button) return;
    activeSegment = button.dataset.segment;
    segmentTabs.querySelectorAll("[data-segment]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderCatalog();
  });

  renderCatalog();
  renderDetail();
});
