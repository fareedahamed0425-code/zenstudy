
// Fix: Ensure initializeApp and other modular functions are correctly imported and exported.
// We import from the standard 'firebase/app' and 'firebase/auth' but consolidate here to fix resolution errors.
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAPOmSU1_iH2mGB_f-vIem2g8TLNyrzaj8",
  authDomain: "zenstudy-exam-stress-guide.firebaseapp.com",
  projectId: "zenstudy-exam-stress-guide",
  storageBucket: "zenstudy-exam-stress-guide.firebasestorage.app",
  messagingSenderId: "352559001858",
  appId: "1:352559001858:web:30fc3507f4a120623c921b",
};

// Initialize Firebase once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Modular service instances
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Configure providers
googleProvider.setCustomParameters({ prompt: 'select_account' });
appleProvider.addScope('email');
appleProvider.addScope('name');

export const db = getFirestore(app);
export const storage = getStorage(app);

// Re-export auth functions
export {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  OAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail
};

