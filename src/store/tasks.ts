import { defineStore } from 'pinia';
import { Task, Comment } from '../types';
import * as tasksApi from '../api/tasksApi';

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    loading: false as boolean,
    error: null as string | null
  }),
  getters: {
    getTasksByProject: (state) => (projectId: string) => 
      state.tasks.filter(t => t.projectId === projectId),
    
    getTasksByAssignee: (state) => (userId: string) =>
      state.tasks.filter(t => t.assignees.includes(userId))
  },
  actions: {
    async fetchTasks() {
      this.loading = true;
      try {
        this.tasks = await tasksApi.getTasks();
        this.error = null;
      } catch (e: any) {
        this.error = e.message || 'Ошибка загрузки задач';
      } finally {
        this.loading = false;
      }
    },
    async addTask(task: Task) {
      await tasksApi.addTask(task);
      await this.fetchTasks();
    },
    async updateTask(task: Task) {
      await tasksApi.updateTask(task);
      await this.fetchTasks();
    },
    async deleteTask(id: string) {
      await tasksApi.deleteTask(id);
      await this.fetchTasks();
    },
    changeTaskStatus(taskId: string, status: 'new' | 'in_progress' | 'done' | 'backlog') {
      const task = this.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = status;
        this.updateTask(task);
      }
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