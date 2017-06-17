$(function () {

  var files_array = [];
  var file_name = '';
  var is_upload_all = false;

  var done_count = -1;

  var progress_html = "<div class='col-md-12'> <div class='col-md-3'><label>" + file_name + "</label></div><div class='col-md-6 progress-top-margin'><div class='progress'><div class='progress-bar progress-bar-success' role='progressbar' aria-valuenow='1' aria-valuemin='0'  aria-valuemax='100' style='width: 1%'>    <span class='sr-only'> 40% Complete (success) </span>    </div>    </div>    </div>    <div class='col-md-3'>    <button class='gradient-btn2 round-btn2 modal-pause-btn'><span  class='btn-caption span-delete'>アップロード</span>    </button>    <button class='gradient-btn3 round-btn2 btn-stop modal-stop-btn'><span class='btn-caption span-delete'>キャンセル</span>    </button>    </div></div>";

  $('#user-form').submit(function (e) {
    e.preventDefault();

    var userData = $(this).serializeFormJSON();
    userData.avatar = $('#img-avatar').attr('src');
    $.post('/user-setting', userData)
      .success(function (res) {
        if (res.redirectUrl)
          window.location = res.redirectUrl;
      })
      .error(function (err) {
        var errData = err.responseJSON;
      })
  });

  //*
  $('#pdf_fileupload').fileupload({
   //*/
    dataType: 'json',
    autoUpload: false,
    url: "/room-api/share-files",
    done: function (e, data) {
      //Make Individual Upload Button Disable
      refresh_data_table();

      //Count uploaded done files
      if (done_count == -1) {
        done_count = 1;
      } else {
        done_count++;
      }

      //Once each file uploaded done
      $.each(data.files, function (index, file) {


        $('#' + file.size + '_btn').attr('disabled', true);
        $('#' + file.size + '_abort').attr('disabled', true);
        var file_name_val = $('#file_name_' + file.size).val();


        //Set uploaded to true in files_array
        for (i = 0; i < files_array.length; i++) {
          if (files_array[i].file.size == file.size && files_array[i].uploaded == false) {
            files_array[i].uploaded = true;
          }
        }
        //Remove input tag and take value to its parent
        var parent = $('#file_name_' + file.size).parent();
        $('#file_name_' + file.size).remove();
        parent.text(file_name_val);
      });

      //!*!/Make Upload All Button Disable
      if (done_count == files_array.length) {
        $('#upload_all').attr('disabled', true);
        $('#remove_all').attr('disabled', true);
      }
    },
    fail: function (e, data) {
    },
    progress: function (e, data) {
      $.each(data.files, function (index, file) {
        $('#' + file.size).css('width', (100 * (data._progress.loaded / data._progress.total)) + '%');
      })
    },
    progressall: function (e, data) {
    },
    start: function (e, data) {
    },
    submit: function (e, data) {
    },
    add: function (e, data) {
      var last_modified = data.files[0].size;
      var data_file = data.files[0];
      var add_flag = true;
      $.each(files_array, function (index, file) {
        if ((data_file.name == file.file.name) && (data_file.size == file.file.size) && (data_file.lastModified == file.file.lastModified)) {
          alert('Already Uploaded');
          add_flag = false;
        }
      })

      if (add_flag) {
        $('#upload_all').attr('disabled', false);
        $('#remove_all').attr('disabled', false);
        files_array.push({file: data.files[0], uploaded: false});
        var file_name = data.files[0].name;

        var progress_html = "<div class='col-md-12'> <div class='col-md-2 word-wrap'>" + file_name + "</div><div class='col-md-2'><input type='text' placeholder='File Name' class='col-md-12' name='file_name_" + last_modified + "' id='file_name_" + last_modified + "'/></div><div class='col-md-4 progress-top-margin'><div class='progress'><div class='progress-bar progress-bar-success' role='progressbar' id='" + data.files[0].size + "' aria-valuenow='1' aria-valuemin='0'  aria-valuemax='100' style='width: 1%'>    <span class='sr-only'> 40% Complete (success) </span>    </div>    </div>    </div>    <div class='col-md-3'>    <button class='gradient-btn2 round-btn2 modal-pause-btn' id='" + data.files[0].size + "_btn'><span  class='btn-caption span-delete'>アップロード</span>    </button>    <button class='gradient-btn3 round-btn2 btn-stop modal-stop-btn' id='" + data.files[0].size + "_abort'><span class='btn-caption span-delete'>キャンセル</span>    </button>    </div></div>";
        var new_html = $(progress_html);
        new_html.find('label').text(file_name);
        $('#progress_panel').append(new_html);
        var upload_btn = $('#' + data.files[0].size + '_btn');//$('#progress_panel').children().eq(0).children().eq(2).children().eq(0);
        var abort_btn = $('#' + data.files[0].size + '_abort');

        upload_btn.click(uploadAction);
        abort_btn.click(abortAction);
      }
    },
    send: function (e, data) {
    }
  });//*/

  var uploadAction = function () {
    var progress_bar = $(this).parent().prev().children().eq(0).children(0);
    var pro_id = progress_bar.attr('id');
    sendAddedFile(pro_id);
  };

  var sendAddedFile = function (pro_id) {
    var file_send = [];
    var fileName = $('#file_name_' + pro_id).val();
    for (i = 0; i < files_array.length; i++) {
      if (files_array[i].file.size == pro_id && files_array[i].uploaded == false) {
        file_send.push(files_array[i].file);
        if (files_array[i].file.type == 'application/pdf') {
          $('#pdf_fileupload').fileupload().fileupload('send', {
            files: file_send,
            url: '/room-api/share-files',
            formData: {
              file_name: fileName,
              share_type: 'pdf',
              room_id: room_name,
              uploader: my_data._id,
            }
          });
        } else if (files_array[i].file.type.indexOf('image/') >= 0) {
          $('#pdf_fileupload').fileupload().fileupload('send', {
            files: file_send,
            url: '/room-api/share-files',
            formData: {
              file_name: fileName,
              share_type: 'image',
              room_id: room_name,
              uploader: my_data._id,
            }
          });
        } else if (files_array[i].file.type.indexOf('video/') >= 0) {
          $('#pdf_fileupload').fileupload().fileupload('send', {
            files: file_send,
            url: '/room-api/share-files',
            formData: {
              file_name: fileName,
              share_type: 'media',
              room_id: room_name,
              uploader: my_data._id,
            }
          });
        } else {
          $('#pdf_fileupload').fileupload().fileupload('send', {
            files: file_send,
            url: '/room-api/share-files',
            formData: {
              file_name: fileName,
              share_type: 'other',
              room_id: room_name,
              uploader: my_data._id,
            }
          });
        }
      }
    }
  };

  var abortAction = function () {
    var progress_bar = $(this).parent().prev().children().eq(0).children(0);
    var pro_id = progress_bar.attr('id');
    var pro_cur_bar = $(this).parent().parent();
    var file_send = [];
    for (i = 0; i < files_array.length; i++) {
      if (files_array[i].file.size == pro_id) {
        files_array.splice(i, 1);
        pro_cur_bar.hide();
      }
    }
  };

  $('#upload_all').click(function () {
    is_upload_all = true;
    //$('#pdf_fileupload').fileupload().fileupload('send', {files: files_array, url:'/room-api/share-files'});
    $('.progress-bar-success').each(function (index, progress) {
      var pro_id = $(progress).attr('id');
      sendAddedFile(pro_id);
    })
  });

  $('#remove_all').click(function () {
    var pro_cur_bar = $('#progress_panel');
    $.each(pro_cur_bar.children(), function (index, child) {
      child.remove();
    });
    files_array = [];
  })
});

function upload_pdf() {
  $('#pdf_fileupload').attr('accept', 'application/pdf');
  $('#pdf_fileupload').click();
}

function upload_image() {
  $('#pdf_fileupload').attr('accept', 'image/*');
  $('#pdf_fileupload').click();
}

function upload_media() {
  $('#pdf_fileupload').attr('accept', 'video/*');
  $('#pdf_fileupload').click();
}

function upload_other() {
  $('#pdf_fileupload').attr('accept', '*/*');
  $('#pdf_fileupload').click();
}
