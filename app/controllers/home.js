'use strict';

var mongoose = require('mongoose'),
    path = require('path'),
    validator = require('validator');

var config = require(path.resolve('./config/config'));

var Users = mongoose.model('User');

var ErrorHandler = require('./errors.controller'),
    Fn = require('./functions'),
    Mailer = require('./mailer.controller'),
    AuthController = require('./auth');

exports.index = function(req, res, next){
/*
  res.render('index', {
    title: config.app.title,
    error: req.flash('message'),
    user: req.user
  });
//*/
  //*
  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  console.log('ip-address :: ' + ip);
  // find from user db using ip address
  /* dummy data //*/
  //*
  ip = 'owner-test-ip';
  Users.findOne({ip_address: ip}, function(err, result){
    if (!err && result){
      // request to moximo server for detect email and token : {email: result.email, token: result.password}
      req.body = {
        email: result.email,
        password: result.password
      };
      AuthController.sign_in(req, res, function(err, user){
        //if (err)
        //  return res.redirect('http://moximo.com');
        var ctx = {title: config.app.title, error: null};
        res.render('owner/create_room', ctx);
      })
    }
    else {
      // redirect to moximo site
      res.redirect(config.mainServer);
    }
  })
  // */
};

exports.create_room = function(req, res, next){
  // find from user model
  var email = req.body.email;
  if (!email){
    req.flash('message', 'mail address is required.');
    return res.redirect('/');
  }


  if (!validator.isEmail(email)){
    req.flash('message', 'invalid mail address');
    return res.redirect('/');
  }

  var ctx = {title: config.app.title, error: null};
  if (req.user && req.user.email == email){
    // when signin already
    ctx.is_login = true;
    res.render('owner/create_room', ctx);
  }
  else {
    req.session.req_email = email;
    Users.findOne({email: email}, function(err, user){
      if (!err && user){
        // render next page
        ctx.is_login = false;
        res.render('owner/create_room', ctx);
      }
      else{
        // create new user with default setting and auto password
        var autoPassword = '1234'; // Fn.randomId(6);
        req.session.auto_password = autoPassword;
        console.log(autoPassword);
        Mailer.send_mail(email, 'auto_password', 'Welcome', {password: autoPassword}, function(err){
          if (!err){
            ctx.is_login = false;
            res.render('owner/create_room', ctx)
          }
          else {
            console.log('--------------- Mail Send Error ------------------');
            req.flash('message', 'fail send password mail, please try again or input correct mail address');
            res.redirect('/');
          }
        })
      }
    })
  }
};
