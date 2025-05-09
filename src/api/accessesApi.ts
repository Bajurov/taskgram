import { supabase } from './supabaseClient';
import { Access } from '../types';

export async function getAccesses(projectId: string): Promise<Access[]> {
  const { data, error } = await supabase.from('accesses').select('*').eq('projectId', projectId);
  if (error) throw error;
  return data as Access[];
}

export async function addAccess(access: Access) {
  const { error } = await supabase.from('accesses').insert([access]);
  if (error) throw error;
}

export async function updateAccess(access: Access) {
  const { error } = await supabase.from('accesses').update(access).eq('id', access.id);
  if (error) throw error;
}

export async function deleteAccess(id: string) {
  const { error } = await supabase.from('accesses').delete().eq('id', id);
  if (error) throw error;
} 