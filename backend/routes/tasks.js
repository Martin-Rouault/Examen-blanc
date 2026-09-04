const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');        

const taskValidationRules = [                                                                                                                                                        
    body('title')                                                                                                                                                                      
      .trim()                                                                                                   
      .notEmpty().withMessage('Le titre est requis')                                                                                                        
      .isLength({ max: 100 }).withMessage('Titre trop long')                                                                                                         
      .escape(), 
    
    body('description')                                                                                                                                                                
      .optional()                                                                                                                        
      .trim()                                                                                                                                                                          
      .escape(),  
   ];  

/**
 * @route   GET /api/tasks
 * @desc    Récupère toutes les tâches de l'utilisateur authentifié
 * @access  Private (nécessite un token JWT valide)
 * @returns {Array} Liste des tâches triées par date de création décroissante
 * @throws  {500} Erreur serveur si la requête échoue
 */
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    logger.error('Error fetching tasks', { userId: req.user.id, error: err.message });
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Crée une nouvelle tâche pour l'utilisateur authentifié
 * @access  Private
 * @param   {string} req.body.title - Titre de la tâche (requis, max 100 caractères)
 * @param   {string} [req.body.description] - Description optionnelle de la tâche
 * @returns {Object} La tâche créée avec son _id MongoDB
 * @throws  {400} Si la validation échoue (titre vide ou trop long)
 * @throws  {500} Erreur serveur
 */
router.post('/', auth, taskValidationRules, async (req, res) => {
  const { title, description } = req.body;
  // Un utilisateur pourrait injecter du HTML ou du script dans la description.
  const errors = validationResult(req);                                                                                                                                                
   if (!errors.isEmpty()) {                                                                                                                                                             
     return res.status(400).json({ errors: errors.array() });                                                                                                                           
   }

  try {
    const newTask = new Task({
      title,
      description,
      user: req.user.id,
    });

    const task = await newTask.save();
    logger.info('Task created', { taskId: task._id, userId: req.user.id });
    res.json(task);
  } catch (err) {
    logger.error('Error creating task', { userId: req.user.id, error: err.message });
    res.status(500).send('Server Error');
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Met à jour une tâche existante
 * @access  Private (l'utilisateur ne peut modifier que ses propres tâches)
 * @param   {string} req.params.id - ID MongoDB de la tâche
 * @param   {string} [req.body.title] - Nouveau titre
 * @param   {string} [req.body.description] - Nouvelle description
 * @param   {boolean} [req.body.isCompleted] - Statut de complétion
 * @returns {Object} La tâche mise à jour
 * @throws  {403} Si l'utilisateur tente de modifier une tâche qui ne lui appartient pas
 * @throws  {404} Si la tâche n'existe pas
 * @throws  {500} Erreur serveur
 */
router.put('/:id', auth, async (req, res) => {
  const { title, description, isCompleted } = req.body;

  const errors = validationResult(req);                                                                                                                                                
   if (!errors.isEmpty()) {                                                                                                                                                             
     return res.status(400).json({ errors: errors.array() });                                                                                                                           
   }
    
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if(task.user.toString() !== req.user.id) {
      logger.warn('Unauthorized task update attempt', { taskId: req.params.id, userId: req.user.id });
      return res.status(403).json({ msg: 'You are not allowed to do that' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, { $set: { title, description, isCompleted } }, { new: true });
    logger.info('Task updated', { taskId: req.params.id, userId: req.user.id });
    res.json(task);
  } catch (err) {
    logger.error('Error updating task', { taskId: req.params.id, error: err.message });
    res.status(500).send('Server Error');
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Supprime une tâche
 * @access  Private (l'utilisateur ne peut supprimer que ses propres tâches)
 * @param   {string} req.params.id - ID MongoDB de la tâche à supprimer
 * @returns {Object} Message de confirmation { msg: 'Task removed' }
 * @throws  {403} Si l'utilisateur tente de supprimer une tâche qui ne lui appartient pas
 * @throws  {404} Si la tâche n'existe pas
 * @throws  {500} Erreur serveur
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if(task.user.toString() !== req.user.id) {
      logger.warn('Unauthorized task deletion attempt', { taskId: req.params.id, userId: req.user.id });
      return res.status(403).json({ msg: 'You are not allowed to do that' });
    }

    await Task.findByIdAndRemove(req.params.id);
    logger.info('Task deleted', { taskId: req.params.id, userId: req.user.id });
    res.json({ msg: 'Task removed' });
  } catch (err) {
    logger.error('Error deleting task', { taskId: req.params.id, error: err.message });
    res.status(500).send('Server Error');
  }
});

module.exports = router;
