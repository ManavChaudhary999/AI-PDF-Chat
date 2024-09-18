import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCuRHTa3hwQFsw9BcA_UF03htGPLJ7s0yI",
    authDomain: "chat-with-pdf-5895a.firebaseapp.com",
    projectId: "chat-with-pdf-5895a",
    storageBucket: "chat-with-pdf-5895a.appspot.com",
    messagingSenderId: "679219442544",
    appId: "1:679219442544:web:36dc1655fee9aca70cd5b5"
};

// Initialize Firebase as a singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };