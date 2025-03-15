// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "flora-shop-434f2.firebaseapp.com",
  projectId: "flora-shop-434f2",
  storageBucket: "flora-shop-434f2.appspot.com",
  messagingSenderId: "419887444698",
  appId: "1:419887444698:web:d06c5eefa89ed78af02be3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);