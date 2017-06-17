'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('mongoose').model('User'),
    path = require('path');

/**
 * Module init function
 */
module.exports = function (app) {
    console.log('-------- init password ------------');
    // Serialize sessions
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Deserialize sessions
    passport.deserializeUser(function (id, done) {
        User.findOne({
            _id: id
        }, '-salt -password', function (err, user) {
            done(err, user);
        });
    });

    // Initialize strategies
    passport.use(new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (username, password, done) {
            User.findOne({
                email: username.toLowerCase()
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user || !user.authenticate(password)) {
                    return done(null, false, {
                        message: 'Invalid email address or password'
                    });
                }

                return done(null, user);
            });
        }));

    // Add passport's middleware
    app.use(passport.initialize());
    app.use(passport.session());
};
