var isFullScreen = false,
    muteMic = false,
    muteCamera = false;
var upLoadTable, downLoadTable;
var files_array;
var myPresenterFlag = true;
var isDocumentScrollable = true;
var whiteBoard;
var tabs;
var mouseFlag = false;
var clientXPos;
var moveSize;
function init_window(){
  window.onbeforeunload = function(){
    var msg = 'Are you sure want to exit room?';
    return msg;
  };

  $("#msg-input").keyup(function(event){
    if(event.keyCode == 13){
      send_message();
    }
  });

  refresh_chat_panel();

  fix_image_video_content_size();
}

// Windows Resizing Event
window.onresize = function (res) {
  fix_image_video_content_size();
};

function fix_image_video_content_size(){
  var content_width = $('#image-wrapper').parent().parent().width();
  var content_height = $('#image-wrapper').parent().parent().height();

  $('#image-wrapper').css('width', content_width);
  $('#image-wrapper').css('height', content_height-32);

  $('#pan-media>div').css('width', content_width);
  $('#pan-media>div').css('height', content_height-32);
  $('#pan-media>div').css('overflow', 'hidden');
}

function out_room(){
  var ans = confirm('are you sure out room?');
  if (ans){
    easyrtc.disconnect();
    location.href = '/';
  }
}

function request_owner(){
  var ans = confirm('are you sure request owner?');
  if (ans){
    var msgTxt = '[' + my_data.Id + '] just requested owner permission';
    var msgData = {
      targetRoom: room_name,
      targetName: '',
      text: msgTxt
    };
    msgData.targetName = 'public';
    sendAllMessage(MSG_CHAT, msgData);

    var newMsgData = {from_Id: my_data.Id, to_Id: msgData.targetName, text: msgData.text, created: new Date()};
    messages.push(newMsgData);
    insertChatItem('public', newMsgData);
  }
}

function open_modal(modal, type){
  $('#dlg-' + modal).modal();
  switch (modal) {
    case 'upload':
      refresh_upload_modal();
      break;
    case 'download':
      refresh_download_modal();
      break;
    case 'open':
      refresh_open_modal(type);
      break;
  }
}

function close_modal(modal){
  $('#dlg-' + modal).modal('hide');
}

function launchFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullScreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
  console.log(document.webkitFullscreenElement);
}

document.addEventListener('webkitfullscreenerror', function (err) {
  console.log('Full Screen Error...');
  console.log(err);
});

document.addEventListener("webkitfullscreenchange", function (change) {
  console.log('Full Screen Change...');
  console.log(change);
});

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
  else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
  else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  }
  else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
}

function onMuteMicSelf(){
  muteMic = !muteMic;
  var e = $('#self-video-container').find('.video-top .video-mic');
  e.toggleClass('video-mic-block');
  e = $('#self-video-container').find('.video-bottom .video-mic');
  e.toggleClass('video-mic-block');
  easyrtc.enableMicrophone(!muteMic)
}

function onMuteCameraSelf(){
  muteCamera = !muteCamera;
  var e = $('#self-video-container').find('.video-top .video-camera');
  e.toggleClass('video-camera-block');
  e = $('#self-video-container').find('.video-bottom .video-camera');
  e.toggleClass('video-camera-block');
  easyrtc.enableCamera(!muteCamera);
}

function on_full_screen(id){
  if (isFullScreen)
    exitFullscreen();
  else
    launchFullscreen($('#' + id)[0]);
  isFullScreen = !isFullScreen;
}

function onMuteMicOther(otherId){
  var e = $('#v-' + otherId).find('.video-top .video-mic');
  e.toggleClass('video-mic-block');
  e = $('#v-' + otherId).find('.video-bottom .video-mic');
  e.toggleClass('video-mic-block');

}

function onMuteCameraOther(otherId){
  var e = $('#v-' + otherId).find('.video-top .video-camera');
  e.toggleClass('video-camera-block');
  e = $('#v-' + otherId).find('.video-bottom .video-camera');
  e.toggleClass('video-camera-block');
}

