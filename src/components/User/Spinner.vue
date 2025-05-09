<template>
  <div class="spinner"></div>
</template>

<script setup lang="ts">
// Нет логики, только визуал
</script>

<style scoped>
.spinner {
  width: 38px;
  height: 38px;
  border: 4px solid #2e4e3f;
  border-top: 4px solid #b6ffb0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 