import { supabase } from './supabaseClient';

export async function getAssignees(taskid: string): Promise<string[]> {
  const { data, error } = await supabase.from('task_assignees').select('userId').eq('taskid', taskid);
  if (error) throw error;
  return (data || []).map((row: any) => row.userId);
}

export async function addAssignee(taskid: string, userId: string) {
  const { error } = await supabase.from('task_assignees').insert([{ taskid, userId }]);
  if (error) throw error;
}

export async function removeAssignee(taskid: string, userId: string) {
  const { error } = await supabase.from('task_assignees').delete().eq('taskid', taskid).eq('userId', userId);
  if (error) throw error;
}

export default {
  getAssignees,
  addAssignee,
  removeAssignee
}; 