<template>
  <div v-if="tasksStore.loading" class="loading">Загрузка задач...</div>
  <div v-else-if="task" class="task-container">
    <button class="back-btn" @click="goBack">← Назад к проекту</button>
    <div class="task-header">
      <div class="task-status" :class="task.status">
        {{ taskStatusLabels[task.status] }}
      </div>
      <h2>{{ task.title }}</h2>
    </div>
    <div class="task-meta">
      <div class="meta-item">
        <strong>Проект:</strong> {{ projectTitle }}
      </div>
      <div class="meta-item">
        <strong>Дедлайн:</strong> {{ formatDate(task.deadline) }}
      </div>
      <div class="meta-item">
        <strong>Постановщик:</strong> {{ getUsername(task.creatorid, true) }}
      </div>
      <div class="meta-item">
        <strong>Исполнители:</strong>
        <span v-if="task.assignees && task.assignees.length">
          {{ task.assignees.map(id => getUsername(id, true)).join(', ') }}
        </span>
        <span v-else>Не назначены</span>
      </div>
    </div>
    <div v-if="canChangeStatus" class="status-actions">
      <h3>Изменить статус</h3>
      <div class="status-buttons">
        <button 
          v-for="(label, status) in taskStatusLabels" 
          :key="status"
          :disabled="task.status === status"
          :class="[status, { active: task.status === status }]"
          @click="changeStatus(status)"
        >
          {{ label }}
        </button>
      </div>
    </div>
    <div class="task-description">
      <h3>Описание</h3>
      <p>{{ task.description }}</p>
    </div>
    <div v-if="canDelete" class="delete-task-action">
      <button class="delete-task-btn" @click="showDeletePopup = true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="12" fill="#ff6b6b"/>
          <path d="M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Удалить задачу
      </button>
    </div>
    <div v-if="showDeletePopup" class="delete-popup-overlay">
      <div class="delete-popup">
        <div class="delete-popup-title">Удалить задачу?</div>
        <div class="delete-popup-desc">Вы уверены, что хотите безвозвратно удалить задачу <b>{{ task.title }}</b>? Это действие нельзя отменить.</div>
        <div class="delete-popup-actions">
          <button @click="deleteTaskConfirmed" class="delete-confirm-btn">Удалить</button>
          <button @click="showDeletePopup = false" class="delete-cancel-btn">Отмена</button>
        </div>
      </div>
    </div>
    <div class="task-chat">
      <h3 class="chat-title">Обсуждение</h3>
      <div class="chat-messages">
        <div v-if="!task.comments || !task.comments.length" class="empty-chat">
          Нет сообщений. Будьте первым!
        </div>
        <div v-for="comment in task.comments" :key="comment.id" class="chat-message" :class="{ 'own-message': comment.authorid === userStore.currentUser?.id }">
          <div class="message-header">
            <strong>{{ getUsername(comment.authorid, true) }}</strong>
            <span class="message-time">{{ formatDateTime(comment.createdat) }}</span>
          </div>
          <div class="message-text">{{ comment.text }}</div>
        </div>
      </div>
      <div class="chat-input">
        <textarea v-model="newComment" placeholder="Напишите сообщение..." class="comment-textarea"></textarea>
        <button class="send-btn" @click="addComment">Отправить</button>
      </div>
    </div>
  </div>
  <div v-else class="loading">Задача не найдена</div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTasksStore } from '../store/tasks';
import { useProjectsStore } from '../store/projects';
import { onMounted, computed, ref } from 'vue';
import { users as mockUsers } from '../api/mockData';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const tasksStore = useTasksStore();
const projectsStore = useProjectsStore();

const newComment = ref('');
const showDeletePopup = ref(false);

onMounted(() => {
  tasksStore.fetchTasks();
  projectsStore.fetchProjects();
  userStore.fetchUsers();
});

const task = computed(() =>
  tasksStore.tasks.find(t => String(t.id) === String(route.params.id))
);

const projectTitle = computed(() => {
  if (!task.value) return '';
  const project = projectsStore.projects.find(p => p.id === task.value.projectid);
  return project ? project.title : task.value.projectid;
});

const taskStatusLabels = {
  'new': 'Новая задача',
  'in_progress': 'В работе',
  'done': 'Готова',
  'backlog': 'Беклог'
};

function getUsername(id, preferStore = false) {
  if (preferStore && userStore.users && userStore.users.length) {
    const user = userStore.users.find(u => u.id === id);
    if (user) return user.name;
  }
  const user = mockUsers.find(u => u.id === id);
  return user ? user.name : id;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ru-RU');
}

function formatDateTime(dateString) {
  try {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return dateString;
  }
}

