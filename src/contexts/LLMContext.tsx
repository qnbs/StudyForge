import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { getOptimalModel, MODEL_PRESETS, resolveModelUrl } from '../lib/modelConfig';
import { db } from '../lib/db';
import { Wllama } from '@wllama/wllama';

export interface LLMProgress {
  loaded: number;
  total: number;
  text?: string;
}

interface LLMContextState {
  isLoaded: boolean;
  isLoading: boolean;
  progress: LLMProgress | null;
  activeModel: string | null;
  loadModel: (modelRef?: string) => Promise<void>;
  ensureModelForRef: (modelRef: string) => Promise<void>;
  unloadModel: () => Promise<void>;
  generate: (prompt: string, systemPrompt?: string) => Promise<string>;
  generateStream: (
    prompt: string,
    systemPrompt?: string,
    onUpdate?: (text: string) => void
  ) => Promise<string>;
}

const LLMContext = createContext<LLMContextState | undefined>(undefined);

const WLLAMA_CDN = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.1.1/esm';

function gpuLayerCount(): number {
  return typeof navigator !== 'undefined' && navigator.gpu ? 99 : 0;
}

export function LLMProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<LLMProgress | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);

  const wllamaRef = useRef<Wllama | null>(null);
  const loadInFlightRef = useRef<Promise<void> | null>(null);

  const unloadModel = useCallback(async () => {
    const wllama = wllamaRef.current;
    if (wllama) {
      try {
        const inst = wllama as Wllama & { exit?: () => Promise<void> };
        if (typeof inst.exit === 'function') {
          await inst.exit();
        }
      } catch (e) {
        console.warn('Wllama unload:', e);
      }
      wllamaRef.current = null;
    }
    setIsLoaded(false);
    setActiveModel(null);
    setProgress(null);
  }, []);

  const resolveTargetUrl = useCallback(async (modelRef?: string): Promise<string> => {
    if (modelRef?.trim()) {
      return resolveModelUrl(modelRef);
    }
    const globalSettings = await db.settings.get('global');
    const cfg = globalSettings?.modelLimitConfig;
    if (cfg?.trim()) {
      return resolveModelUrl(cfg);
    }
    const optimal = await getOptimalModel();
    return optimal.id;
  }, []);

  const loadModel = useCallback(
    async (modelRef?: string) => {
      const targetUrl = await resolveTargetUrl(modelRef);

      if (isLoaded && activeModel === targetUrl) return;

      if (loadInFlightRef.current) {
        await loadInFlightRef.current;
        if (activeModel === targetUrl) return;
      }

      if (isLoaded && activeModel !== targetUrl) {
        await unloadModel();
      }

      const run = async () => {
        setIsLoading(true);

        try {

          if (!wllamaRef.current) {
            if (!navigator.gpu) {
              console.warn('WebGPU not detected — using CPU (WASM).');
            }
            wllamaRef.current = new Wllama({ default: WLLAMA_CDN });
          }

          setProgress({ loaded: 0, total: 100, text: 'Initializing Wllama...' });

          await wllamaRef.current.loadModelFromUrl(targetUrl, {
            n_ctx: 2048,
            n_gpu_layers: gpuLayerCount(),
            progressCallback: ({ loaded, total }) => {
              setProgress({
                loaded,
                total: total || 1,
                text: `Downloading model: ${Math.round((loaded / (total || 1)) * 100)}%`,
              });
            },
          });

          setActiveModel(targetUrl);
          setIsLoaded(true);
        } catch (err) {
          console.error('Failed to load model:', err);
          await unloadModel();
          loadInFlightRef.current = null;

          if (targetUrl !== MODEL_PRESETS.low.id) {
            setIsLoading(true);
            loadInFlightRef.current = (async () => {
              try {
                if (!wllamaRef.current) {
                  wllamaRef.current = new Wllama({ default: WLLAMA_CDN });
                }
                await wllamaRef.current.loadModelFromUrl(MODEL_PRESETS.low.id, {
                  n_ctx: 2048,
                  n_gpu_layers: gpuLayerCount(),
                });
                setActiveModel(MODEL_PRESETS.low.id);
                setIsLoaded(true);
              } finally {
                setIsLoading(false);
                loadInFlightRef.current = null;
              }
            })();
            await loadInFlightRef.current;
          } else {
            throw err;
          }
          return;
        } finally {
          setIsLoading(false);
          loadInFlightRef.current = null;
        }
      };

      loadInFlightRef.current = run();
      await loadInFlightRef.current;
    },
    [isLoaded, activeModel, unloadModel, resolveTargetUrl]
  );

  const ensureModelForRef = useCallback(
    async (modelRef: string) => {
      const targetUrl = resolveModelUrl(modelRef);
      if (isLoaded && activeModel === targetUrl) return;
      await loadModel(modelRef);
    },
    [isLoaded, activeModel, loadModel]
  );

  const generate = useCallback(
    async (prompt: string, systemPrompt?: string): Promise<string> => {
      if (!wllamaRef.current || !isLoaded) throw new Error('Model not loaded');

      const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      const reply = await wllamaRef.current.createChatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 512,
        stream: false,
      });

      return reply.choices?.[0]?.message?.content || '';
    },
    [isLoaded]
  );

  const generateStream = useCallback(
    async (
      prompt: string,
      systemPrompt?: string,
      onUpdate?: (text: string) => void
    ): Promise<string> => {
      if (!wllamaRef.current || !isLoaded) throw new Error('Model not loaded');

      const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
      if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
      messages.push({ role: 'user', content: prompt });

      let finalMessage = '';

      const completionData = await wllamaRef.current.createChatCompletion({
        messages,
        temperature: 0.7,
        max_tokens: 512,
        stream: true,
        onData: (chunk) => {
          const content = chunk.choices?.[0]?.delta?.content || '';
          finalMessage += content;
          onUpdate?.(finalMessage);
        },
      });

      if (completionData && typeof completionData[Symbol.asyncIterator] === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _ of completionData) {
          /* stream consumed via onData */
        }
      }
      return finalMessage;
    },
    [isLoaded]
  );

  return (
    <LLMContext.Provider
      value={{
        isLoaded,
        isLoading,
        progress,
        activeModel,
        loadModel,
        ensureModelForRef,
        unloadModel,
        generate,
        generateStream,
      }}
    >
      {children}
    </LLMContext.Provider>
  );
}

export function useLLM() {
  const ctx = useContext(LLMContext);
  if (!ctx) {
    throw new Error('useLLM must be used within LLMProvider');
  }
  return ctx;
}
