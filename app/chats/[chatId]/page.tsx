import { createServerSupabase } from '@/lib/supabase/server';
import { SingleChat } from '../SingleChat';

export default async function ChatPage({ params }: { params: { chatId: string } }) {
  const supabase = await createServerSupabase();
  const { chatId } = await params;
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">Please sign in to view this chat.</p>
      </div>
    );
  }
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <SingleChat initialMessages={messages || []} chatId={chatId} />
    </div>
  );
}
