import React from 'react';
import {
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
  Flag,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Column, Task } from '../types/kanban';
import { PRIORITY_CONFIG } from './PriorityBadge';
import { UserAvatar } from './UserAvatar';
import { IssueTypeIcon } from './IssueTypeIcon';

interface SprintMetricsViewProps {
  tasks: Task[];
  columns: Column[];
  onSelectTask?: (task: Task) => void;
  onResolveBlocker?: (taskId: string) => void;
}

export const SprintMetricsView: React.FC<SprintMetricsViewProps> = ({
  tasks,
  columns,
  onSelectTask,
  onResolveBlocker,
}) => {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'in_review').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const blockedTasks = tasks.filter((t) => t.isBlocked);

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const donePoints = tasks
    .filter((t) => t.status === 'done')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const inFlightPoints = tasks
    .filter((t) => t.status === 'in_progress' || t.status === 'in_review')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const completionPercent =
    totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Check columns exceeding WIP limits
  const breachedColumns = columns.filter(
    (c) => c.limit && tasks.filter((t) => t.status === c.id).length > c.limit
  );

  const sprintHealth =
    blockedTasks.length > 0 || breachedColumns.length > 0
      ? {
          status: 'At Risk',
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
          message: `${blockedTasks.length} blocked issues · ${breachedColumns.length} WIP limits breached`,
        }
      : {
          status: 'On Track',
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
          message: 'Velocity matches target schedule without blockers',
        };

  // Breakdown by priority
  const priorityCounts = tasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Breakdown by assignee
  const assigneeStats = tasks.reduce((acc, t) => {
    const key = t.assignee?.id || 'unassigned';
    if (!acc[key]) {
      acc[key] = {
        user: t.assignee,
        count: 0,
        points: 0,
        donePoints: 0,
      };
    }
    acc[key].count += 1;
    acc[key].points += t.storyPoints || 0;
    if (t.status === 'done') {
      acc[key].donePoints += t.storyPoints || 0;
    }
    return acc;
  }, {} as Record<string, { user: Task['assignee']; count: number; points: number; donePoints: number }>);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 text-slate-900 dark:text-slate-100">
      {/* Sprint Hero Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Active Sprint · Current Cycle
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Oct 1 - Oct 24, 2026
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
              Engineering Velocity & Sprint Performance
            </h2>
          </div>

          {/* Health Badge */}
          <div
            className={`px-4 py-2.5 rounded-lg border flex items-center gap-3 ${sprintHealth.bg}`}
          >
            <ShieldAlert className={`w-5 h-5 shrink-0 ${sprintHealth.color}`} />
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider ${sprintHealth.color}`}>
                Sprint Health: {sprintHealth.status}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">
                {sprintHealth.message}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Metric KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completion Rate
            </span>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {completionPercent}%
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {donePoints} of {totalPoints} story points burned
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              In-Flight Progress
            </span>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {inFlightPoints} <span className="text-sm font-normal text-slate-500">pts</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {inProgressTasks + inReviewTasks} issues currently in development
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Flag className="w-3.5 h-3.5 text-rose-600" />
              Active Blockers
            </span>
            <div className={`text-3xl font-bold font-mono tabular-nums ${blockedTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {blockedTasks.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {blockedTasks.length === 0 ? 'Zero active impediments' : 'Tasks flagged as stuck'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              Total Sprint Issues
            </span>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalTasks}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {doneTasks} done · {todoTasks} remaining to-do
            </p>
          </div>
        </div>

        {/* Visual Progress Bar Strip */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Sprint Burndown Story Points Progress</span>
            <span className="font-mono tabular-nums">{donePoints} / {totalPoints} pts ({completionPercent}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0}%` }}
              title={`Done: ${donePoints} pts`}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${totalPoints > 0 ? (inFlightPoints / totalPoints) * 100 : 0}%` }}
              title={`In Flight: ${inFlightPoints} pts`}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Done ({donePoints} pts)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>In Development ({inFlightPoints} pts)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span>Remaining ({totalPoints - donePoints - inFlightPoints} pts)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Blocked Issues Section (if any blocked tasks exist) */}
      {blockedTasks.length > 0 && (
        <div className="bg-rose-50/50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600 fill-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Current Blockers & Impediments ({blockedTasks.length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-600 dark:text-rose-400">
              Needs Scrum Master / Tech Lead intervention
            </span>
          </div>

          <div className="space-y-2">
            {blockedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask?.(task)}
                className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-rose-200 dark:border-rose-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-rose-300 cursor-pointer transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IssueTypeIcon type={task.issueType} size="sm" />
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {task.key}
                  </span>
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block">
                      {task.blockedReason || 'Stuck on external dependency'}
                    </span>
                  </div>
                  <UserAvatar user={task.assignee} size="xs" />
                  {onResolveBlocker && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResolveBlocker(task.id);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Split: Column WIP Health & Team Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column WIP Adherence */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Kanban Column WIP Adherence
          </h4>
          <div className="space-y-2.5">
            {columns.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              const isBreached = col.limit && colTasks.length > col.limit;
              const percent = col.limit ? Math.min(100, Math.round((colTasks.length / col.limit) * 100)) : 50;

              return (
                <div
                  key={col.id}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {col.title}
                    </span>
                    <span className={`font-mono tabular-nums font-semibold ${isBreached ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>
                      {colTasks.length} {col.limit ? `/ ${col.limit} WIP` : 'tasks'}
                      {isBreached && ' (Over Limit!)'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isBreached ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Workload & Allocation */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Team Capacity & Story Points
          </h4>
          <div className="space-y-3">
            {Object.values(assigneeStats).map((item, idx) => {
              const memberPercent = item.points > 0 ? Math.round((item.donePoints / item.points) * 100) : 0;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar user={item.user} size="sm" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {item.user ? item.user.name : 'Unassigned'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.count} assigned issues
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                        {item.donePoints} / {item.points} pts
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {memberPercent}% done
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${memberPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
