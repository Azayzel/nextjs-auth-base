import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_CLIENT_SECRET ?? '', {
  apiVersion: '2025-03-31.basil',
});

export default stripe;
