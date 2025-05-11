import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDY_zfFLALYBqbwKfqEkVT5OL2rF4cCQmw",
  authDomain: "paf-agriapp.firebaseapp.com",
  projectId: "paf-agriapp",
  storageBucket: "paf-agriapp.firebasestorage.app",
  messagingSenderId: "409013271527",
  appId: "1:409013271527:web:4598cfc614c07e792e5b42",
  measurementId: "G-HMTEK1H07Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;