import { Bot, Sparkles, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useLLM } from '../lib/useLLM';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function RightPanel() {
  const { isLoaded, isLoading, progress, loadModel, generateStream } = useLLM();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useLanguage();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    if (!isLoaded && !isLoading) {
       await loadModel();
    }
    
    // We defer the message sending if we're waiting for the model
    if (isLoading) {
        toast.info(t('chat.loading'));
        return;
    }

    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsGenerating(true);
    
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const systemPrompt = t('chat.systemPrompt');

    try {
      await generateStream(userMessage, systemPrompt, (text) => {
          setMessages(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].content = text;
              return newMsgs;
          });
      });
    } catch (err: unknown) {
      console.error(err);
      setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = `Error: ${err instanceof Error ? err.message : String(err)}`;
          return newMsgs;
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <aside className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col flex-shrink-0 hidden lg:flex relative">
      <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="font-bold text-sm text-slate-800">{t('chat.title')}</h3>
        </div>
        {!isLoaded && !isLoading && (
            <button 
                onClick={() => loadModel()}
                className="w-full mt-2 text-xs font-semibold bg-slate-900 text-white rounded-lg py-2 px-3 hover:bg-slate-800 transition-colors"
             >
                {t('chat.initModel')}
            </button>
        )}
        {isLoading && progress && (
            <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-600 mb-1 font-mono">
                    <span>{progress.text.split(']')[0]}]</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className="bg-indigo-600 h-1.5 transition-all duration-300" 
                        style={{ width: `${(progress.progress * 100).toFixed(1)}%` }}
                    />
                </div>
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white relative">
          {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center px-4">
                 <Sparkles className="w-8 h-8 text-indigo-200 mb-3" />
                 <p className="text-sm font-medium text-slate-500">{t('chat.emptyState')}</p>
                 <p className="text-xs text-slate-400 mt-2">{t('chat.privacyNote')}</p>
             </div>
          ) : (
             messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                         msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-sm' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                     }`}>
                         {msg.content || (msg.role === 'assistant' && isGenerating && i === messages.length - 1 ? (
                             <span className="flex items-center gap-1">
                                 <Loader2 className="w-3 h-3 animate-spin"/> {t('chat.thinking')}
                             </span>
                         ) : '')}
                     </div>
                 </div>
             ))
          )}
      </div>

      <div className="p-3 border-t border-slate-200 bg-white">
         <div className="relative flex items-center">
             <input 
               type="text" 
               value={inputValue}
               onChange={e => setInputValue(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
               placeholder={isLoaded ? t('chat.plhReady') : t('chat.plhInit')} 
               disabled={!isLoaded && !isLoading}
               className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3 pr-10 text-xs focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
             />
             <button 
                 onClick={handleSendMessage}
                 disabled={isGenerating || (!isLoaded && !isLoading) || !inputValue.trim()}
                 className="absolute right-1 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
             >
                 {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
             </button>
         </div>
      </div>
    </aside>
  );
}
