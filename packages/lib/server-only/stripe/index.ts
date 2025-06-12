/// <reference types="./stripe.d.ts" />
import Stripe from 'stripe';

import { env } from '../../utils/env';

export const stripe = new Stripe(env('NEXT_PRIVATE_STRIPE_API_KEY') ?? '', {
  apiVersion: '2022-11-15',
  typescript: true,
});

export { Stripe };
export async function getTransactions() {
  const payments = await stripe.paymentIntents.list({ limit: 10 });
  console.log('Payments:', payments.data);
  return payments;
}
