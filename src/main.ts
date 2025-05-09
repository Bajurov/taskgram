import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useUserStore } from './store/user';

// Объявление интерфейса для Telegram Mini Apps SDK
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        expand: () => void;
        initDataUnsafe: any;
      }
    }
  }
}

// Создаем экземпляр приложения
const app = createApp(App);

// Подключаем Pinia для управления состоянием
app.use(createPinia());

// Подключаем маршрутизацию
app.use(router);

// Инициализация Telegram Mini Apps и асинхронная авторизация по Telegram ID
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.expand();
  const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user;
  if (telegramUser) {
    const userStore = useUserStore();
    (async () => {
      await userStore.loginByTelegramId(String(telegramUser.id));
      if (!userStore.currentUser) {
        router.replace('/login');
      }
    })();
  }
}

// Монтируем приложение
app.mount('#app'); 