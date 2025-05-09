<template>
  <div class="login-container">
    <h2>TASKgram</h2>
    <p v-if="!isDenied">Вход только по Telegram</p>
    <p v-else class="denied">Доступ запрещён. Обратитесь к владельцу.</p>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../store/user';
import { computed } from 'vue';

const userStore = useUserStore();
const isDenied = computed(() => !userStore.currentUser);
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

h2 {
  color: #0088cc;
  margin-bottom: 10px;
}

.denied {
  color: #e63946;
  font-weight: bold;
  margin-top: 30px;
}
</style> 