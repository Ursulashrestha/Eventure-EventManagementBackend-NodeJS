const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

// User routes for Event Managers and Participants
app.use('/api/users', require('./routes/userRoutes'));

// Event routes
app.use('/api/events', require('./routes/eventRoutes'));

// Task routes
app.use('/api/tasks', require('./routes/taskRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
