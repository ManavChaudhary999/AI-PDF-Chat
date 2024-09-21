// Server Side Stripe SDK

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_API_KEY;

if(!stripeSecretKey) {
    throw new Error("Missing Stripe API key");
}

const stripe = new Stripe(stripeSecretKey);

export default stripe;