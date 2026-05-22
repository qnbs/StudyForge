import { Download } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { useLLM } from '../../lib/useLLM';
import { ragService } from '../../lib/rag/ragService';
import { buildExportBlob, downloadBlob } from '../../lib/export/exportDocument';
import { toast } from 'sonner';
import { EditorToolbar } from '../writing/EditorToolbar';
import { useLanguage } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function WritingPhase() {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const { isLoaded, isLoading, loadModel, generate } = useLLM();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { t } = useLanguage();
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load a single active document or create one
  useEffect(() => {
    async function loadDoc() {
      const docs = await db.documents.toArray();
      if (docs.length > 0) {
        setActiveDocId(docs[0].id);
      } else {
        const newId = crypto.randomUUID();
        await db.documents.add({
          id: newId,
          title: t('writing.untitled') || 'Untitled Document',
          wordCount: 0,
          lastEdited: new Date().toISOString(),
          content: t('writing.start') || '<h1>1. Introduction</h1><p>Start writing here...</p>',
        });
        setActiveDocId(newId);
      }
    }
    loadDoc();
  }, [t]);

  const activeDoc = useLiveQuery(
    () => activeDocId ? db.documents.get(activeDocId) : undefined,
    [activeDocId]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: activeDoc?.content || 'Loading...',
    onUpdate: ({ editor }) => {
      // Auto-save
      if (activeDocId) {
        const html = editor.getHTML();
        const text = editor.getText();
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        db.documents.update(activeDocId, {
          content: html,
          wordCount: words,
          lastEdited: new Date().toISOString(),
        });
      }
    },
  });

  // Keep editor content in sync with initial DB load
  useEffect(() => {
    if (editor && activeDoc && !editor.isFocused) {
      if (editor.getHTML() !== activeDoc.content && activeDoc.content) {
         editor.commands.setContent(activeDoc.content);
      }
    }
  }, [editor, activeDoc]);

  useEffect(() => {
    const onExport = (e: Event) => {
      const format = (e as CustomEvent<{ format?: 'latex' | 'md' | 'html' | 'txt' }>).detail?.format ?? 'latex';
      if (editor && activeDoc) {
        const { blob, extension } = buildExportBlob(
          format,
          activeDoc.title,
          editor.getHTML(),
          editor.getText()
        );
        downloadBlob(
          blob,
          `${activeDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`
        );
        toast.success(`Exported as .${extension}`);
      }
    };
    window.addEventListener('studyforge:export', onExport);
    return () => window.removeEventListener('studyforge:export', onExport);
  }, [editor, activeDoc]);

  if (!editor || !activeDoc) {
    return <div className="h-full flex items-center justify-center text-slate-500">{t('writing.loading')}</div>;
  }

  const handleExport = (format: 'html' | 'md' | 'txt' | 'latex') => {
    const { blob, extension } = buildExportBlob(
      format,
      activeDoc.title,
      editor.getHTML(),
      editor.getText()
    );
    downloadBlob(
      blob,
      `${activeDoc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`
    );
    setShowExportMenu(false);
    toast.success(`Exported as .${extension}`);
  };

  const handleRephrase = async () => {
    if (!isLoaded && !isLoading) {
      toast.info(t('writing.initML') || 'Initializing ML engine...');
      await loadModel();
    }

    if (isLoading) {
      toast.info(t('writing.modelLoading') || 'Model is still loading, please wait.');
      return;
    }

    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');

    if (!selectedText) {
      toast.warning(t('writing.selectText') || 'Select text to rephrase.');
      return;
    }

    setIsGenerating(true);
    try {
      let systemPrompt = 'You are an expert academic editor.';
      try {
        const ragHits = await ragService.queryRAG(selectedText, 3, activeDocId ?? undefined);
        if (ragHits.length > 0) {
          const ctx = ragHits.map((r) => r.chunk.text).join('\n---\n');
          systemPrompt += `\n\nUse this document context when rephrasing:\n\n${ctx}`;
        }
      } catch {
        /* RAG optional */
      }

      const response = await generate(
        `Rephrase and improve the academic tone of the following text: "${selectedText}". Return ONLY the rewritten text, nothing else, no quotes.`,
        systemPrompt
      );
      
      editor.chain().focus().deleteSelection().insertContent(response).run();
      toast.success(t('writing.rephraseSuccess') || 'Rephrased successfully.');
    } catch (err) {
      console.error(err);
      toast.error(t('writing.rephraseError') || 'Failed to rephrase text.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-in fade-in duration-500 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6 gap-2 md:gap-0 shrink-0">
        <div>
          <input 
            type="text" 
            value={activeDoc.title}
            onChange={(e) => db.documents.update(activeDoc.id, { title: e.target.value })}
            className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight bg-transparent border-none outline-none focus:ring-0 p-0 m-0 w-full"
            placeholder={t('writing.plhTitle')}
          />
          <p className="mt-1 text-slate-500 text-xs md:text-sm">
            {activeDoc.wordCount} {t('writing.words')} • {t('writing.lastEdited')} {new Date(activeDoc.lastEdited).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto relative" ref={exportRef}>
          <span className="text-[10px] md:text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 hidden sm:inline-block">{t('writing.autosaved')}</span>
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 text-slate-700 hover:text-indigo-600 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium text-sm transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <AnimatePresence>
            {showExportMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden"
              >
                <div className="p-1">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Formats</p>
                  <button onClick={() => handleExport('md')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg group flex items-center justify-between">
                    Markdown <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-400">.md</span>
                  </button>
                  <button onClick={() => handleExport('html')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg group flex items-center justify-between">
                    HTML Document <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-400">.html</span>
                  </button>
                  <button onClick={() => handleExport('txt')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg group flex items-center justify-between">
                    Plain Text <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-400">.txt</span>
                  </button>
                  <button onClick={() => handleExport('latex')} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-lg group flex items-center justify-between border-t border-slate-100 mt-1 pt-2">
                    LaTeX Structure <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-400">.tex</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <EditorToolbar 
          editor={editor}
          isGenerating={isGenerating}
          onRephrase={handleRephrase}
        />

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-0 sm:p-4 md:p-8 relative" id="editor-container">
          <div className="w-full sm:max-w-2xl sm:mx-auto bg-white sm:shadow-sm sm:border border-slate-200 min-h-full sm:min-h-[800px] p-6 sm:p-12 md:p-16 font-serif leading-relaxed text-slate-800 text-[15px] sm:text-base prose prose-slate prose-headings:font-display prose-headings:font-bold prose-h1:text-3xl max-w-none focus:outline-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
