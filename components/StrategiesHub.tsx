import React, { useState, useEffect } from 'react';
import { BreathingExercise } from './BreathingExercise';
import { UserProfile, Section } from '../types';

interface StrategiesHubProps {
  onAskAI?: (message: string) => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (updatedUser: UserProfile) => void;
  onNavigate?: (section: Section) => void;
}

export const StrategiesHub: React.FC<StrategiesHubProps> = ({ 
  onAskAI, 
  userProfile, 
  onUpdateProfile,
  onNavigate 
}) => {
  const [activeTab, setActiveTab] = useState<'study' | 'productivity' | 'utilities' | 'ai'>('study');

  // Pomodoro & Focus Shield State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [focusShield, setFocusShield] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);

  // Screen Time State
  const [dailyScreenTime, setDailyScreenTime] = useState('');

  // Sleep Calc State
  const [wakeTime, setWakeTime] = useState('07:00');
  const [bedtimes, setBedtimes] = useState<string[]>([]);

  // Memory State
  const [blurtingText, setBlurtingText] = useState('');
  const [isHidden, setIsHidden] = useState(false);

  // Sound Effect Helper
  const playSound = (type: 'end' | 'alert') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      if (type === 'end') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.5);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Focus Shield Logic - Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive && focusShield && mode === 'work') {
        setDistractionCount(prev => prev + 1);
        playSound('alert');
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, focusShield, mode]);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playSound('end');
      
      if (userProfile && onUpdateProfile) {
        const addedMinutes = mode === 'work' ? 25 : 5;
        const newSessionsCount = mode === 'work' ? (userProfile.studySessionsCompleted || 0) + 1 : (userProfile.studySessionsCompleted || 0);
        const newTotalStudyTime = (userProfile.totalStudyTime || 0) + addedMinutes;
        const newTotalStudyHours = newTotalStudyTime / 60;
        
        onUpdateProfile({
          ...userProfile,
          studySessionsCompleted: newSessionsCount,
          totalStudyTime: newTotalStudyTime,
          totalStudyHours: newTotalStudyHours,
        });
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, userProfile, onUpdateProfile, mode]);

  const toggleTimer = () => {
    if (!isActive && focusShield && mode === 'work') {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
    setDistractionCount(0);
  };

  const switchMode = (m: 'work' | 'break') => {
    setMode(m);
    setIsActive(false);
    setTimeLeft(m === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'work' ? 25 * 60 : 5 * 60;
  const progress = timeLeft / totalTime;
  const circumference = 2 * Math.PI * 120; // r=120
  const dashOffset = circumference * (1 - progress);

  // Sleep Calc Logic
  const calculateSleep = () => {
    const [hours, mins] = wakeTime.split(':').map(Number);
    const wakeDate = new Date();
    wakeDate.setHours(hours, mins, 0);

    const cycles = [6, 5, 4]; // 9h, 7.5h, 6h
    const times = cycles.map(c => {
      const sleepDate = new Date(wakeDate.getTime() - (c * 90 * 60 * 1000) - (15 * 60 * 1000));
      return sleepDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    setBedtimes(times);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Toolbox</h2>
        <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
          Study & Stress Utilities
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1.5 justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-1 rounded-lg border border-white/40 dark:border-slate-800/80 w-fit mx-auto shadow-sm">
        {[
          { id: 'study', label: 'Study Resources', icon: '📚' },
          { id: 'productivity', label: 'Productivity Tools', icon: '⏱️' },
          { id: 'utilities', label: 'Academic Utilities', icon: '⚙️' },
          { id: 'ai', label: 'AI Helpers', icon: '🤖' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all duration-200 text-[11px]
              ${activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-sm scale-102' 
                : 'text-slate-655 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:text-indigo-650 dark:hover:text-indigo-400'}
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="animate-slide-up min-h-[350px]">
        
        {/* STUDY RESOURCES */}
        {activeTab === 'study' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Active Recall Blurting Tool */}
            <div className="lg:col-span-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">Active Recall "Blurting"</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Write down everything you remember, then check your materials.</p>
                </div>
                <button 
                  onClick={() => setIsHidden(!isHidden)}
                  className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 px-3 h-[30px] rounded-md font-bold text-[11px] flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors"
                >
                  {isHidden ? '👁️ Reveal text' : '🙈 Hide text'}
                </button>
              </div>
             
              <textarea
                className={`w-full h-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 font-mono text-slate-700 dark:text-slate-250 resize-none outline-none focus:border-indigo-500/50 transition-all text-xs
                   ${isHidden ? 'blur-md select-none' : 'blur-0'}
                `}
                placeholder="Start typing formulas, key points, or concepts from memory..."
                value={blurtingText}
                onChange={(e) => setBlurtingText(e.target.value)}
              />
              <div className="mt-3 flex justify-between items-center">
                {onAskAI && (
                  <button 
                    onClick={() => onAskAI("Explain the benefit of the Active Recall blurting technique and suggest subjects it fits best.")}
                    className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-650 dark:text-indigo-400 px-3.5 h-[34px] rounded-md font-bold flex items-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors text-[11px] border border-indigo-100/50 dark:border-indigo-800/50"
                  >
                    <span>🤖</span> Active Recall Tips
                  </button>
                )}
                <button 
                  onClick={() => setBlurtingText('')} 
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 h-[30px] rounded-md transition-colors text-xs font-bold flex items-center justify-center"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* External Study Resources */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-2xl mb-2">🎓</div>
                <h4 className="text-sm font-extrabold mb-1 text-slate-800 dark:text-white">Khan Academy</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">Free courses, study guides, and lessons covering multiple university and school subjects.</p>
                <a 
                  href="https://www.khanacademy.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Visit Resource ➔
                </a>
              </div>

              <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="text-sm font-extrabold mb-1 text-slate-800 dark:text-white">Student Support Services</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">Reach out to academic counselors, emotional advisers, or mental health networks.</p>
                <div className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-500">
                  Campus Resource
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTIVITY TOOLS */}
        {activeTab === 'productivity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pomodoro Timer */}
            <div className="lg:col-span-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Pomodoro Timer</h3>
              
              <div className="flex items-center gap-1.5 mb-4.5 bg-slate-100 dark:bg-slate-850 px-3.5 py-1 rounded-full border border-slate-200 dark:border-slate-700/85">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={focusShield} onChange={(e) => setFocusShield(e.target.checked)} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-red-500"></div>
                  <span className="ml-2 text-[10px] font-bold text-slate-600 dark:text-slate-350 select-none">🛡️ Focus Shield (Detect tab switches)</span>
                </label>
              </div>
              
              <div className="relative w-40 h-40 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
                  <circle cx="130" cy="130" r="120" className="stroke-slate-200 dark:stroke-slate-800/50" strokeWidth="10" fill="none" />
                  <circle 
                    cx="130" 
                    cy="130" 
                    r="120" 
                    stroke={mode === 'work' ? '#4f46e5' : '#10b981'} 
                    strokeWidth="10" 
                    fill="none" 
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-mono font-bold text-slate-800 dark:text-white tracking-tighter">
                    {formatTime(timeLeft)}
                  </span>
                  <span className={`text-[9px] uppercase font-black mt-0.5 tracking-wider ${mode === 'work' ? 'text-indigo-500' : 'text-emerald-500'}`}>
                    {mode} MODE
                  </span>
                </div>
              </div>

              {distractionCount > 0 && (
                <div className="mb-4 text-red-500 font-bold bg-red-50 dark:bg-red-950/20 px-3 py-1 rounded-lg border border-red-200 dark:border-red-900/30 text-[10px]">
                  ⚠️ Focus warnings (tab switched): {distractionCount}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={toggleTimer} 
                  className="w-10 h-10 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-lg hover:scale-105 transition-transform shadow-sm"
                >
                  {isActive ? '⏸️' : '▶️'}
                </button>
                <button 
                  onClick={resetTimer} 
                  className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-655 dark:text-slate-350 flex items-center justify-center text-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm"
                >
                  🔄
                </button>
              </div>

              <div className="flex gap-2 mt-4.5">
                <button 
                  onClick={() => switchMode('work')} 
                  className={`px-3 py-1 rounded-md font-bold text-[10px] ${mode === 'work' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-slate-400 hover:text-slate-655 dark:hover:text-slate-305'}`}
                >
                  Work Session (25m)
                </button>
                <button 
                  onClick={() => switchMode('break')} 
                  className={`px-3 py-1 rounded-md font-bold text-[10px] ${mode === 'break' ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'text-slate-400 hover:text-slate-655 dark:hover:text-slate-305'}`}
                >
                  Break (5m)
                </button>
              </div>
            </div>

            {/* Productivity Resources */}
            <div className="lg:col-span-4 space-y-4">
              <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-2xl mb-2">🌲</div>
                <h4 className="text-sm font-extrabold mb-1 text-slate-800 dark:text-white">Forest App</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">Gamify focus periods by planting virtual seeds that grow into trees as you study.</p>
                <a 
                  href="https://www.forestapp.cc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Explore App ➔
                </a>
              </div>

              <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-2xl mb-2">🍅</div>
                <h4 className="text-sm font-extrabold mb-1 text-slate-800 dark:text-white">Pomofocus</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">A customizable web browser pomodoro clock with custom intervals and task tracking.</p>
                <a 
                  href="https://pomofocus.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Try in Browser ➔
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC UTILITIES */}
        {activeTab === 'utilities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Sleep Calculator */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold mb-1">Sleep Calculator 🌙</h3>
                <p className="text-[10px] text-slate-400 mb-4">Calculate rest cycles to wake up refreshed during light sleep.</p>
                
                <div className="space-y-3.5 mb-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Desired Wake-up Time:</label>
                    <input 
                      type="time" 
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-sm font-mono text-center outline-none focus:ring-2 focus:ring-indigo-450 text-white"
                    />
                  </div>
                  <button 
                    onClick={calculateSleep}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-9 rounded-lg transition-all text-xs"
                  >
                    Calculate Bedtimes
                  </button>
                </div>

                {bedtimes.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 text-center space-y-2">
                    <p className="text-[9px] font-bold text-slate-350 uppercase tracking-wider">Suggested sleep times:</p>
                    <div className="grid grid-cols-3 gap-1">
                      {bedtimes.map((time, i) => (
                        <div key={i} className="bg-white/5 rounded p-1 border border-white/5">
                          <div className="text-xs font-bold text-white">{time}</div>
                          <div className="text-[7px] text-slate-405 mt-0.5">{6 - i} Cycles</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {onAskAI && (
                <button 
                  onClick={() => onAskAI("Calculate optimal rest and explain how a sleep pattern changes cognitive response under Yerkes-Dodson.")}
                  className="mt-3 w-full bg-white/10 text-white text-[10px] font-bold h-8 rounded-lg border border-white/15 hover:bg-white/15 transition-all flex items-center justify-center gap-1"
                >
                  <span>🤖</span> Ask Zen Sleep Advice
                </button>
              )}
            </div>

            {/* Instant Calm / Breathing Exercise */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center">
              <BreathingExercise />
            </div>

            {/* Screen Time & Digital Detox */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Digital Detox</h3>
                <p className="text-slate-550 dark:text-slate-400 text-[10px] mb-3">Monitor daily screen usage and manage distractions.</p>
                
                <div className="space-y-3">
                  <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-750">
                    <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Today's Screen Time (Hours):</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="e.g. 5.5" 
                        value={dailyScreenTime}
                        onChange={(e) => setDailyScreenTime(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 h-8 text-xs font-mono outline-none text-slate-800 dark:text-white"
                      />
                      {onAskAI && (
                        <button 
                          onClick={() => onAskAI(`I spent ${dailyScreenTime} hours on my phone today. What exercises can I do to detox my mind?`)}
                          disabled={!dailyScreenTime}
                          className="bg-indigo-650 text-white hover:bg-indigo-750 font-bold px-3 text-xs rounded disabled:opacity-50 h-8 flex items-center justify-center"
                        >
                          Log
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="bg-red-500/5 dark:bg-red-950/10 p-3 rounded-xl border border-red-200/50 dark:border-red-950/30">
                    <h4 className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">🚫 Distraction Blocker Mock</h4>
                    <div className="flex flex-wrap gap-1">
                      {['YouTube', 'TikTok', 'Instagram', 'Steam'].map(a => (
                        <span key={a} className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950/40 text-[8px] font-bold text-red-650 dark:text-red-300 border border-red-200/30 rounded">
                          {a} 🗙
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[8px] text-slate-455 text-center mt-3 leading-normal">
                *Detox simulator: Enable Focus Shield in Pomodoro to log page deviations.
              </div>
            </div>

          </div>
        )}

        {/* AI HELPERS */}
        {activeTab === 'ai' && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">AI Helpers</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-5">Quick access shortcuts to coordinate your study requirements through AI models.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Launcher 1: AI Planner */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="text-xl mb-1.5">🚀</div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">Smart Study Planner</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 leading-normal">
                    Quickly construct and output optimized calendar schedules based on your exams.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate && onNavigate(Section.PLANNING)}
                  className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-7.5 rounded text-[10px] transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                >
                  Launch Planner
                </button>
              </div>

              {/* Launcher 2: Note Simplifier */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="text-xl mb-1.5">📝</div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">Note Summarizer</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 leading-normal">
                    Paste raw curriculum lecture text and get instant simplified study breakdowns.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate && onNavigate(Section.NOTES)}
                  className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-7.5 rounded text-[10px] transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                >
                  Launch Notes Lab
                </button>
              </div>

              {/* Launcher 3: Quick AI Query */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="text-xl mb-1.5">🎓</div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">Ask AI Mentor</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 leading-normal">
                    Directly query the Zen AI Tutor concerning learning techniques and stress management advice.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate && onNavigate(Section.MINDSET)}
                  className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-7.5 rounded text-[10px] transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                >
                  Open AI Tutor
                </button>
              </div>

            </div>

            {/* Direct query strip */}
            {onAskAI && (
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suggested Prompt Quick Start</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Create a custom revision strategy for my exams.",
                    "Analyze my study streak consistency and suggest improvements.",
                    "How can I manage physical somatic stress during studies?",
                    "What are the best methods to reduce screen time distraction?"
                  ].map((p, index) => (
                    <button
                      key={index}
                      onClick={() => onAskAI(p)}
                      className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-655 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all"
                    >
                      💡 "{p}"
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};