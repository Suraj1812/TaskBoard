import React from 'react';
import { Plus, Moon, Sun } from 'lucide-react';
import { User, ViewMode } from '../types/kanban';
import { UserAvatar } from './UserAvatar';

interface BoardHeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenCreateModal: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: User;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  currentView,
  onViewChange,
  onOpenCreateModal,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Zone 1: Brand Wordmark - Only TaskBoard as requested */}
      <div className="flex items-center shrink-0">
        <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white select-none">
          TaskBoard
        </span>
      </div>

      {/* Zone 2: Navigation Links / Segmented View Switcher */}
      <nav className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-lg text-xs font-semibold shadow-2xs border border-slate-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => onViewChange('board')}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer select-none ${
            currentView === 'board'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Kanban Board
        </button>
        <button
          type="button"
          onClick={() => onViewChange('list')}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer select-none ${
            currentView === 'list'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          List View
        </button>
        <button
          type="button"
          onClick={() => onViewChange('analytics')}
          className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer select-none ${
            currentView === 'analytics'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Sprint Metrics
        </button>
      </nav>

      {/* Zone 3: Actions + Dark Mode Toggle + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Dark Mode Toggle with dark background in dark mode */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className={`h-8.5 w-8.5 rounded-lg flex items-center justify-center transition-all border shadow-2xs cursor-pointer ${
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 rotate-0 transition-transform" />
          )}
        </button>

        {/* Primary Create Button */}
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="h-8.5 px-3.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
          <span className="hidden sm:inline">Create Issue</span>
          <span className="sm:hidden">Create</span>
        </button>

        <div className="hidden sm:block pl-2 border-l border-slate-200 dark:border-slate-800">
          <UserAvatar user={currentUser} size="sm" />
        </div>
      </div>
    </header>
  );
};
