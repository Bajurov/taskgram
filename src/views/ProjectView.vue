<template>
  <div v-if="project" class="project-view">
    <button class="back-btn" @click="goBack">← Назад к проектам</button>
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
      <div style="background:#ffe; color:#900; padding:10px; font-size:14px; margin-bottom:8px;">
        <div><b>project:</b> {{ project }}</div>
        <div><b>tasks:</b> {{ tasksStore.tasks }}</div>
        <div><b>users:</b> {{ userStore.users }}</div>
        <div><b>filteredTasksList:</b> {{ filteredTasksList }}</div>
        <div><b>kanbanTasks:</b> {{ kanbanTasks }}</div>
      </div>
      <div class="tasks-section">
        <div class="section-header">
          <div class="section-title">Задачи</div>
          <button v-if="userStore.isManager" class="plus-btn" @click="showTaskForm = !showTaskForm" :title="showTaskForm ? 'Отмена' : 'Добавить задачу'">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#b6ffb0"/>
              <path d="M12 7v10M7 12h10" stroke="#181c1f" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="section-btn-spacer"></div>
        
        <TaskForm 
          v-if="showTaskForm" 
          :projectid="route.params.id as string"
          @task-added="showTaskForm = false"
        />
        
        <div class="tasks-view-switch">
          <button :class="{active: tasksView === 'list'}" @click="tasksView = 'list'">Список</button>
          <button :class="{active: tasksView === 'kanban'}" @click="tasksView = 'kanban'">Канбан</button>
        </div>
        
        <div v-if="tasksView === 'list'">
          <div class="tasks-filters">
            <select v-model="filterStatus">
              <option value="">Все статусы</option>
              <option v-for="(label, key) in taskStatusLabels" :key="key" :value="key">{{ label }}</option>
            </select>
            <select v-model="filterAssignee">
              <option value="">Все исполнители</option>
              <option v-for="user in employees" :key="user.id" :value="user.id">{{ user.name }}</option>
            </select>
          </div>
          <div class="tasks-list">
            <div v-if="filteredTasksList.length === 0" class="empty-message">
              Нет задач
            </div>
            <div 
              v-for="task in filteredTasksList" 
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
                <div>Исполнители: <span v-if="task.assignees.length">{{ task.assignees.map(id => getUsername(id, true)).join(', ') }}</span><span v-else>Не назначены</span></div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="kanban-board">
          <div v-for="(label, status) in taskStatusLabels" :key="status" class="kanban-column"
            @dragover.prevent
            @drop="onDrop(status)"
          >
            <div class="kanban-column-title">{{ label }}</div>
            <div class="kanban-tasks">
              <div v-for="task in kanbanTasks[status]" :key="task.id" class="task-card"
                :class="{ dragging: draggingTaskId === task.id }"
                draggable="true"
                @dragstart="onDragStart(task.id)"
                @dragend="onDragEnd"
                @click="navigateToTask(task.id)"
              >
                <div class="task-title">{{ task.title }}</div>
                <div class="task-details">
                  <div>Дедлайн: {{ formatDate(task.deadline) }}</div>
                  <div>Исполнители: <span v-if="task.assignees.length">{{ task.assignees.map(id => getUsername(id, true)).join(', ') }}</span><span v-else>Не назначены</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="userStore.isManager" class="accesses-section">
        <div class="section-header">
          <div class="section-title">Доступы</div>
          <button class="plus-btn" @click="showAccessForm = !showAccessForm" :title="showAccessForm ? 'Отмена' : 'Добавить доступ'">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#b6ffb0"/>
              <path d="M12 7v10M7 12h10" stroke="#181c1f" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="section-btn-spacer"></div>
        
        <AccessForm 
          v-if="showAccessForm" 
          :projectid="route.params.id as string"
          @access-added="showAccessForm = false"
        />
        
        <AccessList :projectid="route.params.id as string" />
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
import AccessForm from '../components/Access/AccessForm.vue';
import AccessList from '../components/Access/AccessList.vue';
import TaskForm from '../components/Task/TaskForm.vue';

const router = useRouter();
const route = useRoute();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const accessStore = useAccessStore();
const userStore = useUserStore();

const showTaskForm = ref(false);
const showAccessForm = ref(false);
const tasksView = ref('list');
const filterStatus = ref('');
const filterAssignee = ref('');

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

const employees = computed(() => 
  userStore.users.filter(u => u.role === 'employee')
);

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
  const user = users.find(u => u.id === id);
  return user ? user.name : id;
}

