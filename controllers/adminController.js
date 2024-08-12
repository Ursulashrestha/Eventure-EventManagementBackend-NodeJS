const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "Admin already exists!" });
        }

        const user = new User({ name, email, password, role: 'admin' });
        await user.save();

        res.status(201).json({
            message: "Admin created successfully"
        });
    } catch (error) {
        console.error('Error during admin user creation:', error.message);
        res.status(400).json({ message: 'Error creating admin user', error: error.message });
    }
};


// @desc Admin Login
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, role: 'ADMIN' });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials or not an admin' });
        }

        const token = generateToken(user._id);

        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in admin user' });
    }
};
