import React from 'react';
import { INITIAL_LABELS } from '../data/initialData';
import { TaskLabel } from '../types/kanban';

interface LabelBadgeProps {
  labelSlug: string;
  onClick?: () => void;
  isActive?: boolean;
  isFilterButton?: boolean;
  onRemove?: () => void;
}

export const LabelBadge: React.FC<LabelBadgeProps> = ({
  labelSlug,
  onClick,
  isActive = false,
  isFilterButton = false,
  onRemove,
}) => {
  const labelDef: TaskLabel = INITIAL_LABELS.find(
    (l) => l.slug === labelSlug
  ) || {
    id: labelSlug,
    name: labelSlug.charAt(0).toUpperCase() + labelSlug.slice(1),
    slug: labelSlug,
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
  };

  if (isFilterButton) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`h-8.5 px-3 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs ${
          isActive
            ? `${labelDef.bgColor} ${labelDef.textColor} ${labelDef.borderColor} dark:bg-slate-800 dark:text-white dark:border-blue-500 ring-1 ring-blue-500 font-semibold`
            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${labelDef.textColor.replace(
            'text-',
            'bg-'
          )}`}
        />
        <span>{labelDef.name}</span>
      </button>
    );
  }

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-200 ${labelDef.bgColor} ${labelDef.textColor} ${labelDef.borderColor} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
    >
      <span>{labelDef.name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:text-rose-600 transition-colors"
          title="Remove label"
        >
          ×
        </button>
      )}
    </span>
  );
};
