import { defineStore } from 'pinia';
import { Access } from '../types';
import * as accessesApi from '../api/accessesApi';

export const useAccessStore = defineStore('access', {
  state: () => ({
    accesses: [] as Access[],
    loading: false,
    error: null as string | null
  }),
  getters: {
    getAccessesByProject: (state) => (projectId: string) => 
      state.accesses.filter(a => a.projectId === projectId)
  },
  actions: {
    async fetchAccesses(projectId: string) {
      this.loading = true;
      try {
        this.accesses = await accessesApi.getAccesses(projectId);
        this.error = null;
      } catch (e: any) {
        this.error = e.message || 'Ошибка загрузки доступов';
      } finally {
        this.loading = false;
      }
    },
    async addAccess(access: Access) {
      await accessesApi.addAccess(access);
      await this.fetchAccesses(access.projectId);
    },
    async updateAccess(access: Access) {
      await accessesApi.updateAccess(access);
      await this.fetchAccesses(access.projectId);
    },
    async deleteAccess(id: string, projectId: string) {
      await accessesApi.deleteAccess(id);
      await this.fetchAccesses(projectId);
    }
  }
}); 