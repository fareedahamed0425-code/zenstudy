import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Navigation } from './components/Navigation';
import { Home, Moon, Sun, Flame, Rocket, Calendar, FileText, GraduationCap, Snowflake, Hourglass } from 'lucide-react';
import { AICoach } from './components/AICoach';
import { StudyPlanGenerator } from './components/StudyPlanGenerator';
import { NotesSimplifier } from './components/NotesSimplifier';
import { Onboarding } from './components/Onboarding';
import { SymptomChecker } from './components/SymptomChecker';
import { StrategiesHub } from './components/StrategiesHub';
import { CalendarManager } from './components/CalendarManager';
import { AccountSwitcher } from './components/AccountSwitcher';
import { ProfileEditor } from './components/ProfileEditor';
import { StudentIdentityCard } from './components/StudentIdentityCard';
import { MoodCheckIn } from './components/MoodCheckIn';
import { ReturningUserModal } from './components/ReturningUserModal';
import { stressData, resources } from './constants';
import { Section, UserProfile } from './types';
// Fix: Import auth and functions from local firebase.ts instead of directly from firebase/auth
import { auth, onAuthStateChanged, signOut } from './firebase';
import { saveUserProfile, getUserProfile } from './services/db';
import { LegalConsentModal, POLICY_VERSION } from './components/LegalConsentModal';
import { LegalPolicyPage } from './components/LegalPolicyPage';

