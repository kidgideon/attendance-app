// Import the necessary Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXgw5MhcJWu3szUsWOYdtdI8Y6oLhu9pw",
  authDomain: "attendance-website-c3c54.firebaseapp.com",
  projectId: "attendance-website-c3c54",
  storageBucket: "attendance-website-c3c54.appspot.com",
  messagingSenderId: "362636132165",
  appId: "1:362636132165:web:52a420ec00900b0ac0082c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app); // Authentication
export const db = getFirestore(app); // Firestore Database