import { HelpCircle, Command, BookOpen, ShieldCheck, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function HelpPhase() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{t('help.title')}</h1>
        <p className="mt-2 text-slate-500">{t('help.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
               <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  {t('help.faq')}
               </h2>
               <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-4">
                     <h3 className="font-semibold text-slate-800 text-sm mb-1">Is my data really kept local?</h3>
                     <p className="text-sm text-slate-600 leading-relaxed">Yes. StudyForge uses WebGPU and WebLLM to run language models directly in your browser. Uploaded PDFs are processed locally using OPFS (Origin Private File System) and IndexedDB. No server gets your text.</p>
                  </div>
                  <div className="border-b border-slate-100 pb-4">
                     <h3 className="font-semibold text-slate-800 text-sm mb-1">How do I sync Zotero?</h3>
                     <p className="text-sm text-slate-600 leading-relaxed">Go to the Library phase, select the Zotero tab, and provide your API key. The sync process downloads metadata into your local DB for offline access.</p>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm p-6">
               <h2 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Privacy Promise
               </h2>
               <p className="text-sm text-indigo-800/80 leading-relaxed">
                  We built StudyForge because we believe academic research should be private. If you notice any network requests reaching out to unknown servers, please report it immediately.
               </p>
            </div>
         </div>

         <div className="col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
               <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Command className="w-5 h-5 text-slate-500" />
                  {t('help.shortcuts')}
               </h2>
               <ul className="space-y-3">
                  <li className="flex items-center justify-between text-sm">
                     <span className="text-slate-600">Command Palette</span>
                     <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500">Cmd + K</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                     <span className="text-slate-600">Save Project</span>
                     <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500">Cmd + S</span>
                  </li>
                  <li className="flex items-center justify-between text-sm">
                     <span className="text-slate-600">Autocomplete</span>
                     <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500">Space</span>
                  </li>
               </ul>
            </div>

            <button className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 text-sm">
               <Mail className="w-4 h-4" />
               Contact Support
            </button>
         </div>
      </div>
    </div>
  );
}
