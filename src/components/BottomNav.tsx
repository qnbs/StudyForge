import { Lightbulb, BookOpen, PenTool, Settings, Library, Bot, Menu, ListTree, HelpCircle } from 'lucide-react';
import type { WorkflowPhase } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useState } from 'react';

interface BottomNavProps {
  activePhase: WorkflowPhase;
  onPhaseChange: (phase: WorkflowPhase) => void;
}

export function BottomNav({ activePhase, onPhaseChange }: BottomNavProps) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'planning', icon: <Lightbulb className="w-5 h-5" />, label: t('bottomnav.plan') || 'Plan' },
    { id: 'research', icon: <BookOpen className="w-5 h-5" />, label: t('bottomnav.rag') || 'RAG' },
    { id: 'elaboration', icon: <ListTree className="w-5 h-5" />, label: t('bottomnav.draft') || 'Draft' },
    { id: 'writing', icon: <PenTool className="w-5 h-5" />, label: t('bottomnav.write') || 'Write' },
  ];

  const moreTabs = [
    { id: 'library', icon: <Library className="w-4 h-4" />, label: t('sidebar.library') },
    { id: 'agents', icon: <Bot className="w-4 h-4" />, label: t('sidebar.agentWorkshop') },
    { id: 'settings', icon: <Settings className="w-4 h-4" />, label: t('sidebar.settings') },
    { id: 'help', icon: <HelpCircle className="w-4 h-4" />, label: t('sidebar.help') },
  ];

  return (
    <>
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm shadow-xl" onClick={() => setMenuOpen(false)}>
           <div className="absolute bottom-20 right-4 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 flex flex-col gap-1 z-50">
             {moreTabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={(e) => { e.stopPropagation(); onPhaseChange(tab.id as WorkflowPhase); setMenuOpen(false); }}
                 className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activePhase === tab.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 active:bg-slate-50'}`}
               >
                 {tab.icon} {tab.label}
               </button>
             ))}
           </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 pb-safe pt-2 h-16 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {mainTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onPhaseChange(tab.id as WorkflowPhase)}
            className={`flex flex-col items-center justify-center flex-1 gap-1 h-full rounded-lg transition-colors ${
              activePhase === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
          </button>
        ))}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-col items-center justify-center flex-1 gap-1 h-full rounded-lg transition-colors ${
            menuOpen ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wide">{t('bottomnav.menu')}</span>
        </button>
      </nav>
    </>
  );
}
