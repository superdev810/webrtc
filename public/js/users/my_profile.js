/**
 * Created by Administrator on 3/1/2017.
 */
$(function () {

  $('#user-form').submit(function (e) {
    e.preventDefault();
    console.log('---- post user data ----');
    var userData = $(this).serializeFormJSON();
    userData.avatar = $('#img-avatar').attr('src');
    console.log(userData);
    // return;
    $.post('/users/my_page/profile', userData)
      .success(function (res) {
        console.log('--------Profile Updated Success----------');
      })
      .error(function (err) {
        var errData = err.responseJSON;
        console.log(errData.message);
      })
  });

  $('#fileupload').fileupload({
    dataType: 'json',
    done: function (e, data) {
      $('#img-avatar').attr('src', data.result.files[0].url);
    }
  });

});

function upload_avatar() {
  console.log('---- upload avatar -----');
  $('#fileupload').click();
}

function remove_room(room_id) {
  console.log(room_id);
  $.ajax({
    url: '/users/my_page/room_manage',
    method: 'DELETE',
    data: {
      room_name: room_id
    }
  })
    .success(function(res){
      console.log(res);
      window.location = '/users/my_page/room_manage';
    })
    .error(function (err) {
      console.log(err);
    })
}

var edit_friend = function(item) {
  console.log(item);
  var user_id = $('#'+item+'_id').text() || '';
  var user_email = $('#'+item+'_email').text();
  $('#name').val(user_id);
  $('#email').val(user_email);
  $('#email').attr('data', item);
  // console.log(user_email);
}

var save_friend = function () {

  var name = $('#name');
  var email = $('#email');
  var error = $('#error_msg');
  error.hide();

  if(email.val() =='' || name.val() == ''){
    error.show();
    error.text('Please enter your username and email!!!');
    name.focus();
    return false;
  }
  var param_data = {};
  param_data.Id = name.val();
  param_data.email = email.val();
  param_data.userId = email.attr('data') || '';
  console.log(param_data);
  // return;
  $.ajax({
    method: 'POST',
    url: '/users/my_page/friend_manage',
    data: param_data
  })
    .success(function (res) {
      console.log(res);
      window.location = '/users/my_page/friend_manage';
    })
    .error(function (err) {
      error.show();
      var json_str = {};
      json_str = err.responseJSON.message || 'Param is not correct';
      error.text(json_str);
      // console.log(json_str);
    })
}

var delete_friend = function () {
  var friend_ids = [];
  var error = $('#error_msg');
  var check_inputs = $('input:checkbox');
  for(var i=0; i<check_inputs.length; i++){
    if($(check_inputs[i]).attr('checked') == 'checked'){
      friend_ids.push($(check_inputs[i]).attr('data'));
    }
  }
  console.log(friend_ids);
  error.hide();
  if (friend_ids == '') {
    error.show();
    error.text('Please Check Friends You Want to Delete');
    return false;
  }
  $.ajax({
    method: 'DELETE',
    url: '/users/my_page/friend_manage',
    data: {friend_email:friend_ids}
  })
    .success(function (res) {
      console.log(res);
      window.location = '/users/my_page/friend_manage';
    })
    .error(function (err) {
      console.log(err);
    })
}

var create_free_video = function() {
  var friends = [];
  var check_inputs = $('input:checkbox');
  for(var i=0; i<check_inputs.length; i++){
    if($(check_inputs[i]).attr('checked') == 'checked'){
      var friend_id = $(check_inputs[i]).attr("id");
      console.log(friend_id);
      friends.push({
        Id: $("#" + friend_id + "_id").html(),
        email: $("#" + friend_id + "_email").html(),
      });
    }
  }
  if (friends.length == 0) return;
  $.ajax({
    method: 'POST',
    url: '/users/my_page/free_video',
    data: {friends:friends}
  })
    .success(function (res) {
      console.log(res);
      // window.location = res.redirectUrl;
    })
    .error(function (err) {
      console.log(err);
    })
}
