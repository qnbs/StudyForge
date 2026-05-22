import { useState } from 'react';
import { UploadCloud, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { toast } from 'sonner';
import { ragService } from '../../lib/rag/ragService';

export function LocalLibrary() {
  const { t } = useLanguage();
  const liveLocalSources = useLiveQuery(() => db.sources.toArray()) || [];

  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPdf(true);
    setProcessingStatus(`Processing ${file.name}...`);

    try {
      await ragService.ingestSource(
        file,
        file.name,
        ['Unknown (Local PDF)'],
        new Date().getFullYear(),
        (msg) => setProcessingStatus(msg)
      );

      toast.success('PDF successfully ingested and vectorized locally!');
    } catch (err) {
      console.error(err);
      toast.error('Error processing PDF.');
    } finally {
      setIsProcessingPdf(false);
      setProcessingStatus('');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <label className="flex-1 sm:flex-none items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-medium px-4 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors text-sm flex cursor-pointer">
            <UploadCloud className="w-4 h-4" />
            {t('lib.import')}
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isProcessingPdf}
            />
          </label>
        </div>
      </div>

      {isProcessingPdf && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span className="font-medium">{processingStatus}</span>
        </div>
      )}

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
            {liveLocalSources.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">
                  {t('lib.emptyLocal') || 'No local sources found.'}
                </td>
              </tr>
            )}
            {liveLocalSources.map((source, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-900 line-clamp-2" dangerouslySetInnerHTML={{ __html: source.title }}></span>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 w-fit px-1.5 py-0.5 rounded mt-1 bg-slate-100 uppercase tracking-wider">
                        {source.type}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600 truncate max-w-[200px]">{source.authors.join(', ')}</td>
                <td className="p-4 text-sm text-slate-600">{source.year}</td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {source.isVectorized ? (t('lib.vectorized') || 'Vectorized') : (t('lib.available') || 'Available')}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
