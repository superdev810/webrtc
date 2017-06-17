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
  init_easyrtc();
  init_window();
}

$(document).ready(function(){
  selfVideo = $('#self-video');
  $('#lbl-share-url').text(window.location);
  init();
});
