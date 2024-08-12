const express = require('express');
const { registerAdmin, loginAdmin } = require('../controllers/adminController');


const router = express.Router();

// Admin Signup Route
router.post('/signup', registerAdmin);

// Admin Login Route
router.post('/login', loginAdmin);



module.exports = router;
