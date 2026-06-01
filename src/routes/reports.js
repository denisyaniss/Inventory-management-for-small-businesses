const express = require('express');
const db = require('../database');

const router = express.Router();

// Rapport d'inventaire général
router.get('/inventory', (req, res) => {
  const query = `
    SELECT 
      c.name as category,
      COUNT(p.id) as total_products,
      SUM(s.quantity) as total_quantity,
      SUM(s.quantity * p.unit_price) as total_value
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN stock s ON p.id = s.product_id
    GROUP BY c.id
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Produits avec stock faible
router.get('/low-stock', (req, res) => {
  const query = `
    SELECT p.id, p.name, p.sku, s.quantity, p.reorder_level, c.name as category
    FROM products p
    LEFT JOIN stock s ON p.id = s.product_id
    JOIN categories c ON p.category_id = c.id
    WHERE s.quantity <= p.reorder_level
    ORDER BY s.quantity ASC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Mouvements récents
router.get('/recent-movements', (req, res) => {
  const days = req.query.days || 30;
  const query = `
    SELECT 
      sm.*,
      p.name as product_name,
      p.sku,
      u.username
    FROM stock_movements sm
    JOIN products p ON sm.product_id = p.id
    LEFT JOIN users u ON sm.user_id = u.id
    WHERE sm.created_at >= datetime('now', '-${days} days')
    ORDER BY sm.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;