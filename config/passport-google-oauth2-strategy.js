const passport=require('passport');
const googleStrategy=require('passport-google-oauth').OAuth2Strategy;
const crypto=require('crypto');
const User=require('../models/user');

// Tell passport to use a new strategy for google login
passport.use(new googleStrategy({
       // link--> https://console.developers.google.com/apis/credentials/oauthclient/11811364338-jd41bglto90ltc1d39ft9t7p27umjv8n.apps.googleusercontent.com?project=codeial-sample-271303
        clientID: "106858603110-mdu9ri69mimkf6jh1k8ca49fr1lge6mv.apps.googleusercontent.com",
        clientSecret: "2_FMLY3tAM94HjE7kgfQNvA4",
        callbackURL: "http://localhost:8000/users/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done){
        // Find a user
        User.findOne({email: profile.emails[0].value}).exec(function(err, user){
            if(err){
                console.log('Error in google strategy-passport', err);
                return;
            }
            if(user){
                // if user found, set this user as req.user
                return done(null, user);
            }else{
                // If user not found, create the user and set it as req.user
                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(20).toString('hex')
                }, function(err, user){
                    if(err){
                        console.log('Error in creating user google strategy-passport', err);
                        return;
                    }
                    return done(null, user);
                });
            }
        });
    }
));

module.exports=passport;