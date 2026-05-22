import { useState } from 'react';
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
import type { WorkflowPhase } from './types';

export default function App() {
  const [activePhase, setActivePhase] = useState<WorkflowPhase>('planning');

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
      <CommandPalette onNavigate={setActivePhase} />
      <Sidebar activePhase={activePhase} onPhaseChange={setActivePhase} />
      
      <main className="flex-1 flex flex-col bg-white overflow-hidden shadow-2xl relative z-10 w-full">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 bg-white z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-slate-900 font-semibold tracking-tight">Active Project</h2>
            <span className="text-xs text-slate-400 border-l border-slate-200 pl-4 italic">Phase: {activePhase}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded border border-slate-200 transition-colors">LaTeX Preview</button>
            <button className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded transition-colors">Export Project</button>
          </div>
        </header>

        <div className="overflow-y-auto flex-1 p-6 md:p-12 bg-slate-50/50 pb-20 md:pb-12">
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

