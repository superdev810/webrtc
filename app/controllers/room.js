'use strict';

var mongoose = require('mongoose'),
  path = require('path'),
  validator = require('validator'),
  fs = require('fs'),
  upload = require('jquery-file-upload-middleware'),
  os = require('os');

var config = require(path.resolve('./config/config'));
var functions = require('./functions');
var Users = mongoose.model('User'),
  Rooms = mongoose.model('Room'),
  RoomFiles = mongoose.model('RoomFile'),
  RoomMessages = mongoose.model('RoomMessage');

var ErrorHandler = require('./errors.controller'),
  Fn = require('./functions'),
  Mailer = require('./mailer.controller'),
  AuthController = require('./auth');

var validate_name = function (room_name, cb) {
  if (!room_name)
    return cb({err: 1, message: 'empty room name'});
  room_name = room_name.trim();
  if (!room_name)
    return cb({err: 1, message: 'empty room name'});
  if (!validator.isAlphanumeric(room_name))
    return cb({err: 2, message: 'invalid room name'});
  Rooms.findOne({room_name: room_name}, function (err, result) {
    if (result)
      return cb({err: 3, message: 'already exist same room name'});
    else
      return cb({err: 0, message: 'valid'})
  })
};

exports.validate_name = function (req, res) {
  var room_name = req.body.room_name;
  validate_name(room_name, function (err) {
    res.send(err);
  })
};

var render_room_page = function (req, res) {
  var data = {
    creator: req.user._id,
    room_name: req.body.room_name,
    room_type: req.body.room_type,
    protected: req.body.is_protect,
    password: req.body.room_pass,
    users: [
      {
        Id: req.body.my_ID,
        role: 'creator',
        email: req.user.email,
        sex: req.user.sex,
        avatar: req.user.profileImageURL,
        address: req.user.address
      }
    ]
  };

  var new_room = new Rooms(data);
  new_room.save(function (err) {
    if (err)
      return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});

    res.send({redirectUrl: '/' + new_room.room_name});
  })
};

exports.confirm_room = function (req, res) {
  validate_name(req.body.room_name, function (valid) {
    if (valid.err != 0)
      return res.status(400).send(valid);
    if (req.user) {
      // render room page
      render_room_page(req, res);
    }
    else {
      // check password
      var req_pass = req.body.password;
      req.body.email = req.session.req_email;
      if (req.session.auto_password) {
        // sign up user
        if (req.session.auto_password != req_pass)
          return res.status(400).send({err: 4, message: 'not matched password, please try again.'});

        AuthController.sign_up(req, res, function (err, user) {
          if (err)
            res.status(400).send(err);
          else
            render_room_page(req, res);
        })
      }
      else {
        // sign in user
        AuthController.sign_in(req, res, function (err, user) {
          if (err)
            res.status(400).send(err);
          else
            render_room_page(req, res);
        })
      }
    }
  })
};

var detect_room_type = function (req, res, room_name, cb) {
  console.log(req);
  if (req.user) {
    Rooms.findOne({room_name: room_name}, function (err, result) {
      if (err || !result)
        cb(true);
      else {
        cb(null, result.room_type);
      }
    })
  }
  else
    cb(true);
};

var detect_creator = function (req, res, room_name, cb) {
  if (req.user) {
    Rooms.findOne({room_name: room_name, creator: req.user._id}, function (err, result) {
      if (err || !result)
        cb(true);
      else {
        cb(null, result.users[0]);
      }
    })
  }
  else
    cb(true);
};

var detect_owner = function (req, res, room_name, cb) {
  if (req.user) {
    Rooms.findOne({room_name: room_name}, function (err, result) {
      if (err || !result)
        cb(true);
      else {
        for (var i = 0; i < result.users.length; i++) {
          if (result.users[i].email == req.user.email && result.users[i].role == 'owner') {
            return cb(null, result.users[i]);
          }
        }
        cb(true);
      }
    })
  }
  else
    cb(true);
};

var detect_inviter = function (req, res, room_name, cb) {
  if (req.session.inviter) {
    Rooms.findOne({room_name: room_name}, function (err, result) {
      if (err || !result)
        cb(true);
      else {
        for (var i = 0; i < result.users.length; i++) {
          if (result.users[i].email == req.session.inviter.email) {
            return cb(null, result.users[i]);
          }
        }
      }
    })
  }
  else
    cb(true);
};

