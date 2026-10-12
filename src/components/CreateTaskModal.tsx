import React, { useState } from 'react';
import { X, Check, Flag, Users } from 'lucide-react';
import { INITIAL_LABELS, INITIAL_USERS } from '../data/initialData';
import { Column, Task, TaskIssueType, TaskPriority, User } from '../types/kanban';
import { IssueTypeIcon, ISSUE_TYPE_CONFIG } from './IssueTypeIcon';
import { PRIORITY_CONFIG } from './PriorityBadge';
import { UserAvatar } from './UserAvatar';

interface CreateTaskModalProps {
  columns: Column[];
  onClose: () => void;
  onCreateTask: (newTask: Partial<Task>) => void;
  currentUser: User;
  defaultColumnId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  columns,
  onClose,
  onCreateTask,
  currentUser,
  defaultColumnId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState<TaskIssueType>('story');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<string>(
    defaultColumnId || (columns[0] ? columns[0].id : 'todo')
  );
  const [assigneeId, setAssigneeId] = useState<string>(currentUser.id);
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(['frontend']);
  const [dueDate, setDueDate] = useState<string>('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<User[]>([]);

  const toggleLabel = (slug: string) => {
    setSelectedLabels((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const toggleTaggedUser = (user: User) => {
    setTaggedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignee = INITIAL_USERS.find((u) => u.id === assigneeId) || null;

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      issueType,
      priority,
      status,
      assignee,
      reporter: currentUser,
      storyPoints,
      labels: selectedLabels,
      dueDate: dueDate || undefined,
      isBlocked,
      blockedReason: isBlocked ? (blockedReason.trim() || 'Work paused due to technical blocker') : undefined,
      taggedUsers,
      subtasks: [],
      comments: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Create Issue
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Issue Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Issue Type
              </label>
              <div className="relative">
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as TaskIssueType)}
                  className="w-full appearance-none pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                >
                  {Object.keys(ISSUE_TYPE_CONFIG).map((typeKey) => (
                    <option key={typeKey} value={typeKey}>
                      {ISSUE_TYPE_CONFIG[typeKey as TaskIssueType].label}
                    </option>
                  ))}
                </select>
                <div className="absolute left-2.5 top-2.5 pointer-events-none">
                  <IssueTypeIcon type={issueType} size="sm" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Status Column
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Summary / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Implement OAuth2 refresh token rotation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe acceptance criteria or technical context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden resize-y leading-relaxed placeholder:text-slate-400"
            />
          </div>

          {/* Priority & Assignee & Story Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((pKey) => (
                  <option key={pKey} value={pKey}>
                    {PRIORITY_CONFIG[pKey].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="">Unassigned</option>
                {INITIAL_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Story Points
              </label>
              <input
                type="number"
                min="0"
                max="40"
                value={storyPoints}
                onChange={(e) => setStoryPoints(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md text-xs font-mono font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Due Date & Blocked Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Impediment Status
              </label>
              <button
                type="button"
                onClick={() => setIsBlocked(!isBlocked)}
                className={`w-full py-1.5 px-3 rounded-md text-xs font-medium border flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isBlocked
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isBlocked ? 'fill-rose-600' : ''}`} />
                <span>{isBlocked ? 'Marked as Stuck / Blocked' : 'Not Blocked (Normal)'}</span>
              </button>
            </div>
          </div>

          {isBlocked && (
            <div>
              <label className="text-xs font-bold text-rose-700 dark:text-rose-400 block mb-1">
                Reason for Blocker
              </label>
              <input
                type="text"
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="e.g. Waiting on API credentials, external vendor dependency..."
                className="w-full px-3 py-1.5 border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 rounded-md text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Labels */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Labels
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INITIAL_LABELS.map((lbl) => {
                const isSelected = selectedLabels.includes(lbl.slug);
                return (
                  <button
                    key={lbl.slug}
                    type="button"
                    onClick={() => toggleLabel(lbl.slug)}
                    className={`px-2.5 py-1 text-xs rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? `${lbl.bgColor} ${lbl.textColor} ${lbl.borderColor} font-semibold ring-1 ring-blue-500`
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${lbl.textColor.replace('text-', 'bg-')}`} />
                    <span>{lbl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag Teammates / Collaborators */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>Tag Teammates / Collaborators (@)</span>
              </label>
              {taggedUsers.length > 0 && (
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold font-mono">
                  {taggedUsers.length} tagged
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Tag other team members who should collaborate, review, or help on this ticket:
            </p>
            <div className="flex flex-wrap gap-2">
              {INITIAL_USERS.map((user) => {
                const isTagged = taggedUsers.some((u) => u.id === user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleTaggedUser(user)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      isTagged
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs ring-1 ring-blue-400'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <UserAvatar user={user} size="xs" />
                    <div className="flex flex-col text-left">
                      <span className="leading-tight">{user.name}</span>
                      <span className="text-[10px] text-slate-400 leading-tight">{user.role.split(' ')[0]}</span>
                    </div>
                    <span className={`text-[11px] ml-1 font-bold ${isTagged ? 'text-blue-600' : 'text-slate-400'}`}>
                      {isTagged ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-xs disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Create Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
