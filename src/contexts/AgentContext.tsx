import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Agent } from '../types';

interface AgentContextState {
  activeAgent: Agent | null;
  setActiveAgent: (agent: Agent | null) => void;
}

const AgentContext = createContext<AgentContextState | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);

  return (
    <AgentContext.Provider value={{ activeAgent, setActiveAgent }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useActiveAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error('useActiveAgent must be used within AgentProvider');
  }
  return ctx;
}
