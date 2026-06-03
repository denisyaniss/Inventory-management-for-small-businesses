const express = require('express');
const deliveryNotesController = require('../controllers/deliveryNotesController');

const router = express.Router();

// ========== ROUTES DES BONS DE LIVRAISON ==========

// Créer un bon de livraison
router.post('/', deliveryNotesController.createDeliveryNote);

// Récupérer tous les bons de livraison
router.get('/', deliveryNotesController.getAllDeliveryNotes);

// Récupérer un bon de livraison par ID avec ses articles
router.get('/:id', deliveryNotesController.getDeliveryNoteById);

// Récupérer les bons de livraison d'une commande
router.get('/purchase-order/:po_id', deliveryNotesController.getDeliveryNotesByPurchaseOrder);

// ========== ROUTES ARTICLES DE BON DE LIVRAISON ==========

// Ajouter un article à un bon de livraison
router.post('/:id/items', deliveryNotesController.addItemToDeliveryNote);

// Mettre à jour un article d'un bon de livraison
router.put('/:id/items/:item_id', deliveryNotesController.updateDeliveryNoteItem);

module.exports = router;
