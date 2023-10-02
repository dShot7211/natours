const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// tour images
// now the image will be stored as a buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

// this is multer configuration obj
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  // req.files
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// if we only had one field that accepts multiple images we could have done it
// images = name of the field and then max count 5
// upload.array('images', 5);  req.files
// upload.single('image') req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2)
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

// ***************
// how to make some predefined filter like for some common data a client will request
// req.query.limit we will only get 5 responses
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

// old controller before factory function
// exports.getAllTours = catchAsync(async (req, res) => {
//   // Tour.find() will return a query, and req.query in the query sting from front end
//   // so we can chain more methods to Tour.find

//   // const features = new APIFeatures(Tour.find().populate('reviews'), req.query)
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();
//   // console.log('api features', features);
//   const tours = await features.query;

//   // ********************************
//   // 127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy
//   // {duration:'5',difficulty:'easy'}

//   // one way of query with the filter object , we pass the filter object inside the find
//   // const tours = await Tour.find(req.query)

//   // other way of writing filter query using mongoose methods
//   // const query= Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');
//   // *********

//   // find all tours without any filtering/ MAKING A QUERY
//   // const tours = await Tour.find();
//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: { tours },
//   });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// old way before factory methods vid163
// exports.getTour = catchAsync(async (req, res, next) => {
//   // vid 153 to populate the id stored in the guides array of a single tour so we also get the data of guides
//   //  but in the DB we still only have the Id's of guides

//   // const tour = await Tour.findById(req.params.id).populate('guides');
//   // the populate function can also be used to remove fields from the respose
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // const tour = await Tour.find({ _id: req.params.id }); //get tour using  find only
//   // const tour = await Tour.findOne({_id:req.params.id})
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     // this req.requestedTime is middleware see in the newFileStruct3 file
//     requestedAt: req.requestedTime,
//     data: { tour },
//   });
// });

// see vid 116 forthe full explanation of the catchAsync func here 7:30 min
//  the catchAsync func should also return a function and not call a function
// straight away and rather express should call the createTour func when
//  anyone hits this route
// the common func for delete vid162 it is implemeted lateer than the below old create code
exports.createTour = factory.createOne(Tour);

// exports.createTour = catchAsync(async (req, res, next) => {
// const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: { tour: newTour },
//   });

//----------------- this is even older create document code
// exports.createTour = async (req, res, next) => {
// try {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: { tour: newTour },
//   });
// } catch (error) {
//   res.status(400).json({
//     status: 'fail',
//     error: { message: error.message },
//   });
// }
// };
//  });
// ---------------------------------------------------
//one way of creating a document/row in db
// const tour = new Tour({})
// tour.save()
// tour.create =>  const newTour = await Tour.create(req.body);
// --------------------------------------------------------------------

// the common func for delete vid162 it is implemeted lateer than the below old delete code
exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(200).json({ status: 'success', data: { tour } });
// });

// the common func for delete vid161 it is implemeted lateer than the below old delete co
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }
//   res.status(204).json({ status: 'success', data: null });
// });

exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        // _id: '$ratingAverage',

        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
    // { $match: { _id: { $ne: 'easy' } } },
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  console.log(year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStats: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// tours-distance?distance=233&center-=-42,45&unit=mi
// exports.getToursWithin = catchAsync(async (req, res, next) => {
//   const { distance, latlng, unit } = req.params;
//   const [lat, lng] = latlng.split(',');
//   // this radius is in radians we get radians by div by earth radis
//   const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
//   // 3963.2 6378  are radius of earth in mi and km
//   if (!lat || !lng) {
//     next(
//       new AppError(
//         'Please povide latitude and longitude in the format lat,lng',
//         400
//       )
//     );
//   }
//   const tours = await Tour.find({
//     // we also need to add index to start location , geospacial column in db
//     startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
//   });
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       data: tours,
//     },
//   });
// });
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // this radius is in radians we get radians by div by earth radis
  // 3963.2 6378  are radius of earth in mi and km

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please povide latitude and longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    // this is the only geospacial aggreation pipeline stage that exists this always needs to be the first one in the pipeline
    // geoNear always needs to be the first stage
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier, // to make distance from meters to km
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
