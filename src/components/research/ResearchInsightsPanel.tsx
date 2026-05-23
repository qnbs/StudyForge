import { useState } from 'react';
import { Sparkles, Target } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { summarizeSourceFromChunks, rankSourcesByRelevance } from '../../lib/reference/aiInsights';
import { useLLM } from '../../contexts/LLMContext';
import type { Source } from '../../types';

interface ResearchInsightsPanelProps {
  selectedSource: Source | null;
  manuscriptExcerpt?: string;
}

export function ResearchInsightsPanel({
  selectedSource,
  manuscriptExcerpt = '',
}: ResearchInsightsPanelProps) {
  const { t } = useLanguage();
  const { generate, isLoaded, loadModel } = useLLM();
  const [summary, setSummary] = useState<string | null>(null);
  const [relevance, setRelevance] = useState<Array<{ sourceId: string; score: number; title: string }>>(
    []
  );
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!selectedSource) return;
    setLoading(true);
    try {
      const chunks = await summarizeSourceFromChunks(selectedSource.id);
      if (!isLoaded) await loadModel();
      const llmSummary = await generate(
        `Summarize this academic paper in 3-5 bullet points:\n\n${chunks}`,
        'You are an academic research assistant.'
      );
      setSummary(llmSummary);
    } catch {
      setSummary(t('research.summarizeFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRelevance = async () => {
    if (!manuscriptExcerpt.trim()) return;
    setLoading(true);
    try {
      const ranked = await rankSourcesByRelevance(manuscriptExcerpt, 5);
      setRelevance(ranked);
    } catch {
      setRelevance([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-slate-200 pt-4 space-y-3">
      <h4 className="text-xs font-semibold uppercase text-slate-500">{t('research.insights')}</h4>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!selectedSource || loading}
          onClick={() => void handleSummarize()}
          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-lg disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3" />
          {t('research.summarize')}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleRelevance()}
          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 text-slate-800 rounded-lg disabled:opacity-50"
        >
          <Target className="w-3 h-3" />
          {t('research.relevance')}
        </button>
      </div>
      {summary && (
        <div className="text-sm text-slate-700 bg-white border rounded-lg p-3 whitespace-pre-wrap">
          {summary}
        </div>
      )}
      {relevance.length > 0 && (
        <ul className="text-xs space-y-1">
          {relevance.map((r) => (
            <li key={r.sourceId} className="flex justify-between gap-2">
              <span className="truncate">{r.title}</span>
              <span className="text-slate-400 shrink-0">{(r.score * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
