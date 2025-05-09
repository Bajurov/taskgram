<template>
  <div class="app-container">
    <header v-if="userStore.currentUser" class="app-header-table">
      <div class="header-table">
        <div class="header-row">
          <div class="header-cell header-title-cell">
            <img src="@/media/logo.png" alt="TASKgram logo" class="app-logo" />
          </div>
          <div class="header-cell header-btn-cell">
            <button v-if="userStore.isOwner" class="icon-btn" @click="showUsers = !showUsers" title="Пользователи">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#b6ffb0" stroke-width="2"/><path d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" stroke="#b6ffb0" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="header-cell header-btn-cell">
            <button class="icon-btn" @click="logout" title="Выйти">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5" stroke="#b6ffb0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12H9" stroke="#b6ffb0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 19v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" stroke="#b6ffb0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
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

.app-header-table {
  background: linear-gradient(90deg, #1e2a22 0%, #1a3c2b 100%);
  color: #fff;
  padding: 8px 18px 6px 18px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.18);
  border-bottom: 1.5px solid #22332a;
  min-height: 48px;
}

.header-table {
  display: table;
  width: 100%;
  height: 100%;
}

.header-row {
  display: table-row;
}

.header-cell {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.header-title-cell {
  width: 60%;
  text-align: left;
}

.header-btn-cell {
  width: 20%;
}

.header-title-cell h1 {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #b6ffb0;
  text-shadow: 0 2px 8px #0a1a0e44, 0 0 2px #000;
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  border-radius: 50%;
  padding: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: #2e4e3f;
}

button {
  background: linear-gradient(90deg, #2e4e3f 0%, #1a3c2b 100%);
  color: #b6ffb0;
  border: none;
  border-radius: 16px;
  padding: 7px 16px;
  font-size: 0.98rem;
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
  padding: 24px 0 0 0;
  min-height: 80vh;
  max-width: 600px;
  margin: 0 auto;
}

h2, h3, h4, h5 {
  color: #eaffd0;
  text-shadow: 0 2px 8px #0a1a0e44, 0 0 2px #000;
  font-weight: 700;
}

@media (max-width: 600px) {
  .app-header-table, .header-table, .header-row, .header-cell {
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

.app-logo {
  height: 44px;
  width: 44px;
  border-radius: 50%;
  object-fit: cover;
  display: inline-block;
  vertical-align: middle;
}
</style> 