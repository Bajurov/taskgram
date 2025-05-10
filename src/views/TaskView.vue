<template>
  <div style="background: #ff0; color: #000; font-size: 22px; padding: 20px;">
    TASK VIEW IS RENDERED<br>
    route id: {{ route.params.id }}<br>
    user: {{ userStore.currentUser }}
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useUserStore } from '../store/user';

const route = useRoute();
const userStore = useUserStore();
</script>