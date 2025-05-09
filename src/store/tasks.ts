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
    getTasksByProject: (state) => (projectid: string) => 
      state.tasks.filter(t => t.projectid === projectid),
    
    getTasksByAssignee: (state) => (userid: string) =>
      state.tasks.filter(t => t.assignees.includes(userid))
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
    changeTaskStatus(taskid: string, status: 'new' | 'in_progress' | 'done' | 'backlog') {
      const task = this.tasks.find(t => t.id === taskid);
      if (task) {
        task.status = status;
        this.updateTask(task);
      }
    },
    addComment(taskid: string, comment: Omit<Comment, 'id' | 'createdAt'>) {
      const task = this.tasks.find(t => t.id === taskid);
      if (task) {
        task.comments.push({
          ...comment,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        });
      }
    },
    addAssignee(taskid: string, userid: string) {
      const task = this.tasks.find(t => t.id === taskid);
      if (task && !task.assignees.includes(userid) && task.assignees.length < 3) {
        task.assignees.push(userid);
      }
    },
    removeAssignee(taskid: string, userid: string) {
      const task = this.tasks.find(t => t.id === taskid);
      if (task) {
        task.assignees = task.assignees.filter(id => id !== userid);
      }
    }
  }
}); 