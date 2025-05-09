<template>
  <div v-if="task" class="task-container">
    <button class="back-btn" @click="goBack">← Назад к проекту</button>
    <div class="task-header">
      <div class="task-status" :class="task.status">
        {{ taskStatusLabels[task.status] }}
      </div>
      <h2>{{ task.title }}</h2>
    </div>
    
    <div class="task-meta">
      <div class="meta-item">
        <strong>Проект:</strong> {{ projectName }}
      </div>
      <div class="meta-item">
        <strong>Дедлайн:</strong> {{ formatDate(task.deadline) }}
      </div>
      <div class="meta-item">
        <strong>Постановщик:</strong> {{ getUsername(task.creatorid) }}
      </div>
      <div class="meta-item">
        <strong>Исполнители:</strong> 
        <span v-if="task.assignees.length">
          {{ task.assignees.map(id => getUsername(id)).join(', ') }}
        </span>
        <span v-else>Не назначены</span>
      </div>
    </div>
    
    <div class="task-description">
      <h3>Описание</h3>
      <p>{{ task.description }}</p>
    </div>
    
    <div class="task-actions" v-if="canEdit || canChangeStatus">
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
      
      <div v-if="canEdit" class="delete-action">
        <button class="delete-button" @click="confirmDelete = true">
          Удалить задачу
        </button>
        
        <div v-if="confirmDelete" class="confirm-delete">
          <p>Вы уверены, что хотите удалить задачу?</p>
          <div class="confirm-buttons">
            <button @click="deleteTask">Да, удалить</button>
            <button @click="confirmDelete = false">Отмена</button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="task-chat">
      <h3>Обсуждение</h3>
      
      <div class="chat-messages">
        <div v-if="!task.comments.length" class="empty-chat">
          Нет сообщений. Будьте первым!
        </div>
        <div 
          v-for="comment in task.comments" 
          :key="comment.id" 
          class="chat-message"
          :class="{ 'own-message': comment.authorid === userStore.currentUser?.id }"
        >
          <div class="message-header">
            <strong>{{ getUsername(comment.authorid) }}</strong>
            <span class="message-time">{{ formatDateTime(comment.createdAt) }}</span>
          </div>
          <div class="message-text">{{ comment.text }}</div>
        </div>
      </div>
      
      <div class="chat-input">
        <textarea 
          v-model="newComment" 
          placeholder="Напишите сообщение..." 
          @keyup.enter="addComment"
        ></textarea>
        <button @click="addComment">Отправить</button>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    Загрузка задачи...
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTasksStore } from '../store/tasks';
import { useUserStore } from '../store/user';
import { useProjectsStore } from '../store/projects';
import { users } from '../api/mockData';

const router = useRouter();
const route = useRoute();
const tasksStore = useTasksStore();
const userStore = useUserStore();
const projectsStore = useProjectsStore();

const newComment = ref('');
const confirmDelete = ref(false);

const task = computed(() => 
  tasksStore.tasks.find(t => t.id === route.params.id)
);

const projectName = computed(() => {
  if (!task.value) return '';
  const project = projectsStore.projects.find(p => p.id === task.value?.projectid);
  return project ? project.title : '';
});

const canEdit = computed(() => {
  if (!task.value || !userStore.currentUser) return false;
  
  const isCreator = task.value.creatorid === userStore.currentUser.id;
  const isManager = userStore.isManager;
  
  return isCreator || isManager;
});

const canChangeStatus = computed(() => {
  if (!task.value || !userStore.currentUser) return false;
  
  const isAssignee = task.value.assignees.includes(userStore.currentUser.id);
  const isCreator = task.value.creatorid === userStore.currentUser.id;
  const isManager = userStore.isManager;
  
  return isAssignee || isCreator || isManager;
});

const taskStatusLabels = {
  'new': 'Новая задача',
  'in_progress': 'В работе',
  'done': 'Готова',
  'backlog': 'Беклог'
};

function getUsername(id: string): string {
  const user = users.find(u => u.id === id);
  return user ? user.name : 'Неизвестный пользователь';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ru-RU');
}

function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return dateString;
  }
}

function changeStatus(status: 'new' | 'in_progress' | 'done' | 'backlog') {
  if (task.value) {
    tasksStore.changeTaskStatus(task.value.id, status);
  }
}

function addComment() {
  if (!newComment.value.trim() || !task.value || !userStore.currentUser) return;
  
  tasksStore.addComment(task.value.id, {
    taskId: task.value.id,
    authorid: userStore.currentUser.id,
    text: newComment.value
  });
  
  newComment.value = '';
}

function deleteTask() {
  if (!task.value) return;
  
  tasksStore.deleteTask(task.value.id);
  router.push('/');
}

function goBack() {
  if (task.value) {
    router.push(`/project/${task.value.projectid}`);
  } else {
    router.push('/');
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

.task-actions {
  margin-bottom: 30px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.status-actions h3 {
  margin-bottom: 10px;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.status-buttons button {
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
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

.delete-action {
  margin-top: 20px;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.confirm-delete {
  margin-top: 10px;
  padding: 15px;
  background-color: #f8d7da;
  border-radius: 4px;
  color: #721c24;
}

.confirm-buttons {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.confirm-buttons button:first-child {
  background-color: #dc3545;
  color: white;
}

.task-chat {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.task-chat h3 {
  margin-bottom: 15px;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-chat {
  color: #666;
  text-align: center;
  padding: 20px;
}

.chat-message {
  padding: 12px;
  border-radius: 8px;
  background-color: #f1f1f1;
  max-width: 80%;
}

.own-message {
  background-color: #e3f2fd;
  align-self: flex-end;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.message-time {
  color: #777;
}

.message-text {
  line-height: 1.4;
}

.chat-input {
  display: flex;
  gap: 10px;
}

.chat-input textarea {
  flex: 1;
  height: 80px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
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