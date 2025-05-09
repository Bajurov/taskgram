<template>
  <form @submit.prevent="create" class="access-form-card">
    <div class="form-group">
      <label class="form-label">URL сервиса</label>
      <input v-model="url" placeholder="https://example.com" required />
    </div>
    <div class="form-group">
      <label class="form-label">Логин</label>
      <input v-model="login" placeholder="Введите логин" required />
    </div>
    <div class="form-group">
      <label class="form-label">Пароль</label>
      <input v-model="password" type="password" placeholder="Введите пароль" required />
    </div>
    <div class="form-group">
      <label class="form-label">Комментарий</label>
      <textarea v-model="comment" placeholder="Дополнительная информация" />
    </div>
    <button type="submit" :disabled="loading">Сохранить доступ</button>
    <Spinner v-if="loading" />
  </form>
  <div v-if="formError" class="form-error">{{ formError }}</div>
  <div v-if="notifyMsg" class="notify">{{ notifyMsg }}</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAccessStore } from '../../store/access';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '../User/Spinner.vue';

const emit = defineEmits<{
  (e: 'access-added'): void;
}>();

const props = defineProps<{ projectId: string }>();
const url = ref('');
const login = ref('');
const password = ref('');
const comment = ref('');
const accessStore = useAccessStore();
const formError = ref('');
const notifyMsg = ref('');
const loading = ref(false);

async function create() {
  formError.value = '';
  notifyMsg.value = '';
  
  if (!url.value.trim()) {
    formError.value = 'URL не может быть пустым';
    return;
  }
  if (!login.value.trim()) {
    formError.value = 'Логин не может быть пустым';
    return;
  }
  if (!password.value.trim()) {
    formError.value = 'Пароль не может быть пустым';
    return;
  }
  
  try {
    loading.value = true;
    await accessStore.addAccess({
      id: uuidv4(),
      url: url.value,
      login: login.value,
      password: password.value,
      comment: comment.value,
      projectId: props.projectId
    });
    
    url.value = '';
    login.value = '';
    password.value = '';
    comment.value = '';
    notifyMsg.value = 'Доступ успешно сохранен!';
    setTimeout(() => {
      notifyMsg.value = '';
      emit('access-added');
    }, 2500);
  } catch (e) {
    formError.value = 'Ошибка при сохранении доступа: ' + (e?.message || e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.access-form-card {
  background: #23282d;
  padding: 28px 24px 18px 24px;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  max-width: 600px;
  margin: 30px auto;
  color: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #b6ffb0;
  font-weight: 500;
  font-size: 1.1rem;
}

input, textarea {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid #2e4e3f;
  background: #181c1f;
  color: #f5f6fa;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}

input:focus, textarea:focus {
  border: 1.5px solid #b6ffb0;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

button {
  min-width: 120px;
  padding: 10px 20px;
  background: #2e4e3f;
  color: #b6ffb0;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background: #3a6650;
}

button[disabled] {
  background: #2e4e3f;
  color: #b6ffb0aa;
  cursor: not-allowed;
}

.form-error {
  color: #ff6b6b;
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
}

.notify {
  color: #388e3c;
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
}
</style> 