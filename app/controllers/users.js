'use strict';
var mongoose = require('mongoose'),
  path = require('path'),
  fs = require('fs'),
  upload = require('jquery-file-upload-middleware');

var config = require(path.resolve('./config/config'));

var Users = mongoose.model('User');
var Rooms = mongoose.model('Room');
var errorHandler = require('./errors.controller');
var mailer = require('./mailer.controller');
var functions = require('./functions');

exports.sign_in = function (req, res) {
  res.render('users/signin', {title: config.app.title});
};

exports.my_page_profile = function (req, res) {
  if (req.user)
    res.render('users/my_page/index.ejs', {title: config.app.title, user: req.user});
  else {
    res.redirect('/users/sign_in');
  }
};

exports.update_my_profile = function (req, res, next) {

  if (req.body != {}) {
    console.log(req.body);
    var user = Users(req.user);
    user.address = req.body.my_ID;
    user.profileImageURL = req.body.avatar;
    user.sex = req.body.my_sex;
    user.save(function (err) {
      if (err)
        res.status(400).send({message: errorHandler.getErrorMessage(err)})
      res.json(user);
    })
  } else {
    res.status(400).send({
      message: 'Params is missing'
    });
  }
};

exports.my_page_room_manage = function (req, res) {
  if (req.user) {
    Rooms.find({creator: req.user._id}, function (err, rooms) {
      if (err)
        return res.status(400).send({message: errorHandler.getErrorMessage(err)})
      res.render('users/my_page/room_manage.ejs', {title: config.app.title, rooms: rooms});
    })
  } else {
    res.redirect('/users/sign_in');
  }
};

exports.remove_room = function (req, res) {
  if (req.body != {}) {
    var room = Rooms(req.body);
    Rooms.findOneAndRemove({room_name: req.body.room_name}, function (err) {
      if (err)
        return res.status(400).send({message: errorHandler.getErrorMessage(err)})
      res.json({message: 'Successfully Removed'});
    })
  } else {
    res.redirect('/users/sign_in');
  }
};
exports.my_page_friend_manage = function (req, res) {
  if (req.user) {
    var friends = [];
    Rooms.find({creator: req.user._id}, function (err, rooms) {
      if (err)
        return res.status(400).send({message: errorHandler.getErrorMessage(err)})

      for (var i = 0; i < rooms.length; i++) {
        for (var j = 0; j < rooms[i].users.length; j++) {
          if (rooms[i].users[j].role != 'creator') {
            if (!isExist(friends, rooms[i].users[j])) {
              friends.push(rooms[i].users[j]);
            }
          }
        }
      }

      res.render('users/my_page/friend_manage.ejs', {title: config.app.title, friends: friends});
    })
  } else {
    res.redirect('/users/sign_in');
  }
};
var isExist = function (array_val, search_item) {
  for (var i = 0; i < array_val.length; i++) {
    if (array_val[i].email == search_item.email) {
      return true;
      break;
    }
  }
  return false;
}

exports.save_friend = function (req, res) {
  if (req.user) {
    if (req.body != {}) {
      var friends = [];
      if (req.body.userId == '') {
        Rooms.findOne({users: {$elemMatch: {email: req.body.email}}}, function (err, room) {
          if (err)
            return res.status(400).send({message: errorHandler.getErrorMessage(err)})
          if (room) {
            return res.status(400).send({message: 'User Email is already exist'});
          } else {
            Rooms.find({creator: req.user._id}, function (err, rooms) {
              if (err)
                return res.status(400).send({message: errorHandler.getErrorMessage(err)})
              console.log(rooms);
              if (!rooms)
                return res.status(400).send({message: 'There is no rooms by your email'});
              for (var i = 0; i < rooms.length; i++) {
                var room = Rooms(rooms[i]);
                room.users.push({
                  email: req.body.email,
                  Id: req.body.Id,
                  role: 'member'
                })
                room.save(function (err) {
                  if (err)
                    return res.status(400).send({message: errorHandler.getErrorMessage(err)})
                })
              }
            })
            return res.send({message: 'Success'});
          }
        })
      } else {
        Rooms.findOne({users: {$elemMatch: {_id: req.body.userId}}}, function (err, room) {
          if (err)
            return res.status(400).send({message: errorHandler.getErrorMessage(err)})
          for (var k = 0; k < room.users.length; k++) {
            if (room.users[k]._id == req.body.userId) {
              room.users[k].email = req.body.email;
              room.users[k].Id = req.body.Id;
            }
          }
          room.save(function (err) {
            if (err)
              return res.status(400).send({message: errorHandler.getErrorMessage(err)})
            res.json({message: 'Successfully Updated'});
          })

        })
      }
    } else {
      res.status(400).send({message: 'Params is missing'})
    }

  } else {
    res.redirect('/users/sign_in');
  }
};

