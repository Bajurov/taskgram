import { supabase } from './supabaseClient';
import { Access } from '../types';
import { useUserStore } from '../store/user';

export async function getAccesses(): Promise<Access[]> {
  const userStore = useUserStore();
  if (!userStore.isManager) {
    throw new Error('Недостаточно прав для просмотра доступов');
  }
  const { data, error } = await supabase.from('accesses').select('*');
  if (error) throw error;
  return data as Access[];
}

export async function addAccess(access: Access) {
  const userStore = useUserStore();
  if (!userStore.isManager) {
    throw new Error('Недостаточно прав для создания доступа');
  }
  const { error } = await supabase.from('accesses').insert([access]);
  if (error) throw error;
}

export async function updateAccess(access: Access) {
  const userStore = useUserStore();
  if (!userStore.isManager) {
    throw new Error('Недостаточно прав для редактирования доступа');
  }
  const { error } = await supabase.from('accesses').update(access).eq('id', access.id);
  if (error) throw error;
}

export async function deleteAccess(id: string) {
  const userStore = useUserStore();
  if (!userStore.isManager) {
    throw new Error('Недостаточно прав для удаления доступа');
  }
  const { error } = await supabase.from('accesses').delete().eq('id', id);
  if (error) throw error;
} 