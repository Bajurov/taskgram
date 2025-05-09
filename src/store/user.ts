import { defineStore } from 'pinia';
import { User } from '../types';
import { users as defaultUsers } from '../api/mockData';

function loadUsers(): User[] {
  const saved = localStorage.getItem('users');
  if (saved) return JSON.parse(saved);
  return [...defaultUsers];
}

function saveUsers(users: User[]) {
  localStorage.setItem('users', JSON.stringify(users));
}

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
    users: loadUsers()
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
        saveUsers(this.users);
      }
    },
    removeUser(telegramId: string) {
      this.users = this.users.filter(u => u.telegramId !== telegramId);
      saveUsers(this.users);
      if (this.currentUser?.telegramId === telegramId) {
        this.logout();
      }
    },
    setRole(telegramId: string, role: string) {
      const user = this.users.find(u => u.telegramId === telegramId);
      if (user) user.role = role as any;
      saveUsers(this.users);
    }
  }
}); 