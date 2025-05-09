export type Role = 'owner' | 'manager' | 'employee';

export interface User {
  id: string;
  telegramId: string;
  name: string;
  role: Role;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'archived';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  projectid: string;
  creatorid: string;
  assignees: string[];
  status: 'new' | 'in_progress' | 'done' | 'backlog';
  comments: Comment[];
}

export interface Access {
  id: string;
  projectId: string;
  url: string;
  login: string;
  password: string;
  comment: string;
}

export interface Comment {
  id: string;
  taskid: string;
  authorid: string;
  text: string;
  createdat: string;
} 