function refresh_upload_modal() {
  var room_id = $("#room-id").val();
  var uploader_id = $("#uploader-id").val();

  $('#upload_all').attr('disabled', false);
  $('#remove_all').attr('disabled', false);
  $('#progress_panel').children().each(function () {
    $(this).remove();
  })
  files_array = [];
  refresh_data_table();
}

function refresh_data_table() {
  $.get('/room-api/share-files', {
    params: {
      room_id: room_name,
      uploader: my_data._id
    }
  }).success(function (res) {
    var result = res;
    var dataSet = [];
    $.each(result, function (index, val) {
      var row = [];
      row.push(val.title, val.share_type || "other", val.created, "<button url='" + val.url + "' class='gradient-btn2 round-btn3 modal-delete-btn'><span class='btn-caption span-delete'>削    除</span></button>")
      dataSet.push(row);
    });

    $("#dlg-upload #tbl-upload_wrapper").remove();
    $("#dlg-upload .table-scrollable").append("<table id='tbl-upload'></table>");
    upLoadTable = $("#tbl-upload").dataTable({
      data: dataSet,
      columns: [
        {title: "ファイル名"},
        {title: "タイプ"},
        {title: "日 付"},
        {title: ""}
      ]
    });

    $(".modal-delete-btn").click(function () {
      var url = $(this).attr("url");
      $.ajax("/room-api/share-files",
        {
          method: "DELETE",
          data: {url: url}
        }).success(function (res) {
          refresh_data_table();
        });
    });
  });
}

function refresh_download_modal() {
  var room_id = $("#room-id").val();

  $.get('/room-api/share-files', {
    params: {
      room_id: room_id
    }
  }).success(function (res) {
    var result = res;
    var dataSet = [];
    $.each(result, function (index, val) {
      var row = [];
      row.push(val.title, val.share_type || "other", val.created, "<a href='" + val.url + "' download='" + val.title + "' style='display:none'>Download</a><button id='download' data-l10n-id='download' onclick='download_file($(this))' class='gradient-btn2 round-btn3 modal-btn-button'><span class='btn-caption span-delete'>ダウンロード</span></button>")
      dataSet.push(row);

    });
    $("#dlg-download #tbl-download_wrapper").remove();
    $("#dlg-download .table-scrollable").append("<table id='tbl-download'></table>");
    $("#tbl-download").dataTable({
      data: dataSet,
      columns: [
        {title: "ファイル名"},
        {title: "タイプ"},
        {title: "日 付"},
        {title: ""}
      ]
    });

  });
}

function download_file(btn) {
  var dw_url = btn.prev().attr('href');
  var dw_title = btn.prev().attr('download');
  var anchor = btn.prev();
  anchor.attr({
    href: dw_url,
    target: '_blank',
    download: dw_title
  }); //[0].click();

  if (document.createEvent) {
    var ev = document.createEvent("MouseEvent");
    ev.initMouseEvent(
      "click",
      true /* bubble */, true /* cancelable */,
      window, null,
      0, 0, 0, 0, /* coordinates */
      false, false, false, false, /* modifier keys */
      0 /*left*/, null
    );
    anchor[0].dispatchEvent(ev);
  }
  else {
    anchor[0].fireEvent("onclick");
  }
}

