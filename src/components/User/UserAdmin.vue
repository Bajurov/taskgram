<template>
  <div class="user-admin">
    <h2>Управление пользователями</h2>
    <form @submit.prevent="addUser">
      <input v-model="newUserId" placeholder="Telegram ID" required />
      <input v-model="newUserName" placeholder="Имя" required />
      <select v-model="newUserRole">
        <option value="manager">Руководитель</option>
        <option value="employee">Сотрудник</option>
      </select>
      <button type="submit">Добавить</button>
    </form>
    <table>
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
            <select v-model="user.role" @change="changeRole(user)">
              <option value="owner">Владелец</option>
              <option value="manager">Руководитель</option>
              <option value="employee">Сотрудник</option>
            </select>
          </td>
          <td>
            <button @click="removeUser(user.telegramId)" :disabled="user.role==='owner'">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <button @click="$emit('close')">Закрыть</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../../store/user';

const userStore = useUserStore();
const newUserId = ref('');
const newUserName = ref('');
const newUserRole = ref('employee');

const users = userStore.users;

function addUser() {
  if (!newUserId.value.trim() || !newUserName.value.trim()) return;
  userStore.addUser({
    id: newUserId.value,
    telegramId: newUserId.value,
    name: newUserName.value,
    role: newUserRole.value
  });
  newUserId.value = '';
  newUserName.value = '';
  newUserRole.value = 'employee';
}

function removeUser(telegramId: string) {
  userStore.removeUser(telegramId);
}

function changeRole(user: any) {
  userStore.setRole(user.telegramId, user.role);
}
</script>

<style scoped>
.user-admin {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  max-width: 600px;
  margin: 30px auto;
}
form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
th, td {
  border: 1px solid #eee;
  padding: 8px;
  text-align: left;
}
select, input {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background: #0088cc;
  color: #fff;
  cursor: pointer;
}
button[disabled] {
  background: #ccc;
  cursor: not-allowed;
}
</style> 