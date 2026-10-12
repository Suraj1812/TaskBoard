import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  onClose,
}) => {
  const shortcuts = [
    { key: 'c', description: 'Create a new issue anywhere' },
    { key: '/', description: 'Quickly focus search input' },
    { key: '1', description: 'Switch to Kanban Board View' },
    { key: '2', description: 'Switch to List / Table View' },
    { key: '3', description: 'Switch to Sprint Metrics View' },
    { key: 'Esc', description: 'Close open modal or cancel input' },
    { key: '?', description: 'Show keyboard shortcuts guide' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              Keyboard Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Boost your agile workflow velocity with Jira-style single-key hotkeys:
          </p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {shortcuts.map((sc) => (
              <div
                key={sc.key}
                className="flex items-center justify-between px-3.5 py-2.5 text-xs bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {sc.description}
                </span>
                <kbd className="px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-2xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 dark:bg-blue-600 text-white rounded hover:bg-slate-800 dark:hover:bg-blue-700 cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
