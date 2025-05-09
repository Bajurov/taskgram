import { supabase } from './supabaseClient';
import { Task } from '../types';
import { useUserStore } from '../store/user';

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) throw error;
  return data as Task[];
}

export async function addTask(task: Task) {
  const userStore = useUserStore();
  if (!userStore.isManager) {
    throw new Error('Недостаточно прав для создания задачи');
  }
  const { error } = await supabase.from('tasks').insert([task]);
  if (error) throw error;
}

export async function updateTask(task: Task) {
  const userStore = useUserStore();
  const currentTask = await getTasks().then(tasks => tasks.find(t => t.id === task.id));
  if (!currentTask) throw new Error('Задача не найдена');
  
  if (!userStore.isManager && currentTask.creatorId !== userStore.currentUser?.telegramId) {
    throw new Error('Недостаточно прав для редактирования задачи');
  }
  
  const { error } = await supabase.from('tasks').update(task).eq('id', task.id);
  if (error) throw error;
}

export async function deleteTask(id: string) {
  const userStore = useUserStore();
  const currentTask = await getTasks().then(tasks => tasks.find(t => t.id === id));
  if (!currentTask) throw new Error('Задача не найдена');
  
  if (!userStore.isManager && currentTask.creatorId !== userStore.currentUser?.telegramId) {
    throw new Error('Недостаточно прав для удаления задачи');
  }
  
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
} 