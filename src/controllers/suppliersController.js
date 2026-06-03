const db = require('../database');

// ========== GESTION DES FOURNISSEURS ==========

// Créer un fournisseur
exports.createSupplier = (req, res) => {
  const { name, contact_person, email, phone, address, city, postal_code, country, payment_terms, tax_id, notes } = req.body;
  
  const query = `INSERT INTO suppliers (name, contact_person, email, phone, address, city, postal_code, country, payment_terms, tax_id, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [name, contact_person, email, phone, address, city, postal_code, country, payment_terms, tax_id, notes], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la création du fournisseur', details: err.message });
    }
    res.status(201).json({ message: 'Fournisseur créé avec succès', id: this.lastID });
  });
};

// Récupérer tous les fournisseurs
exports.getAllSuppliers = (req, res) => {
  const query = `SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name ASC`;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération des fournisseurs', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Récupérer un fournisseur par ID
exports.getSupplierById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM suppliers WHERE id = ?`;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération du fournisseur', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Fournisseur non trouvé' });
    }
    res.status(200).json(row);
  });
};

// Mettre à jour un fournisseur
exports.updateSupplier = (req, res) => {
  const { id } = req.params;
  const { name, contact_person, email, phone, address, city, postal_code, country, payment_terms, tax_id, notes } = req.body;
  
  const query = `UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, city = ?, 
                 postal_code = ?, country = ?, payment_terms = ?, tax_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;
  
  db.run(query, [name, contact_person, email, phone, address, city, postal_code, country, payment_terms, tax_id, notes, id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la mise à jour du fournisseur', details: err.message });
    }
    res.status(200).json({ message: 'Fournisseur mis à jour avec succès' });
  });
};

// Désactiver un fournisseur
exports.deactivateSupplier = (req, res) => {
  const { id } = req.params;
  const query = `UPDATE suppliers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la désactivation du fournisseur', details: err.message });
    }
    res.status(200).json({ message: 'Fournisseur désactivé' });
  });
};

// ========== LIAISON PRODUIT-FOURNISSEUR ==========

// Ajouter un fournisseur à un produit
exports.addSupplierToProduct = (req, res) => {
  const { product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, minimum_order_qty, is_preferred } = req.body;
  
  const query = `INSERT INTO product_suppliers (product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, minimum_order_qty, is_preferred)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [product_id, supplier_id, supplier_sku, supplier_price, lead_time_days, minimum_order_qty, is_preferred || 0], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de l\'ajout du fournisseur au produit', details: err.message });
    }
    res.status(201).json({ message: 'Fournisseur lié au produit', id: this.lastID });
  });
};

// Récupérer les fournisseurs d'un produit
exports.getProductSuppliers = (req, res) => {
  const { product_id } = req.params;
  
  const query = `SELECT ps.*, s.name, s.email, s.phone, s.contact_person
                 FROM product_suppliers ps
                 JOIN suppliers s ON ps.supplier_id = s.id
                 WHERE ps.product_id = ?
                 ORDER BY ps.is_preferred DESC, s.name ASC`;
  
  db.all(query, [product_id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération des fournisseurs', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Mettre à jour le prix d'un fournisseur pour un produit
exports.updateSupplierPrice = (req, res) => {
  const { product_id, supplier_id } = req.params;
  const { supplier_price, lead_time_days, minimum_order_qty } = req.body;
  
  const query = `UPDATE product_suppliers SET supplier_price = ?, lead_time_days = ?, minimum_order_qty = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE product_id = ? AND supplier_id = ?`;
  
  db.run(query, [supplier_price, lead_time_days, minimum_order_qty, product_id, supplier_id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la mise à jour du prix fournisseur', details: err.message });
    }
    res.status(200).json({ message: 'Prix fournisseur mis à jour' });
  });
};