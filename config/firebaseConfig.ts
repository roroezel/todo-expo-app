import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAY0tp3s2d__RivBaaQPcYxSVBEnq6O5h8",
    authDomain: "todoapp-548e5.firebaseapp.com",
    projectId: "todoapp-548e5",
    storageBucket: "todoapp-548e5.firebasestorage.app",
    messagingSenderId: "605833613302",
    appId: "1:605833613302:web:45b486c02783c195a241d7",
    measurementId: "G-5WGKWRZHKM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Auth safely
export const auth = getAuth(app);

export default app;
