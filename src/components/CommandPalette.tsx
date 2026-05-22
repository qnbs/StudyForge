import { useEffect, useState, useCallback } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';
import type { WorkflowPhase } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface CommandPaletteProps {
  onNavigate: (phase: WorkflowPhase) => void;
  onExportLatex?: () => void;
  onSyncZotero?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type CommandItem = {
  id: string;
  label: string;
  type: 'nav' | 'action';
};

export function CommandPalette({
  onNavigate,
  onExportLatex,
  onSyncZotero,
  isOpen,
  onClose,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useLanguage();

  const commands: CommandItem[] = [
    { id: 'planning', label: t('sidebar.planning') || 'Planning', type: 'nav' },
    { id: 'research', label: t('sidebar.research') || 'Research', type: 'nav' },
    { id: 'elaboration', label: t('sidebar.elaboration') || 'Elaboration', type: 'nav' },
    { id: 'writing', label: t('sidebar.writing') || 'Writing', type: 'nav' },
    { id: 'library', label: t('sidebar.library') || 'Library', type: 'nav' },
    { id: 'agents', label: t('sidebar.agentWorkshop') || 'Agent Workshop', type: 'nav' },
    { id: 'settings', label: t('sidebar.settings') || 'Settings', type: 'nav' },
    { id: 'help', label: t('sidebar.help') || 'Help', type: 'nav' },
    { id: 'export-latex', label: t('cmd.exportLatex') || 'Export to LaTeX', type: 'action' },
    { id: 'sync-zotero', label: t('cmd.syncZotero') || 'Sync Zotero', type: 'action' },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const runCommand = useCallback(
    (cmd: CommandItem) => {
      if (cmd.type === 'nav') {
        onNavigate(cmd.id as WorkflowPhase);
      } else if (cmd.id === 'export-latex') {
        onExportLatex?.();
      } else if (cmd.id === 'sync-zotero') {
        onSyncZotero?.();
      }
      onClose();
      setSearch('');
      setSelectedIndex(0);
    },
    [onNavigate, onExportLatex, onSyncZotero, onClose]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) =>
          filtered.length ? (i - 1 + filtered.length) % filtered.length : 0
        );
        return;
      }

      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        runCommand(filtered[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, runCommand]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-start justify-center pt-[20vh] p-4"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('cmd.title') || 'Command palette'}
            initial={{ opacity: 0, scale: 0.95, y: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <Search className="w-5 h-5 text-indigo-500" aria-hidden />
              <input
                type="text"
                autoFocus
                aria-label={t('cmd.placeholder') || 'Search commands'}
                placeholder={t('cmd.placeholder') || 'Search for commands or navigate...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-900 text-sm placeholder:text-slate-400 focus:ring-0 w-full"
              />
              <div className="px-1.5 py-1 rounded border border-slate-200 bg-white text-[10px] font-mono text-slate-400 flex items-center gap-1 shadow-sm">
                <Command className="w-3 h-3" aria-hidden /> ESC
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 hide-scrollbar">
              {filtered.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                  <Search className="w-8 h-8 text-slate-200" aria-hidden />
                  <p className="text-sm text-slate-500 font-medium">
                    {t('cmd.empty') || 'No matching commands found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filtered.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      onClick={() => runCommand(cmd)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors group focus:outline-none ${
                        index === selectedIndex
                          ? 'bg-indigo-50'
                          : 'hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center text-slate-400 bg-white shadow-sm border border-slate-200 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                          {cmd.type === 'nav' ? (
                            <ArrowRight className="w-3 h-3" aria-hidden />
                          ) : (
                            <Command className="w-3 h-3" aria-hidden />
                          )}
                        </span>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                          {cmd.label}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold group-hover:text-indigo-400">
                        {t(cmd.type === 'nav' ? 'cmd.nav' : 'cmd.actions') ||
                          (cmd.type === 'nav' ? 'Navigation' : 'Action')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
