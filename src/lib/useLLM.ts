import { useState, useRef } from 'react';
import { getOptimalModel, MODEL_PRESETS } from './modelConfig';
import { db } from './db';
import { Wllama } from '@wllama/wllama';

export function useLLM() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number, total: number, text?: string } | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  
  const wllamaRef = useRef<Wllama | null>(null);

  const loadModel = async (modelUrl?: string) => {
    if (isLoading || isLoaded) return;
    setIsLoading(true);

    try {
      if (!modelUrl) {
        // Try reading from global settings first
        const globalSettings = await db.settings.get('global');
        if (globalSettings?.modelLimitConfig && typeof globalSettings.modelLimitConfig === 'string') {
           const presetKey = globalSettings.modelLimitConfig as keyof typeof MODEL_PRESETS;
           if (MODEL_PRESETS[presetKey]) {
             modelUrl = MODEL_PRESETS[presetKey].id;
           }
        }
        
        // Fallback to auto-detection
        if (!modelUrl) {
          const optimal = await getOptimalModel();
          modelUrl = optimal.id;
        }
      }

      // Initialize Wllama
      if (!wllamaRef.current) {
         wllamaRef.current = new Wllama({ 
             default: "https://cdn.jsdelivr.net/npm/@wllama/wllama@3.1.1/esm",
         });
      }

      const wllama = wllamaRef.current;
      
      setProgress({ loaded: 0, total: 100, text: "Initializing Wllama..." });
      
      await wllama.loadModelFromUrl(modelUrl, {
          n_ctx: 2048,
          n_gpu_layers: 999, // use fully GPU if possible
          progressCallback: ({ loaded, total }) => {
              setProgress({ loaded, total: total || 1, text: `Downloading model: ${Math.round(loaded/(total||1)*100)}%` });
          }
      });
      
      setActiveModel(modelUrl);
      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to load model:", err);
      if (modelUrl !== MODEL_PRESETS.low.id) {
          alert("Your device was unable to load this model. We will automatically try a smaller model.");
          await loadModel(MODEL_PRESETS.low.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generate = async (prompt: string, systemPrompt?: string): Promise<string> => {
    if (!wllamaRef.current || !isLoaded) throw new Error("Model not loaded");
    
    const messages: Array<{ role: "system" | "user", content: string }> = [];
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const reply = await wllamaRef.current.createChatCompletion({
      messages,
      temperature: 0.7,
      max_tokens: 512,
      stream: false
    });
    
    return reply.choices?.[0]?.message?.content || "";
  };
  
  const generateStream = async (prompt: string, systemPrompt?: string, onUpdate?: (text: string) => void): Promise<string> => {
    if (!wllamaRef.current || !isLoaded) throw new Error("Model not loaded");
    
    const messages: Array<{ role: "system" | "user", content: string }> = [];
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    let finalMessage = "";
    
    const completionData = await wllamaRef.current.createChatCompletion({
      messages,
      temperature: 0.7,
      max_tokens: 512,
      stream: true,
      onData: (chunk) => {
          const content = chunk.choices?.[0]?.delta?.content || "";
          finalMessage += content;
          if (onUpdate) {
              onUpdate(finalMessage);
          }
      }
    });
    
    // Wllama's createChatCompletion returns an async iterator if stream is true (or void depending on typings if onData is used)
    // Actually in 3.1.1, if onData is used, it still returns an AsyncIterable or similar, let's just make sure.
    // Assuming onData handles the callbacks and we just await completionData.
    if (completionData && typeof completionData[Symbol.asyncIterator] === 'function') {
        // We still need to await the completion iterator if we provided onData
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _chunk of completionData) {
            // Already handled by onData
        }
    }
    return finalMessage;
  };

  return {
    isLoaded,
    isLoading,
    progress,
    activeModel,
    loadModel,
    generate,
    generateStream
  };
}

