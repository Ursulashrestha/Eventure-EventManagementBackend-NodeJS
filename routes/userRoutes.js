const express = require('express');
const { protect } = require('../middleware/auth');
const { registerUser, loginUser, getAllUsers, deleteUser, getUserCount} = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Event Manager and Participant Signup Route
router.post('/signup', registerUser);

// Event Manager and Participant Login Route
router.post('/login', loginUser);


// Admin can access all users
router.get('/', auth, authorize('ADMIN'), getAllUsers);

// router.put('/change-password', protect, changePassword);

router.get('/alluser-count', getUserCount);
/////////////////////////////////////////////////////////////



//////////////////////////////////////////////////////////////////
// Admin can delete users
router.delete('/:id', auth, authorize('ADMIN'), deleteUser);




// // Google Auth Routes
// router.get('/auth/google', passport.authenticate('google', {
//   scope: ['profile', 'email'],
// }));

// router.get('/auth/google/callback',
// passport.authenticate('google', { failureRedirect: '/login' }),
// (req, res) => {
//   // Successful authentication, redirect home.
//   res.redirect('/em-dashboard');
// });



module.exports = router;
