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
          <button class="delete-btn" @click="showDeletePopup(access.id)" title="Удалить доступ">
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
    <div v-if="showDelete" class="delete-popup-overlay">
      <div class="delete-popup">
        <div class="delete-popup-title">Удалить доступ?</div>
        <div class="delete-popup-desc">Вы уверены, что хотите безвозвратно удалить этот доступ? Это действие нельзя отменить.</div>
        <div class="delete-popup-actions">
          <button @click="deleteAccessConfirmed" class="delete-confirm-btn">Удалить</button>
          <button @click="showDelete = false" class="delete-cancel-btn">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAccessStore } from '../../store/access';
import Spinner from '../User/Spinner.vue';

const props = defineProps<{
  projectid: string;
}>();

const accessStore = useAccessStore();
const { accesses, loading, error } = accessStore;

const showDelete = ref(false);
const deleteAccessId = ref('');

function showDeletePopup(id: string) {
  deleteAccessId.value = id;
  showDelete.value = true;
}

async function deleteAccessConfirmed() {
  await accessStore.removeAccess(deleteAccessId.value);
  showDelete.value = false;
  deleteAccessId.value = '';
}

onMounted(async () => {
  await accessStore.fetchAccesses(props.projectid);
});
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