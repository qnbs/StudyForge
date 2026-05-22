import Dexie, { type Table } from 'dexie';
import type {
  Document,
  Source,
  Agent,
  Settings,
  DocumentChunk,
  ZoteroItem,
  ZoteroCollection,
  ZoteroSyncMeta,
} from '../types';
import type { EncryptedApiKey } from './crypto';
import { resolveModelPresetKey } from './modelConfig';

export class StudyForgeDatabase extends Dexie {
  documents!: Table<Document, string>;
  sources!: Table<Source, string>;
  agents!: Table<Agent, string>;
  settings!: Table<Settings, string>;
  documentChunks!: Table<DocumentChunk, string>;
  secureConfig!: Table<EncryptedApiKey, string>;
  zoteroItems!: Table<ZoteroItem, string>;
  zoteroCollections!: Table<ZoteroCollection, string>;
  zoteroSyncMeta!: Table<ZoteroSyncMeta, number>;

  constructor() {
    super('StudyForgeDB');
    this.version(4).stores({
      documents: 'id, title, lastEdited', 
      sources: 'id, title, year, type',
      agents: 'id, name, role',
      settings: 'id',
      documentChunks: 'id, sourceId, documentId, embeddingId',
      secureConfig: 'provider'
    });

    this.version(5)
      .stores({
        documents: 'id, title, lastEdited',
        sources: 'id, title, year, type',
        agents: 'id, name, role',
        settings: 'id',
        documentChunks: 'id, sourceId, documentId, embeddingId',
        secureConfig: 'provider',
      })
      .upgrade(async (tx) => {
        const settings = await tx.table('settings').toArray();
        for (const row of settings) {
          const cfg = row.modelLimitConfig;
          if (cfg === 'default' || !['low', 'medium', 'high'].includes(cfg)) {
            const preset = resolveModelPresetKey(cfg);
            await tx.table('settings').update(row.id, { modelLimitConfig: preset });
          }
        }

        const agents = await tx.table('agents').toArray();
        for (const agent of agents) {
          if (!['low', 'medium', 'high'].includes(agent.model)) {
            const preset = resolveModelPresetKey(agent.model);
            await tx.table('agents').update(agent.id, { model: preset });
          }
        }
      });

    this.version(6).stores({
      documents: 'id, title, lastEdited',
      sources: 'id, title, year, type',
      agents: 'id, name, role',
      settings: 'id',
      documentChunks: 'id, sourceId, documentId, embeddingId',
      secureConfig: 'provider',
      zoteroItems: '&key, title, doi, dateModified, *collectionKeys',
      zoteroCollections: '&key, name, parentKey, dateModified',
      zoteroSyncMeta: '++id, lastSyncTimestamp',
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
      modelLimitConfig: 'medium'
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
        model: 'high',
        isCustom: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'The Synthesizer',
        role: 'Literature Review',
        description: 'Combines multiple sources into a cohesive narrative.',
        prompt: 'You are a research assistant tasked with writing a literature review. Given my notes and excerpts, weave them into a single, cohesive narrative that highlights the core themes, contradictions, and gaps in the research.',
        model: 'high',
        isCustom: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Jargon Translator',
        role: 'Accessibility',
        description: 'Simplifies complex terminology without losing meaning.',
        prompt: 'You are an expert communicator specializing in science communication. Take this highly technical, jargon-dense text and rewrite it so an undergraduate student could clearly understand the core concepts without losing academic integrity.',
        model: 'medium',
        isCustom: false,
        createdAt: new Date().toISOString(),
      }
    ];
    await db.agents.bulkAdd(defaultAgents);
  }

  const syncMetaCount = await db.zoteroSyncMeta.count();
  if (syncMetaCount === 0) {
    await db.zoteroSyncMeta.add({
      lastSyncTimestamp: new Date(0).toISOString(),
      libraryVersion: 0,
      totalItemsSynced: 0,
      lastSyncSuccessful: false,
    });
  }
}
