<template>
  <div style="background: #ff0; color: #000; font-size: 22px; padding: 20px;">
    TASK VIEW IS RENDERED<br>
    route id: {{ route.params.id }}<br>
    user: {{ userStore.currentUser }}<br>
    tasks loading: {{ tasksStore.loading }}<br>
    tasks error: {{ tasksStore.error }}<br>
    tasks: {{ tasksStore.tasks }}<br>
    tasks ids: {{ tasksStore.tasks.map(t => t.id) }}
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useUserStore } from '../store/user';
import { useTasksStore } from '../store/tasks';
import { onMounted } from 'vue';

const route = useRoute();
const userStore = useUserStore();
const tasksStore = useTasksStore();

onMounted(() => {
  tasksStore.fetchTasks();
});
</script>