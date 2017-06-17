var MSG_REQUEST_OWNER = "request_owner",
    MSG_ANSWER_OWNER = "answer_owner",
    MSG_CHAT = "chat_message",
    MSG_OPEN_DOCUMENT = "pdf_doc_open",
    MSG_UPDATE_DOCUMENT_VIEW = "update_doc_view",
    MSG_REQUEST_DOCUMENT_URL = "request_doc_url",
    MSG_REQUEST_DOCUMENT_LOCATION = "request_doc_location",
    MSG_GRID_CHANGE = "wb_grid_changed",
    MSG_CHANGE_TAB = "change_tab",
    MSG_SHARE_URL = "share_url",
    // MSG_OPEN_VA_FILE = "open_va_file",
    // MSG_PLAY_VA_FILE = "play_va_file",
    // MSG_PAUSE_VA_FILE = "pause_va_file",
    // MSG_CHANGE_VOLUME = "change_va_volume",
    // MSG_CHANGE_TIME_PROCESS = "change_va_time",
    MSG_CHANGE_OWNER = "change_owner",
    MSG_SCROLL_WHITEBOARD = "scroll_white_board",
    MSG_IMAGE_EVENT = "image_event",
    MSG_PDF_EVENT = "pdf_event",
    MSG_VIDEO_EVENT = "video_event";

var cur_chat_user = 'public';
var awsPlyaer, polly;
var enablePolly = true;
var voiceIds = {
  en: 'Joanna',
  jp: 'Mizuki'
};


function sendAllMessage(msgType, msgData) {
  if(isConnected)
    easyrtc.sendDataWS({targetRoom: room_name}, msgType, msgData);
}

function sendPeerMessage(id, msgType, msgData) {
  if (isConnected)
    easyrtc.sendDataWS(id, msgType, msgData);
}

/**
 * Easyrtc Handle Message
 */

function handle_message(otherid, msgType, msgData) {
  console.log(msgType + "-----" + msgData);
  console.log(msgData);
  switch (msgType) {
    case MSG_REQUEST_OWNER:
      console.log('------------REQUEST OWNER---------------');
      console.log(my_data);
      sendPeerMessage(otherid, MSG_ANSWER_OWNER,
        {
          role: my_data.role,
          avatar: my_data.avatar,
          email: my_data.email,
          /*
           remainTime: remainTime,
           panel: currentPanel,
           docURL: openDocURL,
           vaSRC: backVideoObj.src
           */
        });
      add_new_user(otherid, msgData);
      break;
    case MSG_ANSWER_OWNER:
      add_new_user(otherid, msgData);
      break;
    case MSG_CHAT:
      /*insertChatItem(easyrtc.idToName(otherid), msgData);*/
      var newMsgData = {
        from_Id: easyrtc.idToName(otherid),
        to_Id: msgData.targetName,
        text: msgData.text,
        created: new Date()
      };
      messages.push(newMsgData);
      if (otherid == cur_chat_user && (cur_chat_user != 'public' && msgData.targetName != 'public')) { // private message
        play_polly_msg(newMsgData.text, function(){
          insertChatItem(otherid, newMsgData);
        });
      }else if (cur_chat_user == 'public' && msgData.targetName == 'public'){ // public message
        play_polly_msg(newMsgData.text, function(){
          insertChatItem(otherid, newMsgData);
        });
      }else { // change badge
        if (newMsgData.to_Id == 'public') {
          var e = $('#self-video-container').find('.video-top .video-message');
          e.addClass('video-message-new');
        }
        else {
          var e = $('#v-' + otherid).find('.video-top .video-message');
          e.addClass('video-message-new');
        }
      }
      break;
    case MSG_CHANGE_OWNER:
      console.log('-------------MSG Change Owner------------');
      console.log(msgData);
      // formerOwner.id = '';
      // formerOwner.email = '';
      for(var i=0; i<users.length; i++){
        if(users[i].username = easyrtc.idToName(msgData.ownerId)){
          formerOwner.id = msgData.ownerId;
          formerOwner.email = msgData.ownerEmail;
          break;
        }
      }
      if(msgData.ownerId == easyrtc.myEasyrtcid || msgData.formerOwnerEmail == my_data.email){
        window.location = '/' + room_name;
      }


      if ($('#v-' + msgData.ownerId).length > 0) {
        $('#v-' + msgData.ownerId).removeClass('human');
        $('#v-' + msgData.ownerId).addClass('human-owner');
      } else {
        $('#self-video-container').removeClass('human');
        $('#self-video-container').addClass('human-owner');
      }
      break;
    case MSG_CHANGE_TAB:
      changeTabPanel(msgData, true);
      break;
    case MSG_GRID_CHANGE:
      change_grid(msgData);
      break;
    case MSG_SHARE_URL:
      whiteBoard.insertImageFromUrl(msgData);
      break;
    case MSG_OPEN_DOCUMENT:
      if (!myPresenterFlag)
        open_document(msgData);
      break;
    case MSG_UPDATE_DOCUMENT_VIEW:
      if (!myPresenterFlag)
        update_doc_view(msgData);
      break;
    case MSG_REQUEST_DOCUMENT_URL:
      if (myPresenterFlag)
        received_request_doc_url(otherid);
      break;
    case MSG_REQUEST_DOCUMENT_LOCATION:
      if (myPresenterFlag)
        received_request_doc_state(otherid);
      break;
/*    case MSG_OPEN_VA_FILE:
      if (!myPresenterFlag)
        open_va_file(msgData);
      break;
    case MSG_PLAY_VA_FILE:
      if (!myPresenterFlag)
        backVideoObj.play();
      break;
    case MSG_PAUSE_VA_FILE:
      if (!myPresenterFlag)
        backVideoObj.pause();
      break;
    case MSG_CHANGE_VOLUME:
      if (!myPresenterFlag) {
        backVideoObj.muted = msgData.muted;
        backVideoObj.volume = msgData.volume;
      }
      break;
    case MSG_CHANGE_TIME_PROCESS:
      if (!myPresenterFlag)
        backVideoObj.currentTime = msgData;
      break;
    case MSG_CHANGE_PRESENTER:
      change_presenter_state(msgData);
      break;*/
    case MSG_SCROLL_WHITEBOARD:
      if (!myPresenterFlag) {
        $('#canvas-main').css({left: -parseInt(msgData.left), top: -parseInt(msgData.top)});
      }
      break;
    case MSG_PDF_EVENT:
      changePDFState(msgData);
      break;
    case MSG_IMAGE_EVENT:
      changeImageState(msgData);
      break;
    case MSG_VIDEO_EVENT:
      changeVideoState(msgData);
      break;
  }
}

