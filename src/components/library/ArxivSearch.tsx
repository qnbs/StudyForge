import { useState } from 'react';
import { Search, Loader2, Unlock, Plus, CheckCircle2, Database, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { db } from '../../lib/db';
import { toast } from 'sonner';

interface ArxivResult {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  isOpenAccess: boolean;
  pdfUrl?: string | null;
}

export function ArxivSearch() {
  const { t } = useLanguage();
  
  const [isSearchingArxiv, setIsSearchingArxiv] = useState(false);
  const [arxivQuery, setArxivQuery] = useState('');
  const [arxivResults, setArxivResults] = useState<ArxivResult[]>([]);
  const [arxivError, setArxivError] = useState('');
  const [arxivSort, setArxivSort] = useState('relevance');
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const handleArxivSearch = async () => {
    if (!arxivQuery.trim()) return;
    setIsSearchingArxiv(true);
    setArxivError('');
    setArxivResults([]);
    
    try {
      const sortBy = arxivSort === 'relevance' ? 'relevance' : 'submittedDate';
      const response = await fetch(`https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(arxivQuery)}&start=0&max_results=20&sortBy=${sortBy}&sortOrder=descending`);
      
      if (!response.ok) {
         throw new Error('Network response was not ok');
      }
      
      const textData = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(textData, "text/xml");
      
      const entries = xmlDoc.getElementsByTagName("entry");
      if (entries.length === 0) {
        setArxivError(t('lib.pubmedNoResults'));
        setIsSearchingArxiv(false);
        return;
      }
      
      const results = Array.from(entries).map((entry) => {
        const idFull = entry.getElementsByTagName("id")[0]?.textContent || '';
        const id = idFull.split('/abs/')[1] || idFull;
        const title = entry.getElementsByTagName("title")[0]?.textContent || 'Unknown Title';
        const authorsNodes = entry.getElementsByTagName("author");
        const authors = Array.from(authorsNodes).map(node => node.getElementsByTagName("name")[0]?.textContent).join(', ');
        const publishedDate = entry.getElementsByTagName("published")[0]?.textContent || '';
        const year = publishedDate ? publishedDate.split('-')[0] : 'Unknown Year';
        const pdfLink = Array.from(entry.getElementsByTagName("link")).find(link => link.getAttribute('title') === 'pdf')?.getAttribute('href');
        
        return {
          id,
          title,
          authors,
          journal: 'arXiv',
          year,
          isOpenAccess: true,
          pdfUrl: pdfLink
        };
      });
      
      setArxivResults(results);
    } catch (err) {
      setArxivError(t('lib.pubmedError'));
      console.error(err);
    } finally {
      setIsSearchingArxiv(false);
    }
  };

  const handleImportToLocal = async (result: ArxivResult) => {
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
            placeholder={t('lib.arxivSearch')}
            value={arxivQuery}
            onChange={e => setArxivQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleArxivSearch()}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-colors"
          />
        </div>
        <select
          value={arxivSort}
          onChange={e => setArxivSort(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-colors"
        >
          <option value="relevance">Relevance</option>
          <option value="submittedDate">Date</option>
        </select>
        <button 
          onClick={handleArxivSearch}
          disabled={isSearchingArxiv || !arxivQuery.trim()}
          className="flex items-center justify-center gap-2 bg-orange-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          {isSearchingArxiv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isSearchingArxiv ? t('lib.pubmedSearching') : t('lib.pubmedBtn')}
        </button>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
        {arxivError ? (
          <div className="p-8 text-center text-red-600 text-sm">{arxivError}</div>
        ) : arxivResults.length > 0 ? (
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
                {arxivResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-900 line-clamp-2">{result.title}</span>
                        <span className="text-xs text-orange-600 font-medium">{result.journal}</span>
                        <div className="flex items-center gap-2 mt-1">
                          {result.isOpenAccess && (
                            <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 w-fit px-1.5 py-0.5 rounded">
                              <Unlock className="w-3 h-3" />
                              {t('lib.openAccess')}
                            </div>
                          )}
                          {result.pdfUrl && (
                            <a href={result.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 w-fit px-1.5 py-0.5 rounded hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                              <FileText className="w-3 h-3" />
                              {t('lib.hasPdf')}
                            </a>
                          )}
                        </div>
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
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
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
                <Database className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-md font-medium text-slate-900 mb-2">arXiv Integration</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{t('lib.arxivDesc')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