function change_panel(panel, receiveFlag, cb){
  $('#canvas-container').css('display', 'block');
  $('#canvas-toolbar').css('display', 'block');
/*
  //if (role == ROLE_TEACHER){
  if (myPresenterFlag){
    if (panel == DEFAULT_PANEL){
      whiteBoard.removeAll(function(){
        whiteBoard.drawFromData(whiteBoardData[panel], function(){
          currentPanel = panel;
          if (cb)
            cb();
        })
      })
    } else if (currentPanel == DEFAULT_PANEL){
      whiteBoard.saveData(currentPanel, function(){
        whiteBoard.removeAll(function(){
          currentPanel = panel;
          if (cb)
            cb();
        })
      });
      /!*
       whiteBoard.removeAll(function(){
       currentPanel = panel;
       if (cb)
       cb();
       })
       *!/
    } else {
      whiteBoard.removeAll(function(){
        currentPanel = panel;
        if (cb)
          cb();
      })
    }
    /!*
     currentPanel = panel;
     if (cb)
     cb();
     *!/

    if (panel == WEB_PAGE_PANEL || panel == IMAGE_PANEL){
      whiteContainer.addClass('board-scroll');
    } else {
      whiteContainer.removeClass('board-scroll');
    }
    whiteContainer.scrollTo(0, 0);
  } else {
    if (currentPanel == DEFAULT_PANEL)
      whiteBoard.saveData(currentPanel);
    currentPanel = panel;
    if (currentPanel == DOCUMENT_PANEL && openDocURL != '')
      open_document(openDocURL);
  }
*/
  $('#canvas-main').css({left: 0, top: 0});
/*
  if (!receiveFlag && myPresenterFlag)
    sendAllMessage(MSG_CHANGE_TAB, panel);
  if (!receiveFlag && !myPresenterFlag)
    return;
  switch (panel){
    case DEFAULT_PANEL:
    case WEB_PAGE_PANEL:
    case IMAGE_PANEL:
      disablePdfPanel();
      disableVideoPanel();
      break;
    case VA_PANEL:
      disablePdfPanel();
      $(backVideoObj).css('display', 'block');
      break;
    case DOCUMENT_PANEL:
      pdfPanel.css('display', 'block');
      disableVideoPanel();
      break;
  }
  if (panel != DOCUMENT_PANEL){
    $('#canvas-container').css('visibility', 'visible');
    $('#canvas-toolbar').css('visibility', 'visible');
  }
*/
}

function show_loading(is_show) {
  if (is_show)
    $('.loading').show();
  else
    $('.loading').hide();
}

function refresh_open_modal(type){
  var room_id = $("#room-id").val();
  var query_params = {};
  var open_handler = "open_" + type + "_file";
  if(type === "undefined")
    query_params = {
      room_id: room_id
    }
  else
    query_params = {
      room_id: room_id,
      share_type: type
    }
  $.get('/room-api/share-files', {
    params:query_params
  }).success(function (res) {
    var result = res;
    var dataSet = [];
    $.each(result, function (index, val) {
      var row = [];
      row.push(val.title, val.share_type || "other", val.created, "<a href='" + val.url + "' download='" + val.title + "' style='display:none'>Download</a><button id='download' data-l10n-id='download' onclick='" + open_handler + "($(this))' class='gradient-btn2 round-btn3 modal-btn-button'><span class='btn-caption span-delete'>ダウンロード</span></button>")
      dataSet.push(row);

    });
    $("#dlg-open #tbl-open_wrapper").remove();
    $("#dlg-open .table-scrollable").append("<table id='tbl-open'></table>");
    $("#tbl-open").dataTable({
      data: dataSet,
      columns: [
        {title: "ファイル名"},
        {title: "タイプ"},
        {title: "日 付"},
        {title: ""}
      ]
    });

  });
}
function open_pdf_file(btn) {
  var dw_url = btn.prev().attr('href');
  var dw_title = btn.prev().attr('download');
  var anchor = btn.prev();
  // $('#image-wrapper>img').attr('src', dw_url);
  PDFViewerApplication.open(dw_url, 0);
  sendAllMessage(MSG_PDF_EVENT, {type:"open", value:dw_url});
  close_modal('open');
}
function open_image_file(btn) {
  var dw_url = btn.prev().attr('href');
  var dw_title = btn.prev().attr('download');
  var anchor = btn.prev();
  $('#image-wrapper>img').attr('src', dw_url);

  close_modal('open')
}
function open_media_file(btn) {
  console.log("media");
  var dw_url = btn.prev().attr('href');
  var dw_title = btn.prev().attr('download');
  var anchor = btn.prev();
  $('#pan-media>div>video').attr('src', dw_url);
  close_modal('open')
}

