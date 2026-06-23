import React, { useState, useEffect } from 'react';

export const BreathingExercise: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [text, setText] = useState("Ready?");

  useEffect(() => {
    // Fix: Use 'any' type for interval to avoid NodeJS namespace issues in browser environment
    let interval: any;
    let cycle = 0;

    if (isActive) {
      setText("Breathe In...");
      interval = setInterval(() => {
        cycle = (cycle + 1) % 3;
        if (cycle === 0) setText("Breathe In...");
        if (cycle === 1) setText("Hold...");
        if (cycle === 2) setText("Breathe Out...");
      }, 4000); // 4-4-4 seconds simplified box breathing timing
    } else {
      setText("Ready?");
    }

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white flex flex-col items-center justify-center shadow-lg my-6">
      <h3 className="text-xl font-semibold mb-6">4-7-8 Breathing Tool</h3>
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {isActive && (
          <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-breathe blur-xl"></div>
        )}
        <div className={`
          w-32 h-32 rounded-full bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-50 flex items-center justify-center transition-all duration-[4000ms]
          ${isActive ? 'scale-125' : 'scale-100'}
        `}>
          <span className="text-lg font-bold text-center px-4 animate-pulse">{text}</span>
        </div>
      </div>

      <button
        onClick={() => setIsActive(!isActive)}
        className="mt-8 px-8 py-2 bg-white text-indigo-600 rounded-full font-semibold hover:bg-indigo-50 transition-colors shadow-md"
      >
        {isActive ? 'Stop' : 'Start'}
      </button>
    </div>
  );
};