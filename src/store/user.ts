import { defineStore } from 'pinia';
import { User } from '../types';
import { users } from '../api/mockData';

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    users: [...users] as User[]
  }),
  getters: {
    isOwner: (state) => state.currentUser?.role === 'owner',
    isManager: (state) => state.currentUser?.role === 'manager' || state.currentUser?.role === 'owner',
    isEmployee: (state) => state.currentUser?.role === 'employee',
    allowedTelegramIds: (state) => state.users.map(u => u.telegramId)
  },
  actions: {
    loginByTelegramId(telegramId: string) {
      this.currentUser = this.users.find(u => u.telegramId === telegramId) || null;
    },
    logout() {
      this.currentUser = null;
    },
    addUser(user: User) {
      if (!this.users.find(u => u.telegramId === user.telegramId)) {
        this.users.push(user);
      }
    },
    removeUser(telegramId: string) {
      this.users = this.users.filter(u => u.telegramId !== telegramId);
      if (this.currentUser?.telegramId === telegramId) {
        this.logout();
      }
    },
    setRole(telegramId: string, role: string) {
      const user = this.users.find(u => u.telegramId === telegramId);
      if (user) user.role = role as any;
    }
  }
}); 