const Event = require('../models/Event');
const User = require('../models/User');

exports.createEvent = async (req, res) => {
    const { name, date, location, description, eventManagerName, participantNames } = req.body;

    try {
        // Check if an event with the same name and description already exists
        const existingEvent = await Event.findOne({ name, description });
        if (existingEvent) {
            return res.status(400).json({ message: 'Event with the same name and description already exists' });
        }

        // Find the event manager by name, ensuring it's an event_manager role
        const eventManager = await User.findOne({ name: eventManagerName, role: 'EVENTMANAGER' });
        if (!eventManager) {
            return res.status(400).json({ message: 'Invalid event manager name' });
        }

        // Find participants by their names, ensuring they have the participant role
        const participants = await User.find({ name: { $in: participantNames }, role: 'PARTICIPANT' });
        if (participants.length !== participantNames.length) {
            return res.status(400).json({ message: 'One or more participant names are invalid' });
        }

        // Check if the user is allowed to create an event (must be admin or event_manager)
        if (req.user.role !== 'ADMIN' && req.user.role !== 'EVENTMANAGER') {
            return res.status(403).json({ message: 'You do not have permission to create an event' });
        }

        // Create the event
        const event = new Event({
            name,
            date,
            location,
            description,
            eventManager: eventManager._id, 
            participants: participants.map(p => p._id) 
        });

        await event.save();

        // Fetch all event managers and participants for the response
        const allEventManagers = await User.find({ role: 'EVENTMANAGER' }).select('name email');
        const allParticipants = await User.find({ role: 'PARTICIPANT' }).select('name email');

        res.status(201).json({
            message: 'Event created successfully',
            event,
            allEventManagers,
            allParticipants
        });
    } catch (error) {
        console.error('Error creating event:', error.message);
        res.status(400).json({ message: 'Error creating event', error: error.message });
    }
};


// Get all event managers
exports.getAllEventManagers = async (req, res) => {
    try {
        const eventManagers = await User.find({ role: 'EVENTMANAGER' }).select('name email');
        res.status(200).json(eventManagers);
    } catch (error) {
        console.error('Error fetching event managers:', error.message);
        res.status(400).json({ message: 'Error fetching event managers', error: error.message });
    }
};

//get all event manager count
exports.getEventManagerCount = async (req, res) => {
    try {
        const count = await User.countDocuments({ role: 'EVENTMANAGER' });
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching event manager count:', error.message);
        res.status(400).json({ message: 'Error fetching event manager count', error: error.message });
    }
};

// Get all participants
exports.getAllParticipants = async (req, res) => {
    try {
        const participants = await User.find({ role: 'PARTICIPANT' }).select('name email');
        res.status(200).json(participants);
    } catch (error) {
        console.error('Error fetching participants:', error.message);
        res.status(400).json({ message: 'Error fetching participants', error: error.message });
    }
};

//  Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('eventManager participants');
        res.status(200).json(events);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching events' });
    }
};

// get all event counts
exports.getEventCount = async (req, res) => {
    try {
        const eventCount = await Event.countDocuments(); 
        res.status(200).json({ count: eventCount });
    } catch (error) {
        console.error('Error fetching event count:', error.message);
        res.status(400).json({ message: 'Error fetching event count', error: error.message });
    }
};


//get all upcoming events
exports.getAllUpcomingEvents = async (req, res) => {
    try {
        const currentDate = new Date();
        const events = await Event.find({ date: { $gt: currentDate } })
            .populate('eventManager participants');
        res.status(200).json(events);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching upcoming events' });
    }
};


// @desc Get a single event
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('eventManager participants');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching event' });
    }
};

// @ Update an event

exports.updateEvent = async (req, res) => {
    const { name, date, location, description, eventManagerName, participantNames } = req.body;

    try {
        // Find the event by ID
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is an admin or the event manager who created the event
        if (req.user.role !== 'ADMIN' && req.user._id.toString() !== event.eventManager.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        // Update the event fields
        if (name) event.name = name;
        if (date) event.date = date;
        if (location) event.location = location;
        if (description) event.description = description;

        // Update the event manager if provided
        if (eventManagerName) {
            const eventManager = await User.findOne({ name: eventManagerName, role: 'EVENTMANAGER' });
            if (!eventManager) {
                return res.status(404).json({ message: 'Event Manager not found or invalid role' });
            }
            event.eventManager = eventManager._id;
        }

        // Update participant names if provided
        if (participantNames) {
            const participants = await User.find({ name: { $in: participantNames }, role: 'PARTICIPANT' });
            if (participants.length !== participantNames.length) {
                return res.status(404).json({ message: 'One or more participants not found or invalid role' });
            }
            event.participants = participants.map(participant => participant._id);
        }

        // Save the updated event
        await event.save();

        res.status(200).json({
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        console.error('Error updating event:', error.message);
        res.status(400).json({ message: 'Error updating event', error: error.message });
    }
};

// Delete an event


exports.deleteEvent = async (req, res) => {
    try {
        // Find the event by ID
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is an admin or the event manager who created the event
        if (req.user.role !== 'ADMIN' && req.user._id.toString() !== event.eventManager.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error.message);
        res.status(400).json({ message: 'Error deleting event', error: error.message });
    }
};


// /////////////////////////////////////////////////////////////////




// Update an event (No creator check)
exports.updateWEvent = async (req, res) => {
    const { name, date, location, description, eventManagerName, participantNames } = req.body;

    try {
        // Find the event by ID
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is an admin or event manager
        if (req.user.role !== 'ADMIN' && req.user.role !== 'EVENTMANAGER') {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        // Update the event fields
        if (name) event.name = name;
        if (date) event.date = date;
        if (location) event.location = location;
        if (description) event.description = description;

        // Update the event manager if provided
        if (eventManagerName) {
            const eventManager = await User.findOne({ name: eventManagerName, role: 'EVENTMANAGER' });
            if (!eventManager) {
                return res.status(404).json({ message: 'Event Manager not found or invalid role' });
            }
            event.eventManager = eventManager._id;
        }

        // Update participant names if provided
        if (participantNames) {
            const participants = await User.find({ name: { $in: participantNames }, role: 'PARTICIPANT' });
            if (participants.length !== participantNames.length) {
                return res.status(404).json({ message: 'One or more participants not found or invalid role' });
            }
            event.participants = participants.map(participant => participant._id);
        }

        // Save the updated event
        await event.save();

        res.status(200).json({
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        console.error('Error updating event:', error.message);
        res.status(400).json({ message: 'Error updating event', error: error.message });
    }
};

// Delete an event (No creator check)
exports.deleteWEvent = async (req, res) => {
    try {
        // Find the event by ID
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is an admin or event manager
        if (req.user.role !== 'ADMIN' && req.user.role !== 'EVENTMANAGER') {
            return res.status(403).json({ message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error.message);
        res.status(400).json({ message: 'Error deleting event', error: error.message });
    }
};

