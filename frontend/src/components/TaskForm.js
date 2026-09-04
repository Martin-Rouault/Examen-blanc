import React, { useState } from "react";
import api from "../api";

/**
 * Composant TaskForm - Formulaire d'ajout de tâche
 * 
 * Permet à l'utilisateur de créer une nouvelle tâche en saisissant un titre.
 * Envoie une requête POST /api/tasks puis appelle la callback addTask pour
 * mettre à jour la liste parente sans recharger toutes les tâches.
 * 
 * @component
 * @param {Object} props
 * @param {Function} props.addTask - Callback pour ajouter la tâche créée à la liste parente
 * @returns {JSX.Element} Formulaire d'ajout de tâche
 */
const TaskForm = ({ addTask }) => {
  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if(title.trim()) {
      try {
        const res = await api.post(
          "/tasks",
          { title },
          {
            headers: { "x-auth-token": token },
          }
        );
        addTask(res.data);
        setTitle("");
      } catch (err) {
        console.error(err);
      }
    } else {
      alert('Veuillez remplir le titre de la tâche')
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-group">
      <input
        type="text"
        required
        placeholder="Ajouter une tâche ..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button type="submit" className="btn" style={{ marginTop: "10px" }}>
        Ajouter Tâche
      </button>
    </form>
  );
};

export default TaskForm;
