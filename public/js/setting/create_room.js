$(function(){
  $("#room-form").validate({
    rules: {
      room_pass: {
        required: true
      },
      room_pass_confirm: {
        required: true, equalTo: "#room-pass"
      }
    },
    messages: {
      password: "pass require",
      room_name: "room name require",
      room_type: "room type require",
      my_ID: "my id require",
      room_pass: "room pass require",
      room_pass_confirm: "Not match room password."
    }
  });

  $('#room-form').submit(function(e){
    e.preventDefault();
    console.log('---- post room data ----');
    var roomData = $(this).serializeFormJSON();
    $.post('/confirm-create-room', roomData)
      .success(function(res){
        if (res.redirectUrl)
          window.location = res.redirectUrl;
      })
      .error(function(err){
        var errData = err.responseJSON;
        console.log(errData.message);
      })
  });

  $(".checkbox").click(function(){
    if($(this).hasClass("checked"))
    {
      $(this).removeClass("checked");
      $(this).find("input:checkbox").prop("checked", false);
      $('#password-panel').css('display', 'none');
    }
    else
    {
      $(this).addClass("checked");
      $(this).find("input:checkbox").prop("checked", true);
      $('#password-panel').css('display', 'block');
    }
  });


  $('#btn-check').on('click', function(e){
    console.log('----- check valid room name -----');
    var room_name = $('#room-name').val();
    if (room_name){
      $.post('/check-validate', {room_name: room_name})
        .success(function(res){
          console.log(res);
          if (res.err == 0)
            $('#valid-message').html('<span class="text-success">' + res.message + '</span>');
          else
            $('#valid-message').html('<span class="text-danger">' + res.message + '</span>');
        })
        .error(function(err){})
    }
  })
});
