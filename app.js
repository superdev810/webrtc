

var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose');
var http   			= require("http");
var https              = require("https");
var io     			= require("socket.io");
var easyrtc 		= require("easyrtc");

mongoose.connect(config.db.uri, config.db.options);
var db = mongoose.connection;
db.on('error', function(err){
  console.log(err);
  //throw new Error('unable to connect to database at ' + config.db);
});
/*
mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});
*/

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});
var app = express();

require('./config/express')(app, db, config);
//require('./config/passport')(app);

var httpServer = http.createServer(app).listen(config.port, function() {
  console.log('Express server listening on port ' + config.port);
});

var socketServer = io.listen(httpServer, {"log level" : 1});

// Start EasyRTC server
var rtc;
easyrtc.listen(app, socketServer, null, function(err, rtcObj){
  rtc = rtcObj;
});

var connectList = {};

easyrtc.events.on('connection', function(socketObj, easyrtcid, next){
  console.log("connection " + easyrtcid);
  connectList[easyrtcid] = true;
  easyrtc.events.emitDefault('connection', socketObj, easyrtcid, next);
});

easyrtc.events.on('disconnect', function(connectionObj, next){
  console.log("disconnect : " + connectionObj.getEasyrtcid());
  removeRoom(connectionObj, function(){
    easyrtc.events.emitDefault('disconnect', connectionObj, next);
  });
  //removeRoom(connectionObj.getEasyrtcid());
  //removeRoom(connectionObj);
});

var RoomMessages = mongoose.model('RoomMessage');
easyrtc.events.on("easyrtcMsg", function(connectionObj, msg, socketCallback, next) {
  console.log("********* message ***********");
  console.log(msg);
  if (msg.msgType == 'chat_message'){
    var newMsg = new RoomMessages({
      room_name: msg.targetRoom || msg.msgData.targetRoom,
      from_Id: connectionObj.getUsername(),
      to_Id: msg.msgData.targetName,
      text: msg.msgData.text
    });
    newMsg.save();
  }
/*
  if (msg.msgType == 'chat_message') {
    // save to db
    var newMsg = new Msg();
    newMsg.roomName = msg.targetRoom;
    newMsg.from = connectionObj.getUsername();
    newMsg.to = msg.msgData.targetName;
    if (msg.msgType == 'textmsg')
      newMsg.type = 0;
    else
      newMsg.type = 1;
    newMsg.msg = msg.msgData.text;
    newMsg.save(function(err) {
      if (err)
        throw err;
    });
  }
*/

  console.log("**************************");
  easyrtc.events.emitDefault("easyrtcMsg", connectionObj, msg, socketCallback, next);
});

function removeRoom(connectionObj, callback){
  console.log("********* disconnect ***********");
  callback();
/*
  var removeid = connectionObj.getEasyrtcid();
  connectList[removeid] = false;
  var Room = require('./models/room');
  Room.findOne({ownerip: removeid}, function(err, room){
    if (!err && room){
      setTimeout(function(){
        if (!connectList[removeid]) {
          delete connectList[removeid];
          var roomName = room.roomName;
          Room.remove(room, function (err) {
            if (err)
              console.log(err);
            else
              console.log("success remove " + roomName);
          });
          var msg = {
            targetRoom: roomName,
            msgType: "end-session",
            msgData: "good-bye"
          };
          easyrtc.events.emitDefault('easyrtcMsg', connectionObj, msg, callback, callback);
          //callback();
        }
      }, 500);
      //rtc.getAppWithEasyrtcid(removeid, function(err, appObj){
      //     appObj.getConnectionEasyrtcids(function (err, ids){
      //         for (var i=0; i<ids.length; i++){
      //             if (ids[i] != removeid){
      //                 var msg = {
      //                     msgType: "end-session",
      //                 msgData: "good-bye",
      //                 targetEasyrtcid: ids[i]};
      //                 easyrtc.events.emitDefault('easyrtcMsg', connectionObj, msg, function(err){}, function(err){});
      //             }
      //         }
      //         callback();
      //     });
      //});
      console.log("**************************");
    } else {
      callback();
    }
  });
*/
}
