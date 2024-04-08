// /* eslint-disable */
// import axios from 'axios';
// import { showAlert } from './alerts';
// import Stripe from 'stripe';
// const stripe = Stripe(
//   'pk_test_51P33q0029xIM4Cs3CfBaTy990MhTaRRTgdFXEEpOioujFzxP503kZTVw244AnGwGYONNPitrrgeVW0sT2GZFlyxh00Vf77wE7f'
// );

// export const bookTour = async (tourId) => {
//   try {
//     // 1) Get checkout session from API
//     const session = await axios(
//       `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
//     );
//     console.log(session);

//     // 2) Create checkout form + chanre credit card
//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.id,
//     });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };
