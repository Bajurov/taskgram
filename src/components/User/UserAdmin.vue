<template>
  <div class="user-admin">
    <h2>Управление пользователями</h2>
    <form @submit.prevent="addUser" v-if="userStore.isManager">
      <input v-model="newUserId" placeholder="Telegram ID" required />
      <input v-model="newUserName" placeholder="Имя" required />
      <select v-model="newUserRole">
        <option value="manager">Руководитель</option>
        <option value="employee">Сотрудник</option>
      </select>
      <button type="submit" :disabled="loading">Добавить</button>
    </form>
    <div v-if="formError" class="form-error">{{ formError }}</div>
    <div v-if="notifyMsg" class="notify">{{ notifyMsg }}</div>
    <Spinner v-if="usersLoading || loading" />
    <table v-else-if="userStore.isManager">
      <thead>
        <tr>
          <th>Telegram ID</th>
          <th>Имя</th>
          <th>Роль</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.telegramId">
          <td>{{ user.telegramId }}</td>
          <td>{{ user.name }}</td>
          <td>
            <select v-model="user.role" @change="changeRole(user)" :disabled="loading || user.role === 'owner'">
              <option value="owner">Владелец</option>
              <option value="manager">Руководитель</option>
              <option value="employee">Сотрудник</option>
            </select>
          </td>
          <td>
            <button @click="removeUser(user.telegramId)" :disabled="user.role==='owner'||loading">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="no-access">
      У вас нет доступа к управлению пользователями
    </div>
    <button @click="$emit('close')" :disabled="loading">Закрыть</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '../../store/user';
import Spinner from './Spinner.vue';

const userStore = useUserStore();
const newUserId = ref('');
const newUserName = ref('');
const newUserRole = ref('employee');
const formError = ref('');
const notifyMsg = ref('');
const loading = ref(false);
const usersLoading = ref(true);

onMounted(async () => {
  usersLoading.value = true;
  await userStore.fetchUsers();
  usersLoading.value = false;
});

const users = userStore.users;

async function addUser() {
  formError.value = '';
  notifyMsg.value = '';
  if (!/^\d+$/.test(newUserId.value.trim())) {
    formError.value = 'Telegram ID должен быть числом';
    return;
  }
  if (!newUserName.value.trim()) {
    formError.value = 'Имя не может быть пустым';
    return;
  }
  if (!['manager', 'employee'].includes(newUserRole.value)) {
    formError.value = 'Выберите роль';
    return;
  }
  try {
    loading.value = true;
    await userStore.addUser({
      id: newUserId.value,
      telegramId: newUserId.value,
      name: newUserName.value,
      role: newUserRole.value
    });
    newUserId.value = '';
    newUserName.value = '';
    newUserRole.value = 'employee';
    notifyMsg.value = 'Пользователь успешно добавлен!';
    setTimeout(() => notifyMsg.value = '', 2500);
    await userStore.fetchUsers();
  } catch (e) {
    formError.value = 'Ошибка при добавлении пользователя: ' + (e?.message || e);
  } finally {
    loading.value = false;
  }
}

async function removeUser(telegramId: string) {
  formError.value = '';
  notifyMsg.value = '';
  try {
    loading.value = true;
    await userStore.removeUser(telegramId);
    notifyMsg.value = 'Пользователь удалён';
    setTimeout(() => notifyMsg.value = '', 2500);
    await userStore.fetchUsers();
  } catch (e) {
    formError.value = 'Ошибка при удалении пользователя: ' + (e?.message || e);
  } finally {
    loading.value = false;
  }
}

async function changeRole(user: any) {
  formError.value = '';
  notifyMsg.value = '';
  try {
    loading.value = true;
    await userStore.setRole(user.telegramId, user.role);
    notifyMsg.value = 'Роль обновлена';
    setTimeout(() => notifyMsg.value = '', 2500);
    await userStore.fetchUsers();
  } catch (e) {
    formError.value = 'Ошибка при смене роли: ' + (e?.message || e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.user-admin {
  background: #23282d;
  padding: 28px 24px 18px 24px;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  max-width: 600px;
  margin: 30px auto;
  color: #f5f6fa;
}
form {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  margin-bottom: 20px;
  background: #181c1f;
  border-radius: 12px;
  box-shadow: 0 2px 8px #0a1a0e22;
}
th, td {
  border: none;
  padding: 12px 10px;
  text-align: left;
  font-size: 1.05rem;
}
th {
  color: #b6ffb0;
  font-weight: 700;
  background: #23282d;
}
td {
  background: #23282d;
  border-radius: 8px;
}
select, input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid #2e4e3f;
  background: #181c1f;
  color: #f5f6fa;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
select:focus, input:focus {
  border: 1.5px solid #b6ffb0;
}
button {
  min-width: 90px;
}
button[disabled] {
  background: #2e4e3f;
  color: #b6ffb0aa;
  cursor: not-allowed;
}
.form-error {
  color: #ff6b6b;
  margin-bottom: 10px;
}
.notify {
  color: #388e3c;
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 10px;
}
.no-access {
  color: #ff6b6b;
  margin-bottom: 10px;
}
</style> 