import React, { useState } from 'react';

interface MoodCheckInProps {
  lastCheckInDate?: string;
  onMoodSelect: (mood: 'Focused' | 'Tired' | 'Stressed' | 'Motivated' | 'Overwhelmed') => void;
}

export const MoodCheckIn: React.FC<MoodCheckInProps> = ({ lastCheckInDate, onMoodSelect }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyCheckedIn = lastCheckInDate === todayStr;

  const moods: { label: 'Focused' | 'Tired' | 'Stressed' | 'Motivated' | 'Overwhelmed'; icon: string; color: string }[] = [
    { label: 'Focused', icon: '🎯', color: 'hover:bg-indigo-500/10 hover:text-indigo-400 border-indigo-500/20' },
    { label: 'Motivated', icon: '⚡', color: 'hover:bg-amber-500/10 hover:text-amber-405 border-amber-500/20' },
    { label: 'Tired', icon: '🥱', color: 'hover:bg-slate-500/10 hover:text-slate-400 border-slate-500/20' },
    { label: 'Stressed', icon: '😰', color: 'hover:bg-red-500/10 hover:text-red-400 border-red-500/20' },
    { label: 'Overwhelmed', icon: '🤯', color: 'hover:bg-purple-500/10 hover:text-purple-400 border-purple-500/20' }
  ];

  const handleMoodClick = (mood: 'Focused' | 'Tired' | 'Stressed' | 'Motivated' | 'Overwhelmed') => {
    setSelectedMood(mood);
    onMoodSelect(mood);
  };

  if (alreadyCheckedIn && !selectedMood) {
    return null; // Don't show if already completed today
  }

  return (
    <div className="bg-white/40 dark:bg-slate-900/30 backdrop-blur-md border border-white/20 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm w-full max-w-[1400px] mx-auto transition-all animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white leading-snug">Daily Mood Check-In</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            {selectedMood 
              ? `Logged as ${selectedMood}. The AI Coach will customize recommendations for your mental state.`
              : "How are you feeling today? Check in to personalize your study environment."}
          </p>
        </div>

        {!selectedMood ? (
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => handleMoodClick(m.label)}
                className={`flex-1 md:flex-initial px-3 py-1.5 bg-white/50 dark:bg-slate-800/50 border rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5 active:scale-98 ${m.color}`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-indigo-500/20">
            <span>✓ Check-in Complete</span>
          </div>
        )}
      </div>
    </div>
  );
};
