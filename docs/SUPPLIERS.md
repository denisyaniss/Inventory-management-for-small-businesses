# 📖 Documentation - Gestion des Fournisseurs

## Vue d'ensemble

La fonctionnalité de gestion des fournisseurs permet de :
- Enregistrer et gérer les informations des fournisseurs
- Associer plusieurs fournisseurs à un produit
- Gérer les prix et conditions d'approvisionnement par fournisseur
- Marquer les fournisseurs préférés
- Suivre les délais de livraison

## 🔌 Endpoints API

### Gestion des Fournisseurs

#### Créer un fournisseur
```http
POST /api/suppliers
Content-Type: application/json

{
  "name": "Fournisseur ABC",
  "contact_person": "Jean Dupont",
  "email": "contact@abc.fr",
  "phone": "+33 1 23 45 67 89",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postal_code": "75000",
  "country": "France",
  "payment_terms": "Net 30",
  "tax_id": "FR12345678901",
  "notes": "Fournisseur fiable"
}
```

**Réponse (201):**
```json
{
  "message": "Fournisseur créé avec succès",
  "id": 1
}
```

#### Récupérer tous les fournisseurs
```http
GET /api/suppliers
```

**Réponse (200):**
```json
[
  {
    "id": 1,
    "name": "Fournisseur ABC",
    "contact_person": "Jean Dupont",
    "email": "contact@abc.fr",
    "phone": "+33 1 23 45 67 89",
    "address": "123 Rue de la Paix",
    "city": "Paris",
    "postal_code": "75000",
    "country": "France",
    "payment_terms": "Net 30",
    "tax_id": "FR12345678901",
    "is_active": 1,
    "notes": "Fournisseur fiable",
    "created_at": "2026-06-03T13:00:00Z",
    "updated_at": "2026-06-03T13:00:00Z"
  }
]
```

#### Récupérer un fournisseur par ID
```http
GET /api/suppliers/{id}
```

**Réponse (200):**
```json
{
  "id": 1,
  "name": "Fournisseur ABC",
  "contact_person": "Jean Dupont",
  "email": "contact@abc.fr",
  "phone": "+33 1 23 45 67 89",
  "address": "123 Rue de la Paix",
  "city": "Paris",
  "postal_code": "75000",
  "country": "France",
  "payment_terms": "Net 30",
  "tax_id": "FR12345678901",
  "is_active": 1,
  "notes": "Fournisseur fiable",
  "created_at": "2026-06-03T13:00:00Z",
  "updated_at": "2026-06-03T13:00:00Z"
}
```

#### Mettre à jour un fournisseur
```http
PUT /api/suppliers/{id}
Content-Type: application/json

{
  "name": "Fournisseur ABC Modifié",
  "email": "newemail@abc.fr",
  "payment_terms": "Net 45"
}
```

**Réponse (200):**
```json
{
  "message": "Fournisseur mis à jour avec succès"
}
```

#### Désactiver un fournisseur
```http
DELETE /api/suppliers/{id}
```

**Réponse (200):**
```json
{
  "message": "Fournisseur désactivé"
}
```

### Liaison Produit-Fournisseur

#### Ajouter un fournisseur à un produit
```http
POST /api/suppliers/{supplier_id}/products/{product_id}
Content-Type: application/json

{
  "product_id": 5,
  "supplier_id": 1,
  "supplier_sku": "ABC-SKU-001",
  "supplier_price": 25.50,
  "lead_time_days": 7,
  "minimum_order_qty": 10,
  "is_preferred": true
}
```

**Réponse (201):**
```json
{
  "message": "Fournisseur lié au produit",
  "id": 3
}
```

#### Récupérer les fournisseurs d'un produit
```http
GET /api/suppliers/product/{product_id}
```

**Réponse (200):**
```json
[
  {
    "id": 3,
    "product_id": 5,
    "supplier_id": 1,
    "supplier_sku": "ABC-SKU-001",
    "supplier_price": 25.50,
    "lead_time_days": 7,
    "minimum_order_qty": 10,
    "is_preferred": true,
    "name": "Fournisseur ABC",
    "email": "contact@abc.fr",
    "phone": "+33 1 23 45 67 89",
    "contact_person": "Jean Dupont",
    "created_at": "2026-06-03T13:00:00Z",
    "updated_at": "2026-06-03T13:00:00Z"
  }
]
```

#### Mettre à jour le prix d'un fournisseur pour un produit
```http
PUT /api/suppliers/{supplier_id}/products/{product_id}/price
Content-Type: application/json

{
  "supplier_price": 24.99,
  "lead_time_days": 5,
  "minimum_order_qty": 5
}
```

**Réponse (200):**
```json
{
  "message": "Prix fournisseur mis à jour"
}
```

## 📋 Cas d'usage

### 1. Enregistrer un nouveau fournisseur
```javascript
// 1. Créer le fournisseur
const supplierResponse = await fetch('/api/suppliers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Distributeur XYZ",
    email: "contact@xyz.fr",
    phone: "+33 9 87 65 43 21",
    payment_terms: "Net 45"
  })
});

const { id: supplierId } = await supplierResponse.json();
console.log(`Fournisseur créé avec l'ID: ${supplierId}`);
```

### 2. Associer un produit à plusieurs fournisseurs
```javascript
// 2. Ajouter plusieurs fournisseurs au produit
const productId = 10;

// Fournisseur préféré
await fetch(`/api/suppliers/1/products/${productId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    supplier_sku: "SKU-001",
    supplier_price: 20.00,
    lead_time_days: 5,
    minimum_order_qty: 10,
    is_preferred: true
  })
});

// Fournisseur alternatif
await fetch(`/api/suppliers/2/products/${productId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    supplier_sku: "ALT-SKU-001",
    supplier_price: 21.50,
    lead_time_days: 10,
    minimum_order_qty: 5,
    is_preferred: false
  })
});
```

### 3. Obtenir les fournisseurs disponibles pour un produit
```javascript
const response = await fetch('/api/suppliers/product/10');
const suppliers = await response.json();

// Trier par fournisseur préféré d'abord
const preferred = suppliers.filter(s => s.is_preferred);
const alternatives = suppliers.filter(s => !s.is_preferred);
```

## 🛠️ Bonnes pratiques

1. **Toujours avoir au moins 2 fournisseurs** par produit critique
2. **Mettre à jour les prix** régulièrement (mensuel recommandé)
3. **Marquer un fournisseur comme préféré** si excellent service/prix
4. **Enregistrer les délais de livraison** réels observés
5. **Désactiver plutôt que supprimer** les fournisseurs inactifs

## ⚠️ Erreurs courantes

```json
{
  "error": "Ce code-barres existe déjà"
}
```
→ Le fournisseur ou la liaison existe déjà

```json
{
  "error": "Fournisseur non trouvé"
}
```
→ Vérifiez l'ID du fournisseur

## 🔗 Relations

- Un **Fournisseur** peut approvisionner **plusieurs Produits**
- Un **Produit** peut avoir **plusieurs Fournisseurs**
- Chaque liaison peut avoir des **prix et conditions différents**
