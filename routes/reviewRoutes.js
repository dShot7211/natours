const express = require('express');

const router = express.Router({ mergeParams: true });
// merge params to get the paramas from dfferent router get tourId from tour Router
const reviewController = require('../controllers/reviewContoller');
const authController = require('../controllers/authController');

// POST tour/25452fd/reviews
// GET tour/25452fd/reviews
// POST /reviews
// all the routes with this pattern will go in the below code

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updteReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
