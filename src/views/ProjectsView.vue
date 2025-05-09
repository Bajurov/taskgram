<template>
  <div class="projects-container">
    <div class="projects-header-table">
      <div class="projects-header-row">
        <div class="projects-header-cell projects-header-title">Проекты</div>
        <div class="projects-header-cell projects-header-btn">
          <button
            v-if="userStore.isManager"
            class="add-project-btn"
            @click="showAddForm = !showAddForm"
            :title="showAddForm ? 'Отмена' : 'Добавить проект'"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#b6ffb0"/>
              <path d="M12 7v10M7 12h10" stroke="#181c1f" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAddForm" class="add-project-form">
      <div class="form-group">
        <label for="title">Название</label>
        <input type="text" id="title" v-model="newProject.title" placeholder="Введите название проекта">
      </div>
      <div class="form-group">
        <label for="description">Описание</label>
        <textarea id="description" v-model="newProject.description" placeholder="Введите описание проекта"></textarea>
      </div>
      <button class="create-btn" @click="addProject">Создать проект</button>
    </div>

    <div class="tabs">
      <button 
        :class="{ active: activeTab === 'active' }" 
        @click="activeTab = 'active'"
      >
        Активные
      </button>
      <button 
        :class="{ active: activeTab === 'archived' }" 
        @click="activeTab = 'archived'"
      >
        Архив
      </button>
    </div>

    <div class="projects-list" v-if="filteredProjects.length">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id" 
        class="project-card"
        tabindex="0"
        role="button"
        style="pointer-events: auto; z-index: 1;"
        @click="handleProjectClick(project.id)"
      >
        <div class="project-title">{{ project.title }}</div>
        <div class="project-description">{{ project.description }}</div>
        <button
          v-if="activeTab === 'archived' && userStore.isManager"
          class="delete-project-btn"
          @click.stop="confirmDeleteProject(project.id, project.title)"
          title="Удалить проект"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#ff6b6b"/>
            <path d="M8 12h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    <div v-else class="empty-message">
      Нет {{ activeTab === 'active' ? 'активных' : 'архивных' }} проектов
    </div>
    <div v-if="showDeletePopup" class="delete-popup-overlay">
      <div class="delete-popup">
        <div class="delete-popup-title">Удалить проект?</div>
        <div class="delete-popup-desc">Вы уверены, что хотите безвозвратно удалить проект <b>{{ deleteProjectName }}</b>? Это действие нельзя отменить.</div>
        <div class="delete-popup-actions">
          <button @click="deleteProjectConfirmed" class="delete-confirm-btn">Удалить</button>
          <button @click="showDeletePopup = false" class="delete-cancel-btn">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectsStore } from '../store/projects';
import { useUserStore } from '../store/user';

const router = useRouter();
const projectsStore = useProjectsStore();
const userStore = useUserStore();

onMounted(() => {
  projectsStore.fetchProjects();
});

const activeTab = ref('active');
const showAddForm = ref(false);
const newProject = ref({
  title: '',
  description: ''
});

const showDeletePopup = ref(false);
const deleteProjectId = ref('');
const deleteProjectName = ref('');

const filteredProjects = computed(() => {
  return activeTab.value === 'active'
    ? projectsStore.activeProjects
    : projectsStore.archivedProjects;
});

function navigateToProject(id: string) {
  router.push(`/project/${id}`)
    .then(() => {
      console.log('router.push resolved');
    })
    .catch(e => {
      console.error('router.push error', e);
    });
}

function addProject() {
  if (!newProject.value.title.trim()) return;
  
  projectsStore.addProject({
    id: Date.now().toString(),
    title: newProject.value.title,
    description: newProject.value.description,
    status: 'active'
  });
  
  newProject.value.title = '';
  newProject.value.description = '';
  showAddForm.value = false;
}

function handleProjectClick(id: string) {
  console.log('Project card clicked:', id);
  navigateToProject(id);
}

function confirmDeleteProject(id: string, name: string) {
  deleteProjectId.value = id;
  deleteProjectName.value = name;
  showDeletePopup.value = true;
}

async function deleteProjectConfirmed() {
  await projectsStore.deleteProject(deleteProjectId.value);
  showDeletePopup.value = false;
  deleteProjectId.value = '';
  deleteProjectName.value = '';
}
</script>

<style scoped>
.projects-container {
  max-width: 800px;
  margin: 0 auto;
}

.projects-header-table {
  display: table;
  width: 100%;
  margin-bottom: 18px;
}
.projects-header-row {
  display: table-row;
}
.projects-header-cell {
  display: table-cell;
  vertical-align: middle;
}
.projects-header-title {
  width: 80%;
  font-size: 1.35rem;
  font-weight: 800;
  color: #eaffd0;
  text-shadow: 0 2px 8px #0a1a0e44, 0 0 2px #000;
  padding-bottom: 2px;
}
.projects-header-btn {
  width: 20%;
  text-align: right;
}
.add-project-btn {
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
.add-project-btn:hover {
  background: #2e4e3f;
}

.add-project-form {
  background: #23282d;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #b6ffb0;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 1.5px solid #2e4e3f;
  border-radius: 8px;
  font-size: 15px;
  background: #181c1f;
  color: #f5f6fa;
  outline: none;
  transition: border 0.2s;
}
input:focus, textarea:focus {
  border: 1.5px solid #b6ffb0;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

.create-btn {
  background: linear-gradient(90deg, #2e4e3f 0%, #1a3c2b 100%);
  color: #b6ffb0;
  border: none;
  border-radius: 14px;
  padding: 8px 18px;
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px 0 #0a1a0e22;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}
.create-btn:hover {
  background: linear-gradient(90deg, #3fa34d 0%, #1a3c2b 100%);
  color: #fff;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1.5px solid #2e4e3f;
}

.tabs button {
  background: none;
  border: none;
  padding: 8px 18px;
  color: #b6ffb0;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-size: 1rem;
  font-weight: 600;
  transition: color 0.2s, border 0.2s;
}
.tabs button.active {
  color: #3fa34d;
  border-bottom: 2px solid #3fa34d;
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 15px;
}

.project-card {
  background: #23282d;
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  transition: all 0.2s ease;
}
.project-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.22);
  transform: translateY(-2px);
}

.project-title {
  font-weight: 800;
  font-size: 1.15rem;
  color: #eaffd0;
  text-shadow: 0 2px 8px #0a1a0e44, 0 0 2px #000;
  margin-bottom: 10px;
}

.project-description {
  color: #b6ffb0;
  font-size: 0.98rem;
}

.empty-message {
  text-align: center;
  color: #b6ffb0aa;
  padding: 30px;
}

.delete-project-btn {
  background: none;
  border: none;
  border-radius: 50%;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 8px;
  margin-left: 8px;
  transition: background 0.2s;
}
.delete-project-btn:hover {
  background: #ff6b6b33;
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