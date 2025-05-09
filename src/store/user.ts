import { defineStore } from 'pinia';
import { User } from '../types';
import * as usersApi from '../api/usersApi';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    users: [] as User[],
    loading: false as boolean,
    error: null as string | null
  }),
  getters: {
    isOwner: (state) => state.currentUser?.role === 'owner',
    isManager: (state) => state.currentUser?.role === 'manager' || state.currentUser?.role === 'owner',
    isEmployee: (state) => state.currentUser?.role === 'employee',
    allowedTelegramIds: (state) => state.users.map(u => u.telegramId)
  },
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        this.users = await usersApi.getUsers();
        this.error = null;
      } catch (e: any) {
        this.error = e.message || 'Ошибка загрузки пользователей';
      } finally {
        this.loading = false;
      }
    },
    async loginByTelegramId(telegramId: string) {
      this.loading = true;
      try {
        const user = await usersApi.getUserByTelegramId(telegramId);
        this.currentUser = user;
        this.error = null;
      } catch (e: any) {
        this.currentUser = null;
        this.error = e.message || 'Нет доступа';
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.currentUser = null;
    },
    async addUser(user: User) {
      await usersApi.addUser(user);
      await this.fetchUsers();
    },
    async removeUser(telegramId: string) {
      await usersApi.removeUser(telegramId);
      await this.fetchUsers();
      if (this.currentUser?.telegramId === telegramId) {
        this.logout();
      }
    },
    async setRole(telegramId: string, role: string) {
      await usersApi.setRole(telegramId, role);
      await this.fetchUsers();
    }
  }
}); 