USE kepac_ecommerce;

INSERT IGNORE INTO categories (id, nom, slug, description, parent_id) VALUES
  (1, 'Equipements topographiques', 'equipements-topographiques', 'Appareils et accessoires topographiques', NULL),
  (2, 'Chaussures', 'chaussures', 'Chaussures de securite et de travail', NULL),
  (3, 'Vetements', 'vetements', 'Chemises, pantalons, t-shirts et ensembles', NULL),
  (4, 'Autres', 'autres', 'Autres produits KEPAC', NULL);

UPDATE categories SET nom = 'Equipements topographiques', slug = 'equipements-topographiques', description = 'Appareils et accessoires topographiques' WHERE id = 1;
UPDATE categories SET nom = 'Chaussures', slug = 'chaussures', description = 'Chaussures de securite et de travail' WHERE id = 2;
UPDATE categories SET nom = 'Vetements', slug = 'vetements', description = 'Chemises, pantalons, t-shirts et ensembles' WHERE id = 3;
UPDATE categories SET nom = 'Autres', slug = 'autres', description = 'Autres produits KEPAC' WHERE id = 4;

-- Mot de passe admin initial : a changer apres la premiere connexion.
INSERT IGNORE INTO utilisateurs (id, nom, prenom, email, mot_de_passe, role, telephone) VALUES
  (1, 'Admin', 'Kepac', 'admin@kepac.com',
   '$2b$10$FfDCqDV430kpT5sEml1tVuc9ACXgXPLPYNJUBFEUDPm5.hxL3qkZS',
   'admin', '+2290164870543');

UPDATE utilisateurs
SET mot_de_passe = '$2b$10$FfDCqDV430kpT5sEml1tVuc9ACXgXPLPYNJUBFEUDPm5.hxL3qkZS',
    role = 'admin'
WHERE email = 'admin@kepac.com';

INSERT IGNORE INTO produits
  (id, nom, description, prix, stock, categorie_id, marque, image)
VALUES
  (1, 'Chaussure de securite GUYISA beige', 'Chaussure montante de securite GUYISA, robuste et adaptee au terrain.', 15000, 20, 2, 'GUYISA', '/images/WhatsApp Image 2026-05-25 at 00.53.20 (1).jpeg'),
  (2, 'Laser topographique APEKS A40', 'Appareil laser APEKS A40 pour travaux topographiques et mesures de precision.', 180000, 10, 1, 'APEKS', '/images/WhatsApp Image 2026-05-25 at 00.53.20 (2).jpeg'),
  (3, 'Chaussure de securite GUYISA noir jaune', 'Chaussure de securite GUYISA noir et jaune, confortable pour chantier.', 15000, 20, 2, 'GUYISA', '/images/WhatsApp Image 2026-05-25 at 00.53.20.jpeg'),
  (4, 'Prisme topographique avec coffret', 'Prisme topographique avec coffret de protection pour mesures sur terrain.', 45000, 10, 1, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 00.53.21 (1).jpeg'),
  (5, 'Kit accessoires topographiques APEKS', 'Kit d accessoires APEKS pour travaux topographiques et interventions terrain.', 35000, 10, 1, 'APEKS', '/images/WhatsApp Image 2026-05-25 at 00.53.21 (2).jpeg'),
  (6, 'Chaussure de securite GUYISA grise', 'Chaussure de securite GUYISA grise, montante et resistante.', 15000, 20, 2, 'GUYISA', '/images/WhatsApp Image 2026-05-25 at 00.53.21 (3).jpeg'),
  (7, 'Accessoires GNSS et topographie', 'Selection d accessoires pour GPS, GNSS et materiel topographique.', 25000, 10, 1, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 00.53.21.jpeg'),
  (8, 'Chaussure de travail noire', 'Chaussure de travail noire, confortable et adaptee aux activites terrain.', 10000, 20, 2, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 00.53.22.jpeg'),
  (9, 'Chaussure de securite GUYISA vert jaune', 'Chaussure de securite GUYISA vert et jaune pour usage professionnel.', 15000, 20, 2, 'GUYISA', '/images/WhatsApp Image 2026-05-25 at 01.00.48.jpeg'),
  (10, 'Ensemble tenue verte', 'Ensemble vert avec haut, pantalon et accessoires assortis.', 12000, 15, 3, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 01.00.51 (1).jpeg'),
  (11, 'T-shirts unis assortis', 'T-shirts unis disponibles en plusieurs couleurs sobres.', 5000, 15, 3, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 01.00.51 (2).jpeg'),
  (12, 'Pantalons jeans noirs', 'Pantalons jeans noirs avec coupe moderne et finition propre.', 10000, 15, 3, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 01.00.51 (3).jpeg'),
  (13, 'Chemises manches longues assorties', 'Chemises manches longues en plusieurs couleurs pour style professionnel.', 10000, 15, 3, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 01.00.51.jpeg'),
  (14, 'Chaussure de securite GUYISA basse', 'Chaussure de securite basse GUYISA, stable et resistante.', 15000, 20, 2, 'GUYISA', '/images/WhatsApp Image 2026-05-25 at 02.06.15.jpeg'),
  (15, 'Laser topographique APEKS A40 Pro', 'Laser topographique APEKS A40 Pro pour mesures et alignements precis.', 220000, 10, 1, 'APEKS', '/images/WhatsApp Image 2026-05-25 at 02.08.30.jpeg'),
  (16, 'Prisme topographique professionnel', 'Prisme topographique professionnel livre dans son coffret de transport.', 50000, 10, 1, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 02.08.31 (1).jpeg'),
  (17, 'Kit topographique complet APEKS', 'Kit complet pour techniciens topographes et travaux de terrain.', 65000, 10, 1, 'APEKS', '/images/WhatsApp Image 2026-05-25 at 02.08.31 (2).jpeg'),
  (18, 'Catalogue accessoires topographiques', 'Accessoires pour stations, GNSS, batteries, supports et outils de mesure.', 30000, 10, 1, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 02.08.31.jpeg'),
  (19, 'Chaussure de travail noire montante', 'Chaussure de travail noire montante, ideale pour chantiers et terrain.', 12000, 20, 2, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 02.08.32 (1).jpeg'),
  (20, 'Chaussure de securite GUYISA gris noir', 'Chaussure de securite GUYISA gris noir, protection et confort.', 15000, 20, 2, 'GUYISA', '/images/WhatsApp Image 2026-05-25 at 02.08.32.jpeg'),
  (21, 'Pantalons jeans noirs premium', 'Pantalons jeans noirs premium avec etiquettes et finition soignee.', 12000, 15, 3, 'KEPAC', '/images/WhatsApp Image 2026-05-25 at 02.08.33 (1).jpeg')
ON DUPLICATE KEY UPDATE
  nom = VALUES(nom),
  description = VALUES(description),
  prix = VALUES(prix),
  stock = VALUES(stock),
  categorie_id = VALUES(categorie_id),
  marque = VALUES(marque),
  image = VALUES(image),
  actif = 1;
