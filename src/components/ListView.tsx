import React from 'react';
import { Flag } from 'lucide-react';
import { Column, Task } from '../types/kanban';
import { IssueTypeIcon } from './IssueTypeIcon';
import { LabelBadge } from './LabelBadge';
import { PriorityBadge } from './PriorityBadge';
import { UserAvatar } from './UserAvatar';

interface ListViewProps {
  tasks: Task[];
  columns: Column[];
  onSelectTask: (task: Task) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  columns,
  onSelectTask,
}) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 w-12 text-center">Type</th>
                <th className="py-2.5 px-4 w-28">Key</th>
                <th className="py-2.5 px-4">Summary</th>
                <th className="py-2.5 px-4 w-32">Status</th>
                <th className="py-2.5 px-4 w-28">Priority</th>
                <th className="py-2.5 px-4 w-40">Labels</th>
                <th className="py-2.5 px-4 w-36">Assignee</th>
                <th className="py-2.5 px-4 w-16 text-right">Points</th>
                <th className="py-2.5 px-4 w-28">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tasks.map((task) => {
                const column = columns.find((c) => c.id === task.status);
                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-center">
                      <IssueTypeIcon type={task.issueType} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      <div className="flex items-center gap-1.5">
                        <span>{task.key}</span>
                        {task.isBlocked && (
                          <span title="Blocked / Stuck">
                            <Flag className="w-3 h-3 text-rose-600 fill-rose-600 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-md truncate">
                      {task.title}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 text-[11px]">
                        {column?.title || task.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <PriorityBadge priority={task.priority} showLabel />
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {task.labels.slice(0, 2).map((lbl) => (
                          <LabelBadge key={lbl} labelSlug={lbl} />
                        ))}
                        {task.labels.length > 2 && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            +{task.labels.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={task.assignee} size="xs" />
                        <span className="truncate text-slate-700 dark:text-slate-300">
                          {task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}
                        </span>
                        {task.taggedUsers && task.taggedUsers.length > 0 && (
                          <div
                            className="flex items-center -space-x-1 pl-1"
                            title={`Tagged: ${task.taggedUsers.map((u) => u.name).join(', ')}`}
                          >
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mr-0.5">@</span>
                            {task.taggedUsers.slice(0, 2).map((u) => (
                              <UserAvatar key={u.id} user={u} size="xs" />
                            ))}
                            {task.taggedUsers.length > 2 && (
                              <span className="text-[9px] text-slate-400 font-bold pl-0.5">
                                +{task.taggedUsers.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-600 dark:text-slate-400">
                      {task.storyPoints}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {task.dueDate || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No matching issues found for the active filter.
          </div>
        )}
      </div>
    </div>
  );
};
