import { defineStore } from 'pinia';
import { Access } from '../types';
import { accesses } from '../api/mockData';

export const useAccessStore = defineStore('access', {
  state: () => ({
    accesses: [...accesses] as Access[]
  }),
  getters: {
    getAccessesByProject: (state) => (projectId: string) => 
      state.accesses.filter(a => a.projectId === projectId)
  },
  actions: {
    addAccess(access: Access) {
      this.accesses.push(access);
    },
    updateAccess(access: Access) {
      const idx = this.accesses.findIndex(a => a.id === access.id);
      if (idx !== -1) this.accesses[idx] = access;
    },
    deleteAccess(id: string) {
      this.accesses = this.accesses.filter(a => a.id !== id);
    }
  }
}); 