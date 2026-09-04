# Guide de Déploiement - Application To-Do List

Ce document décrit l'architecture de déploiement en production et les étapes pour héberger l'application sur **Render.com** avec Docker.

---

## 🏗️ Architecture de Production

```
┌─────────────────┐
│   Utilisateur   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────┐
│  Render - Frontend (React + Nginx)  │
│  https://todo-app.onrender.com      │
└────────┬────────────────────────────┘
         │ API calls
         ▼
┌─────────────────────────────────────┐
│  Render - Backend (Node.js/Express) │
│  https://todo-api.onrender.com      │
└────────┬────────────────────────────┘
         │ Mongoose
         ▼
┌─────────────────────────────────────┐
│  MongoDB Atlas (Cloud Database)     │
│  cluster0.mongodb.net               │
└─────────────────────────────────────┘
```

### Composants

1. **Frontend** : Application React buildée et servie par Nginx (conteneur Docker)
2. **Backend** : API Node.js/Express (conteneur Docker)
3. **Base de données** : MongoDB Atlas (déjà configuré)
4. **HTTPS** : Certificats SSL automatiques via Let's Encrypt (géré par Render)
5. **DNS** : Nom de domaine personnalisé (optionnel) via les paramètres Render

---

## 🚀 Déploiement sur Render.com

### Prérequis

- Compte GitHub avec le projet pushé
- Compte Render.com (gratuit)
- MongoDB Atlas déjà configuré ✅

---

### Étape 1 : Déployer le Backend

1. **Connecte-toi sur [Render.com](https://render.com)**
2. **Clique sur "New +" → "Web Service"**
3. **Connecte ton repo GitHub** et sélectionne `exam_practice_app_clean`
4. **Configuration** :
   - **Name** : `todo-backend` (ou autre)
   - **Region** : Frankfurt (le plus proche d'Europe)
   - **Root Directory** : `backend`
   - **Environment** : `Docker`
   - **Instance Type** : Free

5. **Variables d'environnement** (onglet "Environment") :
   ```
   MONGO_URI=mongodb+srv://nitr4m:Driversf93@cluster0.ubid7jh.mongodb.net/?appName=Cluster0
   JWT_SECRET=142106662409582e433d6cf91acd1056686c7fd85ceb9aed9c699e1d30daf62da503a0ea8e3d5a85e3c231e08e13f9e756bb5f03d450834befaccaaac4166e40
   PORT=5000
   CLIENT_URL=https://ton-frontend.onrender.com
   NODE_ENV=production
   LOG_LEVEL=info
   ```

6. **Clique sur "Create Web Service"**
7. ✅ Render va :
   - Détecter le `Dockerfile`
   - Builder l'image Docker
   - Déployer le conteneur
   - Générer une URL : `https://todo-backend-xxxxx.onrender.com`

8. **Teste l'endpoint de santé** :
   ```bash
   curl https://todo-backend-xxxxx.onrender.com/health
   ```

---

### Étape 2 : Déployer le Frontend

1. **Render Dashboard → "New +" → "Web Service"**
2. **Même repo GitHub**
3. **Configuration** :
   - **Name** : `todo-frontend`
   - **Region** : Frankfurt
   - **Root Directory** : `frontend`
   - **Environment** : `Docker`
   - **Instance Type** : Free

4. **Variables d'environnement** :
   ```
   REACT_APP_API_URL=https://todo-backend-xxxxx.onrender.com/api
   ```

5. **Clique sur "Create Web Service"**
6. ✅ Render va builder le Dockerfile multi-stage (React build + Nginx)
7. **URL générée** : `https://todo-frontend-xxxxx.onrender.com`

---

### Étape 3 : Mettre à jour le CORS Backend

Une fois le frontend déployé, **mets à jour la variable `CLIENT_URL`** du backend avec l'URL réelle :

```
CLIENT_URL=https://todo-frontend-xxxxx.onrender.com
```

Render va automatiquement redéployer le backend.

---

### Étape 4 : (Optionnel) Nom de Domaine Personnalisé

1. **Achète un domaine** (ex: Namecheap, OVH, Gandi)
2. **Dans Render** → Paramètres du service → "Custom Domain"
3. **Ajoute ton domaine** : `todo.mondomaine.com`
4. **Configure les DNS** chez ton registrar :
   ```
   Type: CNAME
   Name: todo
   Value: todo-frontend-xxxxx.onrender.com
   ```
5. ✅ Render génère automatiquement un certificat SSL (Let's Encrypt)

---

## 📊 Monitoring et Logs

### Logs en temps réel

```bash
# Dans Render Dashboard → Service → Logs
```

Les logs Winston sont visibles en temps réel avec timestamps et niveaux.

### Endpoint de santé

```bash
curl https://todo-backend-xxxxx.onrender.com/health
```

Retourne :
```json
{
  "status": "OK",
  "timestamp": "2026-01-04T14:30:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### Monitoring externe (optionnel)

- **Uptime Kuma** (self-hosted) : Surveille `/health` toutes les 60s
- **BetterUptime** (gratuit) : Alertes email/SMS si le service est down
- **Render Dashboard** : Métriques CPU/RAM/requêtes incluses

### Alertes recommandées

1. **API Down** : Si `/health` ne répond pas pendant 2 min
2. **Latence élevée** : Si temps de réponse > 500ms
3. **Erreurs 5xx** : Si taux d'erreur > 5%

---

## 🔒 Sécurité en Production

✅ **Déjà implémenté** :
- HTTPS automatique (Let's Encrypt)
- Variables d'environnement sécurisées (pas dans le code)
- Validation des entrées (express-validator)
- Sanitization XSS (.escape())
- Contrôle d'accès (vérification user.id)
- JWT avec secret robuste
- CORS restreint à l'origine du frontend
- Logs structurés (Winston)

⚠️ **À améliorer pour une vraie production** :
- Rotation du `JWT_SECRET` tous les 90 jours
- Rate limiting (express-rate-limit)
- Helmet pour headers de sécurité
- Gestion des secrets via Render Secret Manager (au lieu de .env)
- Backup automatique MongoDB Atlas
- Tests automatisés dans la CI/CD

---

## 🔄 Workflow de Mise à Jour

1. **Développe en local** sur une branche `feature/xxx`
2. **Commit + push** sur GitHub
3. **Ouvre une Pull Request**
4. **GitHub Actions** lance la CI :
   - Install dependencies
   - Build Docker images
   - Audit de sécurité
5. **Merge dans `main`**
6. **Render détecte le push** et redéploie automatiquement (CD)

---

## 💰 Coûts

- **Render Free Tier** : 750h/mois par service (suffisant pour dev/démo)
  - ⚠️ Les services gratuits s'endorment après 15 min d'inactivité (délai de ~30s au réveil)
  - Pour un service toujours actif : passer à Starter ($7/mois par service)
- **MongoDB Atlas Free Tier** : 512MB (suffisant pour une To-Do List)
- **Domaine** : ~10€/an (optionnel)
- **Total pour cette démo** : **0€** ✅

---

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Winston Logging](https://github.com/winstonjs/winston)

---

**Note pour la soutenance** : Ce déploiement démontre la maîtrise de la conteneurisation (Docker), du CI/CD (GitHub Actions), de l'hébergement cloud (Render), de la sécurité (HTTPS, CORS, validation), et du monitoring (logs Winston + endpoint /health).
