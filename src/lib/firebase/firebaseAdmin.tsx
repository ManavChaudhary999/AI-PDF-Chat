// Server Side FIrebase SDK

import { initializeApp,getApps, getApp, App, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const serviceAccount = require("@root/firebase_admin_key.json");

let app: App;

if (!getApps().length) {
    app = initializeApp({
        // credential: cert(serviceAccount),
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
    });
} else {
    app = getApp();
}

export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);

export { app as adminApp };