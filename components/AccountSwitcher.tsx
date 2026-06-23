
import React, { useState, useEffect } from 'react';
// Fix: Import auth and functions from local firebase.ts instead of directly from firebase/auth
import {
    auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    appleProvider,
    OAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail
} from '../firebase';
import GoogleLogin from './GoogleLogin';

interface AuthScreenProps {
    onGuestLogin?: () => void;
}

interface SavedAccount {
    id: string;
    name: string;
    email: string;
    avatar: string;
    lastActive: number;
}

type AuthView = 'list' | 'login' | 'register';

export const AccountSwitcher: React.FC<AuthScreenProps> = ({ onGuestLogin }) => {
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
    const [showDevBypass, setShowDevBypass] = useState(false);

    useEffect(() => {
        // Handle redirect results on mount
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("Logged in after redirect:", result.user);
                }
            } catch (err: any) {
                console.error("Redirect result error:", err);
                setError(err.message || "Authentication failed during redirect.");
            }
        };
        handleRedirect();

        const saved = localStorage.getItem('zen_recent_accounts');
        if (saved) {
            try {
                const accounts: SavedAccount[] = JSON.parse(saved);
                if (accounts.length > 0) {
                    setSavedAccounts(accounts.sort((a, b) => b.lastActive - a.lastActive));
                    setView('list');
                }
            } catch (e) {
                console.error("Failed to parse saved accounts", e);
            }
        }
    }, []);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        setShowDevBypass(false);

        try {
            if (view === 'register') {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            let msg = "Authentication failed.";
            if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
            if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
            if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
            setError(msg);
            if (err.code === 'auth/unauthorized-domain') setShowDevBypass(true);
        } finally {
            setLoading(false);
        }
    };
    const handleForgotPassword = async () => {
        if (!email) {
            setError("Please enter your email address first.");
            return;
        }
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage("Password reset email sent! Please check your inbox.");
        } catch (err: any) {
            console.error("Reset error:", err);
            let msg = "Failed to send reset email.";
            if (err.code === 'auth/user-not-found') msg = "No user found with this email.";
            if (err.code === 'auth/invalid-email') msg = "Invalid email format.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setLoading(true);
        setError('');
        setShowDevBypass(false);

        try {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                await signInWithRedirect(auth, appleProvider);
            } else {
                await signInWithPopup(auth, appleProvider);
            }
        } catch (err: any) {
            console.error("Apple login error:", err);
            if (err.code === 'auth/popup-closed-by-user') {
                setError("Sign-in cancelled.");
            } else if (err.code === 'auth/unauthorized-domain') {
                setError("Domain unauthorized. Please use guest login or authorized domain.");
                setShowDevBypass(true);
            } else {
                setError(err.message || "Apple Sign-In failed.");
            }
        } finally {
            setLoading(false);
        }
    };


    const selectAccount = (account: SavedAccount) => {
        setEmail(account.email || '');
        setView('login');
    };

    const removeAccount = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedAccounts.filter(acc => acc.id !== id);
        setSavedAccounts(updated);
        localStorage.setItem('zen_recent_accounts', JSON.stringify(updated));
        if (updated.length === 0) setView('login');
    };

    const isUrl = (str: string) => str && (str.startsWith('http') || str.startsWith('data:'));

    const getInitials = (nameStr: string) => {
        const parts = nameStr.trim().split(/\s+/);
        if (parts.length === 0 || !parts[0]) return 'ST';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    if (view === 'list') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 relative overflow-hidden animate-slide-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-300 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Choose an account to continue</p>
                    </div>

                    <div className="space-y-3 mb-8">
                        {savedAccounts.map(acc => (
                            <div
                                key={acc.id}
                                onClick={() => selectAccount(acc)}
                                className="flex items-center gap-4 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group bg-slate-50 dark:bg-slate-800/50"
                            >
                                <div className="w-12 h-12 rounded-full bg-indigo-150 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 relative border border-slate-200 dark:border-slate-700">
                                    {isUrl(acc.avatar) ? (
                                        <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-indigo-600/40 to-purple-600/40">
                                            <svg className="w-1/2 h-1/2 opacity-25 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                                                <path d="M5 13.18v4l7 3.82 7-3.82v-4L12 17l-7-3.82z"/>
                                            </svg>
                                            <span className="absolute font-black tracking-tighter text-white select-none text-[10px]">
                                                {getInitials(acc.name)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{acc.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{acc.email}</p>
                                </div>
                                <button
                                    onClick={(e) => removeAccount(acc.id, e)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove account"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => { setView('login'); setEmail(''); setPassword(''); setError(''); setSuccessMessage(''); }}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>➕</span> Add another account
                    </button>

                    {onGuestLogin && (
                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                            <button
                                onClick={onGuestLogin}
                                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <span>👀</span> Just looking? Continue as Guest
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-center flex justify-center gap-3 text-[9px] font-black uppercase tracking-wider text-slate-405 dark:text-slate-500">
                        <a href="/policies/privacy-policy.md" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-650 transition-colors">Privacy</a>
                        <span>•</span>
                        <a href="/policies/terms-of-service.md" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-650 transition-colors">Terms</a>
                        <span>•</span>
                        <a href="/policies/cookie-policy.md" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-650 transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 relative overflow-hidden animate-slide-up">

                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <div className="absolute top-6 left-6">
                    {(savedAccounts.length > 0 || view !== 'login') && (
                        <button onClick={() => setView(savedAccounts.length > 0 ? 'list' : 'login')} className="text-slate-400 hover:text-indigo-600 text-sm font-bold flex items-center gap-1">
                            ← Back
                        </button>
                    )}
                </div>

                <div className="text-center mb-8 relative z-10 mt-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-300 mb-2">
                        ZenStudy
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {view === 'register' ? "Create your secure account" : "Welcome back, student."}
                    </p>
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <GoogleLogin />
                        <button
                            onClick={handleAppleLogin}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 bg-black text-white border border-slate-800 p-3 rounded-xl hover:opacity-80 transition-all shadow-sm font-bold group"
                        >
                            <svg className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.69-.74.66.1 2.53.53 3.48 1.94-2.72 1.63-2.28 6.13 1.05 7.46-.35 1.25-1.5 3.32-3.3 5.57M11.97 7.07c-.15-2.28 1.83-4.24 3.99-4.57.29 2.65-2.4 4.77-3.99 4.57z" /></svg>
                            Apple
                        </button>
                    </div>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase font-bold">Or with email</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                                placeholder="you@school.edu"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {view === 'login' && (
                            <div className="flex justify-end p-0">
                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50">
                                <p className="text-red-500 text-sm text-center font-medium mb-1">{error}</p>
                                {showDevBypass && onGuestLogin && (
                                    <button
                                        type="button"
                                        onClick={onGuestLogin}
                                        className="w-full mt-2 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-100 text-xs font-bold py-2 rounded-lg transition-colors"
                                    >
                                        ⚠️ Dev Mode: Bypass Login
                                    </button>
                                )}
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                                <p className="text-emerald-600 dark:text-emerald-400 text-sm text-center font-medium">{successMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (view === 'register' ? "Sign Up" : "Log In")}
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <button onClick={() => { setView(view === 'register' ? 'login' : 'register'); setError(''); setSuccessMessage(''); }} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">
                            {view === 'register' ? "Already have an account? Log In" : "Need an account? Sign Up"}
                        </button>
                    </div>

                    {onGuestLogin && (
                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                            <button
                                onClick={onGuestLogin}
                                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <span>👀</span> Just looking? Continue as Guest
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-center flex justify-center gap-3 text-[9px] font-black uppercase tracking-wider text-slate-405 dark:text-slate-500">
                        <a href="/policies/privacy-policy.md" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-650 transition-colors">Privacy</a>
                        <span>•</span>
                        <a href="/policies/terms-of-service.md" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-650 transition-colors">Terms</a>
                        <span>•</span>
                        <a href="/policies/cookie-policy.md" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-650 transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
