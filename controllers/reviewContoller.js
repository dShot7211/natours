const Review = require('../models/reviewModal');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// old controller before the factory functions
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   // check if there is a tour id
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter);
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // req.user is from the protect middleware
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
// old create review , we made a middleware so we set the req body for create review func as the create review func is in generic factory file
// exports.createReview = catchAsync(async (req, res, next) => {
//   // Allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   // req.user is from the protect middleware
//   if (!req.body.user) req.body.user = req.user.id;

//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updteReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
