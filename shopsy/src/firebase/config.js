import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA0x1_DKm12rqVRAkDFA9hkT3OFrGihiCo",
  authDomain: "shopsy-67d07.firebaseapp.com",
  projectId: "shopsy-67d07",
  storageBucket: "shopsy-67d07.firebasestorage.app",
  messagingSenderId: "295588821672",
  appId: "1:295588821672:web:75569e561838c0a2a0e09d",
  measurementId: "G-V1501F5T3C",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
