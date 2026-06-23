import React, { useState } from 'react';
import { StudySession, PlannerFormData, UserProfile } from '../types';
import { generateAiStudyPlan } from '../services/aiService';

interface StudyPlanGeneratorProps {
  userProfile?: UserProfile;
}

export const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({ userProfile }) => {
  const [formData, setFormData] = useState<PlannerFormData>({
    subjects: '',
    availability: '',
    preferences: ''
  });
  const [plan, setPlan] = useState<StudySession[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateLocalPlan = (subjectsText: string, availabilityText: string): StudySession[] => {
    // Split subjects by commas or newlines
    const subjects = subjectsText.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
    const sessions: StudySession[] = [];
    
    // Heuristic: Try to guess available hours. Default to 3 if unclear.
    const hoursMatch = availabilityText.match(/(\d+)\s*(hour|hr|h)/i);
    const totalHours = hoursMatch ? parseInt(hoursMatch[1]) : 3;
    const totalMinutes = totalHours * 60;
    
    // Distribute time: 50 mins study, 10 mins break
    let remainingMinutes = totalMinutes;
    let subjectIndex = 0;
    let sessionCount = 1;

    while (remainingMinutes > 0 && subjectIndex < subjects.length) {
      // Study block (max 50 mins)
      const studyDuration = Math.min(50, remainingMinutes);
      sessions.push({
        subject: subjects[subjectIndex],
        topic: `Deep dive into ${subjects[subjectIndex]}`,
        duration: `${studyDuration} mins`,
        technique: studyDuration > 25 ? 'Pomodoro (Long)' : 'Focus Block',
        timeRange: `Session ${sessionCount}`
      });
      remainingMinutes -= studyDuration;
      
      // Break block (if time remains)
      if (remainingMinutes > 5) {
        const breakDuration = Math.min(10, remainingMinutes);
        sessions.push({
          subject: 'Break & Refresh',
          topic: 'Stretch, hydrate, and rest your eyes.',
          duration: `${breakDuration} mins`,
          technique: 'Wellness Reset',
          timeRange: 'Rest'
        });
        remainingMinutes -= breakDuration;
      }
      
      subjectIndex = (subjectIndex + 1) % subjects.length;
      sessionCount++;
      
      // Safety break to prevent infinite loops
      if (sessionCount > 20) break;
    }

    return sessions;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const aiPlan = await generateAiStudyPlan(
        formData.subjects,
        formData.availability,
        formData.preferences,
        userProfile
      );

      if (!aiPlan || aiPlan.length === 0) {
        throw new Error("Empty plan returned");
      }
      setPlan(aiPlan);
    } catch (err: any) {
      console.warn("Gemini Study Plan generation failed, falling back to local scheduler:", err);
      try {
        const localPlan = generateLocalPlan(formData.subjects, formData.availability);
        if (localPlan.length === 0) {
          setError("I couldn't identify subjects to schedule. Please list them separated by commas.");
        } else {
          setPlan(localPlan);
        }
      } catch (localErr) {
        setError("Failed to generate plan. Please try again with simpler text.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getIcon = (session: StudySession) => {
    const text = (session.subject + ' ' + session.topic).toLowerCase();
    if (text.includes('break') || text.includes('rest') || text.includes('wellness')) return '⏸️';
    return '📚';
  };

  const isBreak = (session: StudySession) => 
    session.subject.toLowerCase().includes('break') || 
    session.technique.toLowerCase().includes('wellness');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 h-fit transition-all duration-300">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">AI Schedule Builder</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4.5 font-medium">Personalized and intelligent. Built using the Google Gemini model.</p>
        
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="group">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 group-focus-within:text-indigo-650 dark:group-focus-within:text-indigo-400 transition-colors">
                What do you need to study? (Comma separated)
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Calculus, Spanish History, Biology"
              className="w-full bg-slate-850 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner resize-none text-xs"
              value={formData.subjects}
              onChange={e => setFormData({...formData, subjects: e.target.value})}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="group">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 group-focus-within:text-indigo-650 dark:group-focus-within:text-indigo-400 transition-colors">
                How many hours are you available?
            </label>
            <textarea
              required
              rows={1}
              placeholder="e.g. 4 hours"
              className="w-full bg-slate-850 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner resize-none text-xs"
              value={formData.availability}
              onChange={e => setFormData({...formData, availability: e.target.value})}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="group">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 group-focus-within:text-indigo-650 dark:group-focus-within:text-indigo-400 transition-colors">
                Any preferences? (Optional)
            </label>
            <textarea
              rows={1}
              placeholder="e.g. Hardest first, include frequent breaks, night study style"
              className="w-full bg-slate-850 text-white placeholder-slate-500 border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner resize-none text-xs"
              value={formData.preferences}
              onChange={e => setFormData({...formData, preferences: e.target.value})}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold h-[44px] rounded-lg hover:shadow-sm transition-all disabled:opacity-50 active:scale-98 flex items-center justify-center text-xs"
          >
            {loading ? 'Designing Schedule...' : '🚀 Build Instant Plan'}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-3 bg-red-50 p-2 rounded-lg border border-red-100 text-center">{error}</p>}
      </div>

      <div className="lg:col-span-7 space-y-4">
        {!plan && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 min-h-[290px] bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                <span className="text-3xl mb-2 opacity-35">📅</span>
                <p className="font-semibold text-xs">Your optimized schedule will appear here.</p>
            </div>
        )}

        {loading && (
             <div className="h-full flex flex-col items-center justify-center text-secondary border border-dashed border-secondary/20 rounded-2xl p-5 min-h-[290px] bg-emerald-50/20 dark:bg-emerald-900/5 backdrop-blur-sm animate-pulse">
             <div className="text-3xl mb-2 opacity-40">🧬</div>
             <p className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Calculating Optimizer...</p>
         </div>
        )}

        {plan && (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up">
             <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center backdrop-blur-sm">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Daily Roadmap</h3>
                <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold shadow-sm">{plan.length} Blocks</span>
             </div>
             <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {plan.map((session, idx) => (
                    <div 
                        key={idx} 
                        className={`p-3.5 transition-all flex items-start gap-3.5 animate-slide-up group
                        ${isBreak(session) ? 'bg-emerald-50/20 dark:bg-emerald-900/5 hover:bg-emerald-50/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}
                    `}>
                        <div className="flex-shrink-0 w-16 text-center pt-0.5 flex flex-col items-center">
                            <span className="block font-bold text-slate-800 dark:text-white text-[8px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm w-full mb-1 leading-normal">
                                {session.timeRange}
                            </span>
                            <span className="text-xl mt-1 transform group-hover:scale-105 transition-transform duration-300">{getIcon(session)}</span>
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold text-sm flex items-center gap-1.5 ${isBreak(session) ? 'text-emerald-800 dark:text-emerald-450' : 'text-slate-800 dark:text-slate-100'}`}>
                                {session.subject}
                            </h4>
                            <p className="text-[11px] text-slate-550 dark:text-slate-400 font-medium mb-1">{session.topic}</p>
                            
                            <div className="flex gap-1.5 flex-wrap">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md border font-semibold shadow-sm ${isBreak(session) ? 'bg-emerald-50/60 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100/55 dark:border-emerald-850' : 'bg-indigo-50/60 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100/55 dark:border-indigo-850'}`}>
                                    {isBreak(session) ? '🌿' : '💡'} {session.technique}
                                </span>
                                <span className="text-[9px] text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md">{session.duration}</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};