import React, { useState } from 'react';
import { diagnosticQuestions } from '../constants';
import { Section } from '../types';

export const SymptomChecker: React.FC<{ onNavigateToStrategy: (section: Section) => void }> = ({ onNavigateToStrategy }) => {
    const [step, setStep] = useState(0); // 0 = start, 1...n = questions, n+1 = results
    const [scores, setScores] = useState({ Physical: 0, Emotional: 0, Cognitive: 0 });
    const [isFinished, setIsFinished] = useState(false);

    const handleAnswer = (category: string, score: number) => {
        setScores(prev => ({
            ...prev,
            [category]: prev[category as keyof typeof scores] + score
        }));

        if (step < diagnosticQuestions.length - 1) {
            setStep(step + 1);
        } else {
            setIsFinished(true);
        }
    };

    const getResult = () => {
        let dominant = 'Physical';
        let max = 0;
        Object.entries(scores).forEach(([key, val]) => {
            const score = val as number;
            if (score > max) {
                max = score;
                dominant = key;
            }
        });

        return { dominant, max };
    };

    const reset = () => {
        setStep(0);
        setScores({ Physical: 0, Emotional: 0, Cognitive: 0 });
        setIsFinished(false);
    };

    const { dominant, max } = getResult();

    const getPrescription = (type: string) => {
        if (type === 'Physical') return {
            title: "Somatic Overload",
            desc: "Your body is stuck in 'Fight or Flight'. The stress hormones (cortisol) are physically manifesting.",
            action: "Flush the adrenaline.",
            tool: "Breathing & Sleep",
            targetSection: Section.STRATEGIES
        };
        if (type === 'Cognitive') return {
            title: "Mental Fog / Analysis Paralysis",
            desc: "Your prefrontal cortex is shutting down due to overwhelm. You can't force focus.",
            action: "Externalize your thoughts.",
            tool: "Smart Planner & Notes",
            targetSection: Section.PLANNING
        };
        return {
            title: "Emotional Burnout",
            desc: "The fear center (Amygdala) is hijacking your brain. You need reassurance before you can study.",
            action: "Reframe the narrative.",
            tool: "Mindset Coach",
            targetSection: Section.MINDSET
        };
    };

    const prescription = getPrescription(dominant);
    const severity = Math.min(Math.round((max / 15) * 10), 10); // Rough scaling

    return (
        <div className="space-y-4 min-h-[350px] flex flex-col justify-center">
            {!isFinished ? (
                <div className="max-w-xl mx-auto w-full">
                    <div className="text-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-650 to-rose-500 mb-2">
                            Stress Diagnostic
                        </h2>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                            <div className="bg-pink-500 h-1 rounded-full transition-all duration-500" style={{ width: `${(step / diagnosticQuestions.length) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-slide-up">
                        <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white mb-4 text-center leading-snug">
                            {diagnosticQuestions[step].text}
                        </h3>
                        <div className="space-y-2">
                            {diagnosticQuestions[step].options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleAnswer(opt.category, opt.score)}
                                    className="w-full p-2.5 text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-300 dark:hover:border-pink-700 transition-all duration-200 flex justify-between items-center group text-xs md:text-sm"
                                >
                                    <span className="font-medium text-slate-750 dark:text-slate-200 group-hover:text-pink-900 dark:group-hover:text-pink-100">{opt.text}</span>
                                    <span className="text-slate-350 group-hover:text-pink-405">➜</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto animate-fade-in w-full">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

                        <div className="inline-block p-2.5 rounded-full bg-slate-50 dark:bg-slate-850 mb-3 text-3xl shadow-sm border border-slate-100 dark:border-slate-750">
                            {dominant === 'Physical' ? '🩹' : dominant === 'Emotional' ? '❤️‍🩹' : '🧠'}
                        </div>

                        <h3 className="text-lg md:text-xl font-extrabold text-slate-800 dark:text-white mb-1">
                            {prescription.title}
                        </h3>

                        <div className="flex justify-center items-center gap-1.5 mb-3.5">
                            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[8px]">Stress Intensity</span>
                            <div className="flex gap-0.5">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className={`w-1 h-3 rounded-sm ${i < severity ? 'bg-pink-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-350 mb-4.5 leading-relaxed max-w-lg mx-auto font-medium">
                            {prescription.desc}
                        </p>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100/50 dark:border-indigo-800/50 mb-4.5">
                            <p className="text-[9px] font-bold text-indigo-900 dark:text-indigo-200 uppercase mb-0.5">Recommended Action</p>
                            <p className="text-sm md:text-base font-bold text-indigo-700 dark:text-indigo-300">{prescription.action}</p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-2.5">
                            <button
                                onClick={() => onNavigateToStrategy(prescription.targetSection)}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 h-[40px] rounded-lg font-bold hover:scale-[1.01] transition-all shadow-sm text-xs flex items-center justify-center"
                            >
                                Go to {prescription.tool}
                            </button>
                            <button
                                onClick={reset}
                                className="px-5 h-[36px] rounded-lg font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center justify-center"
                            >
                                Check Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};