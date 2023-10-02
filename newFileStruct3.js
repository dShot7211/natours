const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
// the path create a path joining the directory name /views
app.set('views', path.join(__dirname, 'views'));

// 12 serve static files like images html files etc
// we use middlware
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Golbal middlewares
// helmet = Set  security Http headers vid 144
app.use(helmet());

//////////////////////////////////////////
// this below code is just for showing map
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com/',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/',
  'https://*.stripe.com',
  'https:',
  'data:',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
  'https:',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com/',
  'http://127.0.0.1:3000',
];
const fontSrcUrls = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'https:',
  'data:',
];
const frameSrcUrls = ['https://*.stripe.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      baseUri: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'data:', 'blob:'],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
      childSrc: ["'self'", 'blob:'],
      frameSrc: ["'self'", ...frameSrcUrls],
      upgradeInsecureRequests: [],
    },
  })
);
app.use(helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' }));
// ///////////////////////////////////////////////////
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  this limiter is basically a middleware func . Ratelimit creates a middleware func vid 143
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request form this Ip, pleasse try again in a hour!',
});
app.use('/api', limiter);

// 8
// Body parser, reading data from the body in req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
// Data sanitization against NoSQL query injection vid 145
app.use(mongoSanitize());
// Data sanitazation agains  XSS cross site scripting vid 145
app.use(xss());
// prevent parameter pollution vid 146
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// 7 definig our own middlewares
// app.use((req, res, next) => {
//   console.log('Helllo from the middleware 👋');
//   next();
// });

// Test middleware
// we can add something to the req body with the help of the middleware
// we added current time to each request
app.use((req, res, next) => {
  req.requestedTime = new Date().toISOString();
  next();
});

// views routes
app.use('/', viewRouter);

// 11 the tourRouter is also a middleware(middleware function) and we want to use that middleware on
// /api/v1/tours this specific route
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// this will trigger when an undefined route is hit
app.all('*', (req, res, next) => {
  //
  // this functionality is shifted to appError file
  // the built in error class only accepts a message
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);

  // err.status = 'fail';
  // err.statusCode = 404;

  // if the next func receives an argument express will know there was a error
  // whatever we pass into next will be the error
  // and the error will be handled in the global error handler .
  // that applies to every single next in the whole app

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 4 arguments express automatically thinks its an error handling middleware
app.use(globalErrorHandler);
module.exports = app;

// whole req and res passage
//  incomming req => middleware stack => route of the req get matched in the middleware stack=> the middleware func runs on that matched route =>
//  then the sub routes on that middleware func runs
