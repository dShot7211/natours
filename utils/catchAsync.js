// fn is the arg of catchAsync , req, res, next is arg of fn function
// we will return a func from catchAsync so that express calls it when this route is callled
// see in 116 video

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: { tour: newTour },
//   });

// we need the next fun here so that we can pass the ereror into it
// when we pass any arg into error express automatically considers it an error
//  and the error handler middleware handles it then
// so the  global error  handler can handle it

// we here cannot call the fn function , we should return the fn func from here

// the (req, res, next) => is the func that is being returned from here
module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => next(err));
};

// we here cannot call the fn function ,
//  we should return an anonymous func from here [return (req, res, next) => { ]
//  now after return of the anonymous func we then call the fn func withe
//  the 3  argumentts

// module.exports = (fn) => {
// the below func is the one that express will call
// so the catchAsync should return afunction and not call the func
//   return (req, res, next) => {
//     fn(req, res, next).catch((err) => next(err));
//   };
// };
