import { createServerSupabase } from './supabase/server';

export interface ChatRow {
  id: number;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  chat_id: string;
  owner_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const getCurrentUserId = async () => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id;
};

export const fetchChats = async () => {
  const supabase = await createServerSupabase()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return []

  const { data } = await supabase
    .from('chats')
    .select('*')
    .eq('owner_id', user.id)

  return data
}

export const createChat = async () => {
  const supabase = await createServerSupabase();
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('chats')
    .insert({
      name: `New Chat ${new Date().toLocaleString()}`,
      owner_id: userId,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ChatRow;
};

export const removeChat = async (chatId: number) => {
  const supabase = await createServerSupabase();
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('owner_id', userId);

  if (error) throw error;
};

export const fetchMessages = async (chatId: number) => {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as MessageRow[];
};

export const insertMessage = async (message: Omit<MessageRow, 'id' | 'created_at' | 'owner_id'>) => {
  const supabase = await createServerSupabase();
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No authenticated user');
  const { data, error } = await supabase
    .from('messages')
    .insert({ ...message, owner_id: userId })
    .select('*')
    .single();

  if (error) throw error;
  return data as MessageRow;
};

export const updateLimits = async (newLimit: number) => {
  const supabase = await createServerSupabase();
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('No authenticated user');

  const { error } = await supabase
    .from('user_limits')
    .update({ remaining_tokens: newLimit })
    .eq('user_id', userId);

  if (error) throw error;
};