exports.delete_friend = function (req, res) {
  if (req.user) {
    if (req.body != {}) {
      var friends = req.body.friend_email;
      console.log(friends);
      Rooms.find({creator: req.user._id}, function (err, rooms) {
        if (err)
          return res.status(400).send({message: errorHandler.getErrorMessage(err)})
        console.log(rooms);
        if (!rooms)
          return res.status(400).send({message: 'There is no rooms by your email'});
        for (var i = 0; i < rooms.length; i++) {
          var room = Rooms(rooms[i]);
          for(var k=0; k<room.users.length; k++){
            for(var f=0; f<friends.length; f++){
              if(room.users[k].email == friends[f]){
                room.users.splice(k, 1);
              }
            }

          }
          console.log(room.users);
          room.save(function (err) {
            if (err)
              return res.status(400).send({message: errorHandler.getErrorMessage(err)})
          })
        }
        res.json({message: 'Successfully Deleted'});
      })
    } else {
      res.status(400).send({message: 'Params is missing'})
    }
  } else {
    res.redirect('/users/sign_in');
  }
};

exports.uploadAvatar = function (req, res, next) {

  // var user = req.session.inviter;
  var user = req.user;
  var message = null;
  console.log(req);
  if (user) {
    upload.fileHandler(config.uploads.profileUpload)(req, res, next);
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

exports.create_free_video = function(req, res, next) {
  var friends = req.body.friends || [];
  var data = {
    creator: req.user._id,
    room_name: functions.randomId(16),
    room_type: "free",
    users: [
      {
        role: 'creator',
        email: req.user.email,
        sex: req.user.sex,
        avatar: req.user.profileImageURL,
        address: req.user.address
      }
    ]
  };
  for (var i = 0; i < friends.length; i++) {
    data.users.push({
      Id: friends[i].Id,
      email: friends[i].email,
      role: "member"
    });
  }
  var free_room = new Rooms(data);
  console.log(free_room);
  free_room.save(function(err) {
    if (err)
      return res.status(400).send({message: ErrorHandler.getErrorMessage(err)});
    for (var i = 0; i < friends.length; i++) {
    //  send email to the friend
    }
    res.status(200).send({redirectUrl: '/free/' + free_room.room_name});
  })
};
/*
 exports.changeProfilePicture = function (req, res) {
 var user = req.user;
 var message = null;
 var upload = multer(config.uploads.profileUpload).single('newProfilePicture');
 var profileUploadFileFilter = function (req, file, cb) {
 if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/gif') {
 return cb(new Error('Only image files are allowed!'), false);
 }
 cb(null, true);
 };

 // Filtering to upload only images
 upload.fileFilter = profileUploadFileFilter;

 if (user) {
 upload(req, res, function (uploadError) {
 if(uploadError) {
 return res.status(400).send({
 message: 'Error occurred while uploading profile picture'
 });
 } else {
 user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;

 user.save(function (saveError) {
 if (saveError) {
 return res.status(400).send({
 message: errorHandler.getErrorMessage(saveError)
 });
 } else {
 req.login(user, function (err) {
 if (err) {
 res.status(400).send(err);
 } else {
 res.json(user);
 }
 });
 }
 });
 }
 });
 } else {
 res.status(400).send({
 message: 'User is not signed in'
 });
 }
 };
 */
