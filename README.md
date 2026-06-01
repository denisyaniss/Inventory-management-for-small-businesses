# Système de Gestion de Stock - Petites Entreprises

Une solution complète et simple pour gérer l'inventaire des petites entreprises.

## 🎯 Fonctionnalités

- **Gestion des produits** : Ajouter, modifier, supprimer et consulter les articles
- **Suivi du stock** : Suivre les quantités disponibles en temps réel
- **Alertes de stock bas** : Notifications automatiques quand le stock est faible
- **Catégories** : Organiser les produits par catégories
- **Historique** : Traçabilité complète des mouvements de stock
- **Rapports** : Générer des rapports d'inventaire
- **Interface simple** : Facile à utiliser, pas de formations compliquées
- **Sauvegardes** : Sauvegardes automatiques des données

## 📋 Prérequis

- Node.js 16+
- npm ou yarn
- SQLite3 (inclus)

## 🚀 Installation Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer la base de données
npm run setup

# 3. Lancer l'application
npm start
```

L'app sera disponible sur `http://localhost:5000`

### Identifiants par défaut
- **Email** : admin@inventory.com
- **Mot de passe** : admin123

⚠️ Changez le mot de passe au premier démarrage!

## 📁 Structure du Projet

```
inventory-management/
├── src/
│   ├── app.js                    # Application principale
│   ├── database.js               # Connexion SQLite
│   ├── controllers/
│   │   ├── authController.js     # Authentification
│   │   ├── productsController.js # Gestion produits
│   │   └── stockController.js    # Gestion stock
│   └── routes/
│       ├── auth.js
│       ├── products.js
│       ├── stock.js
│       ├── categories.js
│       └── reports.js
├── database/
│   └── schema.sql                # Schéma SQLite
├── scripts/
│   └── setup.js                  # Script d'initialisation
├── docs/
│   ├── api.md                    # Documentation API
│   └── guide-utilisateur.md      # Guide d'utilisation
├── package.json
├── .env.example
├── .gitignore
├── LICENSE
└── CONTRIBUTING.md
```

## 📚 Fonctionnalités Détaillées

### 1️⃣ Gestion des Produits
- Créer, modifier, supprimer des articles
- Codes SKU uniques
- Prix unitaires
- Niveaux de réapprovisionnement

### 2️⃣ Suivi du Stock
- Mouvements d'entrée (achats, retours)
- Mouvements de sortie (ventes, utilisation)
- Historique complet traçable
- Raisons des mouvements

### 3️⃣ Alertes Intelligentes
- ⚠️ Stock faible (≤ niveau défini)
- 🔴 Rupture de stock
- Notifications automatiques

### 4️⃣ Rapports
- 📊 Inventaire par catégorie
- 📉 Produits sous stock minimum
- 📈 Historique des 30 derniers jours
- 💰 Valeur totale du stock

### 5️⃣ Catégories
- Organisation logique
- Rapports par catégorie
- Filtrage facile

## 🔐 Sécurité

- ✅ Authentification JWT
- ✅ Hachage des mots de passe (bcrypt)
- ✅ Validation des données
- ✅ Contrôle d'accès par rôles
- ✅ CORS configuré

## 🛠️ Commandes Utiles

```bash
# Installation
npm install

# Initialiser la BD
npm run setup

# Lancer en développement
npm run dev

# Lancer en production
npm start

# Tests
npm test
```

## 📖 Documentation

- [Guide Utilisateur](docs/guide-utilisateur.md) - Comment utiliser l'application
- [Documentation API](docs/api.md) - Endpoints et exemples
- [Guide de Contribution](CONTRIBUTING.md) - Comment contribuer

## 🔌 API REST

Endpoints principaux:

```
POST   /api/auth/register         # Inscription
POST   /api/auth/login            # Connexion
GET    /api/products              # Tous les produits
POST   /api/products              # Créer produit
GET    /api/stock/:id             # Stock d'un produit
POST   /api/stock/:id/update      # Mettre à jour stock
GET    /api/reports/inventory     # Rapport inventaire
GET    /api/reports/low-stock     # Produits en rupture
```

Voir [API Documentation](docs/api.md) pour plus de détails.

## 💡 Cas d'Usage

✅ Petites boutiques de détail
✅ Restaurants et cafés
✅ Dépôts et entrepôts
✅ Pharmacies
✅ Bibliothèques
✅ Cliniques
✅ Ateliers de réparation

## 🚀 Déploiement

L'application peut être déployée sur:
- Heroku
- AWS
- DigitalOcean
- Vercel
- Votre serveur personnel

## 🤝 Contribution

Les contributions sont bienvenues! Consultez [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 Licence

MIT License - Libre d'utilisation

## 📞 Support

Pour toute question :
- 📧 Ouvrez une [Issue](https://github.com/denisyaniss/Inventory-management-for-small-businesses/issues)
- 💬 Consultez la [documentation](docs/)
- officialdenis304@gmail.com
---

**Développé avec ❤️ pour faciliter la gestion des petites entreprises**

*Dernière mise à jour: 2024*
