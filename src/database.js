const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database/inventory.db';

// Créer la connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('✓ Connecté à la base de données SQLite');
  }
});

// Activer les foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;