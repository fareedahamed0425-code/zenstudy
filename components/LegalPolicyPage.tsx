import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LegalPolicyPageProps {
  policyType: 'terms' | 'privacy' | 'cookies';
  onBack?: () => void;
}

export const LegalPolicyPage: React.FC<LegalPolicyPageProps> = ({ policyType, onBack }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      setError(null);
      try {
        let filename = '';
        if (policyType === 'terms') filename = 'terms-of-service.md';
        else if (policyType === 'privacy') filename = 'privacy-policy.md';
        else if (policyType === 'cookies') filename = 'cookie-policy.md';

        const response = await fetch(`/policies/${filename}`);
        if (!response.ok) {
          throw new Error('Failed to load policy');
        }
        const text = await response.text();
        setContent(text);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading the policy.');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, [policyType]);

  const getTitle = () => {
    if (policyType === 'terms') return 'Terms of Service';
    if (policyType === 'privacy') return 'Privacy Policy';
    if (policyType === 'cookies') return 'Cookie Policy';
    return 'Legal Policy';
  };

  const getIcon = () => {
    if (policyType === 'terms') return '📄';
    if (policyType === 'privacy') return '🛡️';
    if (policyType === 'cookies') return '🍪';
    return '⚖️';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack ? (
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <button 
                onClick={() => window.location.href = '/'}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xl">{getIcon()}</span>
              <h1 className="text-lg md:text-xl font-black tracking-tight">{getTitle()}</h1>
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              ZenStudy Legal
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 md:p-10 lg:p-12 prose prose-slate dark:prose-invert prose-headings:font-black prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500 max-w-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-500">Loading {getTitle()}...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 text-red-500">
                <span className="text-4xl">⚠️</span>
                <p className="font-bold">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center pb-8">
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} ZenStudy. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
};
