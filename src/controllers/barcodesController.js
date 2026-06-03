const db = require('../database');

// ========== GESTION DES CODES-BARRES ==========

// Créer un code-barres
exports.createBarcode = (req, res) => {
  const { product_id, barcode, barcode_type = 'EAN13' } = req.body;
  
  const query = `INSERT INTO barcodes (product_id, barcode, barcode_type)
                 VALUES (?, ?, ?)`;
  
  db.run(query, [product_id, barcode, barcode_type], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ce code-barres existe déjà' });
      }
      return res.status(400).json({ error: 'Erreur lors de la création', details: err.message });
    }
    res.status(201).json({ message: 'Code-barres créé avec succès', id: this.lastID });
  });
};

// Récupérer tous les codes-barres
exports.getAllBarcodes = (req, res) => {
  const query = `SELECT b.*, p.name as product_name, p.sku
                 FROM barcodes b
                 JOIN products p ON b.product_id = p.id
                 WHERE b.is_active = 1
                 ORDER BY p.name ASC`;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Récupérer les codes-barres d'un produit
exports.getProductBarcodes = (req, res) => {
  const { product_id } = req.params;
  
  const query = `SELECT * FROM barcodes WHERE product_id = ? AND is_active = 1 ORDER BY barcode_type ASC`;
  
  db.all(query, [product_id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Chercher un produit par code-barres
exports.findProductByBarcode = (req, res) => {
  const { barcode } = req.params;
  
  const query = `SELECT b.*, p.id as product_id, p.name, p.sku, p.unit_price, p.category_id, c.name as category_name,
                        s.quantity as stock_quantity
                 FROM barcodes b
                 JOIN products p ON b.product_id = p.id
                 JOIN categories c ON p.category_id = c.id
                 LEFT JOIN stock s ON p.id = s.product_id
                 WHERE b.barcode = ? AND b.is_active = 1`;
  
  db.get(query, [barcode], (err, row) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la recherche', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Produit non trouvé', barcode });
    }
    res.status(200).json(row);
  });
};

// Mettre à jour un code-barres
exports.updateBarcode = (req, res) => {
  const { id } = req.params;
  const { barcode, barcode_type } = req.body;
  
  const query = `UPDATE barcodes SET barcode = ?, barcode_type = ? WHERE id = ?`;
  
  db.run(query, [barcode, barcode_type, id], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ce code-barres existe déjà' });
      }
      return res.status(400).json({ error: 'Erreur lors de la mise à jour', details: err.message });
    }
    res.status(200).json({ message: 'Code-barres mis à jour' });
  });
};

// Désactiver un code-barres
exports.deactivateBarcode = (req, res) => {
  const { id } = req.params;
  
  const query = `UPDATE barcodes SET is_active = 0 WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la désactivation', details: err.message });
    }
    res.status(200).json({ message: 'Code-barres désactivé' });
  });
};

// Supprimer un code-barres
exports.deleteBarcode = (req, res) => {
  const { id } = req.params;
  
  const query = `DELETE FROM barcodes WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la suppression', details: err.message });
    }
    res.status(200).json({ message: 'Code-barres supprimé' });
  });
};

// Vérifier si un code-barres existe
exports.checkBarcodeExists = (req, res) => {
  const { barcode } = req.params;
  
  const query = `SELECT id, product_id FROM barcodes WHERE barcode = ? AND is_active = 1`;
  
  db.get(query, [barcode], (err, row) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la vérification', details: err.message });
    }
    res.status(200).json({ exists: !!row, barcode, product_id: row?.product_id });
  });
};

// Générer un code-barres EAN13 de base (simplifié pour démonstration)
exports.generateEAN13 = (req, res) => {
  const { product_id } = req.body;
  
  // Générer un EAN13 simplifié (13 chiffres aléatoires)
  const ean13 = Math.floor(1000000000000 + Math.random() * 9000000000000).toString();
  
  // Vérifier que le code n'existe pas
  db.get(`SELECT id FROM barcodes WHERE barcode = ?`, [ean13], (err, row) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la génération', details: err.message });
    }
    
    if (row) {
      // Si le code existe, en générer un autre (très rare statistiquement)
      return exports.generateEAN13(req, res);
    }
    
    res.status(200).json({ barcode: ean13, barcode_type: 'EAN13' });
  });
};

// Importer plusieurs codes-barres
exports.importBarcodes = (req, res) => {
  const { barcodes } = req.body; // Tableau d'objets {product_id, barcode, barcode_type}
  
  if (!Array.isArray(barcodes) || barcodes.length === 0) {
    return res.status(400).json({ error: 'Tableau de codes-barres invalide' });
  }
  
  const query = `INSERT INTO barcodes (product_id, barcode, barcode_type) VALUES (?, ?, ?)`;
  
  let imported = 0;
  let errors = [];
  
  barcodes.forEach((item, index) => {
    db.run(query, [item.product_id, item.barcode, item.barcode_type || 'EAN13'], function(err) {
      if (err) {
        errors.push({ index, barcode: item.barcode, error: err.message });
      } else {
        imported++;
      }
      
      // Si c'est le dernier, renvoyer le résultat
      if (index === barcodes.length - 1) {
        res.status(201).json({ 
          message: `${imported} code(s) importé(s) avec succès`,
          imported,
          errors: errors.length > 0 ? errors : undefined
        });
      }
    });
  });
};

// Exporter les codes-barres d'une catégorie
exports.exportCategoryBarcodes = (req, res) => {
  const { category_id } = req.params;
  
  const query = `SELECT b.*, p.name as product_name, p.sku, c.name as category_name
                 FROM barcodes b
                 JOIN products p ON b.product_id = p.id
                 JOIN categories c ON p.category_id = c.id
                 WHERE c.id = ? AND b.is_active = 1
                 ORDER BY p.name ASC`;
  
  db.all(query, [category_id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de l\'export', details: err.message });
    }
    res.status(200).json(rows);
  });
};