exports.enter_room = function (req, res) {
  // should check creator/member, room_type, req.user etc..
  console.log('----------enter room-------');
  //console.log(req);
  var room_name = req.params.room_name;
  console.log(room_name);
  var messages = [];
  detect_room_type(req, res, room_name, function (err, room_type) {
    console.log(room_type);
    if (err) {
      // return res.status(400).send({message: 'no exist room'});
      // return res.redirect('/');

      /*
       ===================== function for detect token from moximo server using client ip address
       */
      var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
      /* dummy data */
      ip = 'member-test-ip';
      Users.findOne({ip_address: ip}, function (err, result) {
        if (!err && result) {
          // request to moximo server for detect email and token : {email: result.email, token: result.password}
          req.body = {
            email: result.email,
            password: result.password
          };
          AuthController.sign_in(req, res, function (err, user) {
            //if (err)
            //  return res.redirect('http://moximo.com');
            req.session.invite_room_name = room_name;
            req.session.inviter = user;
            res.redirect('/user-setting');
          })
        }
        else {
          // redirect to moximo site
          res.redirect(config.mainServer);
        }
      });
    } else if (room_type == 'meeting') {
      detect_creator(req, res, room_name, function (err, creator_data) {
        if (err) {
          detect_owner(req, res, room_name, function (err, owner_data) {
            if (err) {
              detect_inviter(req, res, room_name, function (err, inviter_data) {
                if (err) {

                  /*
                   ===================== function for detect token from moximo server using client ip address
                   */
                  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                  /* dummy data */
                  ip = 'member-test-ip';
                  Users.findOne({ip_address: ip}, function (err, result) {
                    if (!err && result) {
                      // request to moximo server for detect email and token : {email: result.email, token: result.password}
                      req.body = {
                        email: result.email,
                        password: result.password
                      };
                      AuthController.sign_in(req, res, function (err, user) {
                        //if (err)
                        //  return res.redirect('http://moximo.com');
                        req.session.invite_room_name = room_name;
                        req.session.inviter = user;
                        res.redirect('/user-setting');
                      })
                    }
                    else {
                      // redirect to moximo site
                      res.redirect(config.mainServer);
                    }
                  });
                }
                else {
                  console.log("-----------Detected Member----------------");
                  console.log(inviter_data);
                  // render room page using inviter data
                  RoomMessages.find({
                    room_name: room_name,
                    $or: [{from_Id: inviter_data.Id}, {to_Id: inviter_data.Id}, {to_Id: 'public'}]
                  }, function (err, result) {
                    messages = result || [];
                    console.log(inviter_data);
                    res.render('member/meeting/index', {
                      title: config.app.title,
                      room_name: room_name,
                      my_data: inviter_data,
                      messages: messages
                    });
                  })
                }
              })
            } else {
              console.log("-----------Detected Owner----------------");
              console.log(owner_data);
              // render room page using owner data
              RoomMessages.find({
                room_name: room_name,
                $or: [{from_Id: owner_data.Id}, {to_Id: owner_data.Id}, {to_Id: 'public'}]
              }, {}, {$sort: 'created'}, function (err, result) {
                messages = result || [];
                res.render('owner/meeting/index', {
                  title: config.app.title,
                  room_name: room_name,
                  my_data: owner_data,
                  messages: messages
                });
              })
            }
          })
        } else {
          console.log("-----------Detected Creator----------------");
          console.log(creator_data);
          // render room page using owner data
          RoomMessages.find({
            room_name: room_name,
            $or: [{from_Id: creator_data.Id}, {to_Id: creator_data.Id}, {to_Id: 'public'}]
          }, {}, {$sort: 'created'}, function (err, result) {
            messages = result || [];
            res.render('owner/meeting/index', {
              title: config.app.title,
              room_name: room_name,
              my_data: creator_data,
              messages: messages
            });
          })
        }
      })
    } else if (room_type == 'lesson') {
      console.log(req.user);
      detect_creator(req, res, room_name, function (err, creator_data) {
        if (err) {
          detect_owner(req, res, room_name, function (err, owner_data) {
            if (err) {
              detect_inviter(req, res, room_name, function (err, inviter_data) {
                if (err) {

                  /*
                   ===================== function for detect token from moximo server using client ip address
                   */
                  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                  /* dummy data */
                  ip = 'member-test-ip';
                  Users.findOne({ip_address: ip}, function (err, result) {
                    if (!err && result) {
                      // request to moximo server for detect email and token : {email: result.email, token: result.password}
                      req.body = {
                        email: result.email,
                        password: result.password
                      };
                      AuthController.sign_in(req, res, function (err, user) {
                        //if (err)
                        //  return res.redirect('http://moximo.com');
                        req.session.invite_room_name = room_name;
                        req.session.inviter = user;
                        res.redirect('/user-setting');
                      })
                    }
                    else {
                      // redirect to moximo site
                      res.redirect(config.mainServer);
                    }
                  });
                }
                else {
                  console.log("-----------Detected Member----------------");
                  console.log(inviter_data);
                  // render room page using inviter data
                  RoomMessages.find({
                    room_name: room_name,
                    $or: [{from_Id: inviter_data.Id}, {to_Id: inviter_data.Id}, {to_Id: 'public'}]
                  }, function (err, result) {
                    messages = result || [];
                    console.log(inviter_data);
                    res.render('member/lesson/index', {
                      title: config.app.title,
                      room_name: room_name,
                      my_data: inviter_data,
                      messages: messages
                    });
                  })
                }
              })
            } else {
              console.log("-----------Detected Owner----------------");
              console.log(owner_data);
              // render room page using owner data
              RoomMessages.find({
                room_name: room_name,
                $or: [{from_Id: owner_data.Id}, {to_Id: owner_data.Id}, {to_Id: 'public'}]
              }, {}, {$sort: 'created'}, function (err, result) {
                messages = result || [];
                res.render('owner/lesson/index', {
                  title: config.app.title,
                  room_name: room_name,
                  my_data: owner_data,
                  messages: messages
                });
              })
            }
          })
        } else {
          console.log("-----------Detected Creator----------------");
          console.log(creator_data);
          // render room page using owner data
          RoomMessages.find({
            room_name: room_name,
            $or: [{from_Id: creator_data.Id}, {to_Id: creator_data.Id}, {to_Id: 'public'}]
          }, {}, {$sort: 'created'}, function (err, result) {
            messages = result || [];
            res.render('owner/lesson/index', {
              title: config.app.title,
              room_name: room_name,
              my_data: creator_data,
              messages: messages
            });
          })
        }
      })
    } else if (room_type == 'couple') {
      console.log(req.user);
      detect_creator(req, res, room_name, function (err, creator_data) {
        if (err) {
          detect_owner(req, res, room_name, function (err, owner_data) {
            if (err) {
              detect_inviter(req, res, room_name, function (err, inviter_data) {
                if (err) {

                  /*
                   ===================== function for detect token from moximo server using client ip address
                   */
                  var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
                  /* dummy data */
                  ip = 'member-test-ip';
                  Users.findOne({ip_address: ip}, function (err, result) {
                    if (!err && result) {
                      // request to moximo server for detect email and token : {email: result.email, token: result.password}
                      req.body = {
                        email: result.email,
                        password: result.password
                      };
                      AuthController.sign_in(req, res, function (err, user) {
                        //if (err)
                        //  return res.redirect('http://moximo.com');
                        req.session.invite_room_name = room_name;
                        req.session.inviter = user;
                        res.redirect('/user-setting');
                      })
                    }
                    else {
                      // redirect to moximo site
                      res.redirect(config.mainServer);
                    }
                  });
                }
                else {
                  console.log("-----------Detected Member----------------");
                  console.log(inviter_data);
                  if(!inviter_data.Id)
                  {
                    AuthController.sign_in(req, res, function (err, user) {
                      //if (err)
                      //  return res.redirect('http://moximo.com');
                      req.session.invite_room_name = room_name;
                      req.session.inviter = user;
                      res.redirect('/user-setting');
                    })
                  }

                  // render room page using inviter data
                  RoomMessages.find({
                    room_name: room_name,
                    $or: [{from_Id: inviter_data.Id}, {to_Id: inviter_data.Id}, {to_Id: 'public'}]
                  }, function (err, result) {
                    messages = result || [];
                    console.log(inviter_data);
                    res.render('member/couple/index', {
                      title: config.app.title,
                      room_name: room_name,
                      my_data: inviter_data,
                      messages: messages
                    });
                  })
                }
              })
            } else {
              console.log("-----------Detected Owner----------------");
              console.log(owner_data);
              // render room page using owner data
              RoomMessages.find({
                room_name: room_name,
                $or: [{from_Id: owner_data.Id}, {to_Id: owner_data.Id}, {to_Id: 'public'}]
              }, {}, {$sort: 'created'}, function (err, result) {
                messages = result || [];
                res.render('owner/couple/index', {
                  title: config.app.title,
                  room_name: room_name,
                  my_data: owner_data,
                  messages: messages
                });
              })
            }
          })
        } else {
          console.log("-----------Detected Creator----------------");
          console.log(creator_data);
          // render room page using owner data
          RoomMessages.find({
            room_name: room_name,
            $or: [{from_Id: creator_data.Id}, {to_Id: creator_data.Id}, {to_Id: 'public'}]
          }, {}, {$sort: 'created'}, function (err, result) {
            messages = result || [];
            res.render('owner/couple/index', {
              title: config.app.title,
              room_name: room_name,
              my_data: creator_data,
              messages: messages
            });
          })
        }
      })
    } else if (room_type == 'free') {
      detect_inviter(req, res, room_name, function (err, inviter_data) {
        if (err) {
          /*
           ===================== function for detect token from moximo server using client ip address
           */
          var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
          /* dummy data */
          ip = 'member-test-ip';
          Users.findOne({ip_address: ip}, function (err, result) {
            if (!err && result) {
              // request to moximo server for detect email and token : {email: result.email, token: result.password}
              req.body = {
                email: result.email,
                password: result.password
              };
              AuthController.sign_in(req, res, function (err, user) {
                //if (err)
                //  return res.redirect('http://moximo.com');
                req.session.invite_room_name = room_name;
                req.session.inviter = user;
                res.redirect('/user-setting');
              })
            }
            else {
              // redirect to moximo site
              res.redirect(config.mainServer);
            }
          });
        }
        else {
          console.log("-----------Detected Member----------------");
          console.log(inviter_data);
          if(!inviter_data.Id)
          {
            AuthController.sign_in(req, res, function (err, user) {
              //if (err)
              //  return res.redirect('http://moximo.com');
              req.session.invite_room_name = room_name;
              req.session.inviter = user;
              res.redirect('/user-setting');
            })
          }

          // render room page using inviter data
          RoomMessages.find({
            room_name: room_name,
            $or: [{from_Id: inviter_data.Id}, {to_Id: inviter_data.Id}, {to_Id: 'public'}]
          }, function (err, result) {
            messages = result || [];
            console.log(inviter_data);
            res.render('owner/free/index', {
              title: config.app.title,
              room_name: room_name,
              my_data: inviter_data,
              messages: messages
            });
          })
        }
      })
    }
  })
};


