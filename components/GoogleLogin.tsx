
import React from 'react';
// Fix: Import functions from local firebase.ts instead of directly from firebase/auth to resolve typing issues.
import { auth, googleProvider, signInWithPopup, signInWithRedirect } from "../firebase";


const GoogleLogin = () => {
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google Login Error:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(error.message);
      }
    }
  };


  return (
    <button
      onClick={loginWithGoogle}
      className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm font-bold text-slate-700 dark:text-slate-200 group w-full"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
      Continue with Google
    </button>
  );
};

export default GoogleLogin;
