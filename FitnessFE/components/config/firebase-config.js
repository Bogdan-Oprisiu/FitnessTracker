import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD-EiUkkCSlYM3WgUNxOAJsB_ZLNlHUS9o",
  authDomain: "fitnesstracker-5909f.firebaseapp.com",
  projectId: "fitnesstracker-5909f",
  storageBucket: "fitnesstracker-5909f.appspot.com",
  messagingSenderId: "199396170118",
  appId: "1:199396170118:web:cab21019b48d0e95447407",
  measurementId: "G-8NCM1ZX98M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);