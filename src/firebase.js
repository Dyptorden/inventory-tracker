// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCduGP5bml0v-R2vwgBB8RymMPcMBhF1h0",
  authDomain: "inventory-tracker-8c9d7.firebaseapp.com",
  projectId: "inventory-tracker-8c9d7",
  storageBucket: "inventory-tracker-8c9d7.firebasestorage.app",
  messagingSenderId: "879084750445",
  appId: "1:879084750445:web:8766a03b96ae16be2d6164"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;