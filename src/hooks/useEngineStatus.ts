import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { MODEL_PRESETS, resolveModelPresetKey } from '../lib/modelConfig';
import { useLLM } from '../contexts/LLMContext';

export interface EngineStatus {
  modelLabel: string;
  presetKey: string;
  webGpuActive: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  loadPercent: number;
  vramLabel: string;
}

export function useEngineStatus(): EngineStatus {
  const settings = useLiveQuery(() => db.settings.get('global'));
  const { isLoaded, isLoading, progress, activeModel } = useLLM();
  const [webGpuActive, setWebGpuActive] = useState(false);
  const [vramGb, setVramGb] = useState<number | null>(null);

  const presetKey = resolveModelPresetKey(settings?.modelLimitConfig ?? 'medium');
  const preset = MODEL_PRESETS[presetKey];

  useEffect(() => {
    let cancelled = false;
    async function probe() {
      if (!navigator.gpu) {
        if (!cancelled) {
          setWebGpuActive(false);
          setVramGb(null);
        }
        return;
      }
      try {
        const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (!adapter || cancelled) {
          if (!cancelled) setWebGpuActive(false);
          return;
        }
        const device = await adapter.requestDevice();
        const gb = (device.limits.maxBufferSize ?? 0) / 1024 ** 3;
        if (!cancelled) {
          setWebGpuActive(true);
          setVramGb(gb > 0 ? parseFloat(gb.toFixed(1)) : null);
        }
      } catch {
        if (!cancelled) setWebGpuActive(false);
      }
    }
    void probe();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.loaded / progress.total) * 100))
      : isLoaded
        ? 100
        : 0;

  const vramLabel =
    vramGb != null
      ? `VRAM limit ~${vramGb}GB • ${webGpuActive ? 'WebGPU' : 'WASM'}`
      : webGpuActive
        ? 'WebGPU Active'
        : 'CPU/WASM Fallback';

  return {
    modelLabel: activeModel ? preset.name : preset.name,
    presetKey,
    webGpuActive,
    isLoaded,
    isLoading,
    loadPercent,
    vramLabel,
  };
}
