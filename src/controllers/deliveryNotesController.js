const db = require('../database');

// ========== GESTION DES BONS DE LIVRAISON ==========

// Générer un numéro de bon de livraison unique
const generateDeliveryNumber = () => {
  return `DN-${Date.now()}`;
};

// Créer un bon de livraison
exports.createDeliveryNote = (req, res) => {
  const { purchase_order_id, supplier_id, notes, items } = req.body;
  const user_id = req.user?.id;
  const delivery_number = generateDeliveryNumber();
  
  const query = `INSERT INTO delivery_notes (delivery_number, purchase_order_id, supplier_id, notes, received_by)
                 VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [delivery_number, purchase_order_id, supplier_id, notes, user_id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la création du bon de livraison', details: err.message });
    }
    
    const dn_id = this.lastID;
    
    // Ajouter les articles reçus
    if (items && Array.isArray(items) && items.length > 0) {
      const itemQuery = `INSERT INTO delivery_note_items (delivery_note_id, product_id, quantity_received, quantity_accepted, quantity_rejected, rejection_reason, location_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      items.forEach(item => {
        const quantity_rejected = item.quantity_received - item.quantity_accepted;
        db.run(itemQuery, [dn_id, item.product_id, item.quantity_received, item.quantity_accepted, quantity_rejected, item.rejection_reason, item.location_id], function() {
          // Ajouter le stock à la localisation si accepté
          if (item.quantity_accepted > 0 && item.location_id) {
            updateStockByLocation(item.product_id, item.location_id, item.quantity_accepted, 'inbound');
          }
        });
      });
    }
    
    res.status(201).json({ message: 'Bon de livraison créé avec succès', id: dn_id, delivery_number });
  });
};

// Récupérer tous les bons de livraison
exports.getAllDeliveryNotes = (req, res) => {
  const query = `SELECT dn.*, s.name as supplier_name, u.full_name as received_by_name
                 FROM delivery_notes dn
                 JOIN suppliers s ON dn.supplier_id = s.id
                 LEFT JOIN users u ON dn.received_by = u.id
                 ORDER BY dn.delivery_date DESC`;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Récupérer un bon de livraison par ID avec ses articles
exports.getDeliveryNoteById = (req, res) => {
  const { id } = req.params;
  
  const query = `SELECT dn.*, s.name as supplier_name, u.full_name as received_by_name
                 FROM delivery_notes dn
                 JOIN suppliers s ON dn.supplier_id = s.id
                 LEFT JOIN users u ON dn.received_by = u.id
                 WHERE dn.id = ?`;
  
  db.get(query, [id], (err, note) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    if (!note) {
      return res.status(404).json({ error: 'Bon de livraison non trouvé' });
    }
    
    // Récupérer les articles
    const itemsQuery = `SELECT dni.*, p.name as product_name, p.sku, l.name as location_name
                        FROM delivery_note_items dni
                        JOIN products p ON dni.product_id = p.id
                        LEFT JOIN locations l ON dni.location_id = l.id
                        WHERE dni.delivery_note_id = ?`;
    
    db.all(itemsQuery, [id], (err, items) => {
      if (err) {
        return res.status(400).json({ error: 'Erreur lors de la récupération des articles', details: err.message });
      }
      
      res.status(200).json({ ...note, items });
    });
  });
};

// Ajouter un article à un bon de livraison
exports.addItemToDeliveryNote = (req, res) => {
  const { id } = req.params;
  const { product_id, quantity_received, quantity_accepted, rejection_reason, location_id } = req.body;
  
  const quantity_rejected = quantity_received - quantity_accepted;
  
  const query = `INSERT INTO delivery_note_items (delivery_note_id, product_id, quantity_received, quantity_accepted, quantity_rejected, rejection_reason, location_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [id, product_id, quantity_received, quantity_accepted, quantity_rejected, rejection_reason, location_id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de l\'ajout de l\'article', details: err.message });
    }
    
    // Ajouter au stock si accepté
    if (quantity_accepted > 0 && location_id) {
      updateStockByLocation(product_id, location_id, quantity_accepted, 'inbound');
    }
    
    res.status(201).json({ message: 'Article ajouté au bon de livraison', id: this.lastID });
  });
};

// Mettre à jour un article d'un bon de livraison
exports.updateDeliveryNoteItem = (req, res) => {
  const { id, item_id } = req.params;
  const { quantity_accepted, rejection_reason } = req.body;
  
  // Récupérer l'article actuel
  db.get(`SELECT * FROM delivery_note_items WHERE id = ? AND delivery_note_id = ?`, [item_id, id], (err, item) => {
    if (err || !item) {
      return res.status(400).json({ error: 'Article non trouvé' });
    }
    
    const quantity_rejected = item.quantity_received - quantity_accepted;
    
    const query = `UPDATE delivery_note_items SET quantity_accepted = ?, quantity_rejected = ?, rejection_reason = ?
                   WHERE id = ? AND delivery_note_id = ?`;
    
    db.run(query, [quantity_accepted, quantity_rejected, rejection_reason, item_id, id], function(err) {
      if (err) {
        return res.status(400).json({ error: 'Erreur lors de la mise à jour', details: err.message });
      }
      
      // Ajuster le stock si la localisation est définie
      if (item.location_id) {
        const diff = quantity_accepted - item.quantity_accepted;
        if (diff !== 0) {
          updateStockByLocation(item.product_id, item.location_id, diff, 'inbound');
        }
      }
      
      res.status(200).json({ message: 'Article mis à jour' });
    });
  });
};

// Récupérer les bons de livraison d'une commande
exports.getDeliveryNotesByPurchaseOrder = (req, res) => {
  const { po_id } = req.params;
  
  const query = `SELECT dn.*, s.name as supplier_name
                 FROM delivery_notes dn
                 JOIN suppliers s ON dn.supplier_id = s.id
                 WHERE dn.purchase_order_id = ?
                 ORDER BY dn.delivery_date DESC`;
  
  db.all(query, [po_id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Fonction auxiliaire pour mettre à jour le stock par localisation
function updateStockByLocation(product_id, location_id, quantity, reason) {
  const checkQuery = `SELECT id, quantity FROM stock_by_location WHERE product_id = ? AND location_id = ?`;
  
  db.get(checkQuery, [product_id, location_id], (err, row) => {
    if (err) return;
    
    if (row) {
      // Mise à jour
      const updateQuery = `UPDATE stock_by_location SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP
                           WHERE product_id = ? AND location_id = ?`;
      db.run(updateQuery, [quantity, product_id, location_id]);
    } else {
      // Création
      const insertQuery = `INSERT INTO stock_by_location (product_id, location_id, quantity)
                           VALUES (?, ?, ?)`;
      db.run(insertQuery, [product_id, location_id, quantity]);
    }
    
    // Mettre à jour aussi le stock global
    const globalUpdateQuery = `UPDATE stock SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP
                              WHERE product_id = ?`;
    db.run(globalUpdateQuery, [quantity, product_id]);
  });
}