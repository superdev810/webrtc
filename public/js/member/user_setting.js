$(function(){

  $('#user-form').submit(function(e){
    e.preventDefault();
    console.log('---- post user data ----');
    var userData = $(this).serializeFormJSON();
    userData.avatar = $('#img-avatar').attr('src');
    $.post('/user-setting', userData)
      .success(function(res){
        if (res.redirectUrl)
          window.location = res.redirectUrl;
      })
      .error(function(err){
        var errData = err.responseJSON;
        console.log(errData.message);
      })
  });

  $('#fileupload').fileupload({
    dataType: 'json',
    done: function (e, data) {

      $('#img-avatar').attr('src', data.result.files[0].url);
      /*
       $.each(data.result.files, function (index, file) {
       $('<p/>').text(file.name).appendTo(document.body);
       });
       */
    }
  });

});

function upload_avatar(){
  console.log('---- upload avatar -----');
  $('#fileupload').click();
}
