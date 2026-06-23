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

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/schedule', label: 'Schedule', icon: '📅' },
  { path: '/planner', label: 'AI Planner', icon: '🚀' },
  { path: '/notes', label: 'Note Archive', icon: '📝' },
  { path: '/toolbox', label: 'Toolbox', icon: '🛡️' },
  { path: '/zen-tutor/overview', label: 'Zen AI Tutor', icon: '🎓', isParent: true },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const tutorChildItems = [
  { path: '/zen-tutor/overview', label: 'Overview' },
  { path: '/zen-tutor/learning-profile', label: 'Learning Profile' },
  { path: '/zen-tutor/focus-insights', label: 'Focus Insights' },
  { path: '/zen-tutor/academic-diagnosis', label: 'Academic Diagnosis' },
  { path: '/zen-tutor/burnout-stress', label: 'Burnout & Stress' },
  { path: '/zen-tutor/progress-trends', label: 'Progress Trends' },
  { path: '/zen-tutor/recommendations', label: 'Recommendations' },
  { path: '/zen-tutor/chat-coach', label: 'AI Chat Coach' },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onNavigatePath,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  theme,
  toggleTheme,
  onLogout,
  isCollapsed,
  onToggleCollapse
}) => {
  const [isTutorMenuExpanded, setIsTutorMenuExpanded] = useState<boolean>(() => {
    return localStorage.getItem('zen_tutor_menu_expanded') !== 'false';
  });

  const handleToggleTutorMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTutorMenuExpanded(prev => {
      const next = !prev;
      localStorage.setItem('zen_tutor_menu_expanded', String(next));
      return next;
    });
  };

  const isPathActive = (itemPath: string) => {
    if (itemPath.startsWith('/zen-tutor')) {
      return currentPath.startsWith('/zen-tutor');
    }
    return currentPath === itemPath;
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <nav className={`
        fixed md:static inset-y-0 left-0 z-50 glass border-r border-white/40 dark:border-slate-800/85 transform transition-all duration-300 ease-in-out md:transform-none flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0 w-[220px]' : '-translate-x-full'}
        ${isCollapsed ? 'md:w-[72px]' : 'md:w-[220px]'}
      `}>
        {/* Sidebar Header */}
        <div className={`p-3 pb-2.5 flex ${isCollapsed ? 'flex-col items-center gap-3' : 'items-center justify-between'} border-b border-slate-100 dark:border-slate-800/80 mb-1.5`}>
          {!isCollapsed ? (
            <>
              <h1 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center gap-1.5 tracking-tighter cursor-default transition-all duration-350">
                <span className="text-xl animate-float">🧘</span>
                <span className="leading-none">ZenStudy</span>
              </h1>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={onToggleCollapse}
                  className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-bold text-xs"
                  title="Collapse Sidebar"
                >
                  ⟨
                </button>
                <button className="md:hidden bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg hover:bg-red-650 hover:text-white transition-all text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                  ✕
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="text-xl animate-float cursor-default">🧘</span>
              <button
                onClick={onToggleCollapse}
                className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-bold text-xs"
                title="Expand Sidebar"
              >
                ⟩
              </button>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-1.5 py-2 space-y-1' : 'px-2 py-2 space-y-1'} scrollbar-hide`}>
          {navItems.map((item) => {
            const isActive = isPathActive(item.path);
            return (
              <div key={item.path} className="space-y-1">
                <button
                  onClick={() => {
                    onNavigatePath(item.path);
                    setIsMobileMenuOpen(false);
                    if (item.isParent) {
                      setIsTutorMenuExpanded(true);
                    }
                  }}
                  className={`w-full flex items-center justify-between ${isCollapsed ? 'justify-center py-2 px-0' : 'px-3 py-2'} rounded-lg text-left transition-all duration-200 group relative
                      ${isActive
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'}
                    `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`text-base transition-all duration-200 group-hover:scale-105 ${isActive ? 'scale-105 drop-shadow-sm' : 'opacity-80'}`}>
                      {item.icon}
                    </span>
                    
                    {!isCollapsed && (
                      <span className="text-[10px] font-bold uppercase tracking-wider leading-none transition-all duration-200">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && item.isParent && (
                    <button
                      onClick={handleToggleTutorMenu}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-slate-350 hover:text-white transition-all text-[8px] font-bold self-center"
                      title={isTutorMenuExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                    >
                      {isTutorMenuExpanded ? '▼' : '▶'}
                    </button>
                  )}

                  {isActive && !isCollapsed && !item.isParent && (
                    <div className="absolute right-3 w-1 h-1 bg-white rounded-full animate-pulse shadow-sm"></div>
                  )}

                  {/* Tooltip on Hover when Collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-slate-950 dark:bg-slate-900 text-white text-[9px] uppercase tracking-wider font-black rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-slate-800/80">
                      {item.label}
                    </div>
                  )}
                </button>

                {/* Indented Submenu for Tutor */}
                {item.isParent && isTutorMenuExpanded && !isCollapsed && (
                  <div className="pl-4 mt-1 space-y-0.5 animate-slide-up border-l border-slate-200 dark:border-slate-800/80 ml-5.5">
                    {tutorChildItems.map((child) => {
                      const isChildActive = currentPath === child.path;
                      return (
                        <button
                          key={child.path}
                          onClick={() => {
                            onNavigatePath(child.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-all duration-150 text-[9px] uppercase tracking-wider font-bold
                            ${isChildActive
                              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                              : 'text-slate-450 dark:text-slate-550 hover:text-slate-850 dark:hover:text-slate-200'}
                          `}
                        >
                          <span>{child.label}</span>
                          {isChildActive && <span className="text-[7px]">➔</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className={`p-2.5 ${isCollapsed ? 'space-y-1.5' : 'space-y-2'} border-t border-slate-100 dark:border-slate-800/80`}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-center ${isCollapsed ? 'py-2 px-0 text-base' : 'gap-2 py-2 px-3 text-[9px]'} bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold uppercase tracking-wider text-slate-650 dark:text-slate-300 transition-all`}
            title={theme === 'light' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
          >
            {isCollapsed ? (theme === 'light' ? '🌙' : '☀️') : (theme === 'light' ? '🌙 Night Mode' : '☀️ Day Mode')}
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className={`md:hidden w-full flex items-center justify-center ${isCollapsed ? 'py-2 text-base' : 'gap-2 py-2 text-[9px]'} bg-red-500 text-white rounded-lg font-black uppercase tracking-wider transition-all`}
            >
              🚪 {!isCollapsed && 'Log Out'}
            </button>
          )}

          {!isCollapsed && (
            <div className="bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-lg p-2.5 text-center border border-indigo-500/10 md:block hidden">
              <p className="text-[7px] text-indigo-550 dark:text-indigo-400 font-black mb-0.5 uppercase tracking-wider">Zen Affirmation</p>
              <p className="text-[10px] text-indigo-700/85 dark:text-indigo-200/85 font-medium italic">"The secret of getting ahead is getting started."</p>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};