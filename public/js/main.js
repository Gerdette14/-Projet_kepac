let PRODUCTS = [
  {
    id: 1,
    name: "Chaussure de sécurité GUYISA beige",
    category: "Chaussures",
    badge: "Sécurité",
    image: "images/WhatsApp Image 2026-05-25 at 00.53.20 (1).jpeg",
    description: "Chaussure montante de sécurité GUYISA, robuste et adaptée au terrain."
  },
  {
    id: 2,
    name: "Laser topographique APEKS A40",
    category: "Topographie",
    badge: "Topographie",
    image: "images/WhatsApp Image 2026-05-25 at 00.53.20 (2).jpeg",
    description: "Appareil laser APEKS A40 pour travaux topographiques et mesures de précision."
  },
  {
    id: 3,
    name: "Chaussure de sécurité GUYISA noir jaune",
    category: "Chaussures",
    badge: "Sécurité",
    image: "images/WhatsApp Image 2026-05-25 at 00.53.20.jpeg",
    description: "Chaussure de sécurité GUYISA noir et jaune, confortable pour chantier."
  },
  {
    id: 4,
    name: "Prisme topographique avec coffret",
    category: "Topographie",
    badge: "équipement",
    image: "images/WhatsApp Image 2026-05-25 at 00.53.21 (1).jpeg",
    description: "Prisme topographique avec coffret de protection pour mesures sur terrain."
  },
  {
    id: 5,
    name: "Kit accessoires topographiques APEKS",
    category: "Topographie",
    badge: "Kit",
    image: "images/WhatsApp Image 2026-05-25 at 00.53.21 (2).jpeg",
    description: "Kit d'accessoires APEKS pour travaux topographiques et interventions terrain."
  },
  {
    id: 6,
    name: "Chaussure de sécurité GUYISA grise",
    category: "Chaussures",
    badge: "Sécurité",
    image: "images/WhatsApp Image 2026-05-25 at 00.53.21 (3).jpeg",
    description: "Chaussure de sécurité GUYISA grise, montante et résistante."
  },
  {
    id: 7,
    name: "Accessoires GNSS et topographie",
    category: "Topographie",
    badge: "Accessoires",
    image: "images/WhatsApp Image 2026-05-25 at 00.53.21.jpeg",
    description: "Sélection d'accessoires pour GPS, GNSS et matériel topographique."
  },
  {
    id: 8,
    name: "Chaussure de travail noire",
    category: "Chaussures",
    badge: "Travail",
    image: "images/WhatsApp Image 2026-05-25 at 00.53.22.jpeg",
    description: "Chaussure de travail noire, confortable et adaptée aux activités terrain."
  },
  {
    id: 9,
    name: "Chaussure de sécurité GUYISA vert jaune",
    category: "Chaussures",
    badge: "Sécurité",
    image: "images/WhatsApp Image 2026-05-25 at 01.00.48.jpeg",
    description: "Chaussure de sécurité GUYISA vert et jaune pour usage professionnel."
  },
  {
    id: 10,
    name: "Ensemble tenue verte",
    category: "Vêtements",
    badge: "Ensemble",
    image: "images/WhatsApp Image 2026-05-25 at 01.00.51 (1).jpeg",
    description: "Ensemble vert avec haut, pantalon et accessoires assortis."
  },
  {
    id: 11,
    name: "T-shirts unis assortis",
    category: "Vêtements",
    badge: "T-shirt",
    image: "images/WhatsApp Image 2026-05-25 at 01.00.51 (2).jpeg",
    description: "T-shirts unis disponibles en plusieurs couleurs sobres."
  },
  {
    id: 12,
    name: "Pantalons jeans noirs",
    category: "Vêtements",
    badge: "Pantalon",
    image: "images/WhatsApp Image 2026-05-25 at 01.00.51 (3).jpeg",
    description: "Pantalons jeans noirs avec coupe moderne et finition propre."
  },
  {
    id: 13,
    name: "Chemises manches longues assorties",
    category: "Vêtements",
    badge: "Chemise",
    image: "images/WhatsApp Image 2026-05-25 at 01.00.51.jpeg",
    description: "Chemises manches longues en plusieurs couleurs pour style professionnel."
  },
  {
    id: 14,
    name: "Chaussure de sécurité GUYISA basse",
    category: "Chaussures",
    badge: "Sécurité",
    image: "images/WhatsApp Image 2026-05-25 at 02.06.15.jpeg",
    description: "Chaussure de sécurité basse GUYISA, stable et résistante."
  },
  {
    id: 15,
    name: "Laser topographique APEKS A40 Pro",
    category: "Topographie",
    badge: "Laser",
    image: "images/WhatsApp Image 2026-05-25 at 02.08.30.jpeg",
    description: "Laser topographique APEKS A40 Pro pour mesures et alignements précis."
  },
  {
    id: 16,
    name: "Prisme topographique professionnel",
    category: "Topographie",
    badge: "Prisme",
    image: "images/WhatsApp Image 2026-05-25 at 02.08.31 (1).jpeg",
    description: "Prisme topographique professionnel livre dans son coffret de transport."
  },
  {
    id: 17,
    name: "Kit topographique complet APEKS",
    category: "Topographie",
    badge: "Kit",
    image: "images/WhatsApp Image 2026-05-25 at 02.08.31 (2).jpeg",
    description: "Kit complet pour techniciens topographes et travaux de terrain."
  },
  {
    id: 18,
    name: "Catalogue accessoires topographiques",
    category: "Topographie",
    badge: "Accessoires",
    image: "images/WhatsApp Image 2026-05-25 at 02.08.31.jpeg",
    description: "Accessoires pour stations, GNSS, batteries, supports et outils de mesure."
  },
  {
    id: 19,
    name: "Chaussure de travail noire montante",
    category: "Chaussures",
    badge: "Travail",
    image: "images/WhatsApp Image 2026-05-25 at 02.08.32 (1).jpeg",
    description: "Chaussure de travail noire montante, ideale pour chantiers et terrain."
  },
  {
    id: 20,
    name: "Chaussure de sécurité GUYISA gris noir",
    category: "Chaussures",
    badge: "Sécurité",
    image: "images/WhatsApp Image 2026-05-25 at 02.08.32.jpeg",
    description: "Chaussure de sécurité GUYISA gris noir, protection et confort."
  },
  {
    id: 21,
    name: "Pantalons jeans noirs premium",
    category: "Vêtements",
    badge: "Pantalon",
    image: "images/WhatsApp Image 2026-05-25 at 02.08.33 (1).jpeg",
    description: "Pantalons jeans noirs premium avec etiquettes et finition soignee."
  }
];

