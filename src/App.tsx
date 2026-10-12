import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_COLUMNS,
  INITIAL_TASKS,
  INITIAL_USERS,
} from './data/initialData';
import {
  Column,
  Task,
  TaskPriority,
  User,
  ViewMode,
} from './types/kanban';
import { BoardHeader } from './components/BoardHeader';
import { BoardToolbar } from './components/BoardToolbar';
import { KanbanColumn } from './components/KanbanColumn';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { AddColumnModal } from './components/AddColumnModal';
import { ListView } from './components/ListView';
import { SprintMetricsView } from './components/SprintMetricsView';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ExportImportModal } from './components/ExportImportModal';

const STORAGE_KEY_TASKS = 'taskboard_jira_tasks_v2';
const STORAGE_KEY_COLUMNS = 'taskboard_jira_columns_v2';
const STORAGE_KEY_DARK_MODE = 'taskboard_dark_mode_v2';

export default function App() {
  // Current user (Elena Rostova - Tech Lead)
  const currentUser: User = INITIAL_USERS[0];

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DARK_MODE);
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sync dark class on document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_DARK_MODE, String(isDarkMode));
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Core state with local storage persistence
  const [columns, setColumns] = useState<Column[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLUMNS);
      return saved ? JSON.parse(saved) : INITIAL_COLUMNS;
    } catch {
      return INITIAL_COLUMNS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        const parsed: Task[] = JSON.parse(saved);
        // Hydrate users with current bundled avatar assets
        return parsed.map((t) => {
          const matchedAssignee = t.assignee
            ? INITIAL_USERS.find((u) => u.id === t.assignee?.id) || t.assignee
            : null;
          const matchedReporter = (t.reporter && INITIAL_USERS.find((u) => u.id === t.reporter.id))
            || t.reporter
            || INITIAL_USERS[0];
          const matchedTaggedUsers = t.taggedUsers
            ? t.taggedUsers.map((tu) => INITIAL_USERS.find((u) => u.id === tu.id) || tu)
            : undefined;

          return {
            ...t,
            assignee: matchedAssignee,
            reporter: matchedReporter,
            taggedUsers: matchedTaggedUsers,
          };
        });
      }
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // UI state
  const [currentView, setCurrentView] = useState<ViewMode>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskDefaultCol, setCreateTaskDefaultCol] = useState<string>('todo');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [isShowingShortcuts, setIsShowingShortcuts] = useState(false);
  const [isShowingExportImport, setIsShowingExportImport] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile focused column (for small screens)
  const [mobileActiveColumnId, setMobileActiveColumnId] = useState<string | 'all'>('all');

  // Search input ref for keyboard shortcut focus
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [filterBlockedOnly, setFilterBlockedOnly] = useState<boolean>(false);

  // Drag and drop state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
    } catch {
      // ignore
    }
  }, [columns]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Keep selectedTask fresh if task in list is updated
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t.id === selectedTask.id);
      if (updated) {
        setSelectedTask(updated);
      }
    }
  }, [tasks]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (e.key === 'Escape') {
        if (selectedTask) setSelectedTask(null);
        if (isCreatingTask) setIsCreatingTask(false);
        if (isAddingColumn) setIsAddingColumn(false);
        if (isShowingShortcuts) setIsShowingShortcuts(false);
        if (isShowingExportImport) setIsShowingExportImport(false);
        return;
      }

      if (isInput) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCreateTaskDefaultCol('todo');
        setIsCreatingTask(true);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '1') {
        setCurrentView('board');
      } else if (e.key === '2') {
        setCurrentView('list');
      } else if (e.key === '3') {
        setCurrentView('analytics');
      } else if (e.key === '?') {
        setIsShowingShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedTask,
    isCreatingTask,
    isAddingColumn,
    isShowingShortcuts,
    isShowingExportImport,
  ]);

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchKey = task.key.toLowerCase().includes(q);
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      if (!matchKey && !matchTitle && !matchDesc) return false;
    }

    if (filterBlockedOnly) {
      if (!task.isBlocked) return false;
    }

    if (selectedAssigneeId) {
      const isAssigned = task.assignee?.id === selectedAssigneeId;
      const isTagged = task.taggedUsers?.some((u) => u.id === selectedAssigneeId);
      if (!isAssigned && !isTagged) return false;
    }

    if (selectedPriority) {
      if (task.priority !== selectedPriority) return false;
    }

    if (selectedLabels.length > 0) {
      const hasLabels = selectedLabels.every((l) => task.labels.includes(l));
      if (!hasLabels) return false;
    }

    return true;
  });

  const blockedCount = tasks.filter((t) => t.isBlocked).length;

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(task.id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverColumnId(null);
    setDragOverIndex(null);
  };

  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumnId !== columnId) {
      setDragOverColumnId(columnId);
    }
  };

  const handleColumnDragLeave = (e: React.DragEvent, columnId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumnId === columnId) {
      setDragOverColumnId(null);
      setDragOverIndex(null);
    }
  };

  const handleCardDragOver = (
    e: React.DragEvent,
    columnId: string,
    cardIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const isTopHalf = offsetY < rect.height / 2;

    const targetIdx = isTopHalf ? cardIndex : cardIndex + 1;

    setDragOverColumnId(columnId);
    setDragOverIndex(targetIdx);
  };

  const handleColumnDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
    if (!taskId) return;

    const sourceTask = tasks.find((t) => t.id === taskId);
    if (!sourceTask) return;

    const targetCol = columns.find((c) => c.id === targetColumnId);

    setTasks((prevTasks) => {
      const remainingTasks = prevTasks.filter((t) => t.id !== taskId);

      const updatedTask: Task = {
        ...sourceTask,
        status: targetColumnId,
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      const tasksInTargetColumn = remainingTasks.filter(
        (t) => t.status === targetColumnId
      );

      const insertIndex =
        dragOverIndex !== null && dragOverIndex <= tasksInTargetColumn.length
          ? dragOverIndex
          : tasksInTargetColumn.length;

      const tasksOtherColumns = remainingTasks.filter(
        (t) => t.status !== targetColumnId
      );

      tasksInTargetColumn.splice(insertIndex, 0, updatedTask);

      return [...tasksOtherColumns, ...tasksInTargetColumn];
    });

    handleDragEnd();
    showToast(`${sourceTask.key} moved to ${targetCol?.title || 'new status'}`);
  };

  // Programmatic task move
  const handleMoveTask = (taskId: string, targetColumnId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const targetCol = columns.find((c) => c.id === targetColumnId);

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: targetColumnId,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : t
      )
    );

    if (task && targetCol) {
      showToast(`${task.key} moved to ${targetCol.title}`);
    }
  };

  // Toggle Blocked / Stuck status
  const handleToggleBlock = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const willBeBlocked = !task.isBlocked;
    const defaultReason = willBeBlocked ? 'Waiting on external team approval' : undefined;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              isBlocked: willBeBlocked,
              blockedReason: defaultReason,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : t
      )
    );

    showToast(
      willBeBlocked
        ? `🚩 ${task.key} flagged as Stuck / Blocked`
        : `✓ Blocker resolved for ${task.key}`
    );
  };

  // Task creation
  const handleCreateTask = (newTaskData: Partial<Task>) => {
    const currentMaxNumber = tasks.reduce((max, t) => {
      const match = t.key.match(/TB-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 100);

    const nextKey = `TB-${currentMaxNumber + 1}`;
    const nowStr = new Date().toISOString().slice(0, 10);

    const fullTask: Task = {
      id: `task-${Date.now()}`,
      key: nextKey,
      title: newTaskData.title || 'Untitled Issue',
      description: newTaskData.description || '',
      status: newTaskData.status || 'todo',
      priority: newTaskData.priority || 'medium',
      issueType: newTaskData.issueType || 'story',
      labels: newTaskData.labels || [],
      assignee: newTaskData.assignee || null,
      reporter: newTaskData.reporter || currentUser,
      storyPoints: newTaskData.storyPoints || 0,
      dueDate: newTaskData.dueDate,
      isBlocked: newTaskData.isBlocked || false,
      blockedReason: newTaskData.blockedReason,
      taggedUsers: newTaskData.taggedUsers || [],
      subtasks: newTaskData.subtasks || [],
      comments: newTaskData.comments || [],
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    setTasks((prev) => [fullTask, ...prev]);
    showToast(`Created issue ${nextKey}`);
  };

  // Quick add from bottom of column
  const handleQuickAddTask = (columnId: string, title: string) => {
    handleCreateTask({
      title,
      status: columnId,
      issueType: 'story',
      priority: 'medium',
      assignee: currentUser,
      storyPoints: 2,
    });
  };

  // Task update
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  // Task deletion
  const handleDeleteTask = (taskId: string) => {
    const t = tasks.find((item) => item.id === taskId);
    setTasks((prev) => prev.filter((item) => item.id !== taskId));
    setSelectedTask(null);
    if (t) showToast(`Deleted issue ${t.key}`);
  };

  // Column management
  const handleAddColumn = (title: string, limit?: number) => {
    const newColId = title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    const newColumn: Column = {
      id: newColId,
      title,
      limit,
      order: columns.length,
    };
    setColumns((prev) => [...prev, newColumn]);
    showToast(`Added column "${title}"`);
  };

  const handleUpdateColumn = (columnId: string, newTitle: string, newLimit?: number) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, title: newTitle, limit: newLimit } : col
      )
    );
    showToast(`Updated column "${newTitle}"`);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 1) return;
    const colToDelete = columns.find((c) => c.id === columnId);
    const fallbackCol = columns.find((c) => c.id !== columnId) || columns[0];
    setTasks((prev) =>
      prev.map((t) => (t.status === columnId ? { ...t, status: fallbackCol.id } : t))
    );
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    showToast(`Deleted column "${colToDelete?.title}"`);
  };

  const handleMoveColumnLeft = (columnId: string) => {
    const idx = columns.findIndex((c) => c.id === columnId);
    if (idx <= 0) return;
    const copy = [...columns];
    const temp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = temp;
    setColumns(copy);
  };

  const handleMoveColumnRight = (columnId: string) => {
    const idx = columns.findIndex((c) => c.id === columnId);
    if (idx < 0 || idx >= columns.length - 1) return;
    const copy = [...columns];
    const temp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = temp;
    setColumns(copy);
  };

  const handleSortColumnTasks = (
    columnId: string,
    criteria: 'priority' | 'points' | 'dueDate'
  ) => {
    const priorityWeight: Record<TaskPriority, number> = {
      highest: 5,
      high: 4,
      medium: 3,
      low: 2,
      lowest: 1,
    };

    setTasks((prev) => {
      const colTasks = prev.filter((t) => t.status === columnId);
      const otherTasks = prev.filter((t) => t.status !== columnId);

      colTasks.sort((a, b) => {
        if (criteria === 'priority') {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        if (criteria === 'points') {
          return (b.storyPoints || 0) - (a.storyPoints || 0);
        }
        if (criteria === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        return 0;
      });

      return [...otherTasks, ...colTasks];
    });

    showToast(`Sorted column tasks by ${criteria}`);
  };

  // Reset to default demo data
  const handleResetDemoData = () => {
    if (
      window.confirm(
        'Reset TaskBoard to default Jira demo tasks and columns? Custom additions will be overwritten.'
      )
    ) {
      localStorage.removeItem(STORAGE_KEY_TASKS);
      localStorage.removeItem(STORAGE_KEY_COLUMNS);
      setColumns(INITIAL_COLUMNS);
      setTasks(INITIAL_TASKS);
      setSearchQuery('');
      setSelectedAssigneeId(null);
      setSelectedPriority(null);
      setSelectedLabels([]);
      setFilterBlockedOnly(false);
      showToast('Demo board restored');
    }
  };

  const handleImportData = (data: { tasks: Task[]; columns: Column[] }) => {
    setColumns(data.columns);
    setTasks(data.tasks);
    showToast(`Imported ${data.tasks.length} tasks and ${data.columns.length} columns`);
  };

  const handleToggleLabel = (slug: string) => {
    setSelectedLabels((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const visibleColumns =
    mobileActiveColumnId === 'all'
      ? columns
      : columns.filter((c) => c.id === mobileActiveColumnId);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-150`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-xl animate-in slide-in-from-bottom-2 duration-150 flex items-center gap-2 border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3-Zone Top Navigation Header with Dark Mode Toggle */}
      <BoardHeader
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenCreateModal={() => {
          setCreateTaskDefaultCol('todo');
          setIsCreatingTask(true);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
      />

      {/* Interactive Filter Toolbar & Breadcrumbs */}
      <BoardToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAssigneeId={selectedAssigneeId}
        onAssigneeSelect={setSelectedAssigneeId}
        selectedPriority={selectedPriority}
        onPrioritySelect={setSelectedPriority}
        selectedLabels={selectedLabels}
        onToggleLabel={handleToggleLabel}
        filterBlockedOnly={filterBlockedOnly}
        onToggleBlockedOnly={() => setFilterBlockedOnly(!filterBlockedOnly)}
        blockedCount={blockedCount}
        onResetFilters={() => {
          setSearchQuery('');
          setSelectedAssigneeId(null);
          setSelectedPriority(null);
          setSelectedLabels([]);
          setFilterBlockedOnly(false);
        }}
        onResetDemoData={handleResetDemoData}
        onAddColumn={() => setIsAddingColumn(true)}
        onOpenShortcuts={() => setIsShowingShortcuts(true)}
        onOpenExportImport={() => setIsShowingExportImport(true)}
        searchInputRef={searchInputRef}
        totalTasksCount={tasks.length}
        filteredTasksCount={filteredTasks.length}
        currentUser={currentUser}
      />

      {/* Mobile Column Quick Switcher (visible on mobile screens) */}
      {currentView === 'board' && (
        <div className="sm:hidden px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 custom-scrollbar">
          <button
            type="button"
            onClick={() => setMobileActiveColumnId('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              mobileActiveColumnId === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Columns
          </button>
          {columns.map((c) => {
            const count = filteredTasks.filter((t) => t.status === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setMobileActiveColumnId(c.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
                  mobileActiveColumnId === c.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{c.title}</span>
                <span className="opacity-70 font-mono text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === 'board' && (
          <div className="flex-1 overflow-x-auto p-4 sm:p-6 custom-scrollbar">
            <div className="flex gap-4 items-start pb-4 min-w-max">
              {visibleColumns.map((column) => {
                const columnTasks = filteredTasks.filter(
                  (t) => t.status === column.id
                );
                return (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                    allColumns={columns}
                    onSelectTask={(task) => setSelectedTask(task)}
                    onMoveTask={handleMoveTask}
                    onToggleBlock={handleToggleBlock}
                    onQuickAddTask={handleQuickAddTask}
                    onUpdateColumn={handleUpdateColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onMoveColumnLeft={handleMoveColumnLeft}
                    onMoveColumnRight={handleMoveColumnRight}
                    onSortColumnTasks={handleSortColumnTasks}
                    draggingTaskId={draggingTaskId}
                    dragOverColumnId={dragOverColumnId}
                    dragOverIndex={dragOverIndex}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onColumnDragOver={handleColumnDragOver}
                    onColumnDragLeave={handleColumnDragLeave}
                    onColumnDrop={handleColumnDrop}
                    onCardDragOver={handleCardDragOver}
                  />
                );
              })}

              {/* Add Column Button Card */}
              {mobileActiveColumnId === 'all' && (
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(true)}
                  className="w-72 sm:w-80 h-32 shrink-0 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
                >
                  <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-950 transition-colors">
                    <span className="text-lg leading-none">+</span>
                  </div>
                  <span className="text-xs font-semibold">Add Column</span>
                </button>
              )}
            </div>
          </div>
        )}

        {currentView === 'list' && (
          <ListView
            tasks={filteredTasks}
            columns={columns}
            onSelectTask={(task) => setSelectedTask(task)}
          />
        )}

        {currentView === 'analytics' && (
          <SprintMetricsView
            tasks={tasks}
            columns={columns}
            onSelectTask={(task) => setSelectedTask(task)}
            onResolveBlocker={handleToggleBlock}
          />
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          columns={columns}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      {/* Create Task Modal */}
      {isCreatingTask && (
        <CreateTaskModal
          columns={columns}
          onClose={() => setIsCreatingTask(false)}
          onCreateTask={handleCreateTask}
          currentUser={currentUser}
          defaultColumnId={createTaskDefaultCol}
        />
      )}

      {/* Add Column Modal */}
      {isAddingColumn && (
        <AddColumnModal
          onClose={() => setIsAddingColumn(false)}
          onAddColumn={handleAddColumn}
        />
      )}

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      {isShowingShortcuts && (
        <KeyboardShortcutsModal
          onClose={() => setIsShowingShortcuts(false)}
        />
      )}

      {/* Export / Import Modal */}
      {isShowingExportImport && (
        <ExportImportModal
          tasks={tasks}
          columns={columns}
          onClose={() => setIsShowingExportImport(false)}
          onImportData={handleImportData}
        />
      )}
    </div>
  );
}
