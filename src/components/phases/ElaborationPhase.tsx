import { GripVertical, Plus, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function ElaborationPhase() {
  const { t } = useLanguage();

  const outline = [
    { id: '1', level: 1, title: t('elaboration.outline1') || 'Introduction' },
    { id: '2', level: 2, title: t('elaboration.outline2') || 'Background and Motivation' },
    { id: '3', level: 2, title: t('elaboration.outline3') || 'Research Objectives' },
    { id: '4', level: 1, title: t('elaboration.outline4') || 'Literature Review' },
    { id: '5', level: 2, title: t('elaboration.outline5') || 'The Evolution of Cloud vs Local-First' },
    { id: '6', level: 2, title: t('elaboration.outline6') || 'Privacy Concerns in Academic LLMs' },
    { id: '7', level: 1, title: t('elaboration.outline7') || 'Methodology' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">{t('elaboration.title')}</h1>
          <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-500">{t('elaboration.desc')}</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-3 md:py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors w-full md:w-auto shrink-0">
          <Sparkles className="w-4 h-4" />
          {t('elaboration.generateOutline')}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-3 md:p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between rounded-t-xl">
          <h2 className="font-semibold text-slate-900 text-sm md:text-base">{t('elaboration.docStructure')}</h2>
          <span className="text-xs font-medium text-slate-500">{t('elaboration.pagesEst')}</span>
        </div>
        
        <div className="p-2 space-y-1">
          {outline.map((item) => (
            <div 
              key={item.id} 
              className={`group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-move`}
              style={{ paddingLeft: `${Math.max(0.5, (item.level - 1) * 1.5 + 0.5)}rem` }}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
                <span className={`text-sm ${item.level === 1 ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                  {item.title}
                </span>
              </div>
              <div className="flex-1 flex sm:justify-end mt-2 sm:mt-0 ml-6 sm:ml-0">
                <span className="opacity-100 sm:opacity-0 group-hover:opacity-100 flex gap-3 transition-opacity">
                  <button className="text-[11px] md:text-xs text-slate-500 hover:text-indigo-600 font-medium bg-slate-100 sm:bg-transparent px-2 py-1 sm:p-0 rounded">{t('elaboration.addSub')}</button>
                  <button className="text-[11px] md:text-xs text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 sm:bg-transparent px-2 py-1 sm:p-0 rounded">{t('elaboration.draftAi')}</button>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium">
            <Plus className="w-4 h-4" />
            {t('elaboration.addChapter')}
          </button>
        </div>
      </div>
    </div>
  );
}
