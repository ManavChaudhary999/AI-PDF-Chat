// Client Side Stripe SDK

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

if(!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error("Missing Stripe PUBLISHABLE_KEY");   
}

// Singleton Pattern
export default function getStripe() : Promise<Stripe | null> {
    if(!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");
    }

    return stripePromise;
}