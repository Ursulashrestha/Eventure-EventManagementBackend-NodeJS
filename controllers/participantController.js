// controllers/participantController.js
const User = require('../models/User');
const Event = require('../models/Event')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};



exports.participantLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, role: 'PARTICIPANT' });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in participant' });
    }
};



exports.getEventsForParticipant = async (req, res) => {
    try {
        const events = await Event.find({ participants: req.user._id }).populate('eventManager participants');
        res.status(200).json(events);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching events', error: error.message });
    }
};


exports.getParticipantProfile = async (req, res) => {
    try {
        const participant = await User.findById(req.user.id).select('-password');
        res.status(200).json(participant);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching participant profile' });
    }
};
