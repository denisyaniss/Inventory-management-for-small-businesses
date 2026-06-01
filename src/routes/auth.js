const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Routes d'authentification
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify', authController.verifyToken);

module.exports = router;