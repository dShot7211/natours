const express = require('express');

const authController = require('../controllers/authController');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  upadateMe,
  deleteMe,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controllers/userController');

const router = express.Router();
// one more way to create route little diff then below routes
//  the below one users rest architecture
// as the route name should not be same as the operation we want to perform this is one rule of rest architecture
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', getMe, getUser);
// the protect method pust the user on the request object
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, upadateMe);
router.delete('/deleteMe', deleteMe);

router.use(authController.restrictTo('admin'));
// 9 making user routes
router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
