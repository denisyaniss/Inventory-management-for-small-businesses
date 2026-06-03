const express = require('express');
const purchaseOrdersController = require('../controllers/purchaseOrdersController');

const router = express.Router();

// ========== ROUTES DES COMMANDES AUX FOURNISSEURS ==========

// Créer une commande
router.post('/', purchaseOrdersController.createPurchaseOrder);

// Récupérer toutes les commandes
router.get('/', purchaseOrdersController.getAllPurchaseOrders);

// Récupérer une commande par ID avec ses articles
router.get('/:id', purchaseOrdersController.getPurchaseOrderById);

// Mettre à jour le statut d'une commande
router.patch('/:id/status', purchaseOrdersController.updatePurchaseOrderStatus);

// ========== ROUTES ARTICLES DE COMMANDE ==========

// Ajouter un article à une commande
router.post('/:id/items', purchaseOrdersController.addItemToPurchaseOrder);

// Retirer un article d'une commande
router.delete('/:id/items/:item_id', purchaseOrdersController.removeItemFromPurchaseOrder);

// Recevoir partiellement une commande
router.patch('/:id/items/:item_id/receive', purchaseOrdersController.receivePartialOrder);

module.exports = router;
