import { supabase } from './supabaseClient';
import { Comment } from '../types';

export async function getComments(taskId: string): Promise<Comment[]> {
  const { data, error } = await supabase.from('comments').select('*').eq('taskId', taskId).order('createdAt', { ascending: true });
  if (error) throw error;
  return data as Comment[];
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>) {
  const { error } = await supabase.from('comments').insert([{ ...comment, id: Date.now().toString() }]);
  if (error) throw error;
} 