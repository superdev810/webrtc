//init easyrtc
var needToCallOtherUsers = false;
var maxUserNum = 10;
var users = [];
var formerOwner = {};
var myRole = 'creator';
var isConnected = false;

//return;

function fix_height(user_count) {
  var border_width = 3;
  var win_width = $('.free-humans-bar-top').width();
  var win_height = $('.free-humans-bar-top').height();
  var content_height = $('.free-humans-bar').height();
  $('.free-humans-bar').css('top', (win_height - content_height) / 2);
  var fix_width = 0;
  var margin_lr = 0;
  var fix_measure = win_height > win_width ? win_width : win_height;
  var height_flag = win_height < win_width ? true : false;
  switch (user_count) {
    case 2:

      break;
    case 3:
      height_flag = (win_width - 20) / 2 > (win_height - 20) / 2 ? true : false;
      if(height_flag){
        fix_width = (win_height - 20)/ 2;
        margin_lr = (win_width - (2 * fix_width)) / 8;
      }else{
        fix_width = (win_width - 20 - (border_width * 2 * 2))/ 2;
        margin_lr = 5;
      }
      add_layout_effect(fix_width, margin_lr);
      $('.free-humans-bar').css('top', (win_height - (fix_width * 2)) / 2);
      break;
    case 4:
      height_flag = (win_width - 20) / 2 > (win_height - 20) / 2 ? true : false;
      if(height_flag){
        fix_width = (win_height - 20)/ 2;
        margin_lr = (win_width - (2 * fix_width)) / 8;
      }else{
        fix_width = (win_width - 20 - (border_width * 2 * 2))/ 2;
        margin_lr = 5;
      }
      add_layout_effect(fix_width, margin_lr);
      $('.free-humans-bar').css('top', (win_height - (fix_width * 2)) / 2);
      break;
    case 5:
      height_flag = (win_width - 30) / 3 > (win_height - 20) /2 ? true : false;
      if(height_flag){
        fix_width = (win_height - 20)/ 2;
        margin_lr = (win_width - (3 * fix_width)) / 12;
      }else{
        fix_width = (win_width - 30 - (border_width * 2 * 3))/ 3;
        margin_lr = 5;
      }
      add_layout_effect(fix_width, margin_lr);
      $('.free-humans-bar').css('top', (win_height - (fix_width * 2)) / 2);
      break;
    case 6:
      height_flag = (win_width - 30) / 3 > (win_height - 20) /2 ? true : false;
      if(height_flag){
        fix_width = (win_height - 20)/ 2;
        margin_lr = (win_width - (3 * fix_width)) / 12;
      }else{
        fix_width = (win_width - 30 - (border_width * 2 * 3))/ 3;
        margin_lr = 5;
      }
      add_layout_effect(fix_width, margin_lr);
      $('.free-humans-bar').css('top', (win_height - (fix_width * 2)) / 2);
      break;
    case 7:
      height_flag = (win_width - 40) / 4 > (win_height - 20) /2 ? true : false;
      if(height_flag){
        fix_width = (win_height - 20)/ 2;
        margin_lr = (win_width - (4 * fix_width)) / 16;
      }else{
        fix_width = (win_width - 40 - (border_width * 2 * 4))/ 4;
        margin_lr = 3;
      }
      add_layout_effect(fix_width, margin_lr);
      $('.free-humans-bar').css('top', (win_height - (fix_width * 2)) / 2);
      break;
    case 8:
      height_flag = (win_width - 40) / 4 > (win_height - 20) /2 ? true : false;
      if(height_flag){
        fix_width = (win_height - 20)/ 2;
        margin_lr = (win_width - (4 * fix_width)) / 16;
      }else{
        fix_width = (win_width - 40 - (border_width * 2 * 4))/ 4;
        margin_lr = 2;
      }
      add_layout_effect(fix_width, margin_lr);
      $('.free-humans-bar').css('top', (win_height - (fix_width * 2)) / 2);
      break;
    default:
      break;
  }

}

function add_layout_effect(fix_width, margin_lr) {

  $('.free-human').each(function (index, human) {
    // var width = $(human).width();
    $(human).height(fix_width);
    $(human).width(fix_width);
    $(human).css('margin-left', margin_lr);
    $(human).css('margin-right', margin_lr);
    // $(human).removeClass();
    // $(human).addClass('free-human');
    // $(human).addClass(layout);
  });
}
/**
 * init easyrtc
 */
