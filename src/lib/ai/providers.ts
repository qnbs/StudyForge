interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiProvider {
  id: string;
  name: string;
  isLocal: boolean;
  generate(messages: ChatMessage[], options?: unknown): Promise<string>;
  generateStream?(messages: ChatMessage[], onUpdate: (text: string) => void, options?: unknown): Promise<string>;
}

// NOTE: Specific cloud providers like Gemini or OpenAI will be implemented here
// They will accept an API key returned by decryptApiKey.
