const express = require('express');
const { createEvent, getAllEvents, getEvent, updateEvent, deleteEvent, getAllEventManagers,getEventCount,getEventManagerCount, getAllParticipants, getAllUpcomingEvents, updateWEvent, deleteWEvent } = require('../controllers/eventController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('ADMIN', 'EVENTMANAGER'), createEvent);
router.get('/', auth, getAllEvents);
router.get('/event-managers', auth, authorize('ADMIN', 'EVENTMANAGER'),getAllEventManagers);
router.get('/event-managers/count', auth, authorize('ADMIN', 'EVENTMANAGER'), getEventManagerCount);
router.get('/all-events/count',auth, authorize('ADMIN', 'EVENTMANAGER'), getEventCount);
router.get('/participants',  auth, authorize('ADMIN', 'EVENTMANAGER'),getAllParticipants);
router.get('/upcoming', auth, authorize('ADMIN', 'EVENTMANAGER'),getAllUpcomingEvents)
router.get('/:id', auth, getEvent);

router.put('/:id', auth, authorize('ADMIN', 'EVENTMANAGER'), updateEvent);
router.put('/w/:id', auth, authorize('ADMIN', 'EVENTMANAGER'), updateWEvent);
router.delete('/:id', auth, authorize('ADMIN', 'EVENTMANAGER'), deleteEvent);
router.delete('/w/:id', auth, authorize('ADMIN', 'EVENTMANAGER'), deleteWEvent);

module.exports = router;
