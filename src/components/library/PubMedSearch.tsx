import { useState } from 'react';
import { Search, Loader2, Unlock, Plus, CheckCircle2, Database } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../lib/db';
import { toast } from 'sonner';

interface PubMedResult {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  isOpenAccess: boolean;
}

export function PubMedSearch() {
  const { t } = useLanguage();
  
  const [isSearchingPubMed, setIsSearchingPubMed] = useState(false);
  const [pubMedQuery, setPubMedQuery] = useState('');
  const [pubMedResults, setPubMedResults] = useState<PubMedResult[]>([]);
  const [pubMedError, setPubMedError] = useState('');
  const [pubMedSort, setPubMedSort] = useState('relevance');
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const handlePubMedSearch = async () => {
    if (!pubMedQuery.trim()) return;
    setIsSearchingPubMed(true);
    setPubMedError('');
    setPubMedResults([]);
    
    try {
      const searchRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(pubMedQuery)}&retmode=json&retmax=20&sort=${pubMedSort}`);
      const searchData = await searchRes.json();
      const idList = searchData.esearchresult?.idlist || [];
      
      if (idList.length === 0) {
        setPubMedError(t('lib.pubmedNoResults'));
        setIsSearchingPubMed(false);
        return;
      }
      
      const summaryRes = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`);
      const summaryData = await summaryRes.json();
      
      const results = idList.map((id: string) => {
        const item = summaryData.result[id];
        if (!item) return null;
        
        let isOpenAccess = false;
        if (item.articleids) {
          isOpenAccess = item.articleids.some((idObj: { idtype: string }) => idObj.idtype === 'pmc' || idObj.idtype === 'pmcid');
        }

        return {
          id: item.uid,
          title: item.title,
          authors: item.authors?.map((a: { name: string }) => a.name).join(', ') || 'Unknown Authors',
          journal: item.fulljournalname || item.source,
          year: item.pubdate ? item.pubdate.split(' ')[0] : 'Unknown Year',
          isOpenAccess
        };
      }).filter(Boolean) as PubMedResult[];
      
      setPubMedResults(results);
      
    } catch (err) {
      setPubMedError(t('lib.pubmedError'));
      console.error(err);
    } finally {
      setIsSearchingPubMed(false);
    }
  };

  const handleImportToLocal = async (result: PubMedResult) => {
    setImportedIds(prev => new Set(prev).add(result.id));
    
    await db.sources.add({
      id: result.id,
      title: result.title,
      authors: [result.authors],
      year: parseInt(result.year) || new Date().getFullYear(),
      type: 'web',
      addedAt: new Date().toISOString()
    });
    toast.success('Imported to local library');
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('lib.pubmedSearch')}
            value={pubMedQuery}
            onChange={e => setPubMedQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePubMedSearch()}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors"
          />
        </div>
        <select
          value={pubMedSort}
          onChange={e => setPubMedSort(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors"
        >
          <option value="relevance">Relevance</option>
          <option value="pub_date">Date</option>
        </select>
        <button 
          onClick={handlePubMedSearch}
          disabled={isSearchingPubMed || !pubMedQuery.trim()}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {isSearchingPubMed ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isSearchingPubMed ? t('lib.pubmedSearching') : t('lib.pubmedBtn')}
        </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        {pubMedError ? (
          <div className="p-8 text-center text-red-600 text-sm">{pubMedError}</div>
        ) : pubMedResults.length > 0 ? (
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0">
                  <th className="p-4">{t('lib.tableTitle')}</th>
                  <th className="p-4">{t('lib.tableAuthors')}</th>
                  <th className="p-4">{t('lib.tableYear')}</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pubMedResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-900 line-clamp-2">{result.title}</span>
                        <span className="text-xs text-indigo-600 font-medium">{result.journal}</span>
                        {result.isOpenAccess && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 w-fit px-1.5 py-0.5 rounded mt-1">
                            <Unlock className="w-3 h-3" />
                            {t('lib.openAccess')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-600 max-w-[200px]">
                      <span className="line-clamp-2">{result.authors}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{result.year}</td>
                    <td className="p-4 text-right align-middle">
                      {importedIds.has(result.id) ? (
                        <button disabled className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('lib.pubmedImported')}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleImportToLocal(result)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {t('lib.pubmedImport')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Database className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-md font-medium text-slate-900 mb-2">PubMed Integration</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t('lib.pubmedDesc')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
