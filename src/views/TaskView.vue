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
        <strong>Постановщик:</strong> {{ getUsername(task.creatorid) }}
      </div>
      <div class="meta-item">
        <strong>Исполнители:</strong>
        <span v-if="task.assignees && task.assignees.length">
          {{ task.assignees.map(id => getUsername(id, true)).join(', ') }}
        </span>
        <span v-else>Не назначены</span>
      </div>
    </div>
    <div class="task-description">
      <h3>Описание</h3>
      <p>{{ task.description }}</p>
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
import { useRoute } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTasksStore } from '../store/tasks';
import { useProjectsStore } from '../store/projects';
import { onMounted, computed, ref } from 'vue';
import { users as mockUsers } from '../api/mockData';

const route = useRoute();
const userStore = useUserStore();
const tasksStore = useTasksStore();
const projectsStore = useProjectsStore();

const newComment = ref('');

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
</style>