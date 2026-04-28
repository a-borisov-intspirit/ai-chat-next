'use client';

import { useLimits } from '@/lib/context/LimitsProvider';

export function ChatHeader() {
  const { limits } = useLimits();

  return <div className="flex-1 bg-gray-100 px-2 space-y-2">remaining tokens today: {limits.remaining_tokens}</div>;
}
