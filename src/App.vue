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
  font-family: 'Roboto', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  max-width: 100%;
  min-height: 100vh;
}

.app-header {
  background-color: #0088cc;
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

button {
  background-color: #0077b6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

button:hover {
  background-color: #006199;
}

main {
  padding: 20px;
}
</style> 