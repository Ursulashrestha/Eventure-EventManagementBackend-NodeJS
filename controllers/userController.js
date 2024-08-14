const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const user = new User({ name, email, password, role });
        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({ 
            message: "User created successfully",
            token
            });
    } catch (error) {
        console.error('Error during user creation:', error.message); // Log the specific error
        res.status(400).json({ message: 'Error creating user', error: error.message }); // Return error message in response
    }
};


// @desc Login user (Event Manager or Participant)
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in user' });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching users' });
    }
};

// Count all users
exports.getUserCount = async (req, res) => {
    try {
        const userCount = await User.countDocuments(); 
        res.status(200).json({ count: userCount });
    } catch (error) {
        console.error('Error fetching user count:', error.message);
        res.status(400).json({ message: 'Error fetching user count', error: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting other admins
        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'You do not have permission to delete an admin' });
        }

        // If the user is not an admin, proceed with deletion
        await user.remove();

        res.status(200).json({ message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} deleted successfully` });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(400).json({ message: 'Error deleting user', error: error.message });
    }
};

