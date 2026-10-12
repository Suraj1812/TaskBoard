import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AddColumnModalProps {
  onClose: () => void;
  onAddColumn: (title: string, limit?: number) => void;
}

export const AddColumnModal: React.FC<AddColumnModalProps> = ({
  onClose,
  onAddColumn,
}) => {
  const [title, setTitle] = useState('');
  const [limit, setLimit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const parsedLimit = limit.trim() ? parseInt(limit, 10) : undefined;
    onAddColumn(
      title.trim(),
      Number.isNaN(parsedLimit) ? undefined : parsedLimit
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wide">
            Add Board Column
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Column Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. In Testing / QA"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Work In Progress (WIP) Limit
            </label>
            <input
              type="number"
              min="1"
              max="99"
              placeholder="Optional limit (e.g. 4)"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded focus:border-blue-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Warns the team when too many tasks pile up in this column.
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add Column</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
