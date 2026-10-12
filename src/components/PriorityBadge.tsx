import React from 'react';
import {
  ChevronsUp,
  ChevronUp,
  Equal,
  ChevronDown,
  ChevronsDown,
} from 'lucide-react';
import { TaskPriority } from '../types/kanban';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    bgColor: string;
    description: string;
  }
> = {
  highest: {
    label: 'Highest',
    icon: ChevronsUp,
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/50',
    description: 'Critical blocker requiring immediate sprint attention',
  },
  high: {
    label: 'High',
    icon: ChevronUp,
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    description: 'High impact item for current milestone',
  },
  medium: {
    label: 'Medium',
    icon: Equal,
    iconColor: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-50/50 dark:bg-amber-950/40',
    description: 'Standard sprint delivery requirement',
  },
  low: {
    label: 'Low',
    icon: ChevronDown,
    iconColor: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-50 dark:bg-sky-950/50',
    description: 'Low urgency minor refinement',
  },
  lowest: {
    label: 'Lowest',
    icon: ChevronsDown,
    iconColor: 'text-slate-500 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    description: 'Trivial polish or cosmetic change',
  },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showLabel = false,
  size = 'sm',
}) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = config.icon;
  const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium select-none ${
        showLabel
          ? `text-xs px-2 py-0.5 rounded-md ${config.bgColor} ${config.iconColor}`
          : config.iconColor
      }`}
      title={`Priority: ${config.label} - ${config.description}`}
      aria-label={`Priority ${config.label}`}
    >
      <Icon className={`${iconSizeClass} shrink-0 stroke-[2.2]`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
