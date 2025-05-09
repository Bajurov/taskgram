<template>
  <div class="app-container">
    <header v-if="userStore.currentUser" class="app-header">
      <h1>TASKgram</h1>
      <div class="user-info">
        <span>{{ userStore.currentUser.name }}</span>
        <button v-if="userStore.isOwner" @click="showUsers = !showUsers">Пользователи</button>
        <button @click="logout">Выйти</button>
      </div>
    </header>
    <main>
      <UserAdmin v-if="showUsers && userStore.isOwner" @close="showUsers = false" />
      <router-view v-else />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from './store/user';
import { useRouter } from 'vue-router';
import UserAdmin from './components/User/UserAdmin.vue';

const userStore = useUserStore();
const router = useRouter();
const showUsers = ref(false);

function logout() {
  userStore.logout();
  router.push('/login');
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', 'SF Pro Display', 'SF Pro Icons', 'Avenir Next', 'system-ui', '-apple-system', BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  background: #181c1f;
  color: #f5f6fa;
  letter-spacing: 0.01em;
}

.app-container {
  max-width: 100vw;
  min-height: 100vh;
  background: #181c1f;
}

.app-header {
  background: linear-gradient(90deg, #1e2a22 0%, #1a3c2b 100%);
  color: #fff;
  padding: 18px 24px 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.18);
  border-bottom: 1.5px solid #22332a;
}

.app-header h1 {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #b6ffb0;
  text-shadow: 0 2px 8px #0a1a0e44;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #e0ffe0;
}

button {
  background: linear-gradient(90deg, #2e4e3f 0%, #1a3c2b 100%);
  color: #b6ffb0;
  border: none;
  border-radius: 18px;
  padding: 10px 22px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 #0a1a0e22;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

button:hover {
  background: linear-gradient(90deg, #3fa34d 0%, #1a3c2b 100%);
  color: #fff;
  box-shadow: 0 4px 16px 0 #0a1a0e44;
}

main {
  padding: 32px 0 0 0;
  min-height: 80vh;
  max-width: 600px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .app-header, .user-info {
    flex-direction: column !important;
    align-items: stretch !important;
  }
  button, input, select, textarea {
    width: 100% !important;
    box-sizing: border-box;
    margin-bottom: 10px;
  }
  main {
    padding: 5px 0 0 0;
  }
}
</style> 