/* whiteboard grid changed event */
/*
 function grid_changed(backgrd_status) {
 sendAllMessage(MSG_GRID_CHANGE, backgrd_status);
 }

 function change_grid(backgrd) {
 whiteBoard.grid(backgrd);
 }
 */

function send_message() {
  var msgTxt = $('#msg-input').val();
  if (!msgTxt) return;
  var msgData = {
    targetRoom: room_name,
    targetName: '',
    text: msgTxt
  };
  if (cur_chat_user == 'public') {
    msgData.targetName = 'public';
    sendAllMessage(MSG_CHAT, msgData);
  }
  else {
    msgData.targetName = easyrtc.idToName(cur_chat_user);
    sendPeerMessage(cur_chat_user, MSG_CHAT, msgData);
  }

  // insert my sent chat
  var newMsgData = {from_Id: my_data.Id, to_Id: msgData.targetName, text: msgData.text, created: new Date()};
  messages.push(newMsgData);
  insertChatItem(cur_chat_user, newMsgData);

  $('#msg-input').val('').focus();
}

function switch_chat_user(id) {
  cur_chat_user = id;
  if (id == 'public') {
    var e = $('#self-video-container').find('.video-top .video-message');
    e.removeClass('video-message-new');
    $('#lbl-chat-title').text('公開メッセージ')
  }
  else {
    var e = $('#v-' + id).find('.video-top .video-message');
    e.removeClass('video-message-new');
    $('#lbl-chat-title').text(easyrtc.idToName(id));
  }

  refresh_chat_panel();
}

function refresh_chat_panel() {
  // refresh chat panel
  $('#msg-board').empty();
  var filter_messages = messages.filter(function (obj) {
    return (obj.to_Id == cur_chat_user || obj.to_Id == easyrtc.idToName(cur_chat_user) || obj.to_Id == my_data.Id);
  });
  var ele_txt = '';
  for (var i = 0; i < filter_messages.length; i++) {
    var msgData = filter_messages[i];
    ele_txt += ('<div class="ml-5 mt-10">' +
    '<strong>' + msgData.from_Id + ':<strong><br/>' +
    msgData.text +
    '</div>');
  }

  $('#msg-board').append(ele_txt).scrollTop(1000000);
}

function insertChatItem(otherid, msgData){
  var cur_user;
  for (var i=0; i<users.length; i++){
    if (users[i].id == otherid){
      cur_user = users[i];
      break;
    }
  }
  var msg_ele = '<div class="ml-5 mt-10">' +
    '<strong>' + msgData.from_Id + ':<strong><br/>' +
    msgData.text +
    '</div>';
  $('#msg-board').append(msg_ele).scrollTop(1000000);

  /*
   - get name
   cur_user.name;
   - get avatar
   cur_user.avatar;
   - get message
   - insert message
   */
}

function togglePolly(){
  console.log('---- toggle polly ----');
  enablePolly = !enablePolly;
}

function init_polly(){
  awsPlyaer = $('#aws-audio')[0];
  AWS.config.region = "eu-west-1";
  AWS.config.accessKeyId = 'MyKey';
  AWS.config.secretAccessKey = 'MySecretKey';
  polly = new AWS.Polly({apiVersion: '2016-06-10'});

}

function play_polly_msg(message, cb){

  if (!enablePolly)
    return cb();

  var countryCode = $('#polly-lang').val();
  var params = {
    OutputFormat: 'mp3',
    Text: message,
    VoiceId: voiceIds[countryCode],
    TextType: 'text'
  };

  polly.synthesizeSpeech(params, function(err, data){
    if (err){
      cb();
    }
    else {
      if (data.AudioStream){
        var uIn = new Uint8Array(data.AudioStream);
        var arrayBuffer = uIn.buffer;
        var blob = new Blob([arrayBuffer]);
        var url = URL.createObjectURL(blob);
        awsPlyaer.src=url;
        awsPlyaer.play();
        cb();
      }
    }
  })
}