/*
 exports.invite_room = function(req, res){
 console.log('----------invite room -------');
 var invite_room_name = req.session.invite_room_name;
 if (!invite_room_name)
 return res.redirect('/');
 Rooms.findOne({room_name: invite_room_name}, function(err, room_data){
 if (!err && room_data){
 res.render('member/invite_room', {title: config.app.title, is_protected: room_data.protected, user: req.user});
 }
 else {
 req.flash('message', 'no exist invited room');
 res.redirect('/');
 }
 })
 };

 exports.detect_inviter_setting = function(req, res){
 var invite_room_name = req.session.invite_room_name;
 if (!invite_room_name)
 return res.redirect('/');
 if (!req.body.email)
 return res.status(400).send({message: 'mail address is required.'});
 var email = req.body.email.toLowerCase();
 Rooms.findOne({room_name: invite_room_name}, function(err, room_data){
 if (!err && room_data){
 if (room_data.protected && room_data.password != req.body.password)
 return res.status(400).send({message: 'invalid password'});
 var isDetect = false;
 for (var i=0; i<room_data.users.length; i++){
 if (room_data.users[i].email == email){
 isDetect = true;
 break;
 }
 }
 if (isDetect){
 req.session.inviter = {email: email};
 res.send({redirectUrl: '/user-setting'});
 }
 else
 res.status(400).send({message: 'invalid user'});
 }
 else {
 req.flash('message', 'no exist invited room');
 res.redirect('/');
 }
 })
 };
 */

