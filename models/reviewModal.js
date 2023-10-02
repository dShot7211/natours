const mongoose = require('mongoose');
const Tour = require('./tourModal');

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String, required: [true, 'Review can not be empty'] },
    rating: {
      type: Number,
      required: [true, 'A Review Must contain a rating'],
      min: 1,
      max: 5,
    },
    createdAt: { type: Date, default: Date.now },
    // REFRENCING
    //   this is parentRefrencing in the tour and user both , as a review is a child of both tour and user, we ref the parents here
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour'],
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to user'],
    },
  },
  //    what this does is to make sure to have virtual property/ a field that is not stored in the db but calculated using some other value
  // we want this to also show up when ever there is an output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// vid156 populate the reviews with tour and user data we do it on query so find query match

reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: 'name' }).populate({
  // the tour is the same as the field name in the above schema and select does show only name filed in the output
  // path: 'user',
  // select: 'name photo',
  // });

  this.populate({
    // the tour is the same as the field name in the above schema and select does show only name filed in the output
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this points to the current model in statics method & we always call aggreage on the model
  // aggreage returns a promise
  const stats = await this.aggregate([
    //1 select the tour which we want to update
    {
      $match: { tour: tourId },
    },
    {
      // 1 we give _id in that the common field that all the docs have in common that we want to group by
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log('stats', stats);
  if (stats.length > 0) {
    // now save the stats in the tour document
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingAverage: 4.5,
    });
  }
};

// post middleware does not get access to next
reviewSchema.post('save', function () {
  // this.tour = this points to current review, current document that is about to be saved

  // but this.constructor points to the modal that created the document and the calcAverageRating func can only be used on a model, not a doucment
  // the model we are looking for here is Review but we have that initialized after this funcion , so we cant use const Reveiw here so we use this.constructor

  this.constructor.calcAverageRatings(this.tour);
  // Review.calcAverageRatings(this.tour);
});

// vid169 THIS IS JONAS WAY
// findByIdAndUpdate
// findByIdAndDelete
// these only has query middlewares and not document middleware
//  just watch vid169 from 14:00
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});
// THIS IS THE CHAT WAY not working for me
// eslint-disable-next-line prefer-arrow-callback
// reviewSchema.post(/^findOneAnd/, async function (doc) {
//   await doc.constructor.calcAverageRatings(doc.tour);
// });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
