import {
  BookOpen,
  FileText,
  Lightbulb,
  ListTree,
  PenTool,
  Settings,
  Library,
  Bot,
  HelpCircle
} from 'lucide-react';
import type { WorkflowPhase } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activePhase: WorkflowPhase;
  onPhaseChange: (phase: WorkflowPhase) => void;
}

export function Sidebar({ activePhase, onPhaseChange }: SidebarProps) {
  const { t } = useLanguage();

  const phases: { id: WorkflowPhase; label: string; icon: React.ReactNode }[] = [
    { id: 'planning', label: t('sidebar.planning'), icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'research', label: t('sidebar.research'), icon: <BookOpen className="w-5 h-5" /> },
    { id: 'elaboration', label: t('sidebar.elaboration'), icon: <ListTree className="w-5 h-5" /> },
    { id: 'writing', label: t('sidebar.writing'), icon: <PenTool className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0 hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white tracking-tighter">SF</div>
          <h1 className="font-bold text-slate-100 tracking-tight text-lg">StudyForge</h1>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold bg-slate-800 px-2 py-1 rounded">Local-First PWA</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold px-3 mb-2">
          {t('sidebar.workflow')}
        </div>
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm ${
              activePhase === phase.id
                ? 'text-indigo-400 bg-indigo-500/10 font-medium'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            {phase.icon}
            <span>{phase.label}</span>
          </button>
        ))}

        <div className="pt-8 text-[11px] text-slate-500 uppercase tracking-widest font-bold px-3 mb-2">
          {t('sidebar.library')}
        </div>
        <div className="space-y-1">
          <button 
            onClick={() => onPhaseChange('library')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm ${
              activePhase === 'library'
                ? 'text-indigo-400 bg-indigo-500/10 font-medium'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>{t('sidebar.mySources')}</span>
          </button>
        </div>

        <div className="pt-8 text-[11px] text-slate-500 uppercase tracking-widest font-bold px-3 mb-2">
          {t('sidebar.tools')}
        </div>
        <div className="space-y-1">
          <button 
            onClick={() => onPhaseChange('agents')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm ${
              activePhase === 'agents'
                ? 'text-indigo-400 bg-indigo-500/10 font-medium'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{t('sidebar.agentWorkshop')}</span>
          </button>
        </div>
      </nav>
      
      <div className="p-4 bg-slate-950/50 mt-auto hidden md:block">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Local Engine Status</span>
          <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
        </div>
        <div className="text-xs text-slate-300">Phi-4 (4-bit) Quantized</div>
        <div className="w-full bg-slate-800 h-1 rounded-full mt-2">
          <div className="bg-indigo-500 h-1 w-3/4 rounded-full"></div>
        </div>
        <div className="text-[9px] text-slate-500 mt-1">VRAM: 4.2GB / 8GB • WebGPU Active</div>
      </div>
      
      <div className="px-4 py-3 border-t border-slate-800/50 flex flex-col gap-1">
        <button 
          onClick={() => onPhaseChange('settings')}
          className={`flex w-full items-center gap-3 px-3 py-2 rounded transition-colors text-sm ${
            activePhase === 'settings'
              ? 'text-indigo-400 bg-indigo-500/10 font-medium'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          {t('sidebar.settings')}
        </button>
        <button 
          onClick={() => onPhaseChange('help')}
          className={`flex w-full items-center gap-3 px-3 py-2 rounded transition-colors text-sm ${
            activePhase === 'help'
              ? 'text-indigo-400 bg-indigo-500/10 font-medium'
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          {t('sidebar.help')}
        </button>
      </div>
    </aside>
  );
}
