import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { PlanningPhase } from './components/phases/PlanningPhase';
import { ResearchPhase } from './components/phases/ResearchPhase';
import { ElaborationPhase } from './components/phases/ElaborationPhase';
import { WritingPhase } from './components/phases/WritingPhase';
import { LibraryPhase } from './components/phases/LibraryPhase';
import { AgentWorkshopPhase } from './components/phases/AgentWorkshopPhase';
import { SettingsPhase } from './components/phases/SettingsPhase';
import { HelpPhase } from './components/phases/HelpPhase';
import { CommandPalette } from './components/CommandPalette';
import { BottomNav } from './components/BottomNav';
import { Search } from 'lucide-react';
import type { WorkflowPhase } from './types';
import { initializeDatabase } from './lib/db';

export default function App() {
  const [activePhase, setActivePhase] = useState<WorkflowPhase>('planning');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDbInitialized, setIsDbInitialized] = useState(false);

  useEffect(() => {
    initializeDatabase().then(() => setIsDbInitialized(true));
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isDbInitialized) {
    return <div className="flex h-screen w-screen items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 rounded-full border-4 border-indigo-600 border-t-transparent"></div></div>;
  }

  const renderActivePhase = () => {
    switch (activePhase) {
      case 'planning':
        return <PlanningPhase />;
      case 'research':
        return <ResearchPhase />;
      case 'elaboration':
        return <ElaborationPhase />;
      case 'writing':
        return <WritingPhase />;
      case 'library':
        return <LibraryPhase />;
      case 'agents':
        return <AgentWorkshopPhase />;
      case 'settings':
        return <SettingsPhase />;
      case 'help':
        return <HelpPhase />;
      default:
        return <PlanningPhase />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      <CommandPalette 
        onNavigate={setActivePhase} 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
      <Sidebar activePhase={activePhase} onPhaseChange={setActivePhase} />
      
      <main className="flex-1 flex flex-col bg-white overflow-hidden shadow-2xl relative z-10 w-full">
        <header className="h-14 md:h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 bg-white z-20">
          <div className="flex items-center gap-2 md:gap-4">
            <h2 className="text-slate-900 font-semibold tracking-tight text-sm md:text-base">Active Project</h2>
            <span className="hidden md:inline text-xs text-slate-400 border-l border-slate-200 pl-4 italic">Phase: {activePhase}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3">
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-2 py-1.5 md:px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border-transparent border md:border-slate-200"
              aria-label="Search or execute command"
            >
               <Search className="w-4 h-4 md:w-3.5 md:h-3.5" />
               <span className="hidden md:inline text-xs font-medium">Search / Command...</span>
               <div className="hidden md:flex px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-400 items-center gap-0.5 ml-2">
                 <span>⌘</span>K
               </div>
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1 hidden md:block"></div>
            <button className="px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-medium text-slate-600 hover:bg-slate-50 rounded border border-slate-200 transition-colors">LaTeX</button>
            <button className="px-2 py-1 md:px-3 md:py-1.5 text-[10px] md:text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap">Export</button>
          </div>
        </header>

        <div className="overflow-y-auto flex-1 p-4 md:p-8 lg:p-12 bg-slate-50/50 pb-24 md:pb-12">
          {renderActivePhase()}
        </div>

        <footer className="h-10 border-t border-slate-200 bg-slate-50 hidden md:flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Encryption: AES-256 (Local Only)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Storage: SQLite/OPFS</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400">
             Privacy First • Runs locally
          </div>
        </footer>
      </main>

      <RightPanel />
      <BottomNav activePhase={activePhase} onPhaseChange={setActivePhase} />
    </div>
  );
}

