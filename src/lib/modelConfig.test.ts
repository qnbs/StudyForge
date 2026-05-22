import { describe, it, expect } from 'vitest';
import { resolveModelUrl, resolveModelPresetKey, MODEL_PRESETS } from './modelConfig';

describe('modelConfig', () => {
  it('resolveModelUrl maps legacy Phi-4-mini to medium preset', () => {
    expect(resolveModelUrl('Phi-4-mini')).toBe(MODEL_PRESETS.medium.id);
  });

  it('resolveModelUrl maps preset keys', () => {
    expect(resolveModelUrl('low')).toBe(MODEL_PRESETS.low.id);
    expect(resolveModelUrl('high')).toBe(MODEL_PRESETS.high.id);
  });

  it('resolveModelUrl passes through full GGUF URLs', () => {
    const url = 'https://example.com/model.gguf';
    expect(resolveModelUrl(url)).toBe(url);
  });

  it('resolveModelPresetKey normalizes legacy names', () => {
    expect(resolveModelPresetKey('Llama-3.2-8B')).toBe('high');
    expect(resolveModelPresetKey('medium')).toBe('medium');
  });
});
