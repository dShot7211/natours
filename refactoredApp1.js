const express = require('express');
const fs = require('fs');
const morgan = require('morgan');

const app = express();

// 8
app.use(morgan('dev'));

// middleware
app.use(express.json());

// 7 definig our own middlewares
app.use((req, res, next) => {
  console.log('Helllo from the middleware 👋');
  next();
});
// we can add something to the req body with the help of the middleware
// we added current time to each request
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});
// ***************
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestedTime,
    results: tours.length,
    data: { tours },
  });
};
const getTour = (req, res) => {
  // ********* trick to make a string that is number  a int value
  const passedId = req.params.id * 1;
  const tour = tours.find((item) => item.id === passedId);

  // if (passedId > tours.length) {
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res.status(200).json({ status: 'success', data: { tour } });
};

const createTour = (req, res) => {
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

const updateTour = (req, res) => {
  const passedId = req.params.id * 1;
  if (passedId > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res
    .status(200)
    .json({ status: 'success', data: { tour: 'updated tour here' } });
};

const deleteTour = (req, res) => {
  const passedId = req.params.id * 1;
  if (passedId > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res.status(204).json({ status: 'success', data: null });
};
// user functions
const getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This rote is not yet defined!' });
};
const getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This rote is not yet defined!' });
};
const createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This rote is not yet defined!' });
};
const updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This rote is not yet defined!' });
};
const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This rote is not yet defined!' });
};

// ALL THE OLD ROUTES
//2
// app.get('/api/v1/tours', getAllTours);

// 3
// app.post('/api/v1/tours', createTour);
//
//4 :id means we are creating a variable in the url iwht name of id
// OPTIONAL PARAM /api/v1/tours/:id/:somethis?  ? this makes param  optional
// app.get('/api/v1/tours/:id', getTour);
//
// 4the patch request
// app.patch('/api/v1/tours/:id', updateTour);

// 5the delete request
// app.delete('/api/v1/tours/:id', deleteTour);
//************************** */
//
//
// 6 new way of defining the above routes
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

// 9 making user routes
app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
//
//
//
//1
// app.get('/', (req, res) => {
//   res.status(200).json({ message: 'Hello From The Dark Side', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You Can use Post Method To this Url....');
// });

const port = 3000;
app.listen(port, () => {
  console.log(`App Running on Port ${port}`);
});
