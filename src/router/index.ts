import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/user';

// Маршруты lazy-loading для оптимизации
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Projects',
    component: () => import('../views/ProjectsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/project/:id',
    name: 'Project',
    component: () => import('../views/ProjectView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/task/:id',
    name: 'Task',
    component: () => import('../views/TaskView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth && !userStore.currentUser) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router; 