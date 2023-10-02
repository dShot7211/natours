/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51NZWFNSC3K7F0fmdbVKvQsUQ91XLIe0a1BntWwWKYuBqMR3Rjjf83h7yo0WsaoGy3SMsIAHJli5bOotu0pDUI0QR00ptIZ6QJv'
    ); // we get Stripe from the script that we included in tour.pug
    console.log('stripe', stripe);
    // 1) Get checkout session from API
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log('session=>', session);
    // 2) Create checkout form + charge credit card
    // await stripe.redirectToCheckout({     //DEPRICATED
    //   sessionId: session.data.session.id,
    // });
    const checkoutPageUrl = session.data.session.url;
    window.location.assign(checkoutPageUrl);
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};

// connect this func to the button we go to index.js in js folder.
