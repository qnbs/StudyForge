import { Bold, Italic, Link2, Quote, Sparkles, BookMarked, Settings2, PenTool } from 'lucide-react';

export function WritingPhase() {
  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2 md:gap-0 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">Writing Editor</h1>
          <p className="mt-1 text-slate-500 text-xs md:text-sm">Draft, humanize, and refine your text with local AI assistance.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <span className="text-[10px] md:text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Autosaved locally</span>
          <button className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-lg border border-slate-200 md:border-transparent md:bg-transparent shadow-sm md:shadow-none">
            <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Formatting Toolbar */}
        <div className="p-2 border-b border-slate-200 bg-slate-50/80 flex items-center gap-1 flex-wrap shrink-0">
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-600 hover:bg-slate-200 rounded transition-colors"><Bold className="w-4 h-4" /></button>
            <button className="p-2 text-slate-600 hover:bg-slate-200 rounded transition-colors"><Italic className="w-4 h-4" /></button>
          </div>
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-600 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5 text-[11px] md:text-xs font-medium">
              <Quote className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Cite</span>
            </button>
            <button className="p-2 text-slate-600 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5 text-[11px] md:text-xs font-medium">
              <Link2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Link</span>
            </button>
          </div>
          <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1"></div>
          
          <div className="ml-auto flex gap-1.5 md:gap-2">
            <button className="flex items-center gap-1.5 md:gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium hover:bg-indigo-100 transition-colors">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Rephrase </span>(AI)
            </button>
            <button className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-white border border-slate-200 text-slate-700 px-2 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <PenTool className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Humanize Text
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-0 sm:p-4 md:p-8">
          <div className="w-full sm:max-w-2xl sm:mx-auto bg-white sm:shadow-sm sm:border border-slate-200 min-h-full sm:min-h-[800px] p-6 sm:p-12 md:p-16 font-serif leading-relaxed text-slate-800 relative text-[15px] sm:text-base">
            <h1 className="text-3xl font-bold mb-8 text-slate-900 font-display">1. Introduction</h1>
            <p className="mb-6">
              The paradigm shift towards local-first software architecture offers a compelling response to growing privacy concerns within academic research. Traditionally, AI-assisted writing tools have relied heavily on cloud-based Large Language Models (LLMs), necessitating the transfer of potentially sensitive or unreleased intellectual property to third-party servers.
            </p>
            <div className="mb-6 bg-indigo-50/50 border-l-4 border-indigo-200 p-4 relative group">
              <span className="absolute hidden md:block -left-[4.5rem] top-4 px-2 py-1 bg-white border border-indigo-200 rounded text-[9px] font-sans font-bold text-indigo-600 uppercase tracking-tighter shadow-sm">AI Edit</span>
              
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button className="p-1 bg-white rounded shadow-sm text-indigo-600 hover:bg-indigo-50 border border-indigo-100"><Sparkles className="w-3 h-3" /></button>
                <button className="p-1 bg-white rounded shadow-sm text-slate-600 hover:bg-slate-50 border border-slate-200"><BookMarked className="w-3 h-3" /></button>
              </div>
              <p className="text-sm text-indigo-900 m-0 font-sans">
                <strong>AI Suggestion:</strong> Consider adding a citation here referencing Kleppmann et al. (2019) to strengthen the definition of 'local-first software'.
              </p>
            </div>
            <p className="mb-6">
              As <span className="bg-yellow-100 text-yellow-800 px-1 rounded-sm cursor-pointer font-sans text-sm">[Citation Needed]</span> demonstrates, ensuring data ownership while retaining the powerful capabilities of semantic search (Retrieval-Augmented Generation) and text synthesis requires a novel approach. This thesis proposes a completely offline-capable Progressive Web Application (PWA)...
            </p>
            
            <p className="text-slate-400 italic mt-8 cursor-text">
              Continue writing or press 'Space' for AI completion...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
