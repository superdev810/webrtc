$(function(){
  $("#signin-form").validate({
    rules: {
      email: {
        required: true
      },
      password: {
        required: true
      }
    },
    messages: {
      email: "email is required",
      password: "password is required"
    }
  });

  $('#signin-form').submit(function(e){
    e.preventDefault();
    console.log('---- signin ----');
    var authData = $(this).serializeFormJSON();
    console.log(authData);
    $.post('/auth/signin', authData)
      .success(function(res){
          window.location = '/users/my_page/profile';
      })
      .error(function(err){
        var errData = err.responseJSON;
        console.log(err);
        $('#error-label').html(errData.message);
      });
  });

  var index = 0;
  var changeImg = function() {
    if(index % 2 == 0) {
      $('#logo-img').attr('src', '/assets/image/first_icon_enable.png');
    }else {
      $('#logo-img').attr('src', '/assets/image/first_icon_disable.png');
    }
    index++;
    setTimeout(changeImg, 1000);
  };
  setTimeout(changeImg, 1000);

});
