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
    <!-- ВРЕМЕННО для отладки -->
    <pre style="background:#f8f8f8; color:#333; padding:8px; border-radius:4px; font-size:12px;">task: {{ task }}
tasks ids: {{ tasksStore.tasks.map(t => t.id) }}
route id: {{ route.params.id }}
user: {{ userStore.currentUser }}</pre>
    <!-- /ВРЕМЕННО -->
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#ffd6d6"/>
            <path d="M8 8l8 8M16 8l-8 8" stroke="#d32f2f" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <div v-if="confirmDelete" class="custom-confirm-popup">
          <div class="popup-content">
            <p>Вы уверены, что хотите удалить задачу?</p>
            <div class="popup-buttons">
              <button class="confirm-btn" @click="deleteTask">Удалить</button>
              <button class="cancel-btn" @click="confirmDelete = false">Отмена</button>
            </div>
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
            <span class="message-time">{{ formatDateTime(comment.createdat) }}</span>
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
  <div v-else class="loading">Задача не найдена</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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
  tasksStore.tasks.find(t => String(t.id) === String(route.params.id))
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
    taskid: task.value.id,
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

onMounted(async () => {
  await Promise.all([
    tasksStore.fetchTasks(),
    projectsStore.fetchProjects()
  ]);
});
</script>