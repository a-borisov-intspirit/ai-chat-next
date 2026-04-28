import { LimitsProvider } from '@/lib/context/LimitsProvider';
import { createServerSupabase } from '@/lib/supabase/server';
import { fetchChats } from '@/lib/chatApi';
import ChatHistory from './ChatHistory';
import { ChatHeader } from './ChatHeader';
export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const chats = await fetchChats();

  const supabase = await createServerSupabase();

  const { data: authData } = await supabase.auth.getUser();

  const userId = authData.user?.id;

  const { data: limits } = await supabase
    .from('user_limits')
    .select('remaining_tokens, token_refresh_date')
    .eq('user_id', userId)
    .maybeSingle();

  const remaining = limits?.remaining_tokens ?? 0;

  return (
    <div className="flex h-screen">
      <ChatHistory initialChats={chats || []} />
      <LimitsProvider initialLimits={{ remaining_tokens: remaining }}>
        <div className="flex-1 flex flex-col">
          <ChatHeader />
          {children}
        </div>
      </LimitsProvider>
    </div>
  );
}
