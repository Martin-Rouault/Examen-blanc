Rajout de la route et du lien du formulaire d'inscription dans la navbar.

Ajout de la propriété required sur les inputs des deux formulaires et check si les input ne sont pas vide au moment de la soumission du formulaire.

Correction du bug d'ajout de tâche dans Tasks.js : la nouvelle tâche s'affiche désormais immédiatement grâce à setTasks avec le spread operator, sans avoir à rafraîchir la page.

Ajout d'un message d'erreur visible dans Login.js en cas d'échec de connexion (state error affiché dans le JSX), avec optional chaining sur err.response pour éviter un crash quand le serveur ne répond pas.

Sécurité (XSS) : ajout de la validation et de la sanitization des entrées (express-validator, .escape()) sur les routes POST et PUT de tasks.js pour prévenir les injections HTML/JavaScript stockées.

Sécurité (contrôle d'accès) : ajout d'une vérification de propriété sur les routes PUT et DELETE de tasks.js (comparaison task.user.toString() !== req.user.id, renvoi d'un 403) pour empêcher un utilisateur de modifier ou supprimer les tâches des autres.

Correction du code de statut dans middleware/auth.js : renvoi d'un 401 (au lieu de 418) lorsque le token est invalide.

Correction d'un bug (crash) dans Register.js et Login.js : ajout de l'optional chaining sur err.response?.data?.msg pour éviter une TypeError quand le serveur est injoignable (erreur réseau / serveur down).

Correction d'un bug d'interface dans Register.js : le message d'erreur (state error) n'était jamais affiché dans le JSX ; l'utilisateur n'avait aucun retour en cas d'échec de l'inscription. Affichage ajouté comme dans Login.js.

Correction d'un bug dans Tasks.js : la fonction fetchTasks ne gérait aucune erreur. 
Ajout d'un try/catch : en cas de token expiré/invalide (401), le token est supprimé et l'utilisateur est redirigé vers /login au lieu d'un crash silencieux.

Sécurité (validation register) : ajout de règles express-validator sur POST /auth/register dans backend/routes/auth.js (username min 3 caractères, password min 8 caractères + au moins 1 chiffre) pour empêcher la création de comptes avec des identifiants faibles.

Correction de l'affichage des erreurs de validation côté frontend (Register.js) : gestion du tableau errors[] renvoyé par le backend avec map() pour afficher tous les messages de validation.

Sécurité (dépendances) : exécution de npm audit sur backend et frontend. Backend : 7 vulnérabilités détectées (2 moderate, 5 high) dans express, mongoose, body-parser, qs, path-to-regexp, jws, ip-address → npm audit fix appliqué → réduction à 2 vulnérabilités résiduelles (1 low, 1 moderate dans qs). 
Frontend : 61 vulnérabilités détectées (12 low, 13 moderate, 34 high, 2 critical) dans axios, react-router-dom, webpack, ws, shell-quote, postcss, lodash → npm audit fix appliqué → réduction à 34 vulnérabilités (9 low, 11 moderate, 14 high). Les vulnérabilités restantes nécessitent des mises à jour majeures (breaking changes) qui sortent du scope de ce projet. En production, un outil comme Dependabot ou Renovate serait mis en place pour suivre automatiquement les mises à jour de sécurité.

Documentation (JSDoc + commentaires) : ajout de JSDoc complète sur toutes les routes backend (GET/POST/PUT/DELETE /api/tasks, POST /api/auth/register, POST /api/auth/login) et sur le middleware d'authentification auth.js. Chaque fonction documente ses paramètres, retours, erreurs possibles et niveau d'accès. Côté frontend, ajout de commentaires JSDoc structurés sur les composants Tasks.js (page principale) et TaskForm.js (formulaire d'ajout) : description du rôle du composant, des props, des fonctions internes (addTask, deleteTask, fetchTasks) et du cycle de vie (useEffect).
Conteneurisation (Docker) : création de Dockerfile pour backend (Node.js Alpine) et frontend (build multi-stage React + Nginx), avec fichiers .dockerignore pour optimiser les builds. Création de docker-compose.yml pour orchestrer backend + frontend + MongoDB (version locale) et docker-compose.local.yml pour tests avec MongoDB local. Configuration de nginx.conf pour le routage SPA du frontend. Ajout de la variable d'environnement REACT_APP_API_URL dans frontend/src/api.js pour gérer les différentes URLs d'API (dev/prod).
Logging (Winston) : remplacement de tous les console.log par Winston dans backend/server.js, config/db.js, routes/tasks.js et routes/auth.js. Configuration dans config/logger.js avec niveaux de log (info/warn/error), timestamps, formatage coloré en console et sauvegarde dans logs/app.log et logs/error.log (rotation 5MB x 5 fichiers). Ajout de logs contextuels sur toutes les opérations critiques : connexion DB, création/modification/suppression de tâches, login/register, tentatives d'accès non autorisées.
Monitoring : ajout d'un endpoint GET /health dans backend/server.js qui retourne le statut, timestamp, uptime et environnement. Utilisable pour les outils de monitoring (Uptime Kuma, BetterUptime, Prometheus).
CI/CD : création d'un pipeline GitHub Actions (.github/workflows/ci.yml) avec 3 jobs : backend (install + build Docker), frontend (install + build + build Docker), security (npm audit). Le pipeline se déclenche sur push/PR vers main/master. Base pour automatiser le déploiement sur Render.
Déploiement : création de DEPLOYMENT.md documentant l'architecture de production (frontend Render + backend Render + MongoDB Atlas), les étapes de déploiement sur Render.com avec Docker, la configuration HTTPS automatique (Let's Encrypt), le monitoring via /health, les alertes recommandées, et le workflow de mise à jour (Git → CI → CD).