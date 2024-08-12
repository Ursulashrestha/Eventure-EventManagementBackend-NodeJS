const express = require('express');
const { createTask, getAllTasks, getTask, updateTask, getAssignedTasks, deleteTask } = require('../controllers/taskController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('ADMIN', 'EVENTMANAGER'), createTask);
router.get('/', auth, authorize('ADMIN', 'EVENTMANAGER'), getAllTasks);
router.get('/assigned', auth, authorize('EVENTMANAGER'), getAssignedTasks);
router.get('/:id', auth,authorize('ADMIN', 'EVENTMANAGER'), getTask);

router.put('/:id', auth, authorize('ADMIN', 'EVENTMANAGER'), updateTask);
router.delete('/:id', auth, authorize('ADMIN', 'EVENTMANAGER'), deleteTask);

module.exports = router;
