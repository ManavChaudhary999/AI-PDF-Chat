import { initializeApp, ServiceAccount,getApps, getApp, App, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("@root/firebase_admin_key.json");

let app: App;

if (!getApps().length) {
    app = initializeApp({
        // credential: cert(serviceAccount),
        credential: cert({
            // type: process.env.FIREBASE_TYPE,
            projectId: process.env.FIREBASE_PROJECT_ID,
            // private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // client_id: process.env.FIREBASE_CLIENT_ID,
            // auth_uri: process.env.FIREBASE_AUTH_URI,
            // token_uri: process.env.FIREBASE_TOKEN_URI,
            // auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
            // client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
            // universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
        }),
    });
} else {
    app = getApp();
}

export const adminDb = getFirestore(app);
export { app as adminApp };