const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys')
const User = require('../models/user-model')

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);  
  })
});

passport.use(
  new GoogleStrategy({
  // options for the google strategy
  callbackURL: '/auth/google/redirect',
  clientID: keys.google.clientID,
  clientSecret: keys.google.clientSecret
  }, (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    // check if user already exists in our database
    User.findOne({googleId: profile.id}).then((currentUser) => {
      if (currentUser) {
        // already have a user
        console.log('User is: ' + currentUser)
        done(null, currentUser);
      } else {
        // create a user in our database
        new User({
          username: profile.displayName,
          googleId: profile.id,
          thumbnail: profile._json.picture
        }).save().then((newUser) => {
          console.log('New User Created: ' + newUser);
          done(null, newUser);
        })
      }
    })
  })
)


