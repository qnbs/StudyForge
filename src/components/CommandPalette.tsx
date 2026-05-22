import { useEffect, useState } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';
import type { WorkflowPhase } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface CommandPaletteProps {
  onNavigate: (phase: WorkflowPhase) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ onNavigate, isOpen, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Since we don't have toggling functionality from within here anymore, 
        // we'll rely on App to pass a custom event or let App handle the hotkey instead.
        // Actually, we can dispatch a custom event and let App capture it.
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'planning', label: t('sidebar.planning'), type: 'nav' },
    { id: 'research', label: t('sidebar.research'), type: 'nav' },
    { id: 'elaboration', label: t('sidebar.elaboration'), type: 'nav' },
    { id: 'writing', label: t('sidebar.writing'), type: 'nav' },
    { id: 'library', label: t('sidebar.library'), type: 'nav' },
    { id: 'agents', label: t('sidebar.agentWorkshop'), type: 'nav' },
    { id: 'settings', label: t('sidebar.settings'), type: 'nav' },
    { id: 'help', label: t('sidebar.help'), type: 'nav' },
    { id: 'export-latex', label: 'Export to LaTeX', type: 'action' },
    { id: 'sync-zotero', label: 'Sync Zotero', type: 'action' },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh] p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            autoFocus
            placeholder={t('cmd.placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm placeholder:text-slate-400"
          />
          <div className="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Command className="w-3 h-3" /> ESC
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">{t('cmd.empty')}</div>
          ) : (
            filtered.map((cmd) => (
              <button 
                key={cmd.id}
                onClick={() => {
                  if (cmd.type === 'nav') onNavigate(cmd.id as WorkflowPhase);
                  onClose();
                  setSearch('');
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 flex items-center justify-center text-slate-400">
                    {cmd.type === 'nav' ? <ArrowRight className="w-3.5 h-3.5" /> : <Command className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{cmd.label}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{t(cmd.type === 'nav' ? 'cmd.nav' : 'cmd.actions')}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
