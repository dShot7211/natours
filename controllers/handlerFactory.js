// we are making a function that returns us  a function , here a controller
// we will make this controller to delete update create a document/table, if well take modal as a argument

const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({ status: 'success', data: null });
  });

exports.updateOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    const document = await Modal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({ status: 'success', data: { data: document } });
  });

exports.createOne = (Modal) =>
  catchAsync(async (req, res, next) => {
    const document = await Modal.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { data: document },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // 1 create a query
    // 2 if populate then add it to the query
    // 3 the await the query to get the response

    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const document = await query;
    // normal way
    // const document = await Model.findById(req.params.id).populate('reviews');

    if (!document) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestedTime,
      data: { data: document },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // Tour.find() will return a query, and req.query in the query sting from front end
    // so we can chain more methods to Tour.find

    // const features = new APIFeatures(Tour.find().populate('reviews'), req.query)
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    // console.log('api features', features);
    // vid167 explain
    // const documents = await features.query.explain();
    const documents = await features.query;

    res.status(200).json({
      status: 'success',
      results: documents.length,
      data: { data: documents },
    });
  });
