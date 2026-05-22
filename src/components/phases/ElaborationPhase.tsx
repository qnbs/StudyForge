import { GripVertical, Plus, Target, Sparkles } from 'lucide-react';

export function ElaborationPhase() {
  const outline = [
    { id: '1', level: 1, title: 'Introduction' },
    { id: '2', level: 2, title: 'Background and Motivation' },
    { id: '3', level: 2, title: 'Research Objectives' },
    { id: '4', level: 1, title: 'Literature Review' },
    { id: '5', level: 2, title: 'The Evolution of Cloud vs Local-First' },
    { id: '6', level: 2, title: 'Privacy Concerns in Academic LLMs' },
    { id: '7', level: 1, title: 'Methodology' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Elaboration & Outline</h1>
          <p className="mt-2 text-slate-500">Structure your paper. Drag and drop chapters or let AI suggest an outline based on your research.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
          <Sparkles className="w-4 h-4" />
          Generate Outline
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between rounded-t-xl">
          <h2 className="font-semibold text-slate-900">Document Structure</h2>
          <span className="text-xs font-medium text-slate-500">Estimated Length: ~15 pages</span>
        </div>
        
        <div className="p-2 space-y-1">
          {outline.map((item) => (
            <div 
              key={item.id} 
              className={`group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-move`}
              style={{ paddingLeft: `${(item.level - 1) * 2 + 0.5}rem` }}
            >
              <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
              <div className="flex-1 flex items-center justify-between">
                <span className={`text-sm ${item.level === 1 ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                  {item.title}
                </span>
                <span className="opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                  <button className="text-xs text-slate-400 hover:text-indigo-600 font-medium">Add Subchapter</button>
                  <button className="text-xs text-slate-400 hover:text-indigo-600 font-medium">Draft with AI</button>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium">
            <Plus className="w-4 h-4" />
            Add Chapter
          </button>
        </div>
      </div>
    </div>
  );
}
