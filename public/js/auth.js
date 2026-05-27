document.addEventListener("DOMContentLoaded", () => {
  const eyeIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `;
  const eyeOffIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18"></path>
      <path d="M10.6 10.6A3 3 0 0 0 13.4 13.4"></path>
      <path d="M7.1 7.6C4.2 9.1 2.5 12 2.5 12s3.5 6 9.5 6c1.6 0 3-.4 4.2-1"></path>
      <path d="M12 6c6 0 9.5 6 9.5 6a15 15 0 0 1-2.1 2.6"></path>
    </svg>
  `;

  function setPasswordIcon(button, visible) {
    button.innerHTML = visible ? eyeOffIcon : eyeIcon;
    button.setAttribute("aria-label", visible ? "Masquer le mot de passe" : "Afficher le mot de passe");
  }

  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    setPasswordIcon(button, false);

    button.addEventListener("click", () => {
      const input = document.querySelector(button.dataset.togglePassword);
      if (!input) return;
      const visible = input.type === "text";
      input.type = visible ? "password" : "text";
      setPasswordIcon(button, !visible);
    });
  });

  document.querySelectorAll("[data-forgot-password]").forEach((link) => {
    link.href = whatsappTextLink("Bonjour KEPAC, j'ai oublié le mot de passe de mon compte. Pouvez-vous m'aider ?");
  });

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem("kepac-token");
      localStorage.removeItem("kepac-user");
      toast("Vous êtes déconnecté.");
      window.setTimeout(() => {
        location.href = "connexion.html";
      }, 700);
    });
  });

  document.querySelectorAll("[data-auth-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const isSignup = location.pathname.includes("inscription");
      const url = isSignup ? "/api/auth/inscription" : "/api/auth/connexion";
      const payload = isSignup
        ? {
            nom: formData.get("nom"),
            prenom: formData.get("prenom") || "Client",
            email: formData.get("email"),
            mot_de_passe: formData.get("password") || formData.get("mot_de_passe")
          }
        : {
            email: formData.get("email"),
            mot_de_passe: formData.get("password") || formData.get("mot_de_passe")
          };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (!response.ok || !data.succes) {
          throw new Error(data.message || "Connexion impossible");
        }

        localStorage.setItem("kepac-token", data.token);
        localStorage.setItem("kepac-user", JSON.stringify(data.utilisateur));
        form.reset();
        toast("Bienvenue, votre espace est prêt.");
        window.setTimeout(() => {
          location.href = data.utilisateur?.role === "admin" ? "admin.html" : "profil.html";
        }, 700);
      } catch (error) {
        toast(error.message);
      }
    });
  });

  const profile = document.querySelector("[data-profile]");
  if (profile) {
    const token = localStorage.getItem("kepac-token");
    const user = JSON.parse(localStorage.getItem("kepac-user") || "null");

    if (!token || !user) {
      profile.innerHTML = `
        <div class="profile-hero">
          <div>
            <span class="eyebrow">Administration</span>
            <h1>Espace réservé a l'admin</h1>
            <p class="lead">Les clients commandent directement sur WhatsApp. La connexion sert uniquement à gérer la boutique KEPAC.</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="connexion.html">Connexion admin</a>
              <a class="btn btn-ghost" href="catalogue.html">Voir le catalogue</a>
            </div>
          </div>
          <div class="profile-visual">
            <img src="images/espace-client.png" alt="Espace administrateur KEPAC">
          </div>
        </div>
      `;
      return;
    }

    const fullName = `${user.prenom || ""} ${user.nom || ""}`.trim() || "Client KEPAC";
    const initials = fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    const roleLabel = user.role === "admin" ? "Administrateur" : "Client";
    const phone = user.role === "admin" ? "+229 01 64 87 05 43" : user.telephone;

    profile.innerHTML = `
      <div class="profile-hero">
        <div>
          <span class="eyebrow">Espace personnel</span>
          <h1>Bonjour ${fullName}</h1>
          <p class="lead">Votre espace KEPAC vous donne un accés rapide au catalogue, à WhatsApp et à la gestion de la boutique.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="catalogue.html">Voir le catalogue</a>
            ${user.role === "admin" ? '<a class="btn btn-secondary" href="admin.html">Tableau de bord</a>' : ""}
          </div>
        </div>
        <div class="profile-card">
          <div class="profile-avatar">${initials || "K"}</div>
          <div>
            <strong>${fullName}</strong>
            <span>${roleLabel}</span>
          </div>
        </div>
      </div>

      <div class="profile-layout">
        <section class="profile-box profile-details">
          <span class="eyebrow">Compte</span>
          <h2>Informations</h2>
          <div class="profile-info-list">
            <div><span>Nom</span><strong>${fullName}</strong></div>
            <div><span>Email</span><strong>${user.email || "Non renseigné"}</strong></div>
            <div><span>Téléphone</span><strong>${phone || "É compléter"}</strong></div>
          </div>
        </section>

        <section class="profile-box profile-actions-panel">
          <span class="eyebrow">Actions rapides</span>
          <h2>Besoin d'aide ?</h2>
          <p class="muted">Contactez KEPAC pour confirmer un produit, une taille, une disponibilité ou une livraison.</p>
          <div class="profile-action-grid">
            <a class="profile-action" href="${whatsappTextLink("Bonjour KEPAC, je veux discuter avec vous depuis l'espace admin.")}" target="_blank" rel="noopener"><strong>WhatsApp</strong><span>Discuter maintenant</span></a>
            <a class="profile-action" href="catalogue.html"><strong>Catalogue</strong><span>Voir les produits</span></a>
            <button class="profile-action" type="button" data-logout><strong>Déconnexion</strong><span>Quitter le compte</span></button>
          </div>
        </section>
      </div>
    `;

    profile.querySelector("[data-logout]")?.addEventListener("click", () => {
      localStorage.removeItem("kepac-token");
      localStorage.removeItem("kepac-user");
      toast("Vous êtes déconnecté.");
      window.setTimeout(() => {
        location.href = "connexion.html";
      }, 700);
    });
  }
});
