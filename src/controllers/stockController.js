const db = require('../database');

// Récupérer le stock d'un produit
exports.getStock = (req, res) => {
  const { productId } = req.params;
  
  const query = `
    SELECT s.*, p.name, p.sku, p.reorder_level
    FROM stock s
    JOIN products p ON s.product_id = p.id
    WHERE s.product_id = ?
  `;

  db.get(query, [productId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Stock non trouvé' });
    }
    res.json(row);
  });
};

// Mettre à jour le stock (entrée ou sortie)
exports.updateStock = (req, res) => {
  const { productId } = req.params;
  const { quantity, movement_type, reason } = req.body;
  const userId = req.user?.id || null;

  if (!quantity || !movement_type) {
    return res.status(400).json({ error: 'Quantité et type de mouvement requis' });
  }

  // Récupérer le stock actuel
  db.get('SELECT quantity FROM stock WHERE product_id = ?', [productId], (err, stock) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!stock) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    let newQuantity = stock.quantity;
    
    if (movement_type === 'entry') {
      newQuantity += quantity;
    } else if (movement_type === 'exit') {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ error: 'Quantité insuffisante en stock' });
      }
    } else {
      return res.status(400).json({ error: 'Type de mouvement invalide' });
    }

    // Mettre à jour le stock
    db.run(
      'UPDATE stock SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE product_id = ?',
      [newQuantity, productId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Enregistrer le mouvement
        db.run(
          `INSERT INTO stock_movements (product_id, movement_type, quantity, reason, previous_quantity, new_quantity, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [productId, movement_type, quantity, reason, stock.quantity, newQuantity, userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Vérifier si alerte de stock bas
            db.get(
              'SELECT reorder_level FROM products WHERE id = ?',
              [productId],
              (err, product) => {
                if (newQuantity <= product.reorder_level) {
                  db.run(
                    `INSERT INTO stock_alerts (product_id, alert_type, message)
                     VALUES (?, 'low_stock', 'Stock faible pour ce produit')`,
                    [productId]
                  );
                }

                res.json({
                  message: 'Stock mis à jour avec succès',
                  previous_quantity: stock.quantity,
                  new_quantity: newQuantity
                });
              }
            );
          }
        );
      }
    );
  });
};

// Récupérer l'historique des mouvements
exports.getMovementHistory = (req, res) => {
  const { productId } = req.params;
  const limit = req.query.limit || 100;

  const query = `
    SELECT sm.*, u.username
    FROM stock_movements sm
    LEFT JOIN users u ON sm.user_id = u.id
    WHERE sm.product_id = ?
    ORDER BY sm.created_at DESC
    LIMIT ?
  `;

  db.all(query, [productId, limit], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};