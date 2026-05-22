import { useState, useRef, useEffect, useCallback } from 'react';
import { CreateWebWorkerMLCEngine, InitProgressReport, InitProgressCallback } from "@mlc-ai/web-llm";

export function useLLM() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<InitProgressReport | null>(null);
  
  // Use CreateWebWorkerMLCEngine which returns a Promise<WebWorkerMLCEngine>
  const engineRef = useRef<any>(null);

  const loadModel = async (modelId: string = "Llama-3.2-1B-Instruct-q4f16_1-MLC", customProgressCb?: InitProgressCallback) => {
    if (isLoading || isLoaded) return;
    setIsLoading(true);

    try {
      const worker = new Worker(
        new URL('./llmWorker.ts', import.meta.url), 
        { type: "module" }
      );
      
      const initializeProgressCallback = (report: InitProgressReport) => {
        setProgress(report);
        if (customProgressCb) {
             customProgressCb(report);
        }
      };

      const engine = await CreateWebWorkerMLCEngine(
        worker,
        modelId,
        { initProgressCallback: initializeProgressCallback }
      );
      
      engineRef.current = engine;
      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to load model:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generate = async (prompt: string, systemPrompt?: string): Promise<string> => {
    if (!engineRef.current) throw new Error("Model not loaded");
    
    const messages = [];
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const reply = await engineRef.current.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 512,
    });
    
    return reply.choices[0].message.content as string;
  };
  
  const generateStream = async (prompt: string, systemPrompt?: string, onUpdate?: (text: string) => void): Promise<string> => {
    if (!engineRef.current) throw new Error("Model not loaded");
    
    const messages = [];
    if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    let finalMessage = "";
    
    const completion = await engineRef.current.chat.completions.create({
      messages,
      temperature: 0.7,
      stream: true
    });
    
    for await (const chunk of completion) {
        finalMessage += chunk.choices[0]?.delta?.content || "";
        if (onUpdate) {
            onUpdate(finalMessage);
        }
    }
    return finalMessage;
  };

  return {
    isLoaded,
    isLoading,
    progress,
    loadModel,
    generate,
    generateStream
  };
}
