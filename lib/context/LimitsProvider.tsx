'use client';

import { createContext, useContext, useState } from 'react';

type Limits = {
  remaining_tokens: number;
};

const LimitsContext = createContext<{
  limits: Limits;
  setLimits: (l: Limits) => void;
} | null>(null);

export function LimitsProvider({ children, initialLimits }: { children: React.ReactNode; initialLimits: Limits }) {
  const [limits, setLimits] = useState(initialLimits);

  return <LimitsContext.Provider value={{ limits, setLimits }}>{children}</LimitsContext.Provider>;
}

export function useLimits() {
  const ctx = useContext(LimitsContext);
  if (!ctx) throw new Error('useLimits must be used within LimitsProvider');
  return ctx;
}
