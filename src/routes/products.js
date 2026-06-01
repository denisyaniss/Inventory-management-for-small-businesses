const express = require('express');
const productsController = require('../controllers/productsController');

const router = express.Router();

// Routes des produits
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);
router.post('/', productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

module.exports = router;