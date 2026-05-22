import { Bot, Search, FileSymlink, Sparkles, Plus } from 'lucide-react';

export function RightPanel() {
  return (
    <aside className="w-72 bg-slate-50 border-l border-slate-200 flex flex-col flex-shrink-0 hidden lg:flex">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">AI Research Agent</h3>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask your document..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Context Sources</h4>
          <div className="space-y-2">
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-indigo-300 transition-colors cursor-pointer">
              <div className="text-[11px] font-bold text-slate-700">Kleppmann et al. (2019)</div>
              <div className="text-[10px] text-slate-500 line-clamp-2">"Local-first paradigms ensure that the user remains the sole proprietor of their data..."</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[9px] text-indigo-500 font-semibold">Found in 3 sections</span>
                <span className="text-[9px] bg-slate-100 px-1 rounded">p. 42</span>
              </div>
            </div>
            
             <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-indigo-300 transition-colors cursor-pointer">
              <div className="text-[11px] font-bold text-slate-700">Chen, M., et al. (2025)</div>
              <div className="text-[10px] text-slate-500 line-clamp-2">"Performance costs of browser-based WebGPU are minimal for transformers..."</div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[9px] text-indigo-500 font-semibold">Relevant context</span>
                <span className="text-[9px] bg-slate-100 px-1 rounded">p. 112</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Suggested Improvements</h4>
          <div className="bg-indigo-600 rounded-lg p-3 text-white">
            <div className="text-xs font-bold mb-1">Academic Tone Check</div>
            <p className="text-[10px] opacity-90 leading-tight mb-2">Replace this phrasing with a more formal expression: "very beneficial" → "exhibits a significant increase in efficiency".</p>
            <button className="w-full py-1.5 bg-white/20 hover:bg-white/30 rounded text-[10px] font-bold transition-colors">Apply Change</button>
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
         <button className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition-colors">
           <Plus className="w-4 h-4" />
           Add New Reference
         </button>
      </div>
    </aside>
  );
}
