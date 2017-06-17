'use strict';

var path = require('path'),
    nodemailer = require('nodemailer'),
    config = require(path.resolve('./config/config')),
    tempie = require('tempie'),
    moment = require('moment'),
    fs = require('fs'),
    async = require('async');

var smtpTransport = nodemailer.createTransport(config.mailer.options);

exports.send_mail = function(toMail, template, subject, sendData, next){
    console.log('------- send mail :: ' + template);
    return next();

/*
    tempie.load("", sendData, function(err, mail_options){
        if(err)
        {
          console.log(mail_options);
          console.log(err);
          return;
        }
        console.log(mail_options);
        mail_options['to'] = toMail;
        mail_options['subject'] = subject;
        mail_options['from'] = config.mailer.from;
        smtpTransport.sendMail(mail_options, function(err, response){
            if (next)
                next(err);
        })
    })
    */
};


