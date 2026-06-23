import React, { useState, useEffect } from 'react';

export const POLICY_VERSION = "1.0";

interface LegalConsentModalProps {
  onConsent: () => void;
}

export const LegalConsentModal: React.FC<LegalConsentModalProps> = ({ onConsent }) => {
  const [agreed, setAgreed] = useState(false);

  const handleContinue = () => {
    if (agreed) {
      localStorage.setItem('zenstudy_policy_consent', JSON.stringify({
        accepted: true,
        version: POLICY_VERSION,
        acceptedAt: Date.now()
      }));
      onConsent();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 max-w-[700px] w-full animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-indigo-500/30">
            ⚖️
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
              Welcome to ZenStudy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Before continuing, please review and accept our Terms of Service, Privacy Policy, and Cookie Policy to ensure a safe and secure learning environment.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md mt-2">
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 group">
              <span>📄</span>
              <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Terms of Service</span>
            </a>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 group">
              <span>🛡️</span>
              <span className="group-hover:text-purple-600 dark:group-hover:text-purple-400">Privacy Policy</span>
            </a>
            <a href="/cookies" target="_blank" rel="noopener noreferrer" className="flex-1 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all flex items-center justify-center gap-2 group">
              <span>🍪</span>
              <span className="group-hover:text-amber-600 dark:group-hover:text-amber-400">Cookie Policy</span>
            </a>
          </div>

          <div className="w-full max-w-lg mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 text-left">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all cursor-pointer peer appearance-none checked:bg-indigo-600 checked:border-indigo-600"
                />
                <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                I have read and agree to the Terms of Service, Privacy Policy, and Cookie Policy. I understand that my consent is required to use ZenStudy.
              </span>
            </label>
          </div>

          <div className="w-full max-w-lg pt-2">
            <button
              onClick={handleContinue}
              disabled={!agreed}
              className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-sm ${
                agreed 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              Continue to ZenStudy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
