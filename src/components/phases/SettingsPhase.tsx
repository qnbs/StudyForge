import { Settings2, MonitorSmartphone, Database, Trash2, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function SettingsPhase() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{t('settings.title')}</h1>
        <p className="mt-2 text-slate-500">{t('settings.desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center justify-between px-4 py-3 bg-white text-slate-900 border border-slate-200 shadow-sm font-medium rounded-xl text-sm transition-colors text-left">
            <span className="flex items-center gap-3"><Globe className="w-4 h-4 text-indigo-500" /> {t('settings.language')}</span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 font-medium rounded-xl text-sm transition-colors text-left">
            <span className="flex items-center gap-3"><MonitorSmartphone className="w-4 h-4 text-slate-400" /> {t('settings.theme')}</span>
          </button>
          <button className="w-full flex items-center justify-between px-4 py-3 bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 font-medium rounded-xl text-sm transition-colors text-left">
            <span className="flex items-center gap-3"><Database className="w-4 h-4 text-slate-400" /> {t('settings.storage')}</span>
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-200 bg-slate-50">
               <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  {t('settings.language')}
               </h2>
             </div>
             <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">App Language</label>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <label className={`flex-1 relative flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${language === 'en' ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" name="lang" value="en" checked={language === 'en'} onChange={() => setLanguage('en')} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${language === 'en' ? 'border-indigo-600' : 'border-slate-300'}`}>
                           {language === 'en' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                        </div>
                        <div>
                           <div className="font-semibold text-slate-900 text-sm">English</div>
                        </div>
                     </label>
                     <label className={`flex-1 relative flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${language === 'de' ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" name="lang" value="de" checked={language === 'de'} onChange={() => setLanguage('de')} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${language === 'de' ? 'border-indigo-600' : 'border-slate-300'}`}>
                           {language === 'de' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                        </div>
                        <div>
                           <div className="font-semibold text-slate-900 text-sm">Deutsch</div>
                        </div>
                     </label>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-200 bg-slate-50">
               <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  {t('settings.storage')} & Offline Data
               </h2>
             </div>
             <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 gap-4">
                   <div>
                      <h3 className="font-semibold text-slate-900 text-sm">Local Vector Store (OPFS)</h3>
                      <p className="text-xs text-slate-500 mt-1">Contains your embedded PDFs and references.</p>
                   </div>
                   <span className="text-sm font-medium text-slate-600">428 MB</span>
                </div>
                <button className="flex items-center justify-center gap-2 w-full py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-lg text-sm transition-colors mt-2">
                   <Trash2 className="w-4 h-4" />
                   {t('settings.clear')}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
