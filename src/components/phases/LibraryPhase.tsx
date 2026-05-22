import { Database, Search, Filter, UploadCloud, RefreshCw, CheckCircle2, FileText, ArrowDownToLine, Loader2, Plus, Unlock } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export function LibraryPhase() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'local' | 'zotero' | 'mendeley' | 'pubmed' | 'arxiv' | 'archive'>('local');

  const [isSearchingPubMed, setIsSearchingPubMed] = useState(false);
  const [pubMedQuery, setPubMedQuery] = useState('');
  const [pubMedResults, setPubMedResults] = useState<any[]>([]);
  const [pubMedError, setPubMedError] = useState('');
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const [isSearchingArxiv, setIsSearchingArxiv] = useState(false);
  const [arxivQuery, setArxivQuery] = useState('');
  const [arxivResults, setArxivResults] = useState<any[]>([]);
  const [arxivError, setArxivError] = useState('');
  const [arxivSort, setArxivSort] = useState('relevance');

  const [isSearchingArchive, setIsSearchingArchive] = useState(false);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [archiveResults, setArchiveResults] = useState<any[]>([]);
  const [archiveError, setArchiveError] = useState('');
  const [archiveSort, setArchiveSort] = useState('downloads+desc');

  const [localSources, setLocalSources] = useState([
    { title: "Local-first software: you own your data, in spite of the cloud", authors: "Kleppmann et al.", year: "2019", type: "PDF", status: 'synced', isOpenAccess: true },
    { title: "Privacy-Preserving AI in Browser Environments", authors: "Chen, M., et al.", year: "2025", type: "Journal", status: 'synced', isOpenAccess: false },
    { title: "Evaluating WebAssembly for High-Performance Client-Side Computing", authors: "Smith, J.", year: "2024", type: "Conference", status: 'synced', isOpenAccess: true }
  ]);

  const [pubMedSort, setPubMedSort] = useState('relevance');

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
          isOpenAccess = item.articleids.some((idObj: any) => idObj.idtype === 'pmc' || idObj.idtype === 'pmcid');
        }

        return {
          id: item.uid,
          title: item.title,
          authors: item.authors?.map((a: any) => a.name).join(', ') || 'Unknown Authors',
          journal: item.fulljournalname || item.source,
          year: item.pubdate ? item.pubdate.split(' ')[0] : 'Unknown Year',
          isOpenAccess
        };
      }).filter(Boolean);
      
      setPubMedResults(results);
      
    } catch (err) {
      setPubMedError(t('lib.pubmedError'));
      console.error(err);
    } finally {
      setIsSearchingPubMed(false);
    }
  };

  const handleArxivSearch = async () => {
    if (!arxivQuery.trim()) return;
    setIsSearchingArxiv(true);
    setArxivError('');
    setArxivResults([]);
    
    try {
      const sortBy = arxivSort === 'relevance' ? 'relevance' : 'submittedDate';
      // ArXiv API requires URL encoding 
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
          isOpenAccess: true, // arXiv is strictly Open Access
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

  const handleArchiveSearch = async () => {
    if (!archiveQuery.trim()) return;
    setIsSearchingArchive(true);
    setArchiveError('');
    setArchiveResults([]);
    
    try {
      // Internet Archive Advanced Search API
      const searchUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(archiveQuery)}&fl[]=identifier,title,creator,date,mediatype,publicdate,downloads&sort[]=${archiveSort}&rows=20&output=json`;
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
         throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (!data.response || !data.response.docs || data.response.docs.length === 0) {
        setArchiveError(t('lib.pubmedNoResults'));
        setIsSearchingArchive(false);
        return;
      }
      
      const results = data.response.docs.map((item: any) => {
        const id = item.identifier;
        const title = item.title || 'Unknown Title';
        const authors = Array.isArray(item.creator) ? item.creator.join(', ') : (item.creator || 'Unknown Authors');
        const year = item.date ? item.date.substring(0, 4) : (item.publicdate ? item.publicdate.substring(0, 4) : 'Unknown Year');
        const journal = item.mediatype === 'texts' ? 'Text/Book' : item.mediatype;
        
        return {
          id,
          title,
          authors,
          journal,
          year,
          isOpenAccess: true, // Internet Archive is implicitly Open Access
          pdfUrl: `https://archive.org/details/${id}`
        };
      });
      
      setArchiveResults(results);
    } catch (err) {
      setArchiveError(t('lib.pubmedError'));
      console.error(err);
    } finally {
      setIsSearchingArchive(false);
    }
  };

  const handleImportToLocal = (result: any) => {
    setImportedIds(prev => {
      const next = new Set(prev);
      next.add(result.id);
      return next;
    });
    setLocalSources(prev => [
      ...prev,
      {
        title: result.title,
        authors: result.authors,
        year: result.year,
        type: 'PubMed',
        status: 'synced'
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{t('lib.title')}</h1>
        <p className="mt-2 text-slate-500">{t('lib.desc')}</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg w-fit overflow-x-auto max-w-full">
        <button 
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'local' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t('lib.local')}
        </button>
        <button 
          onClick={() => setActiveTab('pubmed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap ${activeTab === 'pubmed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          {t('lib.pubmed')}
        </button>
        <button 
          onClick={() => setActiveTab('arxiv')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap ${activeTab === 'arxiv' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          {t('lib.arxiv')}
        </button>
        <button 
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap ${activeTab === 'archive' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          {t('lib.archive')}
        </button>
        <button 
          onClick={() => setActiveTab('zotero')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap ${activeTab === 'zotero' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          {t('lib.zotero')}
        </button>
        <button 
          onClick={() => setActiveTab('mendeley')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors gap-2 flex items-center whitespace-nowrap ${activeTab === 'mendeley' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <span className="w-2 h-2 rounded-full bg-red-700"></span>
          {t('lib.mendeley')}
        </button>
      </div>

      {activeTab === 'local' && (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('lib.searchLocal')}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 sm:flex-none items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-medium px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors text-sm flex">
                <UploadCloud className="w-4 h-4" />
                {t('lib.import')}
              </button>
              <button className="flex-1 sm:flex-none items-center justify-center gap-2 bg-slate-900 text-white font-medium px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors text-sm flex">
                <ArrowDownToLine className="w-4 h-4" />
                {t('lib.export')}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">{t('lib.tableTitle')}</th>
                  <th className="p-4">{t('lib.tableAuthors')}</th>
                  <th className="p-4">{t('lib.tableYear')}</th>
                  <th className="p-4">{t('lib.tableStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localSources.map((source, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-slate-900 line-clamp-2" dangerouslySetInnerHTML={{ __html: source.title }}></span>
                          {source.isOpenAccess && (
                            <div className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 w-fit px-1.5 py-0.5 rounded">
                              <Unlock className="w-3 h-3" />
                              {t('lib.openAccess')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 truncate max-w-[200px]">{source.authors}</td>
                    <td className="p-4 text-sm text-slate-600">{source.year}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t('lib.availableOffline')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'pubmed' && (
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
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
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
      )}

      {activeTab === 'arxiv' && (
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
              className="flex items-center justify-center gap-2 bg-orange-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
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
                                <a href={result.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 w-fit px-1.5 py-0.5 rounded hover:bg-indigo-100">
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-orange-600 hover:border-orange-200 transition-colors shadow-sm"
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
      )}

      {activeTab === 'archive' && (
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('lib.archiveSearch')}
                value={archiveQuery}
                onChange={e => setArchiveQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleArchiveSearch()}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors"
              />
            </div>
            <select
              value={archiveSort}
              onChange={e => setArchiveSort(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-colors"
            >
              <option value="downloads+desc">Popularity</option>
              <option value="publicdate+desc">Date Added</option>
              <option value="date+desc">Published Date</option>
            </select>
            <button 
              onClick={handleArchiveSearch}
              disabled={isSearchingArchive || !archiveQuery.trim()}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
            >
              {isSearchingArchive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isSearchingArchive ? t('lib.pubmedSearching') : t('lib.pubmedBtn')}
            </button>
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative">
            {archiveError ? (
              <div className="p-8 text-center text-red-600 text-sm">{archiveError}</div>
            ) : archiveResults.length > 0 ? (
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
                    {archiveResults.map((result) => (
                      <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-900 line-clamp-2">{result.title}</span>
                            <span className="text-xs text-indigo-600 font-medium">{result.journal}</span>
                            <div className="flex items-center gap-2 mt-1">
                              {result.isOpenAccess && (
                                <div className="flex items-center gap-1 text-[10px] font-medium text-orange-600 bg-orange-50 w-fit px-1.5 py-0.5 rounded">
                                  <Unlock className="w-3 h-3" />
                                  {t('lib.openAccess')}
                                </div>
                              )}
                              {result.pdfUrl && (
                                <a href={result.pdfUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 w-fit px-1.5 py-0.5 rounded hover:bg-indigo-100">
                                  <FileText className="w-3 h-3" />
                                  View Item
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
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
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
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                    <Database className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="text-md font-medium text-slate-900 mb-2">Internet Archive</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t('lib.archiveDesc')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'zotero' && (
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-hidden pb-16 md:pb-0">
          <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 flex flex-col items-center justify-center text-center shrink-0 h-fit">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-red-100">
              <span className="text-xl md:text-2xl font-bold text-red-500 font-serif">Z</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">Connect to Zotero</h2>
            <p className="text-slate-500 max-w-md mb-4 md:mb-6 text-xs md:text-sm">
              Sync your Zotero collections directly into your local database.
            </p>
            <div className="space-y-3 w-full">
              <input type="text" placeholder="Zotero User ID" className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="password" placeholder="Zotero API Key" className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 md:py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button className="w-full bg-slate-900 text-white font-medium py-2.5 md:py-2 rounded-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 text-sm">
                <RefreshCw className="w-4 h-4" /> Connect & Sync
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-sm">Sync Status</h2>
              <span className="text-[10px] md:text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Last synced 2h ago</span>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-center">
                  <p className="text-xl md:text-3xl font-display font-bold text-slate-900">34</p>
                  <p className="text-[9px] md:text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Items</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 md:p-4 text-center">
                  <p className="text-xl md:text-3xl font-display font-bold text-emerald-600">32</p>
                  <p className="text-[9px] md:text-xs text-emerald-600/80 font-medium uppercase tracking-wider mt-1">Synced</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 md:p-4 text-center">
                  <p className="text-xl md:text-3xl font-display font-bold text-yellow-600">2</p>
                  <p className="text-[9px] md:text-xs text-yellow-600/80 font-medium uppercase tracking-wider mt-1">Conflicts</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 md:mb-3">Recent Activity</h3>
                <div className="space-y-2 md:space-y-3">
                  {[
                    { msg: "Synced 'Deep Learning in Academia'", time: "2h ago", status: "success" },
                    { msg: "Synced 'WebGPU performance metrics'", time: "2h ago", status: "success" },
                    { msg: "Conflict resolution needed: 'Smith_2024.pdf'", time: "2h ago", status: "conflict" }
                  ].map((log, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                        <span className="text-xs text-slate-400 sm:hidden">{log.time}</span>
                      </div>
                      <p className="text-[11px] md:text-sm text-slate-700 flex-1 ml-4 sm:ml-0">{log.msg}</p>
                      <span className="hidden sm:block text-xs text-slate-400 whitespace-nowrap">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'mendeley' && (
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-y-auto md:overflow-hidden pb-16 md:pb-0">
          <div className="w-full md:w-1/3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 flex flex-col items-center justify-center text-center shrink-0 h-fit">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-red-100">
              <span className="text-xl md:text-2xl font-bold text-red-700 font-serif">M</span>
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900 mb-2">Connect to Mendeley</h2>
            <p className="text-slate-500 max-w-md mb-4 md:mb-6 text-xs md:text-sm">
              Authenticate with your Mendeley account to import your library. 
            </p>
            <div className="space-y-3 w-full">
              <button className="w-full bg-[#9E002B] text-white font-medium py-2.5 md:py-2 rounded-lg hover:bg-red-800 transition-colors flex justify-center items-center gap-2 text-sm">
                 Authenticate via OAuth
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl border-dashed flex flex-col items-center justify-center text-center p-6 md:p-8 min-h-[200px]">
             <Database className="w-6 h-6 md:w-8 md:h-8 text-slate-300 mb-2 md:mb-3" />
             <p className="text-slate-500 text-xs md:text-sm px-4">Authenticate with Mendeley to view sync status and item history.</p>
          </div>
        </div>
      )}
    </div>
  );
}
