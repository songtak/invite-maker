// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

const FIREBASE_APPKEY = `${import.meta.env.VITE_FIREBASE_APPKEY}`;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlyDcdHtxwv4VPKZQ6cH9GlRVzYZZBb14",

  authDomain: "emoji2026-1fd1c.firebaseapp.com",

  projectId: "emoji2026-1fd1c",

  storageBucket: "emoji2026-1fd1c.firebasestorage.app",

  messagingSenderId: "976406484846",

  appId: "1:976406484846:web:5935df81bb91d441b8137f",

  measurementId: "G-0WBN2RZ9SH",
};

// const firebaseConfig = {
//   apiKey: FIREBASE_APPKEY,
//   authDomain: "emoji2025-f9abc.firebaseapp.com",
//   projectId: "emoji2025-f9abc",
//   storageBucket: "emoji2025-f9abc.firebasestorage.app",
//   messagingSenderId: "23905185557",
//   appId: "1:23905185557:web:96ad5cc4a334d33e9f031c",
//   measurementId: "G-JX8M3NZQ5K",
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);
