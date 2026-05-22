import { Bold, Italic, Link2, Quote, Sparkles, BookMarked, Settings2, PenTool, Type, Loader2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { useLLM } from '../../lib/useLLM';

export function WritingPhase() {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const { isLoaded, isLoading, loadModel, generate } = useLLM();
  const [isGenerating, setIsGenerating] = useState(false);

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
          title: 'Untitled Document',
          wordCount: 0,
          lastEdited: new Date().toISOString(),
          content: '<h1>1. Introduction</h1><p>Start writing here...</p>',
        });
        setActiveDocId(newId);
      }
    }
    loadDoc();
  }, []);

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

  if (!editor || !activeDoc) {
    return <div className="h-full flex items-center justify-center text-slate-500">Loading editor...</div>;
  }

  const handleRephrase = async () => {
    if (!isLoaded && !isLoading) {
      alert("Initializing ML Engine in background...");
      await loadModel();
      // wait for it
    }

    if (isLoading) {
      alert("Model is still loading, please wait.");
      return;
    }

    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, ' ');

    if (!selectedText) {
      alert("Please select some text to rephrase.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generate(`Rephrase and improve the academic tone of the following text: "${selectedText}". Return ONLY the rewritten text, nothing else, no quotes.`, "You are an expert academic editor.");
      
      editor.chain().focus().deleteSelection().insertContent(response).run();
    } catch (err) {
      console.error(err);
      alert("Failed to rephrase.");
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
            placeholder="Document Title"
          />
          <p className="mt-1 text-slate-500 text-xs md:text-sm">
            {activeDoc.wordCount} words • Last edited {new Date(activeDoc.lastEdited).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <span className="text-[10px] md:text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Autosaved locally</span>
          <button className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-lg border border-slate-200 md:border-transparent md:bg-transparent shadow-sm md:shadow-none">
            <Settings2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Formatting Toolbar */}
        <div className="p-2 border-b border-slate-200 bg-slate-50/80 flex items-center gap-1 flex-wrap shrink-0">
           <div className="flex items-center gap-1">
            <button 
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <Type className="w-4 h-4" />
            </button>
          </div>
          <div className="w-px h-5 bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
              >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>
          
          <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1"></div>
          
          <div className="ml-auto flex gap-1.5 md:gap-2">
            <button 
              onClick={handleRephrase}
              disabled={isGenerating}
              className="flex items-center gap-1.5 md:gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50">
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              <span className="hidden sm:inline">Rephrase </span>(AI)
            </button>
            <button className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-white border border-slate-200 text-slate-700 px-2 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <PenTool className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Humanize Text
            </button>
          </div>
        </div>

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
