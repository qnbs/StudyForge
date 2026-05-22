import { MonitorSmartphone, Database, Trash2, ShieldCheck, Globe, Cpu, Download, Upload, Moon, Sun, Lock } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { SecureVaultSettings } from '../SecureVaultSettings';
import { motion, AnimatePresence } from 'motion/react';

export function SettingsPhase() {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'language' | 'theme' | 'model' | 'storage' | 'privacy'>('language');

  const globalSettings = useLiveQuery(() => db.settings.get('global'));
  
  const handleUpdateSetting = async (key: string, value: string) => {
    if (globalSettings) {
      await db.settings.update('global', { [key]: value });
    }
  };

  const handleClearDatabase = async () => {
    if (window.confirm(t('settings.clearConfirm') || "Are you sure you want to clear all local data? This cannot be undone.")) {
      await db.delete();
      window.location.reload();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 }
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-8 pb-20 md:pb-0 h-full flex flex-col"
    >
      <motion.div variants={itemVariants} className="shrink-0">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{t('settings.title')}</h1>
        <p className="mt-2 text-slate-500">{t('settings.desc')}</p>
      </motion.div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-8 overflow-hidden">
        {/* Sidebar Nav */}
        <motion.div variants={itemVariants} className="w-full md:w-64 flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-1 shrink-0 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 hide-scrollbar snap-x relative z-10">
          <button 
            onClick={() => setActiveTab('language')}
            className={`relative flex-none w-[140px] md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 font-medium rounded-xl text-xs md:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-center md:text-left snap-start ${activeTab === 'language' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900'}`}
          >
            {activeTab === 'language' && <motion.div layoutId="settingTab" className="absolute inset-0 bg-white shadow-sm border border-slate-200 rounded-xl" />}
            <Globe className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 relative z-10 ${activeTab === 'language' ? 'text-indigo-600' : 'text-slate-400'}`} /> <span className="relative z-10">{t('settings.language')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('theme')}
            className={`relative flex-none w-[140px] md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 font-medium rounded-xl text-xs md:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-center md:text-left snap-start ${activeTab === 'theme' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900'}`}
          >
            {activeTab === 'theme' && <motion.div layoutId="settingTab" className="absolute inset-0 bg-white shadow-sm border border-slate-200 rounded-xl" />}
            <MonitorSmartphone className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 relative z-10 ${activeTab === 'theme' ? 'text-indigo-600' : 'text-slate-400'}`} /> <span className="relative z-10">{t('settings.theme')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('model')}
            className={`relative flex-none w-[140px] md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 font-medium rounded-xl text-xs md:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-center md:text-left snap-start ${activeTab === 'model' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900'}`}
          >
            {activeTab === 'model' && <motion.div layoutId="settingTab" className="absolute inset-0 bg-white shadow-sm border border-slate-200 rounded-xl" />}
            <Cpu className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 relative z-10 ${activeTab === 'model' ? 'text-indigo-600' : 'text-slate-400'}`} /> <span className="relative z-10">{t('settings.model')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('storage')}
            className={`relative flex-none w-[140px] md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 font-medium rounded-xl text-xs md:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-center md:text-left snap-start ${activeTab === 'storage' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900'}`}
          >
             {activeTab === 'storage' && <motion.div layoutId="settingTab" className="absolute inset-0 bg-white shadow-sm border border-slate-200 rounded-xl" />}
            <Database className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 relative z-10 ${activeTab === 'storage' ? 'text-indigo-600' : 'text-slate-400'}`} /> <span className="relative z-10">{t('settings.storage')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`relative flex-none w-[140px] md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 font-medium rounded-xl text-xs md:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-center md:text-left snap-start ${activeTab === 'privacy' ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' : 'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900'}`}
          >
             {activeTab === 'privacy' && <motion.div layoutId="settingTab" className="absolute inset-0 bg-white shadow-sm border border-slate-200 rounded-xl" />}
            <ShieldCheck className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 relative z-10 ${activeTab === 'privacy' ? 'text-indigo-600' : 'text-slate-400'}`} /> <span className="relative z-10">{t('settings.privacy')}</span>
          </button>
        </motion.div>

        {/* Content Area */}
        <motion.div variants={itemVariants} className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
          <AnimatePresence mode="wait">
          {activeTab === 'language' && (
            <motion.div key="language" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full absolute inset-0 pb-6 overflow-y-auto">
              <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                   <Globe className="w-5 h-5 text-indigo-600" />
                   {t('settings.language')}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-3">{t('settings.langTitle') || 'App Language Preference'}</label>
                   <div className="flex flex-col sm:flex-row gap-4">
                      <label className={`flex-1 relative flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${language === 'en' ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                         <input type="radio" name="lang" value="en" checked={language === 'en'} onChange={() => setLanguage('en')} className="sr-only" />
                         <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${language === 'en' ? 'border-indigo-600' : 'border-slate-300'}`}>
                            {language === 'en' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                         </div>
                         <div>
                            <div className="font-semibold text-slate-900 text-sm">English</div>
                            <div className="text-xs text-slate-500 mt-1">{t('settings.langEnDesc') || 'Default application language'}</div>
                         </div>
                      </label>
                      <label className={`flex-1 relative flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${language === 'de' ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                         <input type="radio" name="lang" value="de" checked={language === 'de'} onChange={() => setLanguage('de')} className="sr-only" />
                         <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${language === 'de' ? 'border-indigo-600' : 'border-slate-300'}`}>
                            {language === 'de' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                         </div>
                         <div>
                            <div className="font-semibold text-slate-900 text-sm">Deutsch</div>
                            <div className="text-xs text-slate-500 mt-1">{t('settings.langDeDesc') || 'Deutsche Benutzeroberfläche'}</div>
                         </div>
                      </label>
                   </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'theme' && (
            <motion.div key="theme" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full absolute inset-0 pb-6 overflow-y-auto">
              <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                   <MonitorSmartphone className="w-5 h-5 text-indigo-600" />
                   {t('settings.theme')}
                </h2>
              </div>
              <div className="p-6 space-y-6">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-3">{t('settings.colorScheme') || 'Color Scheme'}</label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {['Light', 'Dark', 'System'].map((theme, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleUpdateSetting('theme', theme.toLowerCase())}
                          className={`p-4 border rounded-xl cursor-pointer transition-all ${globalSettings?.theme === theme.toLowerCase() ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'}`}>
                           <div className="flex items-center justify-between mb-3">
                             <span className="font-semibold text-slate-900 text-sm">{theme}</span>
                             {i === 0 && <Sun className="w-4 h-4 text-slate-400" />}
                             {i === 1 && <Moon className="w-4 h-4 text-slate-400" />}
                             {i === 2 && <MonitorSmartphone className="w-4 h-4 text-slate-400" />}
                           </div>
                           <div className="h-12 w-full rounded bg-slate-100 overflow-hidden flex flex-col gap-1 p-1 border border-slate-200">
                             <div className="h-2 w-full bg-white rounded-sm border border-slate-200"></div>
                             <div className="h-full w-full bg-white rounded-sm border border-slate-200 flex p-1 gap-1">
                                <div className="h-full w-1/4 bg-slate-100 rounded-sm"></div>
                                <div className="h-full flex-1 bg-slate-50 rounded-sm"></div>
                             </div>
                           </div>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'model' && (
            <motion.div key="model" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full absolute inset-0 pb-6 overflow-y-auto">
              <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                   <Cpu className="w-5 h-5 text-indigo-600" />
                   {t('settings.model')}
                </h2>
              </div>
              <div className="p-6 space-y-8">
                 <div>
                   <label className="block text-sm font-medium text-slate-900 mb-1">{t('settings.defaultModel')}</label>
                   <p className="text-xs text-slate-500 mb-3">{t('settings.defaultModelDesc')}</p>
                   <select 
                     value={['low', 'medium', 'high'].includes(globalSettings?.modelLimitConfig || '') ? globalSettings?.modelLimitConfig : 'custom'}
                     onChange={(e) => {
                         if (e.target.value !== 'custom') {
                             handleUpdateSetting('modelLimitConfig', e.target.value);
                         } else {
                             handleUpdateSetting('modelLimitConfig', '');
                         }
                     }}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3 transition-shadow">
                     <option value="low">Llama 3.2 1B (Fast, Low End) - ~1 GB</option>
                     <option value="medium">Phi 3.5 Mini (Recommended) - ~2.5 GB</option>
                     <option value="high">Llama 3.1 8B (High Quality) - ~5 GB</option>
                     <option value="custom">Custom GGUF URL...</option>
                   </select>
                   <div className={`${['low', 'medium', 'high'].includes(globalSettings?.modelLimitConfig || '') ? 'hidden' : 'block'}`}>
                      <input 
                         type="url"
                         placeholder="https://huggingface.co/.../*.gguf"
                         value={(!['low', 'medium', 'high'].includes(globalSettings?.modelLimitConfig || '')) ? globalSettings?.modelLimitConfig || '' : ''}
                         onChange={(e) => handleUpdateSetting('modelLimitConfig', e.target.value)}
                         className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-shadow"
                      />
                      <p className="text-xs text-slate-400 mt-1">Paste a direct link to any .gguf file (e.g. from HuggingFace). K-Quants (Q4_K_M etc.) are fully supported!</p>
                   </div>
                 </div>
                 
                 <div>
                   <div className="flex justify-between mb-1">
                     <label className="block text-sm font-medium text-slate-900">{t('settings.memoryLimit')}</label>
                     <span className="text-sm font-mono text-indigo-600">4096 MB</span>
                   </div>
                   <p className="text-xs text-slate-500 mb-4">{t('settings.memoryLimitDesc')}</p>
                   <input type="range" min="1024" max="8192" step="512" defaultValue="4096" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                   <div className="flex justify-between text-xs font-mono text-slate-400 mt-2">
                     <span>1GB</span>
                     <span>4GB</span>
                     <span>8GB</span>
                   </div>
                 </div>

                 <hr className="border-slate-200" />
                 
                 <div className="pt-2">
                   <SecureVaultSettings />
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'storage' && (
            <motion.div key="storage" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full absolute inset-0 pb-6 overflow-y-auto">
              <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                   <Database className="w-5 h-5 text-indigo-600" />
                   {t('settings.storage')}
                </h2>
              </div>
              <div className="p-6 space-y-8">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow group">
                       <h3 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{t('settings.indexedDb') || 'IndexedDB (Library)'}</h3>
                       <p className="text-xs text-slate-500 mt-1 mb-3">{t('settings.indexedDbDesc') || 'Store metadata and app state.'}</p>
                       <div className="flex items-end justify-between">
                         <span className="text-2xl font-bold text-slate-700 group-hover:scale-105 transition-transform origin-left">12.4 <span className="text-sm font-medium text-slate-400">MB</span></span>
                       </div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow group">
                       <h3 className="font-semibold text-indigo-900 text-sm">{t('settings.opfs') || 'OPFS (Vector Store)'}</h3>
                       <p className="text-xs text-indigo-600 mt-1 mb-3">{t('settings.opfsDesc') || 'Local embeddings & PDFs.'}</p>
                       <div className="flex items-end justify-between">
                         <span className="text-2xl font-bold text-indigo-700 group-hover:scale-105 transition-transform origin-left">428.1 <span className="text-sm font-medium text-indigo-400">MB</span></span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 text-sm border-b border-slate-100 pb-2">{t('settings.dataHandling') || 'Data Management'}</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm hover:shadow">
                          <Download className="w-4 h-4" />
                          {t('settings.exportData')}
                       </button>
                       <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-sm hover:shadow">
                          <Upload className="w-4 h-4" />
                          {t('settings.importData')}
                       </button>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-200">
                   <h3 className="font-bold text-red-600 text-sm mb-3 uppercase tracking-wider">{t('settings.dangerZone')}</h3>
                   <button 
                     onClick={handleClearDatabase}
                     className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shadow-sm hover:shadow">
                      <Trash2 className="w-4 h-4" />
                      {t('settings.clear')}
                   </button>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div key="privacy" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col h-full absolute inset-0 pb-6 overflow-y-auto">
              <div className="p-6 border-b border-slate-200 bg-slate-50 shrink-0">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                   <ShieldCheck className="w-5 h-5 text-indigo-600" />
                   {t('settings.privacy')}
                </h2>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                 <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-4">
                    <Lock className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-sm">{t('settings.privacyLocalTitle') || 'Your Data is Local'}</h3>
                      <p className="text-sm text-emerald-700 mt-1 leading-relaxed">{t('settings.privacyLocalDesc') || 'StudyForge is designed to operate entirely offline after the initial model download. Your documents, chat history, and API keys never leave your browser.'}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                       <div className="relative flex items-center mt-0.5">
                         <input type="checkbox" className="sr-only peer" defaultChecked />
                         <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                       </div>
                       <div>
                         <div className="font-semibold text-slate-900 text-sm">{t('settings.localOnly')}</div>
                         <div className="text-xs text-slate-500 mt-1">{t('settings.localOnlyDesc')}</div>
                       </div>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                       <div className="relative flex items-center mt-0.5">
                         <input type="checkbox" className="sr-only peer" />
                         <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                       </div>
                       <div>
                         <div className="font-semibold text-slate-900 text-sm">{t('settings.analyticsTitle') || 'Anonymous Usage Analytics'}</div>
                         <div className="text-xs text-slate-500 mt-1">{t('settings.analyticsDesc') || 'Help us improve by sending crash reports and basic usage metrics. We never collect content.'}</div>
                       </div>
                    </label>
                 </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
