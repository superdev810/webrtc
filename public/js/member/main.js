var selfVideo,
  otherVideos = [];
var player;




$(document).ready(function(){
  selfVideo = $('#self-video');
  initVideo();
  init_easyrtc();
  init_window();
  initPDF();
  initTabs();
  initImage();
  init_polly();
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
    change_panel("default");
    // init_custom_toolbar();
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
  console.log("Member Tab Panel Configured");
}

function initVideo() {
  console.log("Member Media Panel Configured");
  player = videojs('really-cool-video', { /* Options */ }, function() {
  });
}

function initImage() {
  console.log("Member Image Panel Configured");
}

function initPDF() {
  console.log("Member PDF Panel Configured");
}