export const calculateUpdatedProfile = (user: UserProfile, type: 'timer_tick' | 'session_completed' | 'task_completed' | 'mood_logged' | 'streak_freeze', data?: any): UserProfile => {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let updated = { ...user };

  // 1. Update activity counts
  if (type === 'timer_tick') {
    updated.totalStudyTime = (updated.totalStudyTime || 0) + 1;
    updated.totalStudyHours = updated.totalStudyTime / 60;
  } else if (type === 'session_completed') {
    updated.studySessionsCompleted = (updated.studySessionsCompleted || 0) + 1;
    updated.totalStudyTime = (updated.totalStudyTime || 0) + 25;
    updated.totalStudyHours = updated.totalStudyTime / 60;
  } else if (type === 'mood_logged') {
    const log = { date: todayStr, mood: data.mood };
    updated.moodLogs = [...(updated.moodLogs || []), log];
  } else if (type === 'streak_freeze') {
    updated.streakFreezeCount = Math.max(0, (updated.streakFreezeCount || 1) - 1);
    updated.streakFreezeLastUsed = new Date().toISOString();
    updated.lastActiveDate = yesterdayStr; // backdate to restore streak logic
  }

  // Check streak updates
  let studyActionTriggered = false;
  if (type === 'session_completed' || type === 'task_completed') {
    studyActionTriggered = true;
  }
  if (type === 'timer_tick' && (updated.totalStudyTime && updated.totalStudyTime % 15 === 0)) {
    studyActionTriggered = true;
  }

  if (studyActionTriggered) {
    if (updated.lastActiveDate !== todayStr) {
      let newStreak = updated.studyStreak || 0;
      if (updated.lastActiveDate === yesterdayStr || !updated.lastActiveDate) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
      updated.studyStreak = newStreak;
      updated.bestStreak = Math.max(updated.bestStreak || 0, newStreak);
      updated.lastActiveDate = todayStr;
    }
  }

  // 2. Goal completion rate calculation
  const dailyGoalMinutes = (updated.dailyStudyGoal || 2) * 60;
  const minutesStudiedToday = (updated.studySessionsCompleted || 0) * 25 + (updated.tasksCompletedCount || 0) * 15;
  updated.goalCompletionRate = Math.min(100, (minutesStudiedToday / dailyGoalMinutes) * 100);

  // 3. Ranks calculation
  const totalH = updated.totalStudyHours || 0;
  let currentRank = 'Beginner';
  if (totalH >= 100) currentRank = 'Legend';
  else if (totalH >= 60) currentRank = 'Master';
  else if (totalH >= 30) currentRank = 'Expert';
  else if (totalH >= 15) currentRank = 'Achiever';
  else if (totalH >= 5) currentRank = 'Scholar';
  updated.rank = currentRank;

  // 4. Background psychological profiling engine updates
  let burnout = 10;
  if (updated.moodLogs && updated.moodLogs.length > 0) {
    const recent = updated.moodLogs.slice(-5);
    recent.forEach(m => {
      if (m.mood === 'Overwhelmed' || m.mood === 'Tired') burnout += 15;
      if (m.mood === 'Stressed') burnout += 10;
      if (m.mood === 'Focused' || m.mood === 'Motivated') burnout -= 8;
    });
  }
  if (totalH > 50) burnout += 12;
  updated.burnoutRiskScore = Math.max(5, Math.min(95, burnout));

  if (updated.moodLogs) {
    updated.stressTrend = updated.moodLogs.slice(-7).map(m => {
      if (m.mood === 'Focused') return 2;
      if (m.mood === 'Motivated') return 3;
      if (m.mood === 'Tired') return 5;
      if (m.mood === 'Stressed') return 8;
      return 10; // Overwhelmed
    });
  }

  updated.consistencyScore = Math.min(100, Math.round(((updated.studyStreak || 0) / 10) * 100) + 30);

  if (updated.preferredStudyHours === 'Night') {
    updated.focusProfile = 'Late Night Focus Peak';
  } else if (updated.preferredStudyHours === 'Morning') {
    updated.focusProfile = 'Morning Peak Focus';
  } else {
    updated.focusProfile = 'Balanced Focus Peak';
  }

  const focusChallenge = updated.academicPersonality?.challenge || 'Focus';
  if (focusChallenge === 'Procrastination') {
    updated.motivationProfile = 'Goal-Oriented Spark';
  } else if (focusChallenge === 'Exam Anxiety') {
    updated.motivationProfile = 'Mindful Reassurance Scholar';
  } else {
    updated.motivationProfile = 'Intrinsically Motivated Scholar';
  }

  const prefStyle = updated.academicPersonality?.learningStyle || 'Mixed';
  updated.adaptiveLearningProfile = `${prefStyle} Learning Specialist`;

  // 5. Achievements unlocking
  const currentAchievements = updated.achievements || [];
  const newAchievements = [...currentAchievements];

  const checkAndAdd = (id: string) => {
    if (!newAchievements.includes(id)) {
      newAchievements.push(id);
    }
  };

  if (updated.studySessionsCompleted && updated.studySessionsCompleted >= 1) checkAndAdd('First Session');
  if (updated.studyStreak && updated.studyStreak >= 7) checkAndAdd('7 Day Streak');
  if (updated.studyStreak && updated.studyStreak >= 30) checkAndAdd('30 Day Streak');
  if (updated.totalStudyHours && updated.totalStudyHours >= 100) checkAndAdd('100 Study Hours');
  if (updated.tasksCompletedCount && updated.tasksCompletedCount >= 10) checkAndAdd('Task Master');
  if (updated.dailySchedule && updated.dailySchedule.length >= 5) checkAndAdd('Schedule Champion');
  if (updated.exams && updated.exams.length >= 3) checkAndAdd('Exam Warrior');
  if (updated.consistencyScore && updated.consistencyScore >= 80) checkAndAdd('Consistency King');

  updated.achievements = newAchievements;
  updated.achievementsCount = newAchievements.length;

  return updated;
};

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    if (path === '/' || !path) return '/dashboard';
    if (path === '/zen-tutor' || path === '/zen-tutor/') return '/zen-tutor/overview';
    return path;
  });

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      let path = window.location.pathname;
      if (path === '/' || !path) path = '/dashboard';
      if (path === '/zen-tutor' || path === '/zen-tutor/') path = '/zen-tutor/overview';
      setCurrentPath(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Map route path to Section enum for backward compatibility
  const getSectionAndTabFromPath = (path: string): { section: Section; tutorTab?: string } => {
    if (path.startsWith('/zen-tutor')) {
      const parts = path.split('/');
      const tab = parts[2] || 'overview';
      
      let mappedTab = tab;
      if (tab === 'learning-profile') mappedTab = 'profile';
      else if (tab === 'focus-insights') mappedTab = 'focus';
      else if (tab === 'academic-diagnosis') mappedTab = 'academic';
      else if (tab === 'burnout-stress') mappedTab = 'burnout';
      else if (tab === 'progress-trends') mappedTab = 'trends';
      else if (tab === 'chat-coach') mappedTab = 'chat';

      return { section: Section.MINDSET, tutorTab: mappedTab };
    }

    switch (path) {
      case '/schedule':
        return { section: Section.CALENDAR };
      case '/planner':
        return { section: Section.PLANNING };
      case '/notes':
        return { section: Section.NOTES };
      case '/toolbox':
        return { section: Section.STRATEGIES };
      case '/profile':
        return { section: Section.PROFILE };
      case '/dashboard':
      default:
        return { section: Section.HOME };
    }
  };

  const routeConfig = getSectionAndTabFromPath(currentPath);
  const currentSection = routeConfig.section;
  const activeTutorTab = routeConfig.tutorTab;

  const getPathFromSection = (section: Section): string => {
    switch (section) {
      case Section.CALENDAR:
        return '/schedule';
      case Section.PLANNING:
        return '/planner';
      case Section.NOTES:
        return '/notes';
      case Section.STRATEGIES:
        return '/toolbox';
      case Section.MINDSET:
        return '/zen-tutor/overview';
      case Section.PROFILE:
        return '/profile';
      case Section.HOME:
      default:
        return '/dashboard';
    }
  };

  const handleTutorTabChange = (tabId: string) => {
    let pathSegment = tabId;
    if (tabId === 'profile') pathSegment = 'learning-profile';
    else if (tabId === 'focus') pathSegment = 'focus-insights';
    else if (tabId === 'academic') pathSegment = 'academic-diagnosis';
    else if (tabId === 'burnout') pathSegment = 'burnout-stress';
    else if (tabId === 'trends') pathSegment = 'progress-trends';
    else if (tabId === 'chat') pathSegment = 'chat-coach';
    
    navigate(`/zen-tutor/${pathSegment}`);
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isMobileMenuOpen]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('zen_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('zen_sidebar_collapsed', String(next));
      return next;
    });
  };

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [pendingAiMessage, setPendingAiMessage] = useState<string>('');
  const [checkedUserId, setCheckedUserId] = useState<string | null>(null);
  const [returningUserModal, setReturningUserModal] = useState<{ daysAway: number; previousStreak: number; type: 'standard' | 'reactivate' } | null>(null);

  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('zenstudy_policy_consent');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.accepted && parsed.version === POLICY_VERSION) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  });

  const [sessionTime, setSessionTime] = useState(0);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');
  const [dashboardTasks, setDashboardTasks] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('zen_dashboard_tasks');
      return saved ? JSON.parse(saved) : [
        { id: '1', text: 'Set study goals for this week', completed: false },
        { id: '2', text: 'Complete a 25-minute study session', completed: false },
        { id: '3', text: 'Log your current mood check-in', completed: false },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('zen_dashboard_tasks', JSON.stringify(dashboardTasks));
  }, [dashboardTasks]);

  const handleToggleTask = async (taskId: string) => {
    setDashboardTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted && currentUser) {
          const newCompletedCount = (currentUser.tasksCompletedCount || 0) + 1;
          const updated = calculateUpdatedProfile({
            ...currentUser,
            tasksCompletedCount: newCompletedCount
          }, 'task_completed');
          setCurrentUser(updated);
          saveUserProfile(updated);
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    }));
  };

  const handleAddTask = (text: string) => {
    if (!text.trim()) return;
    setDashboardTasks(prev => [
      ...prev,
      { id: Date.now().toString(), text: text.trim(), completed: false }
    ]);
  };

  const handleDeleteTask = (taskId: string) => {
    setDashboardTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const startEditingTask = (taskId: string, currentText: string) => {
    setEditingTaskId(taskId);
    setEditingTaskText(currentText);
  };

  const saveEditedTask = (taskId: string) => {
    if (!editingTaskText.trim()) return;
    setDashboardTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, text: editingTaskText.trim() } : t
    ));
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('zen_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('zen_theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoadingAuth(true);
      setAuthUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setCurrentUser(profile);
            setIsOnboarding(false);
          } else {
            setIsOnboarding(true);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // If profile fetch fails (e.g. permission denied or network error), treat as new user to allow onboarding or retry
          setIsOnboarding(true);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest-123') {
      const recent = JSON.parse(localStorage.getItem('zen_recent_accounts') || '[]');
      const existingIndex = recent.findIndex((u: any) => u.id === currentUser.id);
      const userInfo = {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        lastActive: Date.now()
      };

      let newRecent = [...recent];
      if (existingIndex >= 0) {
        newRecent[existingIndex] = userInfo;
      } else {
        newRecent.push(userInfo);
      }
      if (newRecent.length > 3) newRecent = newRecent.slice(-3);
      localStorage.setItem('zen_recent_accounts', JSON.stringify(newRecent));
    }
  }, [currentUser]);

  // Track study minutes and background profiling updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser) {
        setSessionTime(prev => prev + 1);
        const updated = calculateUpdatedProfile(currentUser, 'timer_tick');
        setCurrentUser(updated);
        saveUserProfile(updated);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Track tab switches (Focus interruptions)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentUser) {
        setCurrentUser(prev => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            tabSwitchCount: (prev.tabSwitchCount || 0) + 1
          };
          saveUserProfile(updated);
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

  // Streak Expiry, automatic streak freeze, and returning user checks on profile load
  useEffect(() => {
    if (currentUser && currentUser.id !== checkedUserId) {
      setCheckedUserId(currentUser.id);
      
      if (currentUser.lastActiveDate) {
        const todayStr = new Date().toISOString().split('T')[0];
        const today = new Date(todayStr);
        const lastActive = new Date(currentUser.lastActiveDate);
        
        const diffTime = today.getTime() - lastActive.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          const previousStreak = currentUser.studyStreak || 0;
          
          // Check if automatic streak freeze can save them (only if away for exactly 2 days, i.e., missed 1 day)
          const freezeCount = currentUser.streakFreezeCount || 0;
          const lastUsed = currentUser.streakFreezeLastUsed;
          let canFreeze = false;
          
          if (diffDays === 2 && freezeCount > 0) {
            if (!lastUsed) {
              canFreeze = true;
            } else {
              const lastUsedDate = new Date(lastUsed);
              const diffTimeFreeze = Math.abs(new Date().getTime() - lastUsedDate.getTime());
              const diffDaysFreeze = Math.ceil(diffTimeFreeze / (1000 * 60 * 60 * 24));
              if (diffDaysFreeze >= 30) {
                canFreeze = true;
              }
            }
          }

          if (canFreeze) {
            // Automatically protect the streak for one missed day!
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            const updated = {
              ...currentUser,
              streakFreezeCount: Math.max(0, freezeCount - 1),
              streakFreezeLastUsed: new Date().toISOString(),
              lastActiveDate: yesterdayStr, // preserves streak so today they can study & continue it
            };
            
            saveUserProfile(updated);
            setCurrentUser(updated);
            alert(`❄️ Your study streak was automatically protected by a Streak Freeze! (1 consumed, ${updated.streakFreezeCount} left)`);
          } else {
            // Streak is lost. Start fresh today!
            const updated = {
              ...currentUser,
              studyStreak: 0,
              goalCompletionRate: 0,
              lastActiveDate: todayStr,
            };
            
            saveUserProfile(updated);
            setCurrentUser(updated);
            
            // Trigger returning user experience notification modal
            setReturningUserModal({
              daysAway: diffDays,
              previousStreak: previousStreak,
              type: diffDays >= 30 ? 'reactivate' : 'standard'
            });
          }
        }
      }
    }
  }, [currentUser, checkedUserId]);

  const handleActivateStreakFreeze = async () => {
    if (!currentUser) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const updated = calculateUpdatedProfile(currentUser, 'streak_freeze');
    setCurrentUser(updated);
    await saveUserProfile(updated);
  };

  const renderStreakFreezeBanner = () => {
    if (!currentUser) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (currentUser.lastActiveDate === todayStr) return null;

    if (currentUser.lastActiveDate === yesterdayStr) {
      const hoursLeft = 24 - new Date().getHours();
      return (
        <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 dark:from-amber-500/20 dark:to-red-500/20 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-amber-950 dark:text-white shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <Hourglass className="w-8 h-8 animate-bounce text-amber-600 dark:text-amber-200" />
            <div>
              <h4 className="font-black text-sm">Streak Danger!</h4>
              <p className="text-xs text-amber-800 dark:text-amber-200/90 font-medium">Your study streak expires in {hoursLeft} hours. Complete a study session or check off a task to keep it alive!</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/toolbox')}
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Study Now
          </button>
        </div>
      );
    }

    const freezeCount = currentUser.streakFreezeCount || 0;
    const lastUsed = currentUser.streakFreezeLastUsed;
    let canFreeze = false;
    if (freezeCount > 0) {
      if (!lastUsed) {
        canFreeze = true;
      } else {
        const lastUsedDate = new Date(lastUsed);
        const diffTime = Math.abs(new Date().getTime() - lastUsedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 30) {
          canFreeze = true;
        }
      }
    }

    if (canFreeze && (currentUser.studyStreak || 0) > 0) {
      return (
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-600/25 dark:to-indigo-600/25 border border-blue-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-800 dark:text-white shadow-md animate-fade-in animate-pulse">
          <div className="flex items-center gap-3.5">
            <Snowflake className="w-8 h-8 text-blue-600 dark:text-blue-200" />
            <div>
              <h4 className="font-black text-sm md:text-base text-blue-900 dark:text-white">Streak Restore Available!</h4>
              <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">Your study streak expired, but you can use your Streak Freeze to preserve your {currentUser.studyStreak} Day Streak!</p>
            </div>
          </div>
          <button 
            onClick={handleActivateStreakFreeze}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-98"
          >
            Use Streak Freeze ({freezeCount} left)
          </button>
        </div>
      );
    }

    return null;
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleCreateProfile = async (profileData: UserProfile) => {
    if (auth.currentUser) {
      const newProfile: UserProfile = {
        ...profileData,
        id: auth.currentUser.uid,
        email: auth.currentUser.email || undefined
      };
      await saveUserProfile(newProfile);
      setCurrentUser(newProfile);
    } else {
      setCurrentUser(profileData);
    }
    setIsOnboarding(false);
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    setIsEditingProfile(false);
    if (auth.currentUser) {
      setIsSaving(true);
      await saveUserProfile(updatedProfile);
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const handleLogout = async () => {
    if (auth.currentUser) {
      await signOut(auth);
    }
    setCurrentUser(null);
    navigate('/dashboard');
  };

  const handleGuestLogin = () => {
    const guestProfile: UserProfile = {
      id: 'guest-123',
      name: 'Guest Student',
      avatar: '',
      stressLevel: 5,
      learningStyle: ['Visual'],
      mainWorry: 'Just exploring...',
      exams: [
        { id: '1', subject: 'Demo Exam: Math', date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] }
      ],
      dailySchedule: [],
      totalStudyTime: 0,
      major: 'Cyber Security',
      semester: 'Semester 4',
      studyStreak: 0,
      bestStreak: 0,
      xp: 0,
      rank: 'Beginner',
      achievementsCount: 0,
      totalStudyHours: 0,
      studySessionsCompleted: 0,
      achievements: [],
      goalCompletionRate: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      streakFreezeCount: 1,
      streakFreezeLastUsed: ''
    };
    setCurrentUser(guestProfile);
    setIsOnboarding(false);
  };

  const handleNavigateToAi = (message: string) => {
    setPendingAiMessage(message);
    navigate('/zen-tutor/chat-coach');
  };

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'ST';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderAvatar = (userProfile: UserProfile, sizeClass = "text-[10px]") => {
    const avatarStr = userProfile.avatar;
    if (avatarStr && (avatarStr.startsWith('http') || avatarStr.startsWith('data:'))) {
      return <img src={avatarStr} alt="Avatar" className="w-full h-full object-cover" />;
    }
    return (
      <div className="h-full w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-indigo-600/40 to-purple-600/40">
        <svg className="w-1/2 h-1/2 opacity-25 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
          <path d="M5 13.18v4l7 3.82 7-3.82v-4L12 17l-7-3.82z"/>
        </svg>
        <span className={`absolute font-black tracking-tighter text-white select-none ${sizeClass}`}>
          {getInitials(userProfile.name)}
        </span>
      </div>
    );
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (currentPath === '/terms') return <LegalPolicyPage policyType="terms" onBack={() => navigate('/')} />;
  if (currentPath === '/privacy') return <LegalPolicyPage policyType="privacy" onBack={() => navigate('/')} />;
  if (currentPath === '/cookies') return <LegalPolicyPage policyType="cookies" onBack={() => navigate('/')} />;

  if (!hasConsent) {
    return <LegalConsentModal onConsent={() => setHasConsent(true)} />;
  }

  if (authUser && isOnboarding) return <Onboarding onComplete={handleCreateProfile} />;
  if (!currentUser) return <AccountSwitcher onGuestLogin={handleGuestLogin} />;

  const renderContent = () => {
    switch (currentSection) {
      case Section.HOME: {
        const hoursStudied = ((currentUser.studySessionsCompleted || 0) * 25) / 60;
        const dailyGoal = currentUser.dailyStudyGoal || 2;
        const streak = currentUser.studyStreak || 0;
        const bestStreakVal = currentUser.bestStreak || streak;
        const progressPercentage = Math.min(100, Math.round((hoursStudied / dailyGoal) * 100));

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDayStr = daysOfWeek[new Date().getDay()];
        const todaysEvents = (currentUser.dailySchedule || []).filter(e => e.day === todayDayStr);

        return (
          <div className="bento-grid pb-12 animate-fade-in max-w-6xl mx-auto">
            {/* Streak & Freeze Banners */}
            <div className="col-span-12">
              {renderStreakFreezeBanner()}
            </div>

            {/* Compact Welcome Header Card */}
            <div className="col-span-12 lg:col-span-8 bento-card p-6 md:p-8 flex flex-col justify-between h-full min-h-[180px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/40 dark:to-purple-900/40 overflow-hidden relative">
              <div className="relative z-10 space-y-4">
                <span className="inline-block px-3 py-1 bg-indigo-500/10 dark:bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black tracking-wider uppercase border border-indigo-500/20 dark:border-white/10 shadow-sm text-indigo-700 dark:text-indigo-300">Workspace active</span>
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-none text-indigo-950 dark:text-white drop-shadow-glow">
                  Welcome Back, {currentUser.name}
                </h2>
                <div className="space-y-2 max-w-sm mt-4">
                  <div className="flex justify-between items-center text-[11px] md:text-xs text-indigo-800 dark:text-indigo-200 font-bold">
                    <span>Goal: {hoursStudied.toFixed(1)} / {dailyGoal} Hours</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full -mr-32 -mt-32 blur-[60px] pointer-events-none"></div>
            </div>

            {/* Streak Pill */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-4 bento-card p-6 flex flex-col items-center justify-center text-center gap-3 h-full min-h-[180px] bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-900/20 dark:to-orange-900/20">
              <Flame className="w-12 h-12 text-orange-500 animate-float" />
              <div>
                <h4 className="text-xl font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 drop-shadow-glow">{streak} Days Streak</h4>
                <p className="text-[10px] font-bold text-amber-600/80 dark:text-amber-200/60 mt-1 uppercase tracking-widest">All-time best: {bestStreakVal}</p>
              </div>
            </div>

            {/* Quick Actions Row */}
            {(() => {
              const actions = [
                { id: Section.PLANNING, title: 'AI Planner', desc: 'Optimize roadmap', icon: <Rocket size={24} />, color: 'emerald' },
                { id: Section.CALENDAR, title: 'Schedule', desc: 'Manage calendar', icon: <Calendar size={24} />, color: 'indigo' },
                { id: Section.NOTES, title: 'Note Archive', desc: 'Summarize notes', icon: <FileText size={24} />, color: 'amber' },
                { id: Section.MINDSET, title: 'ILMORA Mentor', desc: 'Personal coaching', icon: <GraduationCap size={24} />, color: 'purple' },
              ];
              return actions.map(action => (
                <button
                  key={action.id}
                  onClick={() => navigate(getPathFromSection(action.id))}
                  className="col-span-6 md:col-span-3 bento-card p-4 hover:border-indigo-500/50 text-left flex flex-col items-center justify-center text-center gap-3 group"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-${action.color}-500/10 text-${action.color}-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner`}>
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{action.title}</h4>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold mt-1">{action.desc}</p>
                  </div>
                </button>
              ));
            })()}

            {/* Two-Column Productivity Workspace */}
            <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
              
              {/* Left Column: Tasks and Agenda */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Daily Checklist */}
                <div className="bento-card p-6 space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Today's Tasks</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Completing tasks secures and advances your study streak.</p>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                      {dashboardTasks.filter(t => t.completed).length} / {dashboardTasks.length} Done
                    </span>
                  </div>

                  {/* Add Task Form */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTask(newTaskText);
                    setNewTaskText('');
                  }} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a daily study task..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white h-9"
                    />
                    <button
                      type="submit"
                      disabled={!newTaskText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 rounded-xl text-xs disabled:opacity-50 transition-all h-9 flex items-center justify-center"
                    >
                      + Add
                    </button>
                  </form>

                  {/* Task List */}
                  {dashboardTasks.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-hide">
                      {dashboardTasks.map(task => (
                        <div 
                          key={task.id} 
                          className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 text-xs transition-all duration-200
                            ${task.completed ? 'opacity-60 bg-slate-50 dark:bg-slate-900/20' : 'hover:border-indigo-500/25'}
                          `}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center font-bold text-[9px] transition-all select-none
                                ${task.completed 
                                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'}
                              `}
                            >
                              {task.completed && '✓'}
                            </button>
                            {editingTaskId === task.id ? (
                              <div className="flex-1 min-w-0 pr-2">
                                <input
                                  type="text"
                                  value={editingTaskText}
                                  onChange={(e) => setEditingTaskText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditedTask(task.id);
                                    if (e.key === 'Escape') cancelEditingTask();
                                  }}
                                  autoFocus
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500/50 text-slate-800 dark:text-white"
                                />
                              </div>
                            ) : (
                              <span 
                                onDoubleClick={() => startEditingTask(task.id, task.text)}
                                className={`font-medium text-slate-800 dark:text-slate-200 truncate cursor-text ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}
                              >
                                {task.text}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {editingTaskId === task.id ? (
                              <>
                                <button
                                  onClick={() => saveEditedTask(task.id)}
                                  className="text-emerald-500 hover:text-emerald-600 text-xs px-1.5 py-0.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all font-bold"
                                  title="Save"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={cancelEditingTask}
                                  className="text-slate-400 hover:text-red-500 text-xs px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold"
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditingTask(task.id, task.text)}
                                  className="text-slate-400 hover:text-indigo-500 text-xs px-1.5 py-0.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all font-bold"
                                  title="Edit Task"
                                >
                                  ✎
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="text-slate-400 hover:text-red-500 text-xs px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold"
                                  title="Delete Task"
                                >
                                  ✕
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4 italic">No tasks listed for today. Add study milestones above!</p>
                  )}
                </div>

                {/* Today's Agenda */}
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider">Today's Agenda ({todayDayStr})</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Classes, study intervals, and leisure scheduled for today.</p>
                    </div>
                    <button 
                      onClick={() => navigate('/schedule')}
                      className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Edit Schedule
                    </button>
                  </div>

                  {todaysEvents.length > 0 ? (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto scrollbar-hide">
                      {todaysEvents.map(ev => (
                        <div key={ev.id} className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-base">
                              {ev.type === 'class' ? '🏫' : ev.type === 'study' ? '📖' : '☕'}
                            </span>
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{ev.title}</h4>
                              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">{ev.type}</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded text-[10px]">
                            {ev.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      <p className="text-xs text-slate-400">No schedule items entered for {todayDayStr}.</p>
                      <button 
                        onClick={() => navigate('/schedule')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] transition-all uppercase tracking-wider"
                      >
                        Build Routine
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Statistics, countdowns, mood check */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Stats Panel */}
                <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest leading-none">Weekly Progress</h3>
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-slate-50/80 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[7px] font-black uppercase text-slate-400 block">Hours worked</span>
                      <span className="text-base font-bold font-mono text-indigo-600 dark:text-indigo-400 block mt-1">{(currentUser.totalStudyHours || 0).toFixed(1)}h</span>
                    </div>
                    <div className="bg-slate-50/80 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[7px] font-black uppercase text-slate-400 block">Consistency</span>
                      <span className="text-base font-bold font-mono text-emerald-500 dark:text-emerald-400 block mt-1">{currentUser.consistencyScore || 30}%</span>
                    </div>
                    <div className="bg-slate-50/80 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[7px] font-black uppercase text-slate-455 block font-sans">Rank tier</span>
                      <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 block mt-2 truncate">{currentUser.rank || 'Beginner'}</span>
                    </div>
                  </div>
                </div>

                {/* Mood Check compactly */}
                <MoodCheckIn 
                  lastCheckInDate={currentUser.moodLogs && currentUser.moodLogs.length > 0 
                    ? currentUser.moodLogs[currentUser.moodLogs.length - 1].date 
                    : undefined}
                  onMoodSelect={(mood) => {
                    const updated = calculateUpdatedProfile(currentUser, 'mood_logged', { mood });
                    handleUpdateProfile(updated);
                  }}
                />

                {/* Upcoming Exams Countdown */}
                <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest leading-none">Exams Countdown</h3>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  
                  {currentUser.exams && currentUser.exams.length > 0 ? (
                    <div className="space-y-2">
                      {currentUser.exams.slice(0, 3).map(ex => {
                        const diffDays = Math.ceil((new Date(ex.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        const isUpcoming = diffDays >= 0;
                        return (
                          <div key={ex.id} className="flex justify-between items-center text-[11px] bg-slate-50/40 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-200/30 dark:border-slate-800">
                            <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[55%]">{ex.subject}</span>
                            <span className={`font-black text-[9px] uppercase tracking-wider ${isUpcoming ? (diffDays <= 3 ? 'text-red-500' : 'text-indigo-605') : 'text-slate-400'}`}>
                              {isUpcoming ? `${diffDays} days` : 'Past'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 text-center py-2 italic">No registered exams. Load upcoming exams in the Profile page.</p>
                  )}
                </div>

              </div>

            </div>
          </div>
        );
      }
      case Section.CALENDAR:
        return (
          <div className="max-w-5xl mx-auto w-full animate-fade-in pb-12">
            <CalendarManager userProfile={currentUser} onUpdateProfile={handleUpdateProfile} />
          </div>
        );
      case Section.PLANNING:
        return (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto w-full pb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white">AI Planner</h2>
              <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Personalized Optimizer</div>
            </div>
            <StudyPlanGenerator userProfile={currentUser || undefined} />
          </div>
        );
      case Section.NOTES:
        return (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto w-full pb-12">
            <h2 className="text-3xl font-extrabold tracking-tighter text-slate-900 dark:text-white">Note Archive</h2>
            <NotesSimplifier />
          </div>
        );
      case Section.MINDSET:
        return (
          <div className="flex-1 flex flex-col w-full h-full min-h-[600px] pb-4">
            <AICoach 
              userProfile={currentUser} 
              initialMessage={pendingAiMessage} 
              onMessageHandled={() => setPendingAiMessage('')} 
              onNavigate={(sec) => navigate(getPathFromSection(sec))} 
              activeTab={activeTutorTab || 'overview'}
              onTabChange={handleTutorTabChange}
            />
          </div>
        );
      case Section.STRATEGIES:
        return (
          <div className="max-w-5xl mx-auto w-full animate-fade-in pb-12">
            <StrategiesHub onAskAI={handleNavigateToAi} userProfile={currentUser} onUpdateProfile={handleUpdateProfile} onNavigate={(sec) => navigate(getPathFromSection(sec))} />
          </div>
        );
      case Section.PROFILE:
        return (
          <div className="space-y-6 animate-fade-in max-w-5xl mx-auto w-full pb-12">
            <div className="flex justify-between items-center">
              <h2 className="text-[28px] font-extrabold tracking-tighter text-slate-900 dark:text-white">Profile Settings</h2>
              <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Student Profile</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
              <div className="lg:col-span-4 flex justify-center">
                <StudentIdentityCard
                  user={currentUser}
                  onUpdateProfile={handleUpdateProfile}
                  onEditProfileClick={() => setIsEditingProfile(true)}
                />
              </div>
              
              <div className="lg:col-span-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">Identity Details</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Customize your personal academic metadata.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-slate-800 dark:text-white">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-400 block tracking-wider">Student Name</span>
                    <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100">{currentUser.name}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-400 block tracking-wider">Email Address</span>
                    <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100">{currentUser.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-400 block tracking-wider">University / College</span>
                    <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100">{currentUser.university || 'ILMORA Institute'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-400 block tracking-wider">Course / Major</span>
                    <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100">{currentUser.course || currentUser.major || 'Cyber Security'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-400 block tracking-wider">Current Semester</span>
                    <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100">{currentUser.semester || 'Semester 4'}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-400 block tracking-wider">Daily Study Goal</span>
                    <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-100">{currentUser.dailyStudyGoal || 2} Hours</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm text-xs active:scale-98"
                  >
                    ✏️ Edit Profile Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Section not found</div>;
    }
  };

  const renderBreadcrumbs = () => {
    const handleHomeClick = () => navigate('/dashboard');

    const homeButton = (
      <button
        onClick={handleHomeClick}
        className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-white dark:border-slate-700/80 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
        title="Return to Dashboard"
      >
        <Home size={16} className="group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Home</span>
      </button>
    );

    if (currentPath === '/dashboard') {
      return (
        <div className="hidden md:flex items-center gap-1.5">
          {homeButton}
        </div>
      );
    }

    if (currentPath.startsWith('/zen-tutor')) {
      const parts = currentPath.split('/');
      const tab = parts[2] || 'overview';
      
      const tabLabels: Record<string, string> = {
        'overview': 'Overview',
        'learning-profile': 'Learning Profile',
        'focus-insights': 'Focus Insights',
        'academic-diagnosis': 'Academic Diagnosis',
        'burnout-stress': 'Burnout & Stress',
        'progress-trends': 'Progress Trends',
        'recommendations': 'Recommendations',
        'chat-coach': 'AI Chat Coach',
      };
      
      const activeTabLabel = tabLabels[tab] || 'Overview';

      return (
        <div className="hidden md:flex items-center gap-1.5">
          {homeButton}
          <span className="text-slate-300 dark:text-slate-655 text-base font-light">/</span>
          <button
            onClick={() => navigate('/zen-tutor/overview')}
            className="bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-white dark:border-slate-700/80 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-[10px] font-black text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-wider"
          >
            ILMORA Mentor
          </button>
          <span className="text-slate-300 dark:text-slate-655 text-base font-light">/</span>
          <div className="bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-white dark:border-slate-700/80 shadow-sm">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{activeTabLabel}</span>
          </div>
        </div>
      );
    }

    const sectionLabels: Record<string, string> = {
      '/schedule': 'Schedule',
      '/planner': 'AI Planner',
      '/notes': 'Note Archive',
      '/toolbox': 'Toolbox',
      '/profile': 'Profile Settings',
    };
    const label = sectionLabels[currentPath] || 'Page';

    return (
      <div className="hidden md:flex items-center gap-1.5">
        {homeButton}
        <span className="text-slate-300 dark:text-slate-655 text-base font-light">/</span>
        <div className="bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-white dark:border-slate-700/80 shadow-sm">
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-background text-slate-900 dark:text-on-surface overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container transition-colors duration-500">
      
      {/* Top Navigation */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-surface/80 backdrop-blur-3xl z-50 border-b border-slate-200 dark:border-outline-variant/10">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center px-3 md:px-8 h-16">
          <div className="flex items-center gap-4">
            <span className="font-display-lg-mobile md:font-display-lg text-lg md:text-xl font-bold tracking-tighter text-slate-900 dark:text-on-surface">ILMORA</span>
            {renderBreadcrumbs()}
          </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-8 text-slate-500 dark:text-on-surface-variant font-label-sm">
            <span className="text-indigo-600 dark:text-primary font-bold">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="text-slate-500 dark:text-on-surface-variant hover:text-indigo-600 dark:hover:text-primary transition-colors text-lg" title="Toggle Theme">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div 
              className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20 cursor-pointer"
              onClick={() => setIsEditingProfile(true)}
              title="Profile Settings"
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-container flex items-center justify-center font-bold text-xs text-primary">{currentUser.name.charAt(0)}</div>
              )}
            </div>
            <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-error hover:text-error-container transition-colors ml-2 hidden md:block">
              Log Out
            </button>
          </div>
        </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full pt-20 md:pt-24 pb-24 md:pb-32 px-3 md:px-8 max-w-6xl mx-auto overflow-y-auto scrollbar-hide">
        <div className="animate-fade-in flex-1 w-full flex flex-col">
           {renderContent()}
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <Navigation
        currentPath={currentPath}
        onNavigatePath={navigate}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        theme={theme}
        toggleTheme={toggleTheme}
        onLogout={handleLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {isEditingProfile && (
        <ProfileEditor user={currentUser} onSave={handleUpdateProfile} onCancel={() => setIsEditingProfile(false)} />
      )}

      {returningUserModal && (
        <ReturningUserModal
          daysAway={returningUserModal.daysAway}
          previousStreak={returningUserModal.previousStreak}
          type={returningUserModal.type}
          onClose={() => setReturningUserModal(null)}
        />
      )}
    </div>
  );
};
