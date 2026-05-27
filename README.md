# KEPAC Boutique

Site e-commerce simple et professionnel pour presenter des produits et recevoir les commandes directement sur WhatsApp.

## Lancer le site

Depuis le dossier `server` :

```bash
npm start
```

Puis ouvrir `http://localhost:5000` si le port defini dans `.env` est `5000`.

Dans ce projet, le fichier `.env` utilise actuellement :

```txt
PORT=3000
DB_NAME=kepac_ecommerce
```

Donc l'adresse sera normalement `http://localhost:3000`.

## Installer la base MySQL

1. Ouvrir phpMyAdmin.
2. Importer `database/schema.sql`.
3. Importer ensuite `database/seed.sql`.
4. Lancer le serveur Node depuis le dossier `server`.

Compte admin de test :

```txt
Email : admin@kepac.com
Mot de passe : Admin123!
```

## API backend

- `GET /api/health` : verifier que l'API fonctionne
- `POST /api/auth/inscription` : creer un compte client
- `POST /api/auth/connexion` : connecter un client/admin
- `GET /api/auth/profil` : lire le profil connecte
- `GET /api/produits` : liste des produits
- `GET /api/produits/:id` : detail produit
- `POST /api/produits` : creer un produit admin
- `PUT /api/produits/:id` : modifier un produit admin
- `DELETE /api/produits/:id` : desactiver un produit admin
- `POST /api/commandes` : creer une commande
- `GET /api/commandes/:id` : detail commande
- `GET /api/admin/dashboard` : statistiques admin
- `GET /api/admin/commandes` : liste des commandes admin

## Pages principales

- `public/index.html` : accueil
- `public/catalogue.html` : catalogue avec filtres
- `public/panier.html` : page de contact WhatsApp
- `public/commande.html` : page de commande WhatsApp
- `public/connexion.html` et `public/inscription.html` : acces client
- `public/admin.html` : tableau de bord de base
