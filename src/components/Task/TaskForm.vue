<template>
  <form @submit.prevent="create" class="task-form-card">
    <input v-model="title" placeholder="Название" required />
    <textarea v-model="description" placeholder="Описание" required />
    <input v-model="deadline" type="date" required />
    <div class="form-group">
      <label>Исполнители</label>
      <div class="assignees-selection">
        <div v-for="user in usersList" :key="user.id">
          <input type="checkbox" :id="'assignee-' + user.id" :value="user.id" v-model="selectedAssignees" :disabled="selectedAssignees.length >= 3 && !selectedAssignees.includes(user.id)" />
          <label :for="'assignee-' + user.id">{{ user.name }} ({{ user.role }})</label>
        </div>
      </div>
    </div>
    <button type="submit" :disabled="loading">Создать задачу</button>
    <Spinner v-if="loading" />
  </form>
  <div v-if="formError" class="form-error">{{ formError }}</div>
  <div v-if="notifyMsg" class="notify">{{ notifyMsg }}</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTasksStore } from '../../store/tasks';
import { useUserStore } from '../../store/user';
import { useTaskAssigneesStore } from '../../store/taskAssignees';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '../User/Spinner.vue';

const props = defineProps<{ projectId: string }>();
const title = ref('');
const description = ref('');
const deadline = ref('');
const selectedAssignees = ref<string[]>([]);
const tasksStore = useTasksStore();
const userStore = useUserStore();
const taskAssigneesStore = useTaskAssigneesStore();
const formError = ref('');
const notifyMsg = ref('');
const loading = ref(false);

const usersList = computed(() => userStore.users.filter(u => u.role !== 'owner'));

async function create() {
  formError.value = '';
  notifyMsg.value = '';
  if (!title.value.trim()) {
    formError.value = 'Название не может быть пустым';
    return;
  }
  if (!description.value.trim()) {
    formError.value = 'Описание не может быть пустым';
    return;
  }
  if (!deadline.value) {
    formError.value = 'Укажите срок';
    return;
  }
  const today = new Date();
  const deadlineDate = new Date(deadline.value);
  today.setHours(0,0,0,0);
  if (deadlineDate < today) {
    formError.value = 'Срок не может быть в прошлом';
    return;
  }
  if (selectedAssignees.value.length === 0) {
    formError.value = 'Выберите хотя бы одного исполнителя';
    return;
  }
  try {
    loading.value = true;
    const taskId = uuidv4();
    await tasksStore.addTask({
      id: taskId,
      title: title.value,
      description: description.value,
      deadline: deadline.value,
      projectId: props.projectId,
      creatorId: userStore.currentUser!.id,
      status: 'new'
    });
    for (const userId of selectedAssignees.value) {
      await taskAssigneesStore.addAssignee(taskId, userId);
    }
    title.value = '';
    description.value = '';
    deadline.value = '';
    selectedAssignees.value = [];
    notifyMsg.value = 'Задача успешно создана!';
    setTimeout(() => notifyMsg.value = '', 2500);
  } catch (e) {
    formError.value = 'Ошибка при создании задачи: ' + (e?.message || e);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.task-form-card {
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
input, textarea, select {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1.5px solid #2e4e3f;
  background: #181c1f;
  color: #f5f6fa;
  font-size: 1rem;
  outline: none;
  transition: border 0.2s;
}
input:focus, textarea:focus, select:focus {
  border: 1.5px solid #b6ffb0;
}
button {
  min-width: 120px;
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
.assignees-selection {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 5px;
}
</style> 