'use server'

import { UserCheckoutDetailsType } from "@/config";
import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import stripe from "@/lib/stripe/stripe";
import getBaseUrl from "@/lib/getBaseUrl";

export async function createCheckoutSesstion(userDetails: UserCheckoutDetailsType) {
    const { userId } = await auth();
    
    if (!userId) {
        throw new Error("User not found");
    }

    const user = await adminDb
    .collection("users")
    .doc(userId)
    .get();

    let stripeCustomerId = user.data()?.stripeCustomerId;
    
    // If User doesn't have a stripeCustomerId, create one
    if(!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: userDetails.email,
            name: userDetails.name,
            metadata: {
                userId,
            }
        });

        await adminDb
        .collection("users")
        .doc(userId)
        .set({
            stripeCustomerId: customer.id,
        });

        stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price: "price_1Q0LqABFiVHNNowaJIZ4hOMR", // This will fetch price details from Stripe, we can use PRO_PRICE from config too but it will be vulnerable to security.
                quantity: 1
            }
        ],
        mode: 'subscription',
        customer: stripeCustomerId,
        success_url: `${getBaseUrl()}/dashboard?upgrade=true`,
        cancel_url: `${getBaseUrl()}/upgrade`,
    });

    return session.id;
}