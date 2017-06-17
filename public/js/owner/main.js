var selfVideo,
    otherVideos = [];
var DEFAULT_PANEL = 'default',
  WEB_PAGE_PANEL = 'webpage',
  IMAGE_PANEL = 'image',
  VA_PANEL = 'va',
  DOCUMENT_PANEL = 'document';
var currentPanel = DEFAULT_PANEL;
var whiteBoardData = {};
var autoText;
var player;

function init(){
  initVideo();
  init_easyrtc();
  init_window();
  initTabs();
  initPDF();
  initImage();
  init_polly();
}

$(document).ready(function(){
  selfVideo = $('#self-video');
  $('#lbl-share-url').text(window.location);

  whiteBoardData[DEFAULT_PANEL] = [];

  upLoadTable = $("#tbl-upload").dataTable({
    columns: [
      {title: "ファイル名"},
      {title: "タイプ"},
      {title: "日 付"},
      {title: ""}
    ]
  });
  downLoadTable = $("#tbl-download").dataTable({
    columns: [
      {title: "ファイル名"},
      {title: "タイプ"},
      {title: "日 付"},
      {title: ""}
    ]
  });
  $("#dlg-invite #btn-add").hide();
  init();
});

function init_whiteboard(){
  autoText = $('#auto-text');
  autoText.autoGrowInput({
    maxWidth: 300,
    minWidth: 30,
    comfortZone: 1
  });
  autoText.blur(function(){
    autoText.css('visibility', 'hidden');
  });

  requirejs(["app"], function(e) {
    whiteBoard = e;
    whiteBoard.init(); whiteBoard.run();
    change_panel(DEFAULT_PANEL);
    //init_custom_toolbar();
    // request saved whiteboard data and then replace whiteboard
    /*
     if (role == ROLE_TEACHER){
     setTimeout(function(){
     change_panel(DEFAULT_PANEL);
     }, 500);
     }
     */
  });
}

function initTabs() {
  console.log("Configure Tabs");
}

function onChangeTabs (index) {
  if(!index) index = 0;
  sendAllMessage(MSG_CHANGE_TAB, {"index": index});
}

function initVideo() {
  player = videojs('really-cool-video', { /* Options */ }, function() {

    this.on(['loadstart', 'play', 'pause', 'volumechange', 'timeupdate', 'fullscreenchange'], function(e) {
      console.log("-----------" + e.type + "--------------");
      var msgData = {
        type: e.type
      };
      switch (e.type) {
        case 'loadstart':
          msgData.value = player.src();
              break;
        case 'play':
              break;
        case'pause':
              break;
        case 'volumechange':
          msgData.value = player.volume();
              break;
        case 'timeupdate':
          msgData.value = player.currentTime();
              break;
        case 'fullscreenchange':
          msgData.value = player.isFullscreen();
              break;
      }
      console.log(msgData);
      sendAllMessage(MSG_VIDEO_EVENT,msgData);
    })
  })
}

function initImage() {
  var image = $('#image-wrapper>img');
  var msgData = {};
  image.bind({
    load: function() {
      msgData.type = "load";
      msgData.value = image.attr("src");
      sendAllMessage(MSG_IMAGE_EVENT, msgData);
    }
  });
  $("#image-wrapper").bind({
    scroll: function (e) {
      msgData.type = "scroll";
      msgData.value = {
        top: $(this).scrollTop(),
        left: $(this).scrollLeft()
      };
      sendAllMessage(MSG_IMAGE_EVENT, msgData);
    }
  })
}

function initPDF() {
  window.addEventListener("updateviewarea",function() {
    var location = PDFViewerApplication.pdfViewer.location;
    sendAllMessage(MSG_PDF_EVENT, {type:"updateviewarea", value: location});
  })
}
