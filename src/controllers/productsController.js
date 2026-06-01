const db = require('../database');

// Récupérer tous les produits
exports.getAllProducts = (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name, s.quantity
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN stock s ON p.id = s.product_id
    ORDER BY p.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Récupérer un produit par ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, c.name as category_name, s.quantity
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN stock s ON p.id = s.product_id
    WHERE p.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(row);
  });
};

// Créer un nouveau produit
exports.createProduct = (req, res) => {
  const { name, description, sku, category_id, unit_price, reorder_level } = req.body;

  if (!name || !sku || !category_id || !unit_price) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const query = `
    INSERT INTO products (name, description, sku, category_id, unit_price, reorder_level)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [name, description, sku, category_id, unit_price, reorder_level], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur: ' + err.message });
    }

    // Initialiser le stock
    const stockQuery = 'INSERT INTO stock (product_id, quantity) VALUES (?, 0)';
    db.run(stockQuery, [this.lastID], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: 'Produit créé avec succès',
        productId: this.lastID
      });
    });
  });
};

// Mettre à jour un produit
exports.updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, sku, category_id, unit_price, reorder_level } = req.body;

  const query = `
    UPDATE products
    SET name = ?, description = ?, sku = ?, category_id = ?, unit_price = ?, reorder_level = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [name, description, sku, category_id, unit_price, reorder_level, id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur: ' + err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit mis à jour avec succès' });
  });
};

// Supprimer un produit
exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM products WHERE id = ?';

  db.run(query, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit supprimé avec succès' });
  });
};