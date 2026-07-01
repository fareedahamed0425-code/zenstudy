import React, { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChatMessage, UserProfile, Section } from '../types';
import { getAiTutorResponse } from '../services/aiService';
import { SymptomChecker } from './SymptomChecker';
import { stressData } from '../constants';
import { BarChart2, Brain, Zap, Search, Bandage, TrendingUp, Sparkles, MessageSquare, GraduationCap, User, Calendar, Trophy, AlertTriangle, CheckCircle, Flame, Target } from 'lucide-react';

interface AICoachProps {
  userProfile?: UserProfile;
  initialMessage?: string;
  onMessageHandled?: () => void;
  onNavigate?: (section: Section) => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const AICoach: React.FC<AICoachProps> = ({ 
  userProfile, 
  initialMessage, 
  onMessageHandled,
  onNavigate,
  activeTab,
  onTabChange
}) => {
  // Chat Coach State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: `Greetings, ${userProfile?.name}! I am the ILMORA Mentor, your AI Study Coach. \n\nI'm here to help you master your subjects, manage stress, and provide real-time information. How can I support you today?` }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await getAiTutorResponse(text, messages, userProfile);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error("AI Coach Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: `I'm sorry, I'm having trouble connecting to my neural core. Error: ${error.message || 'Unknown error'}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialMessage && onMessageHandled) {
      onTabChange('chat');
      sendMessage(initialMessage);
      onMessageHandled();
    }
  }, [initialMessage]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to generate AI Mentor Insight Paragraph
  const generateMentorInsight = (user: UserProfile) => {
    const parts: string[] = [];
    
    // Mood Check-in Analysis
    if (user.moodLogs && user.moodLogs.length > 0) {
      const lastMood = user.moodLogs[user.moodLogs.length - 1].mood;
      if (lastMood === 'Overwhelmed') {
        parts.push("Your recent logs show feeling Overwhelmed. When cognitive pressure triggers a shutdown, force-studying is counter-productive. Try reducing screen time and activating the Instant Calm breathing cycles.");
      } else if (lastMood === 'Stressed') {
        parts.push("You're feeling Stressed. According to the Yerkes-Dodson curve, moderate arousal is normal, but high anxiety triggers drop-offs. Let's work on relaxation tools to bring you back to optimal focus.");
      } else if (lastMood === 'Focused' || lastMood === 'Motivated') {
        parts.push("Great! You logged feeling Focused or Motivated. This is the optimal peak of the Yerkes-Dodson curve. Capitalize on this energy to tackle your hardest subjects in the AI Planner.");
      } else if (lastMood === 'Tired') {
        parts.push("You've logged feeling Tired. Lack of physical rest disrupts memory consolidation (REM sleep). Consider using the Bedtime Sleep Calculator before studying late.");
      }
    } else {
      parts.push("No recent mood checks logged. Checking in regularly allows the ILMORA Mentor to track and optimize your cognitive load.");
    }

    // Consistency & Streak
    const streak = user.studyStreak || 0;
    const consistency = user.consistencyScore || 0;
    if (streak > 5) {
      parts.push(`Your study streak is active at ${streak} days with an overall consistency index of ${consistency}%. Maintain this pace to strengthen neural study habits.`);
    } else if (streak > 0) {
      parts.push(`You have a study streak of ${streak} days. Keep the momentum going to build solid academic routine consistency.`);
    } else {
      parts.push("Your study streak is at 0. Let's start a fresh habit streak today by checking off calendar tasks or studying for 15 minutes.");
    }

    // Study Hours & Rank
    const hours = user.totalStudyHours || 0;
    if (hours > 10) {
      parts.push(`You've accumulated ${hours.toFixed(1)} hours of deep work, placing you in the '${user.rank || 'Scholar'}' rank tier.`);
    } else {
      parts.push(`You've logged ${hours.toFixed(1)} study hours. Pacing yourself with short 25-minute Pomodoro sessions will build stamina.`);
    }

    // Schedule check
    const scheduleCount = user.dailySchedule?.length || 0;
    if (scheduleCount > 0) {
      parts.push(`Your schedule has ${scheduleCount} synchronized classes or study blocks, establishing a reliable daily envelope.`);
    } else {
      parts.push("Your calendar schedule is currently empty. Syncing routines helps the ILMORA Mentor customize planning suggestions.");
    }

    // Target Goals
    if (user.targetCGPA) {
      parts.push(`Targeting a CGPA of ${user.targetCGPA} is ambitious; your daily study goal is ${user.dailyStudyGoal || 2} hours. The ILMORA Mentor is here to guide you step-by-step.`);
    }

    return parts.join(" ");
  };

  const getYerkesDodsonPlacement = (stressLevel: number) => {
    if (stressLevel <= 3) return { zone: 'Under-arousal (Low Motivation)', advice: 'Stress is too low to spark action. Try setting micro-deadlines.' };
    if (stressLevel <= 7) return { zone: 'Optimal Performance (Optimal Zone)', advice: 'Perfect balance of focus and alertness. Keep going!' };
    return { zone: 'Overload (Burnout/Anxiety)', advice: 'Anxiety is hijacking your prefrontal cortex. Switch to breathing exercises.' };
  };

  const currentProfile: UserProfile = userProfile || {
    id: 'guest-123',
    name: 'Student',
    avatar: '',
    stressLevel: 5,
    learningStyle: ['Visual'],
    mainWorry: '',
    exams: [],
    studyStreak: 0,
    consistencyScore: 30,
    totalStudyHours: 0,
    rank: 'Beginner',
    burnoutRiskScore: 10,
    achievements: []
  };

  const placement = getYerkesDodsonPlacement(currentProfile.stressLevel);
  const mentorInsightText = generateMentorInsight(currentProfile);

  const subTabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={14}/> },
    { id: 'profile', label: 'Learning Profile', icon: <Brain size={14}/> },
    { id: 'focus', label: 'Focus Insights', icon: <Zap size={14}/> },
    { id: 'academic', label: 'Academic Diagnosis', icon: <Search size={14}/> },
    { id: 'burnout', label: 'Burnout & Stress', icon: <Bandage size={14}/> },
    { id: 'trends', label: 'Progress Trends', icon: <TrendingUp size={14}/> },
    { id: 'recommendations', label: 'AI Advice', icon: <Sparkles size={14}/> },
    { id: 'chat', label: 'AI Chat Coach', icon: <MessageSquare size={14}/> },
  ];

  return (
    <div className="bg-slate-50 dark:bg-background rounded-2xl border border-slate-200 dark:border-outline-variant/10 shadow-sm h-full flex flex-col md:flex-row overflow-hidden relative group transition-all duration-300">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 flex-shrink-0 bg-white/50 dark:bg-surface-container/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-outline-variant/10 p-3 md:p-4 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Module Label */}
          <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-slate-900 dark:bg-white rounded-xl text-white dark:text-slate-900 shadow-sm">
            <span className="text-white dark:text-slate-900"><GraduationCap size={18}/></span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold truncate">ILMORA Mentor</h3>
              <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">Intelligence Brain</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide pb-2 md:pb-0">
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-xl transition-all w-auto md:w-full shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-container hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span className="truncate whitespace-nowrap md:flex-1 min-w-0 text-left font-bold text-sm md:text-[13px]">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Small stats summary inside sidebar */}
        <div className="hidden md:block bg-slate-100 dark:bg-surface-container p-3 rounded-xl border border-slate-200 dark:border-outline-variant/10 text-center shadow-sm">
          <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider block mb-1">Focus Status</span>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{placement.zone.split(' ')[0]}</p>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-5 md:p-8 min-h-[400px] pb-32 flex flex-col">
        <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 flex-1">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Section 1</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Overview</h3>
            </div>

            {/* AI Academic Mentor Speech bubble */}
            <div className="bg-slate-900 dark:bg-surface-bright text-white p-6 rounded-2xl shadow-sm border border-slate-800 dark:border-outline-variant/10 relative">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0 shadow-sm animate-float">
                  <User size={24}/>
                </div>
                <div className="space-y-1.5 mt-0.5">
                  <h4 className="font-bold text-base text-slate-300 dark:text-slate-200">ILMORA Academic Mentor</h4>
                  <p className="text-sm font-normal leading-relaxed text-slate-200">
                    "{mentorInsightText}"
                  </p>
                </div>
              </div>
            </div>

            {/* Mini Dashboard Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bento-card p-5">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Study Streak</span>
                <p className="text-2xl font-bold font-mono text-slate-800 dark:text-white mt-1.5">{currentProfile.studyStreak} Days</p>
              </div>
              <div className="bento-card p-5">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Hours Tracked</span>
                <p className="text-2xl font-bold font-mono text-slate-800 dark:text-white mt-1.5">{(currentProfile.totalStudyHours || 0).toFixed(1)}h</p>
              </div>
              <div className="bento-card p-5">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Burnout Risk</span>
                <p className="text-2xl font-bold font-mono text-red-500 mt-1.5">{currentProfile.burnoutRiskScore || 10}%</p>
              </div>
              <div className="bento-card p-5">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Academic Rank</span>
                <p className="text-lg font-bold text-slate-800 dark:text-white mt-2.5 truncate">{currentProfile.rank || 'Beginner'}</p>
              </div>
            </div>

            {/* Daily study goal indicator */}
            <div className="bento-card p-5 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Daily Study Goal Progress</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Target: {currentProfile.dailyStudyGoal || 2} hours per day</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 md:w-48 bg-slate-200 dark:bg-surface-container h-2.5 rounded-full overflow-hidden">
                  <div className="bg-slate-900 dark:bg-white h-full" style={{ width: `${Math.min(100, currentProfile.goalCompletionRate || 0)}%` }}></div>
                </div>
                <span className="text-sm font-bold font-mono text-slate-800 dark:text-white">{Math.round(currentProfile.goalCompletionRate || 0)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* LEARNING PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-5.5">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Section 2</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Learning Profile</h3>
            </div>

            {/* Cognitive Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bento-card p-5">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Learning Style</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-2">
                  {currentProfile.adaptiveLearningProfile || (currentProfile.learningStyle ? currentProfile.learningStyle.join(", ") : 'Mixed Style')}
                </p>
              </div>
              <div className="bento-card p-5">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Motivation Profile</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-2">
                  {currentProfile.motivationProfile || 'Curiosity & Grade Drive'}
                </p>
              </div>
              <div className="bento-card p-5">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Focus Profile</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-2">
                  {currentProfile.focusProfile || 'Balanced Day/Night Focus'}
                </p>
              </div>
            </div>

            {/* Yerkes-Dodson Law Cognitive Analysis */}
            <div className="bento-card p-6 space-y-4">
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">Cognitive Analysis (Yerkes-Dodson Law)</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Optimal performance occurs at moderate stress levels. Current stress level: <span className="font-bold text-slate-900 dark:text-white font-mono">{currentProfile.stressLevel}/10</span>.
                </p>
              </div>

              {/* Chart */}
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stressData}>
                    <defs>
                      <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }} axisLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="performance" stroke="#6366f1" strokeWidth={3} fill="url(#colorPerf)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stress Position Card */}
              <div className="bg-slate-100 dark:bg-surface-container p-4 rounded-lg border border-slate-200 dark:border-outline-variant/10 flex items-center justify-between text-sm shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1 tracking-wider">Yerkes-Dodson Zone</span>
                  <span className="font-bold text-slate-800 dark:text-white">{placement.zone}</span>
                </div>
                <div className="text-right text-xs text-slate-600 dark:text-slate-300 max-w-[50%] font-medium">
                  {placement.advice}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOCUS INSIGHTS TAB */}
        {activeTab === 'focus' && (
          <div className="space-y-5.5">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Section 3</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Focus Insights</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Daily focus consistency */}
              <div className="bento-card p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white mb-2">Session Consistency</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    Your calculated study habits yield a consistency rating of {currentProfile.consistencyScore}%. 
                    Maintaining session frequency directly trains academic memory retention.
                  </p>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-surface-container p-4 rounded-xl border border-slate-200 dark:border-outline-variant/10 shadow-sm">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Consistency score</span>
                    <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{currentProfile.consistencyScore}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Streak freeze available</span>
                    <p className="text-base font-bold text-slate-800 dark:text-white mt-2">{currentProfile.streakFreezeCount || 0} active</p>
                  </div>
                </div>
              </div>

              {/* Pomodoro shield focus warnings */}
              <div className="bento-card p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white mb-2">Distraction Analysis</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    The focus shield tracks tab deviations. Frequent browser context switches degrade cognitive focus cycles.
                    {(currentProfile.tabSwitchCount || 0) > 5 && (
                      <span className="block mt-2 font-bold text-red-500 dark:text-red-400">
                         You have shifted tabs {currentProfile.tabSwitchCount} times. You should minimize these distractions to maintain focus!
                      </span>
                    )}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-200 dark:border-red-900/30 flex justify-between items-center shadow-sm">
                  <div className="flex gap-6">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400 tracking-wider">Device Screen Time</span>
                      <p className="text-xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{currentProfile.dailyScreenTime || 'N/A'} Hours</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-red-600 dark:text-red-400 tracking-wider">Tab Shifts</span>
                      <p className="text-xl font-bold font-mono text-red-600 dark:text-red-400 mt-1">{currentProfile.tabSwitchCount || 0}</p>
                    </div>
                  </div>
                  {onNavigate && (
                    <button 
                      onClick={() => onNavigate(Section.STRATEGIES)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all uppercase tracking-wider shadow-sm"
                    >
                      Run Focus Shield
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ACADEMIC DIAGNOSIS TAB */}
        {activeTab === 'academic' && (
          <div className="space-y-5.5">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Section 4</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Academic Diagnosis</h3>
            </div>

            {/* School details */}
            <div className="bento-card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block truncate whitespace-nowrap tracking-wider">Course / Major</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-2 truncate">{currentProfile.course || 'Cyber Security'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block truncate whitespace-nowrap tracking-wider">University</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-2 truncate">{currentProfile.university || 'ILMORA Institute'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block truncate whitespace-nowrap tracking-wider">Semester</span>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-2 truncate">{currentProfile.semester || 'Semester 4'}</p>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block truncate whitespace-nowrap tracking-wider">Target CGPA</span>
                <p className="text-sm font-bold font-mono text-slate-800 dark:text-white mt-2 truncate">{currentProfile.targetCGPA || 'N/A'}</p>
              </div>
            </div>

            {/* Upcoming Exams and count downs */}
            <div className="bento-card p-5">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-4">Academic Exam Planner</h4>
              {currentProfile.exams && currentProfile.exams.length > 0 ? (
                <div className="space-y-3">
                  {currentProfile.exams.map(ex => {
                    const diffDays = Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isUpcoming = diffDays >= 0;
                    return (
                      <div key={ex.id} className="flex justify-between items-center bg-slate-50 dark:bg-surface-container p-4 rounded-xl border border-slate-200 dark:border-outline-variant/10 text-sm shadow-sm">
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-slate-600 dark:text-slate-300"/>
                          <span className="font-bold text-slate-800 dark:text-white">{ex.subject}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-xs text-slate-600 dark:text-slate-300">{ex.date}</p>
                          <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${isUpcoming ? (diffDays <= 3 ? 'text-red-500' : 'text-slate-900 dark:text-white') : 'text-slate-500 dark:text-slate-400'}`}>
                            {isUpcoming ? `${diffDays} days left` : 'Completed'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No upcoming exams loaded. Set exams in Profile page.</p>
              )}
            </div>
          </div>
        )}

        {/* BURNOUT & STRESS ANALYSIS TAB */}
        {activeTab === 'burnout' && (
          <div className="space-y-5.5">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Section 5</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Burnout & Stress Analysis</h3>
            </div>

            {/* Burnout Risk score */}
            <div className="bento-card p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white">Calculated Burnout Risk Index</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Based on study hours, mood check-ins, and session timings.</p>
                </div>
                <span className="text-3xl font-bold font-mono text-red-500 dark:text-red-400">{currentProfile.burnoutRiskScore || 10}%</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-surface-container h-2.5 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full transition-all duration-700 ${currentProfile.burnoutRiskScore && currentProfile.burnoutRiskScore > 70 ? 'bg-red-500' : currentProfile.burnoutRiskScore && currentProfile.burnoutRiskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${currentProfile.burnoutRiskScore || 10}%` }}
                ></div>
              </div>
            </div>

            {/* Embedded Symptom Checker Stress Diagnostic Quiz */}
            <div className="bento-card p-5">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-4">Interactive Stress Diagnostic Quiz</h4>
              <SymptomChecker onNavigateToStrategy={(section) => { if (onNavigate) onNavigate(section); }} />
            </div>

            {/* Mood logs list */}
            <div className="bento-card p-5">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-4">Mood Logs History</h4>
              {currentProfile.moodLogs && currentProfile.moodLogs.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-hide">
                  {currentProfile.moodLogs.slice(-6).reverse().map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-slate-50 dark:bg-surface-container px-4 py-2.5 rounded-xl border border-slate-200 dark:border-outline-variant/10 shadow-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{log.date}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-background px-3 py-1 rounded text-xs border border-slate-200 dark:border-outline-variant/10">
                        {log.mood}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No mood check-ins completed today. Log moods in the dashboard.</p>
              )}
            </div>
          </div>
        )}

        {/* PROGRESS TRENDS TAB */}
        {activeTab === 'trends' && (
          <div className="space-y-5.5">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Section 6</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Progress Trends</h3>
            </div>

            {/* Achievements list */}
            <div className="bento-card p-5">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-4">Achievements Progression</h4>
              {currentProfile.achievements && currentProfile.achievements.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentProfile.achievements.map((ach, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-slate-50 dark:bg-surface-container p-3 rounded-xl border border-slate-200 dark:border-outline-variant/10 shadow-sm text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300"><Trophy size={16}/></span>
                      <span className="text-slate-800 dark:text-slate-200">{ach}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No achievements unlocked yet. Accumulate study sessions to trigger unlocks.</p>
              )}
            </div>

            {/* Streak records */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bento-card p-6 text-center">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">Current Habit Streak</span>
                <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white block mt-2">{currentProfile.studyStreak} Days</span>
              </div>
              <div className="bento-card p-6 text-center">
                <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">All-time Best Streak</span>
                <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white block mt-2">{currentProfile.bestStreak || currentProfile.studyStreak} Days</span>
              </div>
            </div>
          </div>
        )}

        {/* PERSONALIZED RECOMMENDATIONS TAB */}
        {activeTab === 'recommendations' && (
          <div className="space-y-5.5">
            <div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Section 7</span>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Personalized Recommendations</h3>
            </div>

            {/* AI Advisor Card Deck */}
            <div className="space-y-3.5">
              {/* Recommendation 1: Stress */}
              {currentProfile.stressLevel && currentProfile.stressLevel > 7 ? (
                <div className="p-4 bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3 shadow-sm">
                  <span className="shrink-0 mt-0.5 text-red-600 dark:text-red-400"><AlertTriangle size={18}/></span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-red-800 dark:text-red-200">High Stress Alert detected</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      Your stress level is at {currentProfile.stressLevel}/10. Switch off cramming and complete an Instant Calm breathing exercise or sleep calculation in the Toolbox.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/30 rounded-xl flex items-start gap-3 shadow-sm">
                  <span className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400"><CheckCircle size={18}/></span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-200 font-black">Optimal Stress Levels</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      Your current stress level is under control. This is the optimal window to start study blocks in the AI Planner.
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendation 2: Burnout */}
              {currentProfile.burnoutRiskScore && currentProfile.burnoutRiskScore > 50 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/15 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-3 shadow-sm">
                  <span className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"><Bandage size={18}/></span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-amber-800 dark:text-amber-200">Elevated Burnout Risk Index</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      Burnout score is at {currentProfile.burnoutRiskScore}%. Lower session density, increase short break intervals, and log daily screen hours to manage fatigue.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Recommendation 3: Habit Streak */}
              {currentProfile.studyStreak === 0 ? (
                <div className="p-4 bg-slate-100 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-xl flex items-start gap-3 shadow-sm">
                  <span className="shrink-0 mt-0.5 text-slate-600 dark:text-slate-400"><Flame size={18}/></span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-black">Habit Starter Routine</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      Streak is at 0. Start a fresh baseline: execute a 15-minute Pomodoro timer or add and complete a routine assignment to launch your streak.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-100 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-xl flex items-start gap-3 shadow-sm">
                  <span className="shrink-0 mt-0.5 text-slate-600 dark:text-slate-400"><Zap size={18}/></span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 font-black">Streak Protection active</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      You're carrying a {currentProfile.studyStreak} day streak. Complete a study event today to maintain and reinforce this habit loop.
                    </p>
                  </div>
                </div>
              )}

              {/* Recommendation 4: Exams */}
              {currentProfile.exams && currentProfile.exams.length > 0 ? (
                <div className="p-4 bg-slate-100 dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-xl flex items-start gap-3 shadow-sm">
                  <span className="shrink-0 mt-0.5 text-slate-600 dark:text-slate-400"><Calendar size={18}/></span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Exam Countdown optimizer</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      You have {currentProfile.exams.length} exams registered. Launch the AI Planner to schedule specific micro-study units for preparation.
                    </p>
                  </div>
                </div>
              ) : null}

            </div>
          </div>
        )}

        {/* AI CHAT COACH TAB */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden min-h-[350px] relative">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-outline-variant/10 bg-slate-50 dark:bg-surface-container backdrop-blur-md z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-800 dark:bg-slate-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-900 dark:bg-white"></span>
                </div>
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest">Intelligence Core Active</span>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto py-5 px-4 md:px-6 space-y-4 scrollbar-hide overscroll-contain max-h-[260px] md:max-h-[300px]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-slide-up`}>
                  <div className={`flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[85%]`}>
                    <div className={`
                      rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm transition-all duration-300 border
                      ${msg.role === 'user'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-br-sm border-transparent'
                        : 'bg-white dark:bg-surface-container text-slate-800 dark:text-slate-200 rounded-bl-sm border-slate-200 dark:border-outline-variant/10'}
                      `}>
                      <div className="whitespace-pre-wrap font-medium">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-surface-container border border-slate-200 dark:border-outline-variant/10 rounded-xl rounded-tl-none px-3 py-2 shadow-sm flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-slate-600 dark:bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 dark:bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-slate-600 dark:bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-200 dark:border-outline-variant/10 bg-slate-50 dark:bg-surface-container backdrop-blur-md z-10">
              <form onSubmit={handleSend} className="flex gap-2 items-center bg-white dark:bg-background rounded-xl border border-slate-200 dark:border-outline-variant/10 shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-white transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Query Intelligence Core..."
                  className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-3 h-10 outline-none text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg px-6 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};