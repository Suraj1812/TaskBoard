import React, { useState } from 'react';
import { Plus, MoreHorizontal, AlertCircle, Check, X, Settings2, ArrowLeft, ArrowRight, ArrowUpDown } from 'lucide-react';
import { Column, Task } from '../types/kanban';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  allColumns: Column[];
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onToggleBlock?: (taskId: string) => void;
  onQuickAddTask: (columnId: string, title: string) => void;
  onUpdateColumn: (columnId: string, newTitle: string, newLimit?: number) => void;
  onDeleteColumn: (columnId: string) => void;
  onMoveColumnLeft?: (columnId: string) => void;
  onMoveColumnRight?: (columnId: string) => void;
  onSortColumnTasks?: (columnId: string, criteria: 'priority' | 'points' | 'dueDate') => void;
  // Drag & drop props
  draggingTaskId: string | null;
  dragOverColumnId: string | null;
  dragOverIndex: number | null;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onColumnDragOver: (e: React.DragEvent, columnId: string) => void;
  onColumnDragLeave: (e: React.DragEvent, columnId: string) => void;
  onColumnDrop: (e: React.DragEvent, columnId: string) => void;
  onCardDragOver: (e: React.DragEvent, columnId: string, cardIndex: number) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  allColumns,
  onSelectTask,
  onMoveTask,
  onToggleBlock,
  onQuickAddTask,
  onUpdateColumn,
  onDeleteColumn,
  onMoveColumnLeft,
  onMoveColumnRight,
  onSortColumnTasks,
  draggingTaskId,
  dragOverColumnId,
  dragOverIndex,
  onDragStart,
  onDragEnd,
  onColumnDragOver,
  onColumnDragLeave,
  onColumnDrop,
  onCardDragOver,
}) => {
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [editLimit, setEditLimit] = useState<string>(
    column.limit ? String(column.limit) : ''
  );

  const isOverWipLimit = column.limit !== undefined && tasks.length > column.limit;
  const isTargetColumn = dragOverColumnId === column.id;

  const handleQuickAddSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (quickTitle.trim()) {
      onQuickAddTask(column.id, quickTitle.trim());
      setQuickTitle('');
      setIsQuickAdding(false);
    }
  };

  const handleSaveSettings = () => {
    const parsedLimit = editLimit.trim() ? parseInt(editLimit, 10) : undefined;
    onUpdateColumn(
      column.id,
      editTitle.trim() || column.title,
      Number.isNaN(parsedLimit) ? undefined : parsedLimit
    );
    setIsEditingSettings(false);
  };

  return (
    <div
      onDragOver={(e) => onColumnDragOver(e, column.id)}
      onDragLeave={(e) => onColumnDragLeave(e, column.id)}
      onDrop={(e) => onColumnDrop(e, column.id)}
      className={`w-72 sm:w-80 shrink-0 flex flex-col bg-slate-100/70 dark:bg-slate-900/60 rounded-xl border transition-colors max-h-[calc(100vh-175px)] ${
        isTargetColumn
          ? 'border-blue-400 dark:border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 pb-2 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide uppercase truncate">
            {column.title}
          </h3>

          {/* Issue Count & WIP Limit Badge */}
          <div
            className={`flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isOverWipLimit
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700'
                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title={
              column.limit
                ? `${tasks.length} tasks (WIP Limit: ${column.limit})`
                : `${tasks.length} tasks`
            }
          >
            <span>{tasks.length}</span>
            {column.limit !== undefined && (
              <>
                <span className="text-slate-400 dark:text-slate-500">/</span>
                <span>{column.limit}</span>
              </>
            )}
            {isOverWipLimit && (
              <AlertCircle className="w-3 h-3 text-amber-700 dark:text-amber-400 ml-0.5 shrink-0" />
            )}
          </div>
        </div>

        {/* Column Actions */}
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsQuickAdding(true)}
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition-colors"
            title="Add task to column"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded transition-colors"
            title="Column options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Column Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-30 text-xs">
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  setIsEditingSettings(true);
                }}
                className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Column Settings & WIP</span>
              </button>

              {/* Move Column Left / Right */}
              {allColumns.findIndex((c) => c.id === column.id) > 0 && onMoveColumnLeft && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onMoveColumnLeft(column.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                  <span>Move Column Left</span>
                </button>
              )}

              {allColumns.findIndex((c) => c.id === column.id) < allColumns.length - 1 && onMoveColumnRight && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onMoveColumnRight(column.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Move Column Right</span>
                </button>
              )}

              {/* Sort Options */}
              {tasks.length > 1 && onSortColumnTasks && (
                <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Sort Tasks By</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onSortColumnTasks(column.id, 'priority');
                    }}
                    className="w-full text-left px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Priority (Highest first)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onSortColumnTasks(column.id, 'points');
                    }}
                    className="w-full text-left px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Story Points (High to Low)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onSortColumnTasks(column.id, 'dueDate');
                    }}
                    className="w-full text-left px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Due Date (Earliest first)
                  </button>
                </div>
              )}

              {allColumns.length > 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteColumn(column.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Delete Column</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Column Settings Editor Inline */}
      {isEditingSettings && (
        <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Column Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              WIP Limit (Leave blank for none)
            </label>
            <input
              type="number"
              min="1"
              max="99"
              placeholder="e.g. 5"
              value={editLimit}
              onChange={(e) => setEditLimit(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingSettings(false)}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-[11px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Cards List Container */}
      <div className="p-2 space-y-2.5 overflow-y-auto flex-1 custom-scrollbar min-h-24">
        {tasks.map((task, idx) => (
          <TaskCard
            key={task.id}
            task={task}
            columns={allColumns}
            index={idx}
            onSelectTask={onSelectTask}
            onMoveTask={onMoveTask}
            onToggleBlock={onToggleBlock}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOverCard={(e) => onCardDragOver(e, column.id, idx)}
            isDropTargetBefore={
              isTargetColumn && dragOverIndex === idx && draggingTaskId !== task.id
            }
            isDropTargetAfter={
              isTargetColumn &&
              dragOverIndex === idx + 1 &&
              idx === tasks.length - 1 &&
              draggingTaskId !== task.id
            }
          />
        ))}

        {/* Empty State */}
        {tasks.length === 0 && !isQuickAdding && (
          <div className="h-28 rounded-lg border-2 border-dashed border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-4 text-center">
            <p className="text-xs font-medium">No tasks yet</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Drag cards here or click + to add
            </p>
          </div>
        )}
      </div>

      {/* Quick Add Inline Composer */}
      <div className="p-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
        {isQuickAdding ? (
          <form
            onSubmit={handleQuickAddSubmit}
            className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-blue-400 dark:border-blue-500 shadow-xs space-y-2"
          >
            <textarea
              autoFocus
              rows={2}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickAddSubmit();
                } else if (e.key === 'Escape') {
                  setIsQuickAdding(false);
                }
              }}
              placeholder="What needs to be done? Press Enter to save..."
              className="w-full text-xs text-slate-900 dark:text-slate-100 resize-none focus:outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500 leading-relaxed bg-transparent"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-500">↵ Enter to add · Esc cancel</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsQuickAdding(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsQuickAdding(true)}
            className="w-full py-1.5 px-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 justify-center cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Create issue</span>
          </button>
        )}
      </div>
    </div>
  );
};
