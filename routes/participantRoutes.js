const express = require('express');

const { participantLogin, getEventsForParticipant, getParticipantProfile} = require('../controllers/participantController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();
// Participant Login Route
router.post('/login', participantLogin);

router.get('/pevents', auth, authorize('PARTICIPANT'), getEventsForParticipant);


module.exports = router;