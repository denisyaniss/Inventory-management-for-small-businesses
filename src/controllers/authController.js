const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// Enregistrement d'un nouvel utilisateur
exports.register = (req, res) => {
  const { username, email, password, full_name } = req.body;

  // Valider les entrées
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  // Hasher le mot de passe
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = `
    INSERT INTO users (username, email, password, full_name, role)
    VALUES (?, ?, ?, ?, 'user')
  `;

  db.run(query, [username, email, hashedPassword, full_name], function(err) {
    if (err) {
      return res.status(400).json({ error: 'Erreur lors de l\'enregistrement: ' + err.message });
    }

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      userId: this.lastID
    });
  });
};

// Connexion
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const query = 'SELECT * FROM users WHERE email = ? AND active = 1';

  db.get(query, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  });
};

// Vérifier le token
exports.verifyToken = (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
};