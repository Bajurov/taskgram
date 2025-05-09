import { defineStore } from 'pinia';
import { Task, Comment } from '../types';
import { tasks } from '../api/mockData';

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [...tasks] as Task[]
  }),
  getters: {
    getTasksByProject: (state) => (projectId: string) => 
      state.tasks.filter(t => t.projectId === projectId),
    
    getTasksByAssignee: (state) => (userId: string) =>
      state.tasks.filter(t => t.assignees.includes(userId))
  },
  actions: {
    addTask(task: Task) {
      this.tasks.push({
        ...task,
        comments: []
      });
    },
    updateTask(task: Task) {
      const idx = this.tasks.findIndex(t => t.id === task.id);
      if (idx !== -1) this.tasks[idx] = task;
    },
    deleteTask(id: string) {
      this.tasks = this.tasks.filter(t => t.id !== id);
    },
    changeTaskStatus(taskId: string, status: 'new' | 'in_progress' | 'done' | 'backlog') {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) task.status = status;
    },
    addComment(taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.comments.push({
          ...comment,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        });
      }
    },
    addAssignee(taskId: string, userId: string) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task && !task.assignees.includes(userId) && task.assignees.length < 3) {
        task.assignees.push(userId);
      }
    },
    removeAssignee(taskId: string, userId: string) {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.assignees = task.assignees.filter(id => id !== userId);
      }
    }
  }
}); 