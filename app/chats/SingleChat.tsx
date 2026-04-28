'use client';

import { useEffect, useState } from 'react';
import MessagesClient from './MessagesClient';
import NewMessage from './NewMessage';

export const SingleChat = ({ initialMessages, chatId }: { initialMessages: any[]; chatId: string }) => {
  const [messages, setMessages] = useState(initialMessages);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <MessagesClient messages={messages} setMessages={setMessages} chatId={chatId} />
      <NewMessage chatId={chatId} setMessages={setMessages} messages={messages} />
    </div>
  );
};