function init_easyrtc() {
  /*
   var localFilter = easyrtc.buildLocalSdpFilter( {
   audioRecvBitrate: 128//, videoRecvBitrate:30
   });
   var remoteFilter = easyrtc.buildRemoteSdpFilter({
   audioSendBitrate: 128//, videoSendBitrate:30
   });
   easyrtc.setSdpFilters(localFilter, remoteFilter);
   */

  easyrtc.dontAddCloseButtons(false);
  easyrtc.setUsername(my_data.Id);
  easyrtc.setApplicationName('moximo');
  easyrtc.setRoomOccupantListener(convertList);
  easyrtc.setRoomEntryListener(function (entry, roomname) {
    needToCallOtherUsers = true;
  });

  fix_height();
  /**
   *connect easyrtc
   */
  isConnected = false;
  easyrtc.connect('VideoConf',
    function () {
      //success connect
      function init_media_source(cb) {
        easyrtc.initMediaSource(
          function (mediastream) {
            cb(true, mediastream);
          }, function (errorCode, errorText) {
            cb(false);
          }
        );
      }

      init_media_source(function (successed, mediastream) {
        if (successed) {
          console.log('------ ::: v - ok, a - ok');
          easyrtc.setVideoObjectSrc(selfVideo[0], mediastream);
          joinARoom();
        } else {
          console.log('------ ::: v - bad');
          easyrtc.enableVideo(false);
          init_media_source(function (successed, mediastream) {
            if (successed) {
              console.log('------ ::: v - bad, a - ok');
              easyrtc.setVideoObjectSrc(selfVideo[0], mediastream);
              joinARoom();
            } else {
              console.log('------ ::: v - bad, a - bad');
              easyrtc.enableAudio(false);
              joinARoom();
            }
          });
        }
      });
    },
    function (error) {
      console.log(error);
    }
  );

  // when viewer call me
  easyrtc.setAcceptChecker(function (easyrtcid, acceptor) {
    acceptor(true);
    //add_new_user(easyrtcid);
  });

  //disconnect event
  easyrtc.setDisconnectListener(
    function () {
      alert("Lost Easyrtc connection");
    }
  );

  //send data from other
  easyrtc.setPeerListener(handle_message);
}

//join easyrtc room
function joinARoom(global) {
  console.log('---- join room to :' + room_name);
  //join room
  var newRoom = room_name;
  if (global)
    newRoom = global;

  for (var actualRoom in easyrtc.getRoomsJoined()) {
    if (newRoom === actualRoom) {
      alert("You can't join this room.");
      return;
    }
  }

  easyrtc.leaveRoom(actualRoom, function (actualRoom) {
    console.log("leave " + actualRoom);
  }, function (errorCode, errorText, actualRoom) {
    console.log("Failure " + actualRoom);
  });

  easyrtc.joinRoom(newRoom, null, function (newRoom) {
    console.log("Success to join " + newRoom);
    users = [];
    users.push({
      id: easyrtc.myEasyrtcid,
      name: my_data.Id,
      email: my_data.email,
      role: my_data.role //'creator'
    });

    isConnected = true;

    formerOwner.id = easyrtc.myEasyrtcid;
    formerOwner.email = my_data.email;


  }, function (errorCode, errorText, newRoom) {
    console.log("Failure to join " + newRoom);
  });

}

/**
 * Easyrtc Room occupant Listener
 */
function convertList(roomName, occupants, isPrimary) {
  if (roomName == 'global' || roomName == 'default')
    return;
  var new_users = [];

  if (needToCallOtherUsers) {
    //first entry room
    var list = [];
    var connectCount = 0;
    for (var easyrtcid in occupants) {
      list.push(easyrtcid);
    }
    //
    // Connect in reverse order. Latter arriving people are more likely to have
    // empty slots.
    //
    function establishConnection(position) {
      function callSuccess() {
        console.log('call success');
      }

      function callFailure() {
        if (position > 0 && connectCount < maxUserNum) {
          establishConnection(position - 1);
        } else {
          confirm_owner(new_users);
        }
      }

      function wasAccepted(wasAccepted, easyrtcid) {
        console.log('---------Was Accepted------------');
        console.log(occupants);
        if (wasAccepted) {
          connectCount++;
          new_users.push({
            id: list[position],
            name: occupants[list[position]].username
          });
        }
        if (position > 0 && connectCount < maxUserNum) {
          establishConnection(position - 1);
        } else {
          confirm_owner(new_users);
        }
      }

      easyrtc.call(list[position], callSuccess, callFailure, wasAccepted);
    }

    if (list.length > maxUserNum) {
      alert('sorry, this room is full.');
      return false;
    } else if (list.length > 0) {
      establishConnection(list.length - 1);
    }
    needToCallOtherUsers = false;
  } else {
    console.log('room occupants');
    //check other user list
    var list = [];
    var old_users = users;
    for (var easyrtcid in occupants) {
      list.push(easyrtcid);
    }
    if (list.length == (old_users.length - 1 ))
      return;
    if (list.length > (old_users.length - 1)) {

    } else {
      //check out user
      var out_users = [];
      var out_flag = false;
      for (var i = 1; i < old_users.length; i++) {
        out_flag = true;
        for (var j = 0; j < list.length; j++) {
          if (old_users[i].id == list[j]) {
            out_flag = false;
            break;
          }
        }
        if (out_flag) {
          out_users.push(old_users[i]);
        }
      }
      goout_users(out_users);
    }
  }
}