exports.inviter_user_setting = function (req, res) {
  if (req.session.invite_room_name)
    res.render('member/user_setting', {title: config.app.title, user: req.session.inviter});
  else
    res.redirect('/');
};

exports.confirm_inviter_setting = function (req, res) {
  var invite_room_name = req.session.invite_room_name;
  if (!invite_room_name || !req.session.inviter)
    return res.status(400).send({message: 'invalid request'});
  Rooms.findOne({room_name: invite_room_name}, function (err, room_data) {
    if (!err && room_data) {
      for (var i = 0; i < room_data.users.length; i++) {
        if (room_data.users[i].email == req.session.inviter.email) {
          room_data.users[i]['avatar'] = req.body.avatar;
          room_data.users[i]['Id'] = req.body.my_ID;
          room_data.users[i]['sex'] = req.body.my_sex;
          room_data.users[i]['address'] = req.body.my_address;
          break;
        }
      }
      room_data.save(function (err) {
        if (err)
          return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
        res.send({redirectUrl: '/' + invite_room_name});
      })
    }
    else {
      res.status(400).send({message: 'no exist invited room'});
    }
  })

};

exports.change_owner_page = function (req, res) {
  console.log('--------Change Owner----------');
  var room_name = req.query.room_name,
    user_email = req.query.user_email;
  var owner_data;
  console.log(req.query);

  Rooms.findOne({room_name: room_name}, function (err, room) {
    console.log(room);
    if (err)
      return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
    if (!room)
      return res.status(400).send({message: 'mistake room name or not creator'});
    console.log(room);

    for (var i = 0; i < room.users.length; i++) {
      if (room.users[i].role == 'owner') {
        room.users[i].role = 'member';
        owner_data = room.users[i];
      }
      if (room.users[i].email == user_email) {
        room.users[i].role = 'owner';
      }
    }
    room.save(function (err) {
      if (err)
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      // res.redirect('/'+room_name);
      res.redirect('/');
    })
  })
}

