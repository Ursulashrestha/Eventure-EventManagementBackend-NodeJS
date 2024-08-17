// middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check authentication
exports.auth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password'); // Ensure that req.user is set

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to authorize based on role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        console.log('Authorize middleware invoked');
        console.log(`User role: ${req.user.role}`);
        console.log(`Allowed roles: ${roles}`);
        
        if (!req.user || !roles.includes(req.user.role)) {
            console.log('Not authorized');
            return res.status(403).json({ message: 'Not authorized' });
        }
        console.log('Authorized');
        next();
    };
};

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get the token from the header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
