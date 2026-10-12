import React, { useState } from 'react';
import {
  X,
  Trash2,
  Calendar,
  CheckSquare,
  Plus,
  Send,
  Flag,
  AlertTriangle,
  AtSign,
  Users,
} from 'lucide-react';
import { INITIAL_LABELS, INITIAL_USERS } from '../data/initialData';
import { Column, Task, TaskIssueType, TaskPriority, User } from '../types/kanban';
import { IssueTypeIcon, ISSUE_TYPE_CONFIG } from './IssueTypeIcon';
import { PRIORITY_CONFIG } from './PriorityBadge';
import { UserAvatar } from './UserAvatar';

interface TaskDetailModalProps {
  task: Task;
  columns: Column[];
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onDeleteTask: (taskId: string) => void;
  currentUser: User;
  showToast?: (msg: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  columns,
  onClose,
  onUpdateTask,
  onDeleteTask,
  currentUser,
  showToast,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditingBlocker, setIsEditingBlocker] = useState(false);
  const [blockerReasonInput, setBlockerReasonInput] = useState(task.blockedReason || '');

  // Sync edits
  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      onUpdateTask({ ...task, title: title.trim(), updatedAt: new Date().toISOString().slice(0, 10) });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      onUpdateTask({ ...task, description, updatedAt: new Date().toISOString().slice(0, 10) });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    onUpdateTask({ ...task, status: newStatus, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    onUpdateTask({ ...task, priority: newPriority, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  const handleIssueTypeChange = (newType: TaskIssueType) => {
    onUpdateTask({ ...task, issueType: newType, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  const handleAssigneeChange = (userId: string) => {
    const selected = INITIAL_USERS.find((u) => u.id === userId) || null;
    onUpdateTask({ ...task, assignee: selected, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  const handleToggleLabel = (slug: string) => {
    const exists = task.labels.includes(slug);
    const updatedLabels = exists
      ? task.labels.filter((s) => s !== slug)
      : [...task.labels, slug];
    onUpdateTask({ ...task, labels: updatedLabels, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  const handleToggleSubtask = (subId: string) => {
    const updated = task.subtasks.map((st) =>
      st.id === subId ? { ...st, completed: !st.completed } : st
    );
    onUpdateTask({ ...task, subtasks: updated, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSt],
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (subId: string) => {
    const updated = task.subtasks.filter((st) => st.id !== subId);
    onUpdateTask({ ...task, subtasks: updated, updatedAt: new Date().toISOString().slice(0, 10) });
  };

  // Tagging / Mention handlers
  const handleToggleTagUser = (user: User) => {
    const currentTagged = task.taggedUsers || [];
    const isAlreadyTagged = currentTagged.some((u) => u.id === user.id);
    const updated = isAlreadyTagged
      ? currentTagged.filter((u) => u.id !== user.id)
      : [...currentTagged, user];

    onUpdateTask({
      ...task,
      taggedUsers: updated,
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    if (isAlreadyTagged) {
      showToast?.(`Removed @${user.name.split(' ')[0]} from tagged teammates`);
    } else {
      showToast?.(`Tagged ${user.name} on ${task.key}`);
    }
  };

  const handleRemoveTaggedUser = (userId: string) => {
    const currentTagged = task.taggedUsers || [];
    const removedUser = currentTagged.find((u) => u.id === userId);
    onUpdateTask({
      ...task,
      taggedUsers: currentTagged.filter((u) => u.id !== userId),
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    if (removedUser) {
      showToast?.(`Untagged ${removedUser.name}`);
    }
  };

  const handleTagForBlocker = (user: User) => {
    const currentTagged = task.taggedUsers || [];
    const isAlreadyTagged = currentTagged.some((u) => u.id === user.id);
    const updatedTagged = isAlreadyTagged ? currentTagged : [...currentTagged, user];
    const newReason = `Waiting on assistance from ${user.name} (${user.role})`;

    const commentObj = {
      id: `c-${Date.now()}`,
      author: currentUser,
      content: `🚨 Flagged as Stuck / Blocked. Tagged @${user.name} for assistance.`,
      createdAt: 'Just now',
    };

    onUpdateTask({
      ...task,
      isBlocked: true,
      blockedReason: newReason,
      taggedUsers: updatedTagged,
      comments: [commentObj, ...(task.comments || [])],
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    setBlockerReasonInput(newReason);
    showToast?.(`Tagged ${user.name} to help unblock ${task.key}!`);
  };

  const handleInsertMention = (name: string) => {
    setNewComment((prev) => (prev ? `${prev} @${name} ` : `@${name} `));
    setShowMentionSuggestions(false);
  };

  const handleCommentChange = (text: string) => {
    setNewComment(text);
    const lastAtIndex = text.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfter = text.slice(lastAtIndex + 1);
      if (!textAfter.includes('\n') && !textAfter.includes('  ') && textAfter.length < 15) {
        setMentionFilter(textAfter.toLowerCase());
        setShowMentionSuggestions(true);
        return;
      }
    }
    setShowMentionSuggestions(false);
  };

  const handleSelectMentionSuggestion = (user: User) => {
    const lastAtIndex = newComment.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const prefix = newComment.slice(0, lastAtIndex);
      setNewComment(`${prefix}@${user.name} `);
    } else {
      setNewComment((prev) => `${prev}@${user.name} `);
    }
    setShowMentionSuggestions(false);
  };

  const handleAddComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: `c-${Date.now()}`,
      author: currentUser,
      content: newComment.trim(),
      createdAt: 'Just now',
    };

    // Auto-tag any teammates mentioned with @Name in the comment
    const mentionedUsers = INITIAL_USERS.filter((u) =>
      newComment.toLowerCase().includes(`@${u.name.toLowerCase()}`) ||
      newComment.toLowerCase().includes(`@${u.name.split(' ')[0].toLowerCase()}`)
    );

    let updatedTagged = task.taggedUsers || [];
    mentionedUsers.forEach((u) => {
      if (!updatedTagged.some((t) => t.id === u.id)) {
        updatedTagged = [...updatedTagged, u];
      }
    });

    onUpdateTask({
      ...task,
      comments: [commentObj, ...(task.comments || [])],
      taggedUsers: updatedTagged,
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    if (mentionedUsers.length > 0) {
      showToast?.(`Comment posted & tagged ${mentionedUsers.map((u) => u.name).join(', ')}!`);
    } else {
      showToast?.('Comment posted');
    }

    setNewComment('');
    setShowMentionSuggestions(false);
  };

  const handleToggleBlocker = () => {
    if (!task.isBlocked) {
      setIsEditingBlocker(true);
      onUpdateTask({
        ...task,
        isBlocked: true,
        blockedReason: blockerReasonInput.trim() || 'Work paused due to technical blocker',
        updatedAt: new Date().toISOString().slice(0, 10),
      });
    } else {
      setIsEditingBlocker(false);
      onUpdateTask({
        ...task,
        isBlocked: false,
        blockedReason: undefined,
        updatedAt: new Date().toISOString().slice(0, 10),
      });
    }
  };

  const handleSaveBlockerReason = () => {
    onUpdateTask({
      ...task,
      isBlocked: true,
      blockedReason: blockerReasonInput.trim() || 'Work paused due to technical blocker',
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setIsEditingBlocker(false);
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Render comment text with highlighted @Mentions
  const renderCommentText = (text: string) => {
    const parts = text.split(/(@[A-Za-z0-9_]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="inline-flex items-center px-1.5 py-0.2 rounded font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[11px]"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Issue Type Selector */}
            <div className="relative flex items-center">
              <select
                value={task.issueType}
                onChange={(e) => handleIssueTypeChange(e.target.value as TaskIssueType)}
                className="appearance-none pl-7 pr-6 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:outline-hidden cursor-pointer"
              >
                {Object.keys(ISSUE_TYPE_CONFIG).map((typeKey) => (
                  <option key={typeKey} value={typeKey}>
                    {ISSUE_TYPE_CONFIG[typeKey as TaskIssueType].label}
                  </option>
                ))}
              </select>
              <div className="absolute left-2 pointer-events-none">
                <IssueTypeIcon type={task.issueType} size="sm" />
              </div>
            </div>

            {/* Issue Key */}
            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
              {task.key}
            </span>

            {/* Flag / Stuck Toggle Button */}
            <button
              type="button"
              onClick={handleToggleBlocker}
              className={`px-2.5 py-1 rounded text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                task.isBlocked
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300 hover:text-rose-600'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${task.isBlocked ? 'fill-rose-600' : ''}`} />
              <span>{task.isBlocked ? 'Stuck / Blocked' : 'Flag as Stuck'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950 px-2 py-1 rounded border border-rose-200 dark:border-rose-800">
                <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">Delete?</span>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="px-2 py-0.5 bg-rose-600 text-white rounded text-xs hover:bg-rose-700 font-medium"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-1.5 py-0.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded transition-colors"
                title="Delete issue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Blocker Callout Banner */}
        {task.isBlocked && (
          <div className="px-6 py-3 bg-rose-50/90 dark:bg-rose-950/70 border-b border-rose-200 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2 text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[11px]">
                  Impediment / Blocker Active
                </span>
                <p className="text-rose-700 dark:text-rose-300 text-xs mt-0.5">
                  {task.blockedReason || 'No blocker reason specified yet.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingBlocker(!isEditingBlocker)}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 rounded hover:bg-rose-50 text-[11px] font-medium"
              >
                {isEditingBlocker ? 'Cancel' : 'Edit Reason'}
              </button>
              <button
                type="button"
                onClick={handleToggleBlocker}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-medium"
              >
                Resolve & Unblock
              </button>
            </div>

            {/* Tag teammate to help unblock */}
            <div className="w-full mt-2 pt-2 border-t border-rose-200/80 dark:border-rose-900/60 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                Stuck? Tag teammate to request help:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_USERS.map((u) => {
                  const isTagged = task.taggedUsers?.some((t) => t.id === u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleTagForBlocker(u)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isTagged
                          ? 'bg-rose-200 dark:bg-rose-900/90 text-rose-950 dark:text-rose-100 font-bold border border-rose-400 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-rose-200 dark:border-rose-900/80 hover:border-rose-400 hover:text-rose-700'
                      }`}
                      title={isTagged ? `Tagged ${u.name}` : `Tag ${u.name} (${u.role}) to assist on this blocker`}
                    >
                      <UserAvatar user={u} size="xs" />
                      <span>{u.name.split(' ')[0]}</span>
                      <span className="text-[10px] text-slate-400">({u.role.split(' ')[0]})</span>
                      {isTagged ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>
                      ) : (
                        <span className="text-rose-500 font-bold">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Blocker Reason Editor */}
        {task.isBlocked && isEditingBlocker && (
          <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-rose-200 dark:border-rose-900 space-y-2">
            <label className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">
              Describe what is causing this task to be stuck:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={blockerReasonInput}
                onChange={(e) => setBlockerReasonInput(e.target.value)}
                placeholder="e.g. Waiting on database replica credentials, API blocked, design review pending..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded focus:border-rose-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSaveBlockerReason}
                className="px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded hover:bg-rose-700"
              >
                Save Reason
              </button>
            </div>
          </div>
        )}

        {/* Modal Body: 2-Column Split */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 custom-scrollbar">
          {/* Main Left Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Field */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Issue Title"
                className="w-full text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 rounded px-2.5 py-1.5 transition-all outline-hidden"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Add a detailed description, acceptance criteria, or technical notes..."
                className="w-full p-3 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden placeholder:text-slate-400 leading-relaxed resize-y"
              />
            </div>

            {/* Subtasks / Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Checklist & Subtasks ({completedSubtasks}/{totalSubtasks})
                  </span>
                </div>
                {totalSubtasks > 0 && (
                  <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {progressPercent}%
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {totalSubtasks > 0 && (
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Subtask Items */}
              <div className="space-y-1.5">
                {task.subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2.5 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
                  >
                    <label className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span
                        className={`text-xs text-slate-800 dark:text-slate-200 break-words ${
                          st.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="Remove subtask"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subtask Input */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new checklist item..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md focus:border-blue-500 focus:outline-hidden text-slate-900 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md disabled:opacity-50 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Comments & Activity with @Mentions */}
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Activity & Comments
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <AtSign className="w-3 h-3 text-blue-500" />
                  <span>Type @Name to tag teammates</span>
                </span>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <UserAvatar user={currentUser} size="sm" />
                <div className="flex-1 space-y-2 relative">
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    placeholder="Write a comment or status update... (e.g. '@Marcus please review this')"
                    className="w-full p-2.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:border-blue-500 focus:outline-hidden placeholder:text-slate-400"
                  />

                  {/* Autocomplete mention suggestions popup */}
                  {showMentionSuggestions && (
                    <div className="absolute left-0 bottom-full mb-1 z-30 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span>Tag teammate</span>
                        <span className="text-[9px] font-normal text-slate-400">Click to select</span>
                      </div>
                      <div className="max-h-36 overflow-y-auto custom-scrollbar py-0.5">
                        {INITIAL_USERS.filter((u) =>
                          u.name.toLowerCase().includes(mentionFilter)
                        ).map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectMentionSuggestion(u)}
                            className="w-full px-2 py-1.5 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded text-left transition-colors cursor-pointer"
                          >
                            <UserAvatar user={u} size="xs" />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {u.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {u.role}
                              </div>
                            </div>
                            <span className="text-blue-600 text-xs font-bold">+</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick @Mention chips */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Tag teammate:</span>
                      {INITIAL_USERS.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleInsertMention(user.name)}
                          className="px-2 py-0.5 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 rounded border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <UserAvatar user={user} size="xs" />
                          <span>@{user.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Existing Comments */}
              <div className="space-y-3 pt-2">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <UserAvatar user={comm.author} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {comm.author.name}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            {comm.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {renderCommentText(comm.content)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No comments yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Details Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5 lg:border-l lg:border-slate-200 dark:lg:border-slate-800 lg:pl-6">
            {/* Status / Column */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Tagged Teammates / Collaborators (@) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Tagged Collaborators</span>
                </label>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {task.taggedUsers?.length || 0}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Tag teammates to request code review, unblock work, or notify them of progress.
              </p>

              {/* List of currently tagged teammates */}
              {task.taggedUsers && task.taggedUsers.length > 0 ? (
                <div className="space-y-1.5">
                  {task.taggedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <UserAvatar user={user} size="sm" />
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block leading-tight">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate block leading-tight">
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTaggedUser(user.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors cursor-pointer"
                        title={`Remove @${user.name.split(' ')[0]} tag`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 px-1 text-[11px] text-slate-400 dark:text-slate-500 italic bg-white/60 dark:bg-slate-900/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                  No one is tagged on this ticket yet. Click below to tag someone:
                </div>
              )}

              {/* Quick Tag Selector Grid */}
              <div className="pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                  Click to tag/untag:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {INITIAL_USERS.map((user) => {
                    const isTagged = task.taggedUsers?.some((u) => u.id === user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleToggleTagUser(user)}
                        className={`p-1.5 rounded-lg border text-left text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          isTagged
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                        title={isTagged ? `Untag ${user.name}` : `Tag ${user.name} on this ticket`}
                      >
                        <UserAvatar user={user} size="xs" />
                        <span className="truncate flex-1 text-[11px] font-medium leading-tight">
                          {user.name.split(' ')[0]}
                        </span>
                        <span className={`text-[10px] font-bold ${isTagged ? 'text-white' : 'text-slate-400'}`}>
                          {isTagged ? '✓' : '+'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stuck & Tag CTA */}
              {!task.isBlocked && (
                <button
                  type="button"
                  onClick={handleToggleBlocker}
                  className="w-full mt-2 py-1.5 px-2.5 rounded-lg border border-dashed border-rose-300 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100/70 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flag className="w-3 h-3 text-rose-600" />
                  <span>Stuck on this task? Flag & tag teammate</span>
                </button>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <div className="space-y-1">
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((pKey) => {
                  const cfg = PRIORITY_CONFIG[pKey];
                  const Icon = cfg.icon;
                  const isSelected = task.priority === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => handlePriorityChange(pKey)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                        isSelected
                          ? `${cfg.bgColor} ${cfg.iconColor} ring-1 ring-blue-500 font-semibold`
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cfg.label}</span>
                      </div>
                      {isSelected && <span className="text-[10px] uppercase font-bold">Active</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Primary Assignee
              </label>
              <select
                value={task.assignee?.id || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {INITIAL_USERS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Story Points Estimate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={task.storyPoints}
                  onChange={(e) => {
                    const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                    onUpdateTask({ ...task, storyPoints: val, updatedAt: new Date().toISOString().slice(0, 10) });
                  }}
                  className="w-24 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-xs font-mono font-semibold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">Fibonacci sizing (1, 2, 3, 5, 8...)</span>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Due Date
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={task.dueDate || ''}
                  onChange={(e) => {
                    onUpdateTask({
                      ...task,
                      dueDate: e.target.value || undefined,
                      updatedAt: new Date().toISOString().slice(0, 10),
                    });
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-md text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                {task.dueDate && (
                  <button
                    type="button"
                    onClick={() => onUpdateTask({ ...task, dueDate: undefined, updatedAt: new Date().toISOString().slice(0, 10) })}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Clear due date"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Labels Manager */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Color-Coded Labels
              </label>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_LABELS.map((lbl) => {
                  const isChecked = task.labels.includes(lbl.slug);
                  return (
                    <button
                      key={lbl.slug}
                      type="button"
                      onClick={() => handleToggleLabel(lbl.slug)}
                      className={`px-2 py-1 text-xs rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? `${lbl.bgColor} ${lbl.textColor} ${lbl.borderColor} font-semibold ring-1 ring-blue-500`
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${lbl.textColor.replace('text-', 'bg-')}`} />
                      <span>{lbl.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metadata Timestamps */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Reporter</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{task.reporter?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span className="font-mono">{task.createdAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Updated</span>
                <span className="font-mono">{task.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
