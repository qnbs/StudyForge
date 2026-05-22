import Dexie, { type Table } from 'dexie';
import type { Document, Source, Agent, Settings, DocumentChunk } from '../types';
import type { EncryptedApiKey } from './crypto';

export class StudyForgeDatabase extends Dexie {
  documents!: Table<Document, string>;
  sources!: Table<Source, string>;
  agents!: Table<Agent, string>;
  settings!: Table<Settings, string>;
  documentChunks!: Table<DocumentChunk, string>;
  secureConfig!: Table<EncryptedApiKey, string>;

  constructor() {
    super('StudyForgeDB');
    this.version(3).stores({
      documents: 'id, title, lastEdited', 
      sources: 'id, title, year, type',
      agents: 'id, name, role',
      settings: 'id',
      documentChunks: 'id, sourceId',
      secureConfig: 'provider'
    });
  }
}

export const db = new StudyForgeDatabase();

// Initialize default settings and agents if they don't exist
export async function initializeDatabase() {
  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'global',
      language: 'en',
      theme: 'system',
      modelLimitConfig: 'default'
    });
  }

  const agentsCount = await db.agents.count();
  if (agentsCount === 0) {
    const defaultAgents: Agent[] = [
      {
        id: '1',
        name: 'The Academic Reviewer',
        role: 'Peer Review',
        description: 'Critiques structure, methodology, and tone with academic rigor.',
        prompt: 'You are a rigorous peer reviewer specializing in academic literature. Break down my argument and point out logical fallacies or structural weaknesses. Hold the text to the highest standard of academic publishing.',
        model: 'Llama-3.2-8B',
        isCustom: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'The Synthesizer',
        role: 'Literature Review',
        description: 'Combines multiple sources into a cohesive narrative.',
        prompt: 'You are a research assistant tasked with writing a literature review. Given my notes and excerpts, weave them into a single, cohesive narrative that highlights the core themes, contradictions, and gaps in the research.',
        model: 'Llama-3.2-8B',
        isCustom: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Jargon Translator',
        role: 'Accessibility',
        description: 'Simplifies complex terminology without losing meaning.',
        prompt: 'You are an expert communicator specializing in science communication. Take this highly technical, jargon-dense text and rewrite it so an undergraduate student could clearly understand the core concepts without losing academic integrity.',
        model: 'Phi-4-mini',
        isCustom: false,
        createdAt: new Date().toISOString(),
      }
    ];
    await db.agents.bulkAdd(defaultAgents);
  }
}
