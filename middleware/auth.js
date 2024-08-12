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
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
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


