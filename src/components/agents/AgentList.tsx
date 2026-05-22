import { useState } from 'react';
import { Bot, Search } from 'lucide-react';
import type { Agent } from '../../types';

interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelect: (agent: Agent) => void;
}

export function AgentList({ agents, selectedAgent, onSelect }: AgentListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter(agent => {
    const query = searchQuery.toLowerCase();
    return agent.name.toLowerCase().includes(query) || agent.role.toLowerCase().includes(query);
  });

  return (
    <div className="w-full lg:w-64 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm shrink-0 h-auto lg:h-full lg:overflow-hidden">
      <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 space-y-2 md:space-y-3 shrink-0">
        <h2 className="font-semibold text-slate-900 text-sm md:text-base">Your Agents</h2>
        <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search agents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 md:py-1.5 pl-8 md:pl-9 pr-3 text-sm md:text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
        </div>
      </div>
      <div className="lg:overflow-y-auto flex-none lg:flex-1 p-2 space-y-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible snap-x">
        {filteredAgents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent)}
            className={`w-56 lg:w-full shrink-0 snap-start text-left p-3 rounded-lg flex items-start gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selectedAgent?.id === agent.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-slate-100 lg:border-transparent'}`}
          >
            <div className={`p-2 rounded-md shrink-0 mt-0.5 ${selectedAgent?.id === agent.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-medium text-sm line-clamp-1 ${selectedAgent?.id === agent.id ? 'text-indigo-900' : 'text-slate-900'}`}>{agent.name}</h3>
              <p className={`text-xs mt-0.5 line-clamp-1 ${selectedAgent?.id === agent.id ? 'text-indigo-600' : 'text-slate-500'}`}>{agent.role}</p>
            </div>
          </button>
        ))}
        {filteredAgents.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500">
            No agents found.
          </div>
        )}
      </div>
    </div>
  );
}
