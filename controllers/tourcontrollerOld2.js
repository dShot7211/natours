/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('../models/tourModal');
// ***************
// how to make some predefined filter like for some common data a client will request
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    // 1- Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // chat way of removing fields not in the schema as done above
    // In this way we can get the values if they exist and if they not they will be stored as undefined.
    //  All the values that weren't destructured in any variable (the rest of the query fields) will be stored in the queryObj
    // const { page, sort, limit, fields, ...queryObj } = req.query;

    // const query = Tour.find(queryObj);
    // EXECUTE QUERY
    //  const tours = await query;

    // 2- Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    let query = Tour.find(JSON.parse(queryStr));

    // 3- Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.replace(/,/g, ' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt _id');
    }
    // chat way of sorting
    // query = req.query.sort
    //   ? query.sort(req.query.sort.replace(/,/g, ''))
    //   : query.sort('-createdAt');

    // 4- Fields Limiting -- include only some of the fields in the api response
    if (req.query.fields) {
      const fields = req.query.fields.replace(/,/g, ' ');
      query = query.select(fields);
    } else {
      // -__v ---> exclude the __v field
      query.select('-__v');
    }

    // 5-  Pagination
    // see the comments of the 99 video on mixing the sort and the skip in mongoose
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    console.log('skip', skip);

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      console.log('numTours', numTours);
      if (skip >= numTours) throw new Error('This page does not exist');
    }
    // EXECUTE QUERY
    const tours = await query;

    // *****************
    // other way of writing filter query
    // const query= Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    // *********

    // find all tours without any filtering
    // const tours = await Tour.find();
    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: { msg: '🚫🚭🔕🚳🚯', error },
    });
  }
};
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // const tour = await Tour.find({ _id: req.params.id }); //get tour using  find only
    // const tour = await Tour.findOne({_id:req.params.id})
    // eslint-disable-next-line no-unused-expressions
    tour
      ? res.status(200).json({
          status: 'success',
          // this req.requestedTime is middleware see in the newFileStruct3 file
          requestedAt: req.requestedTime,
          data: { tour },
        })
      : res.status(404).json({
          status: 'fail',
          message: { msg: 'Tour Not found🚫🚭🔕🚳🚯' },
        });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: { msg: '🚫🚭🔕🚳🚯', error },
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid Data Sent!🚫🚭🔕🚳🚯',
    });
  }
};

//one way of creating a document/row in db
// const tour = new Tour({})
// tour.save()

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: { msg: '🚫🚭🔕🚳🚯', error },
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: { msg: '🚫🚭🔕🚳🚯', error },
    });
  }
};
