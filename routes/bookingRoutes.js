const express = require('express');

const router = express.Router();
// merge params to get the paramas from dfferent router get tourId from tour Router
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
