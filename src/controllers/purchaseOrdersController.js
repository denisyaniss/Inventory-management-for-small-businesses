const db = require('../database');

// ========== GESTION DES COMMANDES AUX FOURNISSEURS ==========

// Générer un numéro de commande unique
const generateOrderNumber = () => {
  return `PO-${Date.now()}`;
};

// Créer une commande
exports.createPurchaseOrder = (req, res) => {
  const { supplier_id, expected_delivery_date, notes, items } = req.body;
  const user_id = req.user?.id;
  const order_number = generateOrderNumber();
  
  // Calculer le total
  let total_amount = 0;
  if (Array.isArray(items)) {
    total_amount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity_ordered), 0);
  }
  
  const query = `INSERT INTO purchase_orders (order_number, supplier_id, expected_delivery_date, notes, total_amount, created_by)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [order_number, supplier_id, expected_delivery_date, notes, total_amount, user_id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la création de la commande', details: err.message });
    }
    
    const po_id = this.lastID;
    
    // Ajouter les articles
    if (items && Array.isArray(items) && items.length > 0) {
      const itemQuery = `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, unit_price, line_total)
                         VALUES (?, ?, ?, ?, ?)`;
      
      items.forEach(item => {
        const line_total = item.unit_price * item.quantity_ordered;
        db.run(itemQuery, [po_id, item.product_id, item.quantity_ordered, item.unit_price, line_total]);
      });
    }
    
    res.status(201).json({ message: 'Commande créée avec succès', id: po_id, order_number });
  });
};

// Récupérer toutes les commandes
exports.getAllPurchaseOrders = (req, res) => {
  const { status } = req.query;
  
  let query = `SELECT po.*, s.name as supplier_name, u.full_name as created_by_name
               FROM purchase_orders po
               JOIN suppliers s ON po.supplier_id = s.id
               LEFT JOIN users u ON po.created_by = u.id`;
  
  const params = [];
  
  if (status) {
    query += ` WHERE po.status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY po.order_date DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération des commandes', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Récupérer une commande par ID avec ses articles
exports.getPurchaseOrderById = (req, res) => {
  const { id } = req.params;
  
  const query = `SELECT po.*, s.name as supplier_name, s.email as supplier_email, s.phone as supplier_phone
                 FROM purchase_orders po
                 JOIN suppliers s ON po.supplier_id = s.id
                 WHERE po.id = ?`;
  
  db.get(query, [id], (err, order) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    // Récupérer les articles
    const itemsQuery = `SELECT poi.*, p.name as product_name, p.sku
                        FROM purchase_order_items poi
                        JOIN products p ON poi.product_id = p.id
                        WHERE poi.purchase_order_id = ?`;
    
    db.all(itemsQuery, [id], (err, items) => {
      if (err) {
        return res.status(400).json({ error: 'Erreur lors de la récupération des articles', details: err.message });
      }
      
      res.status(200).json({ ...order, items });
    });
  });
};

// Mettre à jour le statut d'une commande
exports.updatePurchaseOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status, actual_delivery_date } = req.body;
  
  let query = `UPDATE purchase_orders SET status = ?, updated_at = CURRENT_TIMESTAMP`;
  const params = [status, id];
  
  if (actual_delivery_date && status === 'delivered') {
    query = `UPDATE purchase_orders SET status = ?, actual_delivery_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    params.splice(1, 0, actual_delivery_date);
  } else {
    query += ` WHERE id = ?`;
  }
  
  db.run(query, params, function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la mise à jour', details: err.message });
    }
    res.status(200).json({ message: 'Statut de la commande mis à jour' });
  });
};

// Ajouter un article à une commande
exports.addItemToPurchaseOrder = (req, res) => {
  const { id } = req.params;
  const { product_id, quantity_ordered, unit_price } = req.body;
  
  const line_total = quantity_ordered * unit_price;
  
  const itemQuery = `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, unit_price, line_total)
                     VALUES (?, ?, ?, ?, ?)`;
  
  db.run(itemQuery, [id, product_id, quantity_ordered, unit_price, line_total], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de l\'ajout de l\'article', details: err.message });
    }
    
    // Mettre à jour le total de la commande
    const updateQuery = `UPDATE purchase_orders SET total_amount = (SELECT SUM(line_total) FROM purchase_order_items WHERE purchase_order_id = ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(updateQuery, [id, id]);
    
    res.status(201).json({ message: 'Article ajouté à la commande', id: this.lastID });
  });
};

// Supprimer un article d'une commande
exports.removeItemFromPurchaseOrder = (req, res) => {
  const { id, item_id } = req.params;
  
  const deleteQuery = `DELETE FROM purchase_order_items WHERE id = ? AND purchase_order_id = ?`;
  
  db.run(deleteQuery, [item_id, id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la suppression', details: err.message });
    }
    
    // Mettre à jour le total
    const updateQuery = `UPDATE purchase_orders SET total_amount = (SELECT COALESCE(SUM(line_total), 0) FROM purchase_order_items WHERE purchase_order_id = ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(updateQuery, [id, id]);
    
    res.status(200).json({ message: 'Article supprimé de la commande' });
  });
};

// Recevoir partiellement une commande
exports.receivePartialOrder = (req, res) => {
  const { id } = req.params;
  const { item_id, quantity_received } = req.body;
  
  const query = `UPDATE purchase_order_items SET quantity_received = quantity_received + ? WHERE id = ? AND purchase_order_id = ?`;
  
  db.run(query, [quantity_received, item_id, id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la mise à jour', details: err.message });
    }
    res.status(200).json({ message: 'Quantité reçue mise à jour' });
  });
};