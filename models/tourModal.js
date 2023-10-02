/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');

//1
const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less or equal then 40 characters'],
      minlength: [10, 'A tour must have less or equal then 10  characters'],
      // we could have used the same syntax as used in priceDiscount field below
      // for demo only - we can also use external library for validation too
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A Tour Must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour Must have difficulty'],
      // emun is only for strings
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy, medium, difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      // min max works on dates too
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      // see the validate in the userModel too
      // we pass 2 things to validate, a validation func, and error message
      validate: {
        validator: function (val) {
          // this only points to current document on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price ',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    // image taken as array of strings.
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      // if we want  not to send this field to the client we can use select property on the schema
      select: false,
    },
    startDates: [Date], // we expect an array of Dates in this field
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON in order to specify geospacial data
      // the object which we are inside is no longer for schema type options obj it is geoSpacial obj
      // in order for this obj to be recongnized as geoSpacial obj we need corrdinates and type of type string and should be point or polygon
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'], // define what values this field will take // point is the geometrical point, it can be circle triangle , polygon etc
      },
      coordinates: [Number], //  we expect an array of numbers in this field
      address: String,
      description: String,
    },
    // *** for us to embedd an document in an document like tour we have to make it an array
    // embedd locations document  in the tour document, the below column in db is the array of the above locations startLoacation
    locations: [
      // the whole below object is schemaType of mongoose
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    // vid152 10.2  The BETTER approach REFRENCING HERE THE Tours and Guides will be completly seperate entities and all we save on the tour is the id's of the guides

    guides: [
      // the whole below object is schemaType of mongoose, to refrence other dataSets/ Documents we have this ref:'User'
      { type: mongoose.Schema.ObjectId, ref: 'User' },
    ],
  },
  //    what this does is to make sure to have virtual property/ a field that is not stored in the db but calculated using some other value
  // we want this to also show up when ever there is an output
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// viid 167 indexes to reduce the query time
toursSchema.index({ slug: 1 }); // this is normal indexing

// this is compound indexing , mix of 2 or more fields
toursSchema.index({ price: 1, ratingAverage: -1 }); // 1 means we are storing the prices in an ascending order -1 means descending order

toursSchema.index({ startLocation: '2dsphere' });

toursSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// virtual populate , it is not defined in schemea but still comming in the respose
toursSchema.virtual('reviews', {
  ref: 'Review', // 'Review is the name of reviews modal'
  foreignField: 'tour', // forign field is the one coming from outside like from Review modal. the id comming from the reviewmodal wll be stored in the localFiled = in _id
  localField: '_id', // this _id in the localmodal/ tour modal is called tour in the review modal
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() and not for update()
toursSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// { 10.1 vid151
// this approach is EMBEDDING and has drawbacks like if some guide updates its email or its role from guide to lead-guide , then we have to
// check if that guide is in the tour and update the tour info  there as well, INSTEAD WE WILL USE REFRENCING NOT EMBEDDING

//   get the guides from the tour id's which comes from the post request of creating new tour | we use the pre middleware.
//  this pre middle ware workes only on creating new documents notupdating them so we have to do this same on update as well
// -------------------
// toursSchema.pre('save', async function (next) {
// this findById returs promises which we have to await
// const guides = this.guides.map((id) => User.findById(id));
// this.guides = await Promise.all(guides);
// console.log(await Promise.all(guides));
// next();
// });
// ------------
// }

// toursSchema.pre('save', function (next) {
//   console.log('will ssave document');
//   next();
// });

// // eslint-disable-next-line prefer-arrow-callback
// toursSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// in Query middleware this Always points to the current query
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// 11 vid153
toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides', // the guides is the same as the field name in the above schema
    select: '-__v -passwordChange',
  });
  next();
});

toursSchema.post(/^find/, function (docs, next) {
  console.log(`query took ${Date.now() - this.start} milliseconds`);

  next();
});

// AGGREGATION MIDDLEWARE - points to the current aggregation object
// toursSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // console.log(this.pipeline());
//   next();
// });
// {
//   type:String,
//    required: [true, 'A tour must have a name'],
// },
// the above obj is schema type options, the string here is the error message in the array required

// 2now create a model out ofthe schema we have created
const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;
