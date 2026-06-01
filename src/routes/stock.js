const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

// Routes de gestion du stock
router.get('/:productId', stockController.getStock);
router.post('/:productId/update', stockController.updateStock);
router.get('/:productId/history', stockController.getMovementHistory);

module.exports = router;