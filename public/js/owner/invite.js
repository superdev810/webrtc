function send_invite_mail(){
  var mailBoxs = $('#group-mail-box input[type="email"]');
  var inviteUsers = [];
  for (var i=0; i<mailBoxs.length; i++){
    if (mailBoxs[i].value && mailBoxs[i].willValidate)
      inviteUsers.push(mailBoxs[i].value);
  }
  console.log(inviteUsers);
  var sendData = {
    room_name: room_name,
    inviters: inviteUsers,
    comment: $('#invite-comment').val()
  };

  var refresh_invite_modal = function(){
    for (var i=0; i<mailBoxs.length; i++){
      if (i == 0)
        mailBoxs[i].value = '';
      else
        $(mailBoxs[i]).remove();
    }
    close_modal('invite');
  };

  $.post('/send-invite', sendData)
    .success(function(res){
      console.log(res);
      refresh_invite_modal();
    })
    .error(function(err){
      console.log(err);
      refresh_invite_modal();
    })
}