const WHATSAPP_NUMBER = "2290164870543";
const WHATSAPP_DIRECT_LINK = "https://wa.me/qr/6VMOUHB2HLXTI1";
const PRODUCT_CACHE_KEY = "kepac-admin-products";
const PRODUCT_IMAGES = PRODUCTS.map((product) => product.image);
const TOPOGRAPHY_IMAGE_NAMES = [
  "WhatsApp Image 2026-05-25 at 00.53.20 (2).jpeg",
  "WhatsApp Image 2026-05-25 at 00.53.21 (1).jpeg",
  "WhatsApp Image 2026-05-25 at 00.53.21 (2).jpeg",
  "WhatsApp Image 2026-05-25 at 00.53.21.jpeg",
  "WhatsApp Image 2026-05-25 at 02.08.30.jpeg",
  "WhatsApp Image 2026-05-25 at 02.08.31 (1).jpeg",
  "WhatsApp Image 2026-05-25 at 02.08.31 (2).jpeg",
  "WhatsApp Image 2026-05-25 at 02.08.31.jpeg"
];
const CATEGORY_FALLBACK_IMAGES = {
  "Vêtements": [
    "images/WhatsApp Image 2026-05-25 at 01.00.51 (1).jpeg",
    "images/WhatsApp Image 2026-05-25 at 01.00.51 (2).jpeg",
    "images/WhatsApp Image 2026-05-25 at 01.00.51 (3).jpeg",
    "images/WhatsApp Image 2026-05-25 at 01.00.51.jpeg"
  ],
  Chaussures: [
    "images/WhatsApp Image 2026-05-25 at 00.53.20 (1).jpeg",
    "images/WhatsApp Image 2026-05-25 at 00.53.20.jpeg",
    "images/WhatsApp Image 2026-05-25 at 00.53.21 (3).jpeg",
    "images/WhatsApp Image 2026-05-25 at 00.53.22.jpeg",
    "images/WhatsApp Image 2026-05-25 at 01.00.48.jpeg",
    "images/WhatsApp Image 2026-05-25 at 02.06.15.jpeg",
    "images/WhatsApp Image 2026-05-25 at 02.08.32.jpeg"
  ],
  Topographie: TOPOGRAPHY_IMAGE_NAMES.map((name) => `images/${name}`)
};

