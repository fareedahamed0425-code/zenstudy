import React, { useState } from 'react';
import { UserProfile } from '../types';
import { uploadProfileImage } from '../services/db';
import { auth } from '../firebase';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Step 1: Student Profile State
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [university, setUniversity] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('Semester 1');
  const [targetCGPA, setTargetCGPA] = useState('');
  const [dailyStudyGoal, setDailyStudyGoal] = useState('2'); // default 2 hours
  const [preferredStudyHours, setPreferredStudyHours] = useState('Morning');

  // Step 2: Academic Personality State
  const [studyBest, setStudyBest] = useState('Morning');
  const [challenge, setChallenge] = useState('Procrastination');
  const [dailyHours, setDailyHours] = useState('2-4 Hours');
  const [learningStyle, setLearningStyle] = useState('Mixed');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && auth.currentUser) {
      const file = e.target.files[0];
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Support JPG, PNG, WEBP.');
        return;
      }

      setIsUploading(true);
      setUploadError('');
      try {
        const url = await uploadProfileImage(auth.currentUser.uid, file);
        setAvatar(url);
      } catch (error) {
        console.error("Upload failed", error);
        setUploadError("Failed to upload image.");
      } finally {
        setIsUploading(false);
      }
    } else if (!auth.currentUser) {
      setUploadError("Please login to upload images.");
    }
  };

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'ST';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleComplete = () => {
    onComplete({
      id: auth.currentUser?.uid || Date.now().toString(),
      name: name.trim(),
      avatar: avatar,
      stressLevel: 3, // starting base value
      learningStyle: [learningStyle],
      mainWorry: challenge,
      exams: [],
      dailySchedule: [],
      totalStudyTime: 0,
      
      // Extended fields
      university: university.trim(),
      course: course.trim(),
      semester: semester,
      targetCGPA: parseFloat(targetCGPA) || 3.5,
      dailyStudyGoal: parseFloat(dailyStudyGoal) || 2,
      preferredStudyHours: preferredStudyHours,
      
      academicPersonality: {
        studyBest,
        challenge,
        dailyHours,
        learningStyle,
      },

      // Initial stats
      moodLogs: [],
      streakFreezeCount: 1, // one free freeze
      streakFreezeLastUsed: '',
      studyStreak: 0,
      bestStreak: 0,
      totalStudyHours: 0,
      studySessionsCompleted: 0,
      achievements: [],
      goalCompletionRate: 0,
      tasksCompletedCount: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],

      // Psychological Engine Default Output
      focusProfile: 'Analyzing behavior...',
      motivationProfile: 'Analyzing behavior...',
      burnoutRiskScore: 10, // low starting risk percentage
      stressTrend: [0],
      consistencyScore: 100,
      adaptiveLearningProfile: 'Analyzing behavior...'
    });
  };

  const isUrl = (str: string) => str && (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('data:image/'));

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-xl w-full p-8 relative overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800 animate-slide-up">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
            style={{ width: `${(step / 2) * 100}%` }}
          ></div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-50 bg-slate-100 dark:bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xs"
          >
            ✕
          </button>
        )}

        <div className="flex-1 overflow-y-auto pr-1 pt-4 pb-2 scrollbar-thin">
          
          {/* STEP 1: STUDENT PROFILE */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Student Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Step 1 of 2: Let's build your identity</p>
              </div>

              {/* Profile Avatar Upload */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 group cursor-pointer mb-2">
                  <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center overflow-hidden relative">
                    {isUrl(avatar) ? (
                      <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-indigo-500/25 to-purple-500/25">
                        <svg className="w-10 h-10 opacity-30 text-indigo-500 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                          <path d="M5 13.18v4l7 3.82 7-3.82v-4L12 17l-7-3.82z"/>
                        </svg>
                        <span className="absolute text-lg font-black tracking-tighter text-indigo-700 dark:text-indigo-300">
                          {name.trim() ? getInitials(name) : 'ST'}
                        </span>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  </label>
                </div>
                {uploadError && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider">{uploadError}</p>}
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Upload profile picture (optional)</p>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
                    placeholder="Fareed Ahamed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">University / College</label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
                    placeholder="ZenITH Institute"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Course / Degree Major</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
                    placeholder="Cyber Security"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Current Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
                  >
                    {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Target CGPA (e.g. 4.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={targetCGPA}
                    onChange={(e) => setTargetCGPA(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
                    placeholder="3.8"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Daily Study Goal (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={dailyStudyGoal}
                    onChange={(e) => setDailyStudyGoal(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white font-medium text-sm"
                    placeholder="3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Preferred Study Hours</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Morning', 'Afternoon', 'Night'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setPreferredStudyHours(time)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        preferredStudyHours === time
                          ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => { if (name.trim()) setStep(2); }}
                disabled={!name.trim() || isUploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                <span>Continue to Personality Settings</span>
                <span>→</span>
              </button>
            </div>
          )}

          {/* STEP 2: ACADEMIC PERSONALITY */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Academic Personality</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">Step 2 of 2: Optimize your workflow</p>
              </div>

              <div className="space-y-5">
                {/* Question 1 */}
                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">1. When do you study best?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setStudyBest(item)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          studyBest === item
                            ? 'bg-indigo-600 text-white border-transparent'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">2. What is your biggest challenge?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Procrastination', 'Focus', 'Time Management', 'Exam Anxiety'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setChallenge(item)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          challenge === item
                            ? 'bg-indigo-600 text-white border-transparent'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 3 */}
                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">3. How many hours can you realistically study daily?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1-2 Hours', '2-4 Hours', '4-6 Hours', '6+ Hours'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setDailyHours(item)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          dailyHours === item
                            ? 'bg-indigo-600 text-white border-transparent'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question 4 */}
                <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">4. How do you learn best?</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Reading', 'Videos', 'Practice', 'Mixed'].map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setLearningStyle(item)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          learningStyle === item
                            ? 'bg-indigo-600 text-white border-transparent'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold text-xs hover:shadow-lg hover:scale-[1.01] transition-all active:scale-[0.99]"
                >
                  Create My Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};