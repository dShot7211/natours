const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// if we put a middleware/ route before all the routes then that middleware will run before all the below ones
// this middleware just puts the user on the all the templates see the isLoggedIn controller
router.use(authController.isLoggedIn);

// views we render from the views directory
// it will go to the views folder and look for the file named base
// the obj we pass in the render func, can be taken out in the base.pug file and the data is called locals there

router.get(
  '/',
  bookingController.createBookingCheckout,
  viewsController.getOverview
);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