function toast(message) {
  let node = document.querySelector(".toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "toast";
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 2200);
}

function fallbackImage(productId) {
  return PRODUCT_IMAGES[(Number(productId) - 1) % PRODUCT_IMAGES.length] || PRODUCT_IMAGES[0];
}

function categoryFallbackImage(category, name = "", index = 0) {
  const text = cleanText(name);
  const categoryName = cleanText(category);

  if (text.includes("chemise")) return "images/WhatsApp Image 2026-05-25 at 01.00.51.jpeg";
  if (text.includes("robe") || text.includes("ensemble") || text.includes("tenue")) return "images/WhatsApp Image 2026-05-25 at 01.00.51 (1).jpeg";
  if (text.includes("pantalon") || text.includes("jeans")) return "images/WhatsApp Image 2026-05-25 at 01.00.51 (3).jpeg";
  if (text.includes("basket")) return "images/WhatsApp Image 2026-05-25 at 00.53.20.jpeg";
  if (text.includes("sandale")) return "images/WhatsApp Image 2026-05-25 at 02.06.15.jpeg";

  const pool = categoryName.includes("vetement")
    ? CATEGORY_FALLBACK_IMAGES["Vêtements"]
    : categoryName.includes("chaussure")
      ? CATEGORY_FALLBACK_IMAGES.Chaussures
      : categoryName.includes("topographie")
        ? CATEGORY_FALLBACK_IMAGES.Topographie
        : PRODUCT_IMAGES;
  return pool[index % pool.length] || PRODUCT_IMAGES[0];
}

