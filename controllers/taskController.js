const Task = require('../models/Task');
const Event = require('../models/Event');
const User = require('../models/User');

exports.createTask = async (req, res) => {
    const { title, description, deadline, eventName, eventManagerName } = req.body;

    try {
        // Find the event by name
        const event = await Event.findOne({ name: eventName });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the user is an admin or the event manager who created the event
        if (req.user.role !== 'ADMIN' && req.user._id.toString() !== event.eventManager.toString()) {
            return res.status(403).json({ message: 'Not authorized to create tasks for this event' });
        }

        // Find the event manager by name
        const eventManager = await User.findOne({ name: eventManagerName, role: 'EVENTMANAGER' });
        if (!eventManager) {
            return res.status(404).json({ message: 'Event Manager not found or invalid role' });
        }

        // Validate the deadline
        if (new Date(deadline) >= new Date(event.date)) {
            return res.status(400).json({ message: 'Deadline must be before the event date' });
        }

        // Create the task
        const task = new Task({
            title,
            description,
            deadline,
            event: event._id, 
            eventManager: eventManager._id 
        });

        await task.save();

        res.status(201).json({
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        if (error.code === 11000) { // Duplicate TASK error
            return res.status(400).json({
                message: 'Task creation failed',
                error: 'Task title or description already exists'
            });
        } else {
            console.error('Error creating task:', error.message);
            res.status(400).json({ message: 'Error creating task', error: error.message });
        }
    }
};




// Get all tasks
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('event').populate('eventManager');
        const taskCount = await Task.countDocuments();  // Count all tasks
        res.status(200).json({ tasks, count: taskCount });
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(400).json({ message: 'Error fetching tasks', error: error.message });
    }
};



// Get a single task
exports.getTask = async (req, res) => {
    try {
        // Find the task by ID and populate the event and eventManager fields
        const task = await Task.findById(req.params.id)
            .populate('event', 'name') 
            .populate('eventManager'); 

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ message: 'Error fetching task' });
    }
};



// Find tasks assigned to the logged-in event manager
exports.getAssignedTasks = async (req, res) => {
    try {
        
        const tasks = await Task.find({ eventManager: req.user._id }).populate('event').populate('eventManager');
        
        if (tasks.length === 0) {
            return res.status(200).json({ message: 'No tasks assigned yet!' });
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching assigned tasks:', error.message);
        res.status(400).json({ message: 'Error fetching assigned tasks', error: error.message });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    const { title, description, deadline, eventName, eventManagerName } = req.body;

    try {
        // Find the task by ID
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Find the event by name if provided, otherwise use the existing event ID
        let event = task.event;
        if (eventName) {
            event = await Event.findOne({ name: eventName });
            if (!event) {
                return res.status(404).json({ message: 'Event not found' });
            }
        } else {
            event = await Event.findById(task.event);
        }

        // Check if the user is an admin or the event manager who created the event
        if (req.user.role !== 'ADMIN' && req.user._id.toString() !== event.eventManager.toString()) {
            return res.status(403).json({ message: 'Not authorized to update tasks for this event' });
        }

        // Validate the deadline
        if (deadline && new Date(deadline) >= new Date(event.date)) {
            return res.status(400).json({ message: 'Deadline must be before the event date' });
        }

        // Find the event manager by name if provided
        if (eventManagerName) {
            const eventManager = await User.findOne({ name: eventManagerName, role: 'EVENTMANAGER' });
            if (!eventManager) {
                return res.status(404).json({ message: 'Event Manager not found or invalid role' });
            }
            task.eventManager = eventManager._id;
        }

        // Update the task fields
        if (title) task.title = title;
        if (description) task.description = description;
        if (deadline) task.deadline = deadline;
        task.event = event._id;

        // Save the updated task
        await task.save();

        // Include the event name in the response
        res.status(200).json({
            message: 'Task updated successfully',
            task: {
                ...task.toObject(), // Convert the task to a plain object
                eventName: event.name // Add the event name
            }
        });
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(400).json({ message: 'Error updating task', error: error.message });
    }
};



// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const event = await Event.findById(task.event);

        // Check if the user is an admin or the event manager who created the event
        if (req.user.role !== 'ADMIN' && req.user._id.toString() !== event.eventManager.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete tasks for this event' });
        }

        await task.deleteOne();

        res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting task' });
    }
};

