import { supabase } from './supabaseClient';

export async function getAssignees(taskid: string): Promise<string[]> {
  const { data, error } = await supabase.from('task_assignees').select('userid').eq('taskid', taskid);
  if (error) throw error;
  return (data || []).map((row: any) => row.userid);
}

export async function addAssignee(taskid: string, userid: string) {
  const { error } = await supabase.from('task_assignees').insert([{ taskid, userid }]);
  if (error) throw error;
}

export async function removeAssignee(taskid: string, userid: string) {
  const { error } = await supabase.from('task_assignees').delete().eq('taskid', taskid).eq('userid', userid);
  if (error) throw error;
}

export default {
  getAssignees,
  addAssignee,
  removeAssignee
}; 