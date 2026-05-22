export interface ModelPreset {
  id: string;
  name: string;
  sizeGB: number;
}

export const MODEL_PRESETS = {
  low: { id: "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf", name: "Llama 3.2 1B (Q4_K_M)", sizeGB: 0.8 },
  medium: { id: "https://huggingface.co/bartowski/Phi-3.5-mini-instruct-GGUF/resolve/main/Phi-3.5-mini-instruct-Q4_K_M.gguf", name: "Phi 3.5 Mini (Q4_K_M)", sizeGB: 2.3 },
  high: { id: "https://huggingface.co/bartowski/Llama-3.1-8B-Instruct-GGUF/resolve/main/Llama-3.1-8B-Instruct-Q4_K_M.gguf", name: "Llama 3.1 8B (Q4_K_M)", sizeGB: 4.9 },
} as const;

export async function getOptimalModel() {
  if (!navigator.gpu) {
    return MODEL_PRESETS.low;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) return MODEL_PRESETS.low;
    
    const device = await adapter.requestDevice();
    const memoryGB = (device.limits.maxBufferSize ?? 0) / (1024 ** 3);

    // This is a naive heuristic based on maxBufferSize. 
    // Usually maxBufferSize is a fraction of total memory, but it's indicative.
    // We can also use adapter.limits if necessary. 
    // The typical maxBufferSize is around 2-4GB on 8GB machines.
    if (memoryGB < 2) return MODEL_PRESETS.low;
    if (memoryGB < 4) return MODEL_PRESETS.medium;
    return MODEL_PRESETS.high;
  } catch (error) {
    console.error("Failed to detect WebGPU device memory:", error);
    return MODEL_PRESETS.low;
  }
}
