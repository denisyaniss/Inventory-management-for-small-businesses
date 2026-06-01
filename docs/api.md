# Documentation API - Gestion de Stock

## Base URL
```
http://localhost:5000/api
```

## 📋 Authentification

### POST /auth/register
Créer un nouvel utilisateur

**Payload:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "full_name": "John Doe"
}
```

### POST /auth/login
Se connecter

**Payload:**
```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

### GET /auth/verify
Vérifier un token JWT

## 📦 Produits

### GET /products
Récupérer tous les produits

### GET /products/:id
Récupérer un produit spécifique

### POST /products
Créer un nouveau produit

### PUT /products/:id
Mettre à jour un produit

### DELETE /products/:id
Supprimer un produit

## 📊 Stock

### GET /stock/:productId
Récupérer le stock d'un produit

### POST /stock/:productId/update
Mettre à jour le stock

### GET /stock/:productId/history
Récupérer l'historique des mouvements

## 📁 Catégories

### GET /categories
Récupérer toutes les catégories

### POST /categories
Créer une catégorie

## 📈 Rapports

### GET /reports/inventory
Rapport d'inventaire par catégorie

### GET /reports/low-stock
Produits avec stock faible

### GET /reports/recent-movements
Mouvements récents