import { defineStore } from 'pinia';
import * as taskAssigneesApi from '../api/taskAssigneesApi';

export const useTaskAssigneesStore = defineStore('taskAssignees', {
  state: () => ({
    assignees: {} as Record<string, string[]>, // taskId -> userId[]
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchAssignees(taskId: string) {
      this.loading = true;
      try {
        this.assignees[taskId] = await taskAssigneesApi.getAssignees(taskId);
        this.error = null;
      } catch (e: any) {
        this.error = e.message || 'Ошибка загрузки исполнителей';
      } finally {
        this.loading = false;
      }
    },
    async addAssignee(taskId: string, userId: string) {
      await taskAssigneesApi.addAssignee(taskId, userId);
      await this.fetchAssignees(taskId);
    },
    async removeAssignee(taskId: string, userId: string) {
      await taskAssigneesApi.removeAssignee(taskId, userId);
      await this.fetchAssignees(taskId);
    }
  }
}); 