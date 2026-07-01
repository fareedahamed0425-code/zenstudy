import React, { useState } from 'react';
import { StudySession, PlannerFormData, UserProfile } from '../types';
import { generateAiStudyPlan } from '../services/aiService';
import { Pause, BookOpen, Rocket, Calendar, Activity, Leaf, Lightbulb } from 'lucide-react';

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
    if (text.includes('break') || text.includes('rest') || text.includes('wellness')) return <Pause size={18} />;
    return <BookOpen size={18} />;
  };

  const isBreak = (session: StudySession) => 
    session.subject.toLowerCase().includes('break') || 
    session.technique.toLowerCase().includes('wellness');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
      <div className="lg:col-span-5 bento-card p-5 h-full">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">AI Schedule Builder</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4.5 font-medium">Personalized and intelligent. Built using the Google Gemini model.</p>
        
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="group">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">
                What do you need to study? (Comma separated)
            </label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Calculus, Spanish History, Biology"
              className="w-full bg-slate-50 dark:bg-surface-container text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-outline-variant/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all shadow-sm resize-none text-xs"
              value={formData.subjects}
              onChange={e => setFormData({...formData, subjects: e.target.value})}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="group">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">
                How many hours are you available?
            </label>
            <textarea
              required
              rows={1}
              placeholder="e.g. 4 hours"
              className="w-full bg-slate-50 dark:bg-surface-container text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-outline-variant/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all shadow-sm resize-none text-xs"
              value={formData.availability}
              onChange={e => setFormData({...formData, availability: e.target.value})}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="group">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors">
                Any preferences? (Optional)
            </label>
            <textarea
              rows={1}
              placeholder="e.g. Hardest first, include frequent breaks, night study style"
              className="w-full bg-slate-50 dark:bg-surface-container text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-outline-variant/10 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all shadow-sm resize-none text-xs"
              value={formData.preferences}
              onChange={e => setFormData({...formData, preferences: e.target.value})}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold h-[44px] rounded-lg hover:shadow-sm transition-all disabled:opacity-50 active:scale-98 flex items-center justify-center gap-2 text-xs"
          >
            {loading ? 'Designing Schedule...' : <><Rocket size={16}/> Build Instant Plan</>}
          </button>
        </form>
        {error && <p className="text-red-500 text-xs mt-3 bg-red-50 p-2 rounded-lg border border-red-100 text-center">{error}</p>}
      </div>

      <div className="lg:col-span-7 space-y-4 md:space-y-6 h-full">
        {!plan && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-outline-variant/20 rounded-2xl p-5 min-h-[290px] bg-white/30 dark:bg-surface-container/30 backdrop-blur-sm">
                <span className="mb-2 text-slate-300 dark:text-slate-600"><Calendar size={32}/></span>
                <p className="font-semibold text-xs">Your optimized schedule will appear here.</p>
            </div>
        )}

        {loading && (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-200 dark:border-outline-variant/20 rounded-2xl p-5 min-h-[290px] bg-slate-50/50 dark:bg-surface-container/50 backdrop-blur-sm animate-pulse">
             <span className="mb-2 text-slate-400 dark:text-slate-500"><Activity size={32}/></span>
             <p className="font-bold text-sm text-slate-700 dark:text-slate-300">Calculating Optimizer...</p>
         </div>
        )}

        {plan && (
          <div className="bento-card overflow-hidden animate-slide-up">
             <div className="p-3.5 bg-slate-50/80 dark:bg-surface-container/30 border-b border-slate-100 dark:border-outline-variant/10 flex justify-between items-center backdrop-blur-sm">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Daily Roadmap</h3>
                <span className="text-[9px] bg-slate-100 dark:bg-surface-bright text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold shadow-sm">{plan.length} Blocks</span>
             </div>
             <div className="divide-y divide-slate-100 dark:divide-outline-variant/10 max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {plan.map((session, idx) => (
                    <div 
                        key={idx} 
                        className={`p-3.5 transition-all flex items-start gap-3.5 animate-slide-up group
                        ${isBreak(session) ? 'bg-slate-50/50 dark:bg-surface-container/50 hover:bg-slate-100/50 dark:hover:bg-surface-bright/50' : 'hover:bg-slate-50 dark:hover:bg-surface-container'}
                    `}>
                        <div className="flex-shrink-0 w-16 text-center pt-0.5 flex flex-col items-center">
                            <span className="block font-bold text-slate-900 dark:text-white text-[8px] bg-white dark:bg-background border border-slate-200 dark:border-outline-variant/20 px-1.5 py-0.5 rounded shadow-sm w-full mb-1 leading-normal">
                                {session.timeRange}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 mt-1 transform group-hover:scale-105 transition-transform duration-300">{getIcon(session)}</span>
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold text-sm flex items-center gap-1.5 ${isBreak(session) ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                {session.subject}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">{session.topic}</p>
                            
                            <div className="flex gap-1.5 flex-wrap items-center">
                                <span className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md border font-semibold shadow-sm ${isBreak(session) ? 'bg-slate-50 dark:bg-surface-container text-slate-600 dark:text-slate-400 border-slate-200 dark:border-outline-variant/10' : 'bg-slate-100 dark:bg-surface-bright text-slate-800 dark:text-white border-slate-200 dark:border-outline-variant/20'}`}>
                                    {isBreak(session) ? <Leaf size={10}/> : <Lightbulb size={10}/>} {session.technique}
                                </span>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-outline-variant/10 px-1.5 py-0.5 rounded-md">{session.duration}</span>
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