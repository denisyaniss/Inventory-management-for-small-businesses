const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './database/inventory.db';
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Créer le répertoire database s'il n'existe pas
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion:', err);
    process.exit(1);
  }
});

// Lire le schéma SQL
const schema = fs.readFileSync(schemaPath, 'utf-8');

// Exécuter le schéma
db.exec(schema, (err) => {
  if (err) {
    console.error('Erreur lors de la création du schéma:', err);
    process.exit(1);
  }

  console.log('✓ Base de données initialisée avec succès');
  console.log('✓ Tables créées');

  // Ajouter un utilisateur par défaut
  const adminPassword = require('bcryptjs').hashSync('admin123', 10);
  db.run(
    `INSERT OR IGNORE INTO users (username, email, password, full_name, role)
     VALUES ('admin', 'admin@inventory.com', ?, 'Administrateur', 'admin')`,
    [adminPassword],
    (err) => {
      if (err) {
        console.error('Erreur:', err);
      } else {
        console.log('✓ Utilisateur administrateur créé');
        console.log('  Email: admin@inventory.com');
        console.log('  Mot de passe: admin123');
      }

      db.close(() => {
        console.log('\n✓ Configuration terminée!');
        process.exit(0);
      });
    }
  );
});