<template>
  <div class="access-list">
    <!-- <h2 class="section-title">Доступы к сервисам</h2> -->
    <div v-if="loading" class="loading">
      <Spinner />
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="accesses.length === 0" class="empty-state">
      Нет сохраненных доступов
    </div>
    <div v-else class="access-grid">
      <div v-for="access in accesses" :key="access.id" class="access-card">
        <div class="access-header">
          <h3 class="access-title">{{ access.url }}</h3>
          <button class="delete-btn" @click="removeAccess(access.id)" title="Удалить доступ">
            ×
          </button>
        </div>
        <div class="access-content">
          <div class="access-field">
            <span class="field-label">Логин:</span>
            <span class="field-value">{{ access.login }}</span>
          </div>
          <div class="access-field">
            <span class="field-label">Пароль:</span>
            <span class="field-value">{{ access.password }}</span>
          </div>
          <div v-if="access.comment" class="access-field">
            <span class="field-label">Комментарий:</span>
            <span class="field-value">{{ access.comment }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAccessStore } from '../../store/access';
import Spinner from '../User/Spinner.vue';

const props = defineProps<{
  projectid: string;
}>();

const accessStore = useAccessStore();
const { accesses, loading, error } = accessStore;

onMounted(async () => {
  await accessStore.fetchAccesses(props.projectid);
});

async function removeAccess(id: string) {
  if (confirm('Вы уверены, что хотите удалить этот доступ?')) {
    try {
      await accessStore.removeAccess(id);
    } catch (e) {
      console.error('Failed to remove access:', e);
    }
  }
}
</script>

<style scoped>
.access-list {
  padding: 20px;
}

.section-title {
  color: #b6ffb0;
  font-size: 1.5rem;
  margin-bottom: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.error {
  color: #ff6b6b;
  padding: 20px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 8px;
  margin: 20px 0;
}

.empty-state {
  color: #888;
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.access-card {
  background: #23282d;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.access-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.access-title {
  color: #b6ffb0;
  font-size: 1.1rem;
  margin: 0;
  word-break: break-all;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 8px;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

.access-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.access-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  color: #888;
  font-size: 0.9rem;
}

.field-value {
  color: #f5f6fa;
  word-break: break-all;
}
</style> 