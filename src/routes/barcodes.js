const express = require('express');
const barcodesController = require('../controllers/barcodesController');

const router = express.Router();

// ========== ROUTES DES CODES-BARRES ==========

// Créer un code-barres
router.post('/', barcodesController.createBarcode);

// Récupérer tous les codes-barres
router.get('/', barcodesController.getAllBarcodes);

// Récupérer les codes-barres d'un produit
router.get('/product/:product_id', barcodesController.getProductBarcodes);

// Chercher un produit par code-barres (scanner)
router.get('/find/:barcode', barcodesController.findProductByBarcode);

// Vérifier si un code-barres existe
router.get('/check/:barcode', barcodesController.checkBarcodeExists);

// Mettre à jour un code-barres
router.put('/:id', barcodesController.updateBarcode);

// Désactiver un code-barres
router.patch('/:id/deactivate', barcodesController.deactivateBarcode);

// Supprimer un code-barres
router.delete('/:id', barcodesController.deleteBarcode);

// ========== ROUTES UTILITAIRES ==========

// Générer un code-barres EAN13
router.post('/generate/ean13', barcodesController.generateEAN13);

// Importer plusieurs codes-barres
router.post('/import/batch', barcodesController.importBarcodes);

// Exporter les codes-barres d'une catégorie
router.get('/export/category/:category_id', barcodesController.exportCategoryBarcodes);

module.exports = router;
