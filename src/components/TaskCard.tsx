import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Flag,
} from 'lucide-react';
import { Column, Task } from '../types/kanban';
import { IssueTypeIcon } from './IssueTypeIcon';
import { LabelBadge } from './LabelBadge';
import { PriorityBadge } from './PriorityBadge';
import { UserAvatar } from './UserAvatar';

interface TaskCardProps {
  task: Task;
  columns: Column[];
  index: number;
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onToggleBlock?: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOverCard: (e: React.DragEvent, index: number) => void;
  isDropTargetBefore?: boolean;
  isDropTargetAfter?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  columns,
  index,
  onSelectTask,
  onMoveTask,
  onToggleBlock,
  onDragStart,
  onDragEnd,
  onDragOverCard,
  isDropTargetBefore,
  isDropTargetAfter,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const currentColumnIndex = columns.findIndex((c) => c.id === task.status);
  const prevColumn = currentColumnIndex > 0 ? columns[currentColumnIndex - 1] : null;
  const nextColumn =
    currentColumnIndex < columns.length - 1 ? columns[currentColumnIndex + 1] : null;

  // Due date status
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) &&
    task.status !== 'done';

  const isDueSoon =
    task.dueDate &&
    !isOverdue &&
    new Date(task.dueDate).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000 &&
    task.status !== 'done';

  return (
    <div className="relative group/card">
      {/* Visual Drop Indicator Before */}
      {isDropTargetBefore && (
        <div className="h-1 bg-blue-600 rounded-full my-1 transition-all duration-150 animate-pulse" />
      )}

      <div
        draggable
        onDragStart={(e) => onDragStart(e, task)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onDragOverCard(e, index)}
        onClick={() => onSelectTask(task)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowMoveMenu(false);
        }}
        className={`rounded-lg border p-3.5 shadow-xs hover:shadow-sm cursor-grab active:cursor-grabbing transition-all select-none space-y-2.5 relative ${
          task.isBlocked
            ? 'bg-rose-50/20 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/80 ring-1 ring-rose-400/40'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {/* Blocker Alert Banner */}
        {task.isBlocked && (
          <div className="flex items-start gap-1.5 p-1.5 rounded bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 text-[11px] leading-tight">
            <Flag className="w-3 h-3 shrink-0 fill-rose-600 dark:fill-rose-400 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-rose-800 dark:text-rose-200 block">
                  Blocked / Stuck
                </span>
                {task.taggedUsers && task.taggedUsers.length > 0 && (
                  <span className="text-[9px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/80 px-1 py-0.2 rounded font-mono">
                    Tagged: @{task.taggedUsers[0].name.split(' ')[0]}
                  </span>
                )}
              </div>
              {task.blockedReason && (
                <p className="line-clamp-2 text-[10px] text-rose-600 dark:text-rose-300 mt-0.5 font-normal">
                  {task.blockedReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Top Header: Issue Type, Key, and Quick Move Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <IssueTypeIcon type={task.issueType} size="sm" />
            <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 tracking-tight">
              {task.key}
            </span>
          </div>

          {/* Quick Hover Controls */}
          <div
            className={`flex items-center gap-1 transition-opacity ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Flag Button */}
            {onToggleBlock && (
              <button
                type="button"
                onClick={() => onToggleBlock(task.id)}
                title={task.isBlocked ? 'Resolve Blocker' : 'Flag as Stuck / Blocked'}
                className={`p-1 rounded transition-colors ${
                  task.isBlocked
                    ? 'text-rose-600 bg-rose-100 dark:bg-rose-950'
                    : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className="w-3 h-3" />
              </button>
            )}

            {prevColumn && (
              <button
                type="button"
                onClick={() => onMoveTask(task.id, prevColumn.id)}
                title={`Move back to ${prevColumn.title}`}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}
            {nextColumn && (
              <button
                type="button"
                onClick={() => onMoveTask(task.id, nextColumn.id)}
                title={`Advance to ${nextColumn.title}`}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoveMenu(!showMoveMenu)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                title="Move to column..."
              >
                <MoreHorizontal className="w-3 h-3" />
              </button>

              {showMoveMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 rounded-md shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 text-xs">
                  <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    Move status to
                  </div>
                  {columns.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      disabled={col.id === task.status}
                      onClick={() => {
                        onMoveTask(task.id, col.id);
                        setShowMoveMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 transition-colors flex items-center justify-between ${
                        col.id === task.status
                          ? 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-default'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-300'
                      }`}
                    >
                      <span className="truncate">{col.title}</span>
                      {col.id === task.status && (
                        <span className="text-[10px] text-slate-400">Current</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Title */}
        <h4 className="text-[13px] font-medium text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {task.title}
        </h4>

        {/* Labels Strip */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            {task.labels.map((slug) => (
              <LabelBadge key={slug} labelSlug={slug} />
            ))}
          </div>
        )}

        {/* Middle Metadata: Subtasks & Due Date */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          {totalSubtasks > 0 && (
            <div
              className={`flex items-center gap-1 font-mono text-[11px] ${
                completedSubtasks === totalSubtasks
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : ''
              }`}
              title={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            >
              <CheckSquare className="w-3 h-3 stroke-[2.2]" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          )}

          {task.comments && task.comments.length > 0 && (
            <div
              className="flex items-center gap-1 font-mono text-[11px] text-slate-400"
              title={`${task.comments.length} comments`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}

          {task.dueDate && (
            <div
              className={`flex items-center gap-1 text-[11px] font-medium ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : isDueSoon
                  ? 'text-amber-600 dark:text-amber-400 font-medium'
                  : 'text-slate-400'
              }`}
              title={`Due: ${task.dueDate}${isOverdue ? ' (Overdue!)' : ''}`}
            >
              <Calendar className="w-3 h-3 stroke-[2.2]" />
              <span>{task.dueDate.slice(5)}</span>
            </div>
          )}
        </div>

        {/* Bottom Row: Priority, Story Points & Assignee + Tagged Users */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={task.priority} />
            {task.storyPoints > 0 && (
              <span
                className="font-mono tabular-nums text-[11px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded font-semibold"
                title={`${task.storyPoints} Story Points`}
              >
                {task.storyPoints}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Tagged teammates indicator & avatars */}
            {task.taggedUsers && task.taggedUsers.length > 0 && (
              <div
                className="flex items-center -space-x-1.5 pr-0.5"
                title={`Tagged teammates: ${task.taggedUsers.map((u) => u.name).join(', ')}`}
              >
                {task.taggedUsers.slice(0, 2).map((user) => (
                  <div key={user.id} className="relative ring-1.5 ring-white dark:ring-slate-900 rounded-full">
                    <UserAvatar user={user} size="xs" />
                  </div>
                ))}
                {task.taggedUsers.length > 2 && (
                  <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[9px] font-bold flex items-center justify-center ring-1.5 ring-white dark:ring-slate-900">
                    +{task.taggedUsers.length - 2}
                  </span>
                )}
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold pl-1 select-none">
                  @
                </span>
              </div>
            )}
            <UserAvatar user={task.assignee} size="sm" />
          </div>
        </div>
      </div>

      {/* Visual Drop Indicator After */}
      {isDropTargetAfter && (
        <div className="h-1 bg-blue-600 rounded-full my-1 transition-all duration-150 animate-pulse" />
      )}
    </div>
  );
};