exports.change_owner = function (req, res) {
  console.log('--------Change Owner----------');
  var room_name = req.body.room_name,
    user_email = req.body.user_email;
  var owner_data;
  console.log(req.body);

  Rooms.findOne({room_name: room_name}, function (err, room) {
    console.log(room);
    if (err)
      return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
    if (!room)
      return res.status(400).send({message: 'mistake room name or not creator'});
    console.log(room);

    for (var i = 0; i < room.users.length; i++) {
      if (room.users[i].role == 'owner') {
        room.users[i].role = 'member';
        owner_data = room.users[i];
      }
      if (room.users[i].email == user_email) {
        room.users[i].role = 'owner';
      }
    }
    room.save(function (err) {
      if (err)
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      res.send({redirectURL: '/' + room_name});
    })
  })
}

exports.refuse_owner = function (req, res) {
  console.log('--------Change Owner----------');
  var room_name = req.body.room_name,
    user_email = req.body.user_email;
  var owner_data;
  console.log(req.body);

  Rooms.findOne({room_name: room_name}, function (err, room) {
    console.log(room);
    if (err)
      return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
    if (!room)
      return res.status(400).send({message: 'mistake room name or not creator'});
    console.log(room);

    for (var i = 0; i < room.users.length; i++) {
      if (room.users[i].role == 'owner') {
        room.users[i].role = 'member';
        owner_data = room.users[i];
      }
      if (room.users[i].email == user_email) {
        room.users[i].role = 'member';
      }
    }
    room.save(function (err) {
      if (err)
        return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
      res.send({redirectURL: '/' + room_name});
    })
  })
}

exports.send_invite = function (req, res) {
  console.log('--------send invite message-------');
  var room_name = req.body.room_name,
    inviters = req.body.inviters,
    comment = req.body.comment || '';
  var successUsers = [],
    failUsers = [];
  console.log(room_name);
  console.log(inviters);
  if (!room_name)
    return res.status(400).send({message: 'room name is required'});
  if (!inviters || !inviters.length)
    return res.status(400).send({message: 'empty inviter list.'});

  Rooms.findOne({room_name: room_name, creator: req.user._id}, function (err, room) {
    if (err)
      return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
    if (!room)
      return res.status(400).send({message: 'mistake room name or not creator'});

    var add_members_to_room = function () {
      for (var i = 0; i < successUsers.length; i++) {
        var isInvited = false;
        for (var j = 0; j < room.users.length; j++) {
          if (room.users[j].email == successUsers[i]) {
            isInvited = true;
            break;
          }
        }
        if (!isInvited)
          room.users.push({
            email: successUsers[i],
            role: 'member'
          });
      }
      room.save(function (err) {
        if (err)
          return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
        res.send({successUsers: successUsers, failUsers: failUsers});
      })
    };

    /*
     ============= should be included function for post inviters to moximo server
     */
    successUsers = inviters;
    add_members_to_room();

    /*
     var send_invite_mail = function(index){
     if (index >= inviters.length){
     return add_members_to_room();
     }
     var sendData = {
     url: req.protocol + '://' + req.headers.host + '/' + room_name, //os.hostname() + '/' + room_name,
     password: room.password,
     comment: comment
     };
     console.log(sendData);
     Mailer.send_mail(inviters[index],'invite_user', 'Invite Chatting', sendData, function(err){
     if (err)
     failUsers.push(inviters[index]);
     else
     successUsers.push(inviters[index]);
     send_invite_mail(index+1);
     })
     };

     send_invite_mail(0);
     */
  })
};

