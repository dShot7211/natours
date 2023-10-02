const fs = require('fs');
const Tour = require('../models/tourModal');
// ***************
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
exports.checkId = (req, res, next, val) => {
  // console.log(`the tour id: ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  next();
};
// check if body contains the name and price property

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'no name and price is found in the req body',
    });
  }
  next();
};
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestedTime,
    results: tours.length,
    data: { tours },
  });
};
exports.getTour = (req, res) => {
  // ********* trick to make a string that is number  a int value
  const passedId = req.params.id * 1;
  const tour = tours.find((item) => item.id === passedId);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestedTime,
    data: { tour },
  });
};

exports.createTour = (req, res) => {
  // get the id of the last tour in the data
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({ status: 'success', data: { tour: newTour } });
    }
  );
};

exports.updateTour = (req, res) => {
  res
    .status(200)
    .json({ status: 'success', data: { tour: 'updated tour here' } });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({ status: 'success', data: null });
};
