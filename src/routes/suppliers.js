const express = require('express');
const suppliersController = require('../controllers/suppliersController');

const router = express.Router();

// ========== ROUTES DES FOURNISSEURS ==========

// Créer un fournisseur
router.post('/', suppliersController.createSupplier);

// Récupérer tous les fournisseurs
router.get('/', suppliersController.getAllSuppliers);

// Récupérer un fournisseur par ID
router.get('/:id', suppliersController.getSupplierById);

// Mettre à jour un fournisseur
router.put('/:id', suppliersController.updateSupplier);

// Désactiver un fournisseur
router.delete('/:id', suppliersController.deactivateSupplier);

// ========== ROUTES LIAISON PRODUIT-FOURNISSEUR ==========

// Ajouter un fournisseur à un produit
router.post('/:supplier_id/products/:product_id', suppliersController.addSupplierToProduct);

// Récupérer les fournisseurs d'un produit
router.get('/product/:product_id', suppliersController.getProductSuppliers);

// Mettre à jour le prix d'un fournisseur pour un produit
router.put('/:supplier_id/products/:product_id/price', suppliersController.updateSupplierPrice);

module.exports = router;
