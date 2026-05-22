interface TemplateGalleryProps {
  onImport: (template: { title: string; desc: string; prompt: string }) => void;
}

export function TemplateGallery({ onImport }: TemplateGalleryProps) {
  const templates = [
    { title: 'Literature Reviewer', desc: 'Identifies methodology gaps in recent papers.', prompt: 'You are an expert reviewer focusing on methodology...' },
    { title: 'Scientific Translator', desc: 'Converts jargon to clear, accessible prose.', prompt: 'Translate complex scientific jargon into accessible terms...' },
    { title: 'Data Interpreter', desc: 'Summarizes statistical findings accurately.', prompt: 'Analyze statistical data and summarize the core findings...' },
    { title: 'Formatting Assistant', desc: 'Checks structural alignment with APA 7th.', prompt: 'Review text for structural integrity according to APA 7th edition...' }
  ];

  return (
    <div className="w-full lg:w-64 flex flex-col bg-indigo-50/50 border border-indigo-100 rounded-xl shadow-sm shrink-0 h-auto lg:h-full lg:overflow-hidden">
      <div className="p-3 md:p-4 border-b border-indigo-100 bg-white">
        <h2 className="font-semibold text-slate-900 text-sm md:text-base">Community Templates</h2>
      </div>
      <div className="lg:overflow-y-auto flex-none lg:flex-1 p-3 space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-0">
        {templates.map((template, idx) => (
          <div key={idx} className="relative bg-white border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition-colors group shadow-sm z-10 hover:z-20">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{template.title}</h3>
              <button 
                onClick={() => onImport(template)}
                className="text-slate-400 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-wider opacity-0 sm:opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 px-2 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:opacity-100"
              >
                Import
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-snug">{template.desc}</p>
            <div className="hidden lg:block absolute top-1/2 right-full -translate-y-1/2 mr-3 w-56 bg-slate-900 text-white p-3 rounded-lg text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none shadow-lg border border-slate-800">
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 border-t border-r border-slate-800"></div>
              <p className="font-semibold text-slate-300 mb-1 uppercase tracking-wider text-[10px]">Snippet Preview</p>
              <p className="text-slate-400 font-mono text-[10px] leading-relaxed">"{template.prompt}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
