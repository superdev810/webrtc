'use strict';

var mongoose = require('mongoose'),
    path = require('path'),
    passport = require('passport');

var config = require(path.resolve('./config/config'));

var Users = mongoose.model('User');

var errorHandler = require('./errors.controller');

var sign_in = function(req, res, next){
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      next(info);
      //res.status(400).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      console.log('------------- after sign in :::');
      console.log(user);
      req.login(user, function (err) {
        if (err) {
          //res.status(400).send(err);
          next(err);
        } else {
          //res.json(user);
          next(null, user);
        }
      });
    }
  })(req, res, next);
};

var sign_up = function(req, res, next){
  var user = new Users(req.body);
  user.save(function (err) {
    if (err) {
      /*
       return res.status(400).send({
       message: errorHandler.getErrorMessage(err)
       });
       */
      next({message: errorHandler.getErrorMessage(err)});
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;
      console.log('----------- after sign up:::');
      console.log(user);
      req.login(user, function (err) {
        if (err) {
          //res.status(400).send(err);
          next(err);
        } else {
          //res.json(user);
          next(null, user);
        }
      });
    }
  });
};

exports.sign_in = function(req, res, next){
  sign_in(req, res, function(err, user){
    if (next){
      next(err, user);
    }
    else {
      if (err)
        res.status(400).send(err);
      else
        res.json(user);
    }
  })
};

exports.sign_in_by_page = function(req, res){
  sign_in(req, res, function(err, user){
    if (err)
      res.status(400).send(err);
    else
      res.json(user);
  })
};

exports.sign_up = function(req, res, next){
  sign_up(req, res, function(err, user){
    if (next){
      next(err, user);
    }
    else {
      if (err)
        res.status(400).send(err);
      else
        res.json(user);
    }
  })
};


exports.logout = function(req, res){
  req.logout();
  res.redirect('/');
};

exports.sign_up_from_moximo = function(req, res, next){
  // detect request ip === moximo server

  // be requested user's token from moximo server
  var ip = req.body.ip_address,
      email = req.body.email,
      token = req.body.token;
  // upsert to user db
  Users.findOne({email: email}, function(err, result){
    if (!result){
      // add new
      var user = new Users({ip_address: ip, email: email, password: token});
      user.save(function(err){
        if (err)
          res.status(400).send(errorHandler.getErrorMessage(err));
        else
          res.send(user);
      })
    }
    else {
      // update
      result.ip_address = ip;
      result.password = token;
      result.save(function(err){
        if (err)
          res.status(400).send(errorHandler.getErrorMessage(err));
        else
          res.send(result);
      })
    }
  })

};