function whatsappLink(product) {
  const message = `Bonjour KEPAC GROUP, je souhaite commander ce produit : ${product.name}. Merci de me confirmer la disponibilité.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function whatsappTextLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function whatsappDirectLink() {
  return WHATSAPP_DIRECT_LINK;
}

function displayCategoryName(category) {
  const value = cleanText(category);
  if (value.includes("vetement")) return "Vêtements";
  if (value.includes("chaussure")) return "Chaussures";
  if (value.includes("topographie")) return "Topographie";
  return category || "Produit";
}

function productCard(product) {
  return `
    <article class="product-card group transition duration-300 hover:-translate-y-1 hover:shadow-kepac-hover">
      <a class="product-media block" href="produit.html?id=${product.id}">
        <img class="transition duration-500 group-hover:scale-105" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='${fallbackImage(product.id)}'">
      </a>
      <div class="product-info">
        <div class="product-meta">
          <span class="tag">${product.badge}</span>
          <span class="tag">${displayCategoryName(product.category)}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <a class="btn btn-primary" href="${whatsappLink(product)}" target="_blank" rel="noopener">Commander sur WhatsApp</a>
      </div>
    </article>
  `;
}

function normalizeProduct(product, index = 0) {
  const image = product.image?.startsWith("/") ? product.image.slice(1) : product.image;
  const rawCategory = product.category || product.categorie_nom || product.categorie || "Produit";
  const name = product.name || product.nom || "Produit KEPAC";
  const description = product.description || "Produit disponible dans la boutique KEPAC.";
  const normalizedCategory = inferCategoryStrict({
    category: rawCategory,
    name,
    description,
    image
  });

  return {
    id: product.id,
    name,
    category: normalizedCategory,
    badge: product.badge || (Number(product.stock) > 0 ? "Disponible" : "Stock limite"),
    image: image || categoryFallbackImage(normalizedCategory, name, index),
    description,
    origin: product.origin || (product.nom ? "server" : "local")
  };
}

function normalizeCategoryName(category) {
  const value = String(category || "").toLowerCase();

  if (value.includes("topo") || value.includes("equipement") || value.includes("accessoire") || value.includes("prisme") || value.includes("laser")) {
    return "Topographie";
  }

  if (value.includes("chauss")) {
    return "Chaussures";
  }

  if (value.includes("vet") || value.includes("vêt") || value.includes("robe") || value.includes("chemise") || value.includes("pantalon") || value.includes("t-shirt")) {
    return "Vêtements";
  }

  return category || "Produit";
}

function textHasAny(value, words) {
  return words.some((word) => value.includes(word));
}

function isTopographyImage(image = "") {
  const fileName = image.split("/").pop();
  return TOPOGRAPHY_IMAGE_NAMES.includes(fileName);
}

function inferProductCategory(product) {
  const text = `${product.category || ""} ${product.name || ""} ${product.description || ""}`.toLowerCase();

  if (
    isTopographyImage(product.image) ||
    textHasAny(text, ["topo", "laser", "prisme", "gnss", "gps", "station", "niveau", "mesure", "apeks", "coffret"])
  ) {
    return "Topographie";
  }

  if (textHasAny(text, ["chauss", "basket", "sandale", "guyisa"])) {
    return "Chaussures";
  }

  if (textHasAny(text, ["vet", "vêt", "robe", "chemise", "pantalon", "t-shirt", "tenue", "jeans"])) {
    return "Vêtements";
  }

  if (textHasAny(text, ["accessoire", "équipement", "équipement"])) {
    return "Topographie";
  }

  return product.category || "Produit";
}

function productFamily(product) {
  const category = inferProductCategory(product);
  if (category === "Topographie") return "Topographie";
  if (["Vêtements", "Chaussures"].includes(category)) return "Mode";
  return "Autres";
}

function cleanText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function inferCategoryStrict(product) {
  const text = cleanText(`${product.category || ""} ${product.name || ""} ${product.description || ""}`);

  if (
    isTopographyImage(product.image) ||
    textHasAny(text, ["topo", "laser", "prisme", "gnss", "gps", "station", "niveau", "mesure", "apeks", "coffret", "equipement"])
  ) {
    return "Topographie";
  }

  if (textHasAny(text, ["chauss", "basket", "sandale", "guyisa"])) {
    return "Chaussures";
  }

  if (textHasAny(text, ["vet", "robe", "chemise", "pantalon", "t-shirt", "tenue", "jeans"])) {
    return "Vêtements";
  }

  if (textHasAny(text, ["accessoire"])) {
    return "Topographie";
  }

  return product.category || "Produit";
}

function productFamilyStrict(product) {
  const category = inferCategoryStrict(product);
  if (category === "Topographie") return "Topographie";
  if (["Vêtements", "Chaussures"].includes(category)) return "Mode";
  return "Autres";
}

function requestJson(url) {
  if (typeof fetch === "function") {
    return fetch(url).then((response) => {
      if (!response.ok) throw new Error("R?ponse serveur invalide");
      return response.json();
    });
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.onreadystatechange = () => {
      if (request.readyState !== 4) return;

      if (request.status >= 200 && request.status < 300) {
        try {
          resolve(JSON.parse(request.responseText));
        } catch (error) {
          reject(error);
        }
        return;
      }

      reject(new Error("R?ponse serveur invalide"));
    };
    request.onerror = () => reject(new Error("Connexion impossible"));
    request.send();
  });
}

function readCachedProducts() {
  try {
    const products = JSON.parse(localStorage.getItem(PRODUCT_CACHE_KEY) || "[]");
    return Array.isArray(products) ? products : [];
  } catch (error) {
    return [];
  }
}

function mergeProducts(primaryProducts, cachedProducts) {
  const productsByKey = new Map();

  [...primaryProducts, ...cachedProducts].forEach((product) => {
    const key = product.id ? `id-${product.id}` : `${product.name}-${product.image}`;
    productsByKey.set(key, product);
  });

  return uniqueProductsByImage([...productsByKey.values()]);
}

async function loadProductsFromApi() {
  const cachedProducts = readCachedProducts().map((product, index) => normalizeProduct(product, index));

  try {
    const data = await requestJson("/api/produits");
    if (Array.isArray(data.produits) && data.produits.length) {
      PRODUCTS = mergeProducts(data.produits.map(normalizeProduct), cachedProducts);
    }
  } catch (error) {
    PRODUCTS = mergeProducts(PRODUCTS, cachedProducts);
    console.warn("Catalogue local utilise", error.message);
  }

  return PRODUCTS;
}

function uniqueProductsByImage(products) {
  const seen = new Set();

  return products.filter((product) => {
    const key = product.image ? imageDisplayKey(product.image) : cleanText(product.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function imageDisplayKey(image = "") {
  return String(image)
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .toLowerCase();
}

function productDisplayKey(product) {
  const text = cleanText(`${product.name || ""} ${product.description || ""}`);
  const image = product.image || "";
  const isUserProduct = product.origin === "admin" || product.origin === "server";

  if (isUserProduct && image) return `image-${imageDisplayKey(image)}`;
  if (text.includes("laser") || text.includes("apeks a40")) return "topographie-laser";
  if (text.includes("prisme")) return "topographie-prisme";
  if (text.includes("gnss") || text.includes("gps")) return "topographie-gnss";
  if (text.includes("kit") && text.includes("topograph")) return "topographie-kit";
  if (text.includes("accessoire") && text.includes("topograph")) return "topographie-accessoires";
  if (text.includes("pantalon") || text.includes("jeans")) return "vetement-pantalon-jeans";
  if (text.includes("t-shirt")) return "vetement-tshirt";
  if (text.includes("chemise")) return "vetement-chemise";
  if (text.includes("ensemble") || text.includes("tenue")) return "vetement-ensemble";
  if (text.includes("sandale")) return "chaussure-sandale";
  if (text.includes("basket")) return "chaussure-basket";
  if (text.includes("chaussure") && text.includes("securite")) return "chaussure-securite";
  if (text.includes("chaussure") && text.includes("travail")) return "chaussure-travail";

  return image || text;
}

function productDisplayFamily(product) {
  const text = cleanText(`${product.category || ""} ${product.name || ""} ${product.description || ""}`);

  if (textHasAny(text, ["topo", "laser", "prisme", "gnss", "gps", "station", "niveau", "mesure", "apeks", "coffret", "equipement"])) {
    return "topographie";
  }

  if (textHasAny(text, ["chauss", "basket", "sandale", "guyisa"])) {
    return "chaussures";
  }

  if (textHasAny(text, ["vet", "robe", "chemise", "pantalon", "t-shirt", "tenue", "jeans"])) {
    return "vetements";
  }

  return cleanText(product.category || product.name || "produit");
}

function featuredProducts() {
  const sortedProducts = uniqueProductsForDisplay(PRODUCTS)
    .sort((a, b) => {
      const priority = { admin: 3, server: 2, local: 1 };
      const priorityDiff = (priority[b.origin] || 1) - (priority[a.origin] || 1);
      if (priorityDiff) return priorityDiff;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  const wantedFamilies = ["chaussures", "vetements", "topographie"];
  const selected = [];
  const usedFamilies = new Set();
  const usedImages = new Set();

  wantedFamilies.forEach((family) => {
    const product = sortedProducts.find((item) => {
      const imageKey = imageDisplayKey(item.image || "");
      return productDisplayFamily(item) === family && !usedImages.has(imageKey);
    });

    if (product) {
      usedImages.add(imageDisplayKey(product.image || ""));
      selected.push(product);
      usedFamilies.add(family);
    }
  });

  sortedProducts.forEach((product) => {
    const family = productDisplayFamily(product);
    const imageKey = imageDisplayKey(product.image || "");
    if (selected.length >= 4 || usedFamilies.has(family)) return;
    if (usedImages.has(imageKey)) return;
    usedImages.add(imageKey);
    selected.push(product);
    usedFamilies.add(family);
  });

  return selected;
}

function uniqueProductsForDisplay(products) {
  const seen = new Set();

  return products.filter((product) => {
    const key = productDisplayKey(product);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderProducts(target, products = PRODUCTS) {
  const node = document.querySelector(target);
  if (!node) return;
  node.innerHTML = uniqueProductsForDisplay(products).map(productCard).join("");
}

function homeCategoryProducts(categoryKey) {
  const family = cleanText(categoryKey);
  const products = uniqueProductsForDisplay(PRODUCTS)
    .filter((product) => productDisplayFamily(product) === family)
    .sort((a, b) => {
      const priority = { admin: 3, server: 2, local: 1 };
      const priorityDiff = (priority[b.origin] || 1) - (priority[a.origin] || 1);
      if (priorityDiff) return priorityDiff;
      return Number(b.id || 0) - Number(a.id || 0);
    });

  return products.slice(0, 3);
}

function renderHomeCategories() {
  document.querySelectorAll("[data-home-category]").forEach((node) => {
    const products = homeCategoryProducts(node.dataset.homeCategory);
    node.innerHTML = products.length
      ? products.map(productCard).join("")
      : `<div class="empty-state"><h3>Aucun produit pour le moment</h3><p class="muted">Ajoutez un produit admin dans cette catégorie.</p></div>`;
  });
}

function setActiveNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    if (link.getAttribute("href") === page) {
      link.classList.add("active");
    }
  });
}

function initAuthNavigation() {
  const token = localStorage.getItem("kepac-token");
  const user = JSON.parse(localStorage.getItem("kepac-user") || "null");
  const isAdmin = Boolean(token && user?.role === "admin");
  const isConnected = Boolean(token && user);
  const navLinks = document.querySelector(".nav-links");
  const navActions = document.querySelector(".nav-actions");

  if (navLinks) {
    navLinks.innerHTML = `
      <a href="index.html">Accueil</a>
      <a href="catalogue.html">Catalogue</a>
      ${isConnected ? '<a href="profil.html">Profil</a>' : ""}
      ${isAdmin ? '<a href="admin.html">Tableau de bord</a>' : ""}
    `;
  }

  if (navActions) {
    navActions.innerHTML = isConnected
      ? `
        <a class="btn btn-secondary" href="${whatsappDirectLink()}" target="_blank" rel="noopener">WhatsApp</a>
        <button class="btn btn-ghost" type="button" data-nav-logout>Déconnexion</button>
      `
      : `
        <a class="btn btn-secondary" href="${whatsappDirectLink()}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn btn-primary" href="connexion.html">Admin</a>
      `;
  }

  document.querySelector("[data-nav-logout]")?.addEventListener("click", () => {
    localStorage.removeItem("kepac-token");
    localStorage.removeItem("kepac-user");
    toast("Vous ?tes d?connect?.");
    window.setTimeout(() => {
      location.href = "connexion.html";
    }, 700);
  });
}

function initNewsletter() {
  document.querySelectorAll("[data-newsletter]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.reset();
      toast("Merci, votre email a bien ?t? not?.");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAuthNavigation();
  setActiveNav();
  initNewsletter();
  window.kepacProductsReady = loadProductsFromApi().then(() => {
    renderProducts("[data-featured-products]", featuredProducts());
    renderHomeCategories();
    return PRODUCTS;
  });
});
