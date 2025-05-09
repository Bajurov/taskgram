<template>
  <div v-if="project" class="project-view">
    <div class="project-header">
      <h2>{{ project.title }}</h2>
      <div class="status-badge" :class="project.status">
        {{ project.status === 'active' ? 'Активный' : 'Архив' }}
      </div>
    </div>
    
    <p class="project-description">{{ project.description }}</p>
    
    <div class="action-buttons" v-if="userStore.isManager">
      <button v-if="project.status === 'active'" @click="archiveProject">
        Архивировать
      </button>
      <button v-else @click="activateProject">
        Активировать
      </button>
    </div>
    
    <div class="project-content">
      <div class="tasks-section">
        <div class="section-header">
          <h3>Задачи</h3>
          <button v-if="userStore.isManager" @click="showTaskForm = !showTaskForm">
            {{ showTaskForm ? 'Отмена' : 'Добавить задачу' }}
          </button>
        </div>
        
        <div v-if="showTaskForm" class="add-task-form">
          <div class="form-group">
            <label for="task-title">Название</label>
            <input type="text" id="task-title" v-model="newTask.title" placeholder="Название задачи">
          </div>
          <div class="form-group">
            <label for="task-description">Описание</label>
            <textarea id="task-description" v-model="newTask.description" placeholder="Описание задачи"></textarea>
          </div>
          <div class="form-group">
            <label for="task-deadline">Дедлайн</label>
            <input type="date" id="task-deadline" v-model="newTask.deadline">
          </div>
          <div class="form-group">
            <label>Исполнители</label>
            <div class="assignees-selection">
              <div 
                v-for="user in employees" 
                :key="user.id"
                class="assignee-option"
                :class="{ selected: selectedAssignees.includes(user.id) }"
                @click="toggleAssignee(user.id)"
              >
                {{ user.name }}
              </div>
            </div>
          </div>
          <button @click="addTask">Создать задачу</button>
        </div>
        
        <div class="tasks-list">
          <div v-if="filteredTasks.length === 0" class="empty-message">
            Нет задач
          </div>
          <div 
            v-for="task in filteredTasks" 
            :key="task.id" 
            class="task-card"
            @click="navigateToTask(task.id)"
          >
            <div class="task-status" :class="task.status">
              {{ taskStatusLabels[task.status] }}
            </div>
            <div class="task-title">{{ task.title }}</div>
            <div class="task-details">
              <div>Дедлайн: {{ formatDate(task.deadline) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="userStore.isManager" class="accesses-section">
        <div class="section-header">
          <h3>Доступы</h3>
          <button @click="showAccessForm = !showAccessForm">
            {{ showAccessForm ? 'Отмена' : 'Добавить доступ' }}
          </button>
        </div>
        
        <div v-if="showAccessForm" class="add-access-form">
          <div class="form-group">
            <label for="url">URL</label>
            <input type="text" id="url" v-model="newAccess.url" placeholder="URL сервиса">
          </div>
          <div class="form-group">
            <label for="login">Логин</label>
            <input type="text" id="login" v-model="newAccess.login" placeholder="Логин">
          </div>
          <div class="form-group">
            <label for="password">Пароль</label>
            <input type="text" id="password" v-model="newAccess.password" placeholder="Пароль">
          </div>
          <div class="form-group">
            <label for="comment">Комментарий</label>
            <textarea id="comment" v-model="newAccess.comment" placeholder="Комментарий"></textarea>
          </div>
          <button @click="addAccess">Добавить доступ</button>
        </div>
        
        <div class="accesses-list">
          <div v-if="projectAccesses.length === 0" class="empty-message">
            Нет доступов
          </div>
          <div v-for="access in projectAccesses" :key="access.id" class="access-card">
            <div class="access-url">{{ access.url }}</div>
            <div class="access-credentials">
              <div><strong>Логин:</strong> {{ access.login }}</div>
              <div><strong>Пароль:</strong> {{ access.password }}</div>
            </div>
            <div class="access-comment" v-if="access.comment">
              {{ access.comment }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">
    Загрузка проекта...
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProjectsStore } from '../store/projects';
import { useTasksStore } from '../store/tasks';
import { useAccessStore } from '../store/access';
import { useUserStore } from '../store/user';
import { users } from '../api/mockData';

const router = useRouter();
const route = useRoute();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const accessStore = useAccessStore();
const userStore = useUserStore();

const showTaskForm = ref(false);
const showAccessForm = ref(false);
const selectedAssignees = ref<string[]>([]);

const newTask = ref({
  title: '',
  description: '',
  deadline: ''
});

const newAccess = ref({
  url: '',
  login: '',
  password: '',
  comment: ''
});

const project = computed(() => 
  projectsStore.projects.find(p => p.id === route.params.id)
);

const filteredTasks = computed(() => {
  if (userStore.currentUser?.role === 'employee') {
    return tasksStore.getTasksByProject(route.params.id as string)
      .filter(t => t.assignees.includes(userStore.currentUser?.id || ''));
  }
  return tasksStore.getTasksByProject(route.params.id as string);
});

const projectAccesses = computed(() => 
  accessStore.getAccessesByProject(route.params.id as string)
);

const employees = computed(() => 
  users.filter(u => u.role === 'employee')
);

const taskStatusLabels = {
  'new': 'Новая задача',
  'in_progress': 'В работе',
  'done': 'Готова',
  'backlog': 'Беклог'
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}

function navigateToTask(id: string) {
  router.push(`/task/${id}`);
}

function archiveProject() {
  if (project.value) {
    projectsStore.archiveProject(project.value.id);
  }
}

function activateProject() {
  if (project.value) {
    projectsStore.activateProject(project.value.id);
  }
}

function toggleAssignee(userId: string) {
  const index = selectedAssignees.value.indexOf(userId);
  if (index === -1) {
    if (selectedAssignees.value.length < 3) {
      selectedAssignees.value.push(userId);
    }
  } else {
    selectedAssignees.value.splice(index, 1);
  }
}

function addTask() {
  if (!newTask.value.title.trim() || !newTask.value.deadline) return;
  
  tasksStore.addTask({
    id: Date.now().toString(),
    title: newTask.value.title,
    description: newTask.value.description,
    deadline: newTask.value.deadline,
    projectId: route.params.id as string,
    creatorId: userStore.currentUser?.id || '',
    assignees: selectedAssignees.value,
    status: 'new',
    comments: []
  });
  
  // Сброс формы
  newTask.value.title = '';
  newTask.value.description = '';
  newTask.value.deadline = '';
  selectedAssignees.value = [];
  showTaskForm.value = false;
}

function addAccess() {
  if (!newAccess.value.url.trim() || !newAccess.value.login.trim()) return;
  
  accessStore.addAccess({
    id: Date.now().toString(),
    projectId: route.params.id as string,
    url: newAccess.value.url,
    login: newAccess.value.login,
    password: newAccess.value.password,
    comment: newAccess.value.comment
  });
  
  // Сброс формы
  newAccess.value.url = '';
  newAccess.value.login = '';
  newAccess.value.password = '';
  newAccess.value.comment = '';
  showAccessForm.value = false;
}
</script>

<style scoped>
.project-view {
  max-width: 800px;
  margin: 0 auto;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.project-description {
  margin-bottom: 20px;
  color: #555;
}

.action-buttons {
  margin-bottom: 30px;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.status-badge.active {
  background-color: #28a745;
  color: white;
}

.status-badge.archived {
  background-color: #6c757d;
  color: white;
}

.project-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

@media (min-width: 768px) {
  .project-content {
    grid-template-columns: 1fr 1fr;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.add-task-form, .add-access-form {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.tasks-list, .accesses-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-card, .access-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.task-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.task-status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 5px;
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

.task-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.task-details, .access-credentials {
  font-size: 14px;
  color: #555;
}

.access-url {
  font-weight: bold;
  margin-bottom: 5px;
}

.access-comment {
  margin-top: 5px;
  font-size: 14px;
  font-style: italic;
  color: #666;
}

.assignees-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.assignee-option {
  padding: 5px 10px;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
}

.assignee-option.selected {
  background-color: #0088cc;
  color: white;
}

.empty-message {
  text-align: center;
  color: #666;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 30px;
  color: #555;
}
</style> 