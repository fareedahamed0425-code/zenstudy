import { UserProfile, ChatMessage, Source, StudySession } from "../types";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        console.warn(`Rate limit hit. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        backoff *= 2;
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, backoff));
      backoff *= 2;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Helper to call the Google Gemini API
 */
async function callGemini(contents: any[], systemInstructionText?: string, responseMimeType?: string): Promise<string> {
  const url = `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`;
  const body: any = {
    contents,
  };
  
  if (systemInstructionText) {
    body.systemInstruction = {
      parts: [{ text: systemInstructionText }]
    };
  }
  
  if (responseMimeType) {
    body.generationConfig = {
      responseMimeType
    };
  }

  const response = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API Error ${response.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");

  return text;
}

/**
 * Modern AI Service powered by Gemini.
 */
export const getAiTutorResponse = async (
  userMessage: string,
  history: ChatMessage[],
  userProfile?: UserProfile
): Promise<{ text: string, sources: Source[], reasoning_details?: any }> => {
  const context = userProfile ? `
    Student Info:
    Name: ${userProfile.name}
    University: ${userProfile.university || 'ZenITH Institute'}
    Course: ${userProfile.course || 'Cyber Security'}
    Semester: ${userProfile.semester || 'Semester 4'}
    Daily Study Goal: ${userProfile.dailyStudyGoal || 2} hours
    Preferred Study Hours: ${userProfile.preferredStudyHours || 'Morning'}
    
    Academic Personality:
    Best time to study: ${userProfile.academicPersonality?.studyBest || 'Morning'}
    Biggest challenge: ${userProfile.academicPersonality?.challenge || 'Procrastination'}
    Learning Style: ${userProfile.academicPersonality?.learningStyle || 'Mixed'}
    
    System-Tracked Behavior:
    Study Streak: ${userProfile.studyStreak || 0} days
    Total Study Hours: ${(userProfile.totalStudyHours || 0).toFixed(1)}h
    Completed Study Sessions: ${userProfile.studySessionsCompleted || 0}
    Achievements: ${userProfile.achievements?.join(', ') || 'None yet'}
    Goal Completion Rate: ${userProfile.goalCompletionRate || 0}%
    
    Psychological Profile Engine Outputs:
    Focus Profile: ${userProfile.focusProfile || 'Analyzing...'}
    Motivation Profile: ${userProfile.motivationProfile || 'Analyzing...'}
    Burnout Risk Score: ${userProfile.burnoutRiskScore || 10}%
    Consistency Score: ${userProfile.consistencyScore || 100}%
    Adaptive Learning Profile: ${userProfile.adaptiveLearningProfile || 'Analyzing...'}
    Exams: ${userProfile.exams.map(e => `${e.subject} (${e.date})`).join(', ')}
  ` : 'No specific user context available.';

  const systemInstruction = `You are Zen, an empathetic AI Study Coach. Your goal is to help students manage exam stress and improve their performance.
  
  Be conversational, supportive, and insightful. When explaining things, use simple analogies.
  
  Student Context:
  ${context}`;

  let firstUserFound = false;
  const contents: any[] = [];
  history.forEach(msg => {
    if (msg.role === 'model' || msg.role === 'user') {
      if (msg.role === 'user') firstUserFound = true;
      if (!firstUserFound && msg.role === 'model') return;

      contents.push({
        role: msg.role,
        parts: [{ text: msg.text || "" }]
      });
    }
  });

  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  try {
    const text = await callGemini(contents, systemInstruction);
    return {
      text: text.trim(),
      sources: []
    };
  } catch (error) {
    console.error("Gemini AI Tutor Failure:", error);
    throw error;
  }
};

/**
 * Simplifies a set of study notes.
 */
export const simplifyNotes = async (notes: string): Promise<string> => {
  try {
    const systemInstruction = "You are an expert at summarizing complex academic material.";
    const contents = [
      {
        role: "user",
        parts: [{ text: `Simplify and organize these notes into a clear structure with bold key terms:\n\n${notes}` }]
      }
    ];

    const text = await callGemini(contents, systemInstruction);
    return text.trim();
  } catch (error) {
    console.error("Gemini Simplify Notes Failure:", error);
    return notes;
  }
};

/**
 * Generates a quiz from notes.
 */
export const generateQuizFromNotes = async (notes: string) => {
  try {
    const contents = [
      {
        role: "user",
        parts: [{ text: `Generate 3 multiple-choice questions from these notes. Return ONLY valid JSON in format: [{"question":"...","options":["..."],"correctAnswer":"..."}].\n\nNotes:\n\n${notes}` }]
      }
    ];

    const text = await callGemini(contents, undefined, "application/json");
    const content = text.replace(/```json\s?|```/g, '').trim();
    return JSON.parse(content);
  } catch (error) {
    console.error("Gemini Generate Quiz Failure:", error);
    return [];
  }
};

/**
 * Generates an AI optimized study plan.
 */
export const generateAiStudyPlan = async (
  subjects: string,
  availability: string,
  preferences?: string,
  userProfile?: UserProfile
): Promise<StudySession[]> => {
  const systemInstruction = `You are a personalized study plan assistant. Your goal is to design an optimized study roadmap based on the student's subjects, time availability, learning styles, and stress concerns.
You MUST respond ONLY with a JSON array containing study sessions. Do not include markdown code block formatting (like \`\`\`json). The output must be directly parseable as JSON.
Each session must match this TypeScript interface:
interface StudySession {
  subject: string;
  topic: string;
  duration: string; // e.g., "50 mins", "10 mins"
  technique: string; // e.g., "Pomodoro", "Active Recall", "Feynman Technique", "Wellness Reset"
  timeRange: string; // e.g., "Session 1", "Break", "Session 2"
}
Ensure to include break blocks (e.g., 10 mins break with technique 'Wellness Reset' and subject 'Break & Refresh') to manage stress and avoid burnout.`;

  const context = userProfile ? `
Student Profile:
Name: ${userProfile.name}
Learning Style: ${userProfile.learningStyle.join(', ')}
Main Stress/Worry: ${userProfile.mainWorry}
Stress Level: ${userProfile.stressLevel}/10` : '';

  const prompt = `Subjects to Study: ${subjects}
Time Availability: ${availability}
Preferences: ${preferences || 'None'}
${context}`;

  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }]
    }
  ];

  try {
    const text = await callGemini(contents, systemInstruction, "application/json");
    const content = text.replace(/```json\s?|```/g, '').trim();
    return JSON.parse(content);
  } catch (error) {
    console.error("Gemini Generate Study Plan Failure:", error);
    throw error;
  }
};