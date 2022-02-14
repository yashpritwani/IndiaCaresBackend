const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const mongoose = require('mongoose');

module.exports = function(passport){
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
      },
      async(accessToken, refreshToken, profile, cb) => {
          // console.log(profile);
          const newUser = {
            emailId: profile.emails[0].value,
              password: profile.id,
              userName: profile.displayName,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName
          }
          try {
              let user = await User.findOne({ password: profile.id });
              if(user) {
                  // console.log('user found');
                  
                  cb(null, user);
              } else{
                  // console.log('user created');
                  user = await User.create(newUser);
                  cb(null, user);
              }
          } catch(err) {
              // console.log(err);
          }
      }
    ));

      passport.serializeUser( (user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user)=> done(err, user))
      });
}
