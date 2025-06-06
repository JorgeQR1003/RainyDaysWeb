// lib/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYz-TAaFNvmllU0QddGaMA1pjSuRs5kRM",
  authDomain: "rainydays-97052.firebaseapp.com",
  projectId: "rainydays-97052",
  storageBucket: "rainydays-97052.appspot.com",
  messagingSenderId: "145989806707",
  appId: "1:145989806707:web:617bfb3b3b93061ac35806"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
