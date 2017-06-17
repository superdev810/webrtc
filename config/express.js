var express = require('express');
var glob = require('glob');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var flash    		= require('connect-flash');
var session			= require('express-session');
var mongoStore      = require('connect-mongo')({
  session: session});
var sharejs			= require('share').server;

module.exports = function(app, db, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  app.set('views', config.root + '/app/views');
  app.set('view engine', 'ejs');

  app.use(favicon(config.root + '/public/img/favicon.png'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  //app.use(compress());

  app.use('/', express.static(path.resolve('./public')));
  app.use('/easyrtc', express.static(path.resolve('./node_modules/easyrtc/api')));
  //app.use(express.static(config.root + '/public'));
  //app.use(express.static(path.join(__dirname, 'public')));

  app.use(methodOverride());
  app.use(flash());

  var memoryStore     = new mongoStore({
    mongooseConnection: db
  });
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    store: memoryStore,
    cookie: config.sessionCookie,
    name: config.sessionName
  }));

  var passport = require('./passport')(app);

  /**
   * @desc enable sharejs for whiteboard
   */
  sharejs.attach(app, {db: {type: 'none'}});

  var routers = glob.sync(config.root + '/app/routes/**/*.js');
  routers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  if(app.get('env') === 'development'){
    app.use(function (err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err,
        title: 'error'
      });
    });
  }

  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
      });
  });

};