function changeTabPanel(msgData) {
  var index = Number(msgData.index);
  if (!index) index = 0;
  console.log(index);
  $("#tabs ul li.active").removeClass("active");
  $("#tabs .tab-content .tab-pane.active.in").removeClass("active").removeClass("in");

  $("#tabs ul li:nth-child(" + (index + 1) + ")").addClass("active");
  $("#tabs .tab-content .tab-pane:nth-child(" + (index + 1) + ")").addClass("active").addClass("in");
}

function changeVideoState(msgData) {
  switch (msgData.type) {
    case 'loadstart':
      player.src(msgData.value);
      break;
    case 'play':
      player.play();
      break;
    case 'pause':
      player.pause();
      break;
    case 'volumechange':
      player.volume(msgData.value);
      break;
    case 'timeupdate':
      if(Math.abs(player.currentTime() - msgData.value) > 1)
        player.currentTime(msgData.value);
      break;
    case 'fullscreenchange':
      if (msgData.value)
        player.requestFullscreen();
      else
        player.exitFullscreen();
      break;
  };
}

function changeImageState(msgData) {
  console.log(msgData);
  switch (msgData.type) {
    case "load":
      $('#image-wrapper>img').attr('src', msgData.value);
      break;
    case "scroll":
      $('#image-wrapper').scrollTop(msgData.value.top);
      $('#image-wrapper').scrollLeft(msgData.value.left);
          break;
  }
}

function changePDFState(msgData) {
  switch (msgData.type) {
    case "open":
      PDFViewerApplication.open(msgData.value, 0);
      break;
    case "updateviewarea":
     /* if (!PDFViewerApplication.initialized) {
        console.log("------------loading------------");
        return;
      }
      // PDFViewerApplication.setScale(msgData.value.scale);
      console.log(PDFViewerApplication.pdfViewer);
      break;*/
  }
}

function hideChatBox() {
  $('#chatbox-panel').fadeOut().after(function () {
    $('#mini-icon').fadeIn('left');
    $('#mini-icon').bind(showChatBox);
    $('#share-panel').addClass('wd-100');
    fix_image_video_content_size();
  });

}

var showChatBox = function () {

  $('#mini-icon').fadeOut().after(function () {
    $('#chatbox-panel').fadeIn();
    $('#share-panel').removeClass('wd-100');
    fix_image_video_content_size();
  })
}

function hideVideoPanel() {
  $('#video-bar').fadeOut().after(function () {
    $('#video-icon').fadeIn('left');
    $('#video-icon').bind(showChatBox);
    $('.main-board').css('bottom', '30px');
    fix_image_video_content_size();
  });

}

var showVideoPanel = function () {

  $('#video-icon').fadeOut().after(function () {
    $('#video-bar').fadeIn();
    $('.main-board').css('bottom', '160px');
    fix_image_video_content_size();
  })
}

function  showHideVideoIcon() {
  $('#hide-video-icon').fadeIn();
}

function  hideHideVideoIcon() {
  $('#hide-video-icon').fadeOut();
}

$('body').mousedown(function (e) {
  console.log('resize drag start');
  console.log(e);
  console.log(document.body.clientWidth);
  clientXPos = e.clientX;
  mouseFlag = true;
})

$('body').mouseup(function (e) {
  console.log('resize drag end');
  mouseFlag = false;
})

$('body').mousemove(function (e) {
  if(mouseFlag) {
    moveSize = Math.abs(e.clientX - clientXPos);
    var totalWidth = document.body.clientWidth;
    var percentOfWidth = (moveSize / totalWidth) * 100;
    console.log(moveSize);
    var origin_percent = $('#resize-bar').css('left');
    console.log('Width Percent ::: ');

    origin_percent = origin_percent.substr(0, origin_percent.length - 3);
    console.log(origin_percent);
    var width_percent = origin_percent - percentOfWidth;
    // $('#resize-bar').css('left', width_percent + '%');
    console.log('resize drag move');
  }

})

