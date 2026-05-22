import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import type { Agent } from '../../types';
import { AgentList } from '../agents/AgentList';
import { AgentEditor } from '../agents/AgentEditor';
import { TemplateGallery } from '../agents/TemplateGallery';
import { toast } from 'sonner';

export function AgentWorkshopPhase() {
  const agents = useLiveQuery(() => db.agents.toArray()) || [];
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Automatically select the first agent if none is selected
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0]);
    }
  }, [agents, selectedAgent]);

  const handleSave = async () => {
    if (selectedAgent) {
      await db.agents.put({ ...selectedAgent, updatedAt: new Date().toISOString() });
      toast.success('Agent saved successfully.');
    }
  };

  const handleCreateNew = async () => {
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: 'New Custom Agent',
      role: 'Custom Role',
      description: 'A new custom assistant.',
      prompt: 'You are a helpful assistant.',
      model: 'Phi-4-mini',
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    await db.agents.add(newAgent);
    setSelectedAgent(newAgent);
    toast.success('New agent created.');
  };

  const handleDelete = async (id: string) => {
    await db.agents.delete(id);
    if (selectedAgent?.id === id) {
      setSelectedAgent(agents.find(a => a.id !== id) || null);
    }
    toast.success('Agent deleted.');
  };

  const handleImportTemplate = async (template: { title: string; desc: string; prompt: string; }) => {
    const newAgent: Agent = {
      id: crypto.randomUUID(),
      name: template.title,
      role: 'Template Role',
      description: template.desc,
      prompt: template.prompt,
      model: 'Phi-4-mini',
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    await db.agents.add(newAgent);
    setSelectedAgent(newAgent);
    toast.success(`Imported template: ${template.title}`);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between mb-4 md:mb-6 gap-4 md:gap-0 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">Agent Workshop</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-500">Build specialized AI assistants tailored to your academic workflow.</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 md:py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm self-start md:self-auto w-full md:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
          <Plus className="w-4 h-4" />
          Create New Agent
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden pb-16 lg:pb-0">
        <AgentList 
          agents={agents} 
          selectedAgent={selectedAgent} 
          onSelect={setSelectedAgent} 
        />
        
        <AgentEditor 
          agent={selectedAgent} 
          onUpdate={setSelectedAgent} 
          onDelete={handleDelete} 
          onSave={handleSave} 
        />

        <TemplateGallery onImport={handleImportTemplate} />
      </div>
    </div>
  );
}
