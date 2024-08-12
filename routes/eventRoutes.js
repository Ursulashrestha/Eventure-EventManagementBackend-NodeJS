const express = require('express');
const { createEvent, getAllEvents, getEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('ADMIN', 'EVENTMANAGER'), createEvent);
router.get('/', auth, getAllEvents);
router.get('/:id', auth, getEvent);
router.put('/:id', auth, authorize('ADMIN', 'EVENTMANAGER'), updateEvent);
router.delete('/:id', auth, authorize('ADMIN', 'EVENTMANAGER'), deleteEvent);

module.exports = router;
