document.addEventListener("DOMContentLoaded", async () => {
  if (window.kepacProductsReady) {
    await window.kepacProductsReady;
  }

  const productBox = document.querySelector("[data-order-product]");
  const form = document.querySelector("[data-order-form]");
  const messageBox = document.querySelector("[data-order-message]");
  const productId = Number(new URLSearchParams(location.search).get("id"));
  const product = PRODUCTS.find((item) => Number(item.id) === productId);

  function setMessage(text, type = "success") {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = `order-message ${type}`;
  }

  if (!product) {
    if (productBox) {
      productBox.innerHTML = `
        <div class="empty-state">
          <h3>Produit introuvable</h3>
          <p class="muted">Retournez au catalogue et choisissez un produit disponible.</p>
          <a class="btn btn-primary" href="catalogue.html">Voir le catalogue</a>
        </div>
      `;
    }
    form?.classList.add("hidden");
    return;
  }

  if (productBox) {
    productBox.innerHTML = `
      <img class="order-product-image" src="${product.image}" alt="${product.name}" onerror="this.src='${fallbackImage(product.id)}'">
      <div class="order-product-info">
        <span class="eyebrow">${displayCategoryName(product.category)}</span>
        <h2>${product.name}</h2>
        <div class="product-price product-detail-price">${formatPrice(product.price)}</div>
        <p class="muted">${product.description}</p>
        <a class="btn btn-secondary" href="${whatsappLink(product)}" target="_blank" rel="noopener">Commander sur WhatsApp</a>
      </div>
    `;
  }

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    const formData = new FormData(form);
    const clientName = String(formData.get("clientName") || "").trim();
    const clientPhone = String(formData.get("clientPhone") || "").trim();
    const paymentNetwork = String(formData.get("paymentNetwork") || "").trim();
    const quantity = Math.max(1, Number(formData.get("quantity") || 1));
    const notes = String(formData.get("notes") || "").trim();

    if (!clientName || !clientPhone || !paymentNetwork) {
      setMessage("Veuillez remplir le nom, le téléphone et le réseau de paiement.", "error");
      return;
    }

    const payload = {
      items: [{ produit_id: product.id, quantite: quantity }],
      adresse_livraison: "Adresse à confirmer avec le client",
      ville: "À confirmer",
      telephone: clientPhone,
      mode_paiement: "mobile_money",
      notes: [
        `Client : ${clientName}`,
        `Réseau mobile : ${paymentNetwork}`,
        `Produit : ${product.name}`,
        `Lien produit : ${absoluteSiteUrl(`produit.html?id=${product.id}`)}`,
        notes ? `Note : ${notes}` : ""
      ].filter(Boolean).join("\n")
    };

    submitButton.disabled = true;
    submitButton.textContent = "Enregistrement...";
    setMessage("Envoi de la commande en cours...", "info");

    try {
      const response = await fetch("/api/commandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok || !result.succes) {
        throw new Error(result.message || "Commande impossible pour le moment");
      }

      form.reset();
      setMessage(`Commande enregistrée. Numéro de commande : ${result.commande_id}. KEPAC va vous contacter pour confirmer le paiement.`, "success");
    } catch (error) {
      setMessage(`${error.message}. Vous pouvez aussi commander sur WhatsApp.`, "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Confirmer la commande";
    }
  });
});
