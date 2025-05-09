<template>
  <div class="login-container">
    <h2>TASKgram</h2>
    <p v-if="!isDenied">Вход только по Telegram</p>
    <div v-else class="denied">
      <div>Доступ запрещён. Обратитесь к владельцу.</div>
      <div class="debug-info">
        <p><b>Debug info:</b></p>
        <p>Telegram ID: {{ debug.telegramId }}</p>
        <p>Supabase user: <pre>{{ debug.supabaseUser }}</pre></p>
        <p>Supabase error: <pre>{{ debug.supabaseError }}</pre></p>
        <p>Store error: <pre>{{ userStore.error }}</pre></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../store/user';
import { computed, ref, onMounted } from 'vue';
import { supabase } from '../api/supabaseClient';

const userStore = useUserStore();
const isDenied = computed(() => !userStore.currentUser);

const debug = ref({
  telegramId: '',
  supabaseUser: '',
  supabaseError: '',
});

onMounted(async () => {
  let telegramId = '';
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    telegramId = String(window.Telegram.WebApp.initDataUnsafe.user.id);
  }
  debug.value.telegramId = telegramId;
  if (telegramId) {
    const { data, error } = await supabase.from('users').select('*').eq('telegramId', telegramId).single();
    debug.value.supabaseUser = JSON.stringify(data, null, 2);
    debug.value.supabaseError = error ? JSON.stringify(error, null, 2) : '';
  }
});
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
.debug-info {
  background: #f8f8f8;
  color: #333;
  font-size: 12px;
  margin-top: 20px;
  padding: 10px;
  border-radius: 6px;
  text-align: left;
  word-break: break-all;
}
pre {
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
</style> 