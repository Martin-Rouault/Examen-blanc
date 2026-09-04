# Application To-Do List - Version Production

Application full-stack de gestion de tâches, corrigée, sécurisée et prête pour la mise en production.

## 🎯 Compétences Démontrées

### ✅ E27 – Détection et Correction de Bugs
- Crash si serveur injoignable (optional chaining sur err.response)
- Message d'erreur non affiché dans Register.js
- Gestion d'erreur manquante dans fetchTasks (token expiré)
- Ajout immédiat de tâches sans refresh

### ✅ E28 – Sécurité
- **XSS** : Validation et sanitization avec express-validator (.escape())
- **IDOR** : Vérification task.user === req.user.id sur PUT/DELETE
- **Validation forte** : Username min 3 char, password min 8 char + 1 chiffre
- **npm audit** : Backend 7→2 vulns, Frontend 61→34 vulns
- **CORS** : Restreint à CLIENT_URL
- **JWT** : Secret robuste (128 hex)

### ✅ E29 – Documentation
- **JSDoc** complète sur routes backend et middleware
- **Commentaires** structurés sur composants React
- **CHANGELOG.md** exhaustif de toutes les modifications
- **DEPLOYMENT.md** avec architecture et procédures

### ✅ E21-E26 – Infrastructure & DevOps
- **Docker** : Dockerfiles optimisés + docker-compose (multi-stage build frontend)
- **CI/CD** : Pipeline GitHub Actions (install, build, audit)
- **Logging** : Winston avec niveaux, timestamps, fichiers rotatifs
- **Monitoring** : Endpoint /health pour uptime monitoring
- **Hébergement** : Documentation complète Render.com + HTTPS + DNS

---

## 🚀 Lancement Rapide

### Développement Local

```bash
# Backend
cd backend
npm install
npm start  # http://localhost:5000

# Frontend
cd frontend
npm install
npm start  # http://localhost:3000
```

### Avec Docker

```bash
# Lancer tous les services (backend + frontend + MongoDB local)
docker-compose -f docker-compose.local.yml up --build

# Ou avec MongoDB Atlas (défaut)
docker-compose up --build
```

---

## 📁 Structure du Projet

```
exam_practice_app_clean/
├── backend/
│   ├── config/
│   │   ├── db.js          # Connexion MongoDB
│   │   └── logger.js      # Configuration Winston
│   ├── middleware/
│   │   └── auth.js        # Middleware JWT
│   ├── models/
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js        # POST /register, /login
│   │   └── tasks.js       # CRUD tasks
│   ├── logs/              # Logs Winston (gitignored)
│   ├── Dockerfile
│   ├── package.json
│   └── server.js          # Point d'entrée + /health
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Header, Footer, TaskForm
│   │   ├── pages/         # Login, Register, Tasks
│   │   ├── api.js         # Config Axios
│   │   └── App.js
│   ├── Dockerfile
│   ├── nginx.conf         # Config Nginx pour SPA
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml         # Pipeline CI/CD
├── docker-compose.yml      # Orchestration (MongoDB Atlas)
├── docker-compose.local.yml # Version avec MongoDB local
├── CHANGELOG.md           # Journal des modifications
├── DEPLOYMENT.md          # Guide de déploiement
└── README_PRODUCTION.md   # Ce fichier
```

---

## 🔒 Sécurité Implémentée

| Vulnérabilité | Solution |
|---------------|----------|
| XSS (injection HTML/JS) | express-validator + .escape() |
| IDOR (accès aux tâches d'autrui) | Vérification task.user === req.user.id |
| Mots de passe faibles | Validation min 8 char + 1 chiffre |
| Dépendances vulnérables | npm audit fix (7→2 backend, 61→34 frontend) |
| Secrets exposés | Variables d'environnement (.env gitignored) |
| CORS ouvert | Restreint à CLIENT_URL uniquement |

---

## 📊 Monitoring

### Endpoint de santé
```bash
curl http://localhost:5000/health
```
Retourne :
```json
{
  "status": "OK",
  "timestamp": "2026-01-04T14:30:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### Logs
- **Console** : Logs colorés avec timestamps (Winston)
- **Fichiers** :
  - `backend/logs/app.log` : Tous les logs
  - `backend/logs/error.log` : Erreurs uniquement

---

## 🎓 Pour la Soutenance

### Démonstration Recommandée

1. **Bugs corrigés** : Montrer le CHANGELOG, tester register avec mot de passe faible
2. **Sécurité** : Montrer le code XSS/IDOR, résultat `npm audit`
3. **Docker** : `docker-compose up` en live
4. **CI/CD** : Montrer le fichier GitHub Actions
5. **Logs** : `tail -f backend/logs/app.log` pendant utilisation
6. **Health check** : `curl /health`
7. **Déploiement** : Montrer Render dashboard + app live

### Points Clés à Expliquer

- **Pourquoi Winston ?** → Logs structurés, traçabilité production
- **Pourquoi Docker ?** → Reproductibilité, isolation, déploiement simplifié
- **Pourquoi GitHub Actions ?** → Automatisation, qualité code, évite erreurs humaines
- **Pourquoi Render ?** → Simple, gratuit, supporte Docker, HTTPS auto

---

## 🔗 Liens Utiles

- **Backend API (local)** : http://localhost:5000
- **Frontend (local)** : http://localhost:3000
- **Health Check** : http://localhost:5000/health
- **MongoDB Atlas** : https://cloud.mongodb.com
- **Render Dashboard** : https://dashboard.render.com

---

## 📝 Licence

Projet d'entraînement pour évaluation "Mise en production et maintenance applicative".
