import { supabase } from './supabaseClient';
import { User } from '../types';

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data as User[];
}

export async function addUser(user: User) {
  const { error } = await supabase.from('users').insert([user]);
  if (error) throw error;
}

export async function removeUser(telegramId: string) {
  const { error } = await supabase.from('users').delete().eq('telegramId', telegramId);
  if (error) throw error;
}

export async function setRole(telegramId: string, role: string) {
  const { error } = await supabase.from('users').update({ role }).eq('telegramId', telegramId);
  if (error) throw error;
}

export async function getUserByTelegramId(telegramId: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('telegramId', telegramId).single();
  if (error) return null;
  return data as User;
} 