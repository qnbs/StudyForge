import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function PlanningPhase() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-16 md:pb-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 tracking-tight">{t('planning.title')}</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-slate-500">{t('planning.desc')}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-8 shadow-sm">
        <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-4">{t('planning.uploadTitle')}</h2>
        
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 md:p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer group">
          <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-4 group-hover:bg-indigo-100 transition-colors">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="font-medium text-slate-900 mb-1">{t('planning.uploadHeader')}</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            {t('planning.uploadDesc')}
          </p>
          <button className="bg-white text-slate-700 border border-slate-300 font-medium py-2 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition-colors text-sm">
            {t('planning.uploadBtn')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            {t('planning.reqTitle')}
          </h2>
          <ul className="space-y-3">
            {[
              t('planning.req1'),
              t('planning.req2'),
              t('planning.req3'),
              t('planning.req4')
            ].map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('planning.thesisTitle')}</h2>
          <textarea 
            className="w-full h-32 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder={t('planning.thesisPlaceholder')}
            defaultValue={t('planning.thesisDefault')}
          />
          <div className="mt-3 flex justify-end">
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">{t('planning.refineBtn')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
