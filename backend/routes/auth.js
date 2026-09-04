const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');        

const registerValidationRules = [                                                                                                                                                    
    body('username')                                                                                                                                                                   
       .trim()                                                                                                                                                                          
       .notEmpty().withMessage('Le nom d\'utilisateur est requis')                                                                                                                      
       .isLength({ min: 3 }).withMessage('Le nom d\'utilisateur doit faire au moins 3 caractères')                                                                                      
       .escape(),                                                                                                                                                                       
    body('password')                                                                                                                                                                   
       .notEmpty().withMessage('Le mot de passe est requis')                                                                                                                            
       .isLength({ min: 8 }).withMessage('Le mot de passe doit faire au moins 8 caractères')                                                                                            
       .matches(/\d/).withMessage('Le mot de passe doit contenir au moins un chiffre'),                                                                                                 
   ];

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 * @param   {string} req.body.username - Nom d'utilisateur (min 3 caractères)
 * @param   {string} req.body.password - Mot de passe (min 8 caractères, doit contenir au moins 1 chiffre)
 * @returns {Object} Token JWT pour authentification immédiate après inscription
 * @throws  {400} Si la validation échoue ou si l'utilisateur existe déjà
 * @throws  {500} Erreur serveur
 */
router.post('/register', registerValidationRules, async (req, res) => {
  const { username, password } = req.body;
  const errors = validationResult(req);          

  if (!errors.isEmpty()) {                                                                                                                                                             
    return res.status(400).json({ errors: errors.array() });                                                                                                                           
  }

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ username, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    logger.info('New user registered', { userId: user.id, username: user.username });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    logger.error('Error during registration', { error: err.message });
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authentification d'un utilisateur et génération d'un token JWT
 * @access  Public
 * @param   {string} req.body.username - Nom d'utilisateur
 * @param   {string} req.body.password - Mot de passe en clair (sera comparé avec le hash bcrypt)
 * @returns {Object} Token JWT valide 1 heure { token: "..." }
 * @throws  {400} Si les identifiants sont incorrects
 * @throws  {500} Erreur serveur
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Le message d'erreur est trop générique et ne guide pas l'utilisateur.
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('Failed login attempt - wrong password', { username });
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    logger.info('User logged in successfully', { userId: user.id, username });
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    logger.error('Error during login', { error: err.message });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
