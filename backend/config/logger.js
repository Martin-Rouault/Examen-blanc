const winston = require('winston');
const path = require('path');

/**
 * Configuration du logger Winston
 * 
 * Remplace les console.log par un système de logging professionnel avec :
 * - Niveaux de log (info, warn, error, debug)
 * - Timestamps automatiques
 * - Sauvegarde dans des fichiers (logs/app.log, logs/error.log)
 * - Formatage coloré en développement, JSON en production
 */

// Format de log pour la console (développement)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Format de log pour les fichiers (production)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // info par défaut
  transports: [
    // Console (toujours actif)
    new winston.transports.Console({
      format: consoleFormat,
    }),
    
    // Fichier pour tous les logs (info et au-dessus)
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/app.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Fichier séparé pour les erreurs uniquement
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
