import { Search, Database, Filter, ChevronRight, FileText } from 'lucide-react';

export function ResearchPhase() {
  const mockSources = [
    { title: "Local-first software: you own your data, in spite of the cloud", authors: "Kleppmann et al.", year: 2019, type: "PDF" },
    { title: "Privacy-Preserving AI in Browser Environments", authors: "Chen, M., et al.", year: 2025, type: "Journal" },
    { title: "Evaluating WebAssembly for High-Performance Client-Side Computing", authors: "Smith, J.", year: 2024, type: "Conference" }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Research & Library</h1>
        <p className="mt-2 text-slate-500">Search your local PDFs, generate vector embeddings, and find semantic matches.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search papers using local semantic search (RAG)..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex">
        {/* Source List */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Local Vector Store
            </h2>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium">
              34 items
            </span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {mockSources.map((source, idx) => (
              <div key={idx} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 flex items-start gap-3 transition-colors">
                <div className="bg-red-50 text-red-600 p-2 rounded-md shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 leading-snug">{source.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{source.authors} • {source.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Detail Preview */}
        <div className="w-1/2 bg-slate-50 p-8 flex items-center justify-center text-center">
          <div className="max-w-xs space-y-4">
            <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-2">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Select a source</h3>
            <p className="text-sm text-slate-500">
              Click on a source in your library to preview its contents, view AI-generated summaries, and extract citations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
