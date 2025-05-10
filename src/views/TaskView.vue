<template>
  <div v-if="tasksStore.loading" class="loading">Загрузка задач...</div>
  <div v-else-if="task" class="task-container">
    <div style="background:#ffe; color:#900; padding:10px; font-size:16px; margin-bottom:8px;">
      route id: {{ route.params.id }}<br>
      user: {{ userStore.currentUser }}<br>
      tasks ids: {{ tasksStore.tasks.map(t => t.id) }}<br>
      task: {{ task }}
    </div>
    <button class="back-btn" @click="goBack">← Назад к проекту</button>
    <div class="task-header">
      <div class="task-status" :class="task.status">
        {{ taskStatusLabels[task.status] }}
      </div>
      <h2>{{ task.title }}</h2>
    </div>
    <div class="task-meta">
      <div class="meta-item">
        <strong>Проект:</strong> {{ task.projectid }}
      </div>
      <div class="meta-item">
        <strong>Дедлайн:</strong> {{ task.deadline }}
      </div>
      <div class="meta-item">
        <strong>Постановщик:</strong> {{ task.creatorid }}
      </div>
    </div>
    <div class="task-description">
      <h3>Описание</h3>
      <p>{{ task.description }}</p>
    </div>
  </div>
  <div v-else class="loading">Задача не найдена</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTasksStore } from '../store/tasks';
import { onMounted, computed } from 'vue';

const route = useRoute();
const userStore = useUserStore();
const tasksStore = useTasksStore();

onMounted(() => {
  tasksStore.fetchTasks();
});

const task = computed(() =>
  tasksStore.tasks.find(t => String(t.id) === String(route.params.id))
);

const taskStatusLabels = {
  'new': 'Новая задача',
  'in_progress': 'В работе',
  'done': 'Готова',
  'backlog': 'Беклог'
};

function goBack() {
  if (task.value) {
    window.history.length > 1 ? window.history.back() : window.location.href = '/';
  }
}
</script>