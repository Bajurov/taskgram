import { supabase } from './supabaseClient';
import { Project } from '../types';

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) throw error;
  return data as Project[];
}

export async function addProject(project: Project) {
  const { error } = await supabase.from('projects').insert([project]);
  if (error) throw error;
}

export async function updateProject(project: Project) {
  const { error } = await supabase.from('projects').update(project).eq('id', project.id);
  if (error) throw error;
} 