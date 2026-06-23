import React from 'react';

interface ReturningUserModalProps {
  daysAway: number;
  previousStreak: number;
  type: 'standard' | 'reactivate';
  onClose: () => void;
}

export const ReturningUserModal: React.FC<ReturningUserModalProps> = ({
  daysAway,
  previousStreak,
  type,
  onClose,
}) => {
  const isReactivate = type === 'reactivate';

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-800 text-center animate-slide-up relative overflow-hidden flex flex-col items-center">
        
        {/* Academic SVG Graphic at the top */}
        <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center mb-6 border border-indigo-100 dark:border-slate-700">
          {isReactivate ? (
            <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
        </div>

        {isReactivate ? (
          <>
            <h2 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight mb-2">Ready for a fresh start?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-6">
              Your previous study streak ended at <span className="text-amber-500 font-bold font-mono">{previousStreak} days</span>. 
              Let's clean the slate and begin a new milestone today!
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-slate-850 dark:text-white tracking-tight mb-2">Welcome back.</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-6">
              You were away for <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">{daysAway} days</span>. 
              Your old streak has ended, but today is the perfect opportunity to build a new study habit.
            </p>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-98 text-sm"
        >
          {isReactivate ? "Start Fresh Now" : "Start a New Streak"}
        </button>
      </div>
    </div>
  );
};