exports.get_room_files = function (req, res, next) {
  var query = req.query.params || {};
  console.log(req.user);
  RoomFiles.find(query, function (err, result) {
    // next(err, result);
    if (err) {
      return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
    } else {
      console.log(result);
      res.status(200).json(result);
    }
  })
};

upload.on("end", function (fileinfo, req, res) {
  if (req.route.path == "/room-api/share-files" && req.route.methods.post == true) {
    var user = req.user;
    console.log("----------Upload Complete-----------");
    console.log(fileinfo);
    var formData = req.fields || {};
    if(formData.share_type == 'whiteboard') {
      var file_path = path.resolve("./public/uploads/" + file_name);
      functions.mkFile(file_path, data);
      res.json({wbData: "aaa" });
    } else if (user) {
      var file_entry = {
        room_id: formData.room_id || "abc",
        title: formData.file_name || fileinfo.name,
        file_name: fileinfo.name,
        url: fileinfo.url,
        share_type: formData.share_type || "other",
        uploader: formData.uploader || user._id
      };
      console.log(formData);
      var entry = new RoomFiles(file_entry);
      entry.save();
    }
  }
});

exports.add_new_file = function (req, res, next) {

  var uploadParams = {
    uploadDir: './public/uploads',
    uploadUrl: '/uploads',
    maxPostSize: 110000000, // 110 MB
    maxFileSize: 100000000, // 100 MB
  };
  var user = req.user;
  if (user) {
    upload.fileHandler(uploadParams)(req, res, next);
    console.log("-----------------------uploaded---------------------");
  } else {
    res.redirect("/");
  }
};

exports.remove_room_file = function (req, res, next) {
  var srcUrl = req.body.url;
  console.log(srcUrl);
  var uploadParams = {
    uploadDir: './public/uploads',
    uploadUrl: '/uploads',
    maxPostSize: 110000000, // 110 MB
    maxFileSize: 100000000, // 100 MB
  };
  RoomFiles.findOne({url: srcUrl}, function (err, result) {
    if (err) {
      res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
    } else {
      fs.unlink(path.normalize("./public/uploads/" + result.file_name), function (err) {
        if (err) {
          res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
        } else {
          RoomFiles.findOneAndRemove({url: srcUrl}, function (err, result) {
            if (err) {
              res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
            } else {
              res.json({message: "Successfully deleted"});
            }
          });
        }
      })
    }
  });
};

exports.download_room_file = function (req, res, next) {
  var srcUrl = req.query.params.url || '////////////';
  console.log(srcUrl);
  var index = srcUrl.indexOf("/uploads/");
  var file_path = srcUrl.substr(index);
  file_path = file_path.replace('//', '/');
  res.sendFile(file_path);
};

exports.whiteboard_upload = function(req, res) {
  var data = req.body.data;
  console.log(data);
  if (data) {
    var now = new Date();
    var file_name = "" + now.getFullYear() + now.getMonth() + now.getDate() + now.getHours() + now.getMinutes() + now.getSeconds() + ".wbd";
    var file_path = path.resolve("./public/uploads/whiteboard/" + file_name);
    functions.mkFile(file_path, data);
    return res.json({
      url: "/uploads/whiteboard/" + file_name,
      file_name: file_name
    });
  } else {
    return res.status(403).json({
      message: "Invalid Data"
    });
  }
}

exports.whiteboard_read = function(req, res) {
  var file_name = req.body.file_name;
  if (file_name) {
    var file_path = path.resolve("./public/uploads/" + file_name);
    var wbData = functions.readFile(file_path);
    res.json({
      wbData: JSON.parse(wbData)
    });
    functions.removeFile(file_path);
  } else {
    return res.status(403).json({
      message: "Invalid Data"
    });
  }
}

exports.postFile = function(req, res) {
  console.log("---------------image upload-----------------");
}
