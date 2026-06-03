const express = require('express');
const locationsController = require('../controllers/locationsController');

const router = express.Router();

// ========== ROUTES DES LOCALISATIONS ==========

// Créer une localisation
router.post('/', locationsController.createLocation);

// Récupérer toutes les localisations
router.get('/', locationsController.getAllLocations);

// Récupérer une localisation par ID
router.get('/:id', locationsController.getLocationById);

// Mettre à jour une localisation
router.put('/:id', locationsController.updateLocation);

// Désactiver une localisation
router.delete('/:id', locationsController.deactivateLocation);

// ========== ROUTES STOCK PAR LOCALISATION ==========

// Récupérer le stock d'un produit dans une localisation
router.get('/:location_id/stock/:product_id', locationsController.getStockByLocation);

// Récupérer le stock d'un produit dans toutes les localisations
router.get('/product/:product_id/stock-all', locationsController.getProductStockAllLocations);

// ========== ROUTES TRANSFERTS INTER-DÉPÔTS ==========

// Créer un transfert
router.post('/transfers', locationsController.createTransfer);

// Récupérer tous les transferts
router.get('/transfers/all', locationsController.getAllTransfers);

// Récupérer les transferts d'un produit
router.get('/transfers/product/:product_id', locationsController.getProductTransfers);

// Récupérer les transferts d'une localisation
router.get('/:location_id/transfers', locationsController.getLocationTransfers);

module.exports = router;
