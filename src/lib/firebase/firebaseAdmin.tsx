import { initializeApp, getApps, getApp, App, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require("@root/firebase_admin_key.json");

let app: App;

if (!getApps().length) {
    app = initializeApp({
        credential: cert(serviceAccount),
    });
} else {
    app = getApp();
}

export const adminDb = getFirestore(app);
export { app as adminApp };