const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

dotenv.config();
connectDB();






const app = express();

app.use(cors());

app.use(express.json());

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: "/auth/google/callback"
// },
// function(accessToken, refreshToken, profile, done) {
//   // Here you would usually find or create the user in your database
//   // For example:
//   User.findOrCreate({ googleId: profile.id }, function (err, user) {
//     return done(err, user);
//   });
// }
// ));

// passport.serializeUser(function(user, done) {
// done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
// User.findById(id, function(err, user) {
//   done(err, user);
// });
// });
// Admin routes
app.use('/api/admin', require('./routes/adminRoutes'));

// User routes for Event Managers and Participants
app.use('/api/users', require('./routes/userRoutes'));

// Event routes
app.use('/api/events', require('./routes/eventRoutes'));

// Task routes
app.use('/api/tasks', require('./routes/taskRoutes'));

//participant routes

app.use('/api/participants', require('./routes/participantRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
