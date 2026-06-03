const db = require('../database');

// ========== GESTION DES LOCALISATIONS ==========

// Créer une localisation
exports.createLocation = (req, res) => {
  const { name, code, description, address, manager_id } = req.body;
  
  const query = `INSERT INTO locations (name, code, description, address, manager_id)
                 VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [name, code, description, address, manager_id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la création de la localisation', details: err.message });
    }
    res.status(201).json({ message: 'Localisation créée avec succès', id: this.lastID });
  });
};

// Récupérer toutes les localisations
exports.getAllLocations = (req, res) => {
  const query = `SELECT l.*, u.full_name as manager_name
                 FROM locations l
                 LEFT JOIN users u ON l.manager_id = u.id
                 WHERE l.is_active = 1
                 ORDER BY l.name ASC`;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Récupérer une localisation par ID
exports.getLocationById = (req, res) => {
  const { id } = req.params;
  
  const query = `SELECT l.*, u.full_name as manager_name
                 FROM locations l
                 LEFT JOIN users u ON l.manager_id = u.id
                 WHERE l.id = ?`;
  
  db.get(query, [id], (err, location) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    if (!location) {
      return res.status(404).json({ error: 'Localisation non trouvée' });
    }
    
    // Récupérer le stock de cette localisation
    const stockQuery = `SELECT s.*, p.name, p.sku, p.unit_price
                        FROM stock_by_location s
                        JOIN products p ON s.product_id = p.id
                        WHERE s.location_id = ?
                        ORDER BY p.name ASC`;
    
    db.all(stockQuery, [id], (err, stock) => {
      if (err) {
        return res.status(400).json({ error: 'Erreur lors de la récupération du stock', details: err.message });
      }
      
      res.status(200).json({ ...location, stock });
    });
  });
};

// Mettre à jour une localisation
exports.updateLocation = (req, res) => {
  const { id } = req.params;
  const { name, description, address, manager_id } = req.body;
  
  const query = `UPDATE locations SET name = ?, description = ?, address = ?, manager_id = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;
  
  db.run(query, [name, description, address, manager_id, id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la mise à jour', details: err.message });
    }
    res.status(200).json({ message: 'Localisation mise à jour' });
  });
};

// Désactiver une localisation
exports.deactivateLocation = (req, res) => {
  const { id } = req.params;
  
  const query = `UPDATE locations SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  db.run(query, [id], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la désactivation', details: err.message });
    }
    res.status(200).json({ message: 'Localisation désactivée' });
  });
};

// ========== GESTION DU STOCK PAR LOCALISATION ==========

// Récupérer le stock d'un produit dans une localisation
exports.getStockByLocation = (req, res) => {
  const { product_id, location_id } = req.params;
  
  const query = `SELECT sbl.*, l.name as location_name, p.name as product_name, p.sku
                 FROM stock_by_location sbl
                 JOIN locations l ON sbl.location_id = l.id
                 JOIN products p ON sbl.product_id = p.id
                 WHERE sbl.product_id = ? AND sbl.location_id = ?`;
  
  db.get(query, [product_id, location_id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Stock non trouvé' });
    }
    res.status(200).json(row);
  });
};

// Récupérer le stock d'un produit dans toutes les localisations
exports.getProductStockAllLocations = (req, res) => {
  const { product_id } = req.params;
  
  const query = `SELECT sbl.*, l.name as location_name, l.code
                 FROM stock_by_location sbl
                 JOIN locations l ON sbl.location_id = l.id
                 WHERE sbl.product_id = ?
                 ORDER BY l.name ASC`;
  
  db.all(query, [product_id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// ========== TRANSFERTS INTER-DÉPÔTS ==========

// Créer un transfert
exports.createTransfer = (req, res) => {
  const { product_id, from_location_id, to_location_id, quantity, reason } = req.body;
  const user_id = req.user?.id;
  
  // Vérifier le stock disponible
  db.get(`SELECT quantity FROM stock_by_location WHERE product_id = ? AND location_id = ?`, 
    [product_id, from_location_id], (err, row) => {
      if (err || !row || row.quantity < quantity) {
        return res.status(400).json({ error: 'Stock insuffisant à la localisation source' });
      }
      
      // Enregistrer le transfert
      const transferQuery = `INSERT INTO location_transfers (product_id, from_location_id, to_location_id, quantity, reason, user_id)
                             VALUES (?, ?, ?, ?, ?, ?)`;
      
      db.run(transferQuery, [product_id, from_location_id, to_location_id, quantity, reason, user_id], function(err) {
        if (err) {
          return res.status(400).json({ error: 'Erreur lors de la création du transfert', details: err.message });
        }
        
        // Retirer du stock source
        db.run(`UPDATE stock_by_location SET quantity = quantity - ?, last_updated = CURRENT_TIMESTAMP
                WHERE product_id = ? AND location_id = ?`, 
          [quantity, product_id, from_location_id]);
        
        // Ajouter au stock destination
        db.get(`SELECT id FROM stock_by_location WHERE product_id = ? AND location_id = ?`,
          [product_id, to_location_id], (err, destRow) => {
            if (destRow) {
              // Mise à jour
              db.run(`UPDATE stock_by_location SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP
                      WHERE product_id = ? AND location_id = ?`, 
                [quantity, product_id, to_location_id]);
            } else {
              // Création
              db.run(`INSERT INTO stock_by_location (product_id, location_id, quantity)
                      VALUES (?, ?, ?)`, 
                [product_id, to_location_id, quantity]);
            }
          });
        
        res.status(201).json({ message: 'Transfert créé avec succès', id: this.lastID });
      });
    });
};

// Récupérer tous les transferts
exports.getAllTransfers = (req, res) => {
  const query = `SELECT lt.*, p.name as product_name, p.sku, 
                        fl.name as from_location_name, tl.name as to_location_name,
                        u.full_name as user_name
                 FROM location_transfers lt
                 JOIN products p ON lt.product_id = p.id
                 JOIN locations fl ON lt.from_location_id = fl.id
                 JOIN locations tl ON lt.to_location_id = tl.id
                 LEFT JOIN users u ON lt.user_id = u.id
                 ORDER BY lt.created_at DESC`;
  
  db.all(query, (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Récupérer les transferts d'un produit
exports.getProductTransfers = (req, res) => {
  const { product_id } = req.params;
  
  const query = `SELECT lt.*, 
                        fl.name as from_location_name, tl.name as to_location_name,
                        u.full_name as user_name
                 FROM location_transfers lt
                 JOIN locations fl ON lt.from_location_id = fl.id
                 JOIN locations tl ON lt.to_location_id = tl.id
                 LEFT JOIN users u ON lt.user_id = u.id
                 WHERE lt.product_id = ?
                 ORDER BY lt.created_at DESC`;
  
  db.all(query, [product_id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};

// Récupérer les transferts d'une localisation
exports.getLocationTransfers = (req, res) => {
  const { location_id } = req.params;
  
  const query = `SELECT lt.*, p.name as product_name, p.sku,
                        fl.name as from_location_name, tl.name as to_location_name
                 FROM location_transfers lt
                 JOIN products p ON lt.product_id = p.id
                 JOIN locations fl ON lt.from_location_id = fl.id
                 JOIN locations tl ON lt.to_location_id = tl.id
                 WHERE lt.from_location_id = ? OR lt.to_location_id = ?
                 ORDER BY lt.created_at DESC`;
  
  db.all(query, [location_id, location_id], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de la récupération', details: err.message });
    }
    res.status(200).json(rows);
  });
};