import React, { useState } from 'react';

interface NavigationProps {
  currentPath: string;
  onNavigatePath: (path: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

import { Home, Calendar, Rocket, FileText, Shield, GraduationCap, User } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
  { path: '/schedule', label: 'Schedule', icon: <Calendar size={20} /> },
  { path: '/planner', label: 'AI Planner', icon: <Rocket size={20} /> },
  { path: '/notes', label: 'Note Archive', icon: <FileText size={20} /> },
  { path: '/toolbox', label: 'Toolbox', icon: <Shield size={20} /> },
  { path: '/zen-tutor/overview', label: 'ILMORA Mentor', icon: <GraduationCap size={20} />, isParent: true },
  { path: '/profile', label: 'Profile', icon: <User size={20} /> },
];

const tutorChildItems = [
  { path: '/zen-tutor/overview', label: 'Overview' },
  { path: '/zen-tutor/learning-profile', label: 'Learning Profile' },
  { path: '/zen-tutor/focus-insights', label: 'Focus Insights' },
  { path: '/zen-tutor/academic-diagnosis', label: 'Academic Diagnosis' },
  { path: '/zen-tutor/burnout-stress', label: 'Burnout & Stress' },
  { path: '/zen-tutor/progress-trends', label: 'Progress Trends' },
  { path: '/zen-tutor/recommendations', label: 'Recommendations' },
  { path: '/zen-tutor/chat-coach', label: 'Mentor Chat' },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onNavigatePath,
}) => {
  const isPathActive = (itemPath: string) => {
    if (itemPath.startsWith('/zen-tutor')) {
      return currentPath.startsWith('/zen-tutor');
    }
    return currentPath === itemPath;
  };

  return (
    <nav className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 md:gap-4 px-3 md:px-6 py-2 bg-surface-container/70 backdrop-blur-2xl rounded-full border border-outline-variant/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all max-w-[95vw] overflow-x-auto scrollbar-hide">
      {navItems.map((item) => {
        const isActive = isPathActive(item.path);
        return (
          <button
            key={item.path}
            onClick={() => onNavigatePath(item.path)}
            className={`flex flex-col items-center justify-center rounded-full p-2.5 md:p-3 transition-transform duration-200 active:scale-95 group relative shrink-0 ${
              isActive
                ? 'bg-primary-container text-on-primary-container drop-shadow-glow-primary scale-105'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`}
            title={item.label}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {isActive && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-sm"></span>
            )}
            
            {/* Tooltip on Hover */}
            <div className="absolute -top-10 px-2 py-1 bg-surface-container-highest text-on-surface text-[10px] uppercase tracking-wider font-bold rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-outline-variant/10">
              {item.label}
            </div>
          </button>
        );
      })}
    </nav>
  );
};