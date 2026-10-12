import React from 'react';
import { Bookmark, Bug, CheckSquare, Zap } from 'lucide-react';
import { TaskIssueType } from '../types/kanban';

interface IssueTypeIconProps {
  type: TaskIssueType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ISSUE_TYPE_CONFIG: Record<
  TaskIssueType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }
> = {
  story: {
    label: 'Story',
    icon: Bookmark,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  bug: {
    label: 'Bug',
    icon: Bug,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  task: {
    label: 'Task',
    icon: CheckSquare,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
  },
  epic: {
    label: 'Epic',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

export const IssueTypeIcon: React.FC<IssueTypeIconProps> = ({
  type,
  showLabel = false,
  size = 'sm',
}) => {
  const config = ISSUE_TYPE_CONFIG[type] || ISSUE_TYPE_CONFIG.task;
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none ${
        showLabel
          ? `text-xs px-1.5 py-0.5 rounded ${config.bgColor} ${config.color} font-medium`
          : config.color
      }`}
      title={`Issue Type: ${config.label}`}
    >
      <Icon className={`${iconSize} shrink-0 stroke-[2.2]`} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
