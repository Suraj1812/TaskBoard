export type TaskPriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export type TaskIssueType = 'story' | 'bug' | 'task' | 'epic';

export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarUrl: string;
  initials: string;
}

export interface TaskLabel {
  id: string;
  name: string;
  slug: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface Task {
  id: string;
  key: string; // e.g. "TB-101"
  title: string;
  description: string;
  status: string; // matches column id
  priority: TaskPriority;
  issueType: TaskIssueType;
  labels: string[]; // array of label slugs
  assignee: User | null;
  reporter: User;
  storyPoints: number;
  dueDate?: string;
  subtasks: SubTask[];
  comments: TaskComment[];
  isBlocked?: boolean;
  blockedReason?: string;
  taggedUsers?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  limit?: number; // WIP limit, optional
  order: number;
}

export type ViewMode = 'board' | 'list' | 'analytics';
