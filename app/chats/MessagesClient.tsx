'use client';

import { useEffect, useMemo } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';

export default function MessagesClient({
  messages,
  chatId,
  setMessages,
}: {
  messages: any[];
  chatId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const supabase = useMemo(() => createClientSupabase(), []);

  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`max-w-2xl mx-auto p-3 rounded-lg shadow-sm ${
            m.role === 'user' ? 'mr-0 bg-blue-500 text-white' : 'ml-0 bg-white'
          }`}
        >
          {m.content}
        </div>
      ))}
    </div>
  );
}
