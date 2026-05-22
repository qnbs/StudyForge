import { Search, Database, Filter, FileText } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';

export function ResearchPhase() {
  const sources = useLiveQuery(() => db.sources.toArray()) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="shrink-0">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">Research & Library</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-500">Search your local PDFs, generate vector embeddings, and find semantic matches.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search papers using local semantic search (RAG)..." 
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm md:text-base text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button className="flex justify-center items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-3 sm:py-2 rounded-xl shadow-sm hover:bg-slate-50 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Source List */}
        <div className="w-full md:w-1/2 lg:w-5/12 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-1/2 md:h-auto">
          <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2 text-sm md:text-base">
              <Database className="w-4 h-4 text-indigo-600" />
              Local Vector Store
            </h2>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-medium">
              {sources.length} items
            </span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {sources.length === 0 ? (
               <div className="p-4 text-center text-sm text-slate-500 mt-10">No sources found. Add PDFs in the Library phase.</div>
            ) : (
                sources.map((source, idx) => (
                  <div key={idx} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 flex items-start gap-3 transition-colors">
                    <div className="bg-red-50 text-red-600 p-2 rounded-md shrink-0 border border-red-100">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 leading-tight md:leading-snug line-clamp-2" dangerouslySetInnerHTML={{ __html: source.title }}></h3>
                      <p className="text-xs text-slate-500 mt-1">{source.authors.join(', ')} • {source.year}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Source Detail Preview */}
        <div className="w-full md:w-1/2 lg:w-7/12 bg-slate-50 p-6 md:p-8 flex items-center justify-center text-center flex-1">
          <div className="max-w-xs space-y-3 md:space-y-4">
            <div className="bg-white p-3 md:p-4 rounded-full inline-block shadow-sm mb-1 md:mb-2 text-slate-400">
              <Database className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-slate-900">Select a source</h3>
            <p className="text-xs md:text-sm text-slate-500">
              Click on a source in your library to preview its contents, view AI-generated summaries, and extract citations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
