import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyA1ke41SGYMjEEqkQFjxyVgSuxJC9DFMKk",
    authDomain: "penalty-portal.firebaseapp.com",
    projectId: "penalty-portal",
    storageBucket: "penalty-portal.appspot.com",
    messagingSenderId: "648995389890",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
