import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import TaskForm from "../components/TaskForm";

/**
 * Composant Tasks - Page principale de gestion des tâches
 * 
 * Affiche la liste des tâches de l'utilisateur authentifié et permet
 * d'ajouter et de supprimer des tâches. Redémarre automatiquement vers
 * /login si l'utilisateur n'est pas authentifié ou si son token est expiré.
 * 
 * @component
 * @returns {JSX.Element} Interface de gestion des tâches
 */
const Tasks = () => {
  // State local : liste des tâches chargées depuis l'API
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  /**
   * useEffect - Chargement initial des tâches au montage du composant
   * 
   * Vérifie la présence d'un token JWT dans localStorage.
   * Si absent, redirige vers /login.
   * Si présent, charge les tâches via GET /api/tasks.
   * En cas d'erreur 401 (token expiré/invalide), supprime le token et redirige.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks", {
          headers: { "x-auth-token": token },
        });
        setTasks(res.data);
      } catch (err) {
        // Gestion d'erreur ajoutée : sans ça, un token expiré/invalide (401)
        // provoquait un crash silencieux sans aucun feedback.
        console.error("Erreur lors du chargement des tâches", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchTasks();
  }, [navigate]);

  /**
   * Ajoute une nouvelle tâche à la liste locale (optimistic update)
   * 
   * Appelée par TaskForm après création réussie de la tâche côté serveur.
   * Met à jour immédiatement l'interface sans recharger toutes les tâches.
   * 
   * @param {Object} task - Nouvelle tâche retournée par l'API (avec _id)
   */
  const addTask = (task) => {
    setTasks((prevTask) => [task, ...prevTask]);
  };

  /**
   * Supprime une tâche (serveur + interface)
   * 
   * Envoie une requête DELETE /api/tasks/:id puis met à jour la liste locale
   * en retirant la tâche supprimée. En cas d'erreur, affiche un message en console.
   * 
   * @param {string} id - ID MongoDB de la tâche à supprimer
   */
  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/tasks/${id}`, { headers: { "x-auth-token": token } });
      // Mise à jour optimiste : retire immédiatement de l'interface
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>Mes Tâches</h1>
      <TaskForm addTask={addTask} />
      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task._id}
            className={`task-item ${task.isCompleted ? "completed" : ""}`}
          >
            <span>{task.title}</span>
            <button onClick={() => deleteTask(task._id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tasks;
