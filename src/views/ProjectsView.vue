<template>
  <div class="projects-container">
    <div class="projects-header">
      <h2>Проекты</h2>
      <button v-if="userStore.isManager" @click="showAddForm = !showAddForm">
        {{ showAddForm ? 'Отмена' : 'Добавить проект' }}
      </button>
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
      <button @click="addProject">Создать проект</button>
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
        @click="navigateToProject(project.id)"
      >
        <div class="project-title">{{ project.title }}</div>
        <div class="project-description">{{ project.description }}</div>
      </div>
    </div>
    <div v-else class="empty-message">
      Нет {{ activeTab === 'active' ? 'активных' : 'архивных' }} проектов
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

const filteredProjects = computed(() => {
  return activeTab.value === 'active'
    ? projectsStore.activeProjects
    : projectsStore.archivedProjects;
});

function navigateToProject(id: string) {
  router.push(`/project/${id}`);
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
</script>

<style scoped>
.projects-container {
  max-width: 800px;
  margin: 0 auto;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-project-form {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
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
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tabs button {
  background: none;
  border: none;
  padding: 10px 20px;
  color: #555;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  color: #0088cc;
  border-bottom: 2px solid #0088cc;
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 15px;
}

.project-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.project-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.project-title {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
}

.project-description {
  color: #666;
  font-size: 14px;
}

.empty-message {
  text-align: center;
  color: #666;
  padding: 30px;
}
</style> 