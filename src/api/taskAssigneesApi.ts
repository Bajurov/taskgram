import { supabase } from './supabaseClient';

export async function getAssignees(taskId: string): Promise<string[]> {
  const { data, error } = await supabase.from('task_assignees').select('userId').eq('taskId', taskId);
  if (error) throw error;
  return data ? data.map((row: any) => row.userId) : [];
}

export async function addAssignee(taskId: string, userId: string) {
  const { error } = await supabase.from('task_assignees').insert([{ taskId, userId }]);
  if (error) throw error;
}

export async function removeAssignee(taskId: string, userId: string) {
  const { error } = await supabase.from('task_assignees').delete().eq('taskId', taskId).eq('userId', userId);
  if (error) throw error;
}

export default {
  getAssignees,
  addAssignee,
  removeAssignee
}; 