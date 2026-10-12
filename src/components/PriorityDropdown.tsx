import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal, Check } from 'lucide-react';
import { TaskPriority } from '../types/kanban';
import { PRIORITY_CONFIG } from './PriorityBadge';

interface PriorityDropdownProps {
  selectedPriority: TaskPriority | null;
  onSelectPriority: (priority: TaskPriority | null) => void;
}

export const PriorityDropdown: React.FC<PriorityDropdownProps> = ({
  selectedPriority,
  onSelectPriority,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentConfig = selectedPriority ? PRIORITY_CONFIG[selectedPriority] : null;
  const ActiveIcon = currentConfig?.icon || SlidersHorizontal;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-8.5 px-3 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
          selectedPriority
            ? 'bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 ring-1 ring-blue-500 font-semibold'
            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <ActiveIcon
          className={`w-3.5 h-3.5 ${
            currentConfig ? currentConfig.iconColor : 'text-slate-400 dark:text-slate-500'
          }`}
        />
        <span>
          {currentConfig ? `Priority: ${currentConfig.label}` : 'All Priorities'}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-56 rounded-lg bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Filter by Priority
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectPriority(null);
              setIsOpen(false);
            }}
            className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors ${
              selectedPriority === null
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>All Priorities</span>
            </div>
            {selectedPriority === null && (
              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            )}
          </button>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((pKey) => {
            const cfg = PRIORITY_CONFIG[pKey];
            const Icon = cfg.icon;
            const isSelected = selectedPriority === pKey;

            return (
              <button
                key={pKey}
                type="button"
                onClick={() => {
                  onSelectPriority(pKey);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? `${cfg.bgColor} dark:bg-slate-800 font-semibold`
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                  <span className="text-slate-700 dark:text-slate-200">{cfg.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
