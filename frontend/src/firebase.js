// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "dreamworks-studio.firebaseapp.com",
  projectId: "dreamworks-studio",
  storageBucket: "dreamworks-studio.firebasestorage.app",
  messagingSenderId: "982340559036",
  appId: "1:982340559036:web:7143f3488378f3a4ed30b9",
  measurementId: "G-PG1LNDYPDH"
};

export const app = initializeApp(firebaseConfig);
