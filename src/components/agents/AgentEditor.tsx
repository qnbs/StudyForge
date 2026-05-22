import { Settings2, Trash2, History, Sparkles, Bot, Save } from 'lucide-react';
import type { Agent } from '../../types';

interface AgentEditorProps {
  agent: Agent | null;
  onUpdate: (agent: Agent) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
}

export function AgentEditor({ agent, onUpdate, onDelete, onSave }: AgentEditorProps) {
  if (!agent) {
    return (
      <div className="flex-none lg:flex-1 min-h-[700px] lg:min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <Bot className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="font-medium text-slate-900 mb-1">Select an Agent</h3>
        <p className="text-sm">Choose an agent from the list or create a new one to start configuring.</p>
      </div>
    );
  }

  return (
    <div className="flex-none lg:flex-1 min-h-[700px] lg:min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 md:p-2.5 rounded-lg text-indigo-700">
              <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-sm md:text-base">{agent.name || 'Agent'} Configuration</h2>
              <p className="text-[11px] md:text-xs text-slate-500">Edit core instructions and model settings</p>
            </div>
        </div>
        {agent.isCustom && (
            <button 
              onClick={() => onDelete(agent.id)} 
              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              title="Delete Agent"
            >
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
                  value={agent.name || ''} 
                  onChange={(e) => onUpdate({ ...agent, name: e.target.value })}
                  readOnly={!agent.isCustom}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
            </div>
            <div>
                <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 md:mb-2">Role / Domain</label>
                <input 
                  type="text" 
                  value={agent.role || ''} 
                  onChange={(e) => onUpdate({ ...agent, role: e.target.value })}
                  readOnly={!agent.isCustom}
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
              value={agent.prompt || ''} 
              onChange={(e) => onUpdate({ ...agent, prompt: e.target.value })}
              readOnly={!agent.isCustom}
              className="w-full h-32 md:h-40 bg-slate-50 border border-slate-200 rounded-lg p-3 md:p-4 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed resize-none" 
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 md:mt-2 gap-1 sm:gap-0">
              <p className="text-[11px] md:text-xs text-slate-500">These instructions dictate how the agent analyzes text and generates suggestions.</p>
              <p className="text-[11px] md:text-xs font-mono text-slate-400">~{Math.ceil((agent.prompt?.length || 0) / 4)} tokens</p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 md:mb-2">Execution Model</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              disabled={!agent.isCustom}
              value={agent.model || ''}
              onChange={(e) => onUpdate({ ...agent, model: e.target.value })}
            >
                <option value="Phi-4-mini">Phi-4 (4-bit Quantized) - Local WebGPU</option>
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
                <button className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-medium px-4 py-2 rounded-lg text-sm hover:bg-indigo-100 transition-colors w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
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
            onClick={onSave}
            disabled={!agent.isCustom}
            className="flex justify-center items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
      </div>
    </div>
  );
}
