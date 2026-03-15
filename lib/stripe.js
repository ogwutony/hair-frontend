import Stripe from 'stripe';

// This ensures the secret key is pulled from your .env file
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);