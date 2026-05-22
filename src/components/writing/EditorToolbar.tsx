import { Bold, Italic, Quote, Sparkles, PenTool, Type, Loader2 } from 'lucide-react';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
  isGenerating: boolean;
  onRephrase: () => void;
}

export function EditorToolbar({ editor, isGenerating, onRephrase }: EditorToolbarProps) {
  if (!editor) {
    return (
      <div className="p-2 border-b border-slate-200 bg-slate-50/80 flex items-center justify-center shrink-0">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-2 border-b border-slate-200 bg-slate-50/80 flex items-center gap-1 flex-wrap shrink-0">
      <div className="flex items-center gap-1">
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Heading 1"
        >
          <Type className="w-4 h-4" />
        </button>
      </div>
      <div className="w-px h-5 bg-slate-200 mx-1"></div>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Italic"
          >
          <Italic className="w-4 h-4" />
        </button>
        <button 
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${editor.isActive('blockquote') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
      </div>
      
      <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1"></div>
      
      <div className="ml-auto flex gap-1.5 md:gap-2">
        <button 
          onClick={onRephrase}
          disabled={isGenerating}
          className="flex items-center gap-1.5 md:gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          <span className="hidden sm:inline">Rephrase </span>(AI)
        </button>
        <button className="hidden sm:flex items-center gap-1.5 md:gap-2 bg-white border border-slate-200 text-slate-700 px-2 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
          <PenTool className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Humanize Text
        </button>
      </div>
    </div>
  );
}
