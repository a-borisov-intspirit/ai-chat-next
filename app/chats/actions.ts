'use server';

import { createChat as createChatRow, removeChat, insertMessage, MessageRow, updateLimits } from '../../lib/chatApi';

export async function createChatAction() {
  return createChatRow();
}

export async function removeChatAction(chatId: number) {
  return removeChat(chatId);
}

export async function insertMessageAction(message: Omit<MessageRow, 'id' | 'created_at' | 'owner_id'>) {
  return insertMessage(message);
}

export async function updateLimitsAction(newLimit: number) {
  return updateLimits(newLimit);
}
