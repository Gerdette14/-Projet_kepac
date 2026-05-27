document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("kepac-token");
  const user = JSON.parse(localStorage.getItem("kepac-user") || "null");
  const gate = document.querySelector("[data-admin-gate]");
  const panel = document.querySelector("[data-admin-panel]");
  const form = document.querySelector("[data-admin-product-form]");
  const list = document.querySelector("[data-admin-products]");
  const stats = document.querySelector("[data-admin-stats]");
  let currentProducts = [];
  let currentCategories = [];
  const productCacheKey = "kepac-admin-products";
  const fallbackCategories = [
    { id: 1, nom: "Vêtements" },
    { id: 2, nom: "Chaussures" },
    { id: 8, nom: "Topographie" }
  ];

  function adminHeaders(json = true) {
    const headers = { Authorization: `Bearer ${token}` };
    if (json) headers["Content-Type"] = "application/json";
    return headers;
  }

  async function readJsonResponse(response, fallbackMessage) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    await response.text();
    throw new Error(fallbackMessage || "Le serveur n'a pas renvoyé une réponse valide. Redémarrez le serveur puis réessayez.");
  }

  function showGate(message) {
    if (panel) panel.hidden = true;
    if (gate) {
      gate.hidden = false;
      gate.innerHTML = `
        <h2>Accés admin requis</h2>
        <p class="muted">${message}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="connexion.html">Se connecter</a>
          <a class="btn btn-ghost" href="index.html">Retour boutique</a>
        </div>
      `;
    }
  }

  function normalizeText(value = "") {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function adminCatalogCategories(categories = []) {
    const findCategory = (words, fallback) => {
      return categories.find((category) => {
        const text = normalizeText(`${category.nom || ""} ${category.slug || ""}`);
        return words.some((word) => text.includes(word));
      }) || fallback;
    };

    return [
      findCategory(["vetement", "robe", "chemise"], fallbackCategories[0]),
      findCategory(["chaussure", "basket", "sandale"], fallbackCategories[1]),
      findCategory(["topo", "equipement", "gnss", "gps", "laser", "prisme"], fallbackCategories[2])
    ];
  }

  function readCachedProducts() {
    try {
      const products = JSON.parse(localStorage.getItem(productCacheKey) || "[]");
      return Array.isArray(products) ? products : [];
    } catch (error) {
      return [];
    }
  }

  function writeCachedProducts(products) {
    localStorage.setItem(productCacheKey, JSON.stringify(products));
  }

  function selectedCategoryName(categoryId) {
    const category = currentCategories.find((item) => String(item.id) === String(categoryId));
    return category?.nom || "Produit";
  }

  function rememberAdminProduct(product) {
    const products = readCachedProducts();
    const nextProducts = products.filter((item) => String(item.id) !== String(product.id));
    nextProducts.unshift(product);
    writeCachedProducts(nextProducts.slice(0, 30));
  }

  function forgetAdminProduct(productId) {
    writeCachedProducts(readCachedProducts().filter((product) => String(product.id) !== String(productId)));
  }

  function imageKey(product) {
    return String(product.image || fallbackImage(product.id))
      .replace(/^\/+/, "")
      .replace(/\\/g, "/")
      .toLowerCase();
  }

  function uniqueProductRows(products) {
    const seenImages = new Set();

    return products.filter((product) => {
      const key = imageKey(product);
      if (seenImages.has(key)) return false;
      seenImages.add(key);
      return true;
    });
  }

  function productRow(product) {
    const image = product.image ? (product.image.startsWith("/") ? product.image : `/${product.image}`) : fallbackImage(product.id);
    const productPrice = product.prix || product.price || (typeof fallbackPrice === "function" ? fallbackPrice(product.id) : 0);
    const price = typeof formatPrice === "function" ? formatPrice(productPrice) : `${productPrice} F CFA`;
    return `
      <article class="admin-product-row">
        <img src="${image}" alt="${product.nom}" onerror="this.src='${fallbackImage(product.id)}'">
        <div>
          <strong>${product.nom}</strong>
          <span>${product.categorie_nom || "Produit"} - ${price} - Stock ${product.stock ?? 0}</span>
        </div>
        <div class="admin-row-actions">
          <a class="btn btn-ghost" href="produit.html?id=${product.id}">Voir</a>
          <button class="btn btn-secondary" type="button" data-edit-product="${product.id}">Modifier</button>
          <button class="btn btn-danger" type="button" data-delete-product="${product.id}">Supprimer</button>
        </div>
      </article>
    `;
  }

  function setFormMode(product = null) {
    const title = form?.querySelector("[data-form-title]");
    const help = form?.querySelector("[data-form-help]");
    const submitLabel = form?.querySelector("[data-submit-label]");
    const cancelButton = form?.querySelector("[data-cancel-edit]");
    const imageHelp = form?.querySelector("[data-image-help]");
    const imageInput = form?.elements.image;

    if (!form) return;

    if (!product) {
      form.reset();
      form.elements.id.value = "";
      form.elements.image_actuelle.value = "";
      form.elements.prix.value = "";
      if (title) title.textContent = "Ajouter un produit";
      if (help) help.textContent = "Le produit sera visible dans l’accueil, le catalogue et sa catégorie après l’enregistrement.";
      if (submitLabel) submitLabel.textContent = "Ajouter le produit";
      if (imageHelp) imageHelp.textContent = "Choisissez une image pour le nouveau produit.";
      if (imageInput) imageInput.required = true;
      if (cancelButton) cancelButton.hidden = true;
      return;
    }

    form.elements.id.value = product.id;
    form.elements.image_actuelle.value = product.image || "";
    form.elements.nom.value = product.nom || "";
    form.elements.prix.value = product.prix || product.price || "";
    form.elements.categorie_id.value = product.categorie_id || "";
    form.elements.marque.value = product.marque || "";
    form.elements.stock.value = product.stock ?? 0;
    form.elements.description.value = product.description || "";
    if (imageInput) {
      imageInput.required = false;
      imageInput.value = "";
    }
    if (title) title.textContent = "Modifier le produit";
    if (help) help.textContent = "Modifiez les informations puis enregistrez.";
    if (submitLabel) submitLabel.textContent = "Enregistrer les modifications";
    if (imageHelp) imageHelp.textContent = "Laissez vide pour garder l'image actuelle.";
    if (cancelButton) cancelButton.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function loadDashboard() {
    let productList = [];

    try {
      const categoriesResponse = await fetch("/api/produits/categories/liste", { headers: adminHeaders(false) });
      if (categoriesResponse.ok) {
        const categories = await readJsonResponse(categoriesResponse, "Catégories indisponibles.");
        currentCategories = adminCatalogCategories(categories.categories || []);
      } else {
        currentCategories = fallbackCategories;
      }
    } catch (error) {
      currentCategories = fallbackCategories;
    }

    if (form?.elements.categorie_id && currentCategories.length) {
      const selectedValue = form.elements.categorie_id.value;
      form.elements.categorie_id.innerHTML = currentCategories
        .map((category) => `<option value="${category.id}">${category.nom}</option>`)
        .join("");
      if (selectedValue) form.elements.categorie_id.value = selectedValue;
    }

    try {
      const dashboardResponse = await fetch("/api/admin/dashboard", { headers: adminHeaders(false) });
      if (!dashboardResponse.ok) throw new Error("Connexion admin invalide");
      const dashboard = await readJsonResponse(dashboardResponse, "Tableau de bord indisponible.");
      if (stats) {
        stats.innerHTML = `
          <div class="admin-card"><span class="admin-card-icon">01</span><strong>${dashboard.stats?.produits ?? 0}</strong><p class="muted">Produits publiés</p></div>
          <div class="admin-card"><span class="admin-card-icon">02</span><strong>${dashboard.stats?.commandes ?? 0}</strong><p class="muted">Demandes WhatsApp</p></div>
          <div class="admin-card"><span class="admin-card-icon">03</span><strong>${dashboard.stats?.clients ?? 0}</strong><p class="muted">Contacts clients</p></div>
        `;
      }
    } catch (error) {
      if (stats) {
        stats.innerHTML = `
          <div class="admin-card"><span class="admin-card-icon">01</span><strong>Admin</strong><p class="muted">Connecté</p></div>
          <div class="admin-card"><span class="admin-card-icon">02</span><strong>Formulaire</strong><p class="muted">Disponible</p></div>
          <div class="admin-card"><span class="admin-card-icon">03</span><strong>Serveur</strong><p class="muted">À vérifier</p></div>
        `;
      }
    }

    try {
      const productsResponse = await fetch("/api/produits", { headers: adminHeaders(false) });
      const products = await readJsonResponse(productsResponse, "Produits indisponibles.");
      productList = uniqueProductRows(products.produits || []);
      currentProducts = productList;

      if (list) {
        list.innerHTML = productList.length
          ? productList.map(productRow).join("")
          : `<div class="empty-state">Aucun produit actif pour le moment.</div>`;
      }
    } catch (error) {
      if (list) {
        list.innerHTML = `<div class="empty-state">Les produits ne se chargent pas encore. Le formulaire reste disponible.</div>`;
      }
    }
  }

  async function uploadImage(file) {
    if (!file) return "";

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/produits/upload", {
      method: "POST",
      headers: adminHeaders(false),
      body: formData
    });
    const data = await readJsonResponse(response, "La route d'image n'est pas active. Redémarrez le serveur.");

    if (!response.ok || !data.succes) {
      throw new Error(data.message || "Image impossible à enregistrer");
    }

    return data.image;
  }

  if (!token || user?.role !== "admin") {
    showGate("Cette page est réservée à l'administrateur de KEPAC GROUP.");
    return;
  }

  if (gate) gate.hidden = true;
  if (panel) panel.hidden = false;

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const submitButton = form.querySelector("button[type='submit']");
    const productId = formData.get("id");

    try {
      if (submitButton) submitButton.disabled = true;
      const selectedImage = formData.get("image");
      const hasNewImage = selectedImage && selectedImage.size > 0;
      const image = hasNewImage ? await uploadImage(selectedImage) : formData.get("image_actuelle");
      const payload = {
        nom: formData.get("nom"),
        description: formData.get("description") || "Produit disponible chez KEPAC GROUP.",
        categorie_id: Number(formData.get("categorie_id")),
        stock: Number(formData.get("stock") || 0),
        marque: formData.get("marque") || "KEPAC",
        image,
        prix: Number(formData.get("prix") || 0),
        actif: 1
      };

      const response = await fetch(productId ? `/api/produits/${productId}` : "/api/produits", {
        method: productId ? "PUT" : "POST",
        headers: adminHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await readJsonResponse(response, "La route produit n'est pas active. Redémarrez le serveur.");

      if (!response.ok || !data.succes) {
        throw new Error(data.message || "Produit impossible à ajouter");
      }

      rememberAdminProduct({
        id: productId || data.id || Date.now(),
        nom: payload.nom,
        description: payload.description,
        categorie_id: payload.categorie_id,
        categorie_nom: selectedCategoryName(payload.categorie_id),
        stock: payload.stock,
        prix: payload.prix,
        marque: payload.marque,
        image: payload.image,
        actif: 1,
        origin: "admin"
      });
      setFormMode();
      toast(productId ? "Produit modifié." : "Produit ajouté à la boutique.");
      await loadDashboard();
    } catch (error) {
      toast(error.message);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });

  form?.querySelector("[data-cancel-edit]")?.addEventListener("click", () => {
    setFormMode();
  });

  list?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-product]");
    const deleteButton = event.target.closest("[data-delete-product]");

    if (editButton) {
      const product = currentProducts.find((item) => String(item.id) === editButton.dataset.editProduct);
      if (product) setFormMode(product);
      return;
    }

    if (deleteButton) {
      const product = currentProducts.find((item) => String(item.id) === deleteButton.dataset.deleteProduct);
      if (!product) return;
      const confirmed = window.confirm(`Supprimer "${product.nom}" de la boutique ?`);
      if (!confirmed) return;

      try {
        const response = await fetch(`/api/produits/${product.id}`, {
          method: "DELETE",
          headers: adminHeaders(false)
        });
        const data = await readJsonResponse(response, "Suppression indisponible. Redémarrez le serveur.");

        if (!response.ok || !data.succes) {
          throw new Error(data.message || "Suppression impossible");
        }

        forgetAdminProduct(product.id);
        toast("Produit supprimé de la boutique.");
        await loadDashboard();
      } catch (error) {
        toast(error.message);
      }
    }
  });

  setFormMode();
  loadDashboard();
});
