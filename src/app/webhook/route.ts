import { adminDb } from "@/lib/firebase/firebaseAdmin";
import stripe from "@/lib/stripe/stripe";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import Stripe from "stripe";

// Run "stripe listen --forward-to localhost:3000/webhook" in another terminal

export async function POST(req: NextRequest) {
    const headersList = headers();
    const body = await req.text();
    const signature = headersList.get("stripe-signature");

    if(!signature) {
        return new Response("No signature", { status: 400 });
    }

    if(!process.env.STRIPE_WEBHOOK_SECRET) {
        return new Response("No webhook secret", { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (e) {
        console.error(e);
        return new Response("Webhook error", { status: 400 });
    }

    const getUserDetails = async (customerId: string) => {
        const userDoc = await adminDb
        .collection("users")
        .where("stripeCustomerId", "==", customerId)
        .limit(1)
        .get();

        return userDoc?.docs[0];
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
        case 'payment_intent.succeeded': {
            const invoice = event.data.object;
            const customerId = invoice.customer as string;

            const userDetails = await getUserDetails(customerId);
            if(!userDetails?.id) {
                return new Response("User not found", { status: 400 });
            }

            await adminDb.collection("users").doc(userDetails?.id).update({
                hasActiveMembership: true,
            });
            
            break;
        }

        case 'customer.subscription.deleted':
        case 'subscription_schedule.canceled': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            const userDetails = await getUserDetails(customerId);
            if(!userDetails) {
                return new Response("User not found", { status: 400 });
            }

            await adminDb.collection("users").doc(userDetails?.id).update({
                hasActiveMembership: false,
            });

            break;
        }

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return Response.json({ message: "Webhook Recieved" });
}