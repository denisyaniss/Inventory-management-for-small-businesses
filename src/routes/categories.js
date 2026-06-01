const express = require('express');
const db = require('../database');

const router = express.Router();

// Récupérer toutes les catégories
router.get('/', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Créer une catégorie
router.post('/', (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nom de catégorie requis' });
  }

  db.run(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ message: 'Catégorie créée', categoryId: this.lastID });
    }
  );
});

module.exports = router;