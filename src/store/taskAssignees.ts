import { defineStore } from 'pinia';
import * as taskAssigneesApi from '../api/taskAssigneesApi';

export const useTaskAssigneesStore = defineStore('taskAssignees', {
  state: () => ({
    assignees: {} as Record<string, string[]>, // taskid -> userId[]
    loading: false,
    error: null as string | null
  }),
  actions: {
    async fetchAssignees(taskid: string) {
      this.loading = true;
      try {
        this.assignees[taskid] = await taskAssigneesApi.getAssignees(taskid);
        this.error = null;
      } catch (e: any) {
        this.error = e.message || 'Ошибка загрузки исполнителей';
      } finally {
        this.loading = false;
      }
    },
    async addAssignee(taskid: string, userId: string) {
      await taskAssigneesApi.addAssignee(taskid, userId);
      await this.fetchAssignees(taskid);
    },
    async removeAssignee(taskid: string, userId: string) {
      await taskAssigneesApi.removeAssignee(taskid, userId);
      await this.fetchAssignees(taskid);
    }
  }
}); 