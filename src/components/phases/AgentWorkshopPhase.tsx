import { Bot, Plus, Trash2, Save, Sparkles, Settings2, Search, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import type { Agent } from '../../types';

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
  };

  const handleDelete = async (id: string) => {
    await db.agents.delete(id);
    if (selectedAgent?.id === id) {
      setSelectedAgent(agents.find(a => a.id !== id) || null);
    }
  };

  const handleImportTemplate = async (template: any) => {
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
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 md:py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm self-start md:self-auto w-full md:w-auto">
          <Plus className="w-4 h-4" />
          Create New Agent
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden pb-16 lg:pb-0">
        {/* Agent List */}
        <div className="w-full lg:w-64 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm shrink-0 h-auto lg:h-full lg:overflow-hidden">
          <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 space-y-2 md:space-y-3 shrink-0">
            <h2 className="font-semibold text-slate-900 text-sm md:text-base">Your Agents</h2>
            <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search agents..." 
                 className="w-full bg-white border border-slate-200 rounded-lg py-2 md:py-1.5 pl-8 md:pl-9 pr-3 text-sm md:text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
               />
            </div>
          </div>
          <div className="lg:overflow-y-auto flex-none lg:flex-1 p-2 space-y-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible snap-x">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`w-56 lg:w-full shrink-0 snap-start text-left p-3 rounded-lg flex items-start gap-3 transition-colors ${selectedAgent?.id === agent.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-slate-100 lg:border-transparent'}`}
              >
                <div className={`p-2 rounded-md shrink-0 mt-0.5 ${selectedAgent?.id === agent.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`font-medium text-sm ${selectedAgent?.id === agent.id ? 'text-indigo-900' : 'text-slate-900'}`}>{agent.name}</h3>
                  <p className={`text-xs mt-0.5 ${selectedAgent?.id === agent.id ? 'text-indigo-600' : 'text-slate-500'}`}>{agent.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Agent Editor */}
        <div className="flex-none lg:flex-1 min-h-[700px] lg:min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="bg-indigo-100 p-2 md:p-2.5 rounded-lg text-indigo-700">
                 <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
               </div>
               <div>
                  <h2 className="font-semibold text-slate-900 text-sm md:text-base">{selectedAgent?.name || 'Agent'} Configuration</h2>
                  <p className="text-[11px] md:text-xs text-slate-500">Edit core instructions and model settings</p>
               </div>
            </div>
            {selectedAgent?.isCustom && (
               <button onClick={() => selectedAgent && handleDelete(selectedAgent.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
               </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div>
                   <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 md:mb-2">Agent Name</label>
                   <input 
                     type="text" 
                     value={selectedAgent?.name || ''} 
                     onChange={(e) => selectedAgent && setSelectedAgent({ ...selectedAgent, name: e.target.value })}
                     readOnly={!selectedAgent?.isCustom}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                   />
                </div>
                <div>
                   <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 md:mb-2">Role / Domain</label>
                   <input 
                     type="text" 
                     value={selectedAgent?.role || ''} 
                     onChange={(e) => selectedAgent && setSelectedAgent({ ...selectedAgent, role: e.target.value })}
                     readOnly={!selectedAgent?.isCustom}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                   />
                </div>
             </div>

             <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1.5 md:mb-2 gap-2 sm:gap-0">
                  <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500">System Prompt (Instructions)</label>
                  <div className="flex items-center gap-1.5 md:gap-2">
                     <History className="w-3.5 h-3.5 text-slate-400" />
                     <select className="text-[11px] md:text-xs text-slate-500 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-slate-900 outline-none p-0 pr-4">
                       <option>Current Version</option>
                       <option>Yesterday, 14:30</option>
                       <option>Initial Version</option>
                     </select>
                  </div>
                </div>
                <textarea 
                  value={selectedAgent?.prompt || ''} 
                  onChange={(e) => selectedAgent && setSelectedAgent({ ...selectedAgent, prompt: e.target.value })}
                  readOnly={!selectedAgent?.isCustom}
                  className="w-full h-32 md:h-40 bg-slate-50 border border-slate-200 rounded-lg p-3 md:p-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed resize-none" 
                />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 md:mt-2 gap-1 sm:gap-0">
                  <p className="text-[11px] md:text-xs text-slate-500">These instructions dictate how the agent analyzes text and generates suggestions.</p>
                  <p className="text-[11px] md:text-xs font-mono text-slate-400">~{Math.ceil((selectedAgent?.prompt?.length || 0) / 4)} tokens</p>
                </div>
             </div>

             <div>
                <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 md:mb-2">Execution Model</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                  disabled={!selectedAgent?.isCustom}
                  value={selectedAgent?.model || ''}
                  onChange={(e) => selectedAgent && setSelectedAgent({ ...selectedAgent, model: e.target.value })}
                >
                   <option value="Phi-4 (Local)">Phi-4 (4-bit Quantized) - Local WebGPU</option>
                   <option value="Gemma-3">Gemma 3 (Local) - WebGPU</option>
                   <option value="Llama-3.2-8B">Llama 3.2 8B (Local) - WebGPU</option>
                   <option value="Custom Cloud" disabled>Custom Cloud Endpoint (Coming Soon)</option>
                </select>
                <div className="mt-2 md:mt-3 flex items-start gap-2 bg-slate-100 p-2 md:p-3 rounded-lg border border-slate-200">
                   <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600 shrink-0 mt-0.5" />
                   <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed">
                      Models run entirely in your browser using OPFS caching. Fine-tuning for specific tasks via LoRA adapters will be supported in a future update.
                   </p>
                </div>
             </div>
             
             {/* Agent Test Console */}
             <div className="pt-4 md:pt-6 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  Agent Test Console
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <textarea 
                    placeholder="Enter sample academic text to test this agent's prompt..."
                    className="w-full h-20 md:h-24 bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner"
                  />
                  <div className="flex justify-end">
                    <button className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-medium px-4 py-2 rounded-lg text-sm hover:bg-indigo-100 transition-colors w-full sm:w-auto">
                      <Sparkles className="w-4 h-4" />
                      Run Test
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 border-dashed min-h-[80px] md:min-h-[100px] flex items-center justify-center text-slate-400 text-sm italic">
                    Output will appear here...
                  </div>
                </div>
             </div>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end">
             <button 
               onClick={handleSave}
               className="flex justify-center items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 w-full sm:w-auto">
               <Save className="w-4 h-4" />
               Save Changes
             </button>
          </div>
        </div>

        {/* Community Templates */}
        <div className="w-full lg:w-64 flex flex-col bg-indigo-50/50 border border-indigo-100 rounded-xl shadow-sm shrink-0 h-auto lg:h-full lg:overflow-hidden">
          <div className="p-3 md:p-4 border-b border-indigo-100 bg-white">
            <h2 className="font-semibold text-slate-900 text-sm md:text-base">Community Templates</h2>
          </div>
          <div className="lg:overflow-y-auto flex-none lg:flex-1 p-3 space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-0">
            {[
              { title: 'Literature Reviewer', desc: 'Identifies methodology gaps in recent papers.', prompt: 'You are an expert reviewer focusing on methodology...' },
              { title: 'Scientific Translator', desc: 'Converts jargon to clear, accessible prose.', prompt: 'Translate complex scientific jargon into accessible terms...' },
              { title: 'Data Interpreter', desc: 'Summarizes statistical findings accurately.', prompt: 'Analyze statistical data and summarize the core findings...' },
              { title: 'Formatting Assistant', desc: 'Checks structural alignment with APA 7th.', prompt: 'Review text for structural integrity according to APA 7th edition...' }
            ].map((template, idx) => (
              <div key={idx} className="relative bg-white border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition-colors cursor-pointer group shadow-sm z-10 hover:z-20">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{template.title}</h3>
                  <button 
                    onClick={() => handleImportTemplate(template)}
                    className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 px-2 py-0.5 rounded">Import</button>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-snug">{template.desc}</p>
                <div className="absolute top-1/2 right-full -translate-y-1/2 mr-3 w-56 bg-slate-900 text-white p-3 rounded-lg text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-lg border border-slate-800">
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 border-t border-r border-slate-800"></div>
                  <p className="font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[10px]">Snippet Preview</p>
                  <p className="text-slate-400 font-mono text-[10px] leading-relaxed">"{template.prompt}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
