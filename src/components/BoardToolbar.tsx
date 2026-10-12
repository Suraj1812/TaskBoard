import React from 'react';
import {
  Search,
  X,
  RotateCcw,
  Plus,
  Download,
  Command,
  Flag,
} from 'lucide-react';
import { INITIAL_LABELS, INITIAL_USERS } from '../data/initialData';
import { TaskPriority, User } from '../types/kanban';
import { LabelBadge } from './LabelBadge';
import { PriorityDropdown } from './PriorityDropdown';
import { UserAvatar } from './UserAvatar';

interface BoardToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedAssigneeId: string | null;
  onAssigneeSelect: (userId: string | null) => void;
  selectedPriority: TaskPriority | null;
  onPrioritySelect: (priority: TaskPriority | null) => void;
  selectedLabels: string[];
  onToggleLabel: (slug: string) => void;
  filterBlockedOnly: boolean;
  onToggleBlockedOnly: () => void;
  blockedCount: number;
  onResetFilters: () => void;
  onResetDemoData: () => void;
  onAddColumn: () => void;
  onOpenShortcuts: () => void;
  onOpenExportImport: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  totalTasksCount: number;
  filteredTasksCount: number;
  currentUser: User;
}

export const BoardToolbar: React.FC<BoardToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedAssigneeId,
  onAssigneeSelect,
  selectedPriority,
  onPrioritySelect,
  selectedLabels,
  onToggleLabel,
  filterBlockedOnly,
  onToggleBlockedOnly,
  blockedCount,
  onResetFilters,
  onResetDemoData,
  onAddColumn,
  onOpenShortcuts,
  onOpenExportImport,
  searchInputRef,
  totalTasksCount,
  filteredTasksCount,
  currentUser,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedAssigneeId) ||
    Boolean(selectedPriority) ||
    filterBlockedOnly ||
    selectedLabels.length > 0;

  return (
    <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md space-y-2.5 transition-colors">
      {/* Top Row: Breadcrumbs and Secondary Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Projects</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-600 dark:text-slate-300">TaskBoard Core</span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">Kanban Board</span>
          <span className="ml-1 font-mono text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 font-semibold">
            {filteredTasksCount}{' '}
            {hasActiveFilters ? `of ${totalTasksCount} issues` : 'issues'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAddColumn}
            className="h-8 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Add Column</span>
          </button>

          <button
            type="button"
            onClick={onOpenExportImport}
            className="h-8 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Export or Import board data (JSON / CSV)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Export / Import</span>
          </button>

          <button
            type="button"
            onClick={onOpenShortcuts}
            className="h-8 w-8 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Keyboard Shortcuts (?)"
          >
            <Command className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onResetDemoData}
            title="Reset to default Jira sample data"
            className="h-8 px-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-transparent transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Filter Strip: Unified height h-8.5 across all inputs and buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input with inline kbd shortcut badge */}
        <div className="relative min-w-[220px] max-w-xs flex-1">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, keys, descriptions..."
            className="h-8.5 w-full pl-8 pr-12 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 focus:outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-slate-100 transition-all shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline font-mono text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Custom Priority Dropdown */}
        <PriorityDropdown
          selectedPriority={selectedPriority}
          onSelectPriority={onPrioritySelect}
        />

        {/* Blocked / Stuck Quick Filter */}
        <button
          type="button"
          onClick={onToggleBlockedOnly}
          className={`h-8.5 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
            filterBlockedOnly
              ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 ring-1 ring-rose-500 font-semibold'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Filter only blocked/stuck issues"
        >
          <Flag className={`w-3.5 h-3.5 ${filterBlockedOnly ? 'fill-rose-600 text-rose-600' : 'text-rose-500'}`} />
          <span>Blocked Only</span>
          {blockedCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${filterBlockedOnly ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>
              {blockedCount}
            </span>
          )}
        </button>

        {/* Quick "My Issues" button */}
        <button
          type="button"
          onClick={() =>
            onAssigneeSelect(
              selectedAssigneeId === currentUser.id ? null : currentUser.id
            )
          }
          className={`h-8.5 px-3 text-xs rounded-lg border transition-all cursor-pointer shadow-2xs whitespace-nowrap flex items-center gap-1.5 ${
            selectedAssigneeId === currentUser.id
              ? 'bg-blue-50/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-semibold ring-1 ring-blue-500'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          My Issues
        </button>

        {/* Assignee Avatar Strip */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mr-0.5 whitespace-nowrap">
            Assignee:
          </span>
          {INITIAL_USERS.map((user) => (
            <UserAvatar
              key={user.id}
              user={user}
              size="sm"
              isFilterButton
              isSelected={selectedAssigneeId === user.id}
              onClick={() =>
                onAssigneeSelect(
                  selectedAssigneeId === user.id ? null : user.id
                )
              }
            />
          ))}
        </div>

        {/* Label Filters */}
        <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          {INITIAL_LABELS.slice(0, 4).map((label) => (
            <LabelBadge
              key={label.slug}
              labelSlug={label.slug}
              isFilterButton
              isActive={selectedLabels.includes(label.slug)}
              onClick={() => onToggleLabel(label.slug)}
            />
          ))}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="h-8.5 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
