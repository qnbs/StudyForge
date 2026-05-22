import { useState } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface TemplateGalleryProps {
  onImport: (template: { title: string; desc: string; prompt: string }) => void;
}

export function TemplateGallery({ onImport }: TemplateGalleryProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const templates = [
    { title: 'Literature Reviewer', desc: 'Identifies methodology gaps in recent papers.', prompt: 'You are an expert reviewer focusing on methodology. Identify logical gaps, statistical flaws, and structural weaknesses in academic papers.' },
    { title: 'Scientific Translator', desc: 'Converts jargon to clear, accessible prose.', prompt: 'Translate complex scientific jargon into accessible terms suitable for a broader audience without losing core academic integrity.' },
    { title: 'Data Interpreter', desc: 'Summarizes statistical findings accurately.', prompt: 'Analyze statistical data provided and summarize the core findings into clean, concise academic prose.' },
    { title: 'Formatting Assistant', desc: 'Checks structural alignment with APA 7th.', prompt: 'Review the text for structural integrity according to APA 7th edition. Check for proper citation flow, heading levels, and formatting.' },
    { title: 'Peer Review Simulator', desc: 'Simulates a harsh peer review process.', prompt: 'Act as reviewer 2. Provide harsh but logically sound critique of the core hypothesis.' },
    { title: 'Abstract Generator', desc: 'Drafts a concise 200-word abstract.', prompt: 'Read the following paper draft and extract the core thesis, methods, results, and conclusion into a 200-word academic abstract.' }
  ];

  const filteredTemplates = templates.filter(template => 
    template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    template.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full lg:w-64 flex flex-col bg-slate-50/50 border border-slate-200 rounded-xl shadow-sm shrink-0 h-auto lg:h-full lg:overflow-hidden relative z-10">
      <div className="p-3 md:p-4 border-b border-slate-200 bg-white">
        <h2 className="font-semibold text-slate-900 text-sm md:text-base mb-3">{t('agents.galleryTitle') || 'Community Templates'}</h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('agents.searchTemplates') || 'Search templates...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border-none rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
          />
        </div>
      </div>
      <div className="lg:overflow-y-auto flex-none lg:flex-1 p-3 space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-0 hide-scrollbar pb-10">
        {filteredTemplates.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-4 col-span-full">No templates found.</div>
        ) : (
          filteredTemplates.map((template, idx) => (
            <div key={idx} className="relative bg-white cursor-pointer border border-slate-200 rounded-lg p-3 hover:border-indigo-300 hover:shadow-md transition-all group z-10 hover:z-20">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{template.title}</h3>
                <button 
                  onClick={() => onImport(template)}
                  className="text-slate-500 shrink-0 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-wider opacity-0 sm:opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 px-2 py-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:opacity-100"
                >
                  Import
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-snug">{template.desc}</p>
              
              {/* Hover Popover */}
              <div className="hidden lg:block absolute top-[10%] right-[calc(100%+12px)] w-56 bg-slate-900 text-white p-3.5 rounded-xl text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none shadow-xl border border-slate-800 z-50">
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 rotate-45 w-3 h-3 bg-slate-900 border-t border-r border-slate-800"></div>
                <p className="font-semibold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Snippet Preview</p>
                <p className="text-slate-400 font-mono text-[10px] leading-relaxed line-clamp-6">"{template.prompt}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
