'use client';
import { useEffect, useState } from 'react';
import { insertMessageAction, updateLimitsAction } from './actions';
import { createClientSupabase } from '@/lib/supabase/client';
import { useLimits } from '@/lib/context/LimitsProvider';

interface Message {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

type LimitsRow = {
  remaining_tokens: number;
};

export default function NewMessage({
  chatId,
  setMessages,
  messages,
}: {
  chatId: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  messages: Message[];
}) {
  const { limits, setLimits } = useLimits();

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [currentModel, setCurrentModel] = useState<string>('gpt-5-mini');

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/chat');
      const data = await res.json();
      setAvailableModels([...data.openai_models_list, ...data.claude_models_list]);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const supabase = createClientSupabase();

    const channel = supabase
      .channel('limits')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_limits',
        },
        (payload) => {
          const newData = payload.new as LimitsRow;
          setLimits(newData);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!currentPrompt) return;

    const userMessage = { content: currentPrompt, role: 'user' };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentPrompt('');

    await insertMessageAction({
      chat_id: chatId,
      role: 'user',
      content: currentPrompt,
    });

    if (limits.remaining_tokens <= 300) {
      alert('You have reached your token limit for today.');
      return;
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: currentPrompt,
        model: currentModel,
        history: [...messages, userMessage],
      }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    let buffer = '';
    let fullText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        if (!event.startsWith('data:')) continue;

        const json = event.replace('data:', '').trim();

        if (json === '[DONE]') break;

        try {
          const parsed = JSON.parse(json);
          if (parsed.type === 'usage') {
            const remaining_tokens = limits.remaining_tokens - parsed.usage.input_tokens - parsed.usage.output_tokens;
            setLimits({
              remaining_tokens,
            });
            updateLimitsAction(remaining_tokens);
            continue;
          }

          const text = parsed?.choices?.[0]?.delta?.content;

          if (!text) continue;

          fullText += text;

          setMessages((prev) => {
            const last = prev[prev.length - 1];

            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { ...last, content: last.content + text }];
            }

            return [...prev, { role: 'assistant', content: text }];
          });
        } catch (e) {
          console.error('parse error', e);
        }
      }
    }

    await insertMessageAction({
      chat_id: chatId,
      role: 'assistant',
      content: fullText,
    });
  };
  const onEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  return (
    <div className="border-t bg-white p-4">
      <div className="max-w-2xl mx-auto flex items-center gap-2">
        <select onChange={(e) => setCurrentModel(e.target.value)} className="border rounded-lg px-2 py-2">
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Type something..."
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          onKeyDown={onEnterPress}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
