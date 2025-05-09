<template>
  <form @submit.prevent="create" class="task-form-card">
    <div class="form-group">
      <label class="form-label">Название</label>
      <input v-model="title" placeholder="Введите название задачи" required />
    </div>
    <div class="form-group">
      <label class="form-label">Описание</label>
      <textarea v-model="description" placeholder="Введите описание задачи" required />
    </div>
    <div class="form-group">
      <label class="form-label">Срок выполнения</label>
      <input v-model="deadline" type="date" :min="minDate" required />
    </div>
    <div class="form-group">
      <label class="form-label">Исполнители (до 3-х человек)</label>
      <div class="assignees-selection">
        <div v-for="user in usersList" :key="user.id" class="assignee-item">
          <input 
            type="checkbox" 
            :id="'assignee-' + user.id" 
            :value="user.id" 
            v-model="selectedAssignees" 
            :disabled="selectedAssignees.length >= 3 && !selectedAssignees.includes(user.id)" 
          />
          <label :for="'assignee-' + user.id" class="assignee-label">
            {{ user.name }} ({{ user.role }})
          </label>
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

const emit = defineEmits<{
  (e: 'task-added'): void;
}>();

const props = defineProps<{ projectid: string }>();
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

// Вычисляем минимальную дату (сегодня)
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

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
    const taskid = uuidv4();
    await tasksStore.addTask({
      id: taskid,
      title: title.value,
      description: description.value,
      deadline: deadline.value,
      projectid: props.projectid,
      creatorid: userStore.currentUser!.id,
      status: 'new'
    });
    for (const userid of selectedAssignees.value) {
      await taskAssigneesStore.addAssignee(taskid, userid);
    }
    title.value = '';
    description.value = '';
    deadline.value = '';
    selectedAssignees.value = [];
    notifyMsg.value = 'Задача успешно создана!';
    setTimeout(() => {
      notifyMsg.value = '';
      emit('task-added');
    }, 2500);
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: #b6ffb0;
  font-weight: 500;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label::after {
  content: '*';
  color: #ff6b6b;
  font-size: 1.2rem;
}

input, textarea, select {
  padding: 12px;
  border-radius: 8px;
  border: 1.5px solid #2e4e3f;
  background: #181c1f;
  color: #f5f6fa;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s;
}

input:hover, textarea:hover, select:hover {
  border-color: #3a6650;
}

input:focus, textarea:focus, select:focus {
  border-color: #b6ffb0;
  box-shadow: 0 0 0 2px rgba(182, 255, 176, 0.2);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

button {
  min-width: 120px;
  padding: 12px 24px;
  background: #2e4e3f;
  color: #b6ffb0;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

button:hover {
  background: #3a6650;
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

button[disabled] {
  background: #2e4e3f;
  color: #b6ffb0aa;
  cursor: not-allowed;
  transform: none;
}

.form-error {
  color: #ff6b6b;
  margin-bottom: 10px;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  font-size: 0.95rem;
}

.notify {
  color: #388e3c;
  background: #e8f5e9;
  border: 1px solid #c8e6c9;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.assignees-selection {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
  background: #181c1f;
  padding: 16px;
  border-radius: 8px;
  border: 1.5px solid #2e4e3f;
  transition: all 0.2s;
}

.assignees-selection:hover {
  border-color: #3a6650;
}

.assignee-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.assignee-item:hover {
  background: rgba(182, 255, 176, 0.1);
}

.assignee-label {
  color: #f5f6fa;
  cursor: pointer;
  font-size: 0.95rem;
  flex: 1;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #b6ffb0;
  border-radius: 4px;
}

input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 