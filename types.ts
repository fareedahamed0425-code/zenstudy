export enum Section {
  HOME = 'HOME',
  CALENDAR = 'CALENDAR',
  PLANNING = 'PLANNING',
  NOTES = 'NOTES',
  STRATEGIES = 'STRATEGIES',
  MINDSET = 'MINDSET',
  PROFILE = 'PROFILE',
}

export interface Source {
  title: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  sources?: Source[];
  isError?: boolean;
  reasoning_details?: any;
}

export interface StudySession {
  timeRange?: string; // e.g. "09:00 - 09:50"
  subject: string;
  topic: string;
  duration: string; // e.g. "45 mins"
  technique: string; // e.g. "Pomodoro"
}

export interface PlannerFormData {
  subjects: string;
  availability: string; // e.g. "Today 2pm-6pm" or "3 hours"
  preferences: string; // e.g. "Hardest first" or "I get distracted"
}

export interface CopingStrategy {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji
}

export interface Exam {
  id: string;
  subject: string;
  date: string;
}

export interface DailyEvent {
  id: string;
  day: string; // 'Monday', 'Tuesday'...
  time: string; // '09:00'
  title: string;
  type: 'class' | 'study' | 'leisure';
  completed?: boolean;
}

export interface PsychologicalProfile {
  stressResponse: string; // e.g. "Procrastinate", "Panic", "Shutdown"
  productivityPeak: string; // e.g. "Morning", "Night", "Random"
  motivation: string; // e.g. "Fear of Failure", "Good Grades", "Curiosity"
}

export interface UserProfile {
  id: string; // Unique ID (Firebase UID)
  email?: string;
  name: string;
  avatar: string; // Emoji OR Image URL
  stressLevel: number; // 1-10
  learningStyle: string[];
  mainWorry: string;
  exams: Exam[];
  dailySchedule?: DailyEvent[];
  psychologicalProfile?: PsychologicalProfile;
  totalStudyTime?: number; // Total minutes tracked in app
  dailyScreenTime?: number; // Manual entry for device screen time in hours
  major?: string; // e.g. "Cyber Security"
  semester?: string; // e.g. "Semester 4"
  studyStreak?: number; // e.g. 12
  xp?: number; // e.g. 120
  rank?: string; // e.g. "Scholar"
  achievementsCount?: number; // e.g. 3
  
  // New Identity & Onboarding fields
  university?: string;
  course?: string;
  targetCGPA?: number;
  dailyStudyGoal?: number; // Daily Study Goal in hours
  preferredStudyHours?: string;
  academicPersonality?: {
    studyBest: string;
    challenge: string;
    dailyHours: string;
    learningStyle: string;
  };

  // Background Tracker & Psychological Engine
  moodLogs?: { date: string; mood: string }[];
  streakFreezeLastUsed?: string; // ISO string
  streakFreezeCount?: number;
  bestStreak?: number;
  totalStudyHours?: number;
  studySessionsCompleted?: number;
  achievements?: string[];
  goalCompletionRate?: number;
  lastActiveDate?: string; // YYYY-MM-DD
  tasksCompletedCount?: number;
  
  // Behavioral Profile Engine Outputs
  focusProfile?: string;
  motivationProfile?: string;
  burnoutRiskScore?: number;
  stressTrend?: number[];
  consistencyScore?: number;
  adaptiveLearningProfile?: string;
}

export interface SavedNote {
  id: string;
  title: string;
  original: string;
  simplified: string;
  date: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string; // The index or the string of the correct answer
}

export interface DiagnosticResult {
  dominantCategory: string;
  score: number;
  advice: string;
  recommendedAction: { label: string; icon: string; section: Section };
}