const filteredTasksList = computed(() => {
  let tasks = tasksStore.getTasksByProject(route.params.id as string);
  if (filterStatus.value) {
    tasks = tasks.filter(t => t.status === filterStatus.value);
  }
  if (filterAssignee.value) {
    tasks = tasks.filter(t => t.assignees.includes(filterAssignee.value));
  }
  return tasks;
});

const kanbanTasks = computed(() => {
  const all = tasksStore.getTasksByProject(route.params.id as string);
  return {
    new: all.filter(t => t.status === 'new'),
    in_progress: all.filter(t => t.status === 'in_progress'),
    done: all.filter(t => t.status === 'done'),
    backlog: all.filter(t => t.status === 'backlog')
  };
});

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
    projectid: route.params.id as string,
    creatorid: userStore.currentUser?.id || '',
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
    projectid: route.params.id as string,
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

function goBack() {
  router.push('/');
}

const draggingTaskId = ref<string | null>(null);

function onDragStart(taskId: string) {
  draggingTaskId.value = taskId;
}
function onDragEnd() {
  draggingTaskId.value = null;
}
function onDrop(newStatus: string) {
  if (!draggingTaskId.value) return;
  const task = tasksStore.tasks.find(t => t.id === draggingTaskId.value);
  if (task && task.status !== newStatus) {
    task.status = newStatus;
    tasksStore.updateTask(task);
  }
  draggingTaskId.value = null;
}

onMounted(() => {
  tasksStore.fetchTasks();
  userStore.fetchUsers();
});
</script>

<style scoped>
.project-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-btn {
  background: none;
  border: none;
  color: #b6ffb0;
  font-size: 1rem;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #fff;
}

.project-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.project-header h2 {
  color: #f5f6fa;
  margin: 0;
  font-size: 1.8rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(182, 255, 176, 0.2);
  color: #b6ffb0;
}

.status-badge.archived {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.project-description {
  color: #888;
  margin-bottom: 24px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-buttons button:first-child {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.action-buttons button:last-child {
  background: rgba(182, 255, 176, 0.2);
  color: #b6ffb0;
}

.action-buttons button:hover {
  transform: translateY(-1px);
}

.project-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

@media (min-width: 1024px) {
  .project-content {
    grid-template-columns: 1fr 1fr;
  }
}

.tasks-section,
.accesses-section {
  background: #23282d;
  border-radius: 12px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.section-title {
  color: #b6ffb0;
  margin: 0;
  font-size: 1.3rem;
}

.plus-btn {
  background: none;
  border: none;
  border-radius: 50%;
  padding: 0;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px #0a1a0e22;
}

.plus-btn:hover {
  background: #2e4e3f;
}

.section-btn-spacer {
  height: 18px;
}

.tasks-view-switch {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.tasks-view-switch button {
  background: #23282d;
  color: #b6ffb0;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.tasks-view-switch button.active {
  background: #b6ffb0;
  color: #23282d;
}

.tasks-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 18px;
}

.tasks-filters select {
  padding: 7px 14px;
  border-radius: 6px;
  border: 1.5px solid #2e4e3f;
  background: #181c1f;
  color: #b6ffb0;
  font-size: 1rem;
}

.tasks-list {
  display: grid;
  gap: 16px;
}

.task-card {
  background: #181c1f;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.task-card:hover {
  border-color: #2e4e3f;
  transform: translateY(-2px);
}

.task-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.task-status.new {
  background: rgba(182, 255, 176, 0.2);
  color: #b6ffb0;
}

.task-status.in_progress {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.task-status.done {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.task-status.backlog {
  background: rgba(158, 158, 158, 0.2);
  color: #9e9e9e;
}

.task-title {
  color: #f5f6fa;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.task-details {
  color: #888;
  font-size: 0.9rem;
}

.empty-message {
  color: #888;
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.loading {
  color: #888;
  text-align: center;
  padding: 40px;
}

.kanban-board {
  display: flex;
  gap: 18px;
  margin-top: 10px;
}

.kanban-column {
  background: #181c1f;
  border-radius: 10px;
  padding: 12px 8px 8px 8px;
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 200px;
}

.kanban-column-title {
  color: #b6ffb0;
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 8px;
  text-align: center;
}

.kanban-tasks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-card.dragging {
  opacity: 0.5;
  border: 2px dashed #b6ffb0;
}
</style> 