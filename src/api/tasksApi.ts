import { supabase } from './supabaseClient';
import { Task } from '../types';

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase.from('tasks').select('*');
  if (error) throw error;
  return data as Task[];
}

export async function addTask(task: Task) {
  const { error } = await supabase.from('tasks').insert([task]);
  if (error) throw error;
}

export async function updateTask(task: Task) {
  const { error } = await supabase.from('tasks').update(task).eq('id', task.id);
  if (error) throw error;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
} 