/**
 *  confirm teacher
 */
function confirm_owner(users) {
  for (var i = 0; i < users.length; i++) {
    sendPeerMessage(users[i].id, MSG_REQUEST_OWNER, {role: my_data.role});
  }
}

/**
 * add new user
 */
function add_new_user(otherid, msgData) {
  console.log('---------add new user------------');
  console.log('otherid: ' + otherid);
  console.log('**** msgData');
  console.log(msgData);
  console.log('***********end new user data********');
  var userRole = msgData.role;
  var newVideoBox, boxIndex;
  console.log('--------Users Data------------');
  console.log(users);
  /*
   if (userRole == ROLE_TEACHER){
   newVideoBox = $(otherVideoBoxs[0]);
   boxIndex = 0;
   remainTime = msgData.remainTime;
   //currentPanel = msgData.panel;
   openDocURL = msgData.docURL;
   backVideoObj.src = msgData.vaSRC;
   change_panel(msgData.panel, true, startCourse);
   //startCourse();
   } else {
   var startNum = 1;
   if (role == ROLE_TEACHER)
   startNum = 0;
   for (var i=startNum; i<otherVideoBoxs.length; i++){
   newVideoBox = $(otherVideoBoxs[i]);
   boxIndex = i;
   if (newVideoBox.css('display') == 'none')
   break;
   }
   }
   */
  var user_name = easyrtc.idToName(otherid);
  console.log('---------Get IDs from EasyRTC-------------');
  console.log(easyrtc.usernameToIds(user_name, room_name));
  var owner_switch_icon;
  var human_class;
  switch (msgData.role) {
    case 'creator':
      human_class = 'human-creator';
      owner_switch_icon = '';
      break;
    case 'owner':
      human_class = 'human-owner';
      owner_switch_icon = '<span class="video-control video-right-control video-user hand-pointer display-none" style="display: none" onclick="change_owner(\'' + otherid + '\', \'' + msgData.email + '\')"></span>'
      break;
    case 'member':
      human_class = 'human';
      owner_switch_icon = '<span class="video-control video-right-control video-user hand-pointer" onclick="change_owner(\'' + otherid + '\', \'' + msgData.email + '\')"></span>'
      break;
    default:
      human_class = 'human';
      owner_switch_icon = '<span class="video-control video-right-control video-user hand-pointer" onclick="change_owner(\'' + otherid + '\', \'' + msgData.email + '\')"></span>'
  }
  boxIndex = 'v-' + otherid;
  newVideoBox = '<div id="' + boxIndex + '" class="free-human">' +
    '<div class="video-frame">' +
    '<div class="video-top">' +
    '<span class="video-control video-mic"></span>' +
    '</div>' +
    '<div class="video-content">' +
    '<video class="wd-100 he-100" autoplay="autoplay" poster="' + (msgData.avatar || '/assets/image/human.png') + '"></video>' +
    '</div>' +
    '<div class="video-bottom">' +
    '<span class="video-control video-right-control video-zoom hand-pointer" onclick="on_full_screen(\'' + boxIndex + '\')"></span>' +
    '<span class="video-control video-right-control video-mic video-mic-block hand-pointer" onclick="onMuteMicOther(\'' + otherid + '\')"></span>' +
    '</div>' +
    '</div>' +
    '</div>';

  $('#video-panel').append(newVideoBox);

  for (var i = 0; i < users.length; i++) {
    if (users[i].id == otherid)
      return;
  }
  users.push({
    id: otherid,
    name: easyrtc.idToName(otherid),
    role: userRole,
    email: msgData.email,
    avatar: msgData.avatar || '/assets/image/human.png',
    element: $('#' + boxIndex)
  });
  fix_height(users.length);
  easyrtc.setVideoObjectSrc($('#' + boxIndex).find('video')[0], easyrtc.getRemoteStream(otherid));
}
window.onchange = function (res) {
  console.log(res);
}
/**
 * refresh video boxs & chat boxs for out users
 * @param out_users
 */
function goout_users(out_users) {
  console.log('------go out users------');
  console.log(out_users);
  for (var j = users.length - 1; j > 0; j--) {
    for (var i = 0; i < out_users.length; i++) {
      if (users[j].id == out_users[i].id) {
        //$(otherVideoBoxs[users[j].boxIndex]).attr('easyrtc-id', '').css('display', 'none');
        users[j].element.remove();
        users.splice(j, 1);
        /*
         ====================================================
         when owner out room, should change owner to creator
         ====================================================
         */
        break;
      }
    }
  }
}

function hangup_user(id) {
  easyrtc.hangup(id);
}
