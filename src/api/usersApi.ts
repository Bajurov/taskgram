import { supabase } from './supabaseClient';
import { User } from '../types';

export async function getUsers(): Promise<User[]> {
  console.log('Fetching users from Supabase...');
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
  console.log('Users fetched successfully:', data);
  return data as User[];
}

export async function addUser(user: User) {
  console.log('Adding new user:', user);
  const { error } = await supabase.from('users').insert([user]);
  if (error) {
    console.error('Error adding user:', error);
    throw error;
  }
  console.log('User added successfully');
}

export async function removeUser(telegramId: string) {
  console.log('Removing user with telegramId:', telegramId);
  const { error } = await supabase.from('users').delete().eq('telegramId', telegramId);
  if (error) {
    console.error('Error removing user:', error);
    throw error;
  }
  console.log('User removed successfully');
}

export async function setRole(telegramId: string, role: string) {
  console.log('Setting role for user:', { telegramId, role });
  const { error } = await supabase.from('users').update({ role }).eq('telegramId', telegramId);
  if (error) {
    console.error('Error setting role:', error);
    throw error;
  }
  console.log('Role set successfully');
}

export async function getUserByTelegramId(telegramId: string): Promise<User | null> {
  console.log('Getting user by telegramId:', telegramId);
  const { data, error } = await supabase.from('users').select('*').eq('telegramId', telegramId).single();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  console.log('User found:', data);
  return data as User;
} 