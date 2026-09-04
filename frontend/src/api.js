import axios from 'axios';

/**
 * Instance axios configurée pour communiquer avec le backend
 * 
 * L'URL de base est déterminée par la variable d'environnement REACT_APP_API_URL.
 * En développement local : http://localhost:5000/api
 * En production/Docker : sera définie au build via .env ou docker-compose
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export default api;
