'use client';
import { useState } from 'react';
import { createChatAction, removeChatAction } from './actions';
import { useRouter } from 'next/navigation';

export default function ChatHistory({ initialChats }: { initialChats: any[] }) {
  const router = useRouter();

  const [chats, setChats] = useState(initialChats);

  const handleCreateChat = async () => {
    const chat = await createChatAction();
    setChats((current) => [chat, ...current]);
    router.push(`/chats/${chat.id}`);
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await removeChatAction(id);
    const newChats = chats.filter((chat) => chat.id !== id);
    setChats(newChats);
    router.push(`/chats/new`);
  };

  return (
    <div className="w-64 h-full bg-gray-900 text-white flex flex-col">
      <button onClick={handleCreateChat} className="m-4 py-2 px-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition">
        + New chat
      </button>

      <div className="flex-1 overflow-y-auto px-2 space-y-2">
        {!!chats?.length &&
          chats.map((chat) => {
            return (
              <div
                key={chat.id}
                onClick={() => router.push(`/chats/${chat.id}`)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 cursor-pointer group"
              >
                <p className="truncate">{chat.name}</p>

                <img
                  src="/close.svg"
                  alt="delete"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="w-4 h-4 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                />
              </div>
            );
          })}

        {!chats?.length && <div className="text-gray-400 text-sm text-center mt-4">No chats yet</div>}
      </div>
    </div>
  );
}
