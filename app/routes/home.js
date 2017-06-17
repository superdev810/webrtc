var express = require('express'),
  router = express.Router(),
  path = require('path');

var HomeController = require('../controllers/home'),
    RoomController = require('../controllers/room'),
    AuthController = require('../controllers/auth'),
    UsersController = require('../controllers/users');

var detect_policy = function(req, res, next){
  if (!req.user || !req.user._id)
    return res.status(403).json({message: 'User is not authorized'});
  else
    next();
};

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', HomeController.index);
router.post('/create-room', detect_policy, HomeController.create_room);
router.post('/check-validate', detect_policy, RoomController.validate_name);
router.post('/confirm-create-room', detect_policy, RoomController.confirm_room);

router.post('/send-invite', detect_policy, RoomController.send_invite);
router.post('/change-owner', detect_policy, RoomController.change_owner);
router.get('/change-owner', detect_policy, RoomController.change_owner_page);
router.post('/refuse-owner', detect_policy, RoomController.refuse_owner);
/*
router.get('/invite-room', RoomController.invite_room);
router.post('/invite-room', RoomController.detect_inviter_setting);
*/
router.get('/user-setting', detect_policy, RoomController.inviter_user_setting);
router.post('/user-setting', detect_policy, RoomController.confirm_inviter_setting);

router.get('/:room_name', RoomController.enter_room);
router.get('/free/:room_name', RoomController.enter_room)
/* auth routes */
//*
router.post('/auth/signin', AuthController.sign_in_by_page);
router.post('/auth/signup', AuthController.sign_up);
//*/
router.get('/auth/signout', AuthController.logout);

//*
router.get('/users/sign_in', UsersController.sign_in);
//*/
router.get('/users/my_page/profile', detect_policy, UsersController.my_page_profile);
router.post('/users/my_page/profile', detect_policy, UsersController.update_my_profile);

router.get('/users/my_page/room_manage', detect_policy, UsersController.my_page_room_manage);
router.delete('/users/my_page/room_manage', detect_policy, UsersController.remove_room);

router.get('/users/my_page/friend_manage', detect_policy, UsersController.my_page_friend_manage);
router.post('/users/my_page/friend_manage', detect_policy, UsersController.save_friend);
router.delete('/users/my_page/friend_manage', detect_policy, UsersController.delete_friend);
router.post('/users/my_page/free_video',detect_policy, UsersController.create_free_video);

router.post('/users/upload-avatar', detect_policy, UsersController.uploadAvatar);

router.get('/room-api/share-files', detect_policy, RoomController.get_room_files);
router.get('/room-api/share-files/download', detect_policy, RoomController.download_room_file);
router.post('/room-api/share-files', detect_policy, RoomController.add_new_file);
router.delete('/room-api/share-files', detect_policy, RoomController.remove_room_file);
router.post('/room-api/whiteboard-upload', detect_policy, RoomController.whiteboard_upload);
router.post('/room-api/whiteboard-read', detect_policy, RoomController.whiteboard_read);

router.get('/third-api/register-user', AuthController.sign_up_from_moximo);

router.post('/postfile', RoomController.postFile);
