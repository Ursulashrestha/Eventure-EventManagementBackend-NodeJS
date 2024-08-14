const express = require('express');
const { registerUser, loginUser, getAllUsers, deleteUser, getUserCount } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Event Manager and Participant Signup Route
router.post('/signup', registerUser);

// Event Manager and Participant Login Route
router.post('/login', loginUser);

// Admin can access all users
router.get('/', auth, authorize('ADMIN'), getAllUsers);

router.get('/alluser-count', getUserCount);
// Admin can delete users
router.delete('/:id', auth, authorize('ADMIN'), deleteUser);

// router.get('/roles', auth, authorize('admin', 'event_manager'), getEventManagersAndParticipants);

module.exports = router;
