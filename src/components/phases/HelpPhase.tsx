import { HelpCircle, Command, BookOpen, ShieldCheck, Mail, MessageSquare, ExternalLink, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function HelpPhase() {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{t('help.title')}</h1>
        <p className="mt-2 text-slate-500">{t('help.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="col-span-1 md:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-600" />
                    {t('help.faq')}
                 </h2>
               </div>
               <div className="p-6 space-y-6">
                  <div className="border-b border-slate-100 pb-6 rounded-lg">
                     <h3 className="font-semibold text-slate-900 mb-2">{t('help.faq1.q')}</h3>
                     <p className="text-sm text-slate-600 leading-relaxed">{t('help.faq1.a')}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-6 rounded-lg">
                     <h3 className="font-semibold text-slate-900 mb-2">{t('help.faq2.q')}</h3>
                     <p className="text-sm text-slate-600 leading-relaxed">{t('help.faq2.a')}</p>
                  </div>
                  <div className="border-b border-slate-100 pb-6 rounded-lg">
                     <h3 className="font-semibold text-slate-900 mb-2">{t('help.faq3.q')}</h3>
                     <p className="text-sm text-slate-600 leading-relaxed">{t('help.faq3.a')}</p>
                  </div>
                  <div className="rounded-lg">
                     <h3 className="font-semibold text-slate-900 mb-2">{t('help.faq4.q')}</h3>
                     <p className="text-sm text-slate-600 leading-relaxed">{t('help.faq4.a')}</p>
                  </div>
               </div>
            </div>

             <div className="bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm p-6 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShieldCheck className="w-32 h-32 text-indigo-900" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-700" />
                    {t('help.privacyPromise') || 'Privacy Promise'}
                 </h2>
                 <p className="text-sm text-indigo-800/80 leading-relaxed max-w-lg mb-4">
                    {t('help.privacyPromiseDesc') || 'We built StudyForge because we believe academic research should be private. If you notice any network requests reaching out to unknown third-party servers, please report it immediately. Your research is yours.'}
                 </p>
                 <button className="bg-white text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors shadow-sm">
                   {t('help.readManifesto') || 'Read Privacy Manifesto'}
                 </button>
               </div>
            </div>
         </div>

         <div className="col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                    {t('help.guides')}
                 </h2>
               </div>
               <div className="p-2">
                 {[t('help.guide1') || 'Getting Started Guide', t('help.guide2') || 'PDF Embeddings & RAG', t('help.guide3') || 'Creating Custom Agents', t('help.guide4') || 'Exporting to LaTeX'].map((guide, i) => (
                   <button key={i} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group">
                     <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-600">{guide}</span>
                     <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                   </button>
                 ))}
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Command className="w-5 h-5 text-slate-500" />
                    {t('help.shortcuts')}
                 </h2>
               </div>
               <div className="p-5">
                 <ul className="space-y-3">
                    <li className="flex items-center justify-between text-sm">
                       <span className="text-slate-600">{t('help.shortcutCmd') || 'Command Palette'}</span>
                       <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500">Cmd + K</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                       <span className="text-slate-600">{t('help.shortcutSave') || 'Save Project'}</span>
                       <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500">Cmd + S</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                       <span className="text-slate-600">{t('help.shortcutAi') || 'Autocomplete AI'}</span>
                       <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500">Option + Space</span>
                    </li>
                    <li className="flex items-center justify-between text-sm">
                       <span className="text-slate-600">{t('help.shortcutSidebar') || 'Toggle Sidebar'}</span>
                       <span className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-500">Cmd + B</span>
                    </li>
                 </ul>
               </div>
            </div>

            <div className="bg-slate-900 rounded-xl shadow-sm p-6 text-white">
               <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  {t('help.contact')}
               </h2>
               <div className="space-y-3">
                 <button className="w-full bg-slate-800 border border-slate-700 text-white font-medium py-2.5 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm px-4">
                    <Mail className="w-4 h-4 text-slate-400" /> {t('help.contact')}
                 </button>
                 <button className="w-full bg-slate-800 border border-slate-700 text-white font-medium py-2.5 rounded-lg hover:bg-slate-700 transition-colors flex justify-between items-center text-sm px-4">
                    <span className="flex items-center gap-3"><ExternalLink className="w-4 h-4 text-slate-400" /> {t('help.community')}</span>
                 </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
