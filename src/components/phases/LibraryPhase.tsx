import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LocalLibrary } from '../library/LocalLibrary';
import { PubMedSearch } from '../library/PubMedSearch';
import { ArxivSearch } from '../library/ArxivSearch';
import { ArchiveSearch } from '../library/ArchiveSearch';
import { ZoteroSync } from '../library/ZoteroSync';
import { MendeleySync } from '../library/MendeleySync';

export function LibraryPhase() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'local' | 'zotero' | 'mendeley' | 'pubmed' | 'arxiv' | 'archive'>('local');

  return (
    <div className="max-w-5xl mx-auto space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{t('lib.title')}</h1>
        <p className="mt-2 text-slate-500">{t('lib.desc')}</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'local' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('lib.local')}
        </button>
        <button 
          onClick={() => setActiveTab('pubmed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'pubmed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          {t('lib.pubmed')}
        </button>
        <button 
          onClick={() => setActiveTab('arxiv')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${activeTab === 'arxiv' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          {t('lib.arxiv')}
        </button>
        <button 
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${activeTab === 'archive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          {t('lib.archive')}
        </button>
        <button 
          onClick={() => setActiveTab('zotero')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${activeTab === 'zotero' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          {t('lib.zotero')}
        </button>
        <button 
          onClick={() => setActiveTab('mendeley')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 ${activeTab === 'mendeley' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-red-700"></span>
          {t('lib.mendeley')}
        </button>
      </div>

      {activeTab === 'local' && <LocalLibrary />}
      {activeTab === 'pubmed' && <PubMedSearch />}
      {activeTab === 'arxiv' && <ArxivSearch />}
      {activeTab === 'archive' && <ArchiveSearch />}
      {activeTab === 'zotero' && <ZoteroSync />}
      {activeTab === 'mendeley' && <MendeleySync />}
    </div>
  );
}
