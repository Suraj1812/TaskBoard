import React, { useState } from 'react';
import { X, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { Column, Task } from '../types/kanban';

interface ExportImportModalProps {
  tasks: Task[];
  columns: Column[];
  onClose: () => void;
  onImportData: (data: { tasks: Task[]; columns: Column[] }) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  tasks,
  columns,
  onClose,
  onImportData,
}) => {
  const [importJson, setImportJson] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify({ columns, tasks }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskboard-jira-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const headers = ['Key', 'Type', 'Summary', 'Status', 'Priority', 'StoryPoints', 'Assignee', 'Labels', 'DueDate', 'Blocked', 'BlockedReason'];
    const rows = tasks.map((t) => [
      t.key,
      t.issueType,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.storyPoints,
      t.assignee ? `"${t.assignee.name}"` : 'Unassigned',
      `"${t.labels.join(', ')}"`,
      t.dueDate || '',
      t.isBlocked ? 'YES' : 'NO',
      `"${(t.blockedReason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskboard-issues-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('JSON must include a "tasks" array.');
      }
      if (!parsed.columns || !Array.isArray(parsed.columns)) {
        throw new Error('JSON must include a "columns" array.');
      }
      onImportData({ tasks: parsed.tasks, columns: parsed.columns });
      setImportSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
          <h3 className="text-xs font-bold uppercase tracking-wide">
            Export & Import Board Data
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Export Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              1. Export Current Sprint
            </h4>
            <p className="text-slate-500 dark:text-slate-400">
              Download your board configuration, tasks, subtasks, blocked flags, and comments:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-md flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Export as JSON</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-md flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Export as CSV</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              2. Import Board JSON
            </h4>
            <p className="text-slate-500 dark:text-slate-400">
              Paste valid TaskBoard JSON containing `tasks` and `columns`:
            </p>
            <form onSubmit={handleImportSubmit} className="space-y-2">
              <textarea
                rows={4}
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{ "columns": [...], "tasks": [...] }'
                className="w-full p-2.5 font-mono text-[11px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md focus:border-blue-500 focus:outline-hidden"
              />

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {importSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Board imported successfully!</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!importJson.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