function addComment() {
  if (!newComment.value.trim() || !task.value || !userStore.currentUser) return;
  if (!task.value.comments) task.value.comments = [];
  task.value.comments.push({
    id: Date.now().toString(),
    taskid: task.value.id,
    authorid: userStore.currentUser.id,
    text: newComment.value,
    createdat: new Date().toISOString()
  });
  newComment.value = '';
}

function changeStatus(status) {
  if (task.value && task.value.status !== status) {
    task.value.status = status;
    tasksStore.updateTask(task.value);
  }
}

const canChangeStatus = computed(() => {
  if (!task.value || !userStore.currentUser) return false;
  const isAssignee = task.value.assignees && task.value.assignees.includes(userStore.currentUser.id);
  const isCreator = task.value.creatorid === userStore.currentUser.id;
  const isManager = userStore.currentUser.role === 'manager' || userStore.currentUser.role === 'owner';
  return isAssignee || isCreator || isManager;
});

const canDelete = computed(() => {
  if (!task.value || !userStore.currentUser) return false;
  const isManager = userStore.currentUser.role === 'manager' || userStore.currentUser.role === 'owner';
  return isManager;
});

async function deleteTaskConfirmed() {
  if (!task.value) return;
  await tasksStore.deleteTask(task.value.id);
  showDeletePopup.value = false;
  router.push(`/project/${task.value.projectid}`);
}

function goBack() {
  if (task.value) {
    window.history.length > 1 ? window.history.back() : window.location.href = '/';
  }
}
</script>

<style scoped>
.task-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.task-header {
  margin-bottom: 20px;
}

.task-status {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

.task-status.new {
  background-color: #17a2b8;
  color: white;
}

.task-status.in_progress {
  background-color: #ffc107;
  color: black;
}

.task-status.done {
  background-color: #28a745;
  color: white;
}

.task-status.backlog {
  background-color: #6c757d;
  color: white;
}

.task-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.meta-item {
  color: #555;
}

.task-description {
  margin-bottom: 30px;
}

.task-description h3 {
  margin-bottom: 10px;
  color: #333;
}

.task-description p {
  color: #555;
  line-height: 1.5;
}

.task-chat {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.task-chat h3.chat-title {
  margin-bottom: 15px;
  color: #6c8e4e;
  font-size: 1.2em;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.empty-chat {
  color: #666;
  text-align: center;
  padding: 20px;
}

.chat-message {
  padding: 10px 14px;
  border-radius: 8px;
  background-color: #f1f1f1;
  max-width: 80%;
  font-size: 15px;
}

.own-message {
  background-color: #e3f2fd;
  align-self: flex-end;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.message-time {
  color: #777;
  font-size: 12px;
}

.message-text {
  line-height: 1.4;
}

.chat-input {
  display: flex;
  flex-direction: column;
  gap: 0;
  align-items: stretch;
  margin-top: 8px;
}

.comment-textarea {
  flex: 1;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-size: 15px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.send-btn {
  background: #234c2e;
  color: #b6ffb0;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  min-width: unset;
  height: 42px;
  margin-left: 0;
  align-self: flex-end;
}

.send-btn:hover {
  background: #3fa34d;
  color: #fff;
}

.loading {
  text-align: center;
  padding: 30px;
  color: #555;
}

.back-btn {
  margin-bottom: 15px;
  background: none;
  color: #0088cc;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  text-align: left;
}

.back-btn:hover {
  text-decoration: underline;
}

.status-actions {
  margin-bottom: 24px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}
.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}
.status-buttons button {
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.2s;
}
.status-buttons button:disabled {
  opacity: 0.7;
  cursor: default;
}
.status-buttons button.new {
  background-color: #17a2b8;
}
.status-buttons button.in_progress {
  background-color: #ffc107;
  color: black;
}
.status-buttons button.done {
  background-color: #28a745;
}
.status-buttons button.backlog {
  background-color: #6c757d;
}

.delete-task-action {
  margin: 18px 0 0 0;
  display: flex;
  justify-content: flex-end;
}
.delete-task-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}
.delete-task-btn:hover {
  background: #e53935;
}
.delete-popup-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-popup {
  background: #23282d;
  border-radius: 14px;
  padding: 32px 28px 24px 28px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.18);
  max-width: 400px;
  color: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.delete-popup-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff6b6b;
}
.delete-popup-desc {
  font-size: 1.05rem;
  color: #eaffd0;
}
.delete-popup-actions {
  display: flex;
  gap: 18px;
  justify-content: flex-end;
}
.delete-confirm-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-confirm-btn:hover {
  background: #e53935;
}
.delete-cancel-btn {
  background: #2e4e3f;
  color: #b6ffb0;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-cancel-btn:hover {
  background: #3a6650;
}
</style>