const express = require('express');
const fs = require('fs');

const app = express();
// middleware
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//2
app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', results: tours.length, data: { tours } });
});

// 3
app.post('/api/v1/tours', (req, res) => {
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
});
//

// ************************************
//3 :id means we are creating a variable in the url iwht name of id
// OPTIONAL PARAM /api/v1/tours/:id/:somethis?  ? this makes param  optional
app.get('/api/v1/tours/:id', (req, res) => {
  // ********* trick to make a string that is number  a int value
  const passedId = req.params.id * 1;
  const tour = tours.find((item) => item.id === passedId);

  // if (passedId > tours.length) {
  if (!tour) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res.status(200).json({ status: 'success', data: { tour } });
});
//
//
//
// ************************************
// 4the patch request
app.patch('/api/v1/tours/:id', (req, res) => {
  const passedId = req.params.id * 1;
  if (passedId > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res
    .status(200)
    .json({ status: 'success', data: { tour: 'updated tour here' } });
});

// 4the delete request
app.delete('/api/v1/tours/:id', (req, res) => {
  const passedId = req.params.id * 1;
  if (passedId > tours.length) {
    return res.status(404).json({ status: 'fail', message: 'Invalid Id' });
  }
  res.status(204).json({ status: 'success', data: null });
});

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
