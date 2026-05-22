export interface ModelPreset {
  id: string;
  name: string;
  sizeGB: number;
}

export const MODEL_PRESETS = {
  low: {
    id: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    name: 'Llama 3.2 1B (Q4_K_M)',
    sizeGB: 0.8,
  },
  medium: {
    id: 'https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf',
    name: 'Phi 3.5 Mini (Q4_K_M)',
    sizeGB: 2.3,
  },
  high: {
    id: 'https://huggingface.co/bartowski/Llama-3.1-8B-Instruct-GGUF/resolve/main/Llama-3.1-8B-Instruct-Q4_K_M.gguf',
    name: 'Llama 3.1 8B (Q4_K_M)',
    sizeGB: 4.9,
  },
} as const;

export type ModelPresetKey = keyof typeof MODEL_PRESETS;

export const AGENT_MODEL_OPTIONS: Array<{ key: ModelPresetKey; label: string }> = [
  { key: 'low', label: MODEL_PRESETS.low.name },
  { key: 'medium', label: MODEL_PRESETS.medium.name },
  { key: 'high', label: MODEL_PRESETS.high.name },
];

/** Legacy display names and settings values → preset key. */
const LEGACY_PRESET_ALIASES: Record<string, ModelPresetKey> = {
  default: 'medium',
  'phi-4-mini': 'medium',
  'phi 4 mini': 'medium',
  'phi-3.5-mini': 'medium',
  'phi 3.5 mini': 'medium',
  'llama-3.2-1b': 'low',
  'llama 3.2 1b': 'low',
  'llama-3.2-8b': 'high',
  'llama 3.2 8b': 'high',
  'llama-3.1-8b': 'high',
};

export function resolveModelPresetKey(model: string): ModelPresetKey {
  const normalized = model.trim().toLowerCase();
  if (normalized in MODEL_PRESETS) {
    return normalized as ModelPresetKey;
  }
  if (LEGACY_PRESET_ALIASES[normalized]) {
    return LEGACY_PRESET_ALIASES[normalized];
  }
  if (normalized.includes('1b') || normalized.includes('low')) return 'low';
  if (normalized.includes('8b') || normalized.includes('high')) return 'high';
  return 'medium';
}

/** Maps agent.model or settings preset to a Wllama GGUF URL. */
export function resolveModelUrl(model: string): string {
  const trimmed = model.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const key = resolveModelPresetKey(trimmed);
  return MODEL_PRESETS[key].id;
}

export async function getOptimalModel(): Promise<ModelPreset> {
  if (!navigator.gpu) {
    return MODEL_PRESETS.low;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
    if (!adapter) return MODEL_PRESETS.low;

    const device = await adapter.requestDevice();
    try {
      const memoryGB = (device.limits.maxBufferSize ?? 0) / (1024 ** 3);
      if (memoryGB < 2) return MODEL_PRESETS.low;
      if (memoryGB < 4) return MODEL_PRESETS.medium;
      return MODEL_PRESETS.high;
    } finally {
      device.destroy();
    }
  } catch (error) {
    console.error('Failed to detect WebGPU device memory:', error);
    return MODEL_PRESETS.low;
  }
}
