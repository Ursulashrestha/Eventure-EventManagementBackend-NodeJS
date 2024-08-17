// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: '/api/users/auth/google/callback'
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     let user = await User.findOne({ googleId: profile.id });

//     if (!user) {
//       user = new User({
//         googleId: profile.id,
//         name: profile.displayName,
//         email: profile.emails[0].value,
//       });
//       await user.save();
//     }

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
//     return done(null, { user, token });
//   } catch (err) {
//     return done(err, null);
//   }
// }));

// // Serialize and deserialize user (optional, if you're using sessions)
// // If you're using JWT tokens, you might not need these.
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((obj, done) => {
//   done(null, obj);
// });
