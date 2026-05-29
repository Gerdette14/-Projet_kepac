document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("kepac-token");
  const user = JSON.parse(localStorage.getItem("kepac-user") || "null");
  const gate = document.querySelector("[data-admin-gate]");
  const panel = document.querySelector("[data-admin-panel]");
  const form = document.querySelector("[data-admin-product-form]");
  const list = document.querySelector("[data-admin-products]");
  const orderList = document.querySelector("[data-admin-orders]");
  const orderCount = document.querySelector("[data-admin-orders-count]");
  const stats = document.querySelector("[data-admin-stats]");
  let currentProducts = [];
  let currentCategories = [];
  let currentOrders = [];
  const productCacheKey = "kepac-admin-products";
  const fallbackCategories = [
    { id: 3, nom: "Vêtements" },
    { id: 2, nom: "Chaussures" },
    { id: 1, nom: "Topographie" }
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
    const image = product.image
      ? (/^https?:\/\//i.test(product.image)
        ? product.image
        : (product.image.startsWith("/") ? product.image : `/${product.image}`))
      : fallbackImage(product.id);
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

  function firstOrderImage(order) {
    const image = String(order.images || "").split(" | ").find(Boolean);
    if (!image) return "images/kepac-logo.svg";
    return image.startsWith("/") ? image : `/${image}`;
  }

  function orderCustomer(order) {
    const notes = String(order.notes || "");
    const clientLine = notes.split("\n").find((line) => normalizeText(line).startsWith("client :"));
    if (clientLine) return clientLine.replace(/^client\s*:\s*/i, "");
    return [order.prenom, order.nom].filter(Boolean).join(" ") || "Client en ligne";
  }

  function orderNetwork(order) {
    const notes = String(order.notes || "");
    const networkLine = notes.split("\n").find((line) => normalizeText(line).startsWith("reseau mobile :"));
    if (networkLine) return networkLine.replace(/^r[ée]seau mobile\s*:\s*/i, "");
    return order.mode_paiement === "mobile_money" ? "Mobile Money" : order.mode_paiement || "Paiement";
  }

  function orderProductName(order) {
    return String(order.produits || "Produit commandé").split(" | ")[0] || "Produit commandé";
  }

  function clientWhatsappNumber(phone = "") {
    let digits = String(phone).replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("00")) digits = digits.slice(2);

    if (digits.startsWith("229")) return digits;
    if (digits.startsWith("0")) return `229${digits}`;
    if (digits.length === 8) return `22901${digits}`;
    if (digits.length === 10 && digits.startsWith("01")) return `229${digits}`;

    return digits;
  }

  function orderNotificationMessage(order, status) {
    const product = orderProductName(order);
    const customer = orderCustomer(order);

    if (status === "confirmee") {
      return [
        `Bonjour ${customer},`,
        "",
        "Votre commande KEPAC a ete confirmee.",
        `Produit : ${product}`,
        "",
        "Notre equipe vous contactera pour finaliser le paiement et la livraison.",
        "Merci pour votre confiance."
      ].join("\n");
    }

    if (status === "annulee") {
      return [
        `Bonjour ${customer},`,
        "",
        "Votre commande KEPAC a ete annulee.",
        `Produit : ${product}`,
        "",
        "Vous pouvez nous contacter sur WhatsApp pour choisir un autre produit ou avoir plus d'informations."
      ].join("\n");
    }

    return "";
  }

  function notifyClient(order, status) {
    const phone = clientWhatsappNumber(order.telephone);
    const message = orderNotificationMessage(order, status);
    if (!phone || !message) return false;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    return true;
  }

  function orderDate(order) {
    if (!order.created_at) return "";
    return new Date(order.created_at).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function orderRow(order) {
    const statusLabels = {
      en_attente: "En attente",
      confirmee: "Confirmée",
      en_preparation: "En préparation",
      expediee: "Expédiée",
      livree: "Livrée",
      annulee: "Annulée"
    };
    const total = typeof formatPrice === "function" ? formatPrice(order.total) : `${order.total || 0} F CFA`;

    return `
      <article class="admin-order-row">
        <img src="${firstOrderImage(order)}" alt="${orderProductName(order)}" onerror="this.src='images/kepac-logo.svg'">
        <div class="admin-order-main">
          <div class="admin-order-title">
            <strong>${orderProductName(order)}</strong>
            <span class="tag">${statusLabels[order.statut] || order.statut || "En attente"}</span>
          </div>
          <p class="muted">${orderCustomer(order)} - ${order.telephone || "Téléphone non renseigné"} - ${orderNetwork(order)}</p>
          <p class="muted">${total}${orderDate(order) ? ` - ${orderDate(order)}` : ""}</p>
        </div>
        <div class="admin-order-actions">
        <select class="admin-order-status" data-order-status="${order.id}">
          <option value="en_attente" ${order.statut === "en_attente" ? "selected" : ""}>En attente</option>
          <option value="confirmee" ${order.statut === "confirmee" ? "selected" : ""}>Confirmée</option>
          <option value="en_preparation" ${order.statut === "en_preparation" ? "selected" : ""}>En préparation</option>
          <option value="expediee" ${order.statut === "expediee" ? "selected" : ""}>Expédiée</option>
          <option value="livree" ${order.statut === "livree" ? "selected" : ""}>Livrée</option>
          <option value="annulee" ${order.statut === "annulee" ? "selected" : ""}>Annulée</option>
        </select>
        <button class="btn btn-danger" type="button" data-delete-order="${order.id}">Supprimer</button>
        </div>
      </article>
    `;
  }

  async function loadOrders() {
    if (!orderList) return;

    try {
      const response = await fetch("/api/admin/commandes", { headers: adminHeaders(false) });
      const data = await readJsonResponse(response, "Commandes indisponibles.");
      const commandes = data.commandes || [];
      currentOrders = commandes;

      if (orderCount) {
        orderCount.textContent = `${commandes.length} commande${commandes.length > 1 ? "s" : ""}`;
      }

      orderList.innerHTML = commandes.length
        ? commandes.map(orderRow).join("")
        : `<div class="empty-state"><h3>Aucune commande en ligne</h3><p class="muted">Les commandes clients apparaîtront ici après validation du formulaire.</p></div>`;
    } catch (error) {
      orderList.innerHTML = `<div class="empty-state"><h3>Commandes indisponibles</h3><p class="muted">${error.message}</p></div>`;
    }
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
          <div class="admin-card"><span class="admin-card-icon">02</span><strong>${dashboard.stats?.commandes ?? 0}</strong><p class="muted">Commandes en ligne</p></div>
          <div class="admin-card"><span class="admin-card-icon">03</span><strong>${dashboard.stats?.clients ?? 0}</strong><p class="muted">Comptes clients</p></div>
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

    await loadOrders();
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

  orderList?.addEventListener("change", async (event) => {
    const select = event.target.closest("[data-order-status]");
    if (!select) return;

    try {
      const response = await fetch(`/api/admin/commandes/${select.dataset.orderStatus}/statut`, {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ statut: select.value })
      });
      const data = await readJsonResponse(response, "Statut indisponible.");

      if (!response.ok || !data.succes) {
        throw new Error(data.message || "Statut impossible à modifier");
      }

      const order = currentOrders.find((item) => String(item.id) === String(select.dataset.orderStatus));
      if (order && ["confirmee", "annulee"].includes(select.value)) {
        const opened = notifyClient(order, select.value);
        toast(opened ? "Statut mis a jour. WhatsApp est pret pour notifier le client." : "Statut mis a jour. Numero client invalide.");
        await loadDashboard();
        return;
      }

      toast("Statut de commande mis à jour.");
      await loadDashboard();
    } catch (error) {
      toast(error.message);
      await loadOrders();
    }
  });

  orderList?.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest("[data-delete-order]");
    if (!deleteButton) return;

    const order = currentOrders.find((item) => String(item.id) === String(deleteButton.dataset.deleteOrder));
    const confirmed = window.confirm(`Supprimer la commande #${deleteButton.dataset.deleteOrder}${order ? ` de ${orderCustomer(order)}` : ""} ?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/commandes/${deleteButton.dataset.deleteOrder}`, {
        method: "DELETE",
        headers: adminHeaders(false)
      });
      const data = await readJsonResponse(response, "Suppression de commande indisponible.");

      if (!response.ok || !data.succes) {
        throw new Error(data.message || "Commande impossible à supprimer");
      }

      toast("Commande supprimée.");
      await loadDashboard();
    } catch (error) {
      toast(error.message);
    }
  });

  setFormMode();
  loadDashboard();
});
