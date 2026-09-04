const jwt = require('jsonwebtoken');

/**
 * Middleware d'authentification JWT
 * 
 * Vérifie la présence et la validité du token JWT dans le header 'x-auth-token'.
 * Si le token est valide, décode le payload et attache l'objet user (contenant l'id)
 * à req.user pour les routes protégées.
 * 
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction middleware suivante
 * @returns {void}
 * @throws {401} Si aucun token n'est fourni ou si le token est invalide/expiré
 */
module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
