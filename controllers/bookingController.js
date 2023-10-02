const stripe = require('stripe')(
  'sk_test_51NZWFNSC3K7F0fmd7EkUcLFGyGOPviRKwCDhcdSPh3fjJNdH7T9EW0xFKvZPfowN0UjPO1i63Ibs0GDfq4WbOBoD00xeMcer3i'
);
const Booking = require('../models/bookingModel');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModal');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //   2) create a checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], //required
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`, //required
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, //required
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        // name: `${tour.name} Tour`,
        // images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],

        price_data: {
          currency: 'inr',
          product_data: {
            description: tour.summary,
            name: `${tour.name} Tour`,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },

        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  //   3) create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
  next();
});

// CRUD - create read update